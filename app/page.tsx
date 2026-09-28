"use client";

import Link from "next/link";
import { ArrowDown01Icon, ArrowRight01Icon } from "hugeicons-react";
import { Button } from "@/components/ui/button";
import { SilkBackground } from "@/components/react-bits/silk-background";
import { ScrollCue } from "@/components/site/scroll-cue";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { BentoGrid } from "@/components/site/bento-grid";
import { HowItWorks } from "@/components/site/how-it-works";
import { useLanguage } from "@/components/providers";

export default function LandingPage() {
  const { t, language } = useLanguage();
  const copy = t;

  return (
    <div className="relative flex min-h-svh flex-col overflow-x-clip bg-background">
      <SiteHeader cta={{ href: "/admin", label: copy.heroPrimaryCta }} />

      <main className="flex-1">
        {/* Hero: copy anchored bottom-left, animation owning the right side. */}
        <section className="relative flex min-h-[calc(100svh-4rem)] flex-col">
          <div
            aria-hidden
            className="absolute inset-0 lg:inset-y-0 lg:left-[46%] lg:right-0"
          >
            <div className="absolute inset-0 opacity-90 [mask-image:radial-gradient(115%_85%_at_62%_42%,#000_38%,transparent_78%)] lg:[mask-image:linear-gradient(to_left,#000_52%,transparent_96%)]">
              <SilkBackground className="size-full" />
            </div>
          </div>

          {/* Hairline lattice, fades out before it reaches the copy. */}
          <div
            aria-hidden
            className="hairline-grid pointer-events-none absolute inset-0 opacity-60 [mask-image:radial-gradient(90%_70%_at_20%_80%,#000,transparent_75%)]"
          />

          <div className="relative z-10 mx-auto flex w-full max-w-[1400px] flex-1 flex-col justify-end px-4 pb-8 pt-12 sm:px-6 sm:pb-10 lg:pb-12">
            <div className="max-w-[46rem] space-y-6 lg:space-y-7">
              <div className="flex items-center gap-3">
                <span aria-hidden className="h-px w-8 bg-primary" />
                <span className="font-mono text-[0.6875rem] uppercase tracking-[0.2em] text-muted-foreground">
                  {copy.heroEyebrow}
                </span>
              </div>

              <h1 className="font-display font-medium tracking-[-0.03em]">
                <span className="block text-[clamp(1.125rem,2.4vw,1.875rem)] leading-[1.2] font-normal text-foreground/70">
                  {copy.heroTitleLead}
                </span>
                <span className="mt-1 block font-display text-[clamp(2.5rem,7.4vw,5.25rem)] italic leading-[0.92] text-primary">
                  {copy.heroTitleAccent}
                </span>
                <span className="mt-2 block max-w-[22ch] text-[clamp(1.125rem,2.4vw,1.875rem)] leading-[1.25] font-normal text-foreground/70">
                  {copy.heroTitleTail}
                </span>
              </h1>

              <p className="max-w-[48ch] text-pretty text-[0.9375rem] leading-relaxed text-muted-foreground sm:text-base">
                {copy.heroSub}
              </p>

              <div className="flex flex-col gap-3 pt-1 sm:flex-row sm:items-center sm:gap-4">
                <Button asChild size="lg" className="h-11 w-full gap-2 px-6 sm:w-auto">
                  <Link href="/admin">
                    {copy.heroPrimaryCta}
                    <ArrowRight01Icon className="size-4" />
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="ghost"
                  size="lg"
                  className="h-11 w-full justify-start gap-2 px-4 text-foreground/80 sm:w-auto sm:justify-center"
                >
                  <a href="#fitur">
                    {copy.heroSecondaryCta}
                    <ArrowDown01Icon className="size-4" />
                  </a>
                </Button>
              </div>
            </div>

            <div className="mt-10 flex items-end justify-between gap-6 lg:mt-12">
              <ScrollCue href="#fitur" label={copy.scrollCue} />
              <p className="hidden max-w-[26ch] text-right font-mono text-[0.6875rem] uppercase leading-relaxed tracking-[0.14em] text-muted-foreground/70 sm:block">
                {copy.heroMeta}
              </p>
            </div>
          </div>
        </section>

        <BentoGrid />
        <HowItWorks />
      </main>

      <SiteFooter language={language} note={copy.footerNote} product={copy.appTagline} />
    </div>
  );
}
