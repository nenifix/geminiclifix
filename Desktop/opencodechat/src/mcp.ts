#!/usr/bin/env node

/**
 * OpenCodeChat MCP Server
 * 
 * Exposes all agent tools via Model Context Protocol.
 * 
 * Usage:
 *   node dist/mcp.js                    # stdio mode (for MCP clients)
 *   node dist/mcp.js --http             # HTTP mode
 *   node dist/mcp.js --http --port 3001 # HTTP on custom port
 */

import * as readline from "readline";
import { toolDefinitions, executeTool } from "./tools/index.js";

// ── JSON-RPC types ────────────────────────────────────

interface JsonRpcRequest {
  jsonrpc: string;
  id: number | string;
  method: string;
  params?: Record<string, unknown>;
}

interface JsonRpcResponse {
  jsonrpc: "2.0";
  id: number | string;
  result?: unknown;
  error?: { code: number; message: string };
}

function respond(id: number | string, result: unknown) {
  const res: JsonRpcResponse = { jsonrpc: "2.0", id, result };
  process.stdout.write(JSON.stringify(res) + "\n");
}

function makeError(id: number | string, code: number, message: string) {
  const res: JsonRpcResponse = { jsonrpc: "2.0", id, error: { code, message } };
  process.stdout.write(JSON.stringify(res) + "\n");
}

// ── MCP Tool Definitions ──────────────────────────────

function buildMcpTools() {
  return toolDefinitions.map((t: any) => ({
    name: t.function.name,
    description: t.function.description,
    inputSchema: {
      type: "object",
      properties: t.function.parameters?.properties || {},
      required: t.function.parameters?.required || [],
    },
  }));
}

// ── MCP Handlers ──────────────────────────────────────

async function handleRequest(req: JsonRpcRequest) {
  const reqId = req.id;
  switch (req.method) {
    case "initialize":
      respond(reqId, {
        protocolVersion: "2024-11-05",
        capabilities: { tools: {} },
        serverInfo: { name: "opencodechat", version: "1.0.0" },
      });
      break;
    case "tools/list":
      respond(reqId, { tools: buildMcpTools() });
      break;
    case "tools/call": {
      const name = req.params?.name as string;
      const rawArgs = (req.params?.arguments || {}) as Record<string, unknown>;
      const args: Record<string, string | boolean> = {};
      for (const [k, v] of Object.entries(rawArgs)) {
        args[k] = typeof v === "boolean" ? v : String(v);
      }
      if (!name) {
        makeError(reqId, -32602, "Missing tool name");
        break;
      }
      try {
        const result = await executeTool(name, args);
        respond(reqId, { content: [{ type: "text", text: result }] });
      } catch (err: any) {
        respond(reqId, { content: [{ type: "text", text: `Error: ${err.message}` }], isError: true });
      }
      break;
    }
    case "ping":
      respond(reqId, {});
      break;
    default:
      makeError(reqId, -32601, `Unknown method: ${req.method}`);
  }
}

// ── Stdio Transport ───────────────────────────────────

function startStdio() {
  const rl = readline.createInterface({ input: process.stdin });
  rl.on("line", (line: string) => {
    try {
      const req = JSON.parse(line) as JsonRpcRequest;
      handleRequest(req);
    } catch {
      // ignore malformed
    }
  });
  rl.on("close", () => process.exit(0));
}

// ── HTTP Transport ────────────────────────────────────

async function startHttp(port: number) {
  const express: any = await import("express");
  const app = express.default();
  app.use(express.default.json({ limit: "1mb" }));

  interface ApiRequest {
    jsonrpc: string;
    id: number | string;
    method: string;
    params?: Record<string, unknown>;
  }

  // MCP endpoint
  app.post("/mcp", (req: { body: ApiRequest }, res: { json: (d: any) => void }) => {
    const r = req.body;
    // Capture stdout to get the JSON-RPC response
    const origWrite = process.stdout.write;
    let captured = "";
    process.stdout.write = (chunk: any) => { captured += chunk.toString(); return true; };
    handleRequest(r);
    process.stdout.write = origWrite;
    try {
      res.json(JSON.parse(captured));
    } catch {
      res.json({ jsonrpc: "2.0", id: r?.id, result: { status: "ok" } });
    }
  });

  app.get("/health", (_req: unknown, res: { json: (d: any) => void }) => {
    res.json({ status: "ok", server: "opencodechat-mcp", version: "1.0.0" });
  });

  app.get("/tools", (_req: unknown, res: { json: (d: any) => void }) => {
    res.json({ tools: buildMcpTools() });
  });

  app.post("/tools/:name", async (_req: any, res: any) => {
    try {
      const name = _req.params.name;
      const rawArgs: Record<string, unknown> = _req.body || {};
      const args: Record<string, string | boolean> = {};
      for (const [k, v] of Object.entries(rawArgs)) {
        args[k] = typeof v === "boolean" ? v : String(v);
      }
      const result = await executeTool(name, args);
      res.json({ success: true, result });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.listen(port, () => {
    console.log(`  🔌 OpenCodeChat API running on http://localhost:${port}`);
    console.log(`  📋 Tools:  http://localhost:${port}/tools`);
    console.log(`  ❤️  Health: http://localhost:${port}/health`);
    console.log(`  🔧 MCP:    http://localhost:${port}/mcp`);
  });
}

// ── Main ──────────────────────────────────────────────

const args = process.argv.slice(2);
const httpMode = args.includes("--http");
const portIdx = args.indexOf("--port");
const port = portIdx >= 0 ? parseInt(args[portIdx + 1]) || 3001 : 3001;

if (httpMode) {
  startHttp(port);
} else {
  startStdio();
}
