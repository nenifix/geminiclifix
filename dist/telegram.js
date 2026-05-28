import { Telegraf } from "telegraf";
import { message } from "telegraf/filters";
import chalk from "chalk";
import { config } from "./config.js";
import { chat } from "./llm.js";
const userSessions = new Map();
function getSession(userId) {
    if (!userSessions.has(userId)) {
        userSessions.set(userId, []);
    }
    return userSessions.get(userId);
}
function appendToSession(userId, msg) {
    const session = getSession(userId);
    session.push(msg);
    const max = config.maxContextMessages;
    if (session.length > max) {
        userSessions.set(userId, session.slice(-max));
    }
}
function splitMessage(text, maxLen = 4000) {
    const chunks = [];
    let remaining = text;
    while (remaining.length > maxLen) {
        const chunk = remaining.slice(0, maxLen);
        const lastNewline = chunk.lastIndexOf("\n");
        const splitAt = lastNewline > maxLen * 0.5 ? lastNewline : maxLen;
        chunks.push(remaining.slice(0, splitAt));
        remaining = remaining.slice(splitAt);
    }
    if (remaining.length > 0)
        chunks.push(remaining);
    return chunks;
}
export function createBot() {
    const bot = new Telegraf(config.telegramBotToken);
    bot.command("start", (ctx) => {
        ctx.reply(`GeminiCliFix — Powered by Google Gemini\n\n` +
            `Send me a message and I'll respond using Gemini CLI.\n\n` +
            `Commands:\n` +
            `/help - Show all commands\n` +
            `/status - Show current config\n` +
            `/reset - Clear conversation history\n\n` +
            `Built by Nenifix — https://nenifix.xyz`);
    });
    bot.command("help", (ctx) => {
        ctx.reply(`GeminiCliFix Commands:\n\n` +
            `/start - Welcome message\n` +
            `/help - This message\n` +
            `/status - Current model and workspace\n` +
            `/reset - Reset conversation memory\n\n` +
            `Just send any message and I'll forward it to Gemini CLI.`);
    });
    bot.command("status", (ctx) => {
        ctx.reply(`GeminiCliFix Status\n\n` +
            `Model: ${config.geminiModel}\n` +
            `Workspace: ${config.workspace}\n` +
            `Context: ${config.maxContextMessages} messages`);
    });
    bot.command("reset", (ctx) => {
        const userId = ctx.from?.id.toString() || "default";
        userSessions.set(userId, []);
        ctx.reply("Conversation history cleared.");
    });
    bot.on(message("text"), async (ctx) => {
        const userId = ctx.from?.id.toString() || "default";
        const text = ctx.message.text;
        if (text.startsWith("/"))
            return;
        // Only respond to allowed user
        const allowedId = process.env["ALLOWED_USER_ID"];
        if (allowedId && userId !== allowedId) {
            ctx.reply("Not authorized.");
            return;
        }
        await ctx.sendChatAction("typing");
        try {
            const session = getSession(userId);
            // Append the new user message before calling
            appendToSession(userId, { role: "user", content: text });
            const response = await chat(getSession(userId));
            appendToSession(userId, { role: "assistant", content: response });
            const chunks = splitMessage(response);
            for (const chunk of chunks) {
                await ctx.reply(chunk);
            }
        }
        catch (err) {
            console.error(chalk.red("Gemini error:"), err.message);
            await ctx.reply(`Error: ${err.message}`);
        }
    });
    return bot;
}
