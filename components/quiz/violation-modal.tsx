"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircleIcon, Shield01Icon, LockIcon } from "hugeicons-react";

interface ViolationModalProps {
  isOpen: boolean;
  violationCount: number;
  onAcknowledge: () => void;
}

export function ViolationModal({
  isOpen,
  violationCount,
  onAcknowledge,
}: ViolationModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/95 backdrop-blur-xl animate-in fade-in duration-200">
      <Card className="max-w-md w-full bg-neutral-900 border-red-900/60 shadow-2xl shadow-red-950/50 space-y-6 text-center p-8 relative overflow-hidden">
        {/* Subtle accent bar at top */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-red-600 via-red-500 to-red-600" />

        <div className="mx-auto w-16 h-16 rounded-3xl bg-red-950/80 border border-red-800/80 flex items-center justify-center text-red-400">
          <AlertCircleIcon className="w-8 h-8 stroke-[2]" />
        </div>

        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-950/60 border border-red-800/50 text-red-400 text-xs font-mono font-medium">
            <LockIcon className="w-3.5 h-3.5" />
            SECURITY VIOLATION DETECTED
          </div>
          <h2 className="font-serif text-2xl font-semibold text-white tracking-tight pt-2">
            Assessment Session Blocked
          </h2>
          <p className="text-xs text-neutral-300 leading-relaxed font-sans">
            Window focus was lost or a tab switch event was registered. To preserve assessment integrity, session interaction has been paused.
          </p>
        </div>

        {/* Violation Count Badge */}
        <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-1">
          <span className="text-[11px] font-sans text-neutral-400 uppercase tracking-wider">
            Total Logged Violations
          </span>
          <div className="text-3xl font-mono font-bold text-red-400">
            {violationCount}
          </div>
        </div>

        <div className="pt-2">
          <Button
            variant="danger"
            size="lg"
            className="w-full font-semibold"
            onClick={onAcknowledge}
          >
            I Acknowledge & Resume Assessment
          </Button>
        </div>

        <div className="text-[11px] text-neutral-500 flex items-center justify-center gap-1.5 font-sans">
          <Shield01Icon className="w-3.5 h-3.5 text-neutral-400" />
          Event logged with system timestamp
        </div>
      </Card>
    </div>
  );
}
