"use client";

import * as React from "react";
import Link from "next/link";
import { toast } from "sonner";
import { ArrowRight01Icon, Alert02Icon } from "hugeicons-react";
import { AuthShell } from "@/components/site/auth-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLanguage } from "@/components/providers";

const FIELD_CLASS = "h-10";

export default function AdminLoginPage() {
  const { t } = useLanguage();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState("");
  const [pending, setPending] = React.useState(false);

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (pending) return;
    setError("");
    setPending(true);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data.error || t.toastNetworkError);
        setPending(false);
        return;
      }

      toast.success(t.loginCta);
      // Intentional hard navigation ensures browser sends fresh session cookie to /admin middleware
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination
      window.location.href = "/admin";
    } catch (err: unknown) {
      clearTimeout(timeoutId);
      if (err instanceof Error && err.name === "AbortError") {
        setError(t.toastNetworkError);
      } else {
        setError(t.toastNetworkError);
      }
      setPending(false);
    }
  };

  return (
    <AuthShell
      eyebrow={t.adminConsole}
      title={t.loginTitle}
      sub={t.loginSub}
      asidePoints={[
        t.featureFocusTitle,
        t.featureClipboardTitle,
        t.featureUrlTitle,
        t.featureLiveTitle,
        t.featureExportTitle,
      ]}
      footer={
        <>
          {t.noAdminAccount}{" "}
          <Link
            href="/admin/register"
            className="font-medium text-foreground underline-offset-4 hover:underline"
          >
            {t.createNow}
          </Link>
        </>
      }
    >
      <form onSubmit={handleLogin} noValidate className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-xs text-muted-foreground">
            {t.email}
          </Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="admin@sekolah.sch.id"
            className={FIELD_CLASS}
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password" className="text-xs text-muted-foreground">
              {t.password}
            </Label>
            <Link
              href="/admin/forgot-password"
              className="text-xs text-muted-foreground transition-colors hover:text-foreground hover:underline underline-offset-4"
            >
              {t.forgotPasswordLink}
            </Link>
          </div>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="••••••••"
            className={FIELD_CLASS}
          />
        </div>

        {error ? (
          <p
            role="alert"
            className="flex items-start gap-2 rounded-lg border border-destructive/40 bg-destructive/5 px-3 py-2.5 text-xs leading-relaxed text-destructive"
          >
            <Alert02Icon className="mt-px size-3.5 shrink-0" />
            {error}
          </p>
        ) : null}

        <Button type="submit" disabled={pending} className="h-10 w-full gap-2">
          {pending ? t.loginPending : t.loginCta}
          {pending ? null : <ArrowRight01Icon className="size-4" />}
        </Button>
      </form>
    </AuthShell>
  );
}
