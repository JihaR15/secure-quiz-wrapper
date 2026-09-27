"use client";

import * as React from "react";
import { QRCodeSVG } from "qrcode.react";
import {
  ArrowUpRight01Icon,
  CheckmarkCircle01Icon,
  Copy01Icon,
  Download01Icon,
} from "hugeicons-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ParticipantTable } from "@/components/admin/participant-table";
import { useLanguage, useTheme } from "@/components/providers";
import { formatDate, getQuizUrl, QuizWithSubmissions } from "@/lib/quiz-format";
import type { Submission } from "@/lib/db";

type QuizDetailProps = {
  quiz: QuizWithSubmissions;
  origin: string;
  locale: string;
  copied: boolean;
  onCopy: (quiz: QuizWithSubmissions) => void;
  onRequestDeleteSubmission: (submission: Submission) => void;
};

function formHost(formUrl: string): string {
  try {
    return new URL(formUrl).hostname.replace(/^www\./, "");
  } catch {
    return "—";
  }
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: React.ReactNode;
  tone?: "danger";
}) {
  return (
    <div className="space-y-1.5">
      <p className="font-mono text-[0.6875rem] uppercase tracking-[0.12em] text-muted-foreground">
        {label}
      </p>
      <p
        className={`font-mono text-2xl leading-none tabular-nums tracking-[-0.02em] ${
          tone === "danger" ? "text-destructive" : "text-foreground"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

export function QuizDetail({
  quiz,
  origin,
  locale,
  copied,
  onCopy,
  onRequestDeleteSubmission,
}: QuizDetailProps) {
  const { t } = useLanguage();
  const { theme } = useTheme();
  const url = getQuizUrl(origin, quiz);

  const violations = quiz.submissions.reduce(
    (total, submission) => total + submission.violationCount,
    0,
  );

  return (
    <div className="space-y-8">
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 space-y-1.5">
            <p className="font-mono text-[0.6875rem] uppercase tracking-[0.16em] text-muted-foreground">
              {t.selectedQuiz}
            </p>
            <h2 className="font-display text-2xl leading-tight tracking-[-0.02em] sm:text-3xl">
              {quiz.title}
            </h2>
          </div>
          <Button asChild variant="outline" size="sm" className="h-10 shrink-0 gap-2 sm:h-8">
            <a
              href={`/api/export?quizId=${quiz.id}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Download01Icon className="size-4" />
              {t.exportExcel}
            </a>
          </Button>
        </div>

        <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-4">
          <div className="bg-card px-4 py-3.5">
            <Stat label={t.participants} value={quiz.submissions.length} />
          </div>
          <div className="bg-card px-4 py-3.5">
            <Stat
              label={t.violations}
              value={violations}
              tone={violations > 0 ? "danger" : undefined}
            />
          </div>
          <div className="bg-card px-4 py-3.5">
            <div className="space-y-1.5">
              <p className="font-mono text-[0.6875rem] uppercase tracking-[0.12em] text-muted-foreground">
                {t.targetUrl}
              </p>
              <p className="truncate font-mono text-sm tracking-[-0.01em]">
                {formHost(quiz.formUrl)}
              </p>
            </div>
          </div>
          <div className="bg-card px-4 py-3.5">
            <div className="space-y-1.5">
              <p className="font-mono text-[0.6875rem] uppercase tracking-[0.12em] text-muted-foreground">
                {t.created}
              </p>
              <p className="font-mono text-sm tracking-[-0.01em] tabular-nums">
                {formatDate(quiz.createdAt, locale)}
              </p>
            </div>
          </div>
        </dl>
      </div>

      <div className="grid gap-6 border-t border-border pt-6 lg:grid-cols-12">
        <div className="space-y-3 lg:col-span-8">
          <Label htmlFor="quiz-access-link" className="text-xs text-muted-foreground">
            {t.quizAccessLink}
          </Label>
          <p
            id="quiz-access-link"
            className="select-all break-all rounded-lg border border-border bg-muted/40 px-3.5 py-2.5 font-mono text-xs leading-relaxed"
          >
            {url}
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              onClick={() => onCopy(quiz)}
              variant="outline"
              size="sm"
              className="h-10 gap-2 sm:h-8"
            >
              {copied ? (
                <CheckmarkCircle01Icon className="size-4 text-success" />
              ) : (
                <Copy01Icon className="size-4" />
              )}
              {copied ? t.linkCopied : t.copyQuizLink}
            </Button>
            <Button asChild variant="ghost" size="sm" className="h-10 gap-2 sm:h-8">
              <a href={url} target="_blank" rel="noopener noreferrer">
                {t.testQuizSession}
                <ArrowUpRight01Icon className="size-4" />
              </a>
            </Button>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-border bg-muted/30 px-4 py-5 lg:col-span-4">
          <QRCodeSVG
            value={url}
            size={128}
            level="H"
            bgColor="transparent"
            fgColor={theme === "dark" ? "#e8e8e4" : "#12120f"}
          />
          <p className="font-mono text-[0.6875rem] uppercase tracking-[0.14em] text-muted-foreground">
            {t.scanQrCode}
          </p>
        </div>
      </div>

      <div className="space-y-4 border-t border-border pt-6">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h3 className="text-sm font-semibold tracking-[-0.01em]">
            {t.participantResults}
          </h3>
          <Badge variant="outline" className="font-mono text-[0.6875rem] tabular-nums text-muted-foreground">
            {quiz.submissions.length} {t.participants.toLowerCase()}
          </Badge>
        </div>
        <ParticipantTable
          submissions={quiz.submissions}
          locale={locale}
          onRequestDelete={onRequestDeleteSubmission}
        />
      </div>
    </div>
  );
}
