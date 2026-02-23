module.exports.config = {
  name: "nicknamelock",
  eventType: ["log:subscribe", "log:unsubscribe", "log:thread-name", "log:thread-icon", "log:thread-color", "log:thread-emoji", "log:user-nickname"],
  version: "1.0.0",
  credits: "Agent",
  description: "Lock nickname and restore if changed"
};

const fs = require("fs-extra");
const { join } = require("path");
const path = join(__dirname, "../../includes/datajson/nicknameLock.json");

module.exports.run = async function({ api, event, Users }) {
  const { threadID, author, logMessageType, logMessageData } = event;
  if (!fs.existsSync(path)) fs.writeJsonSync(path, {});
  let data = fs.readJsonSync(path);

  if (logMessageType === "log:user-nickname") {
    const { participant_id, nickname } = logMessageData;
    if (data[threadID] && data[threadID][participant_id]) {
      const lockedNickname = data[threadID][participant_id];
      if (nickname !== lockedNickname) {
        api.changeNickname(lockedNickname, threadID, participant_id);
      }
    }
  }
};

module.exports.handleEvent = async function({ api, event, Users }) {
    return module.exports.run({ api, event, Users });
};

module.exports.lock = async function({ api, event, args }) {
  const { threadID, messageID, mentions, senderID } = event;
  if (!fs.existsSync(path)) fs.writeJsonSync(path, {});
  let data = fs.readJsonSync(path);

  if (args[0] === "lock") {
    const mention = Object.keys(mentions);
    if (mention.length === 0) return api.sendMessage("Please tag someone to lock their nickname.", threadID, messageID);
    
    if (!data[threadID]) data[threadID] = {};
    const threadInfo = await api.getThreadInfo(threadID);
    const nicknames = threadInfo.nicknames;
    
    mention.forEach(id => {
      data[threadID][id] = nicknames[id] || "";
    });
    
    fs.writeJsonSync(path, data);
    return api.sendMessage("Locked nicknames for tagged users.", threadID, messageID);
  }

  if (args[0] === "unlock") {
    const mention = Object.keys(mentions);
    if (mention.length === 0) return api.sendMessage("Please tag someone to unlock their nickname.", threadID, messageID);
    
    if (data[threadID]) {
      mention.forEach(id => {
        delete data[threadID][id];
      });
      fs.writeJsonSync(path, data);
    }
    return api.sendMessage("Unlocked nicknames for tagged users.", threadID, messageID);
  }
};
