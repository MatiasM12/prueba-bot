const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('diario_add')
    .setDescription('Agregar un miembro al diario')
    .addUserOption(opt =>
      opt.setName('usuario')
        .setDescription('Usuario a agregar')
        .setRequired(true)
    ),

  async execute(interaction, { cargarLista, guardarLista }) {
    const user = interaction.options.getUser('usuario');
    const data = cargarLista();

    if (data.miembros.some(m => m.id === user.id)) {
      return interaction.reply({ content: '⚠️ Ya está en la lista', ephemeral: true });
    }

    data.miembros.push({
      id: user.id,
      nombre: user.username,
      activo: true
    });

    guardarLista(data);

    await interaction.reply(`✅ ${user.username} agregado al diario`);
  }
};
