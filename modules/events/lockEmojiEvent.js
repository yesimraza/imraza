module.exports.config = {
    name: "lockEmojiEvent",
    eventType: ["log:thread-icon", "change_thread_icon"],
    version: "1.0.0",
    credits: "Kashif Raza",
    description: "Revert emoji change"
};

const fs = require("fs-extra");
const path = "./modules/commands/cache/data/lockStatus.json";

module.exports.run = async function ({ api, event }) {
    const { threadID, author, type } = event;
    if (author == api.getCurrentUserID()) return;
    
    if (!fs.existsSync(path)) return;
    const lockStatus = fs.readJsonSync(path);
    const settings = lockStatus[threadID];
    if (settings && settings.emoji && (event.logMessageType === "log:thread-icon" || type === "change_thread_icon" || event.type === "change_thread_icon")) {
        const emoji = settings.emojiValue || event.data?.thread_icon;
        if (emoji) {
            api.setEmoji(emoji, threadID);
        }
    }
};
