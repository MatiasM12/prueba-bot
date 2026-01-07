const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName('info')
    .setDescription('Muestra la hora actual y los participantes'),

  async execute(interaction) {
    await interaction.deferReply();

    try {
      const ahora = new Date().toLocaleString('es-AR', {
        timeZone: 'America/Argentina/Buenos_Aires'
      });

      const guild = interaction.guild;
      const canal = interaction.channel;

      const totalMiembros = guild.memberCount;

      const participantes = canal?.members
        ? canal.members.map(m => m.user.username).join(', ')
        : 'No disponible';

      const respuesta =
        `🕒 **Hora actual:** ${ahora}\n` +
        `👥 **Miembros del servidor:** ${totalMiembros}\n` +
        `📢 **Usuarios en este canal:** ${participantes || 'Ninguno'}`;

      await interaction.editReply(respuesta);

    } catch (error) {
      console.error(error);

      // IMPORTANTE: responder incluso en error
      await interaction.editReply('❌ Ocurrió un error al obtener la información');
    }
  }
};
