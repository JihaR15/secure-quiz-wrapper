"use client";

import { useEffect, useState } from "react";
import { Logo, Wordmark } from "@/components/brand/logo";

interface PreloaderProps {
  onComplete?: () => void;
}

const CHECKPOINT_STEPS = [
  "MEMUAT MODUL & ASET...",
  "MENYIAPKAN SESI AMAN...",
  "MEMERIKSA INTEGRITAS...",
  "MEMPERSIAPKAN TAMPILAN...",
  "MEMBUKA HALAMAN..."
];

export function Preloader({ onComplete }: PreloaderProps) {
  const [progress, setProgress] = useState(0);
  const [stepIndex, setStepIndex] = useState(0);
  const [isDone, setIsDone] = useState(false);
  const [isRemoved, setIsRemoved] = useState(false);

  useEffect(() => {
    let assetsLoaded = false;
    const checkAssets = async () => {
      try {
        if (typeof document !== "undefined" && document.fonts) {
          await document.fonts.ready;
        }
      } catch {
        // Fallback
      }
      assetsLoaded = true;
    };
    checkAssets();

    const startTime = performance.now();
    const minDuration = 1250; // ms

    const interval = setInterval(() => {
      const elapsed = performance.now() - startTime;
      const timeRatio = Math.min(1, elapsed / minDuration);

      setProgress((prev) => {
        let target = Math.round(timeRatio * 90);
        if (assetsLoaded && elapsed >= minDuration * 0.75) {
          target = Math.round(90 + ((elapsed - minDuration * 0.75) / (minDuration * 0.25)) * 10);
        }

        const next = Math.min(100, Math.max(prev + 1, target));

        const step = Math.min(
          CHECKPOINT_STEPS.length - 1,
          Math.floor((next / 100) * CHECKPOINT_STEPS.length)
        );
        setStepIndex(step);

        if (next >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setIsDone(true);
            onComplete?.();
            setTimeout(() => {
              setIsRemoved(true);
            }, 750); // Transisi tirai keluar
          }, 180);
        }
        return next;
      });
    }, 22);

    return () => clearInterval(interval);
  }, [onComplete]);

  if (isRemoved) return null;

  return (
    <aside
      aria-label="Memuat aplikasi"
      role="status"
      aria-live="polite"
      className={`fixed inset-0 z-50 flex flex-col justify-between overflow-hidden bg-background p-6 sm:p-10 md:p-14 select-none transition-transform duration-700 ease-[cubic-bezier(0.76,0,0.24,1)] ${
        isDone ? "-translate-y-full pointer-events-none" : "translate-y-0"
      }`}
    >
      {/* Hairline Grid Ambient Background */}
      <div
        aria-hidden
        className="hairline-grid pointer-events-none absolute inset-0 opacity-40 [mask-image:radial-gradient(ellipse_at_center,#000_30%,transparent_80%)]"
      />

      {/* KIRI ATAS: Logo & Wordmark tanpa border (Clean, rata kiri) */}
      <div className="relative z-10 flex items-center gap-3">
        <Logo priority className="h-7 sm:h-8 w-auto" />
        <Wordmark className="text-base sm:text-lg font-semibold tracking-tight" />
      </div>

      {/* TENGAH: Ruang lapang bersih */}
      <div className="flex-1" />

      {/* BAWAH: Gaya Loading Game PS2 (Keterangan di atas bar, bar tipis memanjang, persen besar rata kanan) */}
      <div className="relative z-10 w-full space-y-3 pb-2">
        <div className="flex items-end justify-between gap-4">
          {/* Keterangan proses di atas loading bar (Rata Kiri) */}
          <div className="flex items-center gap-2.5 font-mono text-xs sm:text-sm text-muted-foreground/90 tracking-wider">
            <span className="inline-block size-2 rounded-full bg-primary animate-pulse" />
            <span className="uppercase">{CHECKPOINT_STEPS[stepIndex]}</span>
          </div>

          {/* Angka persentase agak besar di rata kanan bawah */}
          <div className="font-mono text-3xl sm:text-4xl md:text-5xl font-medium tracking-tight text-foreground tabular-nums">
            {progress.toString().padStart(2, "0")}
            <span className="text-primary text-xl sm:text-2xl md:text-3xl font-light ml-0.5">
              %
            </span>
          </div>
        </div>

        {/* Loading Bar tipis memanjang */}
        <div className="relative h-1 w-full overflow-hidden rounded-full bg-border/40">
          <div
            className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-primary to-teal-400 transition-all duration-75 ease-out shadow-[0_0_14px_rgba(16,185,129,0.45)]"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </aside>
  );
}
