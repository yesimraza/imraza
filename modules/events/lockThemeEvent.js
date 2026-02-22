module.exports.config = {
    name: "lockThemeEvent",
    eventType: ["log:thread-color", "change_thread_color"],
    version: "1.0.0",
    credits: "Kashif Raza",
    description: "Revert theme change"
};

const fs = require("fs-extra");
const path = "./modules/commands/cache/data/lockStatus.json";

module.exports.run = async function ({ api, event }) {
    const { threadID, author, type } = event;
    if (author == api.getCurrentUserID()) return;
    
    if (!fs.existsSync(path)) return;
    const lockStatus = fs.readJsonSync(path);
    const settings = lockStatus[threadID];
    
    // Check for theme change event
    if (settings && settings.theme && (event.logMessageType === "log:thread-color" || type === "change_thread_color" || event.type === "change_thread_color")) {
        console.log(`[ LOCK THEME ] Reverting theme change in thread ${threadID} to ${settings.themeValue}`);
        if (settings.themeValue) {
            const callback = (err) => {
                if (err) console.error(`[ LOCK THEME ] Error setting thread color:`, err);
            };
            
            // Aggressive restore using multiple known methods
            if (typeof api.setThreadColor === "function") {
                api.setThreadColor(settings.themeValue, threadID, callback);
            }
            if (typeof api.changeThreadColor === "function") {
                api.changeThreadColor(settings.themeValue, threadID, callback);
            }
            
            // Also restore emoji if it was affected by theme change
            if (settings.emoji && settings.emojiValue) {
                if (typeof api.setThreadEmoji === "function") {
                    api.setThreadEmoji(settings.emojiValue, threadID, callback);
                }
                if (typeof api.setTitleEmoji === "function") {
                    api.setTitleEmoji(settings.emojiValue, threadID, callback);
                }
            }
        }
    }
};
