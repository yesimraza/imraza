module.exports.config = {
    name: 'removebg',
    version: '1.1.1',
    hasPermssion: 0,
    credits: '𝐊𝐀𝐒𝐇𝐈𝐅 𝐑𝐀𝐙𝐀',
    description: 'Remove background from images',
    commandCategory: 'Utility',
    usages: 'Reply to an image or provide image URL',
    cooldowns: 2,
    timezone: "Asia/Karachi",
    dependencies: {
         'form-data': '',
         'image-downloader': ''
    }
};

const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs-extra');
const path = require('path');
const { image } = require('image-downloader');

module.exports.run = async function({ api, event, args }) {
    try {
        let successMsg = `≿━━━━༺❀༻━━━━≾\n\n🖼️ Background removed successfully!\n\n≿━━━━༺❀༻━━━━≾`;

        let imageUrl;
        if (event.type === "message_reply") {
            if (event.messageReply.attachments && event.messageReply.attachments.length > 0 && event.messageReply.attachments[0].type === "photo") {
                imageUrl = event.messageReply.attachments[0].url;
            }
        } else if (args[0] && args[0].startsWith("http")) {
            imageUrl = args[0];
        }

        if (!imageUrl) return api.sendMessage("⚠️ Please reply to an image or provide an image URL", event.threadID, event.messageID);

        api.sendMessage("⏳ Removing background... please wait.", event.threadID, event.messageID);

        const res = await axios.get(`https://api.kraza.qzz.io/imagecreator/removebg?url=${encodeURIComponent(imageUrl)}`);
        
        if (!res.data.status || !res.data.result) return api.sendMessage("❌ Failed to remove background.", event.threadID, event.messageID);

        const resultUrl = res.data.result;
        const cacheDir = path.resolve(__dirname, 'cache');
        if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir);
        const inputPath = path.resolve(cacheDir, `removebg_${Date.now()}.png`);
        
        const imageRes = await axios.get(resultUrl, { responseType: 'arraybuffer' });
        fs.writeFileSync(inputPath, Buffer.from(imageRes.data));

        return api.sendMessage(
            { body: successMsg, attachment: fs.createReadStream(inputPath) }, 
            event.threadID, 
            () => { if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath); },
            event.messageID
        );
    } catch (e) {
        console.log(e);
        return api.sendMessage("❌ An error occurred.", event.threadID, event.messageID);
    }
};