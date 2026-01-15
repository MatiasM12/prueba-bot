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
    .setName('agregar_feriado')
    .setDescription('Agregar un feriado')
    .addStringOption(opt =>
      opt.setName('fecha')
        .setDescription('Fecha en formato YYYY-MM-DD')
        .setRequired(true)
    )
    .addStringOption(opt =>
      opt.setName('nombre')
        .setDescription('Nombre del feriado')
        .setRequired(true)
    ),

  async execute(interaction) {
    const fecha = interaction.options.getString('fecha');
    const nombre = interaction.options.getString('nombre');

    if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
      return interaction.reply({
        content: '❌ Formato de fecha inválido. Usá YYYY-MM-DD',
        ephemeral: true
      });
    }

    const data = cargarFeriados();

    if (data.feriados.some(f => f.date === fecha)) {
      return interaction.reply({
        content: '⚠️ Ya existe un feriado en esa fecha',
        ephemeral: true
      });
    }

    data.feriados.push({
      date: fecha,
      localName: nombre
    });

    guardarFeriados(data);

    await interaction.reply(
      `✅ Feriado agregado:\n **${fecha}** – ${nombre}`
    );
  }
};
