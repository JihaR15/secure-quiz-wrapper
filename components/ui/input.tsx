import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, ...props }, ref) => {
    return (
      <div className="w-full space-y-1.5">
        <input
          type={type}
          className={cn(
            "flex h-12 w-full rounded-2xl px-4 py-3 text-sm font-sans transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50",
            "bg-white border border-slate-200 text-slate-900 placeholder:text-slate-400",
            "dark:bg-neutral-900 dark:border-neutral-800 dark:text-neutral-100 dark:placeholder:text-neutral-500",
            error && "border-red-500/80 focus:ring-red-500",
            className
          )}
          ref={ref}
          {...props}
        />
        {error && (
          <p className="text-xs text-red-500 font-sans font-medium px-1">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
