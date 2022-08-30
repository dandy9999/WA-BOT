const { Client, LocalAuth, MessageMedia  } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const mime = require('mime-types');
const fs = require('fs');

const client = new Client({
    authStrategy: new LocalAuth(),
	puppeteer: {
		args: ['--no-sandbox'],
	}
});
 

client.on('qr', qr => {
    qrcode.generate(qr, {small: true});
});

client.on('ready', () => {
    console.log('Client is ready!');
});

client.on('message', async msg => {
    let chat = await msg.getChat();
    //console.log(chat);
    chat.sendSeen();


    //cmd
    if(msg.body === '-cmd') {
		client.sendMessage(msg.from, `*Perintah Umum*` + "\n" +
                                     `*-sticker* untuk mengkonversi gambar ke stiker` + "\n" + 
                                     `*-cmd* untuk menampilkan pesan ini` + "\n" +
                                     `*Perintah Grup*` + "\n" +
                                     `*-everyone* mention semua orang dalam grup` + "\n" +
                                     `*-infogrup* menampilkan informasi grup`);
	}

    //sticker command
    else if(msg.body === '-sticker'){
        if(msg.hasMedia){
            msg.downloadMedia().then(media => {
                if (media) {
                    const mediaPath = './downloaded-media/';
                    if (!fs.existsSync(mediaPath)) {
                        fs.mkdirSync(mediaPath);
                    }
                    const extension = mime.extension(media.mimetype);
                
                    const filename = new Date().getTime();
                
                    const fullFilename = mediaPath + filename + '.' + extension;
                
                    // Save to file
                    try {
                        fs.writeFileSync(fullFilename, media.data, { encoding: 'base64' });
                        console.log('File downloaded successfully!', fullFilename);
                        console.log(fullFilename);
                        MessageMedia.fromFilePath(filePath = fullFilename);
                        client.sendMessage(msg.from, new MessageMedia(media.mimetype, media.data, filename), { sendMediaAsSticker: true,stickerAuthor:"Dibuat dengan cinta",stickerName:"Stickers"} );
                        fs.unlinkSync(fullFilename);
                        console.log(`File Deleted successfully!`,);
                    } 
                        catch (err) {
                            console.log('Failed to save the file:', err);
                            console.log(`File Deleted successfully!`,);
                    }
                }
            });
        }
        else {
            msg.reply(`kirim gambar dengan caption *-sticker* `);
        }
    }

    //tag everyone
    else if(msg.body === '-everyone') {
        if (!chat.isGroup){
            return msg.reply(`gunakan *-everyone* hanya saat didalam grup chat!`);
        }
        
        let text = "";
        let mentions = [];

        for(let participant of chat.participants) {
            const contact = await client.getContactById(participant.id._serialized);
            
            mentions.push(contact);
            text += `@${participant.id.user} `;
        }

        await chat.sendMessage(text, { mentions });
    }

    //group info
    else if (msg.body === '-infogrup') {
        if (chat.isGroup) {
            msg.reply(`*Info Grup*`+"\n\n"+
            `Nama Grup: ${chat.name}`+"\n"+
            `Deskripsi: ${chat.description}`+"\n"+
            `Tgl Dibuat: ${chat.createdAt.toString()}`+"\n"+
            `Dibuat Oleh: ${chat.owner.user}`+"\n"+
            `Jumlah Member: ${chat.participants.length}`);
        } else {
            msg.reply('gunakan *-infogrup* hanya saat didalam grup chat!');
        }
    }

});

client.initialize();