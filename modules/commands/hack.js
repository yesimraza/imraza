module.exports.config = {
  name: "hack",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "Raza",
  description: "Funny Hack",
  commandCategory: "Fun",
  usages: "hack @tag",
  cooldowns: 5
};

module.exports.run = async function({ api, event, args }) {
    const { threadID, messageID, mentions } = event;
    const mention = Object.keys(mentions)[0];
    if (!mention) return api.sendMessage("Please tag someone to hack!", threadID, messageID);
    
    const name = mentions[mention].replace("@", "");
    
    api.sendMessage(`Initiating hack on ${name}...`, threadID, async () => {
        await new Promise(r => setTimeout(r, 2000));
        api.sendMessage("Bypassing firewall...", threadID, async () => {
            await new Promise(r => setTimeout(r, 2000));
            api.sendMessage("Accessing private photos...", threadID, async () => {
                await new Promise(r => setTimeout(r, 2000));
                api.sendMessage(`✅ Hack complete! ${name}'s data has been sent to our server.`, threadID);
            });
        });
    });
};