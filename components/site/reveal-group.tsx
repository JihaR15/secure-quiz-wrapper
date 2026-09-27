"use client";

import * as React from "react";

/**
 * Adds `data-shown="true"` to every `.reveal` descendant once the group scrolls
 * into view. `--reveal-delay` staggers siblings without a motion library.
 */
export function RevealGroup({
  children,
  className,
  step = 70,
  as: Tag = "div",
}: {
  children: React.ReactNode;
  className?: string;
  step?: number;
  as?: React.ElementType;
}) {
  const ref = React.useRef<HTMLElement | null>(null);

  React.useEffect(() => {
    const root = ref.current;
    if (!root) return;

    const targets = Array.from(root.querySelectorAll<HTMLElement>(".reveal"));
    targets.forEach((element, index) => {
      element.style.setProperty("--reveal-delay", `${index * step}ms`);
    });

    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      targets.forEach((element) => {
        element.dataset.shown = "true";
      });
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          (entry.target as HTMLElement).dataset.shown = "true";
          observer.unobserve(entry.target);
        }
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.12 },
    );

    targets.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [step]);

  return (
    <Tag ref={ref} className={className}>
      {children}
    </Tag>
  );
}
