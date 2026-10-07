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
import TechText from "@/components/react-bits/tech-text";
import { useLanguage, useTheme } from "@/components/providers";

export default function LandingPage() {
  const { t, language } = useLanguage();
  const { theme } = useTheme();
  const copy = t;

  const techTextColor = theme === "dark" ? "#10b981" : "#059669";
  const techAccentColor = theme === "dark" ? "#34d399" : "#047857";

  return (
    <div className="relative flex min-h-svh flex-col overflow-x-clip bg-background">
      <SiteHeader cta={{ href: "/admin", label: copy.heroPrimaryCta }} />

      <main className="flex-1">
        {/* Hero: copy anchored bottom-left, animation owning the right side. */}
        <section className="relative flex min-h-[calc(100svh-4rem)] flex-col justify-end">
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

          <div className="relative z-10 flex w-full flex-1 flex-col justify-end px-6 pb-8 pt-12 sm:px-10 md:px-12 lg:px-16 xl:px-20 sm:pb-10 lg:pb-12">
            <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
              <div className="max-w-[54rem] space-y-6 lg:space-y-7">
                <div className="flex items-center gap-3">
                  <span aria-hidden className="h-px w-8 bg-primary" />
                  <span className="font-mono text-[0.6875rem] uppercase tracking-[0.2em] text-muted-foreground">
                    {copy.heroEyebrow}
                  </span>
                </div>

                <div className="space-y-0 text-left">
                  <span className="block text-left text-[clamp(1.125rem,2.2vw,1.75rem)] leading-none font-normal text-foreground/75">
                    {copy.heroTitleLead}
                  </span>

                  {/* Stylish interactive TechText from React Bits for "Google & MS Forms" */}
                  <div className="relative my-0.5 h-14 w-full max-w-[46rem] sm:my-1 sm:h-18 md:h-22 lg:h-26">
                    <TechText
                      text="Google & MS Forms"
                      fontFamily="var(--font-playfair), Georgia, serif"
                      fontWeight={600}
                      fontSize={88}
                      letterSpacing={-0.05}
                      align="left"
                      color={techTextColor}
                      accentColor={techAccentColor}
                      reveal="letter"
                      dashLength={4}
                      // dashGap={1}
                      specks={14}
                      reach={180}
                      speed={1.2}
                      draggable={true}
                      className="size-full"
                    />
                  </div>

                  {/* Kalimat lurus tanpa potongan baris sempit, rapat natural */}
                  <span className="block text-left text-[clamp(1.125rem,2.2vw,1.75rem)] leading-none font-normal text-foreground/75 sm:whitespace-nowrap">
                    {copy.heroTitleTail}
                  </span>
                </div>

                <p className="max-w-[50ch] text-pretty text-[0.9375rem] leading-relaxed text-muted-foreground sm:text-base">
                  {copy.heroSub}
                </p>

                {/* Tombol aksi sejajar & rata bawah */}
                <div className="flex flex-row items-center gap-3 pt-2 sm:gap-4">
                  <Button asChild size="lg" className="h-11 flex-1 gap-2 px-5 sm:flex-initial sm:px-6">
                    <Link href="/admin">
                      {copy.heroPrimaryCta}
                      <ArrowRight01Icon className="size-4" />
                    </Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    size="lg"
                    className="h-11 flex-1 items-center justify-center gap-2 px-4 text-foreground/80 sm:flex-initial"
                  >
                    <a href="#fitur">
                      {copy.heroSecondaryCta}
                      <ArrowDown01Icon className="size-4" />
                    </a>
                  </Button>
                </div>

                <p className="font-mono text-[0.6875rem] uppercase leading-relaxed tracking-[0.14em] text-muted-foreground/70">
                  {copy.heroMeta}
                </p>
              </div>

              {/* Scroll cue hanya ditampilkan di desktop (hidden di mobile) */}
              <div className="hidden shrink-0 items-end justify-end self-end pb-1 md:flex">
                <ScrollCue href="#fitur" label={copy.scrollCue} />
              </div>
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
