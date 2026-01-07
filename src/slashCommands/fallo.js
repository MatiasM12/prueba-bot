const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('fallo')
    .setDescription('Marcar que un responsable falló y otro lo cubrió')
    .addUserOption(opt =>
      opt.setName('responsable')
        .setDescription('Usuario que no dio el diario')
        .setRequired(true)
    )
    .addUserOption(opt =>
      opt.setName('cubrio')
        .setDescription('Usuario que cubrió el diario')
        .setRequired(true)
    ),

  async execute(interaction, { cargarLista, guardarLista }) {
    const responsableUser = interaction.options.getUser('responsable');
    const cubrioUser = interaction.options.getUser('cubrio');

    if (responsableUser.id === cubrioUser.id) {
      return interaction.reply({
        content: '⚠️ El responsable y quien cubrió no pueden ser la misma persona',
        ephemeral: true
      });
    }

    const data = cargarLista();

    const indexResponsable = data.miembros.findIndex(
      m => m.id === responsableUser.id
    );

    const indexCubrio = data.miembros.findIndex(
      m => m.id === cubrioUser.id
    );

    if (indexResponsable === -1 || indexCubrio === -1) {
      return interaction.reply({
        content: '❌ Ambos usuarios deben estar en la lista del diario',
        ephemeral: true
      });
    }

    if (!data.miembros[indexResponsable].activo || !data.miembros[indexCubrio].activo) {
      return interaction.reply({
        content: '⚠️ Ambos usuarios deben estar activos',
        ephemeral: true
      });
    }

    // Reordenar sin romper la lista
    const responsable = data.miembros[indexResponsable];
    const cubrio = data.miembros[indexCubrio];

    // quitar ambos primero (orden descendente para no romper índices)
    const indices = [indexResponsable, indexCubrio].sort((a, b) => b - a);
    for (const i of indices) {
      data.miembros.splice(i, 1);
    }

    // responsable queda como próximo
    data.miembros.unshift(responsable);

    // quien cubrió pasa al final
    data.miembros.push(cubrio);

    guardarLista(data);

    await interaction.reply(
      `⏰ **Diario marcado como fallido**\n` +
      `😴 No lo dio: <@${responsable.id}>\n` +
      `✅ Lo cubrió: <@${cubrio.id}>\n\n` +
      `➡️ <@${responsable.id}> queda como próximo\n` +
      `⬅️ <@${cubrio.id}> pasa al final`
    );
  }
};
