module.exports.config = {
  name: "pair",
  version: "1.0.1",
  hasPermssion: 0,
  credits: "RAZA",
  description: "Pairing",
  category: "group",
  prefix: true,
  premium: false,
  usages: "pair",
  cooldowns: 10,
  dependencies: {
      "axios": "",
      "fs-extra": ""
  }
};

module.exports.run = async function({ api, event, Users }) {
      const axios = require("axios");
      const fs = require("fs-extra");
      const { threadID, messageID, senderID, participantIDs } = event;

      const botID = api.getCurrentUserID();
      const listUserID = participantIDs.filter(ID => ID != botID && ID != senderID);
      if (listUserID.length == 0) return api.sendMessage("Not enough members to pair!", threadID, messageID);
      
      const id = listUserID[Math.floor(Math.random() * listUserID.length)];
      
      const namee = (await Users.getData(senderID)).name;
      const name = (await Users.getData(id)).name;
      
      const tle = Math.floor(Math.random() * 101);
      
      const arraytag = [
          {id: senderID, tag: namee},
          {id: id, tag: name}
      ];

      const gifCute = ["https://i.pinimg.com/originals/42/9a/89/429a890a39e70d522d52c7e52bce8535.gif","https://i.pinimg.com/originals/9c/94/78/9c9478bb26b2160733ce0c10a0e10d10.gif","https://i.pinimg.com/originals/9d/0d/38/9d0d38c79b9fcf05f3ed71697039d27a.gif"];

      try {
          let Avatar = (await axios.get( `https://graph.facebook.com/${senderID}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`, { responseType: "arraybuffer" } )).data; 
          fs.writeFileSync( __dirname + "/cache/avt.png", Buffer.from(Avatar, "utf-8") );

          let gifLove = (await axios.get(gifCute[Math.floor(Math.random() * gifCute.length)], { responseType: "arraybuffer" } )).data; 
          fs.writeFileSync( __dirname + "/cache/giflove.png", Buffer.from(gifLove, "utf-8") );

          let Avatar2 = (await axios.get( `https://graph.facebook.com/${id}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`, { responseType: "arraybuffer" } )).data;
          fs.writeFileSync( __dirname + "/cache/avt2.png", Buffer.from(Avatar2, "utf-8") );

          const imglove = [
              fs.createReadStream(__dirname + "/cache/avt.png"),
              fs.createReadStream(__dirname + "/cache/giflove.png"),
              fs.createReadStream(__dirname + "/cache/avt2.png")
          ];

          var msg = {body: `☆ 𝐌𝐞𝐊𝐨 𝐘𝐞 𝐁𝐞𝐬𝐓 𝐋𝐚𝐠𝐓𝐚 𝐇𝐚𝐢 ☆‎\n\n●●●━━━━━◥💜◤━━━━━●●●\n ✦${namee} 💓 ${name}✦\n●●●━━━━━◥💜◤━━━━━●●●\n\n➺ 💜: 〘 ${tle}% 〙 🙈🙉🙊 ❥||ㅎ\n`, mentions: arraytag, attachment: imglove}
          return api.sendMessage(msg, threadID, () => {
              fs.unlinkSync(__dirname + "/cache/avt.png");
              fs.unlinkSync(__dirname + "/cache/giflove.png");
              fs.unlinkSync(__dirname + "/cache/avt2.png");
          }, messageID);
      } catch (e) {
          return api.sendMessage("Error: " + e.message, threadID, messageID);
      }
}