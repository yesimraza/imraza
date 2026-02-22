# Replit.md

## Overview

This is a Facebook Messenger chatbot built on the Mirai-V2 framework (forked/customized by Kashif Raza). The bot connects to Facebook's chat API using cookie-based authentication (`appstate.json`) and provides a modular command system for managing Facebook groups, automating tasks, and offering fun/utility features to users. It includes a web-based dashboard for monitoring and controlling the bot, and uses SQLite for persistent data storage.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Entry Point & Process Management
- **`index.js`** is the main entry point (`npm start`). It runs an Express web server on port 5000 that serves a dashboard UI and provides API endpoints. It spawns and manages the bot process (`main.js`) as a child process, with restart capabilities and log collection.
- **`main.js`** is the core bot logic that handles Facebook login, command loading, event listening, and the bot lifecycle. It uses `moment-timezone` set to `Asia/Karachi` for all time operations.

### Facebook Chat API
- The bot uses a **customized fork of `fca-horizon-remastered`** located in `includes/fca/`. This is a Facebook Chat API wrapper that authenticates via cookie-based app state (`appstate.json`).
- Authentication is handled through Facebook cookies stored in `appstate.json` — this file contains session cookies for the Facebook account the bot operates as.
- Configuration for the FCA library is in `Razafca.json` with settings for auto-login, MQTT restart intervals, websocket extensions, and anti-detection features.

### Command System (Plugin Architecture)
- Commands are modular JavaScript files in `modules/commands/`. Each command exports a `config` object (name, permissions, cooldowns, etc.) and a `run` function.
- Commands can also export `handleEvent`, `handleReply`, `handleReaction`, and `onLoad` functions for more complex interactions.
- Permission levels: `0` = all users, `1` = group admins, `2` = bot admins, `3` = super admins (NDH/owner).
- Commands are loaded dynamically at startup and registered in `global.client.commands` Map.

### Event Handling Pipeline
Located in `includes/handle/`:
- **`handleCommand.js`** — Parses messages, checks permissions, prefix matching, cooldowns, and dispatches to the correct command.
- **`handleEvent.js`** — Distributes events to all registered event handlers.
- **`handleReply.js`** / **`handleReaction.js`** — Manages conversational reply chains and reaction-based interactions.
- **`handleCreateDatabase.js`** — Auto-creates database entries for new threads and users.
- **`handleRefresh.js`** — Keeps thread metadata (admins, names, members) in sync.
- **`handleNotification.js`** — Fetches and forwards Facebook notifications.

### Data Layer
- **Database**: SQLite via Sequelize ORM, configured in `includes/database/index.js`.
- **Models**: Three main models — `Users`, `Threads`, `Currencies` (defined in `includes/database/model.js`).
- **Controllers**: CRUD operations for each model in `includes/controllers/` (users.js, threads.js, currencies.js).
- **In-memory data**: Global `data` object stores runtime caches — `threadData`, `userName`, `userBanned`, `threadBanned`, `commandBanned`, etc.
- **Config**: `config.json` holds bot configuration (prefix, admin IDs, feature toggles, FCA options).

### Web Dashboard
- Express server serves `views/index.html` — a modern single-page dashboard with Bootstrap 5 styling.
- API endpoints at `/api/config` return bot configuration and status.
- The dashboard provides bot start/stop controls, log viewing, and configuration management.

### Global State
The bot uses extensive global state:
- `global.client` — Commands map, events map, cooldowns, reply/reaction handlers.
- `global.config` — Bot configuration from `config.json`.
- `global.data` — Runtime data caches for users, threads, bans, etc.
- `global.Fca` — FCA library state and settings.

### Obfuscated Code
- `includes/ConnectApi.js` contains obfuscated code — do not attempt to modify it directly.

## External Dependencies

### Core Dependencies
- **Express** (v4.18.2) — Web server for dashboard and API
- **Sequelize** + **better-sqlite3** — ORM and SQLite driver for persistent storage
- **axios** — HTTP client for external API calls
- **moment-timezone** — Date/time handling (timezone: Asia/Karachi)
- **fs-extra** — Enhanced file system operations
- **chalk** + **gradient-string** — Console logging with colors

### Facebook Integration
- **fca-horizon-remastered** (bundled in `includes/fca/`) — Facebook Chat API wrapper
- **cheerio** — HTML parsing for Facebook responses
- **got** + **request** — HTTP clients used by FCA
- **mqtt** + **ws** — Real-time messaging protocols for Facebook

### Media & Image Processing
- **canvas** (v2.11.2) — Image generation
- **jimp** (v0.22.8) — Image manipulation (used in commands like breakup)
- **image-downloader** — Downloading images from URLs

### AI Services
- **@google/generative-ai** (v0.17.0) — Google Gemini AI integration
- **@cerebras/cerebras_cloud_sdk** (v1.50.0) — Cerebras AI integration

### Other Notable Dependencies
- **googleapis** — Google API integration
- **cheerio** — Web scraping
- **crypto-js** + **aes-js** — Encryption utilities
- **figlet** + **cfonts** — ASCII art text generation
- **string-similarity** — Command name fuzzy matching
- **pastebin-api** — Pastebin integration for code sharing
- **chess.js** — Chess game functionality

### File Storage
- `appstate.json` — Facebook session cookies (sensitive)
- `config.json` — Bot configuration
- `Razafca.json` — FCA library configuration
- `Raza_DataBase/` — Additional data files
- `modules/commands/cache/` — Command-specific cached data
- `antists.sqlite` — SQLite database file