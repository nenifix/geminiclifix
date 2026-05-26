/**
 * Browser Use Tools for NeniCoder
 *
 * Full browser automation via puppeteer-core.
 * Requires Chrome/Chromium installed on the host machine.
 *
 * Set CHROME_PATH env var to point to your Chrome executable.
 * Auto-detects common Chrome locations on Windows, macOS, and Linux.
 *
 * Tools:
 *   browser_navigate  — Go to a URL
 *   browser_snapshot  — Get page text/content
 *   browser_screenshot — Take a screenshot (saved to workspace)
 *   browser_click     — Click an element by selector
 *   browser_type      — Type text into an input
 *   browser_scroll    — Scroll the page
 *   browser_evaluate  — Run JavaScript on the page
 *   browser_tabs      — List/open/close tabs
 *   browser_wait      — Wait for element or time
 *   browser_back      — Go back in history
 */

import * as fs from "fs";
import * as path from "path";
import { config } from "../config.js";

// ── Chrome Detection ────────────────────────────────────────

function getChromePath(): string | undefined {
  // 1. Explicit env var
  if (process.env["CHROME_PATH"]) return process.env["CHROME_PATH"];

  // 2. Common Windows locations
  const winPaths = [
    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
    path.join(process.env["LOCALAPPDATA"] ?? "", "Google\\Chrome\\Application\\chrome.exe"),
    path.join(process.env["LOCALAPPDATA"] ?? "", "Chromium\\Application\\chrome.exe"),
    // Brave
    "C:\\Program Files\\BraveSoftware\\Brave-Browser\\Application\\brave.exe",
    path.join(process.env["LOCALAPPDATA"] ?? "", "BraveSoftware\\Brave-Browser\\Application\\brave.exe"),
    // Edge (Chromium)
    "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
    "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
  ];

  for (const p of winPaths) {
    if (p && fs.existsSync(p)) return p;
  }

  // 3. macOS
  const macPaths = [
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/Applications/Brave Browser.app/Contents/MacOS/Brave Browser",
    "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
  ];
  for (const p of macPaths) {
    if (fs.existsSync(p)) return p;
  }

  // 4. Linux
  const linuxPaths = [
    "/usr/bin/google-chrome",
    "/usr/bin/google-chrome-stable",
    "/usr/bin/chromium-browser",
    "/usr/bin/chromium",
    "/snap/bin/chromium",
    "/usr/bin/microsoft-edge",
  ];
  for (const p of linuxPaths) {
    if (fs.existsSync(p)) return p;
  }

  return undefined;
}

// ── Browser State (singleton tab management) ────────────────

interface BrowserTab {
  id: string;
  url: string;
  title: string;
}

let puppeteer: any = null;
let browser: any = null;
let page: any = null;
let tabs: BrowserTab[] = [];
let activeTabId: string = "default";

async function ensureBrowser(): Promise<any> {
  if (page) return page;

  try {
    puppeteer = await import("puppeteer-core");
  } catch {
    throw new Error(
      "puppeteer-core is not installed. Run: npm install puppeteer-core"
    );
  }

  const chromePath = getChromePath();
  if (!chromePath) {
    throw new Error(
      "Chrome/Chromium not found. Install Chrome or set CHROME_PATH env var."
    );
  }

  browser = await puppeteer.launch({
    headless: true,
    executablePath: chromePath,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-gpu",
    ],
  });

  page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });

  const tab: BrowserTab = { id: "default", url: "about:blank", title: "New Tab" };
  tabs = [tab];
  activeTabId = "default";

  // Update tab info on navigation
  page.on("framenavigated", async (frame: any) => {
    if (frame === page.mainFrame()) {
      const t = tabs.find((t) => t.id === activeTabId);
      if (t) {
        t.url = page.url();
        try { t.title = await page.title(); } catch { /* ignore */ }
      }
    }
  });

  return page;
}

async function getPage(): Promise<any> {
  if (!page) return ensureBrowser();
  return page;
}

// ── Helper: Save screenshot to workspace ────────────────────

async function saveScreenshot(screenshotBuffer: Buffer, filename?: string): Promise<string> {
  const screenshotsDir = path.join(config.workspace, "screenshots");
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }
  const name = filename || `screenshot-${Date.now()}.png`;
  const filePath = path.join(screenshotsDir, name);
  fs.writeFileSync(filePath, screenshotBuffer);
  return filePath;
}

// ── Tool Implementations ────────────────────────────────────

/** Navigate to a URL */
export async function browserNavigate(url: string): Promise<string> {
  const p = await getPage();
  try {
    await p.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 });
    const title = await p.title();
    return `Navigated to: ${url}\nTitle: ${title}`;
  } catch (err: any) {
    return `Navigation error: ${err.message}`;
  }
}

/** Get page text content (readable extraction) */
export async function browserSnapshot(selector?: string): Promise<string> {
  const p = await getPage();
  try {
    let text: string;
    if (selector) {
      text = await p.$eval(selector, (el: any) => el.innerText || el.textContent || "");
    } else {
      text = await p.evaluate(() => document.body?.innerText || document.body?.textContent || "");
    }
    // Truncate very long pages
    if (text.length > 8000) {
      text = text.slice(0, 8000) + "\n... [truncated, page too long]";
    }
    const url = p.url();
    const title = await p.title().catch(() => "Unknown");
    return `📄 ${title}\n🔗 ${url}\n\n${text}`;
  } catch (err: any) {
    return `Snapshot error: ${err.message}`;
  }
}

