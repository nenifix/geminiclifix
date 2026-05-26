<div align="center">

# 🤖 NeniCoder

**Your AI coding agent on Telegram — built by [Nenifix](https://github.com/nenifix)**

[![Node.js](https://img.shields.io/badge/Node.js-%3E%3D20-339933?logo=nodedotjs)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript)](https://typescriptlang.org)
[![Telegram](https://img.shields.io/badge/Telegram-%40Opencodeclichatbot-26A5E4?logo=telegram)](https://t.me/Opencodeclichatbot)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![MCP](https://img.shields.io/badge/MCP-Compatible-6366f1?logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggZD0iTTEyIDJMMiA3djEwbDEwIDVsMTAtNVY3TDEyIDJ6IiBmaWxsPSIjZmZmIi8+PC9zdmc+)](https://modelcontextprotocol.io)

*Build, deploy, manage your codebase, control your desktop, and program microcontrollers — all from a Telegram chat.*

[🚀 Quick Start](#-quick-start) · [✨ Features](#-features) · [🛠️ Tools](#️-tool-reference) · [🔌 API](#-mcp-server--rest-api) · [💬 Try It](#-try-it-now)

</div>

---

## 📖 What is NeniCoder?

NeniCoder is an **open-source AI coding agent** that lives on Telegram. Message it like a colleague — it reads files, writes code, runs builds, pushes to GitHub, searches the web, manages your notes, and more. It's not a chatbot that *talks about* code. It's an agent that **writes, tests, and deploys** code for you.

**The Telegram bot:** [@Opencodeclichatbot](https://t.me/Opencodeclichatbot)

**How it works:**
1. You send a message on Telegram (e.g. *"Create a Node.js API with Express and push it to GitHub"*)
2. NeniCoder's agent loop picks the right tools, executes them in sequence
3. It reads files before editing, runs builds to verify, and reports results
4. All actions are logged for auditability

**Under the hood:**
- **LLM-powered** — works with OpenRouter (100+ models), Ollama (local), or LM Studio (local)
- **Tool-driven** — 70+ tools for files, shell, GitHub, web, browser, computer, ESP32/Arduino, Obsidian, Notion, Zapier
- **MCP-compatible** — use it from Claude Code, Cursor, or any MCP-compatible IDE
- **REST API** — HTTP endpoints for direct tool calls from any application

---

## 👋 About Nenifix

NeniCoder is built and maintained by **[Nenifix](https://github.com/nenifix)** — a Ghana-based brand engineering and STEM innovation hub.

### The Company

Founded by **Godwin Appiah (Neni)**, who brings 13+ years of experience across petroleum, healthcare, maritime, and government sectors, Nenifix operates across four verticals:

| Division | Focus |
|---|---|
| **NeniFix Agency** | Brand engineering, print & fabrication |
| **RoboFix / AiFix** | Robotics and AI training programs |
| **NeniLearn LMS** | Learning management & education platform |
| **Tourfix** | Tourism experiences |

### Flagship Program: Shengineers

🚀 **[Shengineers](https://github.com/nenifix)** — a **free 6-month women-in-STEM program** with a job guarantee. Nenifix doesn't just build software; it builds people who build software.

> *"We don't just build software. We build people who build software."*
> — Godwin Appiah (Neni), Founder & CEO

### Why Open Source?

NeniCoder is open-source because Nenifix believes African developers should have access to the same AI agent tooling as Silicon Valley. The future of software development is agent-driven — and that future should be accessible to everyone.

---

## ✨ Features

### 🤖 AI Agent (not just a chatbot)
- Multi-step reasoning with up to 10 tool-call iterations per request
- Reads files before editing them
- Runs builds and tests to verify changes
- Persistent conversation memory per user
- Automatic long-message splitting for Telegram

### 📁 File Operations (5 tools)
Read, write, list, search, and delete files. Create entire project structures from a single message.

### 🖥️ Shell Execution (1 tool)
Run any shell command — builds, installs, tests, git operations, npm, docker, anything.

### 🐙 GitHub Integration (16 tools)
Full GitHub workflow automation via the `gh` CLI:
- **Repos:** Create new repositories
- **Code:** Stage, commit, push, sync/pull
- **Branches:** Create, list, checkout
- **Pull Requests:** Create, list, merge
- **Issues:** Create, list
- **Gists:** Create, list
- **CI/CD:** Monitor GitHub Actions runs
- **Raw:** Pass-through to any `gh` command

### 🌐 Web Tools (3 tools)
- **Search** the web via DuckDuckGo
- **Fetch** any URL and extract readable content
- **Download** files directly to your workspace

### 🌐 Browser Automation (12 tools)
Full headless browser control via Puppeteer + Chrome/Chromium:
- **Navigate** to any URL
- **Snapshot** — extract readable text (with optional CSS selector)
- **Screenshot** — capture page as PNG (saved to workspace/screenshots/)
- **Click** — click elements by CSS selector
- **Type** — fill input fields with text
- **Scroll** — up, down, top, bottom
- **Evaluate** — run JavaScript on the page (scraping, data extraction)
- **Tabs** — list, open, close, switch tabs
- **Wait** — wait for elements or fixed time
- **Back** — navigate back in history
- **Info** — get current URL and title
- **Close** — shut down the browser

> **Requirements:** Chrome/Chromium installed. Auto-detects on Windows, macOS, Linux. Set `CHROME_PATH` env var if needed.

### 🖥️ Computer Use (10 tools)
Desktop automation — no extra packages needed (uses native OS commands):
- **Screenshot** — capture the desktop screen
- **Click** — mouse click at pixel coordinates (left/right/double)
- **Move** — move mouse cursor
- **Type** — keyboard input (SendKeys/osascript/xdotool)
- **Key** — press key combos (ctrl+c, alt+tab, enter, etc.)
- **Scroll** — mouse wheel up/down
- **Window** — list/focus/minimize desktop windows
- **Clipboard** — read/write system clipboard
- **Screen Info** — resolution, DPI, mouse position
- **Pixel** — get RGB color at coordinates

### 🔧 ESP32 / Arduino (10 tools)
Microcontroller coding and deployment:
- **New Project** — create with template (.ino + platformio.ini)
- **Write Code** — write source files
- **Compile** — compile via arduino-cli
- **Upload** — upload to board via USB/serial
- **Serial** — read/write serial monitor
- **Boards** — list connected boards
- **Libraries** — search/install/list Arduino libraries
- **Pinout** — pinout reference (ESP32, Uno, ESP32-CAM, NodeMCU)
- **Example** — code templates (blink, wifi, mqtt, sensor, oled, servo, bluetooth)
- **Debug** — fix common issues (upload, wifi, brownout, I2C, oled)

### 📝 Obsidian Vault Integration (7 tools)
Connect to your Obsidian knowledge base:
- **Read** any note from your vault
- **Search** notes by content (full-text)
- **List** notes in any directory
- **Create** new notes (Markdown)
- **Append** content to existing notes
- **Daily Brief** — auto-generate daily summaries
- **Task Log** — log tasks directly to your vault

### 📋 Notion Integration (6 tools)
Full Notion workspace automation:
- **Search** across your entire workspace
- **Read** pages as Markdown
- **Create** new pages
- **Update** page content
- **Query** databases
- **Append** blocks to pages

### ⚡ Zapier Webhooks (3 tools)
Connect to 5,000+ apps via Zapier:
- **Trigger** a Zapier catch hook
- **Webhook** — POST to any URL
- **Run Action** — execute Zapier API actions

### 🔌 MCP Server + REST API
- **stdio transport** — plug into Claude Code, Cursor, Windsurf, or any MCP-compatible IDE
- **HTTP mode** — REST endpoints for health, tool listing, direct tool calls, and JSON-RPC MCP
- **Port configurable** — default 3001

### 📊 Persistent Task Logging
Every action is automatically logged to `logs/tasks.jsonl` with timestamps, user messages, tools called, and results.

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   Telegram Chat                          │
│                (@Opencodeclichatbot)                     │
└────────────────────────┬────────────────────────────────┘
                         │ Telegraf.js
┌────────────────────────▼────────────────────────────────┐
│                    Agent Loop                             │
│                                                          │
│  ┌──────────────┐  ┌───────────┐  ┌──────────────────┐ │
│  │  LLM Client   │  │  50+      │  │  Session Memory  │ │
│  │ (OpenRouter/  │  │  Tools    │  │  (per user)      │ │
│  │  Ollama/      │  │           │  │                  │ │
│  │  LM Studio)   │  │           │  │                  │ │
│  └──────────────┘  └─────┬─────┘  └──────────────────┘ │
└──────────────────────────┬──────────────────────────────┘
                           │
     ┌─────────────────────┬─────────────────────┬─────────────────────┐
     ▼                     ▼                     ▼                     ▼
┌──────────┐    ┌──────────────┐    ┌──────────────────┐    ┌──────────────┐
│ File     │    │  GitHub CLI  │    │  External APIs   │    │  Hardware    │
│ System   │    │  (gh)        │    │  Notion, Zapier  │    │  ESP32/Arduino│
│          │    │              │    │  Web, Obsidian   │    │  Serial/USB  │
└──────────┘    └──────────────┘    └──────────────────┘    └──────────────┘
     │
     ▼
┌──────────────┐
│  Desktop     │
│  Screenshot  │
│  Mouse/Key   │
│  Windows     │
└──────────────┘
```

### Agent Loop Flow

```
User Message → LLM (with tools) → Tool Call? → Execute Tool → Feed Result → LLM → ... → Final Response
                     │                                                    │
                     └──────── No tool calls → Return response ───────────┘
```

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** >= 20 — [Download](https://nodejs.org)
- **npm** (comes with Node.js)
- **Git** — [Download](https://git-scm.com)
- **gh CLI** (optional, for GitHub features) — [Install](https://github.com/cli/cli#installation)

### 1. Clone

```bash
git clone https://github.com/nenifix/nenicoder.git
cd nenicoder
```

### 2. Install

```bash
npm install
```

### 3. Create Your Telegram Bot

1. Open Telegram → message [@BotFather](https://t.me/BotFather)
2. Send `/newbot`
3. Choose a name and username
4. **Copy the bot token** BotFather gives you
5. Message your new bot and send `/start`

### 4. Get Your Telegram User ID

Message [@userinfobot](https://t.me/userinfobot) — it replies with your ID. This is your security key.

### 5. Configure

```bash
cp .env.example .env
# Edit .env with your values
```

**Minimum required:**
```env
TELEGRAM_BOT_TOKEN=123456789:ABCdefGHIjklMNOpqrsTUVwxyz
ALLOWED_USER_ID=7346141162
OPENROUTER_API_KEY=sk-or-v1-...
MODEL=openrouter/anthropic/claude-sonnet-4
```

> 💡 **Get an OpenRouter key:** Sign up at [openrouter.ai](https://openrouter.ai) → add credits → create key at [openrouter.ai/keys](https://openrouter.ai/keys)

### 6. Build

```bash
npm run build
```

### 7. Run

```bash
npm start
```

Your bot is live! Send it a message on Telegram to start.

### 8. (Optional) Global CLI

```bash
npm link
opencodechat   # run from any directory
```

---

## ⚙️ Configuration

### Environment Variables

| Variable | Required | Default | Description |
|---|---|---|---|
| `TELEGRAM_BOT_TOKEN` | ✅ | — | Bot token from @BotFather |
| `ALLOWED_USER_ID` | ✅ | — | Your Telegram user ID (security) |
| `OPENROUTER_API_KEY` | ✅* | — | OpenRouter API key |
| `MODEL_BASE_URL` | ✅* | OpenRouter | Ollama/LM Studio URL |
| `MODEL` | ✅ | `openrouter/auto` | Model name |
| `WORKSPACE` | No | `./workspace` | Agent workspace directory |
| `MAX_CONTEXT_MESSAGES` | No | `20` | Chat history limit |
| `NOTION_API_KEY` | No | — | Notion integration token |
| `ZAPIER_API_KEY` | No | — | Zapier API key |
| `ZAPIER_WEBHOOK_URL` | No | — | Zapier catch hook URL |
| `TASK_LOG_DIR` | No | `./logs` | Task log directory |
| `CHROME_PATH` | No | *(auto)* | Path to Chrome/Chromium executable for browser tools |

*\*One of `OPENROUTER_API_KEY` or `MODEL_BASE_URL` is required.*

### Model Providers

| Provider | `MODEL_BASE_URL` | Cost | Best For |
|---|---|---|---|
| **OpenRouter** | *(default)* | Pay-per-use | 100+ models, best quality |
| **Ollama** | `http://localhost:11434/v1` | Free | Local, private, no internet |
| **LM Studio** | `http://localhost:1234/v1` | Free | Local, easy UI |

---

## 🛠️ Tool Reference

### Files

| Tool | Description |
|---|---|
| `read_file` | Read a file from the workspace |
| `write_file` | Create or overwrite a file (auto-creates directories) |
| `list_dir` | List files and directories |
| `search` | Search file contents (regex supported) |
| `delete_file` | Delete a file |

### Shell

| Tool | Description |
|---|---|
| `exec` | Execute any shell command |

### Web

| Tool | Description |
|---|---|
| `web_search` | Search the web (DuckDuckGo) |
| `web_fetch` | Fetch and extract readable content from a URL |
| `download_file` | Download any file to the workspace |

### Browser (12 tools)

| Tool | Description |
|---|---|
| `browser_navigate` | Navigate to a URL in the headless browser |
| `browser_snapshot` | Extract readable text from the page (optional CSS selector) |
| `browser_screenshot` | Take a screenshot, saves to workspace/screenshots/ |
| `browser_click` | Click an element by CSS selector |
| `browser_type` | Type text into an input field |
| `browser_scroll` | Scroll the page (up/down/top/bottom) |
| `browser_evaluate` | Run JavaScript on the page (scraping, extraction) |
| `browser_tabs` | Manage tabs (list/new/close/switch) |
| `browser_wait` | Wait for element or fixed time |
| `browser_back` | Go back in browser history |
| `browser_info` | Get current page URL and title |
| `browser_close` | Close the browser |

### Computer Use (10 tools)

| Tool | Description |
|---|---|
| `computer_screenshot` | Capture desktop screen → workspace/screenshots/ |
| `computer_click` | Click mouse at (x, y) — left/right/double |
| `computer_move` | Move mouse cursor to (x, y) |
| `computer_type` | Type text via keyboard |
| `computer_key` | Press key or combo (ctrl+c, alt+tab, enter, etc.) |
| `computer_scroll` | Scroll mouse wheel up/down |
| `computer_window` | List/focus/minimize desktop windows |
| `computer_clipboard` | Read/write system clipboard |
| `computer_screen_info` | Get resolution, DPI, mouse position |
| `computer_pixel` | Get RGB color at pixel (x, y) |

### ESP32 / Arduino (10 tools)

| Tool | Description |
|---|---|
| `mcu_new_project` | Create project with template (.ino + platformio.ini) |
| `mcu_write_code` | Write source files (.ino, .cpp, .h) |
| `mcu_compile` | Compile via arduino-cli |
| `mcu_upload` | Upload to board via USB/serial |
| `mcu_serial` | Read/write serial monitor |
| `mcu_boards` | List connected boards and ports |
| `mcu_libraries` | Search/install/list Arduino libraries |
| `mcu_pinout` | Pinout reference (ESP32, Uno, ESP32-CAM, NodeMCU) |
| `mcu_example` | Code examples (blink, wifi, mqtt, sensor, oled, servo, bluetooth) |
| `mcu_debug` | Debug common MCU issues |

### GitHub (16 tools)

| Tool | Description |
|---|---|
| `gh_repo_create` | Create a new GitHub repository |
| `gh_commit_push` | Stage, commit, and push code |
| `gh_sync` | Pull latest changes |
| `gh_pr_create` | Open a Pull Request |
| `gh_pr_list` | List Pull Requests |
| `gh_pr_merge` | Merge a PR |
| `gh_issue_create` | Create an Issue |
| `gh_issue_list` | List Issues |
| `gh_branch_create` | Create a branch |
| `gh_branch_list` | List branches |
| `gh_branch_checkout` | Switch branches |
| `gh_gist_create` | Create a Gist |
| `gh_gist_list` | List Gists |
| `gh_run_list` | List GitHub Actions runs |
| `gh` | Raw pass-through to `gh` CLI |

### Obsidian (7 tools)

| Tool | Description |
|---|---|
| `obsidian_read` | Read a note from your vault |
| `obsidian_search` | Search notes by content |
| `obsidian_list` | List notes in a directory |
| `obsidian_create` | Create a new note |
| `obsidian_append` | Append content to a note |
| `obsidian_daily` | Generate a daily brief |
| `obsidian_task` | Log a task to your vault |

### Notion (6 tools)

| Tool | Description |
|---|---|
| `notion_search` | Search Notion workspace |
| `notion_read_page` | Read a page as Markdown |
| `notion_create_page` | Create a new page |
| `notion_update_page` | Update page content |
| `notion_query_db` | Query a Notion database |
| `notion_append` | Append blocks to a page |

### Zapier (3 tools)

| Tool | Description |
|---|---|
| `zapier_trigger` | Trigger a Zapier catch hook |
| `zapier_webhook` | POST to any webhook URL |
| `zapier_run_action` | Run a Zapier API action |

---

## 🔌 MCP Server & REST API

### stdio Mode (for IDEs)

Connect NeniCoder to Claude Code, Cursor, Windsurf, or any MCP-compatible IDE:

```bash
node dist/mcp.js
```

### HTTP Mode (REST API)

```bash
node dist/mcp.js --http --port 3001
```

### Endpoints

| Method | Path | Description |
|---|---|---|
| `GET` | `/health` | Server status |
| `GET` | `/tools` | List all available tools |
| `POST` | `/tools/:name` | Call a tool directly |
| `POST` | `/mcp` | JSON-RPC MCP endpoint |

### REST Examples

```bash
# Search the web
curl -X POST http://localhost:3001/tools/web_search \
  -H "Content-Type: application/json" \
  -d '{"query": "TypeScript best practices"}'

# Create a file
curl -X POST http://localhost:3001/tools/write_file \
  -H "Content-Type: application/json" \
  -d '{"path": "hello.ts", "content": "console.log(\"hello\")"}'

# Run a command
curl -X POST http://localhost:3001/tools/exec \
  -H "Content-Type: application/json" \
  -d '{"command": "ls -la"}'

# Read a file
curl -X POST http://localhost:3001/tools/read_file \
  -H "Content-Type: application/json" \
  -d '{"path": "README.md"}'
```

---

## 💬 Usage Examples

### From Telegram

```
You: Create a new GitHub repo called "my-api" with a Node.js Express server
→ Bot creates repo, writes server code, installs deps, and pushes to GitHub

You: Search the web for "Node.js 20 new features"
→ Bot searches DuckDuckGo and summarizes the top results

You: Read my Obsidian note about API design patterns
→ Bot reads your vault and returns the note content

You: Download this PDF: https://example.com/spec.pdf
→ Bot downloads the file to your workspace

You: Show me my open PRs
→ Bot lists all your open GitHub Pull Requests

You: Create a Notion page with today's meeting notes
→ Bot creates a new page in your Notion workspace
```
You: What model are you using?
→ Bot replies with current provider, model, and workspace info

You: Go to https://example.com and tell me what's on the page
→ Bot navigates browser, extracts text, summarizes content

You: Take a screenshot of https://github.com/nenifix
→ Bot captures screenshot and sends the file path

You: Create an ESP32 project called sensor-hub
→ Bot creates project folder, writes web server code, generates platformio.ini

You: Show me the ESP32 pinout
→ Bot returns full GPIO, ADC, I2C, SPI, UART reference

You: What's the color of the pixel at (100, 200)?
→ Bot captures screen and returns RGB value

You: List all my open windows
→ Bot returns window titles and process names

You: Search Google for "Node.js 20 features" and click the first result
→ Bot navigates, types into search, clicks result, reads page content
```

### Telegram Commands

| Command | Description |
|---|---|
| `/start` | Welcome message and quick guide |
| `/help` | Full command and tool listing |
| `/status` | Current model, provider, workspace |
| `/config model <name>` | Switch model at runtime |
| `/workspace <path>` | Change workspace directory |
| `/reset` | Clear conversation history |

---

## 🧑‍💻 Development

### Project Structure

```
nenicoder/
├── src/
│   ├── index.ts              # Entry point — starts the bot
│   ├── agent.ts              # Agent loop (LLM + tool orchestration)
│   ├── llm.ts                # LLM client (OpenRouter/Ollama/LM Studio)
│   ├── config.ts             # Environment config loader
│   ├── telegram.ts           # Telegram bot handlers (Telegraf)
│   ├── mcp.ts                # MCP server + REST API
│   └── tools/
│       ├── index.ts          # Tool registry (50+ definitions + dispatcher)
│       ├── exec.ts           # Shell command execution
│       ├── read.ts           # File reading
│       ├── write.ts          # File writing
│       ├── list.ts           # Directory listing
│       ├── search.ts         # File content search
│       ├── github.ts         # GitHub CLI wrappers (16 tools)
│       ├── web.ts            # Web search / fetch / download
│       ├── browser.ts         # Browser automation (Puppeteer + Chrome)
│       ├── computer.ts        # Desktop automation (10 tools)
│       ├── mcu.ts             # ESP32/Arduino coding (10 tools)
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
```

### Adding a New Tool

**Step 1** — Create `src/tools/mytool.ts`:
```typescript
export async function myTool(arg1: string): Promise<string> {
  // Your implementation
  return "result";
}
```

**Step 2** — Register in `src/tools/index.ts`:
```typescript
import * as mytool from "./mytool.js";

// Add to toolDefinitions array:
{
  type: "function",
  function: {
    name: "my_tool",
    description: "What this tool does",
    parameters: {
      type: "object",
      properties: {
        arg1: { type: "string", description: "Description" },
      },
      required: ["arg1"],
    },
  },
}

// Add to executeTool switch:
case "my_tool":
  return await mytool.myTool(args.arg1);
```

**Step 3** — Build: `npm run build`

### NPM Scripts

| Command | Description |
|---|---|
| `npm run dev` | Development mode (hot reload with tsx) |
| `npm run build` | Compile TypeScript to JavaScript |
| `npm start` | Run the compiled bot |
| `npm link` | Install as global `opencodechat` command |

---

## 🔒 Security

- **User whitelist** — Only `ALLOWED_USER_ID` can interact with the bot
- **Workspace isolation** — Agent operates within the configured workspace
- **No credential exposure** — API keys in `.env` (gitignored), never sent to LLM
- **Task logging** — All actions logged to `logs/tasks.jsonl` for auditability

---

## 🤝 Contributing

NeniCoder is open-source and welcomes contributions from everyone, especially African developers!

1. Fork the repo
2. Create a branch: `git checkout -b feature/amazing-thing`
3. Commit: `git commit -m "Add amazing thing"`
4. Push: `git push origin feature/amazing-thing`
5. Open a Pull Request

---

## 📜 License

MIT License — see [LICENSE](LICENSE) for details.

---

## 🔗 Links

- **GitHub:** [github.com/nenifix/nenicoder](https://github.com/nenifix/nenicoder)
- **Telegram Bot:** [@Opencodeclichatbot](https://t.me/Opencodeclichatbot)
- **Nenifix:** [github.com/nenifix](https://github.com/nenifix)
- **OpenRouter:** [openrouter.ai](https://openrouter.ai)
- **MCP Protocol:** [modelcontextprotocol.io](https://modelcontextprotocol.io)

---

<div align="center">

**Built with ❤️ by [Nenifix](https://github.com/nenifix) — Empowering STEM in Africa**

*Shengineers · RoboFix · NeniLearn · Tourfix*

⭐ Star the repo if you find it useful!

</div>
