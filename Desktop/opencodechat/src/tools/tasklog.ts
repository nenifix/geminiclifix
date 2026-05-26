import * as fs from "fs";
import * as path from "path";

const LOG_DIR = process.env["TASK_LOG_DIR"] ?? "./logs";
const LOG_FILE = path.join(LOG_DIR, "tasks.jsonl");

// Ensure log directory exists
fs.mkdirSync(LOG_DIR, { recursive: true });

export interface TaskLogEntry {
  id: string;
  timestamp: string;
  user: string;
  message: string;
  tools_used: string[];
  summary: string;
  status: "completed" | "failed" | "in_progress";
  duration_ms?: number;
}

let taskCounter = 0;

function generateId(): string {
  taskCounter++;
  return `${Date.now().toString(36)}-${taskCounter.toString(36)}`;
}

export function createTaskEntry(user: string, message: string): TaskLogEntry {
  return {
    id: generateId(),
    timestamp: new Date().toISOString(),
    user,
    message: message.slice(0, 500),
    tools_used: [],
    summary: "",
    status: "in_progress",
  };
}

export function updateTask(entry: TaskLogEntry, updates: Partial<TaskLogEntry>): void {
  Object.assign(entry, updates);
}

export function writeTaskLog(entry: TaskLogEntry): void {
  try {
    fs.appendFileSync(LOG_FILE, JSON.stringify(entry) + "\n");
  } catch (err) {
    // Silently fail — logging should never break the app
  }
}

export function readTaskLog(limit = 50): TaskLogEntry[] {
  try {
    if (!fs.existsSync(LOG_FILE)) return [];
    const lines = fs.readFileSync(LOG_FILE, "utf-8").trim().split("\n").filter(Boolean);
    return lines.slice(-limit).map((line) => JSON.parse(line));
  } catch {
    return [];
  }
}

export function getStats(): { total: number; completed: number; failed: number } {
  const entries = readTaskLog(10000);
  return {
    total: entries.length,
    completed: entries.filter((e) => e.status === "completed").length,
    failed: entries.filter((e) => e.status === "failed").length,
  };
}
