import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { Language } from "@/lib/i18n";

type SiteFooterProps = {
  language: Language;
  note: string;
  product: string;
};

export function SiteFooter({ language, note, product }: SiteFooterProps) {
  return (
    <footer className="border-t border-border/70">
      <div className="flex w-full flex-col gap-6 px-6 py-10 sm:px-10 md:px-12 lg:px-16 xl:px-20 md:flex-row md:items-start md:justify-between">
        <div className="space-y-3">
          <Link href="/" className="inline-flex items-center" aria-label={product}>
            <Logo className="h-6" />
          </Link>
          <p className="max-w-sm text-pretty text-sm text-muted-foreground">{note}</p>
        </div>

        <div className="flex flex-col gap-2 md:items-end">
          <nav className="flex items-center gap-5 text-sm text-muted-foreground">
            <Link
              href="/admin"
              className="transition-colors hover:text-foreground"
            >
              {language === "id" ? "Konsol admin" : "Admin console"}
            </Link>
            <Link
              href="/admin/login"
              className="transition-colors hover:text-foreground"
            >
              {language === "id" ? "Masuk" : "Sign in"}
            </Link>
          </nav>
          <p className="font-mono text-[0.6875rem] uppercase tracking-[0.14em] text-muted-foreground/70">
            {product}
          </p>
        </div>
      </div>
    </footer>
  );
}
