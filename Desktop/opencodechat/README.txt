================================================================================
                         NeniCoder v1.0.0
          AI Coding Agent on Telegram — by Nenifix
================================================================================

WHAT IS NeniCoder?
------------------
NeniCoder is an open-source AI coding agent that lives on Telegram. Message it
like a colleague — it reads files, writes code, runs builds, pushes to GitHub,
searches the web, controls a browser, manages your desktop, and even writes
ESP32/Arduino code. It's not a chatbot that talks about code. It's an agent
that WRITES, TESTS, and DEPLOYS code for you.

Telegram bot: @Opencodeclichatbot (https://t.me/Opencodeclichatbot)
GitHub:       https://github.com/nenifix/nenicoder

ABOUT Nenifix
-------------
NeniCoder is built and maintained by Nenifix — a Ghana-based brand engineering
and STEM innovation hub founded by Godwin Appiah (Neni) with 13+ years across
petroleum, healthcare, maritime, and government sectors.

Divisions:
  - NeniFix Agency  → Brand engineering, print & fabrication
  - RoboFix / AiFix → Robotics and AI training programs
  - NeniLearn LMS   → Learning management & education platform
  - Tourfix         → Tourism experiences

Flagship program: Shengineers — a free 6-month women-in-STEM program with a
job guarantee. https://github.com/nenifix

================================================================================
FEATURES
================================================================================

AI AGENT (not just a chatbot)
  - Multi-step reasoning with up to 10 tool-call iterations per request
  - Reads files before editing them
  - Runs builds and tests to verify changes
  - Persistent conversation memory per user
  - Telegram commands for runtime configuration

FILE OPERATIONS (5 tools)
  read_file, write_file, list_dir, search, delete_file

SHELL EXECUTION (1 tool)
  exec — Run any shell command (builds, installs, tests, git, docker, etc.)

GITHUB INTEGRATION (16 tools)
  gh_repo_create, gh_commit_push, gh_sync, gh_pr_create/list/merge,
  gh_issue_create/list, gh_branch_create/list/checkout, gh_gist_create/list,
  gh_run_list, gh (raw pass-through)

WEB TOOLS (3 tools)
  web_search (DuckDuckGo), web_fetch (URL content), download_file

BROWSER AUTOMATION (12 tools)
  browser_navigate, browser_snapshot, browser_screenshot, browser_click,
  browser_type, browser_scroll, browser_evaluate, browser_tabs,
  browser_wait, browser_back, browser_info, browser_close

COMPUTER USE (10 tools)
  computer_screenshot  — Capture desktop screen
  computer_click       — Click mouse at coordinates
  computer_move        — Move mouse cursor
  computer_type        — Type text via keyboard
  computer_key         — Press key or combo (ctrl+c, alt+tab, etc.)
  computer_scroll      — Scroll mouse wheel
  computer_window      — List/focus/minimize windows
  computer_clipboard   — Read/write clipboard
  computer_screen_info — Get resolution, DPI, mouse position
  computer_pixel       — Get RGB color at pixel coordinates

ESP32 / ARDUINO (10 tools)
  mcu_new_project   — Create project with template code
  mcu_write_code    — Write source files (.ino, .cpp)
  mcu_compile       — Compile via arduino-cli
  mcu_upload        — Upload to board via USB/serial
  mcu_serial        — Read/write serial monitor
  mcu_boards        — List connected boards
  mcu_libraries     — Search/install/list Arduino libraries
  mcu_pinout        — Get pinout reference (ESP32, Uno, ESP32-CAM, NodeMCU)
  mcu_example       — Generate code examples (blink, wifi, mqtt, etc.)
  mcu_debug         — Debug common issues (upload, wifi, I2C, etc.)

OBSIDIAN VAULT (7 tools)
  obsidian_read, obsidian_search, obsidian_list, obsidian_create,
  obsidian_append, obsidian_daily, obsidian_task

NOTION (6 tools)
  notion_search, notion_read_page, notion_create_page, notion_update_page,
  notion_query_db, notion_append

ZAPIER WEBHOOKS (3 tools)
  zapier_trigger, zapier_webhook, zapier_run_action

MCP SERVER + REST API
  stdio transport for Claude Code/Cursor/Windsurf
  REST API: GET /health, GET /tools, POST /tools/:name, POST /mcp

TASK LOGGER
  Persistent JSONL log of all actions with timestamps

================================================================================
QUICK START
================================================================================

1. Clone:
   git clone https://github.com/nenifix/nenicoder.git
   cd nenicoder

2. Install:
   npm install

3. Create Telegram bot:
   - Message @BotFather on Telegram → /newbot → follow prompts
   - Copy the bot token
   - Message your new bot and send /start

4. Get your Telegram user ID:
   Message @userinfobot on Telegram

5. Configure:
   cp .env.example .env
   # Edit .env with your values

   Minimum required:
   TELEGRAM_BOT_TOKEN=your_bot_token_here
   ALLOWED_USER_ID=your_telegram_user_id
   OPENROUTER_API_KEY=sk-or-v1-...
   MODEL=openrouter/anthropic/claude-sonnet-4

6. Build:
   npm run build

7. Run:
   npm start

8. (Optional) Global CLI:
   npm link
   opencodechat

================================================================================
CONFIGURATION
================================================================================

Environment Variables:
  TELEGRAM_BOT_TOKEN    Required  Bot token from @BotFather
  ALLOWED_USER_ID       Required  Your Telegram user ID (security)
  OPENROUTER_API_KEY    Required  OpenRouter API key
  MODEL                 Required  Model name (default: openrouter/auto)
  MODEL_BASE_URL        Optional  Ollama/LM Studio URL
  WORKSPACE             Optional  Agent workspace directory (./workspace)
  MAX_CONTEXT_MESSAGES  Optional  Chat history limit (20)
  NOTION_API_KEY        Optional  Notion integration token
  ZAPIER_API_KEY        Optional  Zapier API key
  ZAPIER_WEBHOOK_URL    Optional  Zapier catch hook URL
  TASK_LOG_DIR          Optional  Task log directory (./logs)
  CHROME_PATH           Optional  Path to Chrome for browser tools

Model Providers:
  OpenRouter  → https://openrouter.ai (default, 100+ models)
  Ollama      → http://localhost:11434/v1 (free, local)
  LM Studio   → http://localhost:1234/v1 (free, local)

================================================================================
TELEGRAM COMMANDS
================================================================================

  /start            Welcome message and quick guide
  /help             Full command and tool listing
  /status           Current model, provider, workspace
  /config model     Switch model at runtime
  /workspace path   Change working directory
  /reset            Clear conversation history

================================================================================
USAGE EXAMPLES
================================================================================

  "Create a GitHub repo called 'my-api' with a Node.js Express server"
  → Bot creates repo, writes server code, installs deps, pushes to GitHub

  "Search the web for Node.js 20 new features"
  → Bot searches DuckDuckGo and summarizes results

  "Go to https://example.com and tell me what's on the page"
  → Bot navigates browser, extracts text, summarizes content

  "Take a screenshot of the desktop"
  → Bot captures screen and saves to workspace/screenshots/

  "Create an ESP32 project called 'sensor-hub' with WiFi and web server"
  → Bot creates project, writes web server code, generates platformio.ini

  "Show me the ESP32 pinout"
  → Bot returns full GPIO, ADC, I2C, SPI, UART pin reference

  "Read my Obsidian note about API design"
  → Bot reads vault and returns note content

  "What model are you using?"
  → Bot replies with current provider, model, and workspace info

================================================================================
PROJECT STRUCTURE
================================================================================

  nenicoder/
  ├── src/
  │   ├── index.ts              # Entry point — starts the bot
  │   ├── agent.ts              # Agent loop (LLM + tool orchestration)
  │   ├── llm.ts                # LLM client (OpenRouter/Ollama/LM Studio)
  │   ├── config.ts             # Environment config loader
  │   ├── telegram.ts           # Telegram bot handlers (Telegraf)
  │   ├── mcp.ts                # MCP server + REST API
  │   └── tools/
  │       ├── index.ts          # Tool registry (70+ definitions + dispatcher)
  │       ├── exec.ts           # Shell command execution
  │       ├── read.ts           # File reading
  │       ├── write.ts          # File writing
  │       ├── list.ts           # Directory listing
  │       ├── search.ts         # File content search
  │       ├── github.ts         # GitHub CLI wrappers (16 tools)
  │       ├── web.ts            # Web search / fetch / download
  │       ├── browser.ts        # Browser automation (Puppeteer + Chrome)
  │       ├── computer.ts       # Desktop automation (10 tools)
  │       ├── mcu.ts            # ESP32/Arduino coding (10 tools)
  │       ├── obsidian.ts       # Obsidian vault tools (7 tools)
  │       ├── notion.ts         # Notion API tools (6 tools)
  │       └── zapier.ts         # Zapier webhook tools (3 tools)
  ├── scripts/
  │   └── downloader.py         # Robust file downloader (curl/wget/python)
  ├── dist/                     # Compiled JavaScript (after build)
  ├── logs/                     # Task logs (auto-created)
  ├── workspace/                # Default agent workspace
  ├── .env                      # Your config (never commit this)
  ├── .env.example              # Config template
  ├── package.json              # bin: opencodechat
  └── tsconfig.json             # TypeScript config

================================================================================
ADDING A NEW TOOL
================================================================================

1. Create src/tools/mytool.ts:
   export async function myTool(arg1: string): Promise<string> {
     return "result";
   }

2. Register in src/tools/index.ts:
   - Import: import * as mytool from "./mytool.js";
   - Add to toolDefinitions array with name, description, parameters
   - Add case to executeTool switch

3. Build: npm run build

================================================================================
MCP SERVER & REST API
================================================================================

stdio mode (for IDEs):
  node dist/mcp.js

HTTP mode (REST API):
  node dist/mcp.js --http --port 3001

Endpoints:
  GET  /health       Server status
  GET  /tools        List all available tools
  POST /tools/:name  Call a tool directly
  POST /mcp          JSON-RPC MCP endpoint

Example:
  curl -X POST http://localhost:3001/tools/web_search \
    -H "Content-Type: application/json" \
    -d '{"query": "TypeScript best practices"}'

================================================================================
SECURITY
================================================================================

  - User whitelist: Only ALLOWED_USER_ID can interact with the bot
  - Workspace isolation: Agent operates within the configured workspace
  - No credential exposure: API keys in .env (gitignored), never sent to LLM
  - Task logging: All actions logged to logs/tasks.jsonl for auditability

================================================================================
CONTRIBUTING
================================================================================

NeniCoder is open-source and welcomes contributions!

1. Fork the repo
2. Create a branch: git checkout -b feature/amazing-thing
3. Commit: git commit -m "Add amazing thing"
4. Push: git push origin feature/amazing-thing
5. Open a Pull Request

================================================================================
LICENSE
================================================================================

MIT License

================================================================================
LINKS
================================================================================

  GitHub:         https://github.com/nenifix/nenicoder
  Telegram Bot:   https://t.me/Opencodeclichatbot
  Nenifix:        https://github.com/nenifix
  OpenRouter:     https://openrouter.ai
  MCP Protocol:   https://modelcontextprotocol.io

================================================================================
Built with love by Nenifix — Empowering STEM in Africa
Shengineers · RoboFix · NeniLearn · Tourfix
================================================================================
