const fs = require("fs-extra");
const axios = require("axios");
const jimp = require("jimp");
const path = require("path");

module.exports.config = {
    name: "pair2",
    version: "1.0.1",
    hasPermssion: 0,
    credits: "RAZA",
    description: "fun",
    category: "fun",
    prefix: true,
    premium: false,
    cooldowns: 5,
    dependencies: {
        "axios": "",
        "fs-extra": "",
        "jimp": ""
    }
}

async function circle(image) {
    image = await jimp.read(image);
    image.circle();
    return await image.getBufferAsync(jimp.MIME_PNG);
}

async function makeImage({ one, two }) {
    const __root = path.join(__dirname, "cache", "canvas");
    if (!fs.existsSync(__root)) fs.mkdirSync(__root, { recursive: true });

    const backgroundPath = path.join(__root, "pairing.png");
    if (!fs.existsSync(backgroundPath)) {
        const response = await axios.get("https://i.postimg.cc/X7R3CLmb/267378493-3075346446127866-4722502659615516429-n.png", { responseType: "arraybuffer" });
        fs.writeFileSync(backgroundPath, Buffer.from(response.data));
    }

    let pairing_img = await jimp.read(backgroundPath);
    let pathImg = path.join(__root, `pairing_${one}_${two}.png`);
    let avatarOne = path.join(__root, `avt_${one}.png`);
    let avatarTwo = path.join(__root, `avt_${two}.png`);

    let getAvatarOne = (await axios.get(`https://graph.facebook.com/${one}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`, { responseType: 'arraybuffer' })).data;
    fs.writeFileSync(avatarOne, Buffer.from(getAvatarOne));

    let getAvatarTwo = (await axios.get(`https://graph.facebook.com/${two}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`, { responseType: 'arraybuffer' })).data;
    fs.writeFileSync(avatarTwo, Buffer.from(getAvatarTwo));

    let circleOne = await jimp.read(await circle(avatarOne));
    let circleTwo = await jimp.read(await circle(avatarTwo));
    
    pairing_img.composite(circleOne.resize(150, 150), 980, 200).composite(circleTwo.resize(150, 150), 140, 200);

    await pairing_img.writeAsync(pathImg);
    
    fs.unlinkSync(avatarOne);
    fs.unlinkSync(avatarTwo);

    return pathImg;
}

module.exports.run = async function({ api, event, args, Users }) {
    const { threadID, messageID, senderID, participantIDs } = event;
    var tl = ['21%', '67%', '19%', '37%', '17%', '96%', '52%', '62%', '76%', '83%', '100%', '99%', "0%", "48%"];
    var tle = tl[Math.floor(Math.random() * tl.length)];
    
    const botID = api.getCurrentUserID();
    const listUserID = participantIDs.filter(ID => ID != botID && ID != senderID);
    if (listUserID.length == 0) return api.sendMessage("Not enough members!", threadID, messageID);
    
    const id = listUserID[Math.floor(Math.random() * listUserID.length)];
    
    const userData1 = await Users.getData(senderID);
    const userData2 = await Users.getData(id);
    const namee = userData1.name;
    const name = userData2.name;

    var arraytag = [
        {id: senderID, tag: namee},
        {id: id, tag: name}
    ];

    try {
        const imgPath = await makeImage({ one: senderID, two: id });
        return api.sendMessage({ 
            body: `☆ 𝐌𝐞𝐊𝐨 𝐘𝐞 𝐁𝐞𝐬𝐓 𝐋𝐚𝐠𝐓𝐚 𝐇𝐚𝐢 ☆‎\n\n●●●━━━━━◥💜◤━━━━━●●●\n ✦${namee} 💓 ${name}✦\n●●●━━━━━◥💜◤━━━━━●●●\n\n➺ 💜: 　 ${tle} 🙈🙉🙊 ❥||ㅎ\n`, 
            mentions: arraytag, 
            attachment: fs.createReadStream(imgPath) 
        }, threadID, () => fs.unlinkSync(imgPath), messageID);
    } catch (e) {
        return api.sendMessage("Error: " + e.message, threadID, messageID);
    }
}