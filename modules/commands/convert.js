module.exports.config = {
  name: "convert",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "RAZA",
  description: "Convert video (mp4) to audio (mp3)",
  category: "Utility",
  usages: "[reply to a video or provide URL]",
  cooldowns: 5,
  prefix: true,
  premium: false
};

module.exports.run = async function ({ api, args, event }) {
  const axios = require("axios");
  const fs = require("fs-extra");
  const path = __dirname + "/cache/video_to_audio.mp3";

  try {
      let url;

      if (args[0]) {
          url = args[0];
      } else if (event.messageReply?.attachments[0]?.type === "video") {
          url = event.messageReply.attachments[0].url;
      } else {
          return api.sendMessage("❌ Please reply to a video or provide a valid video URL.", event.threadID, event.messageID);
      }

      const response = await axios.get(url, { responseType: "arraybuffer" });
      fs.writeFileSync(path, Buffer.from(response.data, "utf-8"));

      const msg = {
          body: "✅ Successfully converted video to audio (MP3)!",
          attachment: fs.createReadStream(path)
      };

      api.sendMessage(msg, event.threadID, () => fs.unlinkSync(path), event.messageID);

  } catch (error) {
      console.error("CONVERT ERROR:", error);
      return api.sendMessage("❌ An error occurred during conversion. Please try again.", event.threadID, event.messageID);
  }
};