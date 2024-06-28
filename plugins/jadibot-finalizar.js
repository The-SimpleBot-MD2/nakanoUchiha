// Handler para detener la conexión de un sub-bot
let handler = async (m, { conn }) => {
  // Verifica si el usuario global es el mismo que el usuario del sub-bot
  if (global.conn.user.jid == conn.user.jid) {
    // Si el usuario no es un sub-bot, envía un mensaje indicando que deben comunicarse con el número principal
    conn.reply(m.chat, `😼 𝙎𝙄 𝙉𝙊 𝙀𝙎 𝙎𝙐𝘽 𝘽𝙊𝙏, 𝘾𝙊𝙈𝙐𝙉𝙄𝙌𝙐𝙀𝙎𝙀 𝘼𝙇 𝙉𝙐𝙈𝙀𝙍𝙊 𝙋𝙍𝙄𝙉𝘾𝙄𝙋𝘼𝙇 𝙋𝘼𝙍𝘼 𝙎𝙀𝙍 𝘽𝙊𝙏`, m);
  } else {
    // Si el usuario es un sub-bot, envía un mensaje de despedida gracioso y cierra la conexión
    await conn.reply(m.chat, `😿 𝙐𝙎𝙏𝙀𝘿 𝙃𝘼 𝘾𝙀𝙍𝙍𝘼𝘿𝙊 𝙎𝙀𝙎𝙄𝙊𝙉 𝘾𝙊𝙉𝙈𝙄𝙂𝙊 😯`, m);
    conn.ws.close();
  }
}

// Define los comandos que activan esta función (stop en varios idiomas)
handler.command = /^(berhenti|stop|detener)$/i;

// Solo el propietario puede usar este comando
handler.owner = true;

// Si el comando falla, no hace nada
handler.fail = null;

export default handler;
