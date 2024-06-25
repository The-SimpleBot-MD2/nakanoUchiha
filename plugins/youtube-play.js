import Scraper from '@SumiFX/Scraper';

let handler = async (m, { conn, text, args, usedPrefix, command }) => {
    if (!text) {
        return conn.reply(m.chat, '🍭 Ingresa el título de un video o canción de YouTube.\n\n`Ejemplo:`\n' + `> *${usedPrefix + command}* Gemini Aaliyah - If Only`, m);
    }

    let user = global.db.data.users[m.sender];
    try {
        let res = await Scraper.ytsearch(text);
        if (!res.length) {
            return conn.reply(m.chat, '💔 No se encontraron resultados para tu búsqueda.', m);
        }
        
        let { title, size, quality, thumbnail, dl_url } = await Scraper.ytmp3(res[0].url);

        if (size.includes('GB') || parseFloat(size.replace(' MB', '')) > 200) {
            return await m.reply('😱 El archivo pesa más de 200 MB, se canceló la descarga. ¡Qué barbaridad!');
        }

        let txt = `╭─⬣「 *YouTube Play* 」⬣\n`;
        txt += `│  ≡◦ *🍭 Título ∙* ${title}\n`;
        txt += `│  ≡◦ *📅 Publicado ∙* ${res[0].published}\n`;
        txt += `│  ≡◦ *🕜 Duración ∙* ${res[0].duration}\n`;
        txt += `│  ≡◦ *👤 Autor ∙* ${res[0].author}\n`;
        txt += `│  ≡◦ *⛓ Url ∙* ${res[0].url}\n`;
        txt += `│  ≡◦ *🪴 Calidad ∙* ${quality}\n`;
        txt += `│  ≡◦ *⚖ Peso ∙* ${size}\n`;
        txt += `╰─⬣`;
        
        await conn.sendFile(m.chat, thumbnail, 'thumbnail.jpg', txt, m);
        await conn.sendFile(m.chat, dl_url, title + '.mp3', `*🍭 Título ∙* ${title}\n*🪴 Calidad ∙* ${quality}`, m, false, { mimetype: 'audio/mpeg', asDocument: user.useDocument });
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
