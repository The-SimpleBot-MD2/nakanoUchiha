import { readdirSync, statSync, unlinkSync, existsSync, readFileSync, watch, rmSync, promises as fs } from "fs";
import path, { join } from 'path';

let handler = async (m, { conn, usedPrefix, command }, args) => {
  // Definimos la conexión padre
  let parentw = conn;

  // Obtenemos el JID del usuario mencionado, del remitente o del bot mismo
  let who = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.fromMe ? conn.user.jid : m.sender;

  // Generamos un ID único basado en el JID del usuario
  let uniqid = `${who.split`@`[0]}`;

  // Obtenemos el nombre del usuario
  let userS = `${conn.getName(who)}`;
    
  // Verificamos si el usuario global es el mismo que el del bot principal
  if (global.conn.user.jid !== conn.user.jid) {
    // Si no es el bot principal, envía un mensaje con un enlace para comunicarse con el número principal
    return conn.sendMessage(m.chat, {
      text: lenguajeGB.smsJBDel() + `\n\n*https://api.whatsapp.com/send/?phone=${global.conn.user.jid.split`@`[0]}&text=${usedPrefix + command}&type=phone_number&app_absent=0*`
    }, { quoted: m });
  } else {
    try {
      // Intenta eliminar el directorio del sub-bot
      await fs.rmdir("./SubBot-TK/" + uniqid, { recursive: true, force: true });

      // Envía un mensaje de despedida gracioso
      await conn.sendMessage(m.chat, { text: lenguajeGB.smsJBAdios() }, { quoted: m });

      // Envía un mensaje indicando que la sesión se cerró correctamente
      await conn.sendMessage(m.chat, { text: lenguajeGB.smsJBCerrarS() }, { quoted: m });
    } catch (err) {
      // Si el directorio no existe, envía un mensaje indicando que el usuario no es sub-bot
      if (err.code === 'ENOENT' && err.path === `./SubBot-TK/${uniqid}`) {
        await conn.sendMessage(m.chat, { text: "😹 Usted no es SubBot" }, { quoted: m });
      } else {
        // Si hay otro error, lo muestra en la consola
        console.error(userS + ' ' + lenguajeGB.smsJBErr(), err);
      }
    }
  }
};

// Define los comandos que activan esta función
handler.command = /^(deletesess?ion|eliminarsesion|borrarsesion|delsess?ion|cerrarsesion)$/i;

// Solo permite comandos en chats privados
handler.private = true;

// Si el comando falla, no hace nada
handler.fail = null;

export default handler;
