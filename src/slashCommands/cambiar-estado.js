const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('cambiar_estado')
    .setDescription('Activar o desactivar un miembro')
    .addUserOption(opt =>
      opt.setName('usuario')
        .setDescription('Usuario')
        .setRequired(true)
    ),

  async execute(interaction, { cargarLista, guardarLista }) {
    const user = interaction.options.getUser('usuario');
    const data = cargarLista();

    const miembro = data.miembros.find(m => m.id === user.id);
    if (!miembro) {
      return interaction.reply({ content: '❌ No está en la lista', ephemeral: true });
    }

    miembro.activo = !miembro.activo;
    guardarLista(data);

    await interaction.reply(
      `🔄 ${user.username} ahora está ${miembro.activo ? '🟢 activo' : '🔴 inactivo'}`
    );
  }
};
