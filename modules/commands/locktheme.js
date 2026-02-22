module.exports.config = {
    name: "locktheme",
    version: "1.0.0",
    hasPermssion: 1,
    credits: "Kashif Raza",
    description: "Lock group theme",
    commandCategory: "Group",
    usages: "[on/off]",
    cooldowns: 5
};

const fs = require("fs-extra");
const path = "./modules/commands/cache/data/lockStatus.json";

module.exports.onLoad = function () {
    if (!fs.existsSync("./modules/commands/cache/data")) fs.ensureDirSync("./modules/commands/cache/data");
    if (!fs.existsSync(path)) fs.writeJsonSync(path, {});
};

module.exports.run = async function ({ api, event, args }) {
    const { threadID, messageID } = event;
    const lockStatus = fs.readJsonSync(path);
    if (!lockStatus[threadID]) lockStatus[threadID] = {};
    
    const status = args[0]?.toLowerCase();
    if (status === "on") {
        const threadInfo = await api.getThreadInfo(threadID);
        lockStatus[threadID].theme = true;
        lockStatus[threadID].themeValue = threadInfo.threadThemeID || threadInfo.themeID || "default";
        fs.writeJsonSync(path, lockStatus);
        
        // Ensure the event handler is aware of the change
        try {
            delete require.cache[require.resolve("../../modules/events/lockThemeEvent.js")];
        } catch (e) {}
        
        return api.sendMessage(`Lock theme enabled! Current theme ID: ${lockStatus[threadID].themeValue}`, threadID, messageID);
    } else if (status === "off") {
        lockStatus[threadID].theme = false;
        fs.writeJsonSync(path, lockStatus);
        return api.sendMessage("Lock theme disabled!", threadID, messageID);
    } else {
        return api.sendMessage("Usage: locktheme [on/off]", threadID, messageID);
    }
};
