import { config } from "./config.js";

export interface LLMMessage {
  role: "system" | "user" | "assistant" | "tool";
  content: string;
  tool_calls?: ToolCall[];
  tool_call_id?: string;
}

export interface ToolCall {
  id: string;
  type: "function";
  function: {
    name: string;
    arguments: string;
  };
}

export interface LLMResponse {
  content: string;
  toolCalls: ToolCall[];
}

export async function chat(
  messages: LLMMessage[],
  tools: object[]
): Promise<LLMResponse> {
  const body: Record<string, unknown> = {
    model: config.model,
    messages: messages,
  };

  if (tools.length > 0) {
    body["tools"] = tools;
    body["tool_choice"] = "auto";
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (config.openRouterApiKey) {
    headers["Authorization"] = `Bearer ${config.openRouterApiKey}`;
    headers["HTTP-Referer"] = "https://github.com/nenifix/opencodechat";
    headers["X-Title"] = "OpenCodeChat";
  }

  const res = await fetch(`${config.modelBaseUrl}/chat/completions`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`LLM API error ${res.status}: ${errText}`);
  }

  const data = await res.json() as any;
  const choice = data.choices?.[0]?.message;

  if (!choice) {
    throw new Error("No response from LLM");
  }

  return {
    content: choice.content || "",
    toolCalls: (choice.tool_calls as ToolCall[]) || [],
  };
}
