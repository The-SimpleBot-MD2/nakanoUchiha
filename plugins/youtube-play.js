import fetch from "node-fetch";
import yts from "yt-search";
import ytdl from 'ytdl-core';
import { youtubedl, youtubedlv2 } from '@bochilteam/scraper';

let handler = async (m, { conn, command, args, text, usedPrefix }) => {
    if (!text) {
        return conn.reply(m.chat, `🍭 Oye, se te olvidó poner el título del video o canción de YouTube.\n\nEjemplo:\n> *${usedPrefix + command}* Billie Eilish - Bellyache`, m);
    }

    let user = global.db.data.users[m.sender];
    try {
        const yt_play = await search(args.join(" "));
        if (!yt_play.length) {
            return conn.reply(m.chat, '💔 ¡Ay caramba! No encontré nada para esa búsqueda. Intenta con otra canción.', m);
        }

        let video = yt_play[0];
        let additionalText = command === 'play' ? '🎶 Aquí tienes tu audio 🎶' : '🎬 Aquí tienes tu video 🎬';

        let txt = `🎉 *YouTube Play* 🎉\n\n`;
        txt += `🍭 *Título:* ${video.title}\n`;
        txt += `📅 *Publicado:* ${video.ago}\n`;
        txt += `🕒 *Duración:* ${video.duration.timestamp}\n`;
        txt += `👤 *Autor:* ${video.author.name}\n`;
        txt += `🔗 *Url:* ${video.url}\n`;
        txt += `\n${additionalText}`;

        // Enviar la información del video
        await conn.sendMessage(m.chat, {
            text: txt,
            contextInfo: {
                externalAdReply: {
                    title: video.title,
                    body: '¡Disfruta de tu contenido!',
                    thumbnailUrl: video.thumbnail,
                    mediaType: 1,
                    showAdAttribution: true,
                    renderLargerThumbnail: true
                }
            }
        }, { quoted: m });

        // Descargar y enviar el audio
        if (command === 'play') {
            try {
                const dl_info = await getAudioDownloadLink(video.url);
                console.log(`🔗 Enlace de descarga del audio: ${dl_info.dl_url}`);  // Log de depuración
                await conn.sendMessage(m.chat, {
                    audio: { url: dl_info.dl_url },
                    mimetype: 'audio/mpeg',
                    contextInfo: {
                        externalAdReply: {
                            title: dl_info.ttl,
                            body: "¡Espero que te guste! 🎧",
                            thumbnailUrl: video.thumbnail,
                            mediaType: 1,
                            showAdAttribution: true,
                            renderLargerThumbnail: true
                        }
                    }
                }, { quoted: m });
            } catch (error) {
                console.error(`Error al descargar el audio: ${error.message}`);
                return conn.reply(m.chat, '💔 ¡Oh no! No pude descargar el audio. Intenta más tarde. 🥲', m);
            }
        }
    } catch (e) {
        console.error(`Error general: ${e.message}`);
        await m.reply('💔 ¡Vaya! Algo salió mal. Intenta de nuevo más tarde. 🤔', m);
    }
};

const getAudioDownloadLink = async (url) => {
    const sources = [
        async () => {
            const yt = await youtubedl(url).catch(async _ => await youtubedlv2(url));
            return { dl_url: yt.audio['128kbps'].download, ttl: yt.title };
        },
        async () => {
            const response = await fetch(`https://api.akuari.my.id/downloader/youtube?link=${url}`);
            const data = await response.json();
            return { dl_url: data.mp3[1].url, ttl: data.title };
        },
        async () => {
            const response = await fetch(`https://api.lolhuman.xyz/api/ytplay?apikey=${lolkeysapi}&query=${url}`);
            const data = await response.json();
            return { dl_url: data.result.audio.link, ttl: data.result.title };
        },
        async () => {
            const response = await fetch(`https://api.lolhuman.xyz/api/ytaudio2?apikey=${lolkeysapi}&url=${url}`);
            const data = await response.json();
            return { dl_url: data.result.link, ttl: data.result.title };
        }
    ];

    for (const source of sources) {
        try {
            const result = await source();
            if (result.dl_url) {
                return result;
            }
        } catch (error) {
            console.error(`Error con la fuente: ${error.message}`);
        }
    }
    throw new Error('No se pudo descargar el audio.');
};

const search = async (query, options = {}) => {
    const searchResults = await yts.search({ query, hl: "es", gl: "ES", ...options });
    return searchResults.videos;
};

const MilesNumber = (number) => {
    const exp = /(\d)(?=(\d{3})+(?!\d))/g;
    const rep = "$1.";
    let arr = number.toString().split(".");
    arr[0] = arr[0].replace(exp, rep);
    return arr[1] ? arr.join(".") : arr[0];
};

const secondString = (seconds) => {
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
};

handler.help = ["play <búsqueda>"];
handler.tags = ["downloader"];
handler.command = ["play", "play2"];
handler.register = true;

export default handler;
