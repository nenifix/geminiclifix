import * as fs from "fs";
import * as path from "path";

// ── Vault Configuration ────────────────────────────────

const VAULT_PATH = "C:\\Users\\ai9\\Documents\\vault\\vault\\vault\\";
const DAILY_BRIEFS_DIR = path.join(VAULT_PATH, "Daily Briefs");
const TASKS_DIR = path.join(VAULT_PATH, "ToDo");

function ensureDir(dirPath: string): void {
  fs.mkdirSync(dirPath, { recursive: true });
}

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

function nowStr(): string {
  return new Date().toISOString().slice(0, 16).replace("T", " ");
}

// ── Read ───────────────────────────────────────────────

export async function obsidianRead(notePath: string): Promise<string> {
  const full = path.isAbsolute(notePath) ? notePath : path.join(VAULT_PATH, notePath);
  if (!fs.existsSync(full)) return `Note not found: ${full}`;
  return fs.readFileSync(full, "utf-8");
}

// ── Search ─────────────────────────────────────────────

export async function obsidianSearch(query: string): Promise<string> {
  const results: string[] = [];
  const q = query.toLowerCase();

  function scan(dir: string, depth: number): void {
    if (depth > 3) return;
    try {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        if (entry.name.startsWith(".")) continue;
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          scan(full, depth + 1);
        } else if (entry.name.endsWith(".md")) {
          const content = fs.readFileSync(full, "utf-8");
          if (content.toLowerCase().includes(q) || entry.name.toLowerCase().includes(q)) {
            const rel = path.relative(VAULT_PATH, full);
            const preview = content.slice(0, 200).replace(/\n/g, " ");
            results.push(`📄 ${rel}\n   ${preview}...`);
          }
        }
      }
    } catch (_e) { /* skip */ }
  }

  scan(VAULT_PATH, 0);

  if (results.length === 0) return `No notes found matching "${query}"`;
  return results.slice(0, 10).join("\n\n");
}

// ── List ───────────────────────────────────────────────

export async function obsidianList(dirPath: string): Promise<string> {
  const full = dirPath ? path.join(VAULT_PATH, dirPath) : VAULT_PATH;
  if (!fs.existsSync(full)) return `Directory not found: ${full}`;
  const entries = fs.readdirSync(full, { withFileTypes: true });
  const lines = entries
    .filter((e) => !e.name.startsWith("."))
    .map((e) => (e.isDirectory() ? `📁 ${e.name}/` : `📄 ${e.name}`))
    .sort();
  const header = `📂 ${path.relative(VAULT_PATH, full) || "vault root"}`;
  return header + "\n\n" + lines.join("\n");
}

// ── Create Note ────────────────────────────────────────

export async function obsidianCreate(notePath: string, content: string): Promise<string> {
  const full = path.isAbsolute(notePath) ? notePath : path.join(VAULT_PATH, notePath);
  ensureDir(path.dirname(full));
  fs.writeFileSync(full, content, "utf-8");
  const rel = path.relative(VAULT_PATH, full);
  return `✅ Created: ${rel} (${content.length} chars)`;
}

// ── Append to Note ─────────────────────────────────────

export async function obsidianAppend(notePath: string, content: string): Promise<string> {
  const full = path.isAbsolute(notePath) ? notePath : path.join(VAULT_PATH, notePath);
  if (!fs.existsSync(full)) return `Note not found: ${full}`;
  const existing = fs.readFileSync(full, "utf-8");
  fs.writeFileSync(full, existing + "\n" + content, "utf-8");
  const rel = path.relative(VAULT_PATH, full);
  return `✅ Appended to: ${rel}`;
}

// ── Daily Note ─────────────────────────────────────────

export async function obsidianDaily(content?: string): Promise<string> {
  const date = todayStr();
  const filePath = path.join(DAILY_BRIEFS_DIR, `${date}_OpenCodeChat.md`);
  if (!fs.existsSync(filePath)) {
    ensureDir(DAILY_BRIEFS_DIR);
    let template = `# ${date} — OpenCodeChat Daily\n\n## Tasks\n\n## Notes\n\n## Decisions\n`;
    if (content) {
      template = template + "\n" + content;
    }
    fs.writeFileSync(filePath, template, "utf-8");
    return `✅ Created daily note: Daily Briefs/${date}_OpenCodeChat.md`;
  }
  if (content) {
    return obsidianAppend(`Daily Briefs/${date}_OpenCodeChat.md`, content);
  }
  return obsidianRead(`Daily Briefs/${date}_OpenCodeChat.md`);
}

// ── Task Note ──────────────────────────────────────────

export async function obsidianTask(task: string, status: string): Promise<string> {
  const date = todayStr();
  const filePath = path.join(TASKS_DIR, `${date}_Tasks.md`);
  ensureDir(TASKS_DIR);
  const checkbox = status === "done" ? "x" : " ";
  const line = `- [${checkbox}] ${task} — _${nowStr()}_`;
  if (!fs.existsSync(filePath)) {
    const header = `# ${date} — Tasks\n\n`;
    fs.writeFileSync(filePath, header + line + "\n", "utf-8");
  } else {
    fs.appendFileSync(filePath, line + "\n");
  }
  return `✅ Task logged: ${task} [${status}]`;
}
