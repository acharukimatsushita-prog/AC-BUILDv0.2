import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(fileURLToPath(import.meta.url));
const host = "127.0.0.1";
const port = 8099;
const appUrl = `http://${host}:${port}`;
const noOpen = process.argv.includes("--no-open");

async function main() {
  let serverProcess = null;

  if (!(await isServerReady())) {
    serverProcess = startServer();
    await waitForServer();
  }

  if (!(await isServerReady())) {
    console.error("AC-BUILD server did not start.");
    if (serverProcess) {
      serverProcess.kill();
    }
    process.exitCode = 1;
    return;
  }

  console.log(`AC-BUILD is ready: ${appUrl}`);
  if (!noOpen) {
    openBrowser(appUrl);
  }

  if (serverProcess) {
    console.log("Keep this window open while using AC-BUILD.");
    await waitForExit(serverProcess);
  }
}

function startServer() {
  return spawn(process.execPath, ["server.mjs", String(port)], {
    cwd: root,
    stdio: "inherit",
    windowsHide: false,
  });
}

async function waitForServer() {
  for (let attempt = 0; attempt < 40; attempt += 1) {
    if (await isServerReady()) return;
    await delay(250);
  }
}

async function isServerReady() {
  try {
    const response = await fetch(appUrl, { cache: "no-store" });
    if (!response.ok) return false;
    const html = await response.text();
    return html.includes("react-root");
  } catch {
    return false;
  }
}

function openBrowser(url) {
  const candidates = [
    "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
    "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
  ];
  const browser = candidates.find((path) => existsSync(path));
  const child = browser
    ? spawn(browser, [url], { detached: true, stdio: "ignore", windowsHide: false })
    : spawn("cmd.exe", ["/c", "start", "", url], { detached: true, stdio: "ignore", windowsHide: false });
  child.unref();
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function waitForExit(child) {
  return new Promise((resolve) => {
    child.on("exit", resolve);
  });
}

main();
