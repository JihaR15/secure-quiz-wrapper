"use client";

import { RevealGroup } from "@/components/site/reveal-group";
import { useLanguage } from "@/components/providers";
import type { Translation } from "@/lib/i18n";

export function HowItWorks() {
  const { t } = useLanguage();
  const copy = t as Translation;

  const steps = [
    { index: "01", title: copy.how1Title, body: copy.how1Sub },
    { index: "02", title: copy.how2Title, body: copy.how2Sub },
    { index: "03", title: copy.how3Title, body: copy.how3Sub },
  ];

  return (
    <section className="border-t border-border/70">
      <div className="mx-auto w-full max-w-[1400px] px-4 py-20 sm:px-6 sm:py-24">
        <RevealGroup className="grid gap-10 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-4">
            <div className="flex items-center gap-3">
              <span aria-hidden className="h-px w-8 bg-primary" />
              <span className="font-mono text-[0.6875rem] uppercase tracking-[0.2em] text-muted-foreground">
                {copy.howEyebrow}
              </span>
            </div>
            <h2 className="mt-5 max-w-[18ch] font-display text-[clamp(1.5rem,2.6vw,2.125rem)] font-medium leading-[1.1] tracking-[-0.02em] text-balance">
              {copy.howTitle}
            </h2>
          </div>

          <ol className="grid gap-px lg:col-span-8 lg:grid-cols-3 lg:overflow-hidden lg:rounded-xl lg:border lg:border-border lg:bg-border">
            {steps.map((step) => (
              <li
                key={step.index}
                className="reveal flex flex-col gap-3 border-t border-border py-6 first:border-t-0 lg:border-t-0 lg:bg-card lg:px-6 lg:py-8"
              >
                <span className="font-mono text-3xl leading-none tabular-nums text-primary/70">
                  {step.index}
                </span>
                <h3 className="text-sm font-semibold tracking-[-0.01em]">
                  {step.title}
                </h3>
                <p className="max-w-[34ch] text-pretty text-sm leading-relaxed text-muted-foreground">
                  {step.body}
                </p>
              </li>
            ))}
          </ol>
        </RevealGroup>
      </div>
    </section>
  );
}
