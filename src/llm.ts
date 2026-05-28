import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { config } from "./config.js";

const execFileAsync = promisify(execFile);

export interface LLMMessage {
  role: "user" | "assistant";
  content: string;
}

/**
 * Build a single prompt string from the conversation context.
 * Gemini CLI -p is stateless, so we flatten the history into one prompt.
 */
function buildPrompt(messages: LLMMessage[]): string {
  return messages
    .map((m) => {
      const label = m.role === "user" ? "User" : "Assistant";
      return `${label}: ${m.content}`;
    })
    .join("\n\n");
}

/**
 * Call Gemini CLI non-interactively via `gemini -p "<prompt>" -m <model>`.
 * Timeout after 120s to avoid hanging.
 */
export async function chat(messages: LLMMessage[]): Promise<string> {
  const prompt = buildPrompt(messages);

  try {
    const { stdout, stderr } = await execFileAsync(
      "gemini",
      ["-p", prompt, "-m", config.geminiModel],
      { timeout: 120_000, maxBuffer: 10 * 1024 * 1024 }
    );

    if (stderr && !stderr.includes("Ripgrep")) {
      // Log non-fatal warnings (ripgrep warning is harmless)
      console.warn("[gemini stderr]", stderr.trim());
    }

    const output = stdout.trim();
    if (!output) {
      throw new Error("Gemini CLI returned empty output");
    }

    return output;
  } catch (err: any) {
    if (err.killed || err.code === "ETIMEDOUT") {
      throw new Error("Gemini CLI timed out after 120s");
    }
    if (err.code === "ENOENT") {
      throw new Error(
        "gemini CLI not found. Install with: npm install -g @google/gemini-cli"
      );
    }
    throw new Error(`Gemini CLI error: ${err.message}`);
  }
}
