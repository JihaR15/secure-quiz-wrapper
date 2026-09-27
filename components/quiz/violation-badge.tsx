"use client";

import { Badge } from "@/components/ui/badge";
import { Alert02Icon } from "hugeicons-react";
import { useLanguage } from "@/components/providers";

export function SecurityBadge({ violationCount }: { violationCount: number }) {
  const { t } = useLanguage();
  const flagged = violationCount > 0;

  return (
    <Badge
      variant="outline"
      className={`h-8 gap-2 rounded-lg border-border bg-background/90 px-2.5 backdrop-blur-md ${
        flagged ? "text-destructive" : "text-muted-foreground"
      }`}
    >
      <span aria-hidden className="relative flex size-1.5">
        <span
          className={`absolute inline-flex size-full animate-ping rounded-full opacity-70 ${
            flagged ? "bg-destructive" : "bg-primary"
          }`}
        />
        <span
          className={`relative inline-flex size-1.5 rounded-full ${
            flagged ? "bg-destructive" : "bg-primary"
          }`}
        />
      </span>
      <span className="hidden text-xs font-normal sm:inline">{t.activeSecurity}</span>
      <span aria-hidden className="hidden h-3.5 w-px bg-border sm:block" />
      <Alert02Icon className="size-3.5" />
      <span className="font-mono text-xs tabular-nums">{violationCount}</span>
    </Badge>
  );
}
