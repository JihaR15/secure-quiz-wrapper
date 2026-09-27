"use client";

import { Button } from "@/components/ui/button";
import { useLanguage } from "@/components/providers";
import { Globe02Icon } from "hugeicons-react";

const CODES = { id: "ID", en: "EN" } as const;

/** Ghost, borderless language switch. The code is the whole affordance. */
export function LanguageToggle({ className }: { className?: string }) {
  const { language, toggleLanguage, t } = useLanguage();

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleLanguage}
      className={className}
      title={t.languageLabel}
      aria-label={t.languageLabel}
    >
      <Globe02Icon className="size-4 text-muted-foreground" />
      <span className="font-mono text-xs font-medium tabular-nums">
        {CODES[language]}
      </span>
    </Button>
  );
}
