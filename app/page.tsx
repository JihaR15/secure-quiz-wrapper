"use client";

import { useState, useEffect } from "react";
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
  Shield01Icon,
  Menu01Icon,
  Cancel01Icon,
  Sun01Icon,
  Moon01Icon,
  Globe02Icon,
} from "hugeicons-react";
import { Language, translations } from "@/lib/i18n";
import { getInitialTheme, applyTheme, Theme } from "@/lib/theme";

export default function LandingPage() {
  const [language, setLanguage] = useState<Language>("id");
  const [theme, setTheme] = useState<Theme>("dark");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  const t = translations[language];

  // Initialize theme from localStorage or system preference
  useEffect(() => {
    const initial = getInitialTheme();
    setTheme(initial);
    applyTheme(initial);
  }, []);

  const toggleTheme = () => {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTheme(next);
    applyTheme(next);
  };

  return (
    <div className="min-h-screen w-full max-w-[100vw] overflow-x-hidden flex flex-col justify-between bg-slate-50 dark:bg-neutral-950 text-slate-900 dark:text-neutral-100 transition-colors duration-300">
      {/* Navigation Header */}
      <header className="w-full border-b border-slate-200/80 dark:border-neutral-900/80 bg-white/80 dark:bg-neutral-950/80 backdrop-blur-md sticky top-0 z-40 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          {/* Logo & Brand Name (Flat clean icon, no glow) */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold shrink-0">
              <Shield01Icon className="w-5 h-5 stroke-[2] shrink-0" />
            </div>
            <span className="font-sans font-semibold text-lg tracking-tight truncate text-slate-900 dark:text-white">
              Secure Quiz Wrapper
            </span>
          </div>

          {/* Desktop Controls */}
          <div className="hidden md:flex items-center gap-3">
            {/* Language Switcher */}
            <button
              onClick={() => setLanguage((l) => (l === "id" ? "en" : "id"))}
              className="p-2 px-3.5 rounded-2xl bg-slate-100 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 text-xs font-mono text-slate-700 dark:text-neutral-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors flex items-center gap-1.5"
            >
              <Globe02Icon className="w-4 h-4 text-emerald-500" />
              <span className="font-bold">{language.toUpperCase()}</span>
            </button>

            {/* Sun / Moon Light & Dark Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-2xl bg-slate-100 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 text-slate-700 dark:text-neutral-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
              title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {theme === "dark" ? (
                <Sun01Icon className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon01Icon className="w-4 h-4 text-emerald-600" />
              )}
            </button>

            <div className="h-4 w-px bg-slate-200 dark:bg-neutral-800" />

            {/* Navbar Action Buttons (No Icons) */}
            <Link href="/admin">
              <Button variant="outline" size="sm">
                {t.adminConsole}
              </Button>
            </Link>
            <Link href="/admin">
              <Button variant="primary" size="sm">
                {t.generateLink}
              </Button>
            </Link>
          </div>

          {/* Mobile Action Controls */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-xl bg-slate-100 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 text-slate-700 dark:text-neutral-300"
            >
              {theme === "dark" ? (
                <Sun01Icon className="w-5 h-5 text-amber-400" />
              ) : (
                <Moon01Icon className="w-5 h-5 text-emerald-600" />
              )}
            </button>

            <button
              onClick={() => setIsMobileMenuOpen((prev) => !prev)}
              className="p-2.5 rounded-xl bg-slate-100 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 text-slate-700 dark:text-neutral-300"
              aria-label="Toggle Menu"
            >
              {isMobileMenuOpen ? (
                <Cancel01Icon className="w-6 h-6" />
              ) : (
                <Menu01Icon className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Hamburger Drawer Menu with Generous Spacing */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-b border-slate-200 dark:border-neutral-800 bg-white/95 dark:bg-neutral-950/95 p-6 space-y-6 animate-in slide-in-from-top-2 duration-200">
            {/* Language Selector */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-100 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800">
              <span className="text-xs font-mono text-slate-600 dark:text-neutral-400 flex items-center gap-2">
                <Globe02Icon className="w-4 h-4 text-emerald-500" />
                {language === "id" ? "Bahasa Sistem" : "System Language"}
              </span>
              <button
                onClick={() => setLanguage((l) => (l === "id" ? "en" : "id"))}
                className="px-3.5 py-2 rounded-xl bg-emerald-600 text-white font-mono text-xs font-bold shadow-sm"
              >
                {language === "id" ? "ID (Indonesia)" : "EN (English)"}
              </button>
            </div>

            {/* Mobile Navigation Buttons with Spacious Spacing */}
            <div className="space-y-4 pt-2 ">
              <Link href="/admin" onClick={() => setIsMobileMenuOpen(false)}>
                <Button variant="outline" size="md" className="w-full justify-center py-3.5 mb-2.5 text-sm">
                  {t.adminConsole}
                </Button>
              </Link>
              <Link href="/admin" onClick={() => setIsMobileMenuOpen(false)}>
                <Button variant="primary" size="md" className="w-full justify-center py-3.5 text-sm font-semibold">
                  {t.generateLink}
                </Button>
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Main Hero & Bento Section with Fade-Up Animation */}
      <main className="max-w-7xl mx-auto px-6 py-16 md:py-24 space-y-16 w-full flex-1">
        {/* Top Hero Heading */}
        <div className="text-center max-w-3xl mx-auto space-y-6 animate-fade-up">
          <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl font-medium tracking-tight text-slate-900 dark:text-white leading-[1.15]">
            {language === "id" ? (
              <>
                Lingkungan Ujian Terkontrol untuk{" "}
                <span className="text-emerald-600 dark:text-emerald-400 italic">
                  Google & MS Forms
                </span>
                .
              </>
            ) : (
              <>
                Controlled assessment environment for{" "}
                <span className="text-emerald-600 dark:text-emerald-400 italic">
                  Google & MS Forms
                </span>
                .
              </>
            )}
          </h1>

          <p className="font-sans text-slate-600 dark:text-neutral-400 text-base md:text-lg leading-relaxed max-w-2xl mx-auto">
            {t.landingSub}
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/admin" className="w-full sm:w-auto">
              <Button variant="primary" size="lg" className="w-full sm:w-auto">
                {t.generateLink}
                <ArrowRight01Icon className="w-5 h-5" />
              </Button>
            </Link>
            <a href="#bento-grid" className="w-full sm:w-auto">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                {t.exploreFeatures}
              </Button>
            </a>
          </div>
        </div>

        {/* Bento Grid */}
        <div id="bento-grid" className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8 animate-fade-up-delayed">
          {/* Card 1: Tab-Switch Prevention */}
          <Card
            hoverEffect
            className="md:col-span-2 flex flex-col justify-between space-y-8 bg-gradient-to-br from-white via-emerald-50/20 to-white dark:from-neutral-900/90 dark:via-neutral-900/40 dark:to-neutral-950"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                <ViewOffIcon className="w-6 h-6 stroke-[1.5]" />
              </div>
              <h2 className="font-serif text-2xl md:text-3xl font-medium text-slate-900 dark:text-white">
                {language === "id"
                  ? "Pemantauan Tab & Jendela Aktif"
                  : "Active Tab & Window Tracking"}
              </h2>
              <p className="font-sans text-slate-600 dark:text-neutral-400 text-sm md:text-base leading-relaxed max-w-xl">
                {language === "id"
                  ? "Sistem memantau secara real-time setiap kali peserta berpindah tab, membuka aplikasi lain di HP/laptop, atau meminimalkan browser. Notifikasi Toast langsung muncul dan pelanggaran dicatat ke database admin."
                  : "Real-time monitoring detects whenever a participant navigates away from the active tab or minimizes the browser window. Toast alerts appear instantly and violations are logged."}
              </p>
            </div>

            {/* Visual Representation */}
            <div className="w-full rounded-2xl border border-slate-200 dark:border-neutral-800 bg-slate-900 text-slate-100 p-5 space-y-3 font-mono text-xs shadow-inner">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="text-slate-400 font-sans">Security Event Stream</span>
                <span className="px-2.5 py-0.5 rounded-md bg-red-950/80 border border-red-800/80 text-red-400 font-sans text-[11px] font-medium">
                  Violation Detected
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span>[LOG] window_blur_event</span>
                <span className="text-slate-500">TIMESTAMP: 14:32:09</span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span>[ACTION] Non-blocking Toast Alert presented</span>
                <span className="text-emerald-400">STATUS: Logged to Server</span>
              </div>
            </div>
          </Card>

          {/* Card 2: QR Code Distribution */}
          <Card hoverEffect className="flex flex-col justify-between space-y-8">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                <QrCodeIcon className="w-6 h-6 stroke-[1.5]" />
              </div>
              <h2 className="font-serif text-2xl font-medium text-slate-900 dark:text-white">
                {language === "id" ? "Distribusi QR Code Instan" : "Instant QR Distribution"}
              </h2>
              <p className="font-sans text-slate-600 dark:text-neutral-400 text-sm leading-relaxed">
                {language === "id"
                  ? "Buat QR Code siap scan untuk dibagikan di kelas atau ruang ujian dari link Google/MS Form Anda."
                  : "Generate scannable QR codes for classroom or hall assessments directly from your form URL."}
              </p>
            </div>

            <div className="w-full aspect-square rounded-2xl border border-slate-200 dark:border-neutral-800 bg-slate-50 dark:bg-neutral-950 flex items-center justify-center p-6">
              <div className="w-full h-full rounded-xl bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 flex flex-col items-center justify-center gap-3 shadow-sm">
                <QrCodeIcon className="w-16 h-16 text-emerald-600 dark:text-emerald-400 stroke-[1.2]" />
                <span className="text-xs font-sans text-slate-500 dark:text-neutral-400">
                  Live Admin Generation
                </span>
              </div>
            </div>
          </Card>

          {/* Card 3: Clipboard & Context Lock */}
          <Card hoverEffect className="flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                <Copy01Icon className="w-6 h-6 stroke-[1.5]" />
              </div>
              <h2 className="font-serif text-2xl font-medium text-slate-900 dark:text-white">
                {language === "id" ? "Proteksi Salin & Klik Kanan" : "Clipboard Interception"}
              </h2>
              <p className="font-sans text-slate-600 dark:text-neutral-400 text-sm leading-relaxed">
                {language === "id"
                  ? "Mencegah aksi copy, paste, dan menu klik kanan selama sesi ujian berlangsung."
                  : "Prevents copy, paste, and right-click context menus throughout the assessment duration."}
              </p>
            </div>

            <div className="p-4 rounded-2xl border border-slate-200 dark:border-neutral-800 bg-slate-50 dark:bg-neutral-950 space-y-2 text-xs font-sans">
              <div className="flex items-center justify-between text-slate-600 dark:text-neutral-400">
                <span>Context Menu (Klik Kanan)</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-mono font-bold">BLOCKED</span>
              </div>
              <div className="flex items-center justify-between text-slate-600 dark:text-neutral-400">
                <span>Clipboard Copy / Cut</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-mono font-bold">BLOCKED</span>
              </div>
              <div className="flex items-center justify-between text-slate-600 dark:text-neutral-400">
                <span>Clipboard Paste</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-mono font-bold">BLOCKED</span>
              </div>
            </div>
          </Card>

          {/* Card 4: Safe URL Wrapping */}
          <Card hoverEffect className="md:col-span-2 flex flex-col justify-between space-y-8">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                <Link01Icon className="w-6 h-6 stroke-[1.5]" />
              </div>
              <h2 className="font-serif text-2xl md:text-3xl font-medium text-slate-900 dark:text-white">
                {language === "id"
                  ? "Pengodean URL & Pemasangan Parameter Otomatis"
                  : "Safe URL Wrapping & Parameter Enforcement"}
              </h2>
              <p className="font-sans text-slate-600 dark:text-neutral-400 text-sm md:text-base leading-relaxed max-w-xl">
                {language === "id"
                  ? "Mengunci parameter formulir secara aman sambil menambahkan flag `?embedded=true` secara otomatis. Bekerja sempurna untuk Google Forms & Microsoft Forms."
                  : "Encodes form target parameters safely while automatically enforcing embedded view flags. Works seamlessly with Google Forms and Microsoft Forms."}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-2xl border border-slate-200 dark:border-neutral-800 bg-slate-50 dark:bg-neutral-950">
              <div className="flex items-center gap-3 w-full overflow-hidden">
                <CircleLock01Icon className="w-5 h-5 text-emerald-500 shrink-0" />
                <span className="font-mono text-xs text-slate-600 dark:text-neutral-400 truncate">
                  /quiz?form=aHR0cHM6Ly9kb2NzLmdvb2dsZS5jb20vZm9ybXMv...
                </span>
              </div>
              <Link href="/admin" className="shrink-0 w-full sm:w-auto">
                <Button variant="secondary" size="sm" className="w-full">
                  {t.generateLink}
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-slate-200 dark:border-neutral-900 bg-white dark:bg-neutral-950 py-10 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 font-sans text-xs text-slate-500 dark:text-neutral-500">
          <div className="flex items-center gap-2">
            <Shield01Icon className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>Secure Quiz Wrapper — Controlled Assessment System</span>
          </div>
          <div>All rights reserved. Standard browser enforcement protocols.</div>
        </div>
      </footer>
    </div>
  );
}
