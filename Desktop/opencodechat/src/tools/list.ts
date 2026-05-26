import { readdir, stat } from "fs/promises";
import { resolve, basename } from "path";
import { config } from "../config.js";

export async function listDir(path: string): Promise<string> {
  try {
    const fullPath = resolve(config.workspace, path || ".");
    const entries = await readdir(fullPath);
    if (entries.length === 0) return "(empty directory)";

    const lines: string[] = [];
    const max = Math.min(entries.length, 100);

    for (let i = 0; i < max; i++) {
      const name = entries[i];
      try {
        const s = await stat(resolve(fullPath, name));
        const icon = s.isDirectory() ? "📁" : "📄";
        const size = s.isDirectory() ? "" : ` (${s.size} bytes)`;
        lines.push(`${icon} ${name}${size}`);
      } catch {
        lines.push(`❓ ${name}`);
      }
    }

    if (entries.length > 100) {
      lines.push(`... and ${entries.length - 100} more`);
    }

    return lines.join("\n");
  } catch (err: any) {
    return `ERROR listing ${path}: ${err.message}`;
  }
}
