"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Alert02Icon, CheckmarkCircle01Icon, LockPasswordIcon } from "hugeicons-react";
import { AuthShell } from "@/components/site/auth-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLanguage } from "@/components/providers";

const FIELD_CLASS = "h-10";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useLanguage();

  const token = searchParams.get("token") || "";

  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [error, setError] = React.useState("");
  const [pending, setPending] = React.useState(false);
  const [success, setSuccess] = React.useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (pending) return;

    if (!token) {
      setError("Token verifikasi tidak ditemukan. Silakan klik ulang tautan dari email Anda.");
      return;
    }

    if (password.length < 6) {
      setError(t.passwordMinLength);
      return;
    }

    if (password !== confirmPassword) {
      setError(t.passwordMismatch);
      return;
    }

    setError("");
    setPending(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data.error || t.toastNetworkError);
        setPending(false);
        return;
      }

      setSuccess(true);
      toast.success(t.passwordResetSuccess);
      setTimeout(() => {
        router.replace("/admin/login");
      }, 1500);
    } catch {
      setError(t.toastNetworkError);
    } finally {
      setPending(false);
    }
  };

  if (!token) {
    return (
      <div className="space-y-5 rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-center">
        <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <Alert02Icon className="size-6" />
        </div>
        <div className="space-y-2">
          <h3 className="font-semibold text-foreground">
            Tautan Tidak Valid
          </h3>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Token verifikasi tidak ditemukan pada tautan ini. Silakan periksa kembali tautan yang dikirimkan ke email Anda atau ajukan lupa kata sandi baru.
          </p>
        </div>
        <Button asChild variant="outline" className="w-full">
          <Link href="/admin/forgot-password">
            {t.forgotPasswordTitle}
          </Link>
        </Button>
      </div>
    );
  }

  if (success) {
    return (
      <div className="space-y-5 rounded-xl border border-border bg-card/60 p-6 text-center">
        <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-success/10 text-success">
          <CheckmarkCircle01Icon className="size-6" />
        </div>
        <div className="space-y-2">
          <h3 className="font-semibold text-foreground">
            {t.passwordResetSuccess}
          </h3>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Mengalihkan Anda ke halaman masuk…
          </p>
        </div>
        <Button asChild className="w-full">
          <Link href="/admin/login">
            {t.signInNow}
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="password" className="text-xs text-muted-foreground">
          {t.newPassword}
        </Label>
        <Input
          id="password"
          type="password"
          autoComplete="new-password"
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="••••••••"
          className={FIELD_CLASS}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword" className="text-xs text-muted-foreground">
          {t.confirmPassword}
        </Label>
        <Input
          id="confirmPassword"
          type="password"
          autoComplete="new-password"
          required
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
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
        {pending ? t.loginPending : t.saveNewPassword}
        {pending ? null : <LockPasswordIcon className="size-4" />}
      </Button>
    </form>
  );
}

export default function ResetPasswordPage() {
  const { t } = useLanguage();

  return (
    <AuthShell
      eyebrow={t.adminConsole}
      title={t.resetPasswordTitle}
      sub={t.resetPasswordSub}
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
      <React.Suspense fallback={<div className="py-8 text-center text-sm text-muted-foreground">Memuat…</div>}>
        <ResetPasswordForm />
      </React.Suspense>
    </AuthShell>
  );
}
