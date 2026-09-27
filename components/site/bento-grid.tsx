"use client";

import { QRCodeSVG } from "qrcode.react";
import {
  ArrowRight01Icon,
  BlockedIcon,
  Download01Icon,
  Link01Icon,
  QrCodeIcon,
  Shield01Icon,
  ViewOffIcon,
} from "hugeicons-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { RevealGroup } from "@/components/site/reveal-group";
import { useLanguage, useTheme } from "@/components/providers";

const SAMPLE_TARGET = "/quiz?form=aHR0cHM6Ly9kb2NzLmdvb2dsZS5jb20v";

function TileShell({
  index,
  icon,
  title,
  description,
  className,
  children,
}: {
  index: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <div
      className={`reveal flex flex-col gap-5 bg-card p-6 sm:p-7 ${className ?? ""}`}
    >
      <div className="flex items-center gap-3">
        <span aria-hidden className="text-muted-foreground [&_svg]:size-4">
          {icon}
        </span>
        <span
          aria-hidden
          className="h-px flex-1 bg-border"
        />
        <span className="font-mono text-[0.6875rem] tabular-nums text-muted-foreground/80">
          {index}
        </span>
      </div>

      <div className="space-y-2">
        <h3 className="font-display text-xl leading-tight tracking-[-0.01em] sm:text-[1.375rem]">
          {title}
        </h3>
        <p className="max-w-[46ch] text-pretty text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>
      </div>

      {children}
    </div>
  );
}

