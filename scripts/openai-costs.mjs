import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const args = new Set(process.argv.slice(2));
const watch = args.has("--watch");
const intervalSeconds = Number(getArgValue("interval") || 300);

loadLocalEnv();

const apiKey = process.env.OPENAI_ADMIN_KEY || process.env.OPENAI_API_KEY;

if (!apiKey) {
  console.error("OPENAI_ADMIN_KEY or OPENAI_API_KEY is not set.");
  console.error("Add it to .env, then run: npm.cmd run usage:watch");
  process.exitCode = 1;
} else if (watch) {
  await renderLoop();
} else {
  await renderCosts();
}

async function renderLoop() {
  while (true) {
    console.clear();
    await renderCosts();
    console.log("");
    console.log(`Refreshing every ${intervalSeconds}s. Press Ctrl+C to stop.`);
    await wait(intervalSeconds * 1000);
  }
}

async function renderCosts() {
  const now = new Date();
  const todayStart = Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate(),
  ) / 1000;
  const monthStart = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1) / 1000;
  const end = Math.ceil(now.getTime() / 1000);

  const [today, month] = await Promise.all([
    fetchCosts(todayStart, end, 1),
    fetchCosts(monthStart, end, 31),
  ]);

  printSummary({
    today: totalCost(today),
    month: totalCost(month),
    currency: detectCurrency(month) || detectCurrency(today) || "usd",
    updatedAt: now,
  });
}

async function fetchCosts(startTime, endTime, limit) {
  const url = new URL("https://api.openai.com/v1/organization/costs");
  url.searchParams.set("start_time", String(startTime));
  url.searchParams.set("end_time", String(endTime));
  url.searchParams.set("bucket_width", "1d");
  url.searchParams.set("limit", String(limit));

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`OpenAI Costs API failed: ${response.status} ${text}`);
  }

  return response.json();
}

function totalCost(payload) {
  const buckets = Array.isArray(payload?.data) ? payload.data : [];

  return buckets.reduce((bucketTotal, bucket) => {
    const results = Array.isArray(bucket.results) ? bucket.results : [];
    return bucketTotal + results.reduce((sum, result) => {
      return sum + Number(result?.amount?.value || 0);
    }, 0);
  }, 0);
}

function detectCurrency(payload) {
  const buckets = Array.isArray(payload?.data) ? payload.data : [];

  for (const bucket of buckets) {
    const results = Array.isArray(bucket.results) ? bucket.results : [];
    for (const result of results) {
      if (result?.amount?.currency) {
        return result.amount.currency;
      }
    }
  }

  return "";
}

function printSummary({ today, month, currency, updatedAt }) {
  const label = currency.toUpperCase();
  console.log("OpenAI API costs");
  console.log("----------------");
  console.log(`Today UTC : ${formatMoney(today, label)}`);
  console.log(`This month: ${formatMoney(month, label)}`);
  console.log(`Updated   : ${updatedAt.toLocaleString()}`);
  console.log("");
  console.log("Dashboard : https://platform.openai.com/usage");
}

function formatMoney(value, currency) {
  return `${currency} ${value.toFixed(4)}`;
}

function getArgValue(name) {
  const prefix = `--${name}=`;
  const arg = process.argv.find((item) => item.startsWith(prefix));
  return arg ? arg.slice(prefix.length) : "";
}

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

function wait(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
