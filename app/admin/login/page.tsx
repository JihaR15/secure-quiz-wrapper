"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Shield01Icon, Mail01Icon, LockIcon, ArrowRight01Icon, ArrowLeft01Icon, Sun01Icon, Moon01Icon } from "hugeicons-react";
import { getInitialTheme, applyTheme, Theme } from "@/lib/theme";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    const initialTheme = getInitialTheme();
    setTheme(initialTheme);
    applyTheme(initialTheme);
  }, []);

  const toggleTheme = () => {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTheme(next);
    applyTheme(next);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Gagal masuk.");
        setLoading(false);
        return;
      }

      router.push("/admin");
    } catch {
      setError("Terjadi kesalahan jaringan.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full max-w-[100vw] overflow-x-hidden flex flex-col justify-between bg-slate-50 dark:bg-neutral-950 text-slate-900 dark:text-neutral-100 font-sans p-6 transition-colors duration-300">
      <div className="max-w-md w-full mx-auto flex items-center justify-between mb-6">
        <Link href="/">
          <Button variant="outline" size="sm">
            <ArrowLeft01Icon className="w-4 h-4" />
            Kembali ke Beranda
          </Button>
        </Link>

        <button
          onClick={toggleTheme}
          className="p-2.5 rounded-2xl bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 text-slate-700 dark:text-neutral-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors shadow-sm"
        >
          {theme === "dark" ? (
            <Sun01Icon className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon01Icon className="w-4 h-4 text-emerald-600" />
          )}
        </button>
      </div>

      <Card className="max-w-md w-full mx-auto p-8 space-y-6">
        <div className="flex flex-col items-center text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold shrink-0">
            <Shield01Icon className="w-6 h-6 stroke-[2]" />
          </div>
          <h1 className="font-serif text-2xl font-semibold text-slate-900 dark:text-white tracking-tight">
            Login Portal Admin
          </h1>
          <p className="text-xs text-slate-500 dark:text-neutral-400">
            Masuk untuk membuat kuis baru dan memantau hasil & pelanggaran peserta.
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-700 dark:text-neutral-300 flex items-center gap-2">
              <Mail01Icon className="w-4 h-4 text-emerald-500" />
              Alamat Email
            </label>
            <Input
              type="email"
              placeholder="admin@sekolah.sch.id"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-700 dark:text-neutral-300 flex items-center gap-2">
              <LockIcon className="w-4 h-4 text-emerald-500" />
              Kata Sandi
            </label>
            <Input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && (
            <p className="text-xs text-red-500 font-medium px-1 bg-red-500/10 p-2.5 rounded-xl border border-red-500/30">
              {error}
            </p>
          )}

          <Button
            variant="primary"
            size="lg"
            className="w-full font-semibold"
            disabled={loading}
          >
            {loading ? "Memproses..." : "Masuk ke Dashboard"}
            <ArrowRight01Icon className="w-4 h-4" />
          </Button>
        </form>

        <div className="text-center text-xs text-slate-500 dark:text-neutral-400 pt-2 border-t border-slate-200 dark:border-neutral-800">
          Belum memiliki akun Admin?{" "}
          <Link href="/admin/register" className="text-emerald-600 dark:text-emerald-400 hover:underline font-medium">
            Daftar Sekarang
          </Link>
        </div>
      </Card>

      <div className="py-4" />
    </div>
  );
}
