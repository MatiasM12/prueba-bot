const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('listar_miembros')
    .setDescription('Ver orden del diario'),

  async execute(interaction, { cargarLista }) {
    const data = cargarLista();

    if (data.miembros.length === 0) {
      return interaction.reply('📭 Lista vacía');
    }

    const texto = data.miembros
      .map((m, i) => `${i + 1}. ${m.nombre} ${m.activo ? '🟢' : '🔴'}`)
      .join('\n');

    await interaction.reply(`📋 **Orden del diario**\n${texto}`);
  }
};
