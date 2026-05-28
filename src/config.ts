import "dotenv/config";
import chalk from "chalk";

export interface Config {
  telegramBotToken: string;
  geminiModel: string;
  workspace: string;
  maxContextMessages: number;
}

function getEnv(key: string, fallback?: string): string {
  const val = process.env[key] ?? fallback;
  if (!val) {
    console.error(chalk.red(`Missing required env var: ${key}`));
    process.exit(1);
  }
  return val;
}

export const config: Config = {
  telegramBotToken: getEnv("TELEGRAM_BOT_TOKEN"),
  geminiModel: process.env["GEMINI_MODEL"] || "gemini-2.0-flash",
  workspace: process.env["WORKSPACE"] || "./workspace",
  maxContextMessages: parseInt(process.env["MAX_CONTEXT_MESSAGES"] || "20", 10),
};

export function validateConfig(): void {
  console.log(chalk.green("Config OK — model:"), chalk.cyan(config.geminiModel));
}
