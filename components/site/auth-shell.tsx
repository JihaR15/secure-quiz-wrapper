"use client";

import * as React from "react";
import Link from "next/link";
import { Logo, Wordmark } from "@/components/brand/logo";
import { LanguageToggle } from "@/components/site/language-toggle";
import { ThemeToggle } from "@/components/site/theme-toggle";
import { useLanguage } from "@/components/providers";
import { ArrowLeft01Icon } from "hugeicons-react";

type AuthShellProps = {
  eyebrow: string;
  title: string;
  sub: string;
  children: React.ReactNode;
  footer: React.ReactNode;
  asidePoints: readonly string[];
};

export function AuthShell({
  eyebrow,
  title,
  sub,
  children,
  footer,
  asidePoints,
}: AuthShellProps) {
  const { t } = useLanguage();

  return (
    <div className="grid min-h-svh w-full bg-background lg:grid-cols-2">
      {/* Manifesto side — hidden on mobile, where the form is the whole job. */}
      <aside className="relative hidden flex-col justify-between overflow-hidden border-r border-border px-10 py-10 lg:flex xl:px-14">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_90%_at_0%_0%,color-mix(in_oklch,var(--primary)_12%,transparent),transparent_60%)]"
        />
        <div className="relative">
          <Link href="/" className="inline-flex items-center gap-2.5">
            <Logo priority />
            <Wordmark />
          </Link>
        </div>

        <div className="relative max-w-[46ch] space-y-7">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span aria-hidden className="h-px w-8 bg-primary" />
              <span className="font-mono text-[0.6875rem] uppercase tracking-[0.2em] text-muted-foreground">
                {eyebrow}
              </span>
            </div>
            <h2 className="font-display text-[clamp(1.75rem,2.6vw,2.5rem)] font-medium leading-[1.1] tracking-[-0.03em] text-balance">
              {title}
            </h2>
            <p className="text-pretty text-sm leading-relaxed text-muted-foreground">
              {sub}
            </p>
          </div>

          <ul className="divide-y divide-border border-y border-border">
            {asidePoints.map((point, index) => (
              <li
                key={point}
                className="flex items-baseline gap-4 py-2.5 text-sm text-muted-foreground"
              >
                <span className="font-mono text-[0.6875rem] tabular-nums text-primary">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="text-pretty">{point}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="relative max-w-[52ch] text-xs leading-relaxed text-muted-foreground">
          {t.authSideNote}
        </p>
      </aside>

      {/* Form side */}
      <div className="flex min-h-svh flex-col px-4 py-6 sm:px-8 lg:px-10">
        <div className="flex items-center justify-between gap-3">
          <Link
            href="/"
            className="group inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft01Icon className="size-4 transition-transform group-hover:-translate-x-0.5" />
            <span className="hidden sm:inline">{t.returnHome}</span>
            <span className="sm:hidden" aria-hidden>
              {t.backToSite}
            </span>
          </Link>

          <div className="flex items-center gap-0.5">
            <LanguageToggle />
            <ThemeToggle />
          </div>
        </div>

        <div className="flex flex-1 items-center py-10">
          <div className="mx-auto w-full max-w-sm space-y-8">
            <div className="space-y-3 lg:hidden">
              <Link href="/" className="inline-block">
                <Logo className="h-6" />
              </Link>
            </div>

            <div className="space-y-2.5">
              <h1 className="font-display text-[clamp(1.5rem,5vw,2rem)] font-medium leading-[1.1] tracking-[-0.03em] text-balance">
                {title}
              </h1>
              <p className="text-pretty text-sm leading-relaxed text-muted-foreground">
                {sub}
              </p>
            </div>

            {children}

            <div className="border-t border-border pt-5 text-sm text-muted-foreground">
              {footer}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
