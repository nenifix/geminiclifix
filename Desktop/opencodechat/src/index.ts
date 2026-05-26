#!/usr/bin/env node

import chalk from "chalk";
import { config, provider, validateConfig } from "./config.js";
import { createBot } from "./telegram.js";

console.log(chalk.bold.cyan("\n  🤖 OpenCodeChat\n"));

validateConfig();

console.log(chalk.green("  Provider:"), chalk.white(provider));
console.log(chalk.green("  Model:"), chalk.white(config.model));
console.log(chalk.green("  Workspace:"), chalk.white(config.workspace));
console.log(chalk.green("  API:"), chalk.white(config.modelBaseUrl));
console.log("");

const bot = createBot();

bot.launch({ dropPendingUpdates: true }).then(() => {
  console.log(chalk.green("  ✅ Bot is running on Telegram"));
  console.log(chalk.gray("  Press Ctrl+C to stop\n"));
}).catch((err: any) => {
  console.error(chalk.red("  ❌ Bot failed:"), err.message);
  process.exit(1);
});

// Graceful shutdown
const shutdown = () => {
  console.log(chalk.yellow("\n  Shutting down..."));
  bot.stop("SIGINT");
  process.exit(0);
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
