#!/usr/bin/env node
import chalk from "chalk";
import { config, validateConfig } from "./config.js";
import { createBot } from "./telegram.js";

console.log(chalk.bold.blue("\n  🤖 GeminiCliFix\n"));

validateConfig();

console.log(chalk.green("  Model:"), chalk.white(config.geminiModel));
console.log(chalk.green("  Workspace:"), chalk.white(config.workspace));
console.log("");

const bot = createBot();

bot.launch({ dropPendingUpdates: true }).then(() => {
    console.log(chalk.green("  ✅ Bot is running on Telegram as @Geminiclifixbot"));
    console.log(chalk.gray("  Press Ctrl+C to stop\n"));
}).catch((err) => {
    console.error(chalk.red("  ❌ Bot failed:"), err.message);
    process.exit(1);
});

const shutdown = () => {
    console.log(chalk.yellow("\n  Shutting down..."));
    bot.stop("SIGINT");
    process.exit(0);
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
