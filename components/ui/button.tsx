import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "danger";
  size?: "sm" | "md" | "lg";
}

export function Button({
  className,
  variant = "primary",
  size = "md",
  children,
  ...props
}: ButtonProps) {
  const baseStyles =
    "inline-flex items-center justify-center font-sans font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none";

  const variants = {
    primary:
      "bg-emerald-600 text-white hover:bg-emerald-500 active:bg-emerald-700 rounded-2xl font-semibold shadow-lg shadow-emerald-600/25 dark:shadow-emerald-950/40 hover:-translate-y-0.5",
    secondary:
      "bg-emerald-950/20 text-emerald-700 dark:bg-neutral-800 dark:text-emerald-400 hover:bg-emerald-900/30 dark:hover:bg-neutral-700 rounded-2xl border border-emerald-500/20 dark:border-neutral-700/50",
    outline:
      "bg-transparent text-slate-700 dark:text-neutral-300 hover:text-emerald-600 dark:hover:text-white hover:bg-emerald-50/50 dark:hover:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-2xl",
    danger:
      "bg-red-600 text-white hover:bg-red-500 active:bg-red-700 rounded-2xl shadow-lg shadow-red-950/30 hover:-translate-y-0.5",
  };

  const sizes = {
    sm: "px-4 py-2 text-xs gap-2",
    md: "px-5 py-2.5 text-sm gap-2.5",
    lg: "px-7 py-3.5 text-base gap-3",
  };

  return (
    <button
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      {...props}
    >
      {children}
    </button>
  );
}
