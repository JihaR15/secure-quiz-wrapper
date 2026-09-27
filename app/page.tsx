import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  CircleLock01Icon,
  QrCodeIcon,
  ArrowRight01Icon,
  ViewOffIcon,
  Copy01Icon,
  Link01Icon,
  CheckmarkCircle01Icon,
  Shield01Icon,
} from "hugeicons-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen w-full max-w-[100vw] overflow-x-hidden flex flex-col justify-between bg-neutral-950 text-neutral-100">
      {/* Navigation Header */}
      <header className="w-full border-b border-neutral-900/80 bg-neutral-950/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-neutral-100 text-neutral-950 flex items-center justify-center font-bold">
              <Shield01Icon className="w-5 h-5 stroke-[2]" />
            </div>
            <span className="font-sans font-semibold text-lg tracking-tight">
              Secure Quiz Wrapper
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link href="/admin">
              <Button variant="outline" size="sm" className="px-3 sm:px-4 text-xs sm:text-sm">
                <Shield01Icon className="w-4 h-4 text-neutral-400" />
                <span className="hidden sm:inline">Admin Console</span>
                <span className="inline sm:hidden">Admin</span>
              </Button>
            </Link>
            <Link href="/admin">
              <Button variant="primary" size="sm" className="px-3 sm:px-4 text-xs sm:text-sm">
                <Link01Icon className="w-4 h-4" />
                <span className="hidden sm:inline">Create Quiz Link</span>
                <span className="inline sm:hidden">Buat Link</span>
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Hero & Bento Section */}
      <main className="max-w-7xl mx-auto px-6 py-16 md:py-24 space-y-16 w-full">
        {/* Top Hero Heading */}
        <div className="text-center max-w-3xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-neutral-800 bg-neutral-900/60 text-neutral-400 text-xs font-sans tracking-wide uppercase">
            <CheckmarkCircle01Icon className="w-3.5 h-3.5 text-neutral-200" />
            Integrity Protection for Forms
          </div>

          <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl font-medium tracking-tight text-white leading-[1.15]">
            Controlled environment for Google and MS Forms.
          </h1>

          <p className="font-sans text-neutral-400 text-base md:text-lg leading-relaxed max-w-2xl mx-auto">
            Encapsulate standard form links into strict browser sessions. Prevent tab switching, right-clicking, and content copying with automated violation tracking.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/admin" className="w-full sm:w-auto">
              <Button variant="primary" size="lg" className="w-full sm:w-auto">
                Generate Secure Link
                <ArrowRight01Icon className="w-5 h-5" />
              </Button>
            </Link>
            <a
              href="#bento-grid"
              className="w-full sm:w-auto"
            >
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                Explore Features
              </Button>
            </a>
          </div>
        </div>

        {/* Bento Grid */}
        <div id="bento-grid" className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8">
          {/* Card 1: Tab-Switch Prevention (Large 2-column card) */}
          <Card hoverEffect className="md:col-span-2 flex flex-col justify-between space-y-8 bg-gradient-to-br from-neutral-900/80 via-neutral-900/40 to-neutral-950">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-neutral-800/80 border border-neutral-700/50 flex items-center justify-center text-neutral-100">
                <ViewOffIcon className="w-6 h-6 stroke-[1.5]" />
              </div>
              <h2 className="font-serif text-2xl md:text-3xl font-medium text-white">
                Active Tab & Window Tracking
              </h2>
              <p className="font-sans text-neutral-400 text-sm md:text-base leading-relaxed max-w-xl">
                Real-time monitoring detects whenever a participant navigates away from the active tab or minimizes the browser window. Every focus lost event triggers an instant lock screen and increments the violation log.
              </p>
            </div>

            {/* Visual Representation */}
            <div className="w-full rounded-2xl border border-neutral-800 bg-neutral-950/80 p-5 space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between border-b border-neutral-900 pb-3">
                <span className="text-neutral-500 font-sans">Security Event Stream</span>
                <span className="px-2.5 py-0.5 rounded-md bg-red-950/60 border border-red-800/60 text-red-400 font-sans text-[11px] font-medium">
                  Violation Detected
                </span>
              </div>
              <div className="flex items-center justify-between text-neutral-300">
                <span>[LOG] window_blur_event</span>
                <span className="text-neutral-500">TIMESTAMP: 14:32:09</span>
              </div>
              <div className="flex items-center justify-between text-neutral-400">
                <span>[ACTION] Fullscreen lock overlay presented</span>
                <span className="text-neutral-500">STATUS: Pending Acknowledgment</span>
              </div>
            </div>
          </Card>

          {/* Card 2: QR Code Distribution */}
          <Card hoverEffect className="flex flex-col justify-between space-y-8 bg-neutral-900/60">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-neutral-800/80 border border-neutral-700/50 flex items-center justify-center text-neutral-100">
                <QrCodeIcon className="w-6 h-6 stroke-[1.5]" />
              </div>
              <h2 className="font-serif text-2xl font-medium text-white">
                Instant QR Distribution
              </h2>
              <p className="font-sans text-neutral-400 text-sm leading-relaxed">
                Generate scannable QR codes for classroom or hall assessments directly from your form URL.
              </p>
            </div>

            <div className="w-full aspect-square rounded-2xl border border-neutral-800 bg-neutral-950/60 flex items-center justify-center p-6">
              <div className="w-full h-full rounded-xl bg-neutral-900 border border-neutral-800 flex flex-col items-center justify-center gap-3">
                <QrCodeIcon className="w-16 h-16 text-neutral-400 stroke-[1]" />
                <span className="text-xs font-sans text-neutral-500">Live Admin Generation</span>
              </div>
            </div>
          </Card>

          {/* Card 3: Clipboard & Context Lock */}
          <Card hoverEffect className="flex flex-col justify-between space-y-6 bg-neutral-900/60">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-neutral-800/80 border border-neutral-700/50 flex items-center justify-center text-neutral-100">
                <Copy01Icon className="w-6 h-6 stroke-[1.5]" />
              </div>
              <h2 className="font-serif text-2xl font-medium text-white">
                Clipboard Interception
              </h2>
              <p className="font-sans text-neutral-400 text-sm leading-relaxed">
                Prevents copy, paste, and right-click context menus throughout the assessment duration.
              </p>
            </div>

            <div className="p-4 rounded-2xl border border-neutral-800 bg-neutral-950/80 space-y-2 text-xs font-sans">
              <div className="flex items-center justify-between text-neutral-400">
                <span>Context Menu (Right Click)</span>
                <span className="text-neutral-500 font-mono">BLOCKED</span>
              </div>
              <div className="flex items-center justify-between text-neutral-400">
                <span>Clipboard Copy / Cut</span>
                <span className="text-neutral-500 font-mono">BLOCKED</span>
              </div>
              <div className="flex items-center justify-between text-neutral-400">
                <span>Clipboard Paste</span>
                <span className="text-neutral-500 font-mono">BLOCKED</span>
              </div>
            </div>
          </Card>

          {/* Card 4: URL Encryption & Seamless Embedding (2-column card) */}
          <Card hoverEffect className="md:col-span-2 flex flex-col justify-between space-y-8 bg-neutral-900/60">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-neutral-800/80 border border-neutral-700/50 flex items-center justify-center text-neutral-100">
                <Link01Icon className="w-6 h-6 stroke-[1.5]" />
              </div>
              <h2 className="font-serif text-2xl md:text-3xl font-medium text-white">
                Safe URL Wrapping & Parameter Enforcement
              </h2>
              <p className="font-sans text-neutral-400 text-sm md:text-base leading-relaxed max-w-xl">
                Encodes form target parameters safely while automatically enforcing embedded view flags. Works seamlessly with Google Forms, Microsoft Forms, and standard Web quizes.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-2xl border border-neutral-800 bg-neutral-950/80">
              <div className="flex items-center gap-3 w-full overflow-hidden">
                <CircleLock01Icon className="w-5 h-5 text-neutral-400 shrink-0" />
                <span className="font-mono text-xs text-neutral-400 truncate">
                  /quiz?form=aHR0cHM6Ly9kb2NzLmdvb2dsZS5jb20vZm9ybXMv...
                </span>
              </div>
              <Link href="/admin" className="shrink-0 w-full sm:w-auto">
                <Button variant="secondary" size="sm" className="w-full">
                  Create Link
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-neutral-900 bg-neutral-950 py-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 font-sans text-xs text-neutral-500">
          <div className="flex items-center gap-2">
            <Shield01Icon className="w-4 h-4 text-neutral-400" />
            <span>Secure Quiz Wrapper — Controlled Assessment System</span>
          </div>
          <div>All rights reserved. Standard browser enforcement protocols.</div>
        </div>
      </footer>
    </div>
  );
}
