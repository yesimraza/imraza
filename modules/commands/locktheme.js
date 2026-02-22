const fs = require("fs-extra");
const path = "./modules/commands/cache/data/lockStatus.json";

module.exports.config = {
    name: "locktheme",
    version: "1.0.3",
    hasPermssion: 1,
    credits: "Kashif Raza",
    description: "Lock group theme",
    commandCategory: "Group",
    usages: "[on/off]",
    cooldowns: 5
};

module.exports.onLoad = function () {
    if (!fs.existsSync("./modules/commands/cache/data")) fs.ensureDirSync("./modules/commands/cache/data");
    if (!fs.existsSync(path)) fs.writeJsonSync(path, {});
};

module.exports.handleEvent = async function ({ api, event }) {
    const { threadID, logMessageType, author, logMessageData, type } = event;
    const themeEvents = ["log:thread-color", "log:thread-theme-id", "log:thread-theme", "log:thread-theme-color", "change_thread_color"];
    
    // Debug log to see events
    if (logMessageType || type === "change_thread_color") {
        console.log(`[ DEBUG ] locktheme event: type=${type}, logMessageType=${logMessageType}, author=${author}`);
    }

    if (!themeEvents.includes(logMessageType) && type !== "change_thread_color" && event.type !== "change_thread_color") return;

    try {
        const lockStatus = fs.readJsonSync(path);
        if (lockStatus[threadID] && lockStatus[threadID].theme === true) {
            const botID = api.getCurrentUserID();
            if (String(author) === String(botID)) return;

            const savedTheme = lockStatus[threadID].themeValue;
            if (savedTheme) {
                console.log(`[ LOCK THEME ] Reverting theme change in thread ${threadID} to ${savedTheme}`);
                // Using changeThreadColor which is the standard in this FCA
                if (typeof api.changeThreadColor === "function") {
                    await api.changeThreadColor(savedTheme, threadID);
                } else {
                    console.error("[ LOCK THEME ] api.changeThreadColor is not a function!");
                }
            }
        }
    } catch (e) {
        console.log("Error in locktheme handleEvent:", e);
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
            // threadTheme object often has the ID we need
            const themeID = (threadInfo.threadTheme && threadInfo.threadTheme.id) || threadInfo.threadThemeID || threadInfo.themeID || threadInfo.color || "0";
            
            lockStatus[threadID].theme = true;
            lockStatus[threadID].themeValue = String(themeID);
            fs.writeJsonSync(path, lockStatus);
            
            return api.sendMessage(`『 𝗥𝗮𝘇𝗮 』→ Lock theme enabled! Current theme ID: ${lockStatus[threadID].themeValue}`, threadID, messageID);
        } catch (e) {
            return api.sendMessage(`『 𝗥𝗮𝘇𝗮 』→ Error getting group info: ${e.message}`, threadID, messageID);
        }
    } else if (status === "off") {
        lockStatus[threadID].theme = false;
        fs.writeJsonSync(path, lockStatus);
        return api.sendMessage("『 𝗥𝗮𝘇𝗮 』→ Lock theme disabled!", threadID, messageID);
    } else {
        return api.sendMessage("Usage: locktheme [on/off]", threadID, messageID);
    }
};
