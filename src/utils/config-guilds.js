const fs = require('fs');
const path = require('path');

const CONFIG_PATH = path.join(__dirname, '../data/config.json');

function cargarConfig() {
  try {
    if (!fs.existsSync(CONFIG_PATH)) {
      fs.writeFileSync(CONFIG_PATH, JSON.stringify({}, null, 2));
      return {};
    }

    const contenido = fs.readFileSync(CONFIG_PATH, 'utf8').trim();

    if (!contenido) {
      return {};
    }

    return JSON.parse(contenido);

  } catch (err) {
    console.error('❌ Error leyendo config.json, se resetea:', err.message);
    return {};
  }
}

function guardarConfig(config) {
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2));
}

function obtenerConfigGuild(guildId) {
  const config = cargarConfig();
  return config[guildId];
}

function setConfigGuild(guildId, data) {
  const config = cargarConfig();

  config[guildId] = {
    ...(config[guildId] || {}),
    ...data
  };

  guardarConfig(config);
}

module.exports = {
  obtenerConfigGuild,
  setConfigGuild
};
