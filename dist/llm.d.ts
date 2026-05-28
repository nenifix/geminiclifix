export interface LLMMessage {
    role: "user" | "assistant";
    content: string;
}
/**
 * Call Gemini CLI non-interactively via `gemini -p "<prompt>" -m <model>`.
 * Timeout after 120s to avoid hanging.
 */
export declare function chat(messages: LLMMessage[]): Promise<string>;
