module.exports.config = {
  name: "nlock",
  version: "1.0.0",
  permission: 1,
  credits: "Kashif Raza",
  description: "Lock or unlock nicknames",
  commandCategory: "Group",
  usages: "[lock/unlock] @tag",
  cooldowns: 5
};

module.exports.run = async function({ api, event, args }) {
  const nickLock = require("../events/nicknamelock.js");
  return nickLock.lock({ api, event, args });
};