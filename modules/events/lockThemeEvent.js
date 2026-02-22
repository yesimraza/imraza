module.exports.config = {
    name: "lockThemeEvent",
    eventType: ["log:thread-color"],
    version: "1.0.0",
    credits: "Kashif Raza",
    description: "Revert theme change"
};

const fs = require("fs-extra");
const path = "./modules/commands/cache/data/lockStatus.json";

module.exports.run = async function ({ api, event }) {
    const { threadID, author } = event;
    if (author == api.getCurrentUserID()) return;
    if (!fs.existsSync(path)) return;
    const lockStatus = fs.readJsonSync(path);
    const settings = lockStatus[threadID];
    if (settings && settings.theme) {
        api.setThreadColor(settings.themeValue, threadID);
    }
};
