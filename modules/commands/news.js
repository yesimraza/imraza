const jimp = require('jimp');
const request = require('node-superfetch');
const fs = require('fs-extra');

module.exports.config = {
    name: "news",
    version: "1.0.1",
    permission: 0,
    prefix: true,
    premium: false,
    category: "group",
    credits: "RAZA",
    description: "Funny News",
    usages: "rank",
    cooldowns: 5,
    dependencies: {
        "fs-extra": "",
        "axios": "",
        "canvas": "",
        "jimp": "",
        "node-superfetch": ""
    }
};

module.exports.run = async ({ event, api, args, Users }) => {
    try {
        const id = Object.keys(event.mentions)[0] || event.senderID;
        const path_toilet = __dirname + '/cache/toilet.png';

        const bg = await jimp.read('https://i.ibb.co/xsRjhY1/20250113-025520.png');

        const { body: avatarBuffer } = await request.get(`https://graph.facebook.com/${id}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`);
        let avatar = await jimp.read(avatarBuffer);
        avatar.resize(470, 477);

        bg.composite(avatar, 0, 107);

        await bg.writeAsync(path_toilet);
        api.sendMessage({ attachment: fs.createReadStream(path_toilet), body: "" }, event.threadID, () => fs.unlinkSync(path_toilet), event.messageID);
    } catch (e) {
        api.sendMessage(e.stack, event.threadID);
    }
};