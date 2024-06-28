# Guardar el código en un archivo
const { useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion, MessageRetryMap, makeCacheableSignalKeyStore, jidNormalizedUser, PHONENUMBER_MCC } = await import('@whiskeysockets/baileys');
import moment from 'moment-timezone';
import PhoneNumber from 'awesome-phonenumber';
import NodeCache from 'node-cache';
import readline from 'readline';
import qrcode from "qrcode";
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import fs from "fs";
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import pino from 'pino';
import * as ws from 'ws';
const { CONNECTING } = ws;
import { Boom } from '@hapi/boom';
import { makeWASocket } from '../lib/simple.js';

// Inicializar global.conns si no es un array
if (!(global.conns instanceof Array)) global.conns = [];

// Definir constantes para la configuración del bot
const __dirname = dirname(fileURLToPath(import.meta.url));
const packageJsonPath = join(__dirname, '../package.json');
const { name, author, version: versionSB, description } = JSON.parse(readFileSync(packageJsonPath, 'utf8'));

// Configuración del bot
let folderBot = 'SubBotSession', nameBotMD = 'SubBot-TK', opcion = '';

// Handler principal del bot
let handler = async (m, { conn: _conn, args, usedPrefix, command, isOwner, text }) => {
    try {
        // Verificar si el bot está habilitado
        if (!global.db.data.settings[conn.user.jid].jadibotmd) return _conn.sendMessage(m.chat, { text: `${lenguajeGB['smsSoloOwnerJB']()}` }, { quoted: m });

        // Obtener la conexión principal o usar la conexión actual
        let parent = args[0] && args[0] == 'plz' ? _conn : await global.conn;
        text = (text ? text : (args[0] ? args[0] : '')).toLowerCase();

        // Mensaje inicial para el usuario
        let message1 = `🤖 *¡Hola futuro bot!*\n\nSi quieres convertirte en un bot super genial, por favor dirígete al número principal:\n\n📞 wa.me/${global.conn.user.jid.split('@')[0]}?text=${usedPrefix}serbot\n\n¡Te esperamos! 🐱‍💻`;

        // Enviar mensaje según el tipo de código solicitado (QR o código)
        if (!((args[0] && args[0] == 'plz') || (await global.conn).user.jid == _conn.user.jid)) {
            if (text.includes('qr')) {
                return parent.sendMessage(m.chat, { text: message1 + '%20qr' }, { quoted: m });
            } else if (text.includes('code')) {
                return parent.sendMessage(m.chat, { text: message1 + '%20code' }, { quoted: m });
            } else {
                return parent.sendMessage(m.chat, { text: message1 + '%20code' }, { quoted: m });
            }
        }

        // Crear carpeta de autenticación si no existe
        let authFolderB = crypto.randomBytes(10).toString('hex').slice(0, 8);
        if (!fs.existsSync(`./${folderBot}/` + authFolderB)) {
            fs.mkdirSync(`./${folderBot}/` + authFolderB, { recursive: true });
        }

        // Guardar credenciales en archivo JSON
        if (args[0]) {
            fs.writeFileSync(`./${folderBot}/` + authFolderB + "/creds.json", JSON.stringify(JSON.parse(Buffer.from(args[0], "base64").toString("utf-8")), null, '\t'));
        }

        // Función principal para convertir a bot
        async function serbot() {
            const { state, saveState, saveCreds } = await useMultiFileAuthState(`./${folderBot}/${authFolderB}`);
            const msgRetryCounterMap = (MessageRetryMap) => { };
            const msgRetryCounterCache = new NodeCache();
            const { version } = await fetchLatestBaileysVersion();
            let phoneNumber = m.sender.split('@')[0];

            const methodCodeQR = text.includes('qr') || false;
            const methodCode = text.includes('code') || true;
            const MethodMobile = process.argv.includes("mobile");

            if (text.includes('qr')) {
                opcion = '1';
            } else if (text.includes('code')) {
                opcion = '2';
            } else {
                opcion = '2';
            }

            const connectionOptions = {
                logger: pino({ level: 'silent' }),
                printQRInTerminal: opcion == '1' ? true : methodCodeQR ? true : false,
                mobile: MethodMobile,
                browser: opcion == '1' ? [`${nameBotMD} (sub bot)`, 'Edge', '2.0.0'] : ['Ubuntu', 'Edge', '110.0.1587.56'],
                auth: { creds: state.creds, keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "fatal" }).child({ level: "fatal" })) },
                markOnlineOnConnect: true,
                generateHighQualityLinkPreview: true,
                getMessage: async (clave) => {
                    let jid = jidNormalizedUser(clave.remoteJid);
                    let msg = await store.loadMessage(jid, clave.id);
                    return msg?.message || "";
                },
                msgRetryCounterCache,
                msgRetryCounterMap,
                defaultQueryTimeoutMs: undefined,
                version
            };

            let conn = makeWASocket(connectionOptions);
            conn.isInit = false;
            let isInit = true;

            let cleanedNumber = phoneNumber.replace(/[^0-9]/g, '');

            let txt = '';
            if (!fs.existsSync(`./${folderBot}/` + authFolderB + "/creds.json")) {
                if (opcion == '1') {
                    txt = `*『 ¡Transformación a Bot en Proceso! 』*\n
                    ✨ *Versión del Bot: ${name} v${versionSB}* ✨\n
                    🛠️ *Descripción: ${description}*\n
                    🚀 *¡Prepárate para una experiencia única con ${name}!* 🚀\n\n
                    > *Por favor, escanea este código QR con tu teléfono para completar la transformación y unirte a la élite de los bots. ¡No olvides sonreír!* 😃\n\n
                    ⚠️ _*El código QR expira en 50 segundos, así que date prisa antes de que desaparezca como un ninja.*_ 🥷`;
                } else {
                    txt = `*『 ¡Transformación a Bot en Proceso! 』*\n
                    ✨ *Versión del Bot: ${name} v${versionSB}* ✨\n
                    🛠️ *Descripción: ${description}*\n
                    🚀 *¡Prepárate para una experiencia única con ${name}!* 🚀\n\n
                    > *Se enviará un código para ser Sub Bot*\n\n1️⃣ *Diríjase a los tres puntos en la esquina superior derecha*\n\n2️⃣ *Selecciona "Dispositivos vinculados" y use el botón "Vincular un dispositivo"*\n\n3️⃣ *Selecciona en la parte inferior "Vincular con el número de teléfono"*\n\n4️⃣ *Introduzca el código de 8 dígitos*\n
                    ⚠️ _*El código solo será válido para @${phoneNumber} y se eliminará en 1 minuto para evitar spam.*_`;
                }

                // Enviar código de 8 dígitos si no se usa QR
                if (opcion != '1') {
                    let codeA, codeB;
                    setTimeout(async () => {
                        let codeBot = await conn.requestPairingCode(cleanedNumber);
                        codeBot = codeBot?.match(/.{1,4}/g)?.join("-") || codeBot;
                        codeA = await parent.sendMessage(m.chat, { text: txt.trim(), mentions: [m.sender] }, { quoted: m });
                        codeB = await parent.sendMessage(m.chat, { text: codeBot }, { quoted: m });
                    }, 2000);

                    setTimeout(() => {
                        parent.sendMessage(m.chat, { delete: codeA.key });
                        parent.sendMessage(m.chat, { delete: codeB.key });
                    }, 60000); // 1 min
                }
            }

            // Actualización de la conexión
            async function connectionUpdate(update) {
                const { connection, lastDisconnect, isNewLogin, qr } = update;
                if (isNewLogin) conn.isInit = true;
                if (opcion == '1') {
                    let scan = await parent.sendFile(m.chat, await qrcode.toDataURL(qr, { scale: 8 }), 'qrcode.png', txt.trim(), m);
                    setTimeout(() => {
                        parent.sendMessage(m.chat, { delete: scan.key });
                    }, 50000); // 50 segundos
                }
                const code = lastDisconnect?.error?.output?.statusCode || lastDisconnect?.error?.output?.payload?.statusCode;
                if (code && code !== DisconnectReason.loggedOut && conn?.ws.socket == null) {
                    let i = global.conns.indexOf(conn);
                    if (i < 0) {
                        console.log(await creloadHandler(true).catch(console.error));
                    }
                    delete global.conns[i];
                    global.conns.splice(i, 1);
                    if (code !== DisconnectReason.connectionClosed) {
                        parent.sendMessage(m.chat, { text: "*Conexión perdida...* vuelva a intentarlo" }, { quoted: m });
                    } else {
                        parent.sendMessage(m.chat, { text: "*La conexión se cerró*, Tendrá que conectarse manualmente usando el comando #serbot" }, { quoted: m });
                    }
                }

                if (global.db.data == null) loadDatabase();
                if (connection == 'open') {
                    conn.isInit = true;
                    global.conns.push(conn);
                    await parent.sendMessage(m.chat, {
                        text: args[0] ? '✅ *¡Conectado con éxito!*' : `✅ *Conectado con WhatsApp*\n\n♻️ *Comandos relacionados con Sub Bot:*\n» *#stop* _(Pausar ser bot)_\n» *#eliminarsesion* _(Dejar de ser bot y eliminar datos)_\n» *#serbot [texto largo]* _(Reanudar ser Bot en caso que este pausado o deje de funcionar)_\n\n*Gracias por usar ❤️${name} 🐈*\n\n📢 *Infórmate de las novedades en nuestro canal oficial:*\n${canal2}\n\n🤩 *Descubre más formas de seguir pendiente de este proyecto:*\n${cuentas}\n\n💝...
                    }, { quoted: m });
                    await parent.sendMessage(m.chat, { text: `🤭 *¡Sigue de cerca este nuevo proyecto!*\nhttps://whatsapp.com/channel/0029VabS4KD8KMqeVXXmkG1D` }, { quoted: m });
                    args[0] ? console.log(`*Usuario Sub Bot reconectándose: ${PhoneNumber('+' + (conn.user?.jid).replace('@s.whatsapp.net', '')).getNumber('international')} (${conn.getName(conn.user.jid)})*`) : console.log(`*Nuevo usuario conectado como Sub Bot: ${PhoneNumber('+' + (conn.user?.jid).replace('@s.whatsapp.net', '')).getNumber('international')} (${conn.getName(conn.user.jid)})*`);
                    await sleep(5000);
                    if (args[0]) return;
                    await parent.sendMessage(conn.user.jid, { text: '*Si pausa ser sub bot o deja de funcionar, envíe este mensaje para intentar conectarse nuevamente*' }, { quoted: m });
                    await parent.sendMessage(conn.user.jid, { text: usedPrefix + command + " " + Buffer.from(fs.readFileSync(`./${folderBot}/` + authFolderB + "/creds.json"), "utf-8").toString("base64") }, { quoted: m });
                }
            }

            setInterval(async () => {
                if (!conn.user) {
                    try { conn.ws.close(); } catch { }
                    conn.ev.removeAllListeners();
                    let i = global.conns.indexOf(conn);
                    if (i < 0) return;
                    delete global.conns[i];
                    global.conns.splice(i, 1);
                }
            }, 60000);

            let handler = await import('../handler.js');
            let creloadHandler = async function (restatConn) {
                try {
                    const Handler = await import(`../handler.js?update=${Date.now()}`).catch(console.error);
                    if (Object.keys(Handler || {}).length) handler = Handler;
                } catch (e) {
                    console.error(e);
                }
                if (restatConn) {
                    try { conn.ws.close(); } catch { }
                    conn.ev.removeAllListeners();
                    conn = makeWASocket(connectionOptions);
                    isInit = true;
                }

                if (!isInit) {
                    conn.ev.off('messages.upsert', conn.handler);
                    conn.ev.off('connection.update', conn.connectionUpdate);
                    conn.ev.off('creds.update', conn.credsUpdate);
                }

                conn.handler = handler.handler.bind(conn);
                conn.connectionUpdate = connectionUpdate.bind(conn);
                conn.credsUpdate = saveCreds.bind(conn, true);

                conn.ev.on('messages.upsert', conn.handler);
                conn.ev.on('connection.update', conn.connectionUpdate);
                conn.ev.on('creds.update', conn.credsUpdate);
                isInit = false;
                return true;
            }
            creloadHandler(false);
        }
        serbot();

    } catch (error) {
        console.error('Error en el handler principal:', error);
        _conn.sendMessage(m.chat, { text: '😵 *Hubo un error en el proceso. Inténtalo de nuevo más tarde.*' }, { quoted: m });
    }
}
handler.command = ['jadibot', 'serbot'];
export default handler;

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function isBase64(text) {
    const validChars = /^[A-Za-z0-9+/]*={0,2}$/;
    if (text.length % 4 === 0 && validChars.test(text)) {
        const decoded = Buffer.from(text, 'base64').toString('base64');
        return decoded === text;
    }
    return false;
}

function fileExists(filePath) {
    try {
        return fs.statSync(filePath).isFile();
    } catch (err) {
        return false;
    }
}

              
                                
