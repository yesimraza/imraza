const { spawn } = require("child_process");
const logger = require("./utils/log");
const fs = require("fs-extra");
const path = require("path");
const bodyParser = require("body-parser");
const express = require("express");
const app = express();

const PORT = process.env.PORT || process.env.SERVER_PORT || 20152;

app.use(bodyParser.json());
app.use(express.static("public"));

let child = null;
let logs = [];
const MAX_LOGS = 100;

function getBotStatus() {
    return child !== null && !child.killed;
}

function addToLogs(data, type = "info") {
    const timestamp = new Date().toLocaleTimeString();
    logs.push({ timestamp, message: data.toString().trim(), type });
    if (logs.length > MAX_LOGS) logs.shift();
}

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, "views", "index.html"));
});

app.get('/api/config', async (req, res) => {
    try {
        const config = await fs.readJson("./config.json");
        let appState = null;
        if (await fs.pathExists("./appstate.json")) {
            try {
                appState = await fs.readJson("./appstate.json");
            } catch(e) {
                console.error("Error reading appstate.json:", e);
            }
        }
        res.json({ config, appState, isRunning: getBotStatus() });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.get('/api/logs', (req, res) => {
    res.json({ logs });
});

app.post('/api/update', async (req, res) => {
    try {
        const { BOTNAME, PREFIX, ADMINBOT, icon, appState, ADMIN_NAME } = req.body;
        const config = await fs.readJson("./config.json");
        
        config.BOTNAME = BOTNAME || config.BOTNAME;
        config.PREFIX = PREFIX || config.PREFIX;
        config.ADMINBOT = Array.isArray(ADMINBOT) ? ADMINBOT : (ADMINBOT ? [ADMINBOT] : config.ADMINBOT);
        config.ADMIN_NAME = ADMIN_NAME || config.ADMIN_NAME;
        if (config.iconUnsend) config.iconUnsend.icon = icon;
        
        await fs.writeJson("./config.json", config, { spaces: 4 });
        
        // Update global.config in main.js process if it's running
        // Since we are using child_process.spawn, we can't easily update global.config
        // in real-time without some IPC or reloading the config in main.js
        // For now, we'll tell the user to restart or we'll implement a watcher in main.js
        
        if (appState) {
            try {
                const parsed = typeof appState === 'string' ? JSON.parse(appState) : appState;
                await fs.writeJson("./appstate.json", parsed, { spaces: 4 });
            } catch(e) {
                console.error("Appstate parse error:", e);
            }
        }
        
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.post('/api/start', (req, res) => {
    if (!getBotStatus()) {
        startBot("Bot started from Web Dashboard");
        res.json({ success: true, message: "Bot starting..." });
    } else {
        res.json({ success: true, message: "Bot is already running" });
    }
});

app.post('/api/stop', (req, res) => {
    if (getBotStatus()) {
        const pid = child.pid;
        const oldChild = child;
        child = null; // Mark as manually stopped to prevent auto-restart
        if (pid) {
            try {
                // Kill the entire process group if shell is used
                process.kill(-pid, 'SIGKILL');
            } catch (e) {
                try {
                    oldChild.kill('SIGKILL');
                } catch (err) {}
            }
        }
        logger("Bot stopped from Web Dashboard", "BOT STOPPED");
        addToLogs("Bot stopped from Web Dashboard", "warn");
    }
    res.json({ success: true });
});

app.post('/api/delete-appstate', async (req, res) => {
    try {
        if (getBotStatus()) {
            const pid = child.pid;
            const oldChild = child;
            child = null; // Mark as manually stopped
            if (pid) {
                try {
                    process.kill(-pid, 'SIGKILL');
                } catch (e) {
                    try {
                        oldChild.kill('SIGKILL');
                    } catch (err) {}
                }
            }
            logger("Bot stopped for session clearing", "BOT STOPPED");
            addToLogs("Bot stopped for session clearing", "warn");
        }
        await fs.remove("./appstate.json");
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`[ SERVER ] -> Dashboard active on port: ${PORT}`);
});

function startBot(message) {
    if (message) {
        logger(message, "BOT STARTING");
        addToLogs(message, "info");
    }

    child = spawn("node", ["--trace-warnings", "--async-stack-traces", "main.js"], {
        cwd: __dirname,
        stdio: ["inherit", "pipe", "pipe"],
        shell: true,
        detached: true // Start in a new process group
    });

    child.stdout.on("data", (data) => {
        process.stdout.write(data);
        addToLogs(data, "info");
    });

    child.stderr.on("data", (data) => {
        process.stderr.write(data);
        addToLogs(data, "error");
    });

    child.on("close", (codeExit) => {
        const wasKilledManually = child === null;
        // Only auto-restart if killed manually was false AND exit code is non-zero
        // Don't restart if exit code is 0 (normal exit) or null
        if (!wasKilledManually && codeExit !== 0 && codeExit !== null) {
            // Check if it's a known non-recoverable error
            const lastLog = logs.length > 0 ? logs[logs.length - 1].message : "";
            if (lastLog.includes("AppState") || lastLog.includes("appstate")) {
                addToLogs("AppState missing - not auto-restarting. Please upload via dashboard.", "warn");
                child = null;
                return;
            }
            addToLogs(`Bot exited with code ${codeExit}. Restarting...`, "warn");
            startBot("Restarting Bot due to crash...");
        } else {
            child = null;
            if (wasKilledManually) {
                addToLogs("Bot stopped manually.", "info");
            } else {
                addToLogs("Bot process closed normally.", "info");
            }
        }
    });

    child.on("error", function (error) {
        logger("An error occurred: " + JSON.stringify(error), "[ Starting ]");
        addToLogs("Process error: " + error.message, "error");
        child = null;
    });
};

async function checkAndStartBot() {
    try {
        const appStateExists = await fs.pathExists("./appstate.json");
        if (!appStateExists) {
            logger("AppState not found. Bot will not auto-start. Please upload via dashboard.", "warn");
            addToLogs("AppState missing - waiting for upload via dashboard", "warn");
            return;
        }
        startBot("Auto-starting bot...");
    } catch (e) {
        logger("Error checking appstate: " + e.message, "error");
    }
}

checkAndStartBot();
