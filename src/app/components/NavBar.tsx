import React from "react";

export default function NavBar({ pollMs }: { pollMs: number }) {
  return (
    <header className="sticky top-0 z-10 bg-transparent backdrop-blur border-b border-[#3a2a22]/60">
      <div className="px-5 max-w-5xl py-2 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <img src="/logo.svg" alt="Logo" className="h-12 w-auto block select-none" />
          <h1 className="text-lg font-semibold tracking-tight leading-none text-[#f3e9dd]/60">Observability Assistant</h1>
        </div>
        <div className="text-xs opacity-70">Polling /check every {pollMs / 1000}s</div>
      </div>
    </header>
  );
}