export function BentoGrid() {
  const { t, language } = useLanguage();
  const { theme } = useTheme();
  const copy = t;

  const fg = theme === "dark" ? "#e8e8e4" : "#12120f";
  const blockedRows = [
    { label: "Context menu", value: "blocked" },
    { label: "Clipboard copy / cut", value: "blocked" },
    { label: "Clipboard paste", value: "blocked" },
  ];

  return (
    <section id="fitur" className="scroll-mt-20 border-t border-border/70">
      <div className="mx-auto w-full max-w-[1400px] px-4 py-20 sm:px-6 sm:py-28">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-5">
            <div className="flex items-center gap-3">
              <span aria-hidden className="h-px w-8 bg-primary" />
              <span className="font-mono text-[0.6875rem] uppercase tracking-[0.2em] text-muted-foreground">
                {copy.featuresEyebrow}
              </span>
            </div>
            <h2 className="mt-5 max-w-[16ch] font-display text-[clamp(1.75rem,3.4vw,2.75rem)] font-medium leading-[1.05] tracking-[-0.025em] text-balance">
              {copy.featuresTitle}
            </h2>
          </div>
          <p className="max-w-[52ch] text-pretty text-base leading-relaxed text-muted-foreground lg:col-span-5 lg:col-start-8 lg:self-end">
            {copy.featuresSub}
          </p>
        </div>

        <RevealGroup className="mt-12 grid grid-cols-1 gap-px overflow-hidden rounded-xl border border-border bg-border md:grid-cols-2 lg:grid-cols-3">
          {/* 01 — tall, spans two columns and two rows */}
          <TileShell
            index="01"
            icon={<ViewOffIcon />}
            title={copy.featureFocusTitle}
            description={copy.featureFocusSub}
            className="lg:col-span-2 lg:row-span-2"
          >
            <div className="mt-auto overflow-hidden rounded-lg border border-border bg-muted/40">
              <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
                <span className="font-mono text-[0.6875rem] uppercase tracking-[0.14em] text-muted-foreground">
                  security_event_stream
                </span>
                <span className="inline-flex items-center gap-1.5 font-mono text-[0.6875rem] text-destructive">
                  <span aria-hidden className="size-1.5 rounded-full bg-destructive" />
                  violation
                </span>
              </div>
              <dl className="divide-y divide-border font-mono text-xs">
                <div className="flex items-baseline justify-between gap-4 px-4 py-2.5">
                  <dt className="truncate text-foreground/90">window_blur_event</dt>
                  <dd className="shrink-0 tabular-nums text-muted-foreground">14:32:09</dd>
                </div>
                <div className="flex items-baseline justify-between gap-4 px-4 py-2.5">
                  <dt className="truncate text-foreground/90">tab_switch_detected</dt>
                  <dd className="shrink-0 tabular-nums text-muted-foreground">14:32:11</dd>
                </div>
                <div className="flex items-baseline justify-between gap-4 px-4 py-2.5">
                  <dt className="truncate text-foreground/90">violation_persisted</dt>
                  <dd className="shrink-0 text-success">200 ok</dd>
                </div>
              </dl>
            </div>
          </TileShell>

          {/* 02 — QR, real code */}
          <TileShell
            index="02"
            icon={<QrCodeIcon />}
            title={copy.featureQrTitle}
            description={copy.featureQrSub}
          >
            <div className="mt-auto flex items-end justify-between gap-4">
              <QRCodeSVG
                value={SAMPLE_TARGET}
                size={96}
                level="M"
                bgColor="transparent"
                fgColor={fg}
                className="shrink-0 rounded-md"
              />
              <p className="font-mono text-[0.6875rem] leading-relaxed text-muted-foreground">
                {language === "id" ? "1 tautan" : "1 link"}
                <br />
                {language === "id" ? "1 pindai" : "1 scan"}
                <br />
                {language === "id" ? "0 aplikasi" : "0 apps"}
              </p>
            </div>
          </TileShell>

          {/* 03 — clipboard */}
          <TileShell
            index="03"
            icon={<BlockedIcon />}
            title={copy.featureClipboardTitle}
            description={copy.featureClipboardSub}
          >
            <ul className="mt-auto space-y-0">
              {blockedRows.map((row, rowIndex) => (
                <li
                  key={row.label}
                  className={`flex items-center justify-between gap-3 py-2 font-mono text-xs ${
                    rowIndex > 0 ? "border-t border-border" : ""
                  }`}
                >
                  <span className="truncate text-muted-foreground">{row.label}</span>
                  <span className="shrink-0 text-success">blocked</span>
                </li>
              ))}
            </ul>
          </TileShell>

          {/* 04 — URL encoding */}
          <TileShell
            index="04"
            icon={<Link01Icon />}
            title={copy.featureUrlTitle}
            description={copy.featureUrlSub}
            className="lg:col-span-2"
          >
            <div className="mt-auto flex flex-col gap-3 rounded-lg border border-border bg-muted/40 p-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="min-w-0 truncate font-mono text-xs text-foreground/90">
                <span className="text-muted-foreground">/quiz?form=</span>
                aHR0cHM6Ly9kb2NzLmdvb2dsZS5jb20v…
              </p>
              <Button asChild variant="outline" size="sm" className="shrink-0">
                <Link href="/admin">
                  {t.generateLink}
                  <ArrowRight01Icon className="size-3.5" />
                </Link>
              </Button>
            </div>
          </TileShell>

          {/* 05 — live log */}
          <TileShell
            index="05"
            icon={<Shield01Icon />}
            title={copy.featureLiveTitle}
            description={copy.featureLiveSub}
          >
            <p className="mt-auto font-mono text-[0.6875rem] leading-relaxed text-muted-foreground">
              <span className="text-success">stream</span> / violations
              <br />
              <span className="text-muted-foreground/70">latency &lt; 1s</span>
            </p>
          </TileShell>

          {/* 06 — export, full width strip */}
          <TileShell
            index="06"
            icon={<Download01Icon />}
            title={copy.featureExportTitle}
            description={copy.featureExportSub}
            className="md:col-span-2 lg:col-span-3"
          >
            <div className="mt-auto flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div className="flex flex-wrap items-center gap-x-6 gap-y-1 font-mono text-[0.6875rem] uppercase tracking-[0.14em] text-muted-foreground">
                <span>xlsx</span>
                <span className="hidden size-1 rounded-full bg-border sm:block" />
                <span>{language === "id" ? "jawaban + pelanggaran" : "answers + violations"}</span>
                <span className="hidden size-1 rounded-full bg-border sm:block" />
                <span>{language === "id" ? "per peserta" : "per participant"}</span>
              </div>
              <Button asChild className="shrink-0">
                <Link href="/admin">
                  {t.adminConsole}
                  <ArrowRight01Icon className="size-4" />
                </Link>
              </Button>
            </div>
          </TileShell>
        </RevealGroup>
      </div>
    </section>
  );
}
