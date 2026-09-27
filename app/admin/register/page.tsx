"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AmbientBackground } from "@/components/ui/ambient-background";
import { Mail01Icon, LockIcon, UserIcon, ArrowRight01Icon, ArrowLeft01Icon, Sun01Icon, Moon01Icon } from "hugeicons-react";
import { getInitialTheme, applyTheme, Theme } from "@/lib/theme";

export default function AdminRegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
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

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Gagal mendaftar.");
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
    <div className="relative min-h-screen w-full max-w-[100vw] overflow-x-hidden flex flex-col justify-between bg-slate-50 dark:bg-neutral-950 text-slate-900 dark:text-neutral-100 font-sans p-6 transition-colors duration-300">
      <AmbientBackground />

      <div className="relative z-10 max-w-md w-full mx-auto flex items-center justify-between mb-6">
        <Link href="/">
          <Button variant="outline" size="sm" className="h-10 px-3.5 text-xs font-semibold">
            <ArrowLeft01Icon className="w-4 h-4" />
            Kembali ke Beranda
          </Button>
        </Link>

        <button
          onClick={toggleTheme}
          className="h-10 w-10 rounded-2xl bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 text-slate-700 dark:text-neutral-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors shadow-sm flex items-center justify-center shrink-0"
        >
          {theme === "dark" ? (
            <Sun01Icon className="w-4 h-4 text-amber-400 shrink-0" />
          ) : (
            <Moon01Icon className="w-4 h-4 text-emerald-600 shrink-0" />
          )}
        </button>
      </div>

      <Card className="relative z-10 max-w-md w-full mx-auto p-8 space-y-6">
        <div className="flex flex-col items-center text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-black border border-neutral-800 flex items-center justify-center shrink-0 overflow-hidden shadow-sm">
            <Image
              src="/logo.png"
              alt="SQW Logo"
              width={48}
              height={48}
              className="w-full h-full object-contain"
            />
          </div>
          <h1 className="font-serif text-2xl font-semibold text-slate-900 dark:text-white tracking-tight">
            Pendaftaran Admin Baru
          </h1>
          <p className="text-xs text-slate-500 dark:text-neutral-400">
            Buat akun admin untuk membuat kuis terisolasi & mengunduh laporan pelanggaran peserta.
          </p>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-700 dark:text-neutral-300 flex items-center gap-2">
              <UserIcon className="w-4 h-4 text-emerald-500" />
              Nama Lengkap Pengajar / Admin
            </label>
            <Input
              type="text"
              placeholder="Dr. Ahmad Wijaya"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-700 dark:text-neutral-300 flex items-center gap-2">
              <Mail01Icon className="w-4 h-4 text-emerald-500" />
              Alamat Email
            </label>
            <Input
              type="email"
              placeholder="ahmad@sekolah.sch.id"
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
            {loading ? "Mendaftarkan..." : "Buat Akun Admin"}
            <ArrowRight01Icon className="w-4 h-4" />
          </Button>
        </form>

        <div className="text-center text-xs text-slate-500 dark:text-neutral-400 pt-2 border-t border-slate-200 dark:border-neutral-800">
          Sudah memiliki akun Admin?{" "}
          <Link href="/admin/login" className="text-emerald-600 dark:text-emerald-400 hover:underline font-medium">
            Masuk Sekarang
          </Link>
        </div>
      </Card>

      <div className="py-4" />
    </div>
  );
}
