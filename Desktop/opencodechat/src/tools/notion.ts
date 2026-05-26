import { exec } from "./exec.js";

const NOTION_API_KEY = process.env["NOTION_API_KEY"] ?? "";
const NOTION_VERSION = "2025-09-03";

function notionHeaders(): Record<string, string> {
  return {
    "Authorization": `Bearer ${NOTION_API_KEY}`,
    "Notion-Version": NOTION_VERSION,
    "Content-Type": "application/json",
  };
}

async function notionRequest(method: string, endpoint: string, body?: any): Promise<string> {
  if (!NOTION_API_KEY) return "ERROR: NOTION_API_KEY not set in .env";

  const url = `https://api.notion.com/v1${endpoint}`;
  const headers = notionHeaders();

  try {
    const options: RequestInit = {
      method,
      headers,
    };
    if (body) {
      options.body = JSON.stringify(body);
    }

    const res = await fetch(url, options);
    if (!res.ok) {
      const errText = await res.text();
      return `Notion API error ${res.status}: ${errText.slice(0, 500)}`;
    }
    const data = await res.json() as any;

    // Format response based on endpoint
    if (endpoint.includes("/markdown")) {
      return data?.markdown?.content || JSON.stringify(data).slice(0, 2000);
    }
    if (data?.results) {
      return data.results.map((r: any) => {
        const title = r.properties?.title?.title?.[0]?.text?.content || r.title?.[0]?.text?.content || "Untitled";
        const id = r.id;
        return `📄 ${title} (id: ${id})`;
      }).join("\n");
    }
    return JSON.stringify(data, null, 2).slice(0, 3000);
  } catch (err: any) {
    return `Notion request error: ${err.message}`;
  }
}

// ── Search ─────────────────────────────────────────────

export async function notionSearch(query: string): Promise<string> {
  return notionRequest("POST", "/search", { query });
}

// ── Read Page ──────────────────────────────────────────

export async function notionReadPage(pageId: string): Promise<string> {
  return notionRequest("GET", `/pages/${pageId}/markdown`);
}

// ── Create Page ────────────────────────────────────────

export async function notionCreatePage(parentId: string, title: string, markdown?: string): Promise<string> {
  const body: any = {
    parent: { page_id: parentId },
    properties: { title: [{ text: { content: title } }] },
  };
  if (markdown) {
    body.markdown = markdown;
  }
  return notionRequest("POST", "/pages", body);
}

// ── Update Page ────────────────────────────────────────

export async function notionUpdatePage(pageId: string, markdown: string): Promise<string> {
  return notionRequest("PATCH", `/pages/${pageId}/markdown`, { markdown });
}

// ── Query Database ─────────────────────────────────────

export async function notionQueryDb(dataSourceId: string, filter?: string): Promise<string> {
  const body: any = {};
  if (filter) {
    try {
      body.filter = JSON.parse(filter);
    } catch {
      return "ERROR: Invalid filter JSON";
    }
  }
  return notionRequest("POST", `/data_sources/${dataSourceId}/query`, body);
}

// ── Append Blocks ──────────────────────────────────────

export async function notionAppendBlocks(pageId: string, text: string): Promise<string> {
  return notionRequest("PATCH", `/blocks/${pageId}/children`, {
    children: [
      {
        object: "block",
        type: "paragraph",
        paragraph: { rich_text: [{ text: { content: text } }] },
      },
    ],
  });
}

// ── Create Database ────────────────────────────────────

export async function notionCreateDb(parentId: string, title: string): Promise<string> {
  return notionRequest("POST", "/data_sources", {
    parent: { page_id: parentId },
    title: [{ text: { content: title } }],
    properties: {
      Name: { title: {} },
      Status: { select: { options: [{ name: "Todo" }, { name: "In Progress" }, { name: "Done" }] } },
    },
  });
}
