module.exports.config = {
    name: "setlockall",
    version: "1.0.0",
    hasPermssion: 1,
    credits: "Kashif Raza",
    description: "Set nickname for all and lock them",
    commandCategory: "Admin",
    usages: "[nickname]",
    cooldowns: 5
};

module.exports.run = async function({ api, event, args }) {
    const { threadID, messageID, participantIDs } = event;
    const fs = require("fs-extra");
    const { join } = require("path");
    const path = join(__dirname, "../../includes/datajson/nicknameLock.json");
    
    const name = args.join(" ");
    if (!name) return api.sendMessage("⚠️ Please enter the nickname you want to set for all.", threadID, messageID);

    if (!fs.existsSync(path)) fs.writeJsonSync(path, {});
    let data = fs.readJsonSync(path);
    if (!data[threadID]) data[threadID] = {};

    api.sendMessage(`⏳ Setting and locking nickname '${name}' for all members...`, threadID);

    for (const userID of participantIDs) {
        try {
            await api.changeNickname(name, threadID, userID);
            data[threadID][userID] = name;
        } catch (e) {
            console.log(`Failed to set nickname for ${userID}`);
        }
        await new Promise(resolve => setTimeout(resolve, 500));
    }

    fs.writeJsonSync(path, data);
    return api.sendMessage(`✅ Successfully set and locked nickname '${name}' for all members.`, threadID, messageID);
};