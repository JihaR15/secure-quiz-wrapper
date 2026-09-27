"use client";

export function AmbientBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none">
      {/* Radial Spotlights */}
      <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-emerald-500/10 dark:bg-emerald-500/15 blur-[140px] rounded-full" />
      <div className="absolute top-1/3 -left-40 w-[500px] h-[400px] bg-emerald-600/10 dark:bg-emerald-600/10 blur-[120px] rounded-full" />
      <div className="absolute bottom-10 right-0 w-[600px] h-[450px] bg-emerald-400/10 dark:bg-emerald-500/10 blur-[150px] rounded-full" />

      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#00000008_1px,transparent_1px),linear-gradient(to_bottom,#00000008_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
    </div>
  );
}
