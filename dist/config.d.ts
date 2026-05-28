import "dotenv/config";
export interface Config {
    telegramBotToken: string;
    geminiModel: string;
    workspace: string;
    maxContextMessages: number;
}
export declare const config: Config;
export declare function validateConfig(): void;
