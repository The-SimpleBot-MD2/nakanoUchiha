let handler = async (m, { conn, usedPrefix, isOwner }) => {
let vcard = `BEGIN:VCARD\nVERSION:3.0\nN:DAVID-OFC 🇰🇷;;\nFN:DAVID-OFC 🇰🇷\nORG:DAVID-OFC 🇰🇷\nTITLE:\nitem1.TEL;waid=595975726335:595975726335\nitem1.X-ABLabel:DAVID-OFC 🇰🇷\nX-WA-BIZ-DESCRIPTION:\nX-WA-BIZ-NAME:DAVID-OFC 🇰🇷\nEND:VCARD`
await conn.sendMessage(m.chat, { contacts: { displayName: 'おDavid.xyz⁩.18', contacts: [{ vcard }] }}, {quoted: m})
}
handler.help = ['owner']
handler.tags = ['main']
handler.command = ['owner', 'creator', 'creador', 'dueño'] 

export default handler
