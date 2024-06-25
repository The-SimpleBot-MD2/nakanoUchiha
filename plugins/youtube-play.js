import fetch from "node-fetch";
import yts from "yt-search";
import ytdl from 'ytdl-core';
import axios from 'axios';
import { youtubedl, youtubedlv2 } from '@bochilteam/scraper';

let handler = async (m, { conn, command, args, text, usedPrefix }) => {
    if (!text) {
        return conn.reply(m.chat, '🍭 Ingresa el título de un video o canción de YouTube.\n\n`Ejemplo:`\n' + `> *${usedPrefix + command}* Gemini Aaliyah - If Only`, m);
    }

    let user = global.db.data.users[m.sender];
    try {
        const yt_play = await search(args.join(" "));
        if (!yt_play.length) {
            return conn.reply(m.chat, '💔 No se encontraron resultados para tu búsqueda.', m);
        }
        
        let video = yt_play[0];
        let additionalText = command === 'play' ? '𝘼𝙐𝘿𝙄𝙊 🔊' : '𝙑𝙄𝘿𝙀𝙊 🎥';

        let txt = `╭─⬣「 *YouTube Play* 」⬣\n`;
        txt += `│  ≡◦ *🍭 Título ∙* ${video.title}\n`;
        txt += `│  ≡◦ *📅 Publicado ∙* ${video.ago}\n`;
        txt += `│  ≡◦ *🕜 Duración ∙* ${video.duration.timestamp}\n`;
        txt += `│  ≡◦ *👤 Autor ∙* ${video.author.name}\n`;
        txt += `│  ≡◦ *⛓ Url ∙* ${video.url}\n`;
        txt += `│  ≡◦ *🪴 Calidad ∙* ${quality}\n`;
        txt += `│  ≡◦ *⚖ Peso ∙* ${size}\n`;
        txt += `╰─⬣`;

        await conn.sendMessage(m.chat, {
            text: txt,
            contextInfo: {
                externalAdReply: {
                    title: video.title,
                    body: '',
                    thumbnailUrl: video.thumbnail,
                    mediaType: 1,
                    showAdAttribution: true,
                    renderLargerThumbnail: true
                }
            }
        }, { quoted: m });

        if (command === 'play') {
            let q = '128kbps';
            let v = video.url;
            let dl_url, ttl;

            try {
                const yt = await youtubedl(v).catch(async _ => await youtubedlv2(v));
                dl_url = await yt.audio[q].download();
                ttl = await yt.title;
            } catch (error) {
                try {
                    const dataRE = await fetch(`https://api.akuari.my.id/downloader/youtube?link=${v}`);
                    const dataRET = await dataRE.json();
                    dl_url = dataRET.mp3[1].url;
                    ttl = video.title;
                } catch (error) {
                    try {
                        const humanLol = await fetch(`https://api.lolhuman.xyz/api/ytplay?apikey=${lolkeysapi}&query=${video.title}`);
                        const humanRET = await humanLol.json();
                        dl_url = humanRET.result.audio.link;
                        ttl = video.title;
                    } catch (error) {
                        try {
                            const lolhuman = await fetch(`https://api.lolhuman.xyz/api/ytaudio2?apikey=${lolkeysapi}&url=${v}`);
                            const lolh = await lolhuman.json();
                            dl_url = lolh.result.link;
                            ttl = lolh.result.title || 'error';
                        } catch (error) {
                            console.error(error);
                            return conn.reply(m.chat, '💔 No se pudo descargar el audio.', m);
                        }
                    }
                }
            }

            await conn.sendMessage(m.chat, {
                audio: { url: dl_url },
                mimetype: 'audio/mpeg',
                contextInfo: {
                    externalAdReply: {
                        title: ttl,
                        body: "",
                        thumbnailUrl: video.thumbnail,
                        mediaType: 1,
                        showAdAttribution: true,
                        renderLargerThumbnail: true
                    }
                }
            }, { quoted: m });
        }
    } catch (e) {
        console.error(e);
        await m.reply('💔 Ups, algo salió mal. Intenta de nuevo más tarde.');
    }
};

handler.help = ["play <búsqueda>"];
handler.tags = ["downloader"];
handler.command = ["play", "play2"];
handler.register = true;

export default handler;

async function search(query, options = {}) {
    const search = await yts.search({ query, hl: "es", gl: "ES", ...options });
    return search.videos;
}

function MilesNumber(number) {
    const exp = /(\d)(?=(\d{3})+(?!\d))/g;
    const rep = "$1.";
    let arr = number.toString().split(".");
    arr[0] = arr[0].replace(exp, rep);
    return arr[1] ? arr.join(".") : arr[0];
}

function secondString(seconds) {
    seconds = Number(seconds);
    var d = Math.floor(seconds / (3600 * 24));
    var h = Math.floor((seconds % (3600 * 24)) / 3600);
    var m = Math.floor((seconds % 3600) / 60);
    var s = Math.floor(seconds % 60);
    var dDisplay = d > 0 ? d + (d == 1 ? " día, " : " días, ") : "";
    var hDisplay = h > 0 ? h + (h == 1 ? " hora, " : " horas, ") : "";
    var mDisplay = m > 0 ? m + (m == 1 ? " minuto, " : " minutos, ") : "";
    var sDisplay = s > 0 ? s + (s == 1 ? " segundo" : " segundos") : "";
    return dDisplay + hDisplay + mDisplay + sDisplay;
}
