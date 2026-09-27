"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { QRCodeSVG } from "qrcode.react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Shield01Icon,
  QrCodeIcon,
  Copy01Icon,
  CheckmarkCircle01Icon,
  ArrowRight01Icon,
  Link01Icon,
  Download01Icon,
  UserIcon,
  Logout01Icon,
  Globe02Icon,
  Delete02Icon,
  Sun01Icon,
  Moon01Icon,
  AlertCircleIcon,
} from "hugeicons-react";
import { Language, translations } from "@/lib/i18n";
import { getInitialTheme, applyTheme, Theme } from "@/lib/theme";

interface Submission {
  id: string;
  quizId: string;
  participantName: string;
  violationCount: number;
  status: string;
  startedAt: string;
  lastActiveAt: string;
}

interface Quiz {
  id: string;
  title: string;
  formUrl: string;
  encodedUrl: string;
  createdAt: string;
  submissions: Submission[];
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [language, setLanguage] = useState<Language>("id");
  const [theme, setTheme] = useState<Theme>("dark");
  const [adminName, setAdminName] = useState<string>("");
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedQuizId, setSelectedQuizId] = useState<string | null>(null);

  // Form input state
  const [titleInput, setTitleInput] = useState<string>("");
  const [urlInput, setUrlInput] = useState<string>("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [origin, setOrigin] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [submitting, setSubmitting] = useState<boolean>(false);

  const t = translations[language];

  useEffect(() => {
    if (typeof window !== "undefined") {
      setOrigin(window.location.origin);
    }
    const initialTheme = getInitialTheme();
    setTheme(initialTheme);
    applyTheme(initialTheme);
  }, []);

  const toggleTheme = () => {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTheme(next);
    applyTheme(next);
  };

  const loadDashboardData = async () => {
    try {
      const meRes = await fetch("/api/auth/me");
      const meData = await meRes.json();

      if (!meRes.ok || !meData.authenticated) {
        router.push("/admin/login");
        return;
      }

      setAdminName(meData.admin.name);

      const quizRes = await fetch("/api/quizzes");
      const quizData = await quizRes.json();

      if (quizRes.ok && quizData.quizzes) {
        setQuizzes(quizData.quizzes);
        if (quizData.quizzes.length > 0 && !selectedQuizId) {
          setSelectedQuizId(quizData.quizzes[0].id);
        }
      }
    } catch {
      router.push("/admin/login");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
  };

  const handleCreateQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!titleInput.trim() || !urlInput.trim()) {
      setError(language === "id" ? "Judul kuis dan URL form wajib diisi" : "Title and URL are required");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/quizzes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: titleInput.trim(),
          formUrl: urlInput.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Gagal membuat kuis");
        setSubmitting(false);
        return;
      }

      setTitleInput("");
      setUrlInput("");
      setSubmitting(false);
      loadDashboardData();
    } catch {
      setError("Terjadi kesalahan jaringan");
      setSubmitting(false);
    }
  };

  const handleDeleteQuiz = async (quizId: string) => {
    if (
      !confirm(
        language === "id"
          ? "Apakah Anda yakin ingin menghapus kuis ini beserta data hasilnya?"
          : "Are you sure you want to delete this quiz and its responses?"
      )
    ) {
      return;
    }

    try {
      const res = await fetch(`/api/quizzes?id=${quizId}`, { method: "DELETE" });
      if (res.ok) {
        if (selectedQuizId === quizId) {
          setSelectedQuizId(null);
        }
        loadDashboardData();
      }
    } catch {
      // Error handling
    }
  };

  const handleDeleteSubmission = async (submissionId: string) => {
    if (
      !confirm(
        language === "id"
          ? "Apakah Anda yakin ingin menghapus catatan peserta ini?"
          : "Are you sure you want to delete this participant record?"
      )
    ) {
      return;
    }

    try {
      const res = await fetch(`/api/submissions?id=${submissionId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        loadDashboardData();
      }
    } catch {
      // Error handling
    }
  };

  const getQuizFullUrl = (quiz: Quiz) => {
    return origin
      ? `${origin}/quiz?form=${quiz.encodedUrl}&id=${quiz.id}`
      : `/quiz?form=${quiz.encodedUrl}&id=${quiz.id}`;
  };

  const handleCopyLink = async (quiz: Quiz) => {
    const fullUrl = getQuizFullUrl(quiz);
    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopiedId(quiz.id);
      setTimeout(() => setCopiedId(null), 2500);
    } catch {
      // Fallback
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen w-screen bg-slate-50 dark:bg-neutral-950 flex items-center justify-center text-slate-500 dark:text-neutral-400 font-sans text-sm">
        Memuat Dashboard Admin...
      </div>
    );
  }

  const selectedQuiz = quizzes.find((q) => q.id === selectedQuizId);

  return (
    <div className="min-h-screen w-full max-w-[100vw] overflow-x-hidden flex flex-col justify-between bg-slate-50 dark:bg-neutral-950 text-slate-900 dark:text-neutral-100 font-sans transition-colors duration-300">
      {/* Header Bar */}
      <header className="w-full border-b border-slate-200 dark:border-neutral-900 bg-white/80 dark:bg-neutral-950/80 backdrop-blur-md sticky top-0 z-40 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between gap-2">
          {/* Logo & Brand Name */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold shrink-0">
                <Shield01Icon className="w-5 h-5 stroke-[2]" />
              </div>
              <span className="font-sans font-semibold text-base sm:text-lg tracking-tight hidden sm:inline">
                Secure Quiz Wrapper
              </span>
              <span className="font-sans font-bold text-sm tracking-tight inline sm:hidden text-emerald-600 dark:text-emerald-400">
                SQW
              </span>
            </Link>
          </div>

          {/* Controls & Logged-In Admin Profile */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Logged-In Admin Name Badge (Visible on Mobile & Desktop) */}
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-2xl bg-slate-100 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 text-xs text-slate-700 dark:text-neutral-300 max-w-[120px] sm:max-w-none truncate">
              <UserIcon className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span className="truncate font-medium">{adminName}</span>
            </div>

            {/* Theme Toggle Button (Icon on mobile) */}
            <button
              onClick={toggleTheme}
              className="p-2 sm:p-2.5 rounded-2xl bg-slate-100 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 text-slate-700 dark:text-neutral-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors shrink-0"
              title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {theme === "dark" ? (
                <Sun01Icon className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon01Icon className="w-4 h-4 text-emerald-600" />
              )}
            </button>

            {/* Language Switcher (Icon/Text on mobile) */}
            <button
              onClick={() => setLanguage((l) => (l === "id" ? "en" : "id"))}
              className="p-2 sm:px-3 rounded-2xl bg-slate-100 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 text-xs font-mono text-slate-700 dark:text-neutral-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors flex items-center gap-1 shrink-0"
              title="Switch Language"
            >
              <Globe02Icon className="w-3.5 h-3.5 text-emerald-500" />
              <span className="font-bold hidden sm:inline">{language.toUpperCase()}</span>
            </button>

            {/* Logout Button (Icon on mobile, Text on Desktop) */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="px-2.5 sm:px-4 shrink-0"
              title={t.logout}
            >
              <Logout01Icon className="w-4 h-4" />
              <span className="hidden sm:inline">{t.logout}</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Admin Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-8 sm:space-y-10 w-full flex-1">
        {/* Admin Title Bar */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs uppercase tracking-wider font-medium">
            <QrCodeIcon className="w-3.5 h-3.5" />
            {t.adminConsole}
          </div>
          <h1 className="font-serif text-2xl sm:text-4xl font-medium text-slate-900 dark:text-white tracking-tight">
            Dashboard Pengawas Ujian
          </h1>
          <p className="text-slate-600 dark:text-neutral-400 text-xs sm:text-sm max-w-2xl">
            Kelola kuis terisolasi Anda, lihat riwayat peserta beserta catatan pelanggarannya, hapus data jika diperlukan, dan unduh laporan Excel.
          </p>
        </div>

        {/* Top Form: Create New Quiz */}
        <Card className="space-y-6">
          <h2 className="font-serif text-lg sm:text-xl font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <Link01Icon className="w-5 h-5 text-emerald-500" />
            {t.generateQuiz}
          </h2>

          <form onSubmit={handleCreateQuiz} className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <div className="md:col-span-4">
              <Input
                type="text"
                placeholder={language === "id" ? "Judul Kuis (misal: Ujian Fisika Kelas X)" : "Quiz Title"}
                value={titleInput}
                onChange={(e) => setTitleInput(e.target.value)}
              />
            </div>
            <div className="md:col-span-6">
              <Input
                type="url"
                placeholder="https://docs.google.com/forms/d/e/.../viewform"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
              />
            </div>
            <div className="md:col-span-2">
              <Button variant="primary" size="md" className="w-full h-12" disabled={submitting}>
                {submitting ? "Memproses..." : t.generateQuiz}
              </Button>
            </div>
          </form>

          {error && <p className="text-xs text-red-400 font-medium">{error}</p>}
        </Card>

        {/* Quizzes List & Participant Results Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: My Quizzes List (4 Cols) */}
          <div className="lg:col-span-4 space-y-4">
            <h3 className="font-serif text-lg font-medium text-slate-900 dark:text-white flex items-center justify-between">
              <span>{t.myQuizzes}</span>
              <span className="text-xs font-mono text-slate-500 dark:text-neutral-400">({quizzes.length})</span>
            </h3>

            {quizzes.length === 0 ? (
              <Card className="text-center p-6 text-xs text-slate-500 dark:text-neutral-500">
                Belum ada kuis yang dibuat. Gunakan formulir di atas untuk membuat kuis pertama Anda.
              </Card>
            ) : (
              <div className="space-y-3">
                {quizzes.map((q) => {
                  const isSelected = q.id === selectedQuizId;
                  const submissionCount = q.submissions.length;
                  const totalViolations = q.submissions.reduce((acc, s) => acc + s.violationCount, 0);

                  return (
                    <div
                      key={q.id}
                      onClick={() => setSelectedQuizId(q.id)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-3 ${
                        isSelected
                          ? "bg-white dark:bg-neutral-900 border-emerald-500/50 shadow-lg shadow-emerald-500/10"
                          : "bg-white/60 dark:bg-neutral-900/40 border-slate-200 dark:border-neutral-800/80 hover:bg-slate-100 dark:hover:bg-neutral-900/70"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="font-semibold text-sm text-slate-900 dark:text-neutral-100 line-clamp-1">
                            {q.title}
                          </h4>
                          <span className="text-[11px] text-slate-500 dark:text-neutral-500 font-mono">
                            {new Date(q.createdAt).toLocaleDateString("id-ID")}
                          </span>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteQuiz(q.id);
                          }}
                          className="text-slate-400 dark:text-neutral-500 hover:text-red-500 p-1 transition-colors"
                          title="Hapus Kuis"
                        >
                          <Delete02Icon className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-neutral-400 font-mono pt-1">
                        <span>{submissionCount} Peserta</span>
                        <span className={totalViolations > 0 ? "text-red-500 font-bold" : "text-slate-500 dark:text-neutral-500"}>
                          {totalViolations} Pelanggaran
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Column: Quiz Details, QR & Participant Table (8 Cols) */}
          <div className="lg:col-span-8 space-y-6">
            {selectedQuiz ? (
              <>
                <Card className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-neutral-800 pb-4">
                    <div>
                      <span className="text-xs uppercase tracking-wider text-slate-500 dark:text-neutral-400">
                        Kuis Terpilih
                      </span>
                      <h3 className="font-serif text-2xl font-medium text-slate-900 dark:text-white">
                        {selectedQuiz.title}
                      </h3>
                    </div>

                    <a
                      href={`/api/export?quizId=${selectedQuiz.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button variant="primary" size="md" className="shrink-0 w-full sm:w-auto">
                        <Download01Icon className="w-4 h-4" />
                        {t.exportExcel}
                      </Button>
                    </a>
                  </div>

                  {/* Shareable Link & QR Code Display */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                    <div className="md:col-span-8 space-y-3">
                      <label className="text-xs font-medium text-slate-700 dark:text-neutral-300">
                        Link Akses Peserta (Dengan Proteksi Anti-Cheat)
                      </label>
                      <p className="font-mono text-xs text-slate-800 dark:text-neutral-200 break-all bg-slate-100 dark:bg-neutral-950 p-3 rounded-xl border border-slate-200 dark:border-neutral-800 select-all">
                        {getQuizFullUrl(selectedQuiz)}
                      </p>
                      <div className="flex items-center gap-3">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleCopyLink(selectedQuiz)}
                        >
                          {copiedId === selectedQuiz.id ? (
                            <>
                              <CheckmarkCircle01Icon className="w-4 h-4 text-emerald-500" />
                              Link Tersalin
                            </>
                          ) : (
                            <>
                              <Copy01Icon className="w-4 h-4" />
                              Salin Link Kuis
                            </>
                          )}
                        </Button>
                        <a
                          href={getQuizFullUrl(selectedQuiz)}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Button variant="outline" size="sm">
                            Uji Sesi Kuis
                            <ArrowRight01Icon className="w-4 h-4" />
                          </Button>
                        </a>
                      </div>
                    </div>

                    <div className="md:col-span-4 flex flex-col items-center justify-center p-4 bg-slate-100 dark:bg-neutral-950 rounded-2xl border border-slate-200 dark:border-neutral-800">
                      <QRCodeSVG
                        value={getQuizFullUrl(selectedQuiz)}
                        size={130}
                        bgColor="transparent"
                        fgColor={theme === "dark" ? "#f5f5f5" : "#0f172a"}
                        level="H"
                      />
                      <span className="text-[11px] font-mono text-slate-500 dark:text-neutral-500 mt-2">
                        Scan QR Code
                      </span>
                    </div>
                  </div>
                </Card>

                {/* Participant Submissions & Violations Table */}
                <Card className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-serif text-lg font-medium text-slate-900 dark:text-white flex items-center gap-2">
                      <UserIcon className="w-4 h-4 text-emerald-500" />
                      {t.participantResults}
                    </h4>
                    <span className="text-xs font-mono text-slate-500 dark:text-neutral-400">
                      Total: {selectedQuiz.submissions.length} Peserta
                    </span>
                  </div>

                  {selectedQuiz.submissions.length === 0 ? (
                    <div className="p-8 text-center text-xs text-slate-500 dark:text-neutral-500 border border-dashed border-slate-200 dark:border-neutral-800 rounded-2xl">
                      {t.noParticipants}
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs font-sans">
                        <thead className="bg-slate-100 dark:bg-neutral-950 border-b border-slate-200 dark:border-neutral-800 text-slate-500 dark:text-neutral-400 uppercase text-[10px] font-mono tracking-wider">
                          <tr>
                            <th className="p-3 pl-4">No.</th>
                            <th className="p-3">{t.participantName}</th>
                            <th className="p-3">{t.violations}</th>
                            <th className="p-3">{t.status}</th>
                            <th className="p-3">{t.startedAt}</th>
                            <th className="p-3">{t.lastActive}</th>
                            <th className="p-3 pr-4 text-right">Aksi</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200/60 dark:divide-neutral-800/60">
                          {selectedQuiz.submissions.map((sub, idx) => {
                            const hasViolation = sub.violationCount > 0;
                            const highRisk = sub.violationCount >= 5;

                            return (
                              <tr key={sub.id} className="hover:bg-slate-50 dark:hover:bg-neutral-900/80 transition-colors">
                                <td className="p-3 pl-4 font-mono text-slate-400 dark:text-neutral-500">{idx + 1}</td>
                                <td className="p-3 font-semibold text-slate-900 dark:text-neutral-100">
                                  {sub.participantName}
                                </td>
                                <td className="p-3 font-mono font-bold">
                                  <span
                                    className={`px-2.5 py-1 rounded-lg border text-xs ${
                                      hasViolation
                                        ? "bg-red-500/10 border-red-500/30 text-red-500"
                                        : "bg-slate-100 dark:bg-neutral-950 border-slate-200 dark:border-neutral-800 text-slate-700 dark:text-neutral-300"
                                    }`}
                                  >
                                    {sub.violationCount}
                                  </span>
                                </td>
                                <td className="p-3">
                                  {highRisk ? (
                                    <span className="px-2 py-0.5 rounded-full bg-red-500/10 border border-red-500/30 text-red-500 text-[11px] font-medium">
                                      {t.riskHigh}
                                    </span>
                                  ) : hasViolation ? (
                                    <span className="px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-500 text-[11px] font-medium">
                                      {t.riskWarning}
                                    </span>
                                  ) : (
                                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-[11px] font-medium">
                                      {t.riskNormal}
                                    </span>
                                  )}
                                </td>
                                <td className="p-3 font-mono text-slate-500 dark:text-neutral-400">
                                  {new Date(sub.startedAt).toLocaleTimeString("id-ID", {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </td>
                                <td className="p-3 font-mono text-slate-500 dark:text-neutral-400">
                                  {new Date(sub.lastActiveAt).toLocaleTimeString("id-ID", {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </td>
                                <td className="p-3 pr-4 text-right">
                                  <button
                                    onClick={() => handleDeleteSubmission(sub.id)}
                                    className="p-1.5 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-500/10 transition-colors"
                                    title="Hapus Data Peserta"
                                  >
                                    <Delete02Icon className="w-4 h-4" />
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </Card>
              </>
            ) : (
              <Card className="p-12 text-center text-sm text-slate-500 dark:text-neutral-400 space-y-3">
                <AlertCircleIcon className="w-8 h-8 text-slate-400 dark:text-neutral-500 mx-auto" />
                <p>Pilih kuis dari daftar di sebelah kiri untuk melihat QR Code dan hasil pelanggaran peserta.</p>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
