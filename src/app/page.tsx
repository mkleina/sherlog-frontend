"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type IssueAction = {
  id: string;
  label: string;
  args?: Record<string, any>;
};

type Issue = {
  id: number | string;
  summary?: string; // new field from API
  message?: string; // keep for backward compatibility
  logContext?: string[]; // optional array of log lines
  actions?: IssueAction[];
  severity?: "info" | "warn" | "error";
  createdAt?: string;
};

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || ""; // same-origin by default

async function fetchIssues(signal?: AbortSignal): Promise<Issue[]> {
  const res = await fetch(`${API_BASE}/check`, { cache: "no-store", signal });
  if (!res.ok) throw new Error(`Failed to fetch issues: ${res.status}`);
  const data = await res.json();
  // Accept either {issues: Issue[]} or Issue[] directly
  return Array.isArray(data) ? data : data?.issues ?? [];
}

async function postReply(body: any): Promise<any> {
  const res = await fetch(`${API_BASE}/reply`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Reply failed: ${res.status}`);
  return res.json().catch(() => ({}));
}

export default function Home() {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const pollMs = 5000;
  const abortRef = useRef<AbortController | null>(null);

  const load = useCallback(async () => {
    setError(null);
    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    try {
      const data = await fetchIssues(ctrl.signal);
      setIssues(data);
    } catch (e: any) {
      if (e?.name !== "AbortError") setError(e?.message || "Failed to load");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
    const id = setInterval(() => void load(), pollMs);
    return () => {
      clearInterval(id);
      abortRef.current?.abort();
    };
  }, [load]);

  const handleExplainMore = useCallback(
    async (issue: Issue) => {
      try {
        await postReply({ issueId: issue.id, type: "question", message: "Explain more" });
        await load();
      } catch (e: any) {
        setError(e?.message || "Failed to send question");
      }
    },
    [load]
  );

  const handleIgnore = useCallback(
    async (issue: Issue) => {
      try {
        await postReply({ issueId: issue.id, type: "ignore" });
        await load();
      } catch (e: any) {
        setError(e?.message || "Failed to ignore");
      }
    },
    [load]
  );

  const handlePerformAction = useCallback(
    async (issue: Issue, action: IssueAction) => {
      try {
        await postReply({ issueId: issue.id, type: "action", action: action.id });
        await load();
      } catch (e: any) {
        setError(e?.message || "Failed to perform action");
      }
    },
    [load]
  );

  const badgeColor = useCallback((sev?: Issue["severity"]) => {
    switch (sev) {
      case "error":
        return "text-[#ff5a5a] border-[#ff5a5a]";
      case "warn":
        return "text-[#ffb347] border-[#ffb347]";
      default:
        return "text-[#ffffff] border-[#ffffff]";
    }
  }, []);

  const severityIcon = useCallback((sev?: Issue["severity"]) => {
    switch (sev) {
      case "error":
        return "❌";
      case "warn":
        return "⚠️";
      default:
        return "ℹ️";
    }
  }, []);

  return (
    <div className="min-h-screen [--header-h:calc(theme(spacing.12)+theme(spacing.2)*2)]">
      <header className="sticky top-0 z-10 bg-transparent backdrop-blur border-b border-[#3a2a22]/60">
        <div className="px-5 max-w-5xl py-2 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img src="/logo.svg" alt="Logo" className="h-12 w-auto block select-none" />
            <h1 className="text-lg font-semibold tracking-tight leading-none text-[#f3e9dd]/60">Observability Assistant</h1>
          </div>
          <div className="text-xs opacity-70">Polling /check every {pollMs / 1000}s</div>
        </div>
      </header>

      {/* Floating top bar with horizontal cards left-to-right */}
      <div className="sticky top-[calc(var(--header-h)+24px)] z-20 px-5">
        <div className="flex flex-wrap gap-3 pb-2">
          {issues.map((issue) => (
            <div
              key={issue.id}
              className="shadow-lg rounded-xl border border-[#3d2b22] bg-[#21150f] text-[#f3e9dd] overflow-hidden w-[min(420px,90vw)] min-w-[320px] transition-shadow hover:shadow-xl hover:shadow-black/20"
            >
              <div className="p-4">
                <div className="mb-2 flex items-center gap-2">
                  <span className="text-base" aria-hidden>{severityIcon(issue.severity)}</span>
                  <p className="flex-1 text-sm leading-relaxed whitespace-pre-line font-medium">
                    {issue.summary || issue.message}
                  </p>
                  <span className={`text-[10px] px-2.5 py-0.5 rounded-full border-2 font-semibold ${badgeColor(issue.severity)}`}>
                    {issue.severity?.toUpperCase() || "INFO"}
                  </span>
                  <span className="text-xs opacity-70">#{issue.id}</span>
                  {issue.createdAt && (
                    <span className="ml-2 text-xs opacity-70">{new Date(issue.createdAt).toLocaleString()}</span>
                  )}
                </div>
                {Array.isArray(issue.logContext) && issue.logContext.length > 0 && (
                  <div className="mt-2 rounded-md border border-[#444444] bg-[#1a120d]/60 p-2 font-mono text-[12px] leading-5 max-h-40 overflow-auto">
                    {issue.logContext.map((line, idx) => (
                      <div
                        key={idx}
                        className={`whitespace-pre-wrap break-words ${idx === (issue.logContext!.length - 1) ? "text-white" : "text-[#b9a391]"}`}
                      >
                        {line}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="border-t border-[#3a2820] p-3 flex flex-col gap-3">
                {/* Actions from backend */}
                <div className="flex flex-col gap-3">
                  {(issue.actions ?? []).map((act) => (
                    <div key={act.id} className="rounded-lg border border-[#3a2820] bg-[#261811]">
                      <div className="p-2 flex items-center gap-2">
                        <button
                          onClick={() => void handlePerformAction(issue, act)}
                          className="w-full text-xs px-3 py-1.5 rounded-md bg-amber-500 text-[#1a110d] hover:bg-amber-400 font-semibold"
                          title={act.label}
                        >
                          {act.label}
                        </button>
                      </div>
                      {act.args && (
                        <div className="px-3 pb-3">
                          <div className="overflow-x-auto">
                            <table className="w-full text-[11px]">
                              <thead>
                                <tr className="text-left text-[#cbb9a8]">
                                  <th className="py-1 pr-3">Key</th>
                                  <th className="py-1">Value</th>
                                </tr>
                              </thead>
                              <tbody>
                                {Object.entries(act.args).map(([k, v]) => (
                                  <tr key={k} className="border-t border-[#3a2a22]">
                                    <td className="py-1 pr-3 align-top font-medium text-[#f3e9dd]">{k}</td>
                                    <td className="py-1 align-top text-[#f3e9dd]">
                                      <pre className="whitespace-pre-wrap break-words text-[11px]">{typeof v === "string" ? v : JSON.stringify(v, null, 2)}</pre>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Secondary controls */}
                <button
                  onClick={() => void handleExplainMore(issue)}
                  className="text-xs px-3 py-1.5 rounded-md bg-[#3b291f] hover:bg-[#52392a] text-[#f9f4ee] border border-[#6a4a35]"
                >
                  Explain more
                </button>
                <button
                  onClick={() => void handleIgnore(issue)}
                  className="text-xs px-3 py-1.5 rounded-md bg-[#3b291f] hover:bg-[#52392a] text-[#f9f4ee] border border-[#6a4a35]"
                >
                  Ignore
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <main className="mx-auto max-w-5xl px-4 py-8">
        {error && (
          <div className="mb-4 rounded-md border border-red-300 bg-red-50 p-3 text-red-700">
            {error}
          </div>
        )}
        {loading && issues.length === 0 ? (
          <div className="text-sm">Loading issues…</div>
        ) : issues.length === 0 ? (
          <div className="text-sm">No unsolved issues.</div>
        ) : null}
      </main>

      
    </div>
  );
}
