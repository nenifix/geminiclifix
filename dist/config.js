import "dotenv/config";
import chalk from "chalk";
function getEnv(key, fallback) {
    const val = process.env[key] ?? fallback;
    if (!val) {
        console.error(chalk.red(`Missing required env var: ${key}`));
        process.exit(1);
    }
    return val;
}
export const config = {
    telegramBotToken: getEnv("TELEGRAM_BOT_TOKEN"),
    geminiModel: process.env["GEMINI_MODEL"] || "gemini-2.0-flash",
    workspace: process.env["WORKSPACE"] || "./workspace",
    maxContextMessages: parseInt(process.env["MAX_CONTEXT_MESSAGES"] || "20", 10),
};
export function validateConfig() {
    console.log(chalk.green("Config OK — model:"), chalk.cyan(config.geminiModel));
}
