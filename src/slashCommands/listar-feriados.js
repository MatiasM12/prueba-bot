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

module.exports = {
  data: new SlashCommandBuilder()
    .setName('listar_feriados')
    .setDescription('Listar todos los feriados cargados'),

  async execute(interaction) {
    const data = cargarFeriados();

    if (!data.feriados || data.feriados.length === 0) {
      return interaction.reply({
        content: '📭 No hay feriados cargados',
        ephemeral: true
      });
    }

    // ordenar por fecha
    const feriadosOrdenados = [...data.feriados].sort(
      (a, b) => new Date(a.date) - new Date(b.date)
    );

    let mensaje = '📅 **Feriados cargados:**\n\n';

    for (const f of feriadosOrdenados) {
      mensaje += `• **${f.date}** – ${f.localName}\n`;
    }

    await interaction.reply(mensaje);
  }
};
