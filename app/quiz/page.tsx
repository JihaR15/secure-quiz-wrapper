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
import { Shield01Icon, ArrowLeft01Icon, AlertCircleIcon, Globe02Icon } from "hugeicons-react";
import { Language, translations } from "@/lib/i18n";

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
  const [showToast, setShowToast] = useState<boolean>(false);

  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const lastViolationTimeRef = useRef<number>(0);
  const isGracePeriodRef = useRef<boolean>(true);

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

  // Handle participant name submission
  const handleNameSubmit = async (name: string) => {
    setParticipantName(name);
    setIsNameGateOpen(false);

    // Set grace period for 3 seconds after closing gate
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
        setSubmissionId(data.submission.id);
      }
    } catch {
      // Fallback
    }
  };

  // Anti-Cheat Event Listeners with Debounce and Iframe Click Protection
  useEffect(() => {
    if (isNameGateOpen) return;

    const syncViolation = (count: number) => {
      if (submissionId) {
        fetch("/api/submissions", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            submissionId,
            violationCount: count,
          }),
        }).catch(() => {});
      }
    };

    const triggerViolation = () => {
      // Ignore during initial grace period
      if (isGracePeriodRef.current) return;

      // Debounce duplicate events within 2000ms (prevents double counting on tab switch)
      const now = Date.now();
      if (now - lastViolationTimeRef.current < 2000) return;
      lastViolationTimeRef.current = now;

      setViolationCount((prev) => {
        const next = prev + 1;
        syncViolation(next);
        return next;
      });
      setShowToast(true);
    };

    // 1. Tab visibility change (document.hidden)
    const handleVisibilityChange = () => {
      if (document.hidden) {
        triggerViolation();
      }
    };

    // 2. Window blur handler (with iframe focus check)
    const handleWindowBlur = () => {
      // Small timeout check to verify if blur was caused by clicking inside the iframe form
      setTimeout(() => {
        const active = document.activeElement;
        if (active && (active.tagName === "IFRAME" || active === iframeRef.current)) {
          // Focus moved to the form iframe (User is filling out form fields!) -> DO NOT TRIGGER VIOLATION
          return;
        }
        // Focus actually left browser window or switched app
        triggerViolation();
      }, 150);
    };

    // 3. Prevent context menu
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    // 4. Prevent copy, cut, paste
    const handleCopyCutPaste = (e: ClipboardEvent) => {
      e.preventDefault();
    };

    // 5. Intercept key combinations
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === "F12" ||
        (e.ctrlKey && ["c", "v", "x", "u", "s", "p", "a"].includes(e.key.toLowerCase())) ||
        (e.metaKey && ["c", "v", "x", "u", "s", "p", "a"].includes(e.key.toLowerCase()))
      ) {
        e.preventDefault();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleWindowBlur);
    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("copy", handleCopyCutPaste);
    document.addEventListener("cut", handleCopyCutPaste);
    document.addEventListener("paste", handleCopyCutPaste);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleWindowBlur);
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("copy", handleCopyCutPaste);
      document.removeEventListener("cut", handleCopyCutPaste);
      document.removeEventListener("paste", handleCopyCutPaste);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isNameGateOpen, submissionId]);

  return (
    <div className="relative w-screen h-screen max-w-[100vw] overflow-hidden bg-neutral-950 select-none font-sans">
      {/* Name Registration & Rules Modal Gate */}
      <NameGateModal
        isOpen={isNameGateOpen}
        language={language}
        onSubmit={handleNameSubmit}
      />

      {/* Language Switcher & Security Status Floating Badge */}
      {!isNameGateOpen && (
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
      )}

      {/* Non-intrusive Violation Toast Notification */}
      <ViolationToast
        show={showToast}
        violationCount={violationCount}
        onClose={() => setShowToast(false)}
        language={language}
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
              <Button variant="primary" size="md" className="w-full">
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
