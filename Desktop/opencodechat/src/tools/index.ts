import { exec } from "./exec.js";
import { readFile } from "./read.js";
import { writeFile } from "./write.js";
import { listDir } from "./list.js";
import { search } from "./search.js";
import * as github from "./github.js";
import * as web from "./web.js";
import * as obsidian from "./obsidian.js";
import * as notion from "./notion.js";
import * as zapier from "./zapier.js";
import * as tasklog from "./tasklog.js";
import * as browser from "./browser.js";
import * as computer from "./computer.js";
import * as mcu from "./mcu.js";
import * as pdfTools from "./pdf.js";

export interface ToolDefinition {
  type: "function";
  function: {
    name: string;
    description: string;
    parameters: object;
  };
}

export const toolDefinitions: ToolDefinition[] = [
  // ── Shell ───────────────────────────────────────────
  {
    type: "function",
    function: {
      name: "exec",
      description: "Run a shell command. Works on Windows (cmd) and Linux/Mac (bash). Use for builds, git, npm, tests, etc.",
      parameters: {
        type: "object",
        properties: {
          command: { type: "string", description: "The shell command to run" },
        },
        required: ["command"],
      },
    },
  },

  // ── Files ───────────────────────────────────────────
  {
    type: "function",
    function: {
      name: "read_file",
      description: "Read a file from the workspace. Returns full file content.",
      parameters: {
        type: "object",
        properties: {
          path: { type: "string", description: "File path relative to workspace" },
        },
        required: ["path"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "write_file",
      description: "Write content to a file in the workspace. Creates parent dirs if needed.",
      parameters: {
        type: "object",
        properties: {
          path: { type: "string", description: "File path relative to workspace" },
          content: { type: "string", description: "File content to write" },
        },
        required: ["path", "content"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "list_dir",
      description: "List files and directories in the workspace.",
      parameters: {
        type: "object",
        properties: {
          path: { type: "string", description: "Directory path relative to workspace (default: root)", default: "." },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "search",
      description: "Search for text patterns in files. Uses grep on Mac/Linux, findstr on Windows.",
      parameters: {
        type: "object",
        properties: {
          pattern: { type: "string", description: "Text or regex pattern to search for" },
          path: { type: "string", description: "Directory to search in (default: workspace root)", default: "." },
        },
        required: ["pattern"],
      },
    },
  },

  // ── GitHub: Repos ───────────────────────────────────
  {
    type: "function",
    function: {
      name: "gh_repo_create",
      description: "Create a new GitHub repo under the nenifix account. Use for projects, prototypes, anything worth keeping online.",
      parameters: {
        type: "object",
        properties: {
          name: { type: "string", description: "Repo name (e.g. 'my-project')" },
          description: { type: "string", description: "Short repo description" },
          private: { type: "boolean", description: "Make private (default: false = public)" },
          push: { type: "boolean", description: "Push current workspace contents (default: false)" },
        },
        required: ["name"],
      },
    },
  },

  // ── GitHub: Commits & Push ──────────────────────────
  {
    type: "function",
    function: {
      name: "gh_commit_push",
      description: "Stage all changes, commit, and push to GitHub. Full git workflow in one step.",
      parameters: {
        type: "object",
        properties: {
          message: { type: "string", description: "Commit message" },
          branch: { type: "string", description: "Branch name (default: current branch)" },
        },
        required: ["message"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "gh_sync",
      description: "Pull latest from remote and push local changes (git pull --rebase && git push).",
      parameters: {
        type: "object",
        properties: {},
      },
    },
  },

  // ── GitHub: Pull Requests ───────────────────────────
  {
    type: "function",
    function: {
      name: "gh_pr_create",
      description: "Create a pull request on GitHub.",
      parameters: {
        type: "object",
        properties: {
          title: { type: "string", description: "PR title" },
          body: { type: "string", description: "PR description" },
          base: { type: "string", description: "Target branch (default: main)" },
          draft: { type: "boolean", description: "Create as draft PR" },
        },
        required: ["title"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "gh_pr_list",
      description: "List pull requests for the current repo. State: open, closed, merged, all.",
      parameters: {
        type: "object",
        properties: {
          state: { type: "string", description: "Filter by state: open, closed, merged, all" },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "gh_pr_merge",
      description: "Merge a pull request. Method: merge, squash, or rebase.",
      parameters: {
        type: "object",
        properties: {
          pr_number: { type: "string", description: "PR number" },
          method: { type: "string", description: "Merge method: merge, squash, rebase" },
        },
        required: ["pr_number"],
      },
    },
  },

  // ── GitHub: Issues ──────────────────────────────────
  {
    type: "function",
    function: {
      name: "gh_issue_create",
      description: "Create a GitHub issue.",
      parameters: {
        type: "object",
        properties: {
          title: { type: "string", description: "Issue title" },
          body: { type: "string", "description": "Issue description" },
          labels: { type: "string", description: "Comma-separated labels (e.g. 'bug,urgent')" },
        },
        required: ["title"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "gh_issue_list",
      description: "List issues. State: open, closed, all.",
      parameters: {
        type: "object",
        properties: {
          state: { type: "string", description: "Filter by state: open, closed, all" },
        },
      },
    },
  },

  // ── GitHub: Branches ───────────────────────────────
  {
    type: "function",
    function: {
      name: "gh_branch_list",
      description: "List all branches (local + remote).",
      parameters: {
        type: "object",
        properties: {},
      },
    },
  },
  {
    type: "function",
    function: {
      name: "gh_branch_create",
      description: "Create and switch to a new branch.",
      parameters: {
        type: "object",
        properties: {
          name: { type: "string", description: "Branch name" },
        },
        required: ["name"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "gh_branch_checkout",
      description: "Switch to an existing branch.",
      parameters: {
        type: "object",
        properties: {
          name: { type: "string", description: "Branch name" },
        },
        required: ["name"],
      },
    },
  },

  // ── GitHub: Gists ───────────────────────────────────
  {
    type: "function",
    function: {
      name: "gh_gist_create",
      description: "Create a GitHub Gist from a file. Great for sharing snippets.",
      parameters: {
        type: "object",
        properties: {
          filename: { type: "string", description: "File path in workspace" },
          description: { type: "string", description: "Gist description" },
          pub: { type: "boolean", description: "Public gist (default: true; false = secret)" },
        },
        required: ["filename"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "gh_gist_list",
      description: "List your GitHub Gists.",
      parameters: {
        type: "object",
        properties: {},
      },
    },
  },

  // ── GitHub: CI / Workflows ──────────────────────────
  {
    type: "function",
    function: {
      name: "gh_run_list",
      description: "List recent GitHub Actions workflow runs.",
      parameters: {
        type: "object",
        properties: {
          limit: { type: "string", description: "Number of runs to show (default: 10)" },
        },
      },
    },
  },

  // ── GitHub: Generic pass-through ────────────────────
  {
    type: "function",
    function: {
      name: "gh",
      description: "Run any raw gh CLI command. Advanced: use when no specific tool covers what you need (e.g. gh release create, gh repo edit, gh project create, etc.)",
      parameters: {
        type: "object",
        properties: {
          args: { type: "string", description: "Raw gh CLI arguments (without the 'gh' prefix)" },
        },
        required: ["args"],
      },
    },
  },

  // ── Web: Search ──────────────────────────────────────
  {
    type: "function",
    function: {
      name: "web_search",
      description: "Search the web via DuckDuckGo. Returns top results with titles, URLs, and snippets.",
      parameters: {
        type: "object",
        properties: {
          query: { type: "string", description: "Search query" },
          max_results: { type: "string", description: "Number of results (default: 5)" },
        },
        required: ["query"],
      },
    },
  },

  // ── Web: Fetch ───────────────────────────────────────
  {
    type: "function",
    function: {
      name: "web_fetch",
      description: "Fetch a URL and extract readable text. Good for reading docs, articles, API responses.",
      parameters: {
        type: "object",
        properties: {
          url: { type: "string", description: "HTTP or HTTPS URL to fetch" },
        },
        required: ["url"],
      },
    },
  },

  // ── Web: Download ────────────────────────────────────
  {
    type: "function",
    function: {
      name: "download_file",
      description: "Download a file from a URL to the workspace. Supports images, PDFs, binaries, etc.",
      parameters: {
        type: "object",
        properties: {
          url: { type: "string", description: "URL of the file to download" },
          dest: { type: "string", description: "Destination path in workspace (e.g. 'assets/image.png')" },
        },
        required: ["url", "dest"],
      },
    },
  },

  // ── Obsidian: Read/Search ─────────────────────────────
  {
    type: "function",
    function: {
      name: "obsidian_read",
      description: "Read a note from the Nenifix Obsidian vault. Path is relative to vault root.",
      parameters: {
        type: "object",
        properties: {
          path: { type: "string", description: "Note path relative to vault (e.g. 'Daily Briefs/2026-05-26.md')" },
        },
        required: ["path"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "obsidian_search",
      description: "Search notes in the Obsidian vault by content or filename.",
      parameters: {
        type: "object",
        properties: {
          query: { type: "string", description: "Search term to find in notes" },
        },
        required: ["query"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "obsidian_list",
      description: "List notes and folders in a vault directory.",
      parameters: {
        type: "object",
        properties: {
          path: { type: "string", description: "Directory path relative to vault (default: root)" },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "obsidian_create",
      description: "Create a new note in the Obsidian vault.",
      parameters: {
        type: "object",
        properties: {
          path: { type: "string", description: "Note path relative to vault (e.g. 'Projects/New.md')" },
          content: { type: "string", description: "Markdown content for the note" },
        },
        required: ["path", "content"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "obsidian_append",
      description: "Append text to an existing note in the vault.",
      parameters: {
        type: "object",
        properties: {
          path: { type: "string", description: "Note path relative to vault" },
          content: { type: "string", description: "Markdown text to append" },
        },
        required: ["path", "content"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "obsidian_daily",
      description: "Create or read today's daily note. Auto-creates timestamped daily brief.",
      parameters: {
        type: "object",
        properties: {
          content: { type: "string", description: "Optional content to add to today's daily note" },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "obsidian_task",
      description: "Log a task to today's task note in the vault.",
      parameters: {
        type: "object",
        properties: {
          task: { type: "string", description: "Task description" },
          status: { type: "string", description: "Status: pending or done (default: pending)" },
        },
        required: ["task"],
      },
    },
  },

  // ── Notion: Pages & Databases ─────────────────────────
  {
    type: "function",
    function: {
      name: "notion_search",
      description: "Search Notion pages and databases. Requires NOTION_API_KEY in .env.",
      parameters: {
        type: "object",
        properties: {
          query: { type: "string", description: "Search query" },
        },
        required: ["query"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "notion_read_page",
      description: "Read a Notion page as markdown. Requires page ID.",
      parameters: {
        type: "object",
        properties: {
          page_id: { type: "string", description: "Notion page ID" },
        },
        required: ["page_id"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "notion_create_page",
      description: "Create a new Notion page. Requires parent page ID.",
      parameters: {
        type: "object",
        properties: {
          parent_id: { type: "string", description: "Parent page or database ID" },
          title: { type: "string", description: "Page title" },
          markdown: { type: "string", description: "Page content in markdown" },
        },
        required: ["parent_id", "title"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "notion_update_page",
      description: "Update a Notion page with new markdown content.",
      parameters: {
        type: "object",
        properties: {
          page_id: { type: "string", description: "Notion page ID" },
          markdown: { type: "string", description: "New markdown content" },
        },
        required: ["page_id", "markdown"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "notion_query_db",
      description: "Query a Notion database. Requires data source ID.",
      parameters: {
        type: "object",
        properties: {
          data_source_id: { type: "string", description: "Notion data source (database) ID" },
          filter: { type: "string", description: "Optional JSON filter string" },
        },
        required: ["data_source_id"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "notion_append",
      description: "Append a paragraph block to a Notion page.",
      parameters: {
        type: "object",
        properties: {
          page_id: { type: "string", description: "Notion page ID" },
          text: { type: "string", description: "Text to append" },
        },
        required: ["page_id", "text"],
      },
    },
  },

  // ── Zapier: Webhooks ──────────────────────────────────
  {
    type: "function",
    function: {
      name: "zapier_trigger",
      description: "Trigger a Zapier webhook (catch hook). Requires ZAPIER_WEBHOOK_URL in .env.",
      parameters: {
        type: "object",
        properties: {
          data: { type: "string", description: "JSON payload to send to Zapier" },
        },
        required: ["data"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "zapier_webhook",
      description: "Send data to any webhook URL (Zapier, Make, or custom).",
      parameters: {
        type: "object",
        properties: {
          url: { type: "string", description: "Webhook URL" },
          payload: { type: "string", description: "JSON payload to send" },
        },
        required: ["url", "payload"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "zapier_run_action",
      description: "Run a Zapier action via API. Requires ZAPIER_API_KEY in .env.",
      parameters: {
        type: "object",
        properties: {
          action_key: { type: "string", description: "Zapier action key" },
          input: { type: "string", description: "JSON input for the action" },
        },
        required: ["action_key", "input"],
      },
    },
  },

  // ── Browser ──────────────────────────────────────────
  {
    type: "function",
    function: {
      name: "browser_navigate",
      description: "Navigate to a URL in the headless browser. Opens Chrome/Chromium. Use CHROME_PATH env var if Chrome is not auto-detected.",
      parameters: {
        type: "object",
        properties: {
          url: { type: "string", description: "The URL to navigate to" },
        },
        required: ["url"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "browser_snapshot",
      description: "Extract readable text content from the current browser page. Optionally pass a CSS selector to get text from a specific element.",
      parameters: {
        type: "object",
        properties: {
          selector: { type: "string", description: "Optional CSS selector to extract text from (e.g. 'article', '.content', '#main')" },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "browser_screenshot",
      description: "Take a screenshot of the current browser page. Saves to workspace/screenshots/ as PNG.",
      parameters: {
        type: "object",
        properties: {
          filename: { type: "string", description: "Output filename (default: screenshot-TIMESTAMP.png)" },
          full_page: { type: "boolean", description: "Capture full page (default: false = viewport only)" },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "browser_click",
      description: "Click an element on the page by CSS selector. Waits for element to appear (10s timeout).",
      parameters: {
        type: "object",
        properties: {
          selector: { type: "string", description: "CSS selector for the element to click (e.g. 'button.submit', 'a.nav-link', '#login-btn')" },
        },
        required: ["selector"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "browser_type",
      description: "Type text into an input field. Waits for element to appear. Optionally clear field first.",
      parameters: {
        type: "object",
        properties: {
          selector: { type: "string", description: "CSS selector for the input element" },
          text: { type: "string", description: "Text to type" },
          clear_first: { type: "boolean", description: "Clear existing text before typing (default: false)" },
        },
        required: ["selector", "text"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "browser_scroll",
      description: "Scroll the page. Direction: up, down, top, bottom.",
      parameters: {
        type: "object",
        properties: {
          direction: { type: "string", description: "Scroll direction: up, down, top, bottom" },
          amount: { type: "number", description: "Pixels to scroll (default: 500)" },
        },
        required: ["direction"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "browser_evaluate",
      description: "Run JavaScript code on the current page. Returns the result. Use for extracting data, scraping, interacting with page APIs.",
      parameters: {
        type: "object",
        properties: {
          script: { type: "string", description: "JavaScript code to execute" },
        },
        required: ["script"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "browser_tabs",
      description: "Manage browser tabs. Actions: list (show all tabs), new (open tab, optionally with URL), close (remove tab), switch (change active tab).",
      parameters: {
        type: "object",
        properties: {
          action: { type: "string", description: "Action: list, new, close, switch" },
          url: { type: "string", description: "URL to open (for 'new' action) or tab ID (for 'switch' action)" },
        },
        required: ["action"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "browser_wait",
      description: "Wait for an element to appear or wait a fixed time. Use 'time:2000' to wait 2000ms, or a CSS selector to wait for an element.",
      parameters: {
        type: "object",
        properties: {
          selector: { type: "string", description: "CSS selector to wait for, or 'time:N' to wait N milliseconds" },
          timeout_ms: { type: "number", description: "Max wait time in ms (default: 10000)" },
        },
        required: ["selector"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "browser_back",
      description: "Go back in browser history.",
      parameters: { type: "object", properties: {} },
    },
  },
  {
    type: "function",
    function: {
      name: "browser_info",
      description: "Get current page URL and title.",
      parameters: { type: "object", properties: {} },
    },
  },
  {
    type: "function",
    function: {
      name: "browser_close",
      description: "Close the browser and free resources.",
      parameters: { type: "object", properties: {} },
    },
  },

  // ── Computer Use ───────────────────────────────────────
  {
    type: "function",
    function: {
      name: "computer_screenshot",
      description: "Capture the desktop screen. Saves to workspace/screenshots/. Uses native OS commands (PowerShell on Windows, screencapture on macOS, scrot on Linux).",
      parameters: {
        type: "object",
        properties: {
          filename: { type: "string", description: "Output filename (default: screen-TIMESTAMP.png)" },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "computer_click",
      description: "Click the mouse at pixel coordinates (x, y). Button: left or right. Optionally double-click.",
      parameters: {
        type: "object",
        properties: {
          x: { type: "string", description: "X coordinate (pixels from left)" },
          y: { type: "string", description: "Y coordinate (pixels from top)" },
          button: { type: "string", description: "left or right (default: left)" },
          double_click: { type: "boolean", description: "Double-click (default: false)" },
        },
        required: ["x", "y"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "computer_move",
      description: "Move the mouse cursor to pixel coordinates (x, y).",
      parameters: {
        type: "object",
        properties: {
          x: { type: "string", description: "X coordinate (pixels from left)" },
          y: { type: "string", description: "Y coordinate (pixels from top)" },
        },
        required: ["x", "y"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "computer_type",
      description: "Type text using the keyboard. Works on Windows (SendKeys), macOS (osascript), Linux (xdotool).",
      parameters: {
        type: "object",
        properties: {
          text: { type: "string", description: "Text to type" },
          delay_ms: { type: "string", description: "Delay between keystrokes in ms (Linux only, default: 0)" },
        },
        required: ["text"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "computer_key",
      description: "Press a key or key combination. Examples: enter, tab, escape, ctrl+c, ctrl+v, alt+tab, win+r, f1.",
      parameters: {
        type: "object",
        properties: {
          key: { type: "string", description: "Key name or combo (e.g. 'enter', 'ctrl+c', 'alt+tab')" },
        },
        required: ["key"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "computer_scroll",
      description: "Scroll the mouse wheel. Direction: up or down.",
      parameters: {
        type: "object",
        properties: {
          direction: { type: "string", description: "up or down" },
          amount: { type: "string", description: "Scroll ticks (default: 3)" },
        },
        required: ["direction"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "computer_window",
      description: "Manage desktop windows. Actions: list (show all windows), focus (bring to front), minimize.",
      parameters: {
        type: "object",
        properties: {
          action: { type: "string", description: "list, focus, minimize" },
          target: { type: "string", description: "Window title or app name (for focus action)" },
        },
        required: ["action"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "computer_clipboard",
      description: "Read or write the system clipboard. Actions: read, write.",
      parameters: {
        type: "object",
        properties: {
          action: { type: "string", description: "read or write" },
          text: { type: "string", description: "Text to write (required for write action)" },
        },
        required: ["action"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "computer_screen_info",
      description: "Get screen resolution, DPI, and current mouse position.",
      parameters: { type: "object", properties: {} },
    },
  },
  {
    type: "function",
    function: {
      name: "computer_pixel",
      description: "Get the RGB color of a pixel at coordinates (x, y).",
      parameters: {
        type: "object",
        properties: {
          x: { type: "string", description: "X coordinate" },
          y: { type: "string", description: "Y coordinate" },
        },
        required: ["x", "y"],
      },
    },
  },

  // ── ESP32 / Arduino ────────────────────────────────────
  {
    type: "function",
    function: {
      name: "mcu_new_project",
      description: "Create a new Arduino or ESP32 project with template code. Generates .ino sketch and platformio.ini.",
      parameters: {
        type: "object",
        properties: {
          name: { type: "string", description: "Project name" },
          board: { type: "string", description: "Board type: esp32, arduino_uno, esp32cam, nodemcu (default: esp32)" },
        },
        required: ["name"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "mcu_write_code",
      description: "Write source code to a file in an MCU project.",
      parameters: {
        type: "object",
        properties: {
          project_name: { type: "string", description: "Project folder name" },
          filename: { type: "string", description: "Filename (e.g. main.ino, sensor.cpp)" },
          code: { type: "string", description: "Source code content" },
        },
        required: ["project_name", "filename", "code"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "mcu_compile",
      description: "Compile an Arduino/ESP32 sketch using arduino-cli.",
      parameters: {
        type: "object",
        properties: {
          project_name: { type: "string", description: "Project folder name" },
          board: { type: "string", description: "FQBN board ID (default: esp32:esp32:esp32)" },
        },
        required: ["project_name"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "mcu_upload",
      description: "Upload compiled sketch to a board via USB/serial. Auto-detects port if not specified.",
      parameters: {
        type: "object",
        properties: {
          project_name: { type: "string", description: "Project folder name" },
          port: { type: "string", description: "Serial port (e.g. COM3, /dev/ttyUSB0). Use 'auto' to detect." },
          board: { type: "string", description: "FQBN board ID (default: esp32:esp32:esp32)" },
        },
        required: ["project_name"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "mcu_serial",
      description: "Read from or write to the serial monitor. Actions: read, write.",
      parameters: {
        type: "object",
        properties: {
          port: { type: "string", description: "Serial port (default: auto)" },
          baud: { type: "string", description: "Baud rate (default: 115200)" },
          action: { type: "string", description: "read or write" },
          data: { type: "string", description: "Data to send (for write action)" },
        },
        required: ["action"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "mcu_boards",
      description: "List connected Arduino/ESP32 boards and their ports.",
      parameters: { type: "object", properties: {} },
    },
  },
  {
    type: "function",
    function: {
      name: "mcu_libraries",
      description: "Search, install, or list Arduino libraries. Actions: search, install, list.",
      parameters: {
        type: "object",
        properties: {
          action: { type: "string", description: "search, install, or list" },
          query: { type: "string", description: "Library name or search term" },
        },
        required: ["action"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "mcu_pinout",
      description: "Get pinout reference for a board. Supported: esp32, arduino_uno, esp32cam, nodemcu.",
      parameters: {
        type: "object",
        properties: {
          board: { type: "string", description: "Board name (default: esp32)" },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "mcu_example",
      description: "Generate common MCU code examples. Types: blink, wifi_connect, web_server, mqtt, sensor_dht, oled, servo, bluetooth.",
      parameters: {
        type: "object",
        properties: {
          type: { type: "string", description: "Example type" },
          board: { type: "string", description: "Board type (default: esp32)" },
        },
        required: ["type"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "mcu_debug",
      description: "Get debugging help for common MCU issues. Topics: upload_failed, wifi_not_connecting, brownout, i2c_not_working, oled_blank.",
      parameters: {
        type: "object",
        properties: {
          issue: { type: "string", description: "Issue type" },
        },
        required: ["issue"],
      },
    },
  },

  // ── PDF Tools ──────────────────────────────────────────
  {
    type: "function",
    function: {
      name: "pdf_create",
      description: "Create a PDF document from text or markdown content. Supports headers (# ## ###), lists (- *), tables (| col |), and horizontal rules (---). Saves to workspace/pdfs/.",
      parameters: {
        type: "object",
        properties: {
          filename: { type: "string", description: "Output filename (e.g. 'report.pdf' or 'report')" },
          content: { type: "string", description: "Text or markdown content for the PDF" },
          title: { type: "string", description: "Document title (optional)" },
          author: { type: "string", description: "Document author (optional)" },
        },
        required: ["filename", "content"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "pdf_create_table",
      description: "Create a PDF with a formatted data table. Headers as comma-separated string, rows as newline-separated comma-separated values.",
      parameters: {
        type: "object",
        properties: {
          filename: { type: "string", description: "Output filename" },
          headers: { type: "string", description: "Comma-separated column headers (e.g. 'Name,Qty,Price')" },
          rows: { type: "string", description: "Newline-separated rows, each comma-separated (e.g. 'Widget A,10,5.99\\nWidget B,5,12.99')" },
          title: { type: "string", description: "Table title (optional)" },
        },
        required: ["filename", "headers", "rows"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "pdf_create_invoice",
      description: "Create a professional invoice PDF. Pass invoice data as JSON or key:value format.",
      parameters: {
        type: "object",
        properties: {
          filename: { type: "string", description: "Output filename" },
          data: { type: "string", description: "Invoice data as JSON string or key:value lines. Fields: company, address, number, date, client, items (JSON array or 'desc,qty,rate' lines), tax_rate, currency, notes" },
        },
        required: ["filename", "data"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "pdf_create_report",
      description: "Create a multi-section report PDF. Sections separated by newlines, each as 'Section Title|Content'.",
      parameters: {
        type: "object",
        properties: {
          filename: { type: "string", description: "Output filename" },
          title: { type: "string", description: "Report title" },
          sections: { type: "string", description: "Sections as 'Title|Content\\nTitle2|Content2'" },
        },
        required: ["filename", "title", "sections"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "pdf_merge",
      description: "Merge multiple PDFs into one. Pass filenames as comma-separated string.",
      parameters: {
        type: "object",
        properties: {
          output_filename: { type: "string", description: "Output filename" },
          input_files: { type: "string", description: "Comma-separated list of PDF filenames to merge" },
        },
        required: ["output_filename", "input_files"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "pdf_read",
      description: "Extract text content from a PDF file.",
      parameters: {
        type: "object",
        properties: {
          file_path: { type: "string", description: "Path to PDF file (relative to workspace or absolute)" },
        },
        required: ["file_path"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "pdf_info",
      description: "Get PDF metadata: page count, title, author, creator, creation date, file size.",
      parameters: {
        type: "object",
        properties: {
          file_path: { type: "string", description: "Path to PDF file" },
        },
        required: ["file_path"],
      },
    },
  },
];

export async function executeTool(name: string, args: Record<string, string | boolean>): Promise<string> {
  switch (name) {
    // Shell
    case "exec":
      return exec(args.command as string || "");

    // Files
    case "read_file":
      return readFile(args.path as string || "");
    case "write_file":
      return writeFile(args.path as string || "", args.content as string || "");
    case "list_dir":
      return listDir(args.path as string || ".");
    case "search":
      return search(args.pattern as string || "", args.path as string || ".");

    // GitHub: Repos
    case "gh_repo_create":
      return github.ghRepoCreate(args.name as string, {
        description: args.description as string | undefined,
        private: args.private as boolean | undefined,
        push: args.push as boolean | undefined,
      });

    // GitHub: Commits
    case "gh_commit_push":
      return github.ghCommit(args.message as string, args.branch as string | undefined);
    case "gh_sync":
      return github.ghSync();

    // GitHub: PRs
    case "gh_pr_create":
      return github.ghPrCreate(args.title as string, {
        body: args.body as string | undefined,
        base: args.base as string | undefined,
        draft: args.draft as boolean | undefined,
      });
    case "gh_pr_list":
      return github.ghPrList(args.state as string | undefined);
    case "gh_pr_merge":
      return github.ghPrMerge(args.pr_number as string, args.method as string | undefined);

    // GitHub: Issues
    case "gh_issue_create":
      return github.ghIssueCreate(args.title as string, {
        body: args.body as string | undefined,
        labels: args.labels as string | undefined,
      });
    case "gh_issue_list":
      return github.ghIssueList(args.state as string | undefined);

    // GitHub: Branches
    case "gh_branch_create":
      return github.ghBranchCreate(args.name as string);
    case "gh_branch_list":
      return github.ghBranchList();
    case "gh_branch_checkout":
      return github.ghBranchCheckout(args.name as string);

    // GitHub: Gists
    case "gh_gist_create":
      return github.ghGistCreate(args.filename as string, args.description as string | undefined, args.pub as boolean | undefined);
    case "gh_gist_list":
      return github.ghGistList();

    // GitHub: CI
    case "gh_run_list":
      return github.ghRunList(args.limit as string | undefined);

    // GitHub: Generic
    case "gh":
      return github.ghRaw(args.args as string);

    // Web
    case "web_search":
      return web.webSearch(args.query as string, args.max_results ? parseInt(args.max_results as string) : 5);
    case "web_fetch":
      return web.webFetch(args.url as string);
    case "download_file":
      return web.downloadFile(args.url as string, args.dest as string);

    // Obsidian
    case "obsidian_read":
      return obsidian.obsidianRead(args.path as string);
    case "obsidian_search":
      return obsidian.obsidianSearch(args.query as string);
    case "obsidian_list":
      return obsidian.obsidianList(args.path as string || "");
    case "obsidian_create":
      return obsidian.obsidianCreate(args.path as string, args.content as string);
    case "obsidian_append":
      return obsidian.obsidianAppend(args.path as string, args.content as string);
    case "obsidian_daily":
      return obsidian.obsidianDaily(args.content as string | undefined);
    case "obsidian_task":
      return obsidian.obsidianTask(args.task as string, args.status as string || "pending");

    // Notion
    case "notion_search":
      return notion.notionSearch(args.query as string);
    case "notion_read_page":
      return notion.notionReadPage(args.page_id as string);
    case "notion_create_page":
      return notion.notionCreatePage(args.parent_id as string, args.title as string, args.markdown as string | undefined);
    case "notion_update_page":
      return notion.notionUpdatePage(args.page_id as string, args.markdown as string);
    case "notion_query_db":
      return notion.notionQueryDb(args.data_source_id as string, args.filter as string | undefined);
    case "notion_append":
      return notion.notionAppendBlocks(args.page_id as string, args.text as string);

    // Zapier
    case "zapier_trigger":
      return zapier.zapierTrigger(args.data as string);
    case "zapier_webhook":
      return zapier.zapierWebhook(args.url as string, args.payload as string);
    case "zapier_run_action":
      return zapier.zapierRunAction(args.action_key as string, args.input as string);

    // ── Browser ──────────────────────────────────────────
    case "browser_navigate":
      return browser.browserNavigate(args.url as string);
    case "browser_snapshot":
      return browser.browserSnapshot(args.selector as string | undefined);
    case "browser_screenshot":
      return browser.browserScreenshot(args.filename as string | undefined, args.full_page as boolean | undefined);
    case "browser_click":
      return browser.browserClick(args.selector as string);
    case "browser_type":
      return browser.browserType(args.selector as string, args.text as string, args.clear_first as boolean | undefined);
    case "browser_scroll":
      return browser.browserScroll(args.direction as string, args.amount ? parseInt(args.amount as string) : undefined);
    case "browser_evaluate":
      return browser.browserEvaluate(args.script as string);
    case "browser_tabs":
      return browser.browserTabs(args.action as string, args.url as string | undefined);
    case "browser_wait":
      return browser.browserWait(args.selector as string, args.timeout_ms ? parseInt(args.timeout_ms as string) : undefined);
    case "browser_back":
      return browser.browserBack();
    case "browser_info":
      return browser.browserInfo();
    case "browser_close":
      return browser.browserClose();

    // ── Computer Use ───────────────────────────────────────
    case "computer_screenshot":
      return computer.computerScreenshot(args.filename as string | undefined);
    case "computer_click":
      return computer.computerClick(args.x as string, args.y as string, args.button as string | undefined, args.double_click as boolean | undefined);
    case "computer_move":
      return computer.computerMove(args.x as string, args.y as string);
    case "computer_type":
      return computer.computerType(args.text as string, args.delay_ms as string | undefined);
    case "computer_key":
      return computer.computerKey(args.key as string);
    case "computer_scroll":
      return computer.computerScroll(args.direction as string, args.amount as string | undefined);
    case "computer_window":
      return computer.computerWindow(args.action as string, args.target as string | undefined);
    case "computer_clipboard":
      return computer.computerClipboard(args.action as string, args.text as string | undefined);
    case "computer_screen_info":
      return computer.computerScreenInfo();
    case "computer_pixel":
      return computer.computerPixel(args.x as string, args.y as string);

    // ── ESP32 / Arduino ────────────────────────────────────
    case "mcu_new_project":
      return mcu.mcuNewProject(args.name as string, args.board as string | undefined);
    case "mcu_write_code":
      return mcu.mcuWriteCode(args.project_name as string, args.filename as string, args.code as string);
    case "mcu_compile":
      return mcu.mcuCompile(args.project_name as string, args.board as string | undefined);
    case "mcu_upload":
      return mcu.mcuUpload(args.project_name as string, args.port as string | undefined, args.board as string | undefined);
    case "mcu_serial":
      return mcu.mcuSerial(args.port as string | undefined, args.baud as string | undefined, args.action as string, args.data as string | undefined);
    case "mcu_boards":
      return mcu.mcuBoards();
    case "mcu_libraries":
      return mcu.mcuLibraries(args.action as string, args.query as string | undefined);
    case "mcu_pinout":
      return mcu.mcuPinout(args.board as string | undefined);
    case "mcu_example":
      return mcu.mcuExample(args.type as string, args.board as string | undefined);
    case "mcu_debug":
      return mcu.mcuDebug(args.issue as string);

    // ── PDF Tools ──────────────────────────────────────────
    case "pdf_create":
      return pdfTools.pdfCreate(args.filename as string, args.content as string, args.title as string | undefined, args.author as string | undefined);
    case "pdf_create_table":
      return pdfTools.pdfCreateTable(args.filename as string, args.headers as string, args.rows as string, args.title as string | undefined);
    case "pdf_create_invoice":
      return pdfTools.pdfCreateInvoice(args.filename as string, args.data as string);
    case "pdf_create_report":
      return pdfTools.pdfCreateReport(args.filename as string, args.title as string, args.sections as string);
    case "pdf_merge":
      return pdfTools.pdfMerge(args.output_filename as string, args.input_files as string);
    case "pdf_read":
      return pdfTools.pdfRead(args.file_path as string);
    case "pdf_info":
      return pdfTools.pdfInfo(args.file_path as string);

    default:
      return `ERROR: Unknown tool "${name}"`;
  }
}
