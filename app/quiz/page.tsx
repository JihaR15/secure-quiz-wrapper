"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { decodeFormUrl } from "@/lib/url";
import { ViolationModal } from "@/components/quiz/violation-modal";
import { SecurityBadge } from "@/components/quiz/violation-badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield01Icon, ArrowLeft01Icon, AlertCircleIcon } from "hugeicons-react";

function QuizContent() {
  const searchParams = useSearchParams();
  const rawFormParam = searchParams.get("form");

  const [targetUrl, setTargetUrl] = useState<string>("");
  const [violationCount, setViolationCount] = useState<number>(0);
  const [isBlocked, setIsBlocked] = useState<boolean>(false);

  useEffect(() => {
    if (rawFormParam) {
      const decoded = decodeFormUrl(rawFormParam);
      setTargetUrl(decoded);
    } else {
      // Default sample form for direct preview
      const defaultSample = "https://docs.google.com/forms/d/e/1FAIpQLScf3nF9U3sR_SampleAssessment/viewform?embedded=true";
      setTargetUrl(defaultSample);
    }
  }, [rawFormParam]);

  // Anti-Cheat Event Listeners
  useEffect(() => {
    const triggerViolation = () => {
      setViolationCount((prev) => prev + 1);
      setIsBlocked(true);
    };

    // 1. Tab visibility change listener
    const handleVisibilityChange = () => {
      if (document.hidden) {
        triggerViolation();
      }
    };

    // 2. Window blur listener (alt-tab or clicking outside browser)
    const handleWindowBlur = () => {
      triggerViolation();
    };

    // 3. Prevent context menu (right click)
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    // 4. Prevent copy, cut, paste
    const handleCopyCutPaste = (e: ClipboardEvent) => {
      e.preventDefault();
    };

    // 5. Intercept key combinations (F12, Ctrl+C, Ctrl+V, Ctrl+U, etc.)
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
  }, []);

  const handleAcknowledge = () => {
    setIsBlocked(false);
  };

  return (
    <div className="relative w-screen h-screen max-w-[100vw] overflow-hidden bg-neutral-950 select-none">
      {/* Security Status Floating Badge */}
      <SecurityBadge violationCount={violationCount} />

      {/* Embedded Quiz Iframe */}
      {targetUrl ? (
        <iframe
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
                No Assessment Target Specified
              </h2>
              <p className="text-xs text-neutral-400 leading-relaxed font-sans">
                Please provide a valid form link encoded in the query parameters or generate one using the Admin Console.
              </p>
            </div>
            <Link href="/admin">
              <Button variant="primary" size="md" className="w-full">
                <ArrowLeft01Icon className="w-4 h-4" />
                Go to Admin Console
              </Button>
            </Link>
          </Card>
        </div>
      )}

      {/* Strict Violation Warning Modal Overlay */}
      <ViolationModal
        isOpen={isBlocked}
        violationCount={violationCount}
        onAcknowledge={handleAcknowledge}
      />
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
