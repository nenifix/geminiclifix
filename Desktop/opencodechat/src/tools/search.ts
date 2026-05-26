import { exec } from "child_process";
import { promisify } from "util";
import { resolve } from "path";
import { config } from "../config.js";

const execPromise = promisify(exec);

const MAX_RESULTS = 50;

export async function search(pattern: string, path: string): Promise<string> {
  try {
    const fullPath = resolve(config.workspace, path || ".");
    const isWin = process.platform === "win32";

    let cmd: string;
    if (isWin) {
      cmd = `findstr /s /n /i "${pattern.replace(/"/g, "")}" ${fullPath}\\*.*`;
    } else {
      cmd = `grep -rn "${pattern.replace(/"/g, "\\\"")}" ${fullPath} --include="*" 2>/dev/null || true`;
    }

    const { stdout } = await execPromise(cmd, { timeout: 10000, maxBuffer: 512 * 1024 });
    const lines = stdout.split("\n").filter(Boolean);

    if (lines.length === 0) return "No matches found.";

    const trimmed = lines.slice(0, MAX_RESULTS);
    let result = trimmed.join("\n");
    if (lines.length > MAX_RESULTS) {
      result += `\n... and ${lines.length - MAX_RESULTS} more matches`;
    }

    if (result.length > 4000) {
      result = result.slice(0, 4000) + "\n... (truncated)";
    }

    return result;
  } catch (err: any) {
    if (err.stdout) return err.stdout.slice(0, 4000);
    return `ERROR searching: ${err.message}`;
  }
}
