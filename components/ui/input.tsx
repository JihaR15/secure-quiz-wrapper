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
            "flex h-12 w-full rounded-2xl bg-neutral-900 border border-neutral-800 px-4 py-3 text-sm text-neutral-100 placeholder:text-neutral-500 font-sans transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-neutral-400 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50",
            error && "border-red-500/80 focus:ring-red-500",
            className
          )}
          ref={ref}
          {...props}
        />
        {error && (
          <p className="text-xs text-red-400 font-sans font-medium px-1">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
