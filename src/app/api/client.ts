import type { Issue } from "./types";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || ""; // same-origin by default

async function check(signal?: AbortSignal): Promise<Issue[]> {
  const res = await fetch(`${API_BASE}/check`, { cache: "no-store", signal });
  if (!res.ok) throw new Error(`Failed to fetch issues: ${res.status}`);
  const data = await res.json();
  return Array.isArray(data) ? data : data?.issues ?? [];
}

async function reply(body: any): Promise<any> {
  const res = await fetch(`${API_BASE}/reply`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Reply failed: ${res.status}`);
  return res.json().catch(() => ({}));
}

export const api = { check, reply };
