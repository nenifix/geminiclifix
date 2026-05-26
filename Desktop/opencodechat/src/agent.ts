import chalk from "chalk";
import { chat, LLMMessage, ToolCall } from "./llm.js";
import { toolDefinitions, executeTool } from "./tools/index.js";
import { config } from "./config.js";

const MAX_ITERATIONS = 10;

const SYSTEM_PROMPT = `You are NeniCoder (OpenCodeChat), an AI coding agent that communicates via Telegram. You have access to tools for file management, shell commands, code search, GitHub, web, browser automation, Obsidian vault, Notion, Zapier, and task logging.

## Rules
- Always use tools to accomplish tasks. Don't just describe what to do.
- Read files before editing them. Run builds/tests to verify.
- Report results clearly. Keep responses under 3000 chars when possible.
- If something fails, try a different approach.
- For browser tasks: navigate first, then snapshot to read content, then interact (click/type/scroll).
- Use browser_evaluate for JavaScript extraction and complex scraping.
- Close browser with browser_close when done to free resources.

## Tool Reference
**Files:** read_file, write_file, list_dir, search
**Shell:** exec
**GitHub:** gh_repo_create, gh_commit_push, gh_sync, gh_pr_create/list/merge, gh_issue_create/list, gh_branch_create/list/checkout, gh_gist_create/list, gh_run_list, gh (raw)
**Web:** web_search, web_fetch, download_file
**Browser:** browser_navigate, browser_snapshot, browser_screenshot, browser_click, browser_type, browser_scroll, browser_evaluate, browser_tabs, browser_wait, browser_back, browser_info, browser_close
**Computer:** computer_screenshot, computer_click, computer_move, computer_type, computer_key, computer_scroll, computer_window, computer_clipboard, computer_screen_info, computer_pixel
**ESP32/Arduino:** mcu_new_project, mcu_write_code, mcu_compile, mcu_upload, mcu_serial, mcu_boards, mcu_libraries, mcu_pinout, mcu_example, mcu_debug
**PDF:** pdf_create, pdf_create_table, pdf_create_invoice, pdf_create_report, pdf_merge, pdf_read, pdf_info
**Obsidian Vault:** obsidian_read, obsidian_search, obsidian_list, obsidian_create, obsidian_append, obsidian_daily, obsidian_task
**Notion:** notion_search, notion_read_page, notion_create_page, notion_update_page, notion_query_db, notion_append
**Zapier:** zapier_trigger, zapier_webhook, zapier_run_action

## Key Notes
- Obsidian vault is at C:\\Users\\ai9\\Documents\\vault\\vault\\vault\\ — use obsidian_read/obsidian_search to recall context
- Notion needs NOTION_API_KEY; Zapier needs ZAPIER_WEBHOOK_URL or ZAPIER_API_KEY
- Browser uses puppeteer-core with headless Chrome/Chromium. Auto-detects Chrome on Windows. Set CHROME_PATH env var if needed.
- Screenshots save to workspace/screenshots/
- Computer use tools control the desktop: screenshot, mouse, keyboard, windows, clipboard. Uses native OS commands.
- ESP32/Arduino tools need arduino-cli installed. Projects save to workspace/mcu/. Use mcu_example for code templates.
- When building something worth keeping: create GitHub repo + push code
- Log important tasks with obsidian_task or obsidian_daily

Workspace: ${config.workspace}
OS: ${process.platform}
Model: ${config.model}`;

export async function runAgent(
  userMessage: string,
  history: LLMMessage[]
): Promise<string> {
  const messages: LLMMessage[] = [
    { role: "system", content: SYSTEM_PROMPT },
    ...history,
    { role: "user", content: userMessage },
  ];

  for (let i = 0; i < MAX_ITERATIONS; i++) {
    console.log(chalk.gray(`  Agent iteration ${i + 1}...`));

    let response;
    try {
      response = await chat(messages, toolDefinitions);
    } catch (err: any) {
      return `Agent error: ${err.message}`;
    }

    // If no tool calls, this is the final response
    if (!response.toolCalls || response.toolCalls.length === 0) {
      return response.content || "(no response)";
    }

    // Execute each tool call
    messages.push({
      role: "assistant",
      content: response.content || "",
      tool_calls: response.toolCalls,
    });

    for (const tc of response.toolCalls) {
      let args: Record<string, string> = {};
      try {
        args = JSON.parse(tc.function.arguments);
      } catch {
        args = {};
      }

      console.log(chalk.blue(`  → ${tc.function.name}(${JSON.stringify(args).slice(0, 80)})`));
      const result = await executeTool(tc.function.name, args);

      messages.push({
        role: "tool",
        content: result,
        tool_call_id: tc.id,
      });
    }
  }

  return "Agent reached max iterations. Last state: " + (messages[messages.length - 1]?.content || "unknown");
}
