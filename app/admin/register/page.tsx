"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowRight01Icon, Alert02Icon } from "hugeicons-react";
import { AuthShell } from "@/components/site/auth-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLanguage } from "@/components/providers";

export default function AdminRegisterPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState("");
  const [pending, setPending] = React.useState(false);

  const handleRegister = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (pending) return;
    setError("");
    setPending(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), email: email.trim(), password }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data.error || t.toastNetworkError);
        setPending(false);
        return;
      }

      toast.success(t.registerCta);
      router.replace("/admin");
      router.refresh();
    } catch {
      setError(t.toastNetworkError);
      setPending(false);
    }
  };

  return (
    <AuthShell
      eyebrow={t.appTagline}
      title={t.registerTitle}
      sub={t.registerSub}
      asidePoints={[
        t.featureFocusTitle,
        t.featureClipboardTitle,
        t.featureUrlTitle,
        t.featureQrTitle,
        t.featureLiveTitle,
      ]}
      footer={
        <>
          {t.alreadyHaveAccount}{" "}
          <Link
            href="/admin/login"
            className="font-medium text-foreground underline-offset-4 hover:underline"
          >
            {t.signInNow}
          </Link>
        </>
      }
    >
      <form onSubmit={handleRegister} noValidate className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-xs text-muted-foreground">
            {t.fullName}
          </Label>
          <Input
            id="name"
            type="text"
            autoComplete="name"
            required
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Dr. Ahmad Wijaya"
            className="h-10"
          />
        </div>

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
            placeholder="ahmad@sekolah.sch.id"
            className="h-10"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" className="text-xs text-muted-foreground">
            {t.password}
          </Label>
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="••••••••"
            className="h-10"
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
          {pending ? t.registerPending : t.registerCta}
          {pending ? null : <ArrowRight01Icon className="size-4" />}
        </Button>
      </form>
    </AuthShell>
  );
}
