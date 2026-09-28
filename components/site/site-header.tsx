"use client";

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

export function SiteHeader({ cta }: { cta: { href: string; label: string } }) {
  const { t } = useLanguage();

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
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
          <span aria-hidden className="mx-2 h-5 w-px bg-border" />
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
    </header>
  );
}
