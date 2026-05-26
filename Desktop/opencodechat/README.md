<div align="center">

# 🤖 NeniCoder

**An AI-powered coding agent on Telegram — by [Nenifix](https://github.com/nenifix)**

[![Node.js](https://img.shields.io/badge/Node.js-%3E%3D20-339933?logo=nodedotjs)](https://node.js.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript)](https://typescriptlang.org)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Telegram](https://img.shields.io/badge/Telegram-Bot-26A5E4?logo=telegram)](https://t.me/Opencodeclichatbot)

*Build, deploy, and manage your codebase — all from a Telegram chat.*

</div>

---

## 👋 About NeniCoder & Nenifix

**NeniCoder** is an open-source AI coding agent built by **[Nenifix](https://github.com/nenifix)** — a Ghana-based brand engineering and STEM innovation hub.

### Who is Nenifix?

Founded by **Godwin Appiah (Neni)** with 13+ years across petroleum, healthcare, maritime, and government sectors, Nenifix offers:

| Service | What we do |
|---|---|
| **NeniFix Agency** | Brand engineering, print & fabrication |
| **RoboFix / AiFix** | Robotics and AI training programs |
| **NeniLearn LMS** | Learning management & education platform |
| **Tourfix** | Tourism experiences |

🚀 **Flagship program:** [Shengineers](https://github.com/nenifix) — a free 6-month women-in-STEM program with a job guarantee.

> *"We don't just build software. We build people who build software."*

---

## ✨ Features

NeniCoder is more than a chatbot — it's a full AI agent with **50+ tools** across 8 categories:

### 📁 File Operations
Read, write, list, and search files in your workspace. Create entire project structures from a single message.

### 🖥️ Shell / Command Execution
Run builds, install packages, execute tests, manage git — all through natural language.

### 🐙 GitHub Integration (16 tools)
- Create repos, push code, manage branches
- Open/merge/comment on Pull Requests
- Create/assign/close Issues
- Manage Gists
- Monitor GitHub Actions / CI runs
- Full `gh` CLI pass-through for advanced operations

### 🌐 Web Tools
- **Search** the web (DuckDuckGo)
- **Fetch** any URL and extract readable content
- **Download** files directly to your workspace

### 📝 Obsidian Vault Integration
- Read, search, and list notes
- Create and append to notes
- Auto-generate daily briefs
- Log tasks directly to your vault

### 📋 Notion Integration
- Search across your workspace
- Read pages as Markdown
- Create and update pages
- Query databases

### ⚡ Zapier Webhooks
- Trigger Zapier workflows
- Send data to any webhook URL
- Run custom Zapier actions via API

### 🔌 MCP Server + REST API
- **stdio transport** — connect to Claude Code, Cursor, or any MCP-compatible IDE
- **HTTP mode** — REST endpoints for health checks, tool listing, and direct tool calls
- JSON-RPC MCP endpoint for advanced integrations

---

## 🏗️ Architecture

```
┌──────────────────────────────────────────────────────┐
│                    Telegram Chat                      │
│                  (@Opencodeclichatbot)                │
└──────────────────────┬───────────────────────────────┘
                       │ Telegraf.js
┌──────────────────────▼───────────────────────────────┐
│                  Agent Loop                           │
│  ┌─────────────┐  ┌──────────┐  ┌────────────────┐  │
│  │  LLM Client  │  │  Tools   │  │  Task Logger   │  │
│  │ (OpenRouter/ │  │ Registry │  │ (JSONL file)   │  │
│  │  Ollama/     │  │ (50+)   │  │                │  │
│  │  LM Studio)  │  │         │  │                │  │
│  └─────────────┘  └────┬─────┘  └────────────────┘  │
└────────────────────────┬─────────────────────────────┘
                         │
    ┌────────────────────┼────────────────────┐
    ▼                    ▼                    ▼
┌────────┐    ┌──────────────┐    ┌──────────────┐
│ Files   │    │  GitHub CLI  │    │  Web / APIs  │
│ystem   │    │  (gh)        │    │  curl, fetch │
└────────┘    └──────────────┘    └──────────────┘
```

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** >= 20
- **npm** or **pnpm**
- **Git**
- **gh CLI** (optional, for GitHub features) — [install guide](https://github.com/cli/cli#installation)

### 1. Clone the Repository

```bash
git clone https://github.com/nenifix/nenicoder.git
cd nenicoder
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Create Your Telegram Bot

1. Open Telegram and message [@BotFather](https://t.me/BotFather)
2. Send `/newbot`
3. Follow the prompts — choose a name and username
4. Copy the **bot token** BotFather gives you
5. Message your new bot (`@YourBotUsername`) and send `/start`

### 4. Get Your Telegram User ID

Message [@userinfobot](https://t.me/userinfobot) on Telegram — it will reply with your user ID. You need this so only *you* can control the bot.

### 5. Configure Environment

```bash
cp .env.example .env
nano .env   # or use any text editor
```

Fill in the **required** values:

```env
# ── Required ──────────────────────────────
TELEGRAM_BOT_TOKEN=123456789:ABCdefGHIjklMNOpqrsTUVwxyz
ALLOWED_USER_ID=7346141162

# ── Model Provider ────────────────────────
# Option A: OpenRouter (recommended — access to 100+ models)
OPENROUTER_API_KEY=sk-or-v1-your-key
MODEL=openrouter/anthropic/claude-sonnet-4

# Option B: Ollama (local, free)
# MODEL_BASE_URL=http://localhost:11434/v1
# MODEL=llama3

# Option C: LM Studio (local)
# MODEL_BASE_URL=http://localhost:1234/v1
# MODEL=local-model

# ── Optional ──────────────────────────────
WORKSPACE=./workspace
MAX_CONTEXT_MESSAGES=20
```

> **💡 Getting an OpenRouter key:** Sign up at [openrouter.ai](https://openrouter.ai), add credits, and create an API key at [openrouter.ai/keys](https://openrouter.ai/keys).

### 6. Build

```bash
npm run build
```

### 7. Run

```bash
npm start
```

Your bot is now live on Telegram! Send it a message to start.

### 8. (Optional) Install as Global CLI

```bash
npm link
opencodechat   # run from any directory
```

---

## ⚙️ Configuration Reference

### Environment Variables

| Variable | Required | Description |
|---|---|---|
| `TELEGRAM_BOT_TOKEN` | ✅ | Bot token from @BotFather |
| `ALLOWED_USER_ID` | ✅ | Your Telegram user ID (security) |
| `OPENROUTER_API_KEY` | ✅* | OpenRouter API key (A) |
| `MODEL_BASE_URL` | ✅* | Ollama/LM Studio URL (B/C) |
| `MODEL` | ✅ | Model name, e.g. `openrouter/owl-alpha` |
| `WORKSPACE` | No | Agent workspace directory |
| `MAX_CONTEXT_MESSAGES` | No | Chat history limit (default: 20) |
| `NOTION_API_KEY` | No | Notion integration token |
| `ZAPIER_API_KEY` | No | Zapier API key |
| `ZAPIER_WEBHOOK_URL` | No | Zapier catch hook URL |
| `TASK_LOG_DIR` | No | Task log directory (default: `./logs`) |

*\* One of `OPENROUTER_API_KEY` or `MODEL_BASE_URL` is required depending on your provider.*

### Provider Selection

| Provider | Setup | Best For |
|---|---|---|
| **OpenRouter** | Set `OPENROUTER_API_KEY` + `MODEL` | Best models, pay-per-use, 100+ models |
| **Ollama** | Set `MODEL_BASE_URL` + `MODEL`, comment out `OPENROUTER_API_KEY` | Free, local, privacy |
| **LM Studio** | Set `MODEL_BASE_URL` + `MODEL`, comment out `OPENROUTER_API_KEY` | Free, local, easy UI |

---

## 🛠️ Tool Reference

### File Operations

| Tool | Description |
|---|---|
| `read_file` | Read a file from the workspace |
| `write_file` | Create or overwrite a file |
| `list_dir` | List directory contents |
| `search` | Search files by content (regex supported) |
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

### GitHub

| Tool | Description |
|---|---|
| `gh_repo_create` | Create a new GitHub repo |
| `gh_commit_push` | Stage, commit, and push code |
| `gh_sync` | Pull latest changes |
| `gh_pr_create` | Open a Pull Request |
| `gh_pr_list` | List PRs |
| `gh_pr_merge` | Merge a PR |
| `gh_issue_create` | Create an Issue |
| `gh_issue_list` | List Issues |
| `gh_branch_create` | Create a branch |
| `gh_branch_list` | List branches |
| `gh_branch_checkout` | Switch branches |
| `gh_gist_create` | Create a Gist |
| `gh_gist_list` | List Gists |
| `gh_run_list` | List GitHub Actions runs |
| `gh` | Pass-through to raw `gh` CLI |

### Obsidian

| Tool | Description |
|---|---|
| `obsidian_read` | Read a note from your vault |
| `obsidian_search` | Search notes by content |
| `obsidian_list` | List notes in a directory |
| `obsidian_create` | Create a new note |
| `obsidian_append` | Append content to a note |
| `obsidian_daily` | Generate a daily brief |
| `obsidian_task` | Log a task to your vault |

### Notion

| Tool | Description |
|---|---|
| `notion_search` | Search Notion workspace |
| `notion_read_page` | Read a page as Markdown |
| `notion_create_page` | Create a new page |
| `notion_update_page` | Update page content |
| `notion_query_db` | Query a Notion database |
| `notion_append` | Append blocks to a page |

### Zapier

| Tool | Description |
|---|---|
| `zapier_trigger` | Trigger a Zapier catch hook |
| `zapier_webhook` | POST to any webhook URL |
| `zapier_run_action` | Run a Zapier API action |

### Task Logger

Every action the agent takes is automatically logged to `logs/tasks.jsonl` — a persistent, append-only JSON Lines file. Each entry includes:
- Timestamp
- User message
- Tools called
- Results summary

---

## 🔌 MCP Server & REST API

### stdio Mode (for IDEs)

Connect NeniCoder to Claude Code, Cursor, or any MCP-compatible IDE:

```bash
node dist/mcp.js
```

### HTTP Mode (REST API)

Start the HTTP server:

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

### Example: Call a Tool via REST

```bash
# Search for something
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
```

---

## 💬 Usage Examples

### From Telegram

```
You: Create a new GitHub repo called "my-project" and add a README.md
→ Bot creates repo, adds README, and pushes to GitHub

You: Search the web for Node.js 20 new features
→ Bot searches DuckDuckGo and summarizes results

You: Read my Obsidian note about API design
→ Bot reads and returns the note content (set OBSIDIAN_VAULT_PATH first)

You: Download this file: https://example.com/report.pdf
→ Bot downloads the file to your workspace

You: Show me my open PRs
→ Bot lists all your open GitHub Pull Requests

You: Create a Notion page with today's notes
→ Bot creates a new page in your Notion workspace
```

---

## 🧑‍💻 Development

### Project Structure

```
nenicoder/
├── src/
│   ├── index.ts           # Entry point — Telegraf bot
│   ├── agent.ts           # Agent loop — LLM + tool orchestration
│   ├── llm.ts             # LLM client (OpenRouter / Ollama / LM Studio)
│   ├── config.ts          # Environment variable loader
│   ├── mcp.ts             # MCP server + REST API
│   ├── telegram.ts        # Telegram message handler
│   ├── tasklog.ts         # Persistent task logger
│   └── tools/
│       ├── index.ts       # Tool registry (50+ definitions + dispatcher)
│       ├── exec.ts        # Shell command execution
│       ├── read.ts        # File reading
│       ├── write.ts       # File writing
│       ├── list.ts        # Directory listing
│       ├── search.ts      # File content search
│       ├── github.ts      # GitHub CLI wrappers
│       ├── web.ts         # Web search / fetch / download
│       ├── obsidian.ts    # Obsidian vault tools
│       ├── notion.ts      # Notion API tools
│       └── zapier.ts      # Zapier webhook tools
├── dist/                  # Compiled JavaScript
├── logs/                  # Task logs (auto-created)
├── workspace/             # Default agent workspace
├── scripts/
│   └── downloader.py      # Robust file downloader script
├── .env                   # Your config (never commit this)
├── .env.example           # Config template
├── package.json           # bin: opencodechat
└── tsconfig.json          # TypeScript config
```

### Adding a New Tool

1. Create a new file in `src/tools/mytool.ts`:

```typescript
export async function myTool(arg1: string, arg2?: string): Promise<string> {
  // Your implementation
  return "result";
}
```

2. Register it in `src/tools/index.ts`:

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
        arg1: { type: "string", description: "First argument" },
      },
      required: ["arg1"],
    },
  },
}

// Add to executeTool switch:
case "my_tool":
  return await mytool.myTool(args.arg1, args.arg2);
```

3. Build: `npm run build`

### Scripts

| Command | Description |
|---|---|
| `npm run dev` | Run in development mode (hot reload with tsx) |
| `npm run build` | Compile TypeScript to JavaScript |
| `npm start` | Run the compiled bot |
| `npm link` | Install as global `opencodechat` command |

---

## 🔒 Security

- **User whitelist**: Only the `ALLOWED_USER_ID` can interact with the bot
- **Workspace isolation**: The agent operates within the configured workspace directory
- **No credential exposure**: API keys stay in `.env` (gitignored) — never logged or sent to the LLM
- **Task logging**: All actions are logged for auditability

---

## 🤝 Contributing

NeniCoder is open-source and welcomes contributions!

1. Fork the repo
2. Create a feature branch: `git checkout -b feature/amazing-thing`
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

---

<div align="center">

**Built with ❤️ by [Nenifix](https://github.com/nenifix) — Empowering STEM in Africa**

⭐ Star the repo if you find it useful!

</div>
