import { readFile as fsReadFile } from "fs/promises";
import { resolve } from "path";
import { config } from "../config.js";

const MAX_OUTPUT = 4000;

export async function readFile(path: string): Promise<string> {
  try {
    const fullPath = resolve(config.workspace, path);
    const content = await fsReadFile(fullPath, "utf-8");
    if (content.length > MAX_OUTPUT) {
      return content.slice(0, MAX_OUTPUT) + "\n... (truncated)";
    }
    return content;
  } catch (err: any) {
    return `ERROR reading ${path}: ${err.message}`;
  }
}
