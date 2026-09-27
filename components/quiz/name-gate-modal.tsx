"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Shield01Icon, UserIcon, ArrowRight01Icon } from "hugeicons-react";
import { translations, Language } from "@/lib/i18n";

interface NameGateModalProps {
  isOpen: boolean;
  language: Language;
  onSubmit: (name: string) => void;
}

export function NameGateModal({ isOpen, language, onSubmit }: NameGateModalProps) {
  const [name, setName] = useState<string>("");
  const [error, setError] = useState<string>("");
  const t = translations[language];

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError(language === "id" ? "Nama lengkap wajib diisi" : "Full name is required");
      return;
    }
    setError("");
    onSubmit(name.trim());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/95 backdrop-blur-xl animate-in fade-in duration-200">
      <Card className="max-w-md w-full bg-neutral-900 border-neutral-800 shadow-2xl space-y-6 p-8">
        <div className="mx-auto w-14 h-14 rounded-2xl bg-neutral-800 border border-neutral-700/60 flex items-center justify-center text-neutral-100">
          <Shield01Icon className="w-7 h-7 stroke-[1.5]" />
        </div>

        <div className="text-center space-y-2">
          <h2 className="font-serif text-2xl font-semibold text-white tracking-tight">
            {t.quizGateTitle}
          </h2>
          <p className="text-xs text-neutral-400 font-sans leading-relaxed">
            {t.quizGateSub}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
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
            {t.startQuiz}
            <ArrowRight01Icon className="w-4 h-4" />
          </Button>
        </form>

        <div className="text-[11px] text-neutral-500 text-center font-sans">
          {language === "id"
            ? "Sesi ujian akan mencatat waktu & aktivitas Anda"
            : "Session time & integrity status will be recorded"}
        </div>
      </Card>
    </div>
  );
}
