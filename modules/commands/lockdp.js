module.exports.config = {
    name: "lockdp",
    version: "1.0.0",
    hasPermssion: 1,
    credits: "Kashif Raza",
    description: "Lock group DP",
    commandCategory: "Group",
    usages: "[on/off]",
    cooldowns: 5
};

const fs = require("fs-extra");
const path = "./modules/commands/cache/data/lockStatus.json";

module.exports.run = async function ({ api, event, args }) {
    const { threadID, messageID } = event;
    const lockStatus = fs.readJsonSync(path);
    if (!lockStatus[threadID]) lockStatus[threadID] = {};
    
    const status = args[0]?.toLowerCase();
    if (status === "on") {
        const threadInfo = await api.getThreadInfo(threadID);
        lockStatus[threadID].dp = true;
        lockStatus[threadID].imageSrc = threadInfo.imageSrc;
        fs.writeJsonSync(path, lockStatus);
        return api.sendMessage("Lock DP enabled!", threadID, messageID);
    } else if (status === "off") {
        lockStatus[threadID].dp = false;
        fs.writeJsonSync(path, lockStatus);
        return api.sendMessage("Lock DP disabled!", threadID, messageID);
    } else {
        return api.sendMessage("Usage: lockdp [on/off]", threadID, messageID);
    }
};
