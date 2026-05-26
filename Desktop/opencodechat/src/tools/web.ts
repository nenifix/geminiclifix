import { exec } from "./exec.js";
import { writeFile } from "./write.js";
import * as https from "https";
import * as http from "http";
import * as fs from "fs";
import * as path from "path";

// ── Web Search (via DuckDuckGo Lite) ──────────────────

interface SearchResult {
  title: string;
  url: string;
  snippet: string;
}

async function fetchHTML(url: string, timeoutMs = 15000): Promise<string> {
  return new Promise((resolve, reject) => {
    const mod = url.startsWith("https") ? https : http;
    const req = mod.get(url, { headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0) AppleWebKit/537.36" } }, (res) => {
      // Follow redirects
      if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return fetchHTML(res.headers.location).then(resolve).catch(reject);
      }
      let data = "";
      res.on("data", (chunk: Buffer) => { data += chunk.toString("utf-8"); });
      res.on("end", () => resolve(data));
    });
    req.on("error", reject);
    req.setTimeout(timeoutMs, () => { req.destroy(); reject(new Error("timeout")); });
  });
}

export async function webSearch(query: string, maxResults = 5): Promise<string> {
  try {
    const encoded = encodeURIComponent(query);
    const url = `https://html.duckduckgo.com/html/?q=${encoded}`;
    const html = await fetchHTML(url);

    const results: SearchResult[] = [];
    // DuckDuckGo HTML result blocks
    const resultBlocks = html.split(/<div class="result[^"]*">/).slice(1, maxResults + 1);

    for (const block of resultBlocks) {
      const titleMatch = block.match(/<a[^>]*class="result__a"[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/);
      const snippetMatch = block.match(/<a[^>]*class="result__snippet"[^>]*>([\s\S]*?)<\/a>/);

      if (titleMatch) {
        const title = stripTags(titleMatch[2]).trim();
        let linkUrl = titleMatch[1];
        // DuckDuckGo redirect URLs
        const uddgMatch = linkUrl.match(/uddg=([^&]+)/);
        if (uddgMatch) {
          try { linkUrl = decodeURIComponent(uddgMatch[1]); } catch { /* keep raw */ }
        }
        const snippet = snippetMatch ? stripTags(snippetMatch[1]).trim() : "";
        if (title && linkUrl) {
          results.push({ title, url: linkUrl, snippet });
        }
      }
    }

    if (results.length === 0) {
      // Fallback: try a simpler regex (compatible with ES2022)
      const re = /<a[^>]*rel="nofollow"[^>]*href="(https?:\/\/[^"]+)"[^>]*>([^<]+)<\/a>/gi;
      let m: RegExpExecArray | null;
      while ((m = re.exec(html)) !== null) {
        if (results.length >= maxResults) break;
        results.push({ title: m[2].trim(), url: m[1], snippet: "" });
      }
    }

    if (results.length === 0) {
      return `No results found for "${query}". Try different keywords.`;
    }

    return results.map((r, i) =>
      `${i + 1}. **${r.title}**\n   URL: ${r.url}${r.snippet ? `\n   ${r.snippet.slice(0, 200)}` : ""}`
    ).join("\n\n");
  } catch (err: any) {
    return `Search error: ${err.message}`;
  }
}

// ── Web Fetch (extract readable text from a page) ──────

export async function webFetch(url: string): Promise<string> {
  try {
    const html = await fetchHTML(url);
    const text = stripTags(html)
      .replace(/[ \t]+/g, " ")
      .replace(/\n{3,}/g, "\n\n")
      .trim();
    return text.slice(0, 8000); // Cap for context
  } catch (err: any) {
    return `Fetch error: ${err.message}`;
  }
}

// ── File Download ──────────────────────────────────────

export async function downloadFile(url: string, destPath: string): Promise<string> {
  try {
    // Resolve destPath relative to workspace
    const resolved = path.isAbsolute(destPath) ? destPath : path.join(process.cwd(), destPath);

    // Ensure directory exists
    const dir = path.dirname(resolved);
    fs.mkdirSync(dir, { recursive: true });

    // Download
    const success = await new Promise<boolean>((resolve, reject) => {
      const mod = url.startsWith("https") ? https : http;
      const file = fs.createWriteStream(resolved);
      const req = mod.get(url, { headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0) AppleWebKit/537.36" } }, (res) => {
        if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          // Follow redirect by recursing with new URL
          file.close();
          fs.rmSync(resolved, { force: true });
          downloadFile(res.headers.location, destPath).then(() => resolve(true)).catch(reject);
          return;
        }
        if (res.statusCode !== 200) {
          file.close();
          fs.rmSync(resolved, { force: true });
          reject(new Error(`HTTP ${res.statusCode}`));
          return;
        }
        res.pipe(file);
        file.on("finish", () => { file.close(); resolve(true); });
      });
      req.on("error", (err) => { file.close(); fs.rmSync(resolved, { force: true }); reject(err); });
      req.setTimeout(60000, () => { req.destroy(); file.close(); fs.rmSync(resolved, { force: true }); reject(new Error("timeout")); });
    });

    if (success) {
      const stats = fs.statSync(resolved);
      return `Downloaded to ${resolved} (${(stats.size / 1024).toFixed(1)} KB)`;
    }
    return "Download failed";
  } catch (err: any) {
    return `Download error: ${err.message}`;
  }
}

// ── Helpers ────────────────────────────────────────────

function stripTags(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ");
}
