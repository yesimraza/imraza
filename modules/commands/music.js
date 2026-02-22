
const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');
const yts = require('yt-search');

module.exports.config = {
    name: "music",
    version: "3.0.0",
    permission: 0,
    prefix: true,
    premium: false,
    category: "media",
    credits: "Kashif Raza",
    description: "Download music from YouTube",
    commandCategory: "media",
    usages: ".music [song name]",
    cooldowns: 5
};

module.exports.run = async function ({ api, event, args }) {
    const query = args.join(" ");
    
    if (!query) {
        return api.sendMessage("❌ Please provide a song name", event.threadID, event.messageID);
    }

    const frames = [
        "🩵▰▱▱▱▱▱▱▱▱▱ 10%",
        "💙▰▰▱▱▱▱▱▱▱▱ 25%",
        "💜▰▰▰▰▱▱▱▱▱▱ 45%",
        "💖▰▰▰▰▰▰▱▱▱▱ 70%",
        "💗▰▰▰▰▰▰▰▰▰▰ 100% 😍"
    ];

    const searchMsg = await api.sendMessage(`🔍 Searching...\n\n${frames[0]}`, event.threadID);

    try {
        // Search using yt-search
        const searchResults = await yts(query);
        const videos = searchResults.videos;
        
        if (!videos || videos.length === 0) {
            api.unsendMessage(searchMsg.messageID);
            return api.sendMessage("❌ No results found", event.threadID, event.messageID);
        }

        const firstResult = videos[0];
        const videoUrl = firstResult.url;
        const title = firstResult.title;
        const author = firstResult.author.name;

        await api.editMessage(`🎵 Music found!\n\n${frames[1]}`, searchMsg.messageID, event.threadID);

        await api.editMessage(`🎵 Downloading...\n\n${frames[2]}`, searchMsg.messageID, event.threadID);

        // Fetch download URL using new API
        let fetchRes;
        try {
            const apiUrl = `https://anabot.my.id/api/download/ytmp3?url=${encodeURIComponent(videoUrl)}&apikey=freeApikey`;
            fetchRes = await axios.get(apiUrl, {
                headers: {
                    'Accept': 'application/json'
                },
                timeout: 60000
            });
        } catch (fetchError) {
            api.unsendMessage(searchMsg.messageID);
            return api.sendMessage(`❌ Failed to fetch download link: ${fetchError.message}\n\nThe API might be slow or unavailable. Please try again later.`, event.threadID, event.messageID);
        }

        if (!fetchRes.data.success || !fetchRes.data.data.result.urls) {
            api.unsendMessage(searchMsg.messageID);
            return api.sendMessage("❌ Failed to get download URL", event.threadID, event.messageID);
        }

        const downloadUrl = fetchRes.data.data.result.urls;
        const thumbnail = fetchRes.data.data.result.metadata.thumbnail;

        await api.editMessage(`🎵 Processing...\n\n${frames[3]}`, searchMsg.messageID, event.threadID);

        // Download the audio file
        let audioRes;
        try {
            audioRes = await axios.get(downloadUrl, {
                responseType: 'arraybuffer',
                timeout: 180000
            });
        } catch (downloadError) {
            api.unsendMessage(searchMsg.messageID);
            return api.sendMessage(`❌ Download failed: ${downloadError.message}\n\nPlease try again later.`, event.threadID, event.messageID);
        }

        const cacheDir = path.join(__dirname, "cache");
        await fs.ensureDir(cacheDir);

        // Save as mpeg first, then rename to mp3
        const tempPath = path.join(cacheDir, `${Date.now()}_audio.mpeg`);
        const audioPath = path.join(cacheDir, `${Date.now()}_audio.mp3`);
        fs.writeFileSync(tempPath, audioRes.data);
        fs.renameSync(tempPath, audioPath);

        setTimeout(() => {
            api.editMessage(`🎵 Complete!\n\n${frames[4]}`, searchMsg.messageID, event.threadID);
        }, 500);

        let thumbPath = null;
        if (thumbnail) {
            try {
                const thumbRes = await axios.get(thumbnail, { responseType: 'arraybuffer' });
                thumbPath = path.join(cacheDir, `${Date.now()}_thumb.jpg`);
                fs.writeFileSync(thumbPath, Buffer.from(thumbRes.data));
            } catch (thumbError) {
                console.log("Thumbnail download failed:", thumbError.message);
            }
        }

        // Send thumbnail with info
        if (thumbPath) {
            await api.sendMessage(
                {
                    body: `🎵 ${title}\n📺 ${author}`,
                    attachment: fs.createReadStream(thumbPath)
                },
                event.threadID
            );
        }

        // Send audio file
        await api.sendMessage(
            {
                body: `🎵 Audio File`,
                attachment: fs.createReadStream(audioPath)
            },
            event.threadID
        );

        setTimeout(() => {
            try {
                if (fs.existsSync(audioPath)) fs.unlinkSync(audioPath);
                if (thumbPath && fs.existsSync(thumbPath)) fs.unlinkSync(thumbPath);
                api.unsendMessage(searchMsg.messageID);
            } catch (err) {
                console.log("Cleanup error:", err);
            }
        }, 10000);

    } catch (error) {
        console.error("Music command error:", error.message);
        api.unsendMessage(searchMsg.messageID);
        return api.sendMessage("❌ An error occurred while processing your request", event.threadID, event.messageID);
    }
};
