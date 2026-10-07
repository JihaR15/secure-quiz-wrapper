"use client";

import Link from "next/link";
import { ArrowDown01Icon, ArrowRight01Icon } from "hugeicons-react";
import { Button } from "@/components/ui/button";
import { ScrollCue } from "@/components/site/scroll-cue";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { BentoGrid } from "@/components/site/bento-grid";
import { HowItWorks } from "@/components/site/how-it-works";
import DriftWall, { type DriftWallItem } from "@/components/react-bits/drift-wall";
import TechText from "@/components/react-bits/tech-text";
import { useLanguage, useTheme } from "@/components/providers";

// Foto-foto drift wall di landing page (campuran foto lokal dan Unsplash):
const HERO_DRIFT_ITEMS: DriftWallItem[] = [
  {
    image: "/images/drift/IMG_20261005_091916.webp",
    title: "Sesi Ujian Berlangsung",
  },
  {
    image: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=600&auto=format&fit=crop&q=80",
    title: "Evaluasi Digital",
  },
  {
    image: "/images/drift/IMG_20261006_090420.webp",
    title: "Aktivitas Peserta Ujian",
  },
  {
    image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=600&auto=format&fit=crop&q=80",
    title: "Analitik Penilaian",
  },
  {
    image: "https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e?w=600&auto=format&fit=crop&q=80",
    title: "Formulir Ujian",
  },
  {
    image: "/images/drift/IMG_20261006_090437.webp",
    title: "Ruang Kelas Terpantau",
  },
  {
    image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&auto=format&fit=crop&q=80",
    title: "Pengawasan Terpusat",
  },
  {
    image: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=600&auto=format&fit=crop&q=80",
    title: "Integritas Asesmen",
  },
  {
    image: "/images/drift/IMG_20261006_090457.webp",
    title: "Pemeriksaan & Monitoring",
  },
  {
    image: "https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=600&auto=format&fit=crop&q=80",
    title: "Pembelajaran Aman",
  },
  {
    image: "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=600&auto=format&fit=crop&q=80",
    title: "Laporan Pelanggaran",
  },
  {
    image: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=600&auto=format&fit=crop&q=80",
    title: "Pantauan Fokus",
  },
];

export default function LandingPage() {
  const { t, language } = useLanguage();
  const { theme } = useTheme();
  const copy = t;

  const techTextColor = theme === "dark" ? "#10b981" : "#059669";
  const techAccentColor = theme === "dark" ? "#34d399" : "#047857";
  const driftOverlayColor = theme === "dark" ? "#131312" : "#faf9f7";

  return (
    <div className="relative flex min-h-svh flex-col overflow-x-clip bg-background">
      <SiteHeader cta={{ href: "/admin", label: copy.heroPrimaryCta }} />

      <main className="flex-1">
        {/* Hero: copy anchored bottom-left, DriftWall on the right (desktop) or top (mobile) */}
        <section id="hero" className="relative flex min-h-svh flex-col justify-end">
          {/* DriftWall di desktop (disebelah kanan dengan gradasi smooth) */}
          <div
            className="pointer-events-auto hidden overflow-hidden lg:absolute lg:inset-y-0 lg:right-0 lg:left-[44%] lg:block xl:left-[46%]"
          >
            {/* Gradasi halus sisi kiri, kanan, atas, dan bawah */}
            <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-48 bg-gradient-to-r from-background via-background/60 to-transparent" />
            <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-background to-transparent" />
            <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-28 bg-gradient-to-b from-background to-transparent" />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-28 bg-gradient-to-t from-background to-transparent" />
            <DriftWall
              items={HERO_DRIFT_ITEMS}
              columns={4}
              tileWidth={195}
              tileHeight={130}
              gap={16}
              overlayColor={driftOverlayColor}
              className="size-full"
            />
          </div>

          {/* Hairline lattice, fades out before it reaches the copy. */}
          <div
            aria-hidden
            className="hairline-grid pointer-events-none absolute inset-0 opacity-50 [mask-image:radial-gradient(90%_70%_at_20%_80%,#000,transparent_75%)]"
          />

          <div className="relative z-10 flex w-full flex-1 flex-col justify-end px-6 pb-8 pt-20 sm:px-10 md:px-12 lg:px-16 xl:px-20 sm:pb-10 sm:pt-24 lg:pb-12">
            {/* DriftWall di mobile (di atas teks dengan gradasi smooth bawah) */}
            <div className="relative -mx-6 -mt-4 mb-6 h-56 w-[calc(100%+3rem)] overflow-hidden sm:-mx-10 sm:h-72 sm:w-[calc(100%+5rem)] lg:hidden">
              <div className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-b from-transparent via-transparent to-background" />
              <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-12 bg-gradient-to-b from-background/80 to-transparent" />
              <DriftWall
                items={HERO_DRIFT_ITEMS}
                columns={3}
                tileWidth={135}
                tileHeight={90}
                gap={12}
                overlayColor={driftOverlayColor}
                className="size-full"
              />
            </div>
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
