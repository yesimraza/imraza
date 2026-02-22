const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
  name: "picsearch",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "Raza",
  description: "Search for images on Google",
  commandCategory: "Search",
  usages: "picsearch [query]",
  cooldowns: 10
};

module.exports.run = async function ({ api, event, args }) {
  const query = args.join(" ");
  if (!query) return api.sendMessage("❌ Please provide a search query.", event.threadID, event.messageID);

  try {
    api.sendMessage(`🔍 Searching for ${query}...`, event.threadID, event.messageID);

    const res = await axios.get(`https://api.kraza.qzz.io/search/gimage?q=${encodeURIComponent(query)}`);

    if (!res.data.status || !res.data.result || res.data.result.length === 0) 
      return api.sendMessage("❌ No results found.", event.threadID, event.messageID);

    const results = res.data.result.slice(0, 15);
    const attachments = [];
    const cacheDir = path.join(__dirname, "cache");
    if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir);

    for (let i = 0; i < results.length; i++) {
      try {
        const imgRes = await axios.get(results[i].url, { responseType: 'arraybuffer', timeout: 5000 });
        const imgPath = path.join(cacheDir, `picsearch_${Date.now()}_${i}.jpg`);
        fs.writeFileSync(imgPath, Buffer.from(imgRes.data));
        attachments.push(fs.createReadStream(imgPath));
      } catch (e) {
        console.log(`Failed to download image ${i}: ${e.message}`);
      }
    }

    if (attachments.length === 0) return api.sendMessage("❌ Failed to download any images.", event.threadID, event.messageID);

    return api.sendMessage({
      body: `📸 Google Image Search Results for: ${query}`,
      attachment: attachments
    }, event.threadID, () => {
        // Cleanup would ideally happen after sending, but fca handles streams. 
        // For simplicity in this context, we'll let them sit in cache or add a better cleanup later.
    }, event.messageID);

  } catch (error) {
    console.error(error);
    return api.sendMessage("❌ An error occurred.", event.threadID, event.messageID);
  }
};
