const serverApiBase = process.env.INTERNAL_API_URL || "http://127.0.0.1:8000";
const browserApiBase = "/backend-api";

export function getApiBase(isServer = typeof window === "undefined") {
  return isServer ? serverApiBase : browserApiBase;
}

export async function fetchApiHealth(isServer?: boolean) {
  const response = await fetch(`${getApiBase(isServer)}/health`, { cache: "no-store" });
  return response.json() as Promise<{ ok: boolean; service?: string }>;
}

export async function fetchDbHealth(isServer?: boolean) {
  const response = await fetch(`${getApiBase(isServer)}/db/health`, { cache: "no-store" });
  return response.json() as Promise<{ ok: boolean; now?: string; detail?: string }>;
}
