# Mirai-V2 Facebook Messenger Bot

## Overview
A Facebook Messenger bot (Mirai-V2) with a web dashboard for configuration and management. Uses a local fork of the FCA (Facebook Chat API) library.

## Project Architecture
- `index.js` - Express web dashboard server (port 5000), spawns `main.js` as child process
- `main.js` - Bot core: loads config, connects to Facebook via FCA, loads command/event modules
- `includes/fca/` - Local fork of FCA (Facebook Chat API) library
- `includes/listen.js` - Event listener and message routing
- `includes/handle/` - Command, event, reaction, reply handlers
- `modules/commands/` - Bot command modules
- `modules/events/` - Bot event modules
- `config.json` - Bot configuration
- `appstate.json` - Facebook session cookies

## Recent Changes
- 2026-02-22: Fixed `sendMessage` crash when Facebook returns responses without `payload.actions`
- 2026-02-22: Fixed login crash (`Cannot read properties of undefined (reading 'ctx')`) with proper error handling when appstate is invalid
- 2026-02-22: Changed default port to 5000 for Replit compatibility

## Key Notes
- The bot requires valid Facebook session cookies in `appstate.json` to function
- When cookies expire, the bot will show login errors - new cookies must be obtained from an incognito browser session
