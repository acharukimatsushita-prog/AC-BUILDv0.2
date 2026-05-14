import { createServer } from "node:http";
import { existsSync, readFileSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import OpenAI from "openai";
import { queryDb } from "./db.mjs";

const port = Number(process.argv[2] || process.env.PORT || 8099);
const root = process.cwd();
const maxJsonBodyBytes = 1_000_000;

loadLocalEnv();

const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

const types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml; charset=utf-8"
};

createServer(async (request, response) => {
  try {
    const url = new URL(request.url || "/", `http://localhost:${port}`);
    if (url.pathname === "/api/openai/respond") {
      await handleOpenAIResponse(request, response);
      return;
    }

    if (url.pathname === "/api/db/health") {
      await handleDbHealth(request, response);
      return;
    }

    const pathname = url.pathname === "/" ? "/index.html" : decodeURIComponent(url.pathname);
    const filePath = normalize(join(root, pathname));

    if (!filePath.startsWith(root)) {
      response.writeHead(403);
      response.end("Forbidden");
      return;
    }

    const body = await readFile(filePath);
    response.writeHead(200, {
      "Content-Type": types[extname(filePath)] || "application/octet-stream",
      "Cache-Control": "no-store"
    });
    response.end(body);
  } catch {
    response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Not found");
  }
}).listen(port, "127.0.0.1", () => {
  console.log(`AC-BUILDE: http://127.0.0.1:${port}`);
  console.log(`Root: ${root}`);
});

function loadLocalEnv() {
  const envPath = join(root, ".env");
  if (!existsSync(envPath)) return;

  const content = readFileSync(envPath, "utf8");
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const separator = trimmed.indexOf("=");
    if (separator === -1) continue;

    const key = trimmed.slice(0, separator).trim();
    const value = trimmed.slice(separator + 1).trim().replace(/^["']|["']$/g, "");
    if (key && process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

async function handleOpenAIResponse(request, response) {
  try {
    if (request.method !== "POST") {
      sendJson(response, 405, { error: "Method not allowed." });
      return;
    }

    if (!openai) {
      sendJson(response, 500, { error: "OPENAI_API_KEY is not set." });
      return;
    }

    const body = await readJsonBody(request);
    const input = typeof body.input === "string" ? body.input.trim() : "";

    if (!input) {
      sendJson(response, 400, { error: "input is required." });
      return;
    }

    const apiResponse = await openai.responses.create({
      model: body.model || process.env.OPENAI_MODEL || "gpt-4.1-mini",
      instructions: body.instructions,
      input
    });

    sendJson(response, 200, {
      id: apiResponse.id,
      model: apiResponse.model,
      text: apiResponse.output_text
    });
  } catch (error) {
    sendJson(response, 500, {
      error: error instanceof Error ? error.message : "OpenAI request failed."
    });
  }
}

async function handleDbHealth(request, response) {
  try {
    if (request.method !== "GET") {
      sendJson(response, 405, { error: "Method not allowed." });
      return;
    }

    const result = await queryDb("select now() as now");
    sendJson(response, 200, {
      ok: true,
      now: result.rows[0]?.now
    });
  } catch (error) {
    sendJson(response, 500, {
      ok: false,
      error: error instanceof Error ? error.message : "Database health check failed."
    });
  }
}

async function readJsonBody(request) {
  let size = 0;
  const chunks = [];

  for await (const chunk of request) {
    size += chunk.length;
    if (size > maxJsonBodyBytes) {
      throw new Error("Request body is too large.");
    }
    chunks.push(chunk);
  }

  if (chunks.length === 0) return {};
  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}

function sendJson(response, statusCode, body) {
  response.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store"
  });
  response.end(JSON.stringify(body));
}
