let handler = async (m, { conn, usedPrefix, text }) => {
  // Verifica si el usuario actual es el bot principal
  if (conn.user.jid !== global.conn.user.jid) throw false;

  // Obtiene una lista única de JIDs de sub-bots que están activos
  let users = [...new Set([...global.conns.filter(conn => conn.user && conn.state !== 'close').map(conn => conn.user.jid)])];

  // Determina el texto a difundir, ya sea el texto proporcionado o el texto del mensaje citado
  let cc = text ? m : m.quoted ? await m.getQuotedObj() : false || m;
  let teks = text ? text : cc.text;

  // Modifica el contenido del mensaje para la difusión
  let content = conn.cMod(m.chat, cc, /bc|broadcast/i.test(teks) ? teks : '*〔 𝗗𝗜𝗙𝗨𝗦𝗜𝗢𝗡 𝗔 𝗦𝗨𝗕 𝗕𝗢𝗧𝗦 〕*\n\n' + teks);

  // Envía el mensaje modificado a cada sub-bot con un retraso de 1.5 segundos entre cada envío
  for (let id of users) {
    await delay(1500);
    await conn.copyNForward(id, content, true);
  }

  // Responde en el chat original indicando que la difusión fue exitosa
  conn.reply(m.chat, `*🐾 𝗗𝗜𝗙𝗨𝗦𝗜𝗢𝗡 𝗘𝗡𝗩𝗜𝗔𝗗𝗔 𝗖𝗢𝗡 𝗘𝗫𝗜𝗧𝗢 𝗔 ${users.length} 𝗦𝗨𝗕 𝗕𝗢𝗧𝗦* 😺
  
${users.map(v => '🐈 Wa.me/' + v.replace(/[^0-9]/g, '') + `?text=${encodeURIComponent(usedPrefix)}estado`).join('\n')}
\n*🕒 𝗦𝗘 𝗙𝗜𝗡𝗔𝗟𝗜𝗭𝗢 𝗖𝗢𝗡 𝗘𝗟 𝗘𝗡𝗩𝗜𝗢 𝗘𝗡 ${users.length * 1.5} 𝗦𝗘𝗚𝗨𝗡𝗗𝗢𝗦 𝗔𝗣𝗥𝗢𝗫𝗜𝗠𝗔𝗗𝗔𝗠𝗘𝗡𝗧𝗘*`.trim(), m);
};

// Define el comando que activa esta función
handler.command = /^bcbot$/i;

// Solo el propietario puede usar este comando
handler.owner = true;

export default handler;

const more = String.fromCharCode(8206);
const readMore = more.repeat(4001);

// Función para crear un retraso en milisegundos
const delay = time => new Promise(res => setTimeout(res, time));
