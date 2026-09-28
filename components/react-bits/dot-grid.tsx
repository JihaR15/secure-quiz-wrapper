"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

/**
 * React Bits — DotGrid (https://reactbits.dev/backgrounds/dotgrid)
 * Adapted from the original: the magnetic proximity grid, but with plain
 * spring math instead of GSAP + the paid InertiaPlugin, so the whole effect is
 * a 2D canvas and a few hundred `arc` calls per frame — no shaders, no WebGL,
 * no per-pixel work. That is what makes it affordable behind a text dashboard
 * where Threads (40 Perlin evaluations per pixel) is not.
 *
 * Cost controls: DPR is capped, the loop only runs while the grid is on screen
 * and the tab is foregrounded, touch devices get a single static frame, and
 * reduced motion pins the same frame.
 */

type DotGridProps = {
  /** Dot diameter in CSS pixels. */
  dotSize?: number;
  /** Empty space between dots in CSS pixels. */
  gap?: number;
  /** Resting colour, any CSS colour string. */
  baseColor?: string;
  /** Colour the dots interpolate to under the pointer. */
  activeColor?: string;
  /** Pointer radius that lights dots up, in CSS pixels. */
  proximity?: number;
  /** Click ripple radius, in CSS pixels. */
  shockRadius?: number;
  /** How hard a click pushes dots away. */
  shockStrength?: number;
  /** Stiffness of the return-to-grid spring. */
  spring?: number;
  className?: string;
};

type Dot = {
  cx: number;
  cy: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
};

const MAX_DPR = 1.5;

export function DotGrid({
  dotSize = 3,
  gap = 30,
  baseColor = "rgba(255,255,255,0.16)",
  activeColor = "rgba(255,255,255,0.9)",
  proximity = 150,
  shockRadius = 260,
  shockStrength = 14,
  spring = 0.09,
  className,
}: DotGridProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const coarsePointer = window.matchMedia?.("(pointer: coarse)").matches ?? false;
    const reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
    // Phones have no hover to react to, so a single painted frame is enough.
    const animate = !reducedMotion && !coarsePointer;

    let dots: Dot[] = [];
    let width = 0;
    let height = 0;

    const pointer = { x: -9999, y: -9999 };

    const build = () => {
      const rect = container.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      if (width === 0 || height === 0) return;

      const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const cell = dotSize + gap;
      const cols = Math.floor(width / cell);
      const rows = Math.floor(height / cell);
      const offsetX = (width - (cols * cell - gap)) / 2;
      const offsetY = (height - (rows * cell - gap)) / 2;

      dots = [];
      for (let row = 0; row < rows; row += 1) {
        for (let col = 0; col < cols; col += 1) {
          dots.push({
            cx: offsetX + col * cell + dotSize / 2,
            cy: offsetY + row * cell + dotSize / 2,
            x: 0,
            y: 0,
            vx: 0,
            vy: 0,
          });
        }
      }
    };

    const step = () => {
      for (const dot of dots) {
        const dx = dot.cx - pointer.x;
        const dy = dot.cy - pointer.y;
        const distance = Math.hypot(dx, dy);

        if (distance < proximity && distance > 0.01) {
          const push = (1 - distance / proximity) * 10;
          dot.vx += (dx / distance) * push * 0.08;
          dot.vy += (dy / distance) * push * 0.08;
        }

        // Critically damped enough to settle quickly without a library.
        dot.vx += -dot.x * spring;
        dot.vy += -dot.y * spring;
        dot.vx *= 0.86;
        dot.vy *= 0.86;
        dot.x += dot.vx;
        dot.y += dot.vy;
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = baseColor;

      const radius = dotSize / 2;
      for (const dot of dots) {
        const ox = dot.cx + dot.x;
        const oy = dot.cy + dot.y;
        const distance = Math.hypot(dot.cx - pointer.x, dot.cy - pointer.y);

        if (distance < proximity) {
          const t = 1 - distance / proximity;
          ctx.fillStyle = activeColor;
          ctx.globalAlpha = 0.25 + t * 0.75;
          ctx.beginPath();
          ctx.arc(ox, oy, radius + t * 1.6, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.globalAlpha = 1;
          ctx.beginPath();
          ctx.arc(ox, oy, radius, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.globalAlpha = 1;
      ctx.fillStyle = baseColor;
    };

    let frame = 0;
    let isVisible = true;

    const loop = () => {
      frame = requestAnimationFrame(loop);
      if (!isVisible || document.hidden) return;
      step();
      draw();
    };

    build();
    draw();

    if (animate) {
      frame = requestAnimationFrame(loop);

      const intersectionObserver = new IntersectionObserver(
        ([entry]) => {
          isVisible = entry.isIntersecting;
        },
        { threshold: 0 },
      );
      intersectionObserver.observe(container);

      // The canvas sits behind the dashboard, so cards would swallow every
      // pointer event. Track the window and project into canvas space instead.
      const handlePointerMove = (event: PointerEvent) => {
        const rect = container.getBoundingClientRect();
        pointer.x = event.clientX - rect.left;
        pointer.y = event.clientY - rect.top;
      };
      const handlePointerLeave = (event: PointerEvent) => {
        if (event.relatedTarget) return;
        pointer.x = -9999;
        pointer.y = -9999;
      };
      const handleClick = (event: PointerEvent) => {
        const rect = container.getBoundingClientRect();
        const cx = event.clientX - rect.left;
        const cy = event.clientY - rect.top;

        for (const dot of dots) {
          const dx = dot.cx - cx;
          const dy = dot.cy - cy;
          const distance = Math.hypot(dx, dy);
          if (distance > shockRadius) continue;
          const falloff = 1 - distance / shockRadius;
          dot.vx += (dx / distance) * shockStrength * falloff;
          dot.vy += (dy / distance) * shockStrength * falloff;
        }
      };

      document.addEventListener("pointermove", handlePointerMove, { passive: true });
      document.addEventListener("pointerout", handlePointerLeave);
      container.addEventListener("pointerdown", handleClick);

      return () => {
        cancelAnimationFrame(frame);
        intersectionObserver.disconnect();
        document.removeEventListener("pointermove", handlePointerMove);
        document.removeEventListener("pointerout", handlePointerLeave);
        container.removeEventListener("pointerdown", handleClick);
      };
    }
  }, [dotSize, gap, baseColor, activeColor, proximity, shockRadius, shockStrength, spring]);

  return (
    <div ref={containerRef} aria-hidden className={cn("pointer-events-auto", className)}>
      <canvas ref={canvasRef} />
    </div>
  );
}
