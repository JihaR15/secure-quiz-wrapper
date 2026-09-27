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
  ArrowLeft01Icon,
  AlertCircleIcon,
  Download01Icon,
  UserIcon,
  Logout01Icon,
  Globe02Icon,
  Delete02Icon,
} from "hugeicons-react";
import { Language, translations } from "@/lib/i18n";

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
  }, []);

  // Fetch admin session and quizzes
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
      // Copy error fallback
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen w-screen bg-neutral-950 flex items-center justify-center text-neutral-400 font-sans text-sm">
        Memuat Dashboard Admin...
      </div>
    );
  }

  const selectedQuiz = quizzes.find((q) => q.id === selectedQuizId);

  return (
    <div className="min-h-screen w-full max-w-[100vw] overflow-x-hidden flex flex-col justify-between bg-neutral-950 text-neutral-100 font-sans">
      {/* Header Bar */}
      <header className="w-full border-b border-neutral-900 bg-neutral-950/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-neutral-100 text-neutral-950 flex items-center justify-center font-bold">
                <Shield01Icon className="w-5 h-5 stroke-[2]" />
              </div>
              <span className="font-sans font-semibold text-lg tracking-tight">
                Secure Quiz Wrapper
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setLanguage((l) => (l === "id" ? "en" : "id"))}
              className="p-2 px-3 rounded-2xl bg-neutral-900 border border-neutral-800 text-xs font-mono text-neutral-300 hover:text-white transition-colors flex items-center gap-1.5"
            >
              <Globe02Icon className="w-3.5 h-3.5 text-neutral-400" />
              {language.toUpperCase()}
            </button>

            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-neutral-900 border border-neutral-800 text-xs text-neutral-300">
              <UserIcon className="w-4 h-4 text-neutral-400" />
              <span>{adminName}</span>
            </div>

            <Button variant="outline" size="sm" onClick={handleLogout}>
              <Logout01Icon className="w-4 h-4" />
              {t.logout}
            </Button>
          </div>
        </div>
      </header>

      {/* Main Admin Section */}
      <main className="max-w-7xl mx-auto px-6 py-10 space-y-10 w-full flex-1">
        {/* Admin Title Bar */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-neutral-800 bg-neutral-900/60 text-neutral-400 text-xs uppercase tracking-wider">
            <QrCodeIcon className="w-3.5 h-3.5 text-neutral-200" />
            {t.adminConsole}
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-medium text-white tracking-tight">
            Dashboard Pengawas Ujian
          </h1>
          <p className="text-neutral-400 text-sm max-w-2xl">
            Kelola kuis terisolasi Anda, lihat riwayat peserta beserta catatan pelanggarannya, dan unduh laporan Excel.
          </p>
        </div>

        {/* Top Form: Create New Quiz */}
        <Card className="bg-neutral-900/50 space-y-6">
          <h2 className="font-serif text-xl font-semibold text-white flex items-center gap-2">
            <Link01Icon className="w-5 h-5 text-neutral-400" />
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
            <h3 className="font-serif text-lg font-medium text-white flex items-center justify-between">
              <span>{t.myQuizzes}</span>
              <span className="text-xs font-mono text-neutral-400">({quizzes.length})</span>
            </h3>

            {quizzes.length === 0 ? (
              <Card className="bg-neutral-900/30 text-center p-6 text-xs text-neutral-500">
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
                          ? "bg-neutral-900 border-neutral-700 shadow-lg"
                          : "bg-neutral-900/40 border-neutral-800/80 hover:bg-neutral-900/70"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="font-semibold text-sm text-neutral-100 line-clamp-1">
                            {q.title}
                          </h4>
                          <span className="text-[11px] text-neutral-500 font-mono">
                            {new Date(q.createdAt).toLocaleDateString("id-ID")}
                          </span>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteQuiz(q.id);
                          }}
                          className="text-neutral-500 hover:text-red-400 p-1 transition-colors"
                          title="Hapus Kuis"
                        >
                          <Delete02Icon className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="flex items-center justify-between text-xs text-neutral-400 font-mono pt-1">
                        <span>{submissionCount} Peserta</span>
                        <span className={totalViolations > 0 ? "text-red-400 font-bold" : "text-neutral-500"}>
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
                <Card className="bg-neutral-900/60 space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800 pb-4">
                    <div>
                      <span className="text-xs uppercase tracking-wider text-neutral-400">
                        Kuis Terpilih
                      </span>
                      <h3 className="font-serif text-2xl font-medium text-white">
                        {selectedQuiz.title}
                      </h3>
                    </div>

                    <a
                      href={`/api/export?quizId=${selectedQuiz.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button variant="primary" size="md" className="shrink-0">
                        <Download01Icon className="w-4 h-4" />
                        {t.exportExcel}
                      </Button>
                    </a>
                  </div>

                  {/* Shareable Link & QR Code Display */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                    <div className="md:col-span-8 space-y-3">
                      <label className="text-xs font-medium text-neutral-300">
                        Link Akses Peserta (Dengan Proteksi Anti-Cheat)
                      </label>
                      <p className="font-mono text-xs text-neutral-200 break-all bg-neutral-950 p-3 rounded-xl border border-neutral-800 select-all">
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
                              <CheckmarkCircle01Icon className="w-4 h-4 text-emerald-400" />
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

                    <div className="md:col-span-4 flex flex-col items-center justify-center p-4 bg-neutral-950 rounded-2xl border border-neutral-800">
                      <QRCodeSVG
                        value={getQuizFullUrl(selectedQuiz)}
                        size={130}
                        bgColor="#09090b"
                        fgColor="#f5f5f5"
                        level="H"
                      />
                      <span className="text-[11px] font-mono text-neutral-500 mt-2">
                        Scan QR Code
                      </span>
                    </div>
                  </div>
                </Card>

                {/* Participant Submissions & Violations Table */}
                <Card className="bg-neutral-900/40 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-serif text-lg font-medium text-white flex items-center gap-2">
                      <UserIcon className="w-4 h-4 text-neutral-400" />
                      {t.participantResults}
                    </h4>
                    <span className="text-xs font-mono text-neutral-400">
                      Total: {selectedQuiz.submissions.length} Peserta
                    </span>
                  </div>

                  {selectedQuiz.submissions.length === 0 ? (
                    <div className="p-8 text-center text-xs text-neutral-500 border border-dashed border-neutral-800 rounded-2xl">
                      {t.noParticipants}
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs font-sans">
                        <thead className="bg-neutral-950 border-b border-neutral-800 text-neutral-400 uppercase text-[10px] font-mono tracking-wider">
                          <tr>
                            <th className="p-3 pl-4">No.</th>
                            <th className="p-3">{t.participantName}</th>
                            <th className="p-3">{t.violations}</th>
                            <th className="p-3">{t.status}</th>
                            <th className="p-3">{t.startedAt}</th>
                            <th className="p-3 pr-4">{t.lastActive}</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-800/60">
                          {selectedQuiz.submissions.map((sub, idx) => {
                            const hasViolation = sub.violationCount > 0;
                            const highRisk = sub.violationCount >= 5;

                            return (
                              <tr key={sub.id} className="hover:bg-neutral-900/80 transition-colors">
                                <td className="p-3 pl-4 font-mono text-neutral-500">{idx + 1}</td>
                                <td className="p-3 font-semibold text-neutral-100">
                                  {sub.participantName}
                                </td>
                                <td className="p-3 font-mono font-bold">
                                  <span
                                    className={`px-2.5 py-1 rounded-lg border text-xs ${
                                      hasViolation
                                        ? "bg-red-950/80 border-red-800/80 text-red-400"
                                        : "bg-neutral-950 border-neutral-800 text-neutral-300"
                                    }`}
                                  >
                                    {sub.violationCount}
                                  </span>
                                </td>
                                <td className="p-3">
                                  {highRisk ? (
                                    <span className="px-2 py-0.5 rounded-full bg-red-950 border border-red-800 text-red-400 text-[11px] font-medium">
                                      {t.riskHigh}
                                    </span>
                                  ) : hasViolation ? (
                                    <span className="px-2 py-0.5 rounded-full bg-amber-950 border border-amber-800 text-amber-400 text-[11px] font-medium">
                                      {t.riskWarning}
                                    </span>
                                  ) : (
                                    <span className="px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-800 text-emerald-400 text-[11px] font-medium">
                                      {t.riskNormal}
                                    </span>
                                  )}
                                </td>
                                <td className="p-3 font-mono text-neutral-400">
                                  {new Date(sub.startedAt).toLocaleTimeString("id-ID", {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </td>
                                <td className="p-3 pr-4 font-mono text-neutral-400">
                                  {new Date(sub.lastActiveAt).toLocaleTimeString("id-ID", {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
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
              <Card className="bg-neutral-900/30 p-12 text-center text-sm text-neutral-400 space-y-3">
                <AlertCircleIcon className="w-8 h-8 text-neutral-500 mx-auto" />
                <p>Pilih kuis dari daftar di sebelah kiri untuk melihat QR Code dan hasil pelanggaran peserta.</p>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
