import * as React from "react";
import { cn } from "@/lib/utils";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverEffect?: boolean;
}

export function Card({ className, hoverEffect = false, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-3xl p-6 md:p-8 transition-all duration-300 shadow-xl",
        "bg-white/80 border border-emerald-100/80 text-slate-900 shadow-emerald-950/5",
        "dark:bg-neutral-900/60 dark:border-neutral-800/80 dark:text-neutral-100 dark:shadow-black/40 dark:backdrop-blur-xl",
        hoverEffect &&
          "hover:border-emerald-500/40 hover:shadow-2xl hover:shadow-emerald-500/10 hover:-translate-y-1 dark:hover:border-emerald-500/40 dark:hover:bg-neutral-900/90",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
