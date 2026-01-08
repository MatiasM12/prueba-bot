const config = require('../config.json');
const { Client, GatewayIntentBits, Events, Collection } = require('discord.js');
const cron = require('node-cron');
const fs = require('fs');
const path = require('path');
const express = require("express");
const app = express();

const DATA_PATH = path.join(__dirname, 'data', 'diario.json');
const KEEP_ALIVE_URL = 'https://missing-shanta-maty-a48c36d3.koyeb.app/';

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

let ultimoMensajeTimestamp = null;
let alertaEnviadaHoy = false;

// ================== UTILS ==================
function cargarLista() {
  if (!fs.existsSync(DATA_PATH)) {
    return { miembros: [] };
  }
  return JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'));
}

function guardarLista(data) {
  fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2));
}

// ================== SLASH COMMANDS ==================
client.commands = new Collection();

const commandsPath = path.join(__dirname, 'slashCommands');
const commandFiles = fs.readdirSync(commandsPath).filter(f => f.endsWith('.js'));

for (const file of commandFiles) {
  const command = require(path.join(commandsPath, file));
  client.commands.set(command.data.name, command);
}

app.get("/", (req, res) => {
  res.send("Bot funcionando");
});

app.listen(8000, () => {
  console.log("Bot encendido 24/7");
});

// ================== READY ==================
client.once(Events.ClientReady, async c => {
  console.log(`🤖 Bot conectado como ${c.user.tag}`);

  cron.schedule(
    '40 9 * * *',
    async () => {
      try {
        const guild = client.guilds.cache.first();
        if (!guild) return;

        await guild.members.fetch({ withPresences: true });

        const channel = guild.channels.cache.find(
          ch =>
            ch.name === 'general' &&
            ch.isTextBased() &&
            ch.parent &&
            ch.parent.name === 'Nicky Nicode'
        );
        if (!channel) return;

        const data = cargarLista();

        const index = data.miembros.findIndex(m => m.activo);
        if (index === -1) {
          await channel.send('⚠️ No hay miembros activos para el diario.');
          return;
        }

        const responsable = data.miembros[index];

        // 👉 calcular siguiente ANTES de mover
        const siguiente = data.miembros
          .slice(index + 1)
          .find(m => m.activo);

        // mover al final
        data.miembros.splice(index, 1);
        data.miembros.push(responsable);
        guardarLista(data);

        let mensaje =
          `📢 **Diario de mañana**\n` +
          `👤 Le toca a: <@${responsable.id}> 😎\n`;

        if (siguiente) {
          mensaje += `⏭️ Si se duerme, sigue: <@${siguiente.id}> ☕`;
        } else {
          mensaje += `⏭️ No hay otro miembro activo como backup`;
        }

        await channel.send(mensaje);

      } catch (err) {
        console.error('❌ Error en cron:', err);
      }
    },
    { timezone: 'America/Argentina/Buenos_Aires' }
  );


  cron.schedule(
    '20 9 * * *', // 09:20 AM
    async () => {
      try {
        if (alertaEnviadaHoy) return;

        const inicio = new Date();
        inicio.setHours(7, 0, 0, 0);

        if (!ultimoMensajeTimestamp || ultimoMensajeTimestamp < inicio.getTime()) {
          const guild = client.guilds.cache.first();
          if (!guild) return;

          const channel = guild.channels.cache.find(
            ch =>
              ch.name === 'general' &&
              ch.isTextBased() &&
              ch.parent &&
              ch.parent.name === 'Nicky Nicode'
          );
          if (!channel) return;

          alertaEnviadaHoy = true;

          await channel.send(
            `⚠️ **Alerta diaria**\n` +
            `No hubo mensajes entre **07:00 y 09:20**.\n` +
            `Es posible que el responsable del diario se haya quedado dormido 😴`
          );
        }

      } catch (err) {
        console.error('❌ Error alerta mañana:', err);
      }
    },
    { timezone: 'America/Argentina/Buenos_Aires' }
  );

  cron.schedule(
    '0 0 * * *',
    () => {
      alertaEnviadaHoy = false;
      ultimoMensajeTimestamp = null;
      console.log('🔄 Reset diario de alerta');
    },
    { timezone: 'America/Argentina/Buenos_Aires' }
  );
});


// ================== INTERACTIONS ==================
client.on(Events.MessageCreate, message => {
  if (message.author.bot) return;
  if (!message.guild) return;
  if (message.channel.name !== 'general') return;
  if (!message.channel.parent) return;
  if (message.channel.parent.name !== 'Nicky Nicode') return;

  ultimoMensajeTimestamp = Date.now();
});

client.on(Events.InteractionCreate, async interaction => {
  if (!interaction.isChatInputCommand()) return;

  const command = client.commands.get(interaction.commandName);
  if (!command) return;

  try {
    await command.execute(interaction, { cargarLista, guardarLista });
  } catch (err) {
    console.error(err);
    await interaction.reply({
      content: '❌ Error ejecutando el comando',
      ephemeral: true
    });
  }
});

client.login(config.token); 

cron.schedule('*/5 * * * *', async () => {
  try {
    const res = await fetch(KEEP_ALIVE_URL);
    console.log(`🔁 Ping a Koyeb OK - status ${res.status}`);
  } catch (error) {
    console.error('❌ Error haciendo ping:', error.message);
  }
});

