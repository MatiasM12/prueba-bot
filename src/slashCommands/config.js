const { SlashCommandBuilder, ChannelType } = require('discord.js');
const { setConfigGuild } = require('../utils/config-guilds');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('config')
    .setDescription('Configura el diario')
    .addSubcommand(sub =>
      sub
        .setName('canal')
        .setDescription('Canal donde se envía el diario')
        .addChannelOption(opt =>
          opt
            .setName('canal')
            .setDescription('Canal de texto')
            .setRequired(true)
            .addChannelTypes(ChannelType.GuildText)
        )
    )
    .addSubcommand(sub =>
      sub
        .setName('hora-diario')
        .setDescription('Hora del diario (HH:mm)')
        .addStringOption(opt =>
          opt
            .setName('hora')
            .setDescription('Ej: 09:33')
            .setRequired(true)
        )
    )
    .addSubcommand(sub =>
      sub
        .setName('hora-alerta')
        .setDescription('Hora de la alerta (HH:mm)')
        .addStringOption(opt =>
          opt
            .setName('hora')
            .setDescription('Ej: 09:34')
            .setRequired(true)
        )
    ),

  async execute(interaction) {
    const guildId = interaction.guildId;
    const sub = interaction.options.getSubcommand();

    // ================= CANAL =================
    if (sub === 'canal') {
      const canal = interaction.options.getChannel('canal');

      setConfigGuild(guildId, { canalId: canal.id });

      return interaction.reply(
        `✅ Canal configurado: ${canal}`
      );
    }

    // ================= HORAS =================
    if (sub === 'hora-diario' || sub === 'hora-alerta') {
      const hora = interaction.options.getString('hora');

      if (!/^\d{2}:\d{2}$/.test(hora)) {
        return interaction.reply({
          content: '❌ Formato inválido. Usá HH:mm (ej: 09:30)',
          ephemeral: true
        });
      }

      if (sub === 'hora-diario') {
        setConfigGuild(guildId, { horaDiario: hora });
        return interaction.reply(`⏰ Hora del diario configurada: **${hora}**`);
      }

      if (sub === 'hora-alerta') {
        setConfigGuild(guildId, { horaAlerta: hora });
        return interaction.reply(`⏰ Hora de alerta configurada: **${hora}**`);
      }
    }
  }
};
