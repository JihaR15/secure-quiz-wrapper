"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { decodeFormUrl } from "@/lib/url";
import { ViolationToast } from "@/components/quiz/violation-toast";
import { SecurityBadge } from "@/components/quiz/violation-badge";
import { NameGateModal } from "@/components/quiz/name-gate-modal";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { LanguageToggle } from "@/components/site/language-toggle";
import { useLanguage } from "@/components/providers";
import {
  Alert02Icon,
  ArrowLeft01Icon,
  CheckmarkCircle01Icon,
  StopCircleIcon,
} from "hugeicons-react";

const VIOLATION_COOLDOWN_MS = 1500;
const FOCUS_SETTLE_MS = 150;
const GRACE_PERIOD_MS = 3000;

function QuizContent() {
  const searchParams = useSearchParams();
  const rawFormParam = searchParams.get("form");
  const quizIdParam = searchParams.get("id");
  const { t, language } = useLanguage();

  const [participantName, setParticipantName] = useState<string>("");
  const [submissionId, setSubmissionId] = useState<string | null>(null);
  const [isNameGateOpen, setIsNameGateOpen] = useState<boolean>(true);
  const [violationCount, setViolationCount] = useState<number>(0);
  const [showToast, setShowToast] = useState<boolean>(false);
  const [showFinishConfirm, setShowFinishConfirm] = useState<boolean>(false);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const lastViolationTimeRef = useRef<number>(0);
  const isGracePeriodRef = useRef<boolean>(true);

  const targetUrl = React.useMemo(
    () =>
      rawFormParam
        ? decodeFormUrl(rawFormParam)
        : "https://docs.google.com/forms/d/e/1FAIpQLScf3nF9U3sR_SampleAssessment/viewform?embedded=true",
    [rawFormParam],
  );

  const handleNameSubmit = async (name: string) => {
    setParticipantName(name);
    setIsNameGateOpen(false);

    // Let focus settle after the modal closes before arming detection.
    isGracePeriodRef.current = true;
    window.setTimeout(() => {
      isGracePeriodRef.current = false;
    }, GRACE_PERIOD_MS);

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
      // Non-fatal: the session still runs, it just cannot sync violations.
    }
  };

  const handleConfirmFinish = () => {
    if (typeof document !== "undefined" && document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }
    setShowFinishConfirm(false);
    setIsCompleted(true);
  };

  useEffect(() => {
    if (isNameGateOpen || isCompleted) return;

    const syncViolation = (count: number) => {
      if (!submissionId) return;
      fetch("/api/submissions", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ submissionId, violationCount: count }),
      }).catch(() => {});
    };

    const triggerViolation = () => {
      if (isGracePeriodRef.current) return;

      const now = Date.now();
      if (now - lastViolationTimeRef.current < VIOLATION_COOLDOWN_MS) return;
      lastViolationTimeRef.current = now;

      setViolationCount((previous) => {
        const next = previous + 1;
        syncViolation(next);
        return next;
      });
      setShowToast(true);
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") triggerViolation();
    };

    const handlePageHide = () => triggerViolation();

    const handleWindowBlur = () => {
      window.setTimeout(() => {
        if (document.visibilityState === "hidden" || !document.hasFocus()) {
          triggerViolation();
          return;
        }
        // Focus moving into the embedded form is expected, not a violation.
        const active = document.activeElement;
        if (active && (active.tagName === "IFRAME" || active === iframeRef.current)) {
          return;
        }
        triggerViolation();
      }, FOCUS_SETTLE_MS);
    };

    const preventContextMenu = (event: MouseEvent) => event.preventDefault();
    const preventClipboard = (event: ClipboardEvent) => event.preventDefault();

    const blockedKeys = ["c", "v", "x", "u", "s", "p", "a"];
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "F12") {
        event.preventDefault();
        return;
      }
      const withModifier = event.ctrlKey || event.metaKey;
      if (withModifier && blockedKeys.includes(event.key.toLowerCase())) {
        event.preventDefault();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("pagehide", handlePageHide);
    window.addEventListener("blur", handleWindowBlur);
    document.addEventListener("contextmenu", preventContextMenu);
    document.addEventListener("copy", preventClipboard);
    document.addEventListener("cut", preventClipboard);
    document.addEventListener("paste", preventClipboard);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("pagehide", handlePageHide);
      window.removeEventListener("blur", handleWindowBlur);
      document.removeEventListener("contextmenu", preventContextMenu);
      document.removeEventListener("copy", preventClipboard);
      document.removeEventListener("cut", preventClipboard);
      document.removeEventListener("paste", preventClipboard);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isNameGateOpen, isCompleted, submissionId]);

  const locale = language === "id" ? "id-ID" : "en-GB";
  const startedAtLabel = isCompleted
    ? new Date().toLocaleString(locale, {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : "";

  if (isCompleted) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-background px-4 py-10">
        <div className="w-full max-w-md space-y-7 rounded-xl border border-border bg-card p-7 text-center">
          <CheckmarkCircle01Icon className="mx-auto size-9 text-success" />
          <div className="space-y-2">
            <h1 className="font-display text-2xl font-medium tracking-[-0.02em]">
              {t.completedTitle}
            </h1>
            <p className="text-pretty text-sm leading-relaxed text-muted-foreground">
              {t.completedBody}
            </p>
          </div>

          <dl className="divide-y divide-border overflow-hidden rounded-lg border border-border text-left font-mono text-xs">
            <div className="flex items-baseline justify-between gap-4 px-3.5 py-2.5">
              <dt className="text-muted-foreground">{t.participantName}</dt>
              <dd className="truncate font-medium">{participantName}</dd>
            </div>
            <div className="flex items-baseline justify-between gap-4 px-3.5 py-2.5">
              <dt className="text-muted-foreground">{t.violations}</dt>
              <dd
                className={
                  violationCount > 0 ? "font-medium text-destructive" : "font-medium text-success"
                }
              >
                {violationCount}
              </dd>
            </div>
            {startedAtLabel ? (
              <div className="flex items-baseline justify-between gap-4 px-3.5 py-2.5">
                <dt className="text-muted-foreground">{t.startedAt}</dt>
                <dd className="tabular-nums text-muted-foreground">{startedAtLabel}</dd>
              </div>
            ) : null}
          </dl>

          <Button asChild className="h-10 w-full gap-2">
            <Link href="/">
              <ArrowLeft01Icon className="size-4" />
              {t.backHome}
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-svh w-full overflow-hidden bg-background select-none">
      <NameGateModal isOpen={isNameGateOpen} onSubmit={handleNameSubmit} />

      {/* Finish sits on the left so the dominant hand never crosses the form;
          the language switch and the live counter stay on the right. */}
      {!isNameGateOpen ? (
        <>
          <div className="fixed top-3 left-3 z-30 sm:top-4 sm:left-4">
            <Button
              type="button"
              variant="destructive"
              onClick={() => setShowFinishConfirm(true)}
              title={t.finishExam}
              className="h-10 gap-1.5 rounded-lg bg-destructive/90 px-3 text-sm font-medium text-destructive-foreground shadow-none backdrop-blur-md hover:bg-destructive sm:h-9 sm:gap-2 sm:px-3.5"
            >
              <StopCircleIcon className="size-4" />
              <span>{t.finishShort}</span>
            </Button>
          </div>

          <div className="fixed top-3 right-3 z-30 flex items-center gap-2 sm:top-4 sm:right-4 sm:gap-1.5">
            <LanguageToggle className="h-10 rounded-lg border border-border bg-background/90 px-3 backdrop-blur-md sm:h-8" />
            <SecurityBadge violationCount={violationCount} />
          </div>
        </>
      ) : null}

      <Dialog open={showFinishConfirm} onOpenChange={setShowFinishConfirm}>
        <DialogContent className="max-w-sm border-border bg-card">
          <DialogHeader className="space-y-3 text-left">
            <Alert02Icon className="size-6 text-warning" />
            <DialogTitle className="font-display text-xl font-medium tracking-[-0.02em]">
              {t.finishConfirmTitle}
            </DialogTitle>
            <DialogDescription className="text-pretty text-sm leading-relaxed">
              {t.finishConfirmBody}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowFinishConfirm(false)}>
              {t.cancel}
            </Button>
            <Button onClick={handleConfirmFinish}>{t.finishConfirmYes}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ViolationToast
        show={showToast}
        violationCount={violationCount}
        onClose={() => setShowToast(false)}
      />

      {isNameGateOpen && targetUrl ? (
        // The form is only mounted after consent, so the gate sits on a plain canvas.
        <div className="size-full bg-background" />
      ) : targetUrl ? (
        <iframe
          ref={iframeRef}
          src={targetUrl}
          title={t.appName}
          className="size-full border-0 bg-white"
          sandbox="allow-forms allow-scripts allow-same-origin allow-popups"
        />
      ) : (
        <div className="flex size-full items-center justify-center bg-background px-4">
          <div className="w-full max-w-md space-y-6 rounded-xl border border-border bg-card p-7 text-center">
            <Alert02Icon className="mx-auto size-7 text-muted-foreground" />
            <div className="space-y-2">
              <h1 className="font-display text-xl font-medium tracking-[-0.02em]">
                {t.noTargetTitle}
              </h1>
              <p className="text-pretty text-sm leading-relaxed text-muted-foreground">
                {t.noTargetSub}
              </p>
            </div>
            <Button asChild variant="outline" className="h-10 w-full gap-2">
              <Link href="/admin">
                <ArrowLeft01Icon className="size-4" />
                {t.adminConsole}
              </Link>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function QuizPage() {
  const { t } = useLanguage();

  return (
    <Suspense
      fallback={
        <div className="flex h-svh items-center justify-center bg-background font-mono text-xs tracking-[0.12em] text-muted-foreground">
          {t.loadingSession}
        </div>
      }
    >
      <QuizContent />
    </Suspense>
  );
}
