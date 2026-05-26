import { exec as execCb } from "child_process";
import { promisify } from "util";

const execPromise = promisify(execCb);

const TIMEOUT = 30000;
const MAX_OUTPUT = 4000;

function truncate(output: string): string {
  if (output.length <= MAX_OUTPUT) return output;
  return output.slice(0, MAX_OUTPUT) + "\n... (truncated)";
}

export async function exec(command: string): Promise<string> {
  try {
    const isWin = process.platform === "win32";
    const { stdout, stderr } = await execPromise(command, {
      timeout: TIMEOUT,
      shell: isWin ? "cmd.exe" : "/bin/sh",
      maxBuffer: 1024 * 1024,
      cwd: process.cwd(),
    });
    return truncate(stdout + (stderr ? `\nSTDERR:\n${stderr}` : ""));
  } catch (err: any) {
    return truncate(`ERROR: ${err.message}\n${err.stdout || ""}\n${err.stderr || ""}`);
  }
}
