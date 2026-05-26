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

    default:
      return `ERROR: Unknown tool "${name}"`;
  }
}
