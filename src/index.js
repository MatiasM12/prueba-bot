const config = require('../config.json');
const { Client, GatewayIntentBits, Events, Collection } = require('discord.js');
const cron = require('node-cron');
const fs = require('fs');
const path = require('path');
const { cargarListaMiembros, guardarListaMiembros, esDiaHabilFecha, obtenerFeriadoFecha } = require('./utils/datos');
const express = require("express");
const app = express();

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

// Slash Commands
client.commands = new Collection();

const commandsPath = path.join(__dirname, 'slashCommands');
const commandFiles = fs.readdirSync(commandsPath).filter(f => f.endsWith('.js'));

for (const file of commandFiles) {
  const command = require(path.join(commandsPath, file));
  client.commands.set(command.data.name, command);
}

// Endpoint para subir como webapp
app.get("/", (req, res) => {
  res.send("Bot funcionando");
});

app.listen(8000, () => {
  console.log("Bot encendido 24/7");
});

// Ready
client.once(Events.ClientReady, async c => {
  console.log(`🤖 Bot conectado como ${c.user.tag}`);

  cron.schedule(
    '33 19 * * *',
    async () => {
      try {
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
        const diaSiguiente = new Date();
        diaSiguiente.setDate(diaSiguiente.getDate() + 1);

        if (!esDiaHabilFecha(diaSiguiente)) {
          const feriado = obtenerFeriadoFecha(diaSiguiente);

          let motivo = 'fin de semana';
          if (feriado) {
            motivo = `feriado (${feriado.localName})`;
          }

          await channel.send(
            `📅 **Diario de mañana**\n` +
            `Mañana es ${motivo}, por lo tanto **no habrá diario** 🎉`
          );

          console.log('📅 Mañana no es día hábil, no se asigna diario');
          return;
        }

        await guild.members.fetch({ withPresences: true });

        const data = cargarListaMiembros();

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
        guardarListaMiembros(data);

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
    '34 19 * * *', // 09:20 AM
    async () => {
      try {
        if (!esDiaHabilFecha(new Date())) {
          console.log('📅 Hoy no es día hábil, no se envía diario');
          return;
        }
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


// Interacciones
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
    await command.execute(interaction, { cargarListaMiembros, guardarListaMiembros });
  } catch (err) {
    console.error(err);
    await interaction.reply({
      content: '❌ Error ejecutando el comando',
      ephemeral: true
    });
  }
});

client.login(config.token); 

// Envia un ping al endpoint para que la instancia no se duerma por inactivdad
cron.schedule('*/5 * * * *', async () => {
  try {
    const res = await fetch(KEEP_ALIVE_URL);
    console.log(`🔁 Ping a Koyeb OK - status ${res.status}`);
  } catch (error) {
    console.error('❌ Error haciendo ping:', error.message);
  }
});

