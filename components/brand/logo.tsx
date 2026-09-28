import Image from "next/image";
import { cn } from "@/lib/utils";

type LogoProps = {
  /** Tailwind height utility. Width follows the intrinsic 855x600 ratio. */
  className?: string;
  priority?: boolean;
  alt?: string;
};

const DIMENSIONS = { width: 855, height: 600 } as const;

/**
 * Raw mark, no container. The dark mark is white-on-transparent and the light
 * mark is black-on-transparent; both share the same 855x600 canvas so the glyph
 * sits at the same optical size in both themes.
 */
export function Logo({ className, priority, alt = "Secure Quiz Wrapper" }: LogoProps) {
  // The span is inline-flex so the marks size to their own content. A bare
  // fragment let `align-items: stretch` from a column flex parent (the quiz
  // name gate) squash the width and render the mark square.
  return (
    <span className="inline-flex shrink-0 items-start">
      <Image
        src="/logo.png"
        alt={alt}
        {...DIMENSIONS}
        priority={priority}
        className={cn("hidden h-7 w-auto dark:block", className)}
      />
      <Image
        src="/logo-light.png"
        alt={alt}
        {...DIMENSIONS}
        priority={priority}
        className={cn("h-7 w-auto dark:hidden", className)}
      />
    </span>
  );
}

export function Wordmark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "font-sans text-[0.9375rem] font-semibold tracking-[-0.02em] text-foreground",
        className,
      )}
    >
      Secure Quiz Wrapper
    </span>
  );
}
