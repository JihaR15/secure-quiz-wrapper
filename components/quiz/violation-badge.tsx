"use client";

import { Shield01Icon, AlertCircleIcon, LockIcon } from "hugeicons-react";

interface SecurityBadgeProps {
  violationCount: number;
}

export function SecurityBadge({ violationCount }: SecurityBadgeProps) {
  return (
    <div className="fixed top-4 right-4 z-30 flex items-center gap-3 p-2.5 px-4 rounded-2xl bg-neutral-950/90 border border-neutral-800 shadow-xl backdrop-blur-md select-none font-sans text-xs">
      <div className="flex items-center gap-2">
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
        </span>
        <span className="text-neutral-300 font-medium hidden sm:inline">
          Active Security Mode
        </span>
      </div>

      <div className="h-4 w-px bg-neutral-800" />

      <div className="flex items-center gap-1.5 font-mono">
        <AlertCircleIcon
          className={`w-4 h-4 ${
            violationCount > 0 ? "text-red-400" : "text-neutral-400"
          }`}
        />
        <span className="text-neutral-400">Violations:</span>
        <span
          className={`font-bold ${
            violationCount > 0 ? "text-red-400" : "text-neutral-200"
          }`}
        >
          {violationCount}
        </span>
      </div>
    </div>
  );
}
