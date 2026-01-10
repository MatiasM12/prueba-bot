const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('agregar_miembro')
    .setDescription('Agregar un miembro al diario')
    .addUserOption(opt =>
      opt.setName('usuario')
        .setDescription('Usuario a agregar')
        .setRequired(true)
    ),

  async execute(interaction, { cargarListaMiembros, guardarListaMiembros }) {
    const user = interaction.options.getUser('usuario');
    const data = cargarListaMiembros();

    if (data.miembros.some(m => m.id === user.id)) {
      return interaction.reply({ content: '⚠️ Ya está en la lista', ephemeral: true });
    }

    data.miembros.push({
      id: user.id,
      nombre: user.username,
      activo: true
    });

    guardarListaMiembros(data);

    await interaction.reply(`✅ ${user.username} agregado al diario`);
  }
};
