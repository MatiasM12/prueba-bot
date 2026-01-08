const fs = require('fs');
const path = require('path');

const DATA_PATH = path.join(__dirname, '..', 'data', 'diario.json');
const FERIADOS_PATH = path.join(__dirname, '..', 'data', 'feriados.json');

// ================== LISTA DE MIEMBROS ==================
function cargarListaMiembros() {
  if (!fs.existsSync(DATA_PATH)) {
    return { miembros: [] };
  }
  return JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'));
}

function guardarListaMiembros(data) {
  fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2));
}

// ================== DÍAS HÁBILES / FERIADOS ==================
function esDiaHabilFecha(fecha) {
  const diaSemana = fecha.getDay();
  if (diaSemana === 0 || diaSemana === 6) {
    return false;
  }

  const fechaStr = fecha.toISOString().split('T')[0];

  if (!fs.existsSync(FERIADOS_PATH)) return true;

  const feriadosData = JSON.parse(fs.readFileSync(FERIADOS_PATH, 'utf8'));
  const feriado = feriadosData.feriados.find(f => f.date === fechaStr);

  return !feriado;
}

function obtenerFeriadoFecha(fecha) {
  if (!fs.existsSync(FERIADOS_PATH)) return null;

  const fechaStr = fecha.toISOString().split('T')[0];
  const feriadosData = JSON.parse(fs.readFileSync(FERIADOS_PATH, 'utf8'));

  return feriadosData.feriados.find(f => f.date === fechaStr) || null;
}

module.exports = {
  cargarListaMiembros,
  guardarListaMiembros,
  esDiaHabilFecha,
  obtenerFeriadoFecha
};
