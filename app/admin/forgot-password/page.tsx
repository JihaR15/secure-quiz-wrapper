"use client";

import * as React from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Alert02Icon, CheckmarkCircle01Icon, Mail01Icon } from "hugeicons-react";
import { AuthShell } from "@/components/site/auth-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLanguage } from "@/components/providers";

const FIELD_CLASS = "h-10";

export default function ForgotPasswordPage() {
  const { t } = useLanguage();
  const [email, setEmail] = React.useState("");
  const [error, setError] = React.useState("");
  const [pending, setPending] = React.useState(false);
  const [submitted, setSubmitted] = React.useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (pending) return;

    if (!email.trim() || !email.includes("@")) {
      setError("Masukkan alamat email yang valid.");
      return;
    }

    setError("");
    setPending(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data.error || t.toastNetworkError);
        setPending(false);
        return;
      }

      setSubmitted(true);
      toast.success(t.resetLinkSent);
    } catch {
      setError(t.toastNetworkError);
    } finally {
      setPending(false);
    }
  };

  return (
    <AuthShell
      eyebrow={t.adminConsole}
      title={t.forgotPasswordTitle}
      sub={t.forgotPasswordSub}
      asidePoints={[
        t.featureFocusTitle,
        t.featureClipboardTitle,
        t.featureUrlTitle,
        t.featureLiveTitle,
        t.featureExportTitle,
      ]}
      footer={
        <Link
          href="/admin/login"
          className="font-medium text-foreground underline-offset-4 hover:underline"
        >
          {t.backToLogin}
        </Link>
      }
    >
      {submitted ? (
        <div className="space-y-5 rounded-xl border border-border bg-card/60 p-6 text-center">
          <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-success/10 text-success">
            <CheckmarkCircle01Icon className="size-6" />
          </div>
          <div className="space-y-2">
            <h3 className="font-semibold text-foreground">
              {t.forgotPasswordTitle}
            </h3>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {t.resetLinkSent}
            </p>
          </div>
          <Button asChild variant="outline" className="w-full">
            <Link href="/admin/login">
              {t.backToLogin}
            </Link>
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} noValidate className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-xs text-muted-foreground">
              {t.email}
            </Label>
            <div className="relative">
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
            {pending ? t.sendResetPending : t.sendResetLink}
            {pending ? null : <Mail01Icon className="size-4" />}
          </Button>
        </form>
      )}
    </AuthShell>
  );
}
