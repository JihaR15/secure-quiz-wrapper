"use client";

import * as React from "react";
import { Alert02Icon } from "hugeicons-react";
import { useLanguage } from "@/components/providers";

type ViolationToastProps = {
  show: boolean;
  violationCount: number;
  onClose: () => void;
};

export function ViolationToast({ show, violationCount, onClose }: ViolationToastProps) {
  const { t } = useLanguage();

  React.useEffect(() => {
    if (!show) return;
    const timer = window.setTimeout(onClose, 4500);
    return () => window.clearTimeout(timer);
  }, [show, onClose]);

  if (!show) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 top-20 z-50 mx-auto w-full max-w-md animate-[rise_0.35s_cubic-bezier(0.16,1,0.3,1)] px-4"
    >
      <div className="pointer-events-auto flex items-start gap-3 rounded-lg border border-destructive/40 bg-popover px-4 py-3 text-popover-foreground">
        <Alert02Icon className="mt-0.5 size-4 shrink-0 text-destructive" />
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex items-center justify-between gap-3">
            <p className="truncate font-mono text-[0.6875rem] uppercase tracking-[0.14em] text-destructive">
              {t.violationDetected} #{violationCount}
            </p>
            <p className="shrink-0 font-mono text-[0.6875rem] text-muted-foreground">
              {t.violationLogged}
            </p>
          </div>
          <p className="text-pretty text-xs leading-relaxed text-muted-foreground">
            {t.violationFocusLost}
          </p>
        </div>
      </div>
    </div>
  );
}
