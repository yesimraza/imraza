module.exports.config = {
    name: "lockname",
    version: "1.0.0",
    hasPermssion: 1,
    credits: "Kashif Raza",
    description: "Lock group name",
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
        lockStatus[threadID].name = true;
        lockStatus[threadID].nameValue = threadInfo.threadName || threadInfo.name;
        fs.writeJsonSync(path, lockStatus);
        return api.sendMessage(`Lock name enabled!\nCurrent name: ${lockStatus[threadID].nameValue}`, threadID, messageID);
    } else if (status === "off") {
        lockStatus[threadID].name = false;
        fs.writeJsonSync(path, lockStatus);
        return api.sendMessage("Lock name disabled!", threadID, messageID);
    } else {
        return api.sendMessage("Usage: lockname [on/off]", threadID, messageID);
    }
};
