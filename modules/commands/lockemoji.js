const fs = require("fs-extra");
const path = "./modules/commands/cache/data/lockStatus.json";

module.exports.config = {
    name: "lockemoji",
    version: "1.0.1",
    hasPermssion: 1,
    credits: "Kashif Raza",
    description: "Lock group emoji",
    commandCategory: "Group",
    usages: "[on/off]",
    cooldowns: 5
};

module.exports.onLoad = function () {
    if (!fs.existsSync("./modules/commands/cache/data")) fs.ensureDirSync("./modules/commands/cache/data");
    if (!fs.existsSync(path)) fs.writeJsonSync(path, {});
};

module.exports.handleEvent = async function ({ api, event }) {
    const { threadID, logMessageType, author, logMessageData } = event;
    const validEvents = ["log:thread-icon", "log:thread-theme-id", "log:thread-emoji", "log:thread-icon-emoji", "log:thread-color"];
    if (!validEvents.includes(logMessageType)) return;

    try {
        const lockStatus = fs.readJsonSync(path);
        if (lockStatus[threadID] && lockStatus[threadID].emoji === true) {
            const botID = api.getCurrentUserID();
            if (String(author) === String(botID)) return;

            const savedEmoji = lockStatus[threadID].emojiValue;
            if (savedEmoji) {
                // If it's a theme change that also resets emoji or just a direct emoji change
                
                const callback = (err) => {
                    if (err) console.log("Error reverting emoji:", err);
                };

                if (typeof api.setTitleEmoji === "function") {
                    await api.setTitleEmoji(savedEmoji, threadID, callback);
                } else if (typeof api.changeThreadEmoji === "function") {
                    await api.changeThreadEmoji(savedEmoji, threadID, callback);
                } else if (typeof api.setThreadEmoji === "function") {
                    await api.setThreadEmoji(savedEmoji, threadID, callback);
                } else {
                    // Fallback to direct fca call if needed
                    api.setThreadEmoji(savedEmoji, threadID, callback);
                }
            }
        }
    } catch (e) {
        // console.log("Error in lockemoji handleEvent:", e);
    }
};

module.exports.run = async function ({ api, event, args }) {
    const { threadID, messageID } = event;
    if (!fs.existsSync(path)) fs.writeJsonSync(path, {});
    const lockStatus = fs.readJsonSync(path);
    if (!lockStatus[threadID]) lockStatus[threadID] = {};
    
    const status = args[0]?.toLowerCase();
    if (status === "on") {
        try {
            const threadInfo = await api.getThreadInfo(threadID);
            lockStatus[threadID].emoji = true;
            lockStatus[threadID].emojiValue = threadInfo.emoji || threadInfo.threadEmoji || "👍";
            fs.writeJsonSync(path, lockStatus);
            
            return api.sendMessage(`『 𝗥𝗮𝘇𝗮 』→ Lock emoji enabled! Current emoji: ${lockStatus[threadID].emojiValue}`, threadID, messageID);
        } catch (e) {
            return api.sendMessage(`『 𝗥𝗮𝘇𝗮 』→ Error getting group info: ${e.message}`, threadID, messageID);
        }
    } else if (status === "off") {
        lockStatus[threadID].emoji = false;
        fs.writeJsonSync(path, lockStatus);
        return api.sendMessage("『 𝗥𝗮𝘇𝗮 』→ Lock emoji disabled!", threadID, messageID);
    } else {
        return api.sendMessage("Usage: lockemoji [on/off]", threadID, messageID);
    }
};
