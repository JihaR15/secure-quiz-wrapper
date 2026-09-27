"use client";

import { Button } from "@/components/ui/button";
import { useLanguage, useTheme } from "@/components/providers";
import { Moon01Icon, Sun01Icon } from "hugeicons-react";

/** Ghost, borderless icon toggle — no chrome, just the glyph. */
export function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggleTheme } = useTheme();
  const { t } = useLanguage();
  const nextIsDark = theme !== "dark";

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className={className}
      title={nextIsDark ? t.themeDark : t.themeLight}
      aria-label={nextIsDark ? t.themeDark : t.themeLight}
    >
      {theme === "dark" ? <Sun01Icon className="size-4" /> : <Moon01Icon className="size-4" />}
    </Button>
  );
}
