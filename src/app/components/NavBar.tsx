import React from "react";

export default function NavBar({
  pollMs,
  onChangePollMs,
}: {
  pollMs: number;
  onChangePollMs: (ms: number) => void;
}) {
  return (
    <header className="fixed inset-x-0 top-0 z-50 bg-[#21150f]/90 backdrop-blur border-b border-[#3a2a22]/60 shadow-lg shadow-black/30">
      <div className="px-5 py-2 flex items-center">
        <div className="flex items-center gap-4 max-w-5xl">
          <img src="/logo.svg" alt="Logo" className="h-12 w-auto block select-none" />
        </div>
        <label className="ml-auto text-xs opacity-80 flex items-center gap-2" htmlFor="polling-select">
          <span>Polling</span>
          <select
            id="polling-select"
            className="bg-[#261811] text-[#f3e9dd] border border-[#3a2a22] rounded-md px-2 py-1 text-xs cursor-pointer"
            value={String(pollMs)}
            onChange={(e) => onChangePollMs(Number(e.target.value))}
          >
            <option value={0}>Off</option>
            <option value={5000}>5 seconds</option>
            <option value={10000}>10 seconds</option>
            <option value={60000}>1 minute</option>
          </select>
        </label>
      </div>
    </header>
  );
}
