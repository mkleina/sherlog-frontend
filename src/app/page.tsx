"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import NavBar from "./components/NavBar";
import IssueCard from "./components/IssueCard";
import type { Issue, IssueAction } from "./api/types";
import { api } from "./api/client";

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
      const data = await api.check(ctrl.signal);
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
        await api.reply({ issueId: issue.id, type: "question", message: "Explain more" });
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
        await api.reply({ issueId: issue.id, type: "ignore" });
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
        await api.reply({ issueId: issue.id, type: "action", action: action.id });
        await load();
      } catch (e: any) {
        setError(e?.message || "Failed to perform action");
      }
    },
    [load]
  );

  return (
    <div className="min-h-screen [--header-h:calc(theme(spacing.12)+theme(spacing.2)*2)]">
      <NavBar pollMs={pollMs} />

      {/* Floating top bar with horizontal cards left-to-right */}
      <div className="sticky top-[calc(var(--header-h)+24px)] z-20 px-5">
        <div className="flex flex-wrap gap-3 pb-2">
          {issues.map((issue) => (
            <IssueCard
              key={issue.id}
              issue={issue}
              onExplainMore={handleExplainMore}
              onIgnore={handleIgnore}
              onPerformAction={handlePerformAction}
            />
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
