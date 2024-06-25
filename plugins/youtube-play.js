import fetch from "node-fetch";
import yts from "yt-search";
import ytdl from 'ytdl-core';
import { youtubedl, youtubedlv2 } from '@bochilteam/scraper';

let handler = async (m, { conn, command, args, text, usedPrefix }) => {
    if (!text) {
        return conn.reply(m.chat, '🍭 Ingresa el título de un video o canción de YouTube.\n\n`Ejemplo:`\n' + `> *${usedPrefix + command}* Gemini Aaliyah - If Only`, m);
    }

    let user = global.db.data.users[m.sender];
    try {
        const yt_play = await yts(args.join(" "));
        if (!yt_play.videos.length) {
            return conn.reply(m.chat, '💔 No se encontraron resultados para tu búsqueda.', m);
        }
        
        let video = yt_play.videos[0];
        let { title, size, quality, thumbnail, dl_url } = await youtubedl(video.url).catch(async _ => await youtubedlv2(video.url));

        if (size.includes('GB') || parseFloat(size.replace(' MB', '')) > 200) {
            return await m.reply('😱 El archivo pesa más de 200 MB, se canceló la descarga. ¡Qué barbaridad!');
        }

        let txt = `╭─⬣「 *YouTube Play* 」⬣\n`;
        txt += `│  ≡◦ *🍭 Título ∙* ${video.title}\n`;
        txt += `│  ≡◦ *📅 Publicado ∙* ${video.ago}\n`;
        txt += `│  ≡◦ *🕜 Duración ∙* ${video.duration.timestamp}\n`;
        txt += `│  ≡◦ *👤 Autor ∙* ${video.author.name}\n`;
        txt += `│  ≡◦ *⛓ Url ∙* ${video.url}\n`;
        txt += `│  ≡◦ *🪴 Calidad ∙* ${quality}\n`;
        txt += `│  ≡◦ *⚖ Peso ∙* ${size}\n`;
        txt += `╰─⬣`;

        await conn.sendFile(m.chat, video.thumbnail, 'thumbnail.jpg', txt, m);

        // Añadir una pequeña espera para asegurar que el primer mensaje se envía antes de intentar enviar el audio
        await new Promise(resolve => setTimeout(resolve, 1000));

        const dl_audio = await ytdl(video.url, { filter: 'audioonly' });

        await conn.sendFile(m.chat, dl_audio.url, `${video.title}.mp3`, `*🍭 Título ∙* ${video.title}\n*🪴 Calidad ∙* ${quality}`, m, false, { mimetype: 'audio/mpeg', asDocument: user.useDocument });
    } catch (e) {
        console.error(e);
        await m.reply('💔 Ups, algo salió mal. Intenta de nuevo más tarde.');
    }
};

handler.help = ["play <búsqueda>"];
handler.tags = ["downloader"];
handler.command = ["play"];
handler.register = true;

export default handler;
