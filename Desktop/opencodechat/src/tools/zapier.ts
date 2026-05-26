import { exec } from "./exec.js";

const ZAPIER_API_KEY = process.env["ZAPIER_API_KEY"] ?? "";
const ZAPIER_WEBHOOK_URL = process.env["ZAPIER_WEBHOOK_URL"] ?? "";

// ── Zapier Webhook (Catch Hook) ────────────────────────

export async function zapierTrigger(data: string): Promise<string> {
  if (!ZAPIER_WEBHOOK_URL) return "ERROR: ZAPIER_WEBHOOK_URL not set in .env";

  try {
    const parsed = JSON.parse(data);
    const res = await fetch(ZAPIER_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(parsed),
    });
    if (!res.ok) return `Zapier webhook error ${res.status}: ${(await res.text()).slice(0, 300)}`;
    return `✅ Zapier webhook triggered: ${ZAPIER_WEBHOOK_URL.slice(0, 50)}...`;
  } catch (err: any) {
    return `Zapier error: ${err.message}`;
  }
}

// ── Zapier REST API ────────────────────────────────────

async function zapierApi(method: string, endpoint: string, body?: any): Promise<string> {
  if (!ZAPIER_API_KEY) return "ERROR: ZAPIER_API_KEY not set in .env";

  try {
    const options: RequestInit = {
      method,
      headers: {
        "Authorization": `Bearer ${ZAPIER_API_KEY}`,
        "Content-Type": "application/json",
      },
    };
    if (body) options.body = JSON.stringify(body);

    const res = await fetch(`https://actions.zapier.com/api/v1${endpoint}`, options);
    if (!res.ok) return `Zapier API error ${res.status}: ${(await res.text()).slice(0, 300)}`;
    const data = await res.json();
    return JSON.stringify(data, null, 2).slice(0, 2000);
  } catch (err: any) {
    return `Zapier API error: ${err.message}`;
  }
}

// ── Zapier Zaps ────────────────────────────────────────

export async function zapierListZaps(): Promise<string> {
  return zapierApi("GET", "/zaps");
}

export async function zapierToggleZap(zapId: string, turnOn: boolean): Promise<string> {
  return zapierApi("PATCH", `/zaps/${zapId}`, { turn_on: turnOn });
}

// ── Zapier Actions ─────────────────────────────────────

export async function zapierRunAction(actionKey: string, input: string): Promise<string> {
  let parsed: any = {};
  try {
    parsed = JSON.parse(input);
  } catch {
    parsed = { text: input };
  }
  return zapierApi("POST", `/actions/${actionKey}/run`, parsed);
}

// ── Generic Zapier Webhook (raw) ──────────────────────

export async function zapierWebhook(webhookUrl: string, payload: string): Promise<string> {
  try {
    let body: any;
    try {
      body = JSON.parse(payload);
    } catch {
      body = { data: payload };
    }

    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) return `Webhook error ${res.status}: ${(await res.text()).slice(0, 300)}`;
    return `✅ Webhook sent to ${webhookUrl.slice(0, 60)}...`;
  } catch (err: any) {
    return `Webhook error: ${err.message}`;
  }
}
