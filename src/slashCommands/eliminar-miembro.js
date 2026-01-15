const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('eliminar_miembro')
    .setDescription('Eliminar un miembro del diario')
    .addUserOption(opt =>
      opt.setName('usuario')
        .setDescription('Usuario a eliminar')
        .setRequired(true)
    ),

  async execute(interaction, { cargarListaMiembros, guardarListaMiembros }) {
    const user = interaction.options.getUser('usuario');
    const data = cargarListaMiembros();

    const index = data.miembros.findIndex(m => m.id === user.id);

    if (index === -1) {
      return interaction.reply({
        content: '⚠️ Ese usuario no está en la lista',
        ephemeral: true
      });
    }

    const eliminado = data.miembros[index];

    // Eliminar definitivamente
    data.miembros.splice(index, 1);
    guardarListaMiembros(data);

    await interaction.reply(
      `🗑️ ${eliminado.nombre} fue eliminado del diario`
    );
  }
};
