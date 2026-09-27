"use client";

import { useEffect } from "react";
import { AlertCircleIcon, Shield01Icon } from "hugeicons-react";

interface ViolationToastProps {
  show: boolean;
  violationCount: number;
  onClose: () => void;
  language?: "id" | "en";
}

export function ViolationToast({
  show,
  violationCount,
  onClose,
  language = "id",
}: ViolationToastProps) {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onClose();
      }, 4500);
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  if (!show) return null;

  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-4 animate-in slide-in-from-top-4 fade-in duration-300 pointer-events-none">
      <div className="p-4 rounded-2xl bg-neutral-900/95 border border-red-800/80 shadow-2xl shadow-red-950/60 backdrop-blur-md flex items-start gap-3.5 text-neutral-100 pointer-events-auto">
        <div className="w-10 h-10 rounded-xl bg-red-950/80 border border-red-800/80 flex items-center justify-center text-red-400 shrink-0">
          <AlertCircleIcon className="w-5 h-5 stroke-[2]" />
        </div>

        <div className="flex-1 space-y-1 font-sans">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-red-400 uppercase tracking-wider flex items-center gap-1.5">
              <Shield01Icon className="w-3.5 h-3.5" />
              {language === "id" ? "Pelanggaran Keamanan" : "Security Violation"} #{violationCount}
            </span>
            <span className="text-[10px] font-mono text-neutral-400">
              {language === "id" ? "Tercatat" : "Logged"}
            </span>
          </div>
          <p className="text-xs text-neutral-300 leading-relaxed font-medium">
            {language === "id"
              ? "Terdeteksi beralih aplikasi atau tab browser! Pelanggaran telah dicatat."
              : "App focus lost or tab switch detected! Violation has been logged."}
          </p>
        </div>
      </div>
    </div>
  );
}
