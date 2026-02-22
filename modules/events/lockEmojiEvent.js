module.exports.config = {
    name: "lockEmojiEvent",
    eventType: ["log:thread-icon"],
    version: "1.0.0",
    credits: "Kashif Raza",
    description: "Revert emoji change"
};

const fs = require("fs-extra");
const path = "./modules/commands/cache/data/lockStatus.json";

module.exports.run = async function ({ api, event }) {
    const { threadID, author, logMessageType, type } = event;
    if (author == api.getCurrentUserID()) return;
    if (logMessageType !== "log:thread-icon" && type !== "change_thread_icon") return;
    if (!fs.existsSync(path)) return;
    const lockStatus = fs.readJsonSync(path);
    const settings = lockStatus[threadID];
    if (settings && settings.emoji) {
        api.setEmoji(settings.emojiValue, threadID);
    }
};
