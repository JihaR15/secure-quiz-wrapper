"use client";

import { ArrowDown01Icon } from "hugeicons-react";

/**
 * A real anchor to the features section. The hairline draws itself downward,
 * then the chevron drops — both CSS-only so they respect reduced motion.
 */
export function ScrollCue({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      aria-label={label}
      title={label}
      className="group flex shrink-0 items-center gap-3 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
    >
      <span className="relative flex h-14 w-9 flex-col items-center justify-center gap-2">
        <span className="relative block h-8 w-px overflow-hidden bg-border">
          <span className="cue-track absolute inset-0 block bg-primary" />
        </span>
        <ArrowDown01Icon className="cue-drop size-3.5 text-muted-foreground transition-colors group-hover:text-foreground" />
      </span>
      <span className="max-w-[14ch] font-mono text-[0.625rem] uppercase leading-[1.5] tracking-[0.18em] text-muted-foreground transition-colors group-hover:text-foreground">
        {label}
      </span>
    </a>
  );
}
