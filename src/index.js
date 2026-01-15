const config = require('../config.json');
const { Client, GatewayIntentBits, Events, Collection } = require('discord.js');
const cron = require('node-cron');
const fs = require('fs');
const path = require('path');
const express = require("express");

const {
  cargarListaMiembros,
  guardarListaMiembros,
  esDiaHabilFecha,
  obtenerProximoDiaHabil
} = require('../src/utils/datos.js');

const { obtenerConfigGuild } = require('../src/utils/config-guilds.js');

const app = express();
const KEEP_ALIVE_URL = 'https://missing-shanta-maty-a48c36d3.koyeb.app/';

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

let ultimoMensajeTimestamp = null;
let alertaEnviadaHoy = false;

// ================= SLASH COMMANDS =================
client.commands = new Collection();
const commandsPath = path.join(__dirname, '../src/slashCommands');
const commandFiles = fs.readdirSync(commandsPath).filter(f => f.endsWith('.js'));

for (const file of commandFiles) {
  const command = require(path.join(commandsPath, file));
  client.commands.set(command.data.name, command);
}

// ================= WEB =================
app.get("/", (req, res) => res.send("Bot funcionando"));
app.listen(8000, () => console.log("Bot encendido 24/7"));

// ================= READY =================
client.once(Events.ClientReady, () => {
  console.log(`🤖 Bot conectado como ${client.user.tag}`);
});

// ================= CRON PRINCIPAL =================
// Corre cada minuto y compara con config del guild
cron.schedule('* * * * *', async () => {
  const ahora = new Date().toLocaleTimeString('es-AR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'America/Argentina/Buenos_Aires'
  });

  for (const guild of client.guilds.cache.values()) {
    const cfg = obtenerConfigGuild(guild.id);
    if (!cfg?.canalId) continue;

    const channel = guild.channels.cache.get(cfg.canalId);
    if (!channel?.isTextBased()) continue;

    if (ahora === cfg.horaDiario) {
      await enviarDiario(guild, channel);
    }

    if (ahora === cfg.horaAlerta) {
      await enviarAlerta(guild, channel);
    }
  }
}, { timezone: 'America/Argentina/Buenos_Aires' });

// ================= FUNCIONES =================
async function enviarDiario(guild, channel) {
  try {
    if (!esDiaHabilFecha(new Date())) return;
    const proximoDiaHabil = obtenerProximoDiaHabil(new Date());

    await guild.members.fetch();

    const data = cargarListaMiembros();
    const index = data.miembros.findIndex(m => m.activo);

    if (index === -1) {
      await channel.send('⚠️ No hay miembros activos para el diario.');
      return;
    }

    const responsable = data.miembros[index];
    const siguiente = data.miembros.slice(index + 1).find(m => m.activo);

    // rotación
    data.miembros.splice(index, 1);
    data.miembros.push(responsable);
    guardarListaMiembros(data);

    const fechaTexto = proximoDiaHabil.toLocaleDateString('es-AR', {
      weekday: 'long',
      day: '2-digit',
      month: '2-digit'
    });

    let mensaje =
      `📢 **Diario del ${fechaTexto}**\n` +
      `👤 Le toca a: <@${responsable.id}> 😎\n`;

    if (siguiente) {
      mensaje += `⏭️ Si no lo puede dar le toca: <@${siguiente.id}> ☕`;
    }

    await channel.send(mensaje);

  } catch (err) {
    console.error('Error enviando diario:', err);
  }
}

async function enviarAlerta(guild, channel) {
  try {
    if (!esDiaHabilFecha(new Date())) return;
    if (alertaEnviadaHoy) return;

    const inicio = new Date();
    inicio.setHours(7, 0, 0, 0);

    if (!ultimoMensajeTimestamp || ultimoMensajeTimestamp < inicio.getTime()) {
      alertaEnviadaHoy = true;

      await channel.send(
        `⚠️ **Alerta diaria**\n` +
        `No hubo mensajes entre **07:00 y ahora**.\n` +
        `Puede ser que el responsable del diario se haya dormido 😴`
      );
    }
  } catch (err) {
    console.error('Error enviando alerta:', err);
  }
}

// ================= RESET DIARIO =================
cron.schedule('0 0 * * *', () => {
  alertaEnviadaHoy = false;
  ultimoMensajeTimestamp = null;
  console.log('Reset diario');
}, { timezone: 'America/Argentina/Buenos_Aires' });

// ================= EVENTOS =================
client.on(Events.MessageCreate, message => {
  if (message.author.bot) return;
  if (!message.guild) return;

  const cfg = obtenerConfigGuild(message.guild.id);
  if (!cfg?.canalId) return;
  if (message.channel.id !== cfg.canalId) return;

  ultimoMensajeTimestamp = Date.now();
});

client.on(Events.InteractionCreate, async interaction => {
  if (!interaction.isChatInputCommand()) return;

  const command = client.commands.get(interaction.commandName);
  if (!command) return;

  try {
    await command.execute(interaction, {
      cargarListaMiembros,
      guardarListaMiembros
    });
  } catch (err) {
    console.error(err);
    await interaction.reply({
      content: 'Error ejecutando el comando',
      ephemeral: true
    });
  }
});

// ================= LOGIN =================
client.login(config.token);

// ================= KEEP ALIVE =================
cron.schedule('*/5 * * * *', async () => {
  try {
    await fetch(KEEP_ALIVE_URL);
  } catch {}
});
