"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Logo, Wordmark } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useLanguage } from "@/components/providers";
import { LanguageToggle } from "@/components/site/language-toggle";
import { ThemeToggle } from "@/components/site/theme-toggle";
import { Menu01Icon } from "hugeicons-react";

function HeaderBar({
  cta,
}: {
  cta: { href: string; label: string };
  transparent?: boolean;
}) {
  const { t } = useLanguage();

  return (
    <div className="flex h-16 w-full items-center justify-between gap-3 px-6 sm:px-10 md:px-12 lg:px-16 xl:px-20">
      <Link
        href="/"
        className="flex shrink-0 items-center gap-2.5"
        aria-label={t.appName}
      >
        <Logo priority />
        <Wordmark className="hidden sm:inline" />
      </Link>

      <div className="hidden items-center gap-1 md:flex">
        <LanguageToggle />
        <ThemeToggle />
        <span aria-hidden className="mx-2 h-5 w-px bg-border/60" />
        <Button asChild variant="default" size="sm" className="h-8 px-3.5">
          <Link href={cta.href}>{cta.label}</Link>
        </Button>
      </div>

      <div className="flex items-center gap-0.5 md:hidden">
        <LanguageToggle />
        <ThemeToggle />
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" aria-label={t.openMenu} className="md:hidden">
              <Menu01Icon className="size-4" />
            </Button>
          </SheetTrigger>
          <SheetContent
            side="right"
            className="w-[min(20rem,88vw)] border-l border-border bg-background p-0"
          >
            <SheetHeader className="border-b border-border px-6 py-5 text-left">
              <SheetTitle className="flex items-center gap-2.5">
                <Logo className="h-6" />
                <Wordmark />
              </SheetTitle>
            </SheetHeader>
            <div className="flex flex-col gap-1 px-6 py-6">
              <Button asChild variant="default" size="lg" className="w-full justify-center">
                <Link href={cta.href}>{cta.label}</Link>
              </Button>
              <Button asChild variant="ghost" size="lg" className="w-full justify-center">
                <Link href="/admin">{t.adminConsole}</Link>
              </Button>
              <Button asChild variant="ghost" size="lg" className="w-full justify-center">
                <Link href="/">{t.returnHome}</Link>
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
}

export function SiteHeader({ cta }: { cta: { href: string; label: string } }) {
  const [isSection2, setIsSection2] = useState(false);

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const section2 = document.getElementById("fitur");
          if (section2) {
            const rect = section2.getBoundingClientRect();
            // Muncul saat bagian atas section 2 mendekati area atas viewport
            setIsSection2(rect.top <= 80);
          } else {
            setIsSection2(window.scrollY >= window.innerHeight * 0.85);
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, []);

  return (
    <>
      {/* 1. Navbar transparan di Section 1 (Hero): tidak sticky, ikut ter-scroll ke atas */}
      <header className="absolute top-0 left-0 right-0 z-40 border-b border-transparent bg-transparent">
        <HeaderBar cta={cta} transparent />
      </header>

      {/* 2. Navbar sticky yang muncul dengan transisi halus saat masuk ke Section 2 */}
      <header
        aria-hidden={!isSection2}
        className={`fixed top-0 left-0 right-0 z-40 border-b border-border/70 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60 shadow-xs transition-all duration-300 ease-out ${
          isSection2
            ? "translate-y-0 opacity-100 pointer-events-auto"
            : "-translate-y-full opacity-0 pointer-events-none"
        }`}
      >
        <HeaderBar cta={cta} />
      </header>
    </>
  );
}
