module.exports.config = {
    name: "lockEmojiEvent",
    eventType: ["log:thread-icon", "change_thread_icon", "log:thread-emoji", "log:thread-icon-emoji"],
    version: "1.0.1",
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
    
    // Check for emoji change event
    if (settings && settings.emoji && (event.logMessageType === "log:thread-icon" || event.logMessageType === "log:thread-emoji" || type === "change_thread_icon" || event.type === "change_thread_icon")) {
        console.log(`[ LOCK EMOJI ] Reverting emoji change in thread ${threadID} to ${settings.emojiValue}`);
        if (settings.emojiValue) {
            const callback = (err) => {
                if (err) console.error(`[ LOCK EMOJI ] Error setting emoji:`, err);
            };
            if (typeof api.setThreadEmoji === "function") api.setThreadEmoji(settings.emojiValue, threadID, callback);
            if (typeof api.changeThreadEmoji === "function") api.changeThreadEmoji(settings.emojiValue, threadID, callback);
            if (typeof api.setTitleEmoji === "function") api.setTitleEmoji(settings.emojiValue, threadID, callback);
        }
    }
};
