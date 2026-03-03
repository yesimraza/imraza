module.exports.config = {
  name: "filter",
  version: "1.0.0",
  hasPermssion: 1,
  credits: "Raza",
  description: "Filter members in the group",
  category: "Group",
  usages: "filter",
  cooldowns: 5
};

module.exports.run = async function({ api, event }) {
    const { threadID, messageID } = event;
    try {
        const threadInfo = await api.getThreadInfo(threadID);
        const { participantIDs } = threadInfo;
        let count = 0;
        for (const id of participantIDs) {
            // This is a basic filter example, usually used to kick inactive members
            // For now, it just counts them.
            count++;
        }
        api.sendMessage(`Group has ${count} members.`, threadID, messageID);
    } catch (e) {
        api.sendMessage("Error: " + e.message, threadID, messageID);
    }
};