/** Take a screenshot */
export async function browserScreenshot(filename?: string, fullPage?: boolean): Promise<string> {
  const p = await getPage();
  try {
    const buffer = await p.screenshot({ fullPage: fullPage ?? false, type: "png" });
    const filePath = await saveScreenshot(buffer, filename || `screenshot-${Date.now()}.png`);
    return `Screenshot saved: ${filePath}`;
  } catch (err: any) {
    return `Screenshot error: ${err.message}`;
  }
}

/** Click an element by CSS selector */
export async function browserClick(selector: string): Promise<string> {
  const p = await getPage();
  try {
    await p.waitForSelector(selector, { timeout: 10000 });
    await p.click(selector);
    return `Clicked: ${selector}`;
  } catch (err: any) {
    return `Click error: ${err.message}`;
  }
}

/** Type text into an input field */
export async function browserType(selector: string, text: string, clearFirst?: boolean): Promise<string> {
  const p = await getPage();
  try {
    await p.waitForSelector(selector, { timeout: 10000 });
    if (clearFirst) {
      await p.click(selector, { clickCount: 3 });
      await p.keyboard.press("Backspace");
    }
    await p.type(selector, text, { delay: 30 });
    return `Typed into ${selector}: "${text.slice(0, 50)}${text.length > 50 ? "..." : ""}"`;
  } catch (err: any) {
    return `Type error: ${err.message}`;
  }
}

/** Scroll the page */
export async function browserScroll(direction: string, amount?: number): Promise<string> {
  const p = await getPage();
  try {
    const px = amount || 500;
    if (direction === "down") {
      await p.evaluate((n: number) => window.scrollBy(0, n), px);
    } else if (direction === "up") {
      await p.evaluate((n: number) => window.scrollBy(0, -n), px);
    } else if (direction === "top") {
      await p.evaluate(() => window.scrollTo(0, 0));
    } else if (direction === "bottom") {
      await p.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    }
    const pos = await p.evaluate(() => ({ x: window.scrollX, y: window.scrollY }));
    return `Scrolled ${direction}. Position: x=${pos.x}, y=${pos.y}`;
  } catch (err: any) {
    return `Scroll error: ${err.message}`;
  }
}

/** Run JavaScript on the page */
export async function browserEvaluate(script: string): Promise<string> {
  const p = await getPage();
  try {
    const result = await p.evaluate(script);
    const text = typeof result === "object" ? JSON.stringify(result, null, 2) : String(result);
    if (text.length > 4000) return text.slice(0, 4000) + "\n... [truncated]";
    return text || "(no return value)";
  } catch (err: any) {
    return `Evaluate error: ${err.message}`;
  }
}

/** List, open, or close browser tabs */
export async function browserTabs(action: string, url?: string): Promise<string> {
  try {
    if (action === "list") {
      if (tabs.length === 0) return "No tabs open.";
      return tabs.map((t, i) => `${i + 1}. [${t.id}] ${t.title}\n   ${t.url}`).join("\n");
    }
    if (action === "new") {
      if (!browser) await ensureBrowser();
      const newPage = await browser.newPage();
      const id = `tab-${tabs.length + 1}`;
      const tab: BrowserTab = { id, url: url || "about:blank", title: "New Tab" };
      tabs.push(tab);
      if (url) {
        await newPage.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 });
        tab.url = newPage.url();
        tab.title = await newPage.title().catch(() => "Unknown");
      }
      return `Opened new tab [${id}]: ${tab.url}`;
    }
    if (action === "close") {
      if (tabs.length <= 1) return "Cannot close the last tab.";
      const idx = tabs.findIndex((t) => t.id === activeTabId);
      if (idx >= 0) tabs.splice(idx, 1);
      activeTabId = tabs[0]?.id || "default";
      return `Closed tab. Active: [${activeTabId}]`;
    }
    if (action === "switch") {
      const tab = tabs.find((t) => t.id === url);
      if (!tab) return `Tab not found. Available: ${tabs.map((t) => t.id).join(", ")}`;
      activeTabId = tab.id;
      return `Switched to [${tab.id}]: ${tab.title}`;
    }
    return `Unknown action: ${action}. Use: list, new, close, switch`;
  } catch (err: any) {
    return `Tabs error: ${err.message}`;
  }
}

/** Wait for element or time */
export async function browserWait(selector: string, timeoutMs?: number): Promise<string> {
  const p = await getPage();
  try {
    if (selector.startsWith("time:")) {
      const ms = parseInt(selector.replace("time:", "")) || 1000;
      await new Promise((r) => setTimeout(r, ms));
      return `Waited ${ms}ms`;
    }
    await p.waitForSelector(selector, { timeout: timeoutMs || 10000 });
    return `Element found: ${selector}`;
  } catch (err: any) {
    return `Wait error: ${err.message}`;
  }
}

/** Go back in browser history */
export async function browserBack(): Promise<string> {
  const p = await getPage();
  try {
    await p.back({ waitUntil: "domcontentloaded" });
    const url = p.url();
    const title = await p.title().catch(() => "Unknown");
    return `Went back to: ${title}\n${url}`;
  } catch (err: any) {
    return `Back error: ${err.message}`;
  }
}

/** Get current page URL and title */
export async function browserInfo(): Promise<string> {
  const p = await getPage();
  try {
    const url = p.url();
    const title = await p.title();
    return `📄 ${title}\n🔗 ${url}`;
  } catch (err: any) {
    return `Info error: ${err.message}`;
  }
}

/** Close the browser */
export async function browserClose(): Promise<string> {
  try {
    if (browser) {
      await browser.close();
      browser = null;
      page = null;
      tabs = [];
      return "Browser closed.";
    }
    return "Browser was not open.";
  } catch (err: any) {
    return `Close error: ${err.message}`;
  }
}
