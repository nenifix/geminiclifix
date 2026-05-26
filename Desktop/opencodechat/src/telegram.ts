import { Telegraf, Context } from "telegraf";
import { message } from "telegraf/filters";
import chalk from "chalk";
import { config, provider } from "./config.js";
import { runAgent } from "./agent.js";
import { LLMMessage } from "./llm.js";

const userSessions = new Map<string, LLMMessage[]>();

function getSession(userId: string): LLMMessage[] {
  if (!userSessions.has(userId)) {
    userSessions.set(userId, []);
  }
  return userSessions.get(userId)!;
}

function appendToSession(userId: string, msg: LLMMessage) {
  const session = getSession(userId);
  session.push(msg);
  // Keep only last N exchanges
  const max = config.maxContextMessages;
  if (session.length > max) {
    userSessions.set(userId, session.slice(-max));
  }
}

function splitMessage(text: string, maxLen = 4000): string[] {
  const chunks: string[] = [];
  let remaining = text;
  while (remaining.length > maxLen) {
    const chunk = remaining.slice(0, maxLen);
    const lastNewline = chunk.lastIndexOf("\n");
    const splitAt = lastNewline > maxLen * 0.5 ? lastNewline : maxLen;
    chunks.push(remaining.slice(0, splitAt));
    remaining = remaining.slice(splitAt);
  }
  if (remaining.length > 0) chunks.push(remaining);
  return chunks;
}

export function createBot() {
  const bot = new Telegraf(config.telegramBotToken);

  bot.command("start", (ctx) => {
    ctx.reply(
      `Welcome to OpenCodeChat!\n\n` +
      `I'm your AI coding agent. Send me instructions and I'll get them done.\n\n` +
      `Commands:\n` +
      `/help - Show all commands\n` +
      `/status - Show current config\n` +
      `/config model <name> - Change model\n` +
      `/workspace <path> - Set workspace folder\n` +
      `/reset - Clear conversation history\n\n` +
      `Or just send me a task to complete!`
    );
  });

  bot.command("help", (ctx) => {
    ctx.reply(
      `OpenCodeChat Commands:\n\n` +
      `/start - Welcome message\n` +
      `/help - This message\n` +
      `/status - Current model, provider, workspace\n` +
      `/config model <name> - Switch model (e.g. /config model anthropic/claude-sonnet-4)\n` +
      `/workspace <path> - Change working directory\n` +
      `/reset - Reset conversation memory\n\n` +
      `Tools available:\n` +
      `- read_file: Read any file\n` +
      `- write_file: Create/edit files\n` +
      `- exec: Run shell commands\n` +
      `- list_dir: List files & folders\n` +
      `- search: Search text in files`
    );
  });

  bot.command("status", (ctx) => {
    ctx.reply(
      `🤖 OpenCodeChat Status\n\n` +
      `Provider: ${provider}\n` +
      `Model: ${config.model}\n` +
      `API: ${config.modelBaseUrl}\n` +
      `Workspace: ${config.workspace}\n` +
      `Context: ${config.maxContextMessages} messages`
    );
  });

  bot.command("config", async (ctx) => {
    const args = ctx.message.text.split(" ").slice(1);
    if (args[0] === "model" && args[1]) {
      const newModel = args.slice(1).join(" ");
      (config as any).model = newModel;
      await ctx.reply(`Model changed to: ${newModel}`);
    } else {
      await ctx.reply(`Current model: ${config.model}\nUse /config model <name> to change`);
    }
  });

  bot.command("workspace", async (ctx) => {
    const args = ctx.message.text.split(" ").slice(1);
    if (args[0]) {
      (config as any).workspace = args[0];
      await ctx.reply(`Workspace set to: ${args[0]}`);
    } else {
      await ctx.reply(`Current workspace: ${config.workspace}\nUse /workspace <path> to change`);
    }
  });

  bot.command("reset", (ctx) => {
    const userId = ctx.from?.id.toString() || "default";
    userSessions.set(userId, []);
    ctx.reply("Conversation history cleared.");
  });

  bot.on(message("text"), async (ctx) => {
    const userId = ctx.from?.id.toString() || "default";
    const text = ctx.message.text;

    // Skip commands
    if (text.startsWith("/")) return;

    // Only respond to allowed user
    const allowedId = process.env["ALLOWED_USER_ID"];
    if (allowedId && userId !== allowedId) {
      ctx.reply("Not authorized.");
      return;
    }

    await ctx.sendChatAction("typing");

    try {
      const session = getSession(userId);
      const response = await runAgent(text, session);

      // Update session
      appendToSession(userId, { role: "user", content: text });
      appendToSession(userId, { role: "assistant", content: response });

      // Send response (split if too long)
      const chunks = splitMessage(response);
      for (const chunk of chunks) {
        await ctx.reply(chunk);
      }
    } catch (err: any) {
      console.error(chalk.red("Agent error:"), err.message);
      await ctx.reply(`Error: ${err.message}`);
    }
  });

  return bot;
}
