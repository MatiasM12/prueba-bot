const { SlashCommandBuilder } = require('discord.js');
const { cargarListaMiembros, esDiaHabilFecha } = require('../utils/datos');

function obtenerProximoDiaHabil(fecha) {
  const f = new Date(fecha);
  do {
    f.setDate(f.getDate() + 1);
  } while (!esDiaHabilFecha(f));
  return f;
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ver_proximos_diarios')
    .setDescription('Simula el diario para los próximos n días')
    .addIntegerOption(opt =>
      opt.setName('dias')
        .setDescription('Cantidad de días hábiles')
        .setRequired(true)
        .setMinValue(1)
        .setMaxValue(30)
    ),

  async execute(interaction) {
    const dias = interaction.options.getInteger('dias');
    const data = cargarListaMiembros();

    // SOLO activos
    const activos = data.miembros.filter(m => m.activo);

    if (activos.length === 0) {
      return interaction.reply('⚠️ No hay miembros activos.');
    }

    let fecha = new Date();
    let index = 0;

    let resultado = '📅 **Simulación del diario:**\n\n';

    for (let i = 0; i < dias; i++) {
      fecha = obtenerProximoDiaHabil(fecha);

      const responsable = activos[index];

      const fechaTexto = fecha.toLocaleDateString('es-AR', {
        weekday: 'short',
        day: '2-digit',
        month: '2-digit'
      });

      resultado += `• ${fechaTexto} → ${responsable.nombre}\n`;

      index++;
      if (index >= activos.length) index = 0;
    }

    await interaction.reply(resultado);
  }
};
