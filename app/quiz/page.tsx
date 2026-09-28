"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { decodeFormUrl } from "@/lib/url";
import { ViolationToast } from "@/components/quiz/violation-toast";
import { SecurityBadge } from "@/components/quiz/violation-badge";
import { NameGateModal } from "@/components/quiz/name-gate-modal";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Shield01Icon,
  ArrowLeft01Icon,
  AlertCircleIcon,
  Globe02Icon,
  CheckmarkCircle01Icon,
  Logout01Icon,
} from "hugeicons-react";
import { Language, translations } from "@/lib/i18n";
import { ViolationBreakdown, ViolationType } from "@/lib/types";

function QuizContent() {
  const searchParams = useSearchParams();
  const rawFormParam = searchParams.get("form");
  const quizIdParam = searchParams.get("id");

  const [language, setLanguage] = useState<Language>("id");
  const [targetUrl, setTargetUrl] = useState<string>("");
  const [participantName, setParticipantName] = useState<string>("");
  const [submissionId, setSubmissionId] = useState<string | null>(null);
  const [isNameGateOpen, setIsNameGateOpen] = useState<boolean>(true);
  const [violationCount, setViolationCount] = useState<number>(0);
  const [violationBreakdown, setViolationBreakdown] = useState<ViolationBreakdown>({
    tab: 0,
    window: 0,
    clipboard: 0,
    contextmenu: 0,
  });
  const [showToast, setShowToast] = useState<boolean>(false);
  const [lastViolationType, setLastViolationType] = useState<ViolationType>("tab");
  const [showFinishConfirm, setShowFinishConfirm] = useState<boolean>(false);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const lastViolationTimeRef = useRef<number>(0);
  const lastTabSwitchTimeRef = useRef<number>(0);
  const isGracePeriodRef = useRef<boolean>(true);
  const showFinishConfirmRef = useRef<boolean>(false);
  const lastFinishCancelTimeRef = useRef<number>(0);
  const isCompletedRef = useRef<boolean>(false);

  const t = translations[language];

  useEffect(() => {
    if (rawFormParam) {
      const decoded = decodeFormUrl(rawFormParam);
      setTargetUrl(decoded);
    } else {
      const defaultSample = "https://docs.google.com/forms/d/e/1FAIpQLScf3nF9U3sR_SampleAssessment/viewform?embedded=true";
      setTargetUrl(defaultSample);
    }
  }, [rawFormParam]);

  // Session restoration on page refresh
  useEffect(() => {
    if (typeof window === "undefined") return;
    const storageKey = `quiz_session_${quizIdParam || "default"}`;

    try {
      const saved = sessionStorage.getItem(storageKey) || localStorage.getItem(storageKey);
      if (saved) {
        const data = JSON.parse(saved);
        if (data && data.participantName && data.submissionId) {
          setParticipantName(data.participantName);
          setSubmissionId(data.submissionId);
          setViolationCount(data.violationCount || 0);
          if (data.violationBreakdown) {
            setViolationBreakdown(data.violationBreakdown);
          }
          setIsNameGateOpen(false);

          // 3-second grace period after session restoration
          isGracePeriodRef.current = true;
          setTimeout(() => {
            isGracePeriodRef.current = false;
          }, 3000);
        }
      }
    } catch {
      // Storage unavailable or parsing error
    }
  }, [quizIdParam]);

  // Handle participant name submission
  const handleNameSubmit = async (name: string) => {
    setParticipantName(name);
    setIsNameGateOpen(false);

    // Initial grace period (3 seconds) to settle focus after starting
    isGracePeriodRef.current = true;
    setTimeout(() => {
      isGracePeriodRef.current = false;
    }, 3000);

    try {
      const res = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quizId: quizIdParam || "default_quiz",
          participantName: name,
        }),
      });
      const data = await res.json();
      if (data.success && data.submission) {
        const subId = data.submission.id;
        setSubmissionId(subId);

        const storageKey = `quiz_session_${quizIdParam || "default"}`;
        const sessionPayload = {
          submissionId: subId,
          participantName: name,
          quizId: quizIdParam || "default_quiz",
          violationCount: 0,
          violationBreakdown: { tab: 0, window: 0, clipboard: 0, contextmenu: 0 },
        };
        try {
          sessionStorage.setItem(storageKey, JSON.stringify(sessionPayload));
          localStorage.setItem(storageKey, JSON.stringify(sessionPayload));
        } catch {}
      }
    } catch {
      // Fallback
    }
  };

  // Finish exam handlers
  const handleOpenFinish = () => {
    showFinishConfirmRef.current = true;
    setShowFinishConfirm(true);
  };

  const handleCancelFinish = () => {
    showFinishConfirmRef.current = false;
    lastFinishCancelTimeRef.current = Date.now();
    setShowFinishConfirm(false);
  };

  const handleConfirmFinish = () => {
    isCompletedRef.current = true;
    setIsCompleted(true);
    showFinishConfirmRef.current = false;
    setShowFinishConfirm(false);

    if (typeof document !== "undefined" && document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }

    const storageKey = `quiz_session_${quizIdParam || "default"}`;
    try {
      sessionStorage.removeItem(storageKey);
      localStorage.removeItem(storageKey);
    } catch {}
  };

  const syncViolation = React.useCallback(
    (count: number, breakdown: ViolationBreakdown) => {
      if (isCompletedRef.current) return;

      const storageKey = `quiz_session_${quizIdParam || "default"}`;
      if (participantName && submissionId) {
        try {
          const payload = {
            submissionId,
            participantName,
            quizId: quizIdParam || "default_quiz",
            violationCount: count,
            violationBreakdown: breakdown,
          };
          sessionStorage.setItem(storageKey, JSON.stringify(payload));
          localStorage.setItem(storageKey, JSON.stringify(payload));
        } catch {}
      }

      if (submissionId) {
        fetch("/api/submissions", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            submissionId,
            violationCount: count,
            violationBreakdown: breakdown,
          }),
        }).catch(() => {});
      }
    },
    [submissionId, participantName, quizIdParam],
  );

  const triggerViolation = React.useCallback(
    (type: ViolationType) => {
      if (isGracePeriodRef.current || showFinishConfirmRef.current || isCompletedRef.current) return;
      if (Date.now() - lastFinishCancelTimeRef.current < 2000) return;

      const now = Date.now();
      if (now - lastViolationTimeRef.current < 1200) return;
      lastViolationTimeRef.current = now;

      setLastViolationType(type);
      setViolationCount((prevCount) => {
        const nextCount = prevCount + 1;
        setViolationBreakdown((prevBreakdown) => {
          const nextBreakdown = {
            ...prevBreakdown,
            [type]: (prevBreakdown[type] || 0) + 1,
          };
          syncViolation(nextCount, nextBreakdown);
          return nextBreakdown;
        });
        return nextCount;
      });

      setShowToast(true);
    },
    [syncViolation],
  );

  // Anti-Cheat Event Listeners for Tab Switch, Alt+Tab, Copy/Paste, Right-Click, and Mobile Long-Press
  useEffect(() => {
    if (isNameGateOpen || isCompleted) return;

    // 1. Tab switch (visibilitychange)
    const handleVisibilityChange = () => {
      if (document.hidden || document.visibilityState === "hidden") {
        lastTabSwitchTimeRef.current = Date.now();
        triggerViolation("tab");
      }
    };

    // 2. Mobile app backgrounding (pagehide)
    const handlePageHide = () => {
      triggerViolation("tab");
    };

    // 3. Alt+Tab / Window focus loss handler (Pindah Window)
    const handleWindowBlur = () => {
      setTimeout(() => {
        if (isGracePeriodRef.current || showFinishConfirmRef.current || isCompletedRef.current) return;
        if (Date.now() - lastFinishCancelTimeRef.current < 2000) return;

        // If visibilitychange already recorded a tab switch in the last 400ms, ignore window blur
        if (Date.now() - lastTabSwitchTimeRef.current < 400) {
          return;
        }

        if (!document.hasFocus()) {
          triggerViolation("window");
        }
      }, 150);
    };

    // 4. Context menu (Right-click & mobile long-press menu)
    const handleContextMenu = (e: Event) => {
      e.preventDefault();
      triggerViolation("contextmenu");
    };

    // 5. Mouse right-click interceptor (button === 2)
    const handleMouseDownUp = (e: MouseEvent) => {
      if (e.button === 2) {
        e.preventDefault();
        triggerViolation("contextmenu");
      }
    };

    // 6. Copy, cut, paste interceptor
    const handleCopyCutPaste = (e: Event) => {
      e.preventDefault();
      triggerViolation("clipboard");
    };

    // 7. Mobile long-press detector ("tahan di HP")
    let touchTimer: NodeJS.Timeout | null = null;
    let startX = 0;
    let startY = 0;

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length > 1) {
        triggerViolation("contextmenu");
        return;
      }
      const touch = e.touches[0];
      if (touch) {
        startX = touch.clientX;
        startY = touch.clientY;
      }
      if (touchTimer) clearTimeout(touchTimer);
      touchTimer = setTimeout(() => {
        triggerViolation("contextmenu");
      }, 400);
    };

    const handleTouchMove = (e: TouchEvent) => {
      const touch = e.touches[0];
      if (touch) {
        const deltaX = Math.abs(touch.clientX - startX);
        const deltaY = Math.abs(touch.clientY - startY);
        if (deltaX > 8 || deltaY > 8) {
          if (touchTimer) clearTimeout(touchTimer);
        }
      }
    };

    const handleTouchEndCancel = () => {
      if (touchTimer) clearTimeout(touchTimer);
    };

    // 8. Intercept keyboard shortcuts
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (
        key === "f12" ||
        key === "contextmenu" ||
        (e.ctrlKey && ["c", "v", "x", "u", "s", "p", "a"].includes(key)) ||
        (e.metaKey && ["c", "v", "x", "u", "s", "p", "a"].includes(key)) ||
        (e.shiftKey && (key === "insert" || key === "f10"))
      ) {
        e.preventDefault();
        e.stopPropagation();
        triggerViolation(key === "c" || key === "v" || key === "x" ? "clipboard" : "contextmenu");
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange, true);
    window.addEventListener("pagehide", handlePageHide, true);
    window.addEventListener("blur", handleWindowBlur, true);
    window.addEventListener("contextmenu", handleContextMenu, true);
    document.addEventListener("contextmenu", handleContextMenu, true);
    window.addEventListener("mousedown", handleMouseDownUp, true);
    window.addEventListener("mouseup", handleMouseDownUp, true);
    window.addEventListener("copy", handleCopyCutPaste, true);
    window.addEventListener("cut", handleCopyCutPaste, true);
    window.addEventListener("paste", handleCopyCutPaste, true);
    document.addEventListener("copy", handleCopyCutPaste, true);
    document.addEventListener("cut", handleCopyCutPaste, true);
    document.addEventListener("paste", handleCopyCutPaste, true);
    window.addEventListener("keydown", handleKeyDown, true);
    window.addEventListener("touchstart", handleTouchStart, true);
    window.addEventListener("touchmove", handleTouchMove, true);
    window.addEventListener("touchend", handleTouchEndCancel, true);
    window.addEventListener("touchcancel", handleTouchEndCancel, true);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange, true);
      window.removeEventListener("pagehide", handlePageHide, true);
      window.removeEventListener("blur", handleWindowBlur, true);
      window.removeEventListener("contextmenu", handleContextMenu, true);
      document.removeEventListener("contextmenu", handleContextMenu, true);
      window.removeEventListener("mousedown", handleMouseDownUp, true);
      window.removeEventListener("mouseup", handleMouseDownUp, true);
      window.removeEventListener("copy", handleCopyCutPaste, true);
      window.removeEventListener("cut", handleCopyCutPaste, true);
      window.removeEventListener("paste", handleCopyCutPaste, true);
      document.removeEventListener("copy", handleCopyCutPaste, true);
      document.removeEventListener("cut", handleCopyCutPaste, true);
      document.removeEventListener("paste", handleCopyCutPaste, true);
      window.removeEventListener("keydown", handleKeyDown, true);
      window.removeEventListener("touchstart", handleTouchStart, true);
      window.removeEventListener("touchmove", handleTouchMove, true);
      window.removeEventListener("touchend", handleTouchEndCancel, true);
      window.removeEventListener("touchcancel", handleTouchEndCancel, true);
      if (touchTimer) clearTimeout(touchTimer);
    };
  }, [isNameGateOpen, isCompleted, submissionId, triggerViolation]);

  // Thank You Screen after completion
  if (isCompleted) {
    return (
      <div className="w-screen h-screen max-w-[100vw] bg-neutral-950 flex items-center justify-center p-6 font-sans">
        <Card className="max-w-md w-full bg-neutral-900 border-neutral-800 text-center p-8 space-y-6 shadow-2xl">
          <div className="w-16 h-16 rounded-3xl bg-emerald-950/80 border border-emerald-800/80 flex items-center justify-center text-emerald-400 mx-auto">
            <CheckmarkCircle01Icon className="w-8 h-8 stroke-[2]" />
          </div>

          <div className="space-y-2">
            <h2 className="font-serif text-2xl font-semibold text-white tracking-tight">
              {language === "id" ? "Ujian Selesai" : "Assessment Completed"}
            </h2>
            <p className="text-xs text-neutral-400 leading-relaxed">
              {language === "id"
                ? `Sesi ujian Anda telah ditutup dan jawaban tersimpan.`
                : `Your assessment session has been successfully closed and saved.`}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-2 text-xs font-mono">
            <div className="flex justify-between text-neutral-400 border-b border-neutral-900 pb-2">
              <span>{language === "id" ? "Nama peserta" : "Participant"}:</span>
              <span className="text-neutral-100 font-bold">{participantName}</span>
            </div>
            <div className="flex justify-between text-neutral-400">
              <span>{language === "id" ? "Pelanggaran Total" : "Total Violations"}:</span>
              <span className={violationCount > 0 ? "text-red-400 font-bold" : "text-emerald-400 font-bold"}>
                {violationCount}
              </span>
            </div>

            <div className="pt-2 grid grid-cols-2 gap-2 text-[11px] text-left">
              <div className="p-2 rounded-xl bg-neutral-900 border border-neutral-800 flex justify-between">
                <span className="text-neutral-400">{language === "id" ? "Pindah Tab" : "Tab Switch"}:</span>
                <span className="font-bold text-neutral-200">{violationBreakdown.tab}</span>
              </div>
              <div className="p-2 rounded-xl bg-neutral-900 border border-neutral-800 flex justify-between">
                <span className="text-neutral-400">{language === "id" ? "Pindah Window" : "Window Switch"}:</span>
                <span className="font-bold text-neutral-200">{violationBreakdown.window}</span>
              </div>
              <div className="p-2 rounded-xl bg-neutral-900 border border-neutral-800 flex justify-between">
                <span className="text-neutral-400">{language === "id" ? "Copy / Paste" : "Copy / Paste"}:</span>
                <span className="font-bold text-neutral-200">{violationBreakdown.clipboard}</span>
              </div>
              <div className="p-2 rounded-xl bg-neutral-900 border border-neutral-800 flex justify-between">
                <span className="text-neutral-400">{language === "id" ? "Klik Kanan" : "Right Click"}:</span>
                <span className="font-bold text-neutral-200">{violationBreakdown.contextmenu}</span>
              </div>
            </div>
          </div>

          <Link href="/">
            <Button variant="default" size="default" className="w-full">
              <ArrowLeft01Icon className="w-4 h-4" />
              {language === "id" ? "Kembali ke Halaman Utama" : "Return to Main Page"}
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div
      className="relative w-screen h-screen max-w-[100vw] overflow-hidden bg-neutral-950 select-none font-sans"
      style={{ WebkitUserSelect: "none", WebkitTouchCallout: "none" }}
    >
      {/* Name Registration & Rules Modal Gate */}
      <NameGateModal
        isOpen={isNameGateOpen}
        onSubmit={handleNameSubmit}
      />

      {/* Floating Header Controls */}
      {!isNameGateOpen && (
        <>
          {/* Button Keluar di sebelah Kiri */}
          <div className="fixed top-4 left-4 z-30 flex items-center gap-2">
            <Button
              variant="destructive"
              size="sm"
              onClick={handleOpenFinish}
              className="shadow-xl font-semibold text-xs py-2 px-3"
            >
              <Logout01Icon className="w-4 h-4" />
              <span className="hidden sm:inline">
                {language === "id" ? "Selesai Ujian" : "Finish Exam"}
              </span>
            </Button>
          </div>

          {/* Controls di sebelah Kanan */}
          <div className="fixed top-4 right-4 z-30 flex items-center gap-2">
            <button
              onClick={() => setLanguage((l) => (l === "id" ? "en" : "id"))}
              className="p-2 px-3 rounded-2xl bg-neutral-950/90 border border-neutral-800 shadow-xl backdrop-blur-md text-xs font-mono text-neutral-300 hover:text-white transition-colors flex items-center gap-1.5"
            >
              <Globe02Icon className="w-3.5 h-3.5 text-neutral-400" />
              {language.toUpperCase()}
            </button>
            <SecurityBadge violationCount={violationCount} />
          </div>

          {/* Floating Bottom Finish Bar (Prominent Notice) */}
          <div className="fixed bottom-4 inset-x-4 z-40 mx-auto max-w-lg animate-in slide-in-from-bottom-5 duration-300">
            <div className="flex items-center justify-between gap-3 rounded-2xl border border-emerald-500/30 bg-neutral-900/95 p-3.5 shadow-2xl backdrop-blur-xl">
              <div className="min-w-0 pl-1">
                <p className="text-xs font-semibold text-neutral-100">
                  {t.finishBarNotice}
                </p>
                <p className="truncate text-[11px] text-neutral-400">
                  {t.finishBarSub}
                </p>
              </div>
              <Button
                onClick={handleOpenFinish}
                className="shrink-0 gap-2 bg-emerald-600 font-semibold text-white hover:bg-emerald-500 shadow-md"
                size="sm"
              >
                <CheckmarkCircle01Icon className="size-4" />
                <span>{t.finishBarCta}</span>
              </Button>
            </div>
          </div>
        </>
      )}

      {/* Finish Confirmation Modal */}
      {showFinishConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/90 backdrop-blur-md animate-in fade-in duration-200">
          <Card className="max-w-md w-full bg-neutral-900 border-neutral-800 p-6 space-y-5 text-center shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-amber-950/80 border border-amber-800/80 flex items-center justify-center text-amber-400 mx-auto">
              <AlertCircleIcon className="w-6 h-6" />
            </div>

            <div className="space-y-2">
              <h3 className="font-serif text-xl font-semibold text-white">
                {language === "id" ? "Konfirmasi Selesai Ujian" : "Confirm Finish Assessment"}
              </h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                {language === "id"
                  ? "Apakah Anda sudah memastikan jawaban formulir terkirim dan ingin mengakhiri sesi ujian ini?"
                  : "Have you submitted your form answers and wish to exit this session?"}
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                size="default"
                className="w-1/2"
                onClick={handleCancelFinish}
              >
                {language === "id" ? "Batal" : "Cancel"}
              </Button>
              <Button
                variant="default"
                size="default"
                className="w-1/2 font-semibold"
                onClick={handleConfirmFinish}
              >
                {language === "id" ? "Ya, Selesai" : "Yes, Finish"}
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Non-intrusive Violation Toast Notification */}
      <ViolationToast
        show={showToast}
        violationCount={violationCount}
        onClose={() => setShowToast(false)}
      />

      {/* Embedded Quiz Iframe */}
      {targetUrl && !isNameGateOpen ? (
        <iframe
          ref={iframeRef}
          src={targetUrl}
          className="w-full h-full border-0 bg-white"
          title="Secure Assessment Session"
          sandbox="allow-forms allow-scripts allow-same-origin allow-popups"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center p-6 bg-neutral-950">
          <Card className="max-w-md w-full space-y-6 text-center p-8 bg-neutral-900 border-neutral-800">
            <div className="mx-auto w-12 h-12 rounded-2xl bg-neutral-800 flex items-center justify-center text-neutral-300">
              <AlertCircleIcon className="w-6 h-6 stroke-[1.5]" />
            </div>
            <div className="space-y-2">
              <h2 className="font-serif text-2xl font-medium text-white">
                {language === "id" ? "Target Kuis Tidak Ditemukan" : "No Assessment Target Specified"}
              </h2>
              <p className="text-xs text-neutral-400 leading-relaxed font-sans">
                {language === "id"
                  ? "Silakan buka link kuis yang diberikan oleh Admin/Pengajar Anda."
                  : "Please open a valid assessment link provided by your administrator."}
              </p>
            </div>
            <Link href="/admin">
              <Button variant="default" size="default" className="w-full">
                <ArrowLeft01Icon className="w-4 h-4" />
                {t.adminConsole}
              </Button>
            </Link>
          </Card>
        </div>
      )}
    </div>
  );
}

export default function QuizPage() {
  return (
    <Suspense
      fallback={
        <div className="w-screen h-screen bg-neutral-950 flex items-center justify-center text-neutral-400 font-sans text-sm">
          Loading Secure Assessment Environment...
        </div>
      }
    >
      <QuizContent />
    </Suspense>
  );
}
