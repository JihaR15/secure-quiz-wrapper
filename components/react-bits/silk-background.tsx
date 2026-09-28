"use client";

/**
 * Landing hero background.
 *
 * Replaces the React Bits Threads WebGL shader, which evaluated 40 Perlin
 * noises per pixel every frame and measured at 1 fps under software
 * rendering. This is the same silky, thread-like read built from layered
 * repeating gradients that only ever animate `transform` and `opacity`, so
 * the browser keeps it on the compositor instead of repainting pixels.
 *
 * The whole effect is a handful of CSS declarations. Nothing here runs per
 * frame in JavaScript, and it honours prefers-reduced-motion.
 */
import { cn } from "@/lib/utils";

export function SilkBackground({ className }: { className?: string }) {
  return (
    <div aria-hidden className={cn("overflow-clip", className)}>
      <div className="silk-warp absolute inset-0" />
      <div className="silk-warp-slow absolute inset-0" />
    </div>
  );
}
