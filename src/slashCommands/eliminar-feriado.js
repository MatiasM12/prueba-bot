const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

const FERIADOS_PATH = path.join(__dirname, '..', 'data', 'feriados.json');

function cargarFeriados() {
  if (!fs.existsSync(FERIADOS_PATH)) {
    return { feriados: [] };
  }
  return JSON.parse(fs.readFileSync(FERIADOS_PATH, 'utf8'));
}

function guardarFeriados(data) {
  fs.writeFileSync(FERIADOS_PATH, JSON.stringify(data, null, 2));
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('eliminar_feriado')
    .setDescription('Eliminar un feriado')
    .addStringOption(opt =>
      opt.setName('fecha')
        .setDescription('Fecha del feriado (YYYY-MM-DD)')
        .setRequired(true)
    ),

  async execute(interaction) {
    const fecha = interaction.options.getString('fecha');
    const data = cargarFeriados();

    const index = data.feriados.findIndex(f => f.date === fecha);

    if (index === -1) {
      return interaction.reply({
        content: '❌ No existe un feriado en esa fecha',
        ephemeral: true
      });
    }

    const eliminado = data.feriados[index];
    data.feriados.splice(index, 1);

    guardarFeriados(data);

    await interaction.reply(
      `🗑️ Feriado eliminado: **${eliminado.date}** – ${eliminado.localName}`
    );
  }
};
