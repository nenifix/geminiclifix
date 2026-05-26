import "dotenv/config";
import chalk from "chalk";

export interface Config {
  telegramBotToken: string;
  openRouterApiKey: string;
  modelBaseUrl: string;
  model: string;
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

function detectProvider(): "openrouter" | "ollama" | "lmstudio" | "custom" {
  const url = process.env["MODEL_BASE_URL"] ?? "";
  if (url.includes("11434")) return "ollama";
  if (url.includes("1234")) return "lmstudio";
  if (url === "") return "openrouter";
  return "custom";
}

export const config: Config = {
  telegramBotToken: getEnv("TELEGRAM_BOT_TOKEN"),
  openRouterApiKey: process.env["OPENROUTER_API_KEY"] ?? "",
  modelBaseUrl: process.env["MODEL_BASE_URL"] || "https://openrouter.ai/api/v1",
  model: process.env["MODEL"] || "openrouter/auto",
  workspace: process.env["WORKSPACE"] || "./workspace",
  maxContextMessages: parseInt(process.env["MAX_CONTEXT_MESSAGES"] || "20", 10),
};

export const provider = detectProvider();

export function validateConfig(): void {
  if (provider === "openrouter" && !config.openRouterApiKey) {
    console.error(chalk.red("OPENROUTER_API_KEY is required when using OpenRouter"));
    process.exit(1);
  }
  console.log(chalk.green("Config OK — provider:"), chalk.cyan(provider), chalk.green("model:"), chalk.cyan(config.model));
}
