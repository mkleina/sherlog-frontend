import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ArrowsPointingOutIcon } from "@heroicons/react/24/outline";
import type { Issue, IssueAction } from "../api/types";

function badgeColor(sev?: Issue["severity"]) {
  switch (sev) {
    case "error":
      return "text-[#ff5a5a] border-[#ff5a5a]";
    case "warn":
      return "text-[#ffb347] border-[#ffb347]";
    default:
      return "text-[#ffffff] border-[#ffffff]";
  }
}

function formatDate(d?: string | number | Date) {
  if (!d) return "";
  const dt = new Date(d);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(dt.getDate())}.${pad(dt.getMonth() + 1)}.${dt.getFullYear()}, ${pad(dt.getHours())}:${pad(dt.getMinutes())}:${pad(dt.getSeconds())}`;
}

export default function IssueCard({
  issue,
  onDiscussDetails,
  onIgnore,
  onPerformAction,
}: {
  issue: Issue;
  onDiscussDetails: (issue: Issue) => void | Promise<void>;
  onIgnore: (issue: Issue) => void | Promise<void>;
  onPerformAction: (issue: Issue, action: IssueAction) => void | Promise<void>;
}) {
  const logsRef = useRef<HTMLDivElement | null>(null);
  const modalLogsRef = useRef<HTMLDivElement | null>(null);
  const [showLogs, setShowLogs] = useState(false);

  // Always show the most recent log lines by default
  useEffect(() => {
    const el = logsRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [issue.logContext?.length]);

  // When opening the modal, ensure its log view is scrolled to the end as well
  useEffect(() => {
    if (!showLogs) return;
    const el = modalLogsRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [showLogs, issue.logContext?.length]);
  return (
    <div className="new-issue-card shadow-lg p-4 rounded-xl border border-[#3d2b22] bg-[#21150f] text-[#f3e9dd] overflow-hidden w-[min(420px,90vw)] min-w-[320px] transition-shadow hover:shadow-xl hover:shadow-black/20 h-auto flex flex-col gap-3">
      <div className="flex flex-col flex-1 min-h-0">
        <div className="mb-2 flex items-start gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className={`text-[10px] px-2.5 py-0.5 rounded-full border-2 font-semibold ${badgeColor(issue.severity)}`}>
                {issue.severity?.toUpperCase() || "INFO"}
              </span>
              <span className="text-xs opacity-80">#{issue.id}</span>
              {issue.createdAt && (
                <span className="ml-auto text-xs opacity-70">{formatDate(issue.createdAt)}</span>
              )}
            </div>
            <p className="mt-2 text-sm leading-relaxed whitespace-pre-line font-medium">
              {issue.summary}
            </p>
          </div>
        </div>
        {Array.isArray(issue.logContext) && issue.logContext.length > 0 && (
          <div className="flex flex-col flex-1 min-h-0">
            <div
              ref={logsRef}
              className="logs-box relative rounded-md border border-[#444444]/70 bg-[#1a120d]/60 font-mono text-[12px] leading-5 overflow-auto w-full h-[3.75rem]"
            >
              <div className="sticky top-0 z-10 h-0 relative">
                <button
                  type="button"
                  onClick={() => setShowLogs(true)}
                  className="absolute top-1 right-1 text-[10px] px-1.5 py-0.5 rounded-md border border-[#6a4a35] text-[#f3e9dd] bg-[#3b291f]/70 hover:bg-[#52392a]"
                  title="Open logs"
                >
                  <ArrowsPointingOutIcon className="w-3.5 h-3.5" aria-hidden="true" />
                  <span className="sr-only">Open logs</span>
                </button>
              </div>
              <div className="pl-2 pr-8">
                {issue.logContext.map((line, idx) => (
                  <div
                    key={idx}
                    className={`whitespace-pre ${idx === issue.logContext!.length - 1 ? "text-white" : "text-[#b9a391]"}`}
                  >
                    {line}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        {showLogs &&
          createPortal(
            <div
              role="dialog"
              aria-modal="true"
              className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
              onClick={() => setShowLogs(false)}
            >
              <div
                className="relative w-[70vw] h-[70vh] rounded-xl border border-[#3a2a22] bg-[#21150f] text-[#f3e9dd] shadow-2xl flex flex-col"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between px-4 py-3 border-b border-[#3a2a22] shrink-0">
                  <h2 className="text-sm font-semibold opacity-80">Logs for issue #{issue.id}</h2>
                  <button
                    type="button"
                    onClick={() => setShowLogs(false)}
                    className="text-xs px-2 py-1 rounded-md border border-[#6a4a35] text-[#f3e9dd] bg-[#3b291f]/70 hover:bg-[#52392a]"
                  >
                    Close
                  </button>
                </div>
                <div ref={modalLogsRef} className="logs-box m-4 rounded-md border border-[#444444] bg-[#1a120d]/60 p-3 font-mono text-[12px] leading-5 overflow-auto flex-1 min-h-0">
                  {issue.logContext!.map((line, idx) => (
                    <div key={idx} className={`whitespace-pre-wrap break-words ${idx === issue.logContext!.length - 1 ? "text-white" : "text-[#b9a391]"}`}>
                      {line}
                    </div>
                  ))}
                </div>
              </div>
            </div>,
            document.body
          )}
      </div>
      <div className="flex flex-col gap-3 shrink-0">
        {/* Actions from backend - grouped in one lighter panel */}
        {(issue.actions ?? []).length > 0 && (
          <div className="rounded-lg border border-[#3a2820] bg-[#2b1b13] p-3">
            <div className="flex flex-col gap-2">
              {(issue.actions ?? []).map((act) => (
                <button
                  key={act.id}
                  onClick={() => void onPerformAction(issue, act)}
                  className="w-full text-xs px-3 py-1.5 rounded-md bg-amber-500 text-[#1a110d] hover:bg-amber-400 font-semibold"
                  title={act.label}
                >
                  {act.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Secondary controls */}
        <button
          onClick={() => void onDiscussDetails(issue)}
          className="text-xs px-3 py-1.5 rounded-md bg-transparent hover:bg-[#3b291f] text-[#f9f4ee] border border-[#6a4a35]"
        >
          Discuss details
        </button>
        <button
          onClick={() => void onIgnore(issue)}
          className="text-xs px-3 py-1.5 rounded-md bg-[#3b291f] hover:bg-[#52392a] text-[#f9f4ee] border border-[#6a4a35]"
        >
          Ignore
        </button>
      </div>
    </div>
  );
}
