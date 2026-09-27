"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Shield01Icon,
  UserIcon,
  ArrowRight01Icon,
  SmartPhone01Icon,
  ViewOffIcon,
  CheckmarkCircle01Icon,
  ArrowExpand01Icon,
} from "hugeicons-react";
import { translations, Language } from "@/lib/i18n";

interface NameGateModalProps {
  isOpen: boolean;
  language: Language;
  onSubmit: (name: string) => void;
}

export function NameGateModal({ isOpen, language, onSubmit }: NameGateModalProps) {
  const [step, setStep] = useState<"name" | "rules">("name");
  const [name, setName] = useState<string>("");
  const [error, setError] = useState<string>("");
  const t = translations[language];

  if (!isOpen) return null;

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError(language === "id" ? "Nama lengkap wajib diisi" : "Full name is required");
      return;
    }
    setError("");
    setStep("rules");
  };

  const handleStartExam = () => {
    // Attempt auto fullscreen
    if (typeof document !== "undefined" && document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen().catch(() => {});
    }
    onSubmit(name.trim());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/95 backdrop-blur-xl animate-in fade-in duration-200 font-sans">
      <Card className="max-w-md w-full bg-neutral-900 border-neutral-800 shadow-2xl space-y-6 p-8">
        <div className="mx-auto w-14 h-14 rounded-2xl bg-neutral-800 border border-neutral-700/60 flex items-center justify-center text-neutral-100">
          <Shield01Icon className="w-7 h-7 stroke-[1.5]" />
        </div>

        {step === "name" ? (
          <>
            <div className="text-center space-y-2">
              <h2 className="font-serif text-2xl font-semibold text-white tracking-tight">
                {t.quizGateTitle}
              </h2>
              <p className="text-xs text-neutral-400 leading-relaxed">
                {t.quizGateSub}
              </p>
            </div>

            <form onSubmit={handleNextStep} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-medium text-neutral-300 flex items-center gap-2">
                  <UserIcon className="w-4 h-4 text-neutral-400" />
                  {t.fullName}
                </label>
                <Input
                  type="text"
                  placeholder={language === "id" ? "Contoh: Budi Santoso" : "e.g., John Doe"}
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setError("");
                  }}
                  error={error}
                  autoFocus
                />
              </div>

              <Button variant="primary" size="lg" className="w-full font-semibold">
                {language === "id" ? "Lanjut ke Petunjuk Ujian" : "Proceed to Instructions"}
                <ArrowRight01Icon className="w-4 h-4" />
              </Button>
            </form>
          </>
        ) : (
          <>
            <div className="text-center space-y-2">
              <h2 className="font-serif text-2xl font-semibold text-white tracking-tight">
                {language === "id" ? "Petunjuk & Aturan Ujian" : "Exam Rules & Guidance"}
              </h2>
              <p className="text-xs text-neutral-400 leading-relaxed">
                {language === "id"
                  ? "Harap perhatikan petunjuk penting berikut sebelum memulai."
                  : "Please read the following guidelines carefully before starting."}
              </p>
            </div>

            <div className="space-y-3 p-4 rounded-2xl bg-neutral-950 border border-neutral-800 text-xs text-neutral-300">
              <div className="flex items-start gap-3">
                <SmartPhone01Icon className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-white block">
                    {language === "id" ? "Nyalakan Mode Jangan Ganggu (DND)" : "Enable Do Not Disturb (DND)"}
                  </span>
                  <p className="text-neutral-400 text-[11px] mt-0.5">
                    {language === "id"
                      ? "Harap bisukan (silent) HP atau aktifkan mode Jangan Ganggu agar notifikasi aplikasi/telepon tidak mengganggu ujian."
                      : "Silence your phone or turn on DND mode to prevent incoming calls/notifications."}
                  </p>
                </div>
              </div>

              <div className="h-px bg-neutral-900" />

              <div className="flex items-start gap-3">
                <ViewOffIcon className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-white block">
                    {language === "id" ? "Dilarang Pindah Tab atau Aplikasi" : "Do Not Switch Tabs or Apps"}
                  </span>
                  <p className="text-neutral-400 text-[11px] mt-0.5">
                    {language === "id"
                      ? "Sistem memantau pergerakan tab secara otomatis. Berpindah aplikasi/tab akan dicatat sebagai pelanggaran."
                      : "Tab switches are automatically monitored and logged as violations."}
                  </p>
                </div>
              </div>

              <div className="h-px bg-neutral-900" />

              <div className="flex items-start gap-3">
                <ArrowExpand01Icon className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-white block">
                    {language === "id" ? "Mode Layar Penuh (Fullscreen)" : "Automatic Fullscreen Mode"}
                  </span>
                  <p className="text-neutral-400 text-[11px] mt-0.5">
                    {language === "id"
                      ? "Ujian akan dibuka dalam layar penuh. Kerjakan ujian dengan jujur dan sebaik mungkin."
                      : "The assessment will launch in fullscreen. Do your best."}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <Button
                variant="primary"
                size="lg"
                className="w-full font-semibold"
                onClick={handleStartExam}
              >
                <CheckmarkCircle01Icon className="w-4 h-4 text-emerald-400" />
                {language === "id" ? "Saya Mengerti & Mulai Ujian" : "I Understand & Start Exam"}
              </Button>

              <button
                type="button"
                onClick={() => setStep("name")}
                className="w-full text-center text-xs text-neutral-500 hover:text-neutral-300 py-1 transition-colors"
              >
                {language === "id" ? "Ubah Nama" : "Change Name"}
              </button>
            </div>
          </>
        )}

        <div className="text-[11px] text-neutral-500 text-center font-sans">
          {language === "id"
            ? "Sesi ujian akan mencatat waktu & aktivitas Anda"
            : "Session time & integrity status will be recorded"}
        </div>
      </Card>
    </div>
  );
}
