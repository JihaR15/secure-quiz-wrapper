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
    "inline-flex items-center justify-center font-sans font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-neutral-400 focus:ring-offset-2 focus:ring-offset-neutral-950 disabled:opacity-50 disabled:cursor-not-allowed select-none";

  const variants = {
    primary:
      "bg-neutral-100 text-neutral-950 hover:bg-white active:bg-neutral-200 rounded-2xl font-semibold shadow-md shadow-neutral-950/20",
    secondary:
      "bg-neutral-800 text-neutral-100 hover:bg-neutral-700 active:bg-neutral-800 rounded-2xl border border-neutral-700/50",
    outline:
      "bg-transparent text-neutral-300 hover:text-white hover:bg-neutral-900 border border-neutral-800 rounded-2xl",
    danger:
      "bg-red-600 text-white hover:bg-red-500 active:bg-red-700 rounded-2xl shadow-lg shadow-red-950/40",
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
