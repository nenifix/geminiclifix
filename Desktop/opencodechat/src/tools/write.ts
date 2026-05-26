import { writeFile as fsWriteFile, mkdir } from "fs/promises";
import { resolve, dirname } from "path";
import { config } from "../config.js";

export async function writeFile(path: string, content: string): Promise<string> {
  try {
    const fullPath = resolve(config.workspace, path);
    await mkdir(dirname(fullPath), { recursive: true });
    await fsWriteFile(fullPath, content, "utf-8");
    return `Wrote ${content.length} chars to ${path}`;
  } catch (err: any) {
    return `ERROR writing ${path}: ${err.message}`;
  }
}
