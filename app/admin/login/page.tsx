"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Shield01Icon, Mail01Icon, LockIcon, ArrowRight01Icon, ArrowLeft01Icon } from "hugeicons-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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
    <div className="min-h-screen w-full max-w-[100vw] overflow-x-hidden flex flex-col justify-between bg-neutral-950 text-neutral-100 font-sans p-6">
      <div className="max-w-md w-full mx-auto">
        <Link href="/">
          <Button variant="outline" size="sm" className="mb-6">
            <ArrowLeft01Icon className="w-4 h-4" />
            Kembali ke Beranda
          </Button>
        </Link>
      </div>

      <Card className="max-w-md w-full mx-auto bg-neutral-900/60 border-neutral-800 shadow-2xl p-8 space-y-6">
        <div className="flex flex-col items-center text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-neutral-100 text-neutral-950 flex items-center justify-center font-bold shrink-0">
            <Shield01Icon className="w-6 h-6 stroke-[2]" />
          </div>
          <h1 className="font-serif text-2xl font-semibold text-white tracking-tight">
            Login Portal Admin
          </h1>
          <p className="text-xs text-neutral-400">
            Masuk untuk membuat kuis baru dan memantau hasil & pelanggaran peserta.
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-medium text-neutral-300 flex items-center gap-2">
              <Mail01Icon className="w-4 h-4 text-neutral-400" />
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
            <label className="text-xs font-medium text-neutral-300 flex items-center gap-2">
              <LockIcon className="w-4 h-4 text-neutral-400" />
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
            <p className="text-xs text-red-400 font-medium px-1 bg-red-950/40 p-2.5 rounded-xl border border-red-900/40">
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

        <div className="text-center text-xs text-neutral-400 pt-2 border-t border-neutral-800/80">
          Belum memiliki akun Admin?{" "}
          <Link href="/admin/register" className="text-white hover:underline font-medium">
            Daftar Sekarang
          </Link>
        </div>
      </Card>

      <div className="py-4" />
    </div>
  );
}
