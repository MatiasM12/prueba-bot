const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('cambiar_estado')
    .setDescription('Cambia el estado de un miembro a activo o inactivo')
    .addUserOption(opt =>
      opt.setName('usuario')
        .setDescription('Usuario')
        .setRequired(true)
    ),

  async execute(interaction, { cargarListaMiembros, guardarListaMiembros }) {
    const user = interaction.options.getUser('usuario');
    const data = cargarListaMiembros();

    const miembro = data.miembros.find(m => m.id === user.id);
    if (!miembro) {
      return interaction.reply({ content: '❌ No está en la lista', ephemeral: true });
    }

    miembro.activo = !miembro.activo;
    guardarListaMiembros(data);

    await interaction.reply(
      `🔄 ${user.username} ahora está ${miembro.activo ? '🟢 activo' : '🔴 inactivo'}`
    );
  }
};
