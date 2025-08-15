import React from "react";

export type IssueAction = {
  id: string;
  label: string;
  args?: Record<string, any>;
};

export type Issue = {
  id: number | string;
  summary?: string;
  message?: string;
  logContext?: string[];
  actions?: IssueAction[];
  severity?: "info" | "warn" | "error";
  createdAt?: string;
};

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

function severityIcon(sev?: Issue["severity"]) {
  switch (sev) {
    case "error":
      return "❌";
    case "warn":
      return "⚠️";
    default:
      return "ℹ️";
  }
}

export default function IssueCard({
  issue,
  onExplainMore,
  onIgnore,
  onPerformAction,
}: {
  issue: Issue;
  onExplainMore: (issue: Issue) => void | Promise<void>;
  onIgnore: (issue: Issue) => void | Promise<void>;
  onPerformAction: (issue: Issue, action: IssueAction) => void | Promise<void>;
}) {
  return (
    <div className="shadow-lg rounded-xl border border-[#3d2b22] bg-[#21150f] text-[#f3e9dd] overflow-hidden w-[min(420px,90vw)] min-w-[320px] transition-shadow hover:shadow-xl hover:shadow-black/20">
      <div className="p-4">
        <div className="mb-2 flex items-center gap-2">
          <span className="text-base" aria-hidden>
            {severityIcon(issue.severity)}
          </span>
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
                className={`whitespace-pre-wrap break-words ${idx === issue.logContext!.length - 1 ? "text-white" : "text-[#b9a391]"}`}
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
                  onClick={() => void onPerformAction(issue, act)}
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
          onClick={() => void onExplainMore(issue)}
          className="text-xs px-3 py-1.5 rounded-md bg-[#3b291f] hover:bg-[#52392a] text-[#f9f4ee] border border-[#6a4a35]"
        >
          Explain more
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
