# Bot Diario 

Bot de Discord desarrollado en **Node.js + discord.js** para organizar y automatizar el **diario del equipo de desarrollo**, asignando responsables por día hábil, respetando feriados y configuraciones por servidor.

## ✨ Funcionalidades

- 📅 Asignación automática del diario de **lunes a viernes**
- 🚫 Respeta **feriados configurables**
- 👥 Manejo de miembros activos
- ❌ Eliminación completa de miembros del sistema
- 🔁 Rotación automática de responsables
- ⏰ Configuración de **hora del diario** y **hora de alerta**
- 📢 Canal configurable por servidor
- 🧪 Simulación de próximos diarios
- ⚙️ Configuración independiente por **servidor (guild)**

---

## 🛠️ Tecnologías

- Node.js
- discord.js v14
- node-cron
- JSON como almacenamiento simple

---

## 🚀 Instalación y ejecucion

```bash
git clone <repo>
cd prueba-bot
npm install
```
### Crear un archivo config.json:

```json
{
  "token": <TuTokenDelBot>,
  "botId": <TuIdDelBot>
}
```
### Cargar comandos slash:
```bash
node src/utils/create-commands.js
```

### Iniciar el bot:
```bash
node src/index.js
```

## /Comandos Slash 

### 👥 Miembros

- `/agregar_miembro usuario:@user`  
  Agrega un usuario al sistema del diario.

- `/eliminar_miembro usuario:@user`  
  Elimina completamente un usuario del sistema del diario.

- `/listar_miembros`  
  Muestra todos los miembros registrados y su estado.


### 📅 Diario

- `/ver_proximos_diarios dias:5`  
  Simula el diario para los próximos **N días hábiles**, respetando feriados y solo considerando miembros activos.


### 🎉 Feriados

- `/feriado agregar fecha:YYYY-MM-DD`  
  Agrega un feriado (no se envía diario ese día).

- `/feriado eliminar fecha:YYYY-MM-DD`  
  Elimina un feriado existente.

- `/feriado listar`  
  Lista todos los feriados configurados.


### ⚙️ Configuración

- `/config canal canal:#general`  
  Define el canal donde se enviarán los mensajes del diario.

- `/config hora-diario hora:09:00`  
  Configura la hora a la que se envía el diario.

- `/config hora-alerta hora:08:50`  
  Configura la hora de la alerta previa al diario.


## ⏰ Funcionamiento

- El bot solo opera en **días hábiles (lunes a viernes)**.
- Los **feriados** no generan alertas ni diarios.
- Primero se envía la **alerta** si no se envia ningun mensaje en el canal del diario desde las 7am hasta la hora especificada. Luego envia autimaticamente el responsable del **diario** de mañana a la hora especificada con `/config hora-diario`.
- La rotación se realiza únicamente entre **miembros activos**.

---

## ⚠️ Notas importantes

- La información se persiste en archivos JSON dentro de la carpeta `/src/data/`.
- El archivo `config.json` de la raiz del proyecto contiene el token y id del bot.

