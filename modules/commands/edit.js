const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');
const imgur = require("imgur");
const { downloadFile } = require("./../../utils/index");

module.exports.config = {
  name: "edit",
  version: "2.0.0",
  hasPermssion: 0,
  credits: "Raza Engineering",
  description: "AI Image Editor - Modify images with a prompt",
  commandCategory: "AI Tools",
  usages: "reply to an image with: edit [prompt]",
  cooldowns: 10
};

const IMGUR_CLIENT_ID = "c76eb7edd1459f3";

module.exports.run = async function ({ api, event, args }) {
  const { threadID, messageID, type, messageReply } = event;
  const prompt = args.join(" ").trim();

  if (!prompt) {
    return api.sendMessage("❌ Please provide a prompt.\nExample: reply to an image with '.edit change color to white'", threadID, messageID);
  }

  if (type !== "message_reply" || !messageReply.attachments || messageReply.attachments.length == 0 || messageReply.attachments[0].type !== "photo") {
    return api.sendMessage("❌ Please reply to an image with '.edit <prompt>'", threadID, messageID);
  }

  try {
    api.sendMessage("🎨 Editing your image... please wait a moment. ✨", threadID, messageID);

    // Ensure cache directory exists
    const cacheDir = path.join(__dirname, "cache");
    if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir);

    const attachment = messageReply.attachments[0];
    const tempPath = path.join(cacheDir, `edit_${Date.now()}.jpg`);
    
    // Download image
    await downloadFile(attachment.url, tempPath);

    // Upload to Imgur
    imgur.setClientId(IMGUR_CLIENT_ID);
    const upload = await imgur.uploadFile(tempPath);
    const imageUrl = upload.link;

    // Clean up temp file
    if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);

    if (!imageUrl) throw new Error("Image upload to Imgur failed.");

    // Call Nano-Banana AI API
    const apiUrl = `https://nano-bnana.fak-official.workers.dev/image?prompt=${encodeURIComponent(prompt)}&imageUrl=${encodeURIComponent(imageUrl)}`;

    const response = await axios.get(apiUrl, {
      responseType: 'arraybuffer',
      timeout: 120000 // 2 minutes
    });

    if (!response.data) throw new Error("AI API returned no data.");

    const editedPath = path.join(cacheDir, `edited_${Date.now()}.jpg`);
    await fs.writeFile(editedPath, Buffer.from(response.data));

    return api.sendMessage({
      body: `✨ **Image edited successfully!**\n\n📝 **Prompt:** ${prompt}\n🎨 **Powered by Nano-Banana AI**`,
      attachment: fs.createReadStream(editedPath)
    }, threadID, () => {
        if (fs.existsSync(editedPath)) fs.unlinkSync(editedPath);
    }, messageID);

  } catch (error) {
    console.error("Edit Command Error:", error);
    let errorMessage = "❌ Failed to edit image.";
    if (error.code === 'ECONNABORTED') errorMessage += "\n\n⏳ Request timeout (API slow).";
    else errorMessage += `\n\n📌 Error: ${error.message}`;
    
    return api.sendMessage(errorMessage, threadID, messageID);
  }
};