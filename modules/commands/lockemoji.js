const fs = require("fs-extra");
const path = "./modules/commands/cache/data/lockStatus.json";

module.exports.config = {
    name: "lockemoji",
    version: "1.0.0",
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
    const { threadID, logMessageType, logMessageData } = event;
    if (logMessageType !== "log:thread-icon") return;

    try {
        const lockStatus = fs.readJsonSync(path);
        if (lockStatus[threadID] && lockStatus[threadID].emoji === true) {
            const botID = api.getCurrentUserID();
            if (event.author === botID) return;

            const savedEmoji = lockStatus[threadID].emojiValue;
            if (savedEmoji) {
                api.sendMessage("『 𝗥𝗮𝘇𝗮 』→ Group emoji is locked. Reverting change...", threadID);
                return api.setThreadEmoji(savedEmoji, threadID);
            }
        }
    } catch (e) {
        console.log("Error in lockemoji handleEvent:", e);
    }
};

module.exports.run = async function ({ api, event, args }) {
    const { threadID, messageID } = event;
    if (!fs.existsSync(path)) fs.writeJsonSync(path, {});
    const lockStatus = fs.readJsonSync(path);
    if (!lockStatus[threadID]) lockStatus[threadID] = {};
    
    const status = args[0]?.toLowerCase();
    if (status === "on") {
        const threadInfo = await api.getThreadInfo(threadID);
        lockStatus[threadID].emoji = true;
        lockStatus[threadID].emojiValue = threadInfo.emoji || threadInfo.threadEmoji || "👍";
        fs.writeJsonSync(path, lockStatus);
        
        return api.sendMessage(`『 𝗥𝗮𝘇𝗮 』→ Lock emoji enabled! Current emoji: ${lockStatus[threadID].emojiValue}`, threadID, messageID);
    } else if (status === "off") {
        lockStatus[threadID].emoji = false;
        fs.writeJsonSync(path, lockStatus);
        return api.sendMessage("『 𝗥𝗮𝘇𝗮 』→ Lock emoji disabled!", threadID, messageID);
    } else {
        return api.sendMessage("Usage: lockemoji [on/off]", threadID, messageID);
    }
};
