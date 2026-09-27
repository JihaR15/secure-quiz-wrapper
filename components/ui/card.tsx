import * as React from "react";
import { cn } from "@/lib/utils";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverEffect?: boolean;
}

export function Card({ className, hoverEffect = false, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-3xl bg-neutral-900/50 border border-neutral-800/60 backdrop-blur-md p-6 md:p-8 transition-all duration-300 shadow-xl shadow-black/20",
        hoverEffect && "hover:border-neutral-700/80 hover:bg-neutral-900/80 hover:shadow-2xl hover:shadow-neutral-950/40",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
