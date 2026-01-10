const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('mover_persona_a_posision')
    .setDescription('Mover un miembro a una posición específica del diario')
    .addUserOption(opt =>
      opt.setName('usuario')
        .setDescription('Usuario a mover')
        .setRequired(true)
    )
    .addIntegerOption(opt =>
      opt.setName('posicion')
        .setDescription('Nueva posición en la lista (1 = próximo)')
        .setRequired(true)
        .setMinValue(1)
    ),

  async execute(interaction, { cargarListaMiembros, guardarListaMiembros }) {
    const user = interaction.options.getUser('usuario');
    const posicion = interaction.options.getInteger('posicion');
    const data = cargarListaMiembros();

    const indexActual = data.miembros.findIndex(m => m.id === user.id);

    if (indexActual === -1) {
      return interaction.reply({
        content: '❌ El usuario no está en la lista del diario',
        ephemeral: true
      });
    }

    if (!data.miembros[indexActual].activo) {
      return interaction.reply({
        content: '⚠️ No podés mover un usuario inactivo',
        ephemeral: true
      });
    }

    const nuevaPosicion = posicion - 1;

    if (nuevaPosicion >= data.miembros.length) {
      return interaction.reply({
        content: `⚠️ La posición máxima es ${data.miembros.length}`,
        ephemeral: true
      });
    }

    // sacar de la posición actual
    const [miembro] = data.miembros.splice(indexActual, 1);

    // insertar en la nueva posición
    data.miembros.splice(nuevaPosicion, 0, miembro);

    guardarListaMiembros(data);

    await interaction.reply(
      `🔀 **Orden actualizado**\n` +
      `👤 ${miembro.nombre} movido a la posición **${posicion}**`
    );
  }
};
