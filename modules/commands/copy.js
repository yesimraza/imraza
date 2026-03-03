const fs = require("fs-extra");
const path = require("path");
const axios = require("axios");

const dataFolder = path.join(__dirname, "cache", "data");

const getUserJsonPath = (userID) => {
  return path.join(dataFolder, `copiedMessage_${userID}.json`);
};

const scheduleCacheCleanup = (userID, filePaths) => {
  setTimeout(() => {
    try {
      const userJsonPath = getUserJsonPath(userID);
      
      if (fs.existsSync(userJsonPath)) {
        const data = JSON.parse(fs.readFileSync(userJsonPath, 'utf-8'));
        
        data.attachments.forEach(attPath => {
          if (fs.existsSync(attPath)) {
            fs.unlinkSync(attPath);
          }
        });
        
        fs.unlinkSync(userJsonPath);
      }
    } catch (error) {
      console.error(`❌ Cache cleanup error for user ${userID}:`, error);
    }
  }, 3600000); 
};

module.exports.config = {
  name: "copy",
  version: "1.0.1",
  hasPermssion: 0,
  credits: "RAZA",
  description: "📋 Copy a message (text + media) and save it",
  commandCategory: "Utility",
  usages: "Reply to a message to copy it",
  cooldowns: 2,
  prefix: true,
  premium: false
};

module.exports.run = async function ({ api, event }) {
  const { messageReply, threadID, senderID } = event;
  const userJsonPath = getUserJsonPath(senderID);

  if (!messageReply) {
    return api.sendMessage("⚠️ | Please reply to a message to copy it.", threadID);
  }

  const { body, attachments } = messageReply;

  if (!fs.existsSync(dataFolder)) fs.mkdirSync(dataFolder, { recursive: true });

  let savedData = {
    body: body || '',
    attachments: []
  };

  const downloadPromises = attachments.map(async (att, index) => {
    const ext = att.type === "photo" ? ".jpg" :
                att.type === "video" ? ".mp4" :
                att.type === "audio" ? ".mp3" : "";
    const filename = `copied_${senderID}_${Date.now()}_${index}${ext}`;
    const filePath = path.join(dataFolder, filename);

    const response = await axios.get(att.url, { responseType: "stream" });
    const writer = fs.createWriteStream(filePath);
    response.data.pipe(writer);

    await new Promise((resolve, reject) => {
      writer.on("finish", resolve);
      writer.on("error", reject);
    });

    savedData.attachments.push(filePath);
  });

  await Promise.all(downloadPromises);

  savedData.timestamp = Date.now();
  savedData.userID = senderID;
  
  fs.writeFileSync(userJsonPath, JSON.stringify(savedData, null, 2));
  
  scheduleCacheCleanup(senderID, savedData.attachments);

  return api.sendMessage("✅ | Message copied and saved successfully! (Auto-delete in 1 hour)", threadID);
};