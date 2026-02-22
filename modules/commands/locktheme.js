const fs = require("fs-extra");
const path = "./modules/commands/cache/data/lockStatus.json";

module.exports.config = {
    name: "locktheme",
    version: "1.0.1",
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
    const { threadID, logMessageType, author, logMessageData } = event;
    const validEvents = ["log:thread-color", "log:thread-theme-id", "log:thread-theme", "log:thread-theme-color"];
    if (!validEvents.includes(logMessageType)) return;

    try {
        const lockStatus = fs.readJsonSync(path);
        if (lockStatus[threadID] && lockStatus[threadID].theme === true) {
            const botID = api.getCurrentUserID();
            if (String(author) === String(botID)) return;

            const savedTheme = lockStatus[threadID].themeValue;
            if (savedTheme) {
                api.sendMessage("『 𝗥𝗮𝘇𝗮 』→ Group theme is locked. Reverting change...", threadID);
                
                const callback = (err) => {
                    if (err) console.log("Error reverting theme:", err);
                };

                // Check for both possible function names and use await if needed
                if (typeof api.setThreadColor === "function") {
                    await api.setThreadColor(savedTheme, threadID, callback);
                } else if (typeof api.changeThreadColor === "function") {
                    await api.changeThreadColor(savedTheme, threadID, callback);
                }
            }
        }
    } catch (e) {
        // console.log("Error in locktheme handleEvent:", e);
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
            lockStatus[threadID].theme = true;
            // Correctly capture theme ID or color
            lockStatus[threadID].themeValue = threadInfo.threadThemeID || threadInfo.themeID || threadInfo.color || "002E16";
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
