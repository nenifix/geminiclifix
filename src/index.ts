#!/usr/bin/env node

import chalk from "chalk";
import { config, validateConfig } from "./config.js";
import { createBot } from "./telegram.js";
import { execSync } from "node:child_process";

console.log(chalk.bold.hex("#1a365d")("\n  🤖 GeminiCliFix\n"));

// Verify gemini CLI is installed
try {
  const version = execSync("gemini --version", { encoding: "utf-8" }).trim();
  console.log(chalk.green("  Gemini CLI:"), chalk.white(version));
} catch {
  console.error(
    chalk.red("  ❌ gemini CLI not found.") +
    chalk.yellow("\n     Install with: npm install -g @google/gemini-cli") +
    chalk.yellow("\n     Then run: gemini auth")
  );
  process.exit(1);
}

validateConfig();

console.log(chalk.green("  Model:"), chalk.white(config.geminiModel));
console.log(chalk.green("  Workspace:"), chalk.white(config.workspace));
console.log("");

const bot = createBot();

bot.launch({ dropPendingUpdates: true }).then(() => {
  console.log(chalk.green("  ✅ Bot is running on Telegram as @Geminiclifixbot"));
  console.log(chalk.gray("  Press Ctrl+C to stop\n"));
}).catch((err: any) => {
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
