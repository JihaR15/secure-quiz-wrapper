"use client";

import * as React from "react";
import { QRCodeSVG } from "qrcode.react";
import { toast } from "sonner";
import {
  ArrowUpRight01Icon,
  CheckmarkCircle01Icon,
  Copy01Icon,
  Download01Icon,
  Edit02Icon,
  HelpCircleIcon,
  QrCode01Icon,
  Ticket01Icon,
} from "hugeicons-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { ParticipantTable } from "@/components/admin/participant-table";
import { useLanguage, useTheme } from "@/components/providers";
import { formatDate, getQuizUrl, QuizWithSubmissions } from "@/lib/quiz-format";
import { describeResultHost, isHttpUrl } from "@/lib/result-url";
import { downloadQrPng } from "@/lib/download-qr";
import type { Submission } from "@/lib/db";

type QuizDetailProps = {
  quiz: QuizWithSubmissions;
  origin: string;
  locale: string;
  copied: boolean;
  onCopy: (quiz: QuizWithSubmissions) => void;
  onRequestDeleteSubmission: (submission: Submission) => void;
  onUpdateResultUrl: (quizId: string, resultUrl: string) => Promise<boolean>;
  onUpdateStealthMode?: (quizId: string, isStealthMode: boolean) => Promise<boolean>;
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
  onUpdateResultUrl,
  onUpdateStealthMode,
}: QuizDetailProps) {
  const { t } = useLanguage();
  const { theme } = useTheme();
  const url = getQuizUrl(origin, quiz);

  const [editingResult, setEditingResult] = React.useState(false);
  const [resultDraft, setResultDraft] = React.useState(quiz.resultUrl ?? "");
  const [savingResult, setSavingResult] = React.useState(false);
  const [resultError, setResultError] = React.useState("");
  const [optimisticStealth, setOptimisticStealth] = React.useState<boolean | null>(null);
  const [updatingStealth, setUpdatingStealth] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState("access");

  const isStealth = optimisticStealth ?? (quiz.isStealthMode ?? false);

  async function handleToggleStealth(checked: boolean) {
    if (!onUpdateStealthMode || updatingStealth) return;
    setUpdatingStealth(true);
    setOptimisticStealth(checked);
    const success = await onUpdateStealthMode(quiz.id, checked);
    setOptimisticStealth(null);
    if (!success) {
      toast.error(t.toastNetworkError);
    } else {
      toast.success(t.stealthModeUpdated);
    }
    setUpdatingStealth(false);
  }

  const violations = quiz.submissions.reduce(
    (total, submission) => total + submission.violationCount,
    0,
  );

  async function handleSaveResultUrl() {
    const next = resultDraft.trim();
    if (next && !isHttpUrl(next)) {
      setResultError(t.resultUrlInvalid);
      return;
    }

    setSavingResult(true);
    setResultError("");
    const saved = await onUpdateResultUrl(quiz.id, next);
    setSavingResult(false);

    if (saved) {
      setEditingResult(false);
      toast.success(next ? t.resultUrlSaved : t.resultUrlCleared);
    } else {
      setResultError(t.toastCreateFailed);
    }
  }

  async function handleDownloadQr() {
    try {
      const slug =
        quiz.title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "") || "quiz";
      await downloadQrPng(url, `qr-${slug}.png`);
      toast.success(t.qrDownloaded);
    } catch {
      toast.error(t.toastNetworkError);
    }
  }

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
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            {quiz.resultUrl ? (
              <Button
                asChild
                variant="outline"
                size="sm"
                className="h-10 gap-2 sm:h-8"
                title={t.openInNewTab}
              >
                <a href={quiz.resultUrl} target="_blank" rel="noopener noreferrer">
                  <Ticket01Icon className="size-4" />
                  {t.viewResults}
                </a>
              </Button>
            ) : null}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setResultDraft(quiz.resultUrl ?? "");
                setEditingResult((value) => !value);
                setResultError("");
              }}
              className="h-10 gap-2 sm:h-8"
              title={t.editResultLink}
            >
              <Edit02Icon className="size-4" />
              {t.editResultLink}
            </Button>
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

      {/* Tab Switcher: Akses Kuis vs Hasil & Pelanggaran */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <TabsList className="h-10 p-1 bg-muted/60">
            <TabsTrigger value="access" className="gap-2 px-3.5 text-xs font-medium">
              <QrCode01Icon className="size-3.5" />
              <span>{t.tabAccess}</span>
            </TabsTrigger>
            <TabsTrigger value="results" className="gap-2 px-3.5 text-xs font-medium">
              <span>{t.tabResults}</span>
              <span className="rounded-full bg-primary/10 px-2 py-0.5 font-mono text-[0.6875rem] font-semibold text-primary tabular-nums">
                {quiz.submissions.length}
              </span>
            </TabsTrigger>
          </TabsList>

          {/* Stealth Mode (Mode Sembunyi) Toggle di sebelah kanan sejajar tab */}
          <div className="flex items-center gap-2.5 rounded-lg border border-border/80 bg-muted/40 px-3 h-10 select-none">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-medium text-foreground">
                {t.stealthModeLabel}
              </span>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    className="inline-flex size-4 items-center justify-center text-muted-foreground hover:text-foreground focus:outline-none transition-colors"
                    aria-label={t.stealthModeToggleDesc}
                  >
                    <HelpCircleIcon className="size-3.5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-[280px] text-center text-xs">
                  {t.stealthModeToggleDesc}
                </TooltipContent>
              </Tooltip>
            </div>

            <label
              htmlFor={`toggle-stealth-${quiz.id}`}
              className="relative inline-flex cursor-pointer items-center"
            >
              <input
                id={`toggle-stealth-${quiz.id}`}
                type="checkbox"
                checked={isStealth}
                disabled={updatingStealth}
                onChange={(e) => void handleToggleStealth(e.target.checked)}
                className="peer sr-only"
              />
              <div className="h-5 w-9 rounded-full bg-muted-foreground/30 transition-colors after:absolute after:left-[2px] after:top-[2px] after:h-4 after:w-4 after:rounded-full after:bg-card after:transition-all after:content-[''] peer-checked:bg-amber-600 peer-checked:after:translate-x-full peer-focus:outline-none" />
            </label>
          </div>
        </div>

        <TabsContent value="access" className="mt-4 space-y-6">
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
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleDownloadQr}
                className="h-9 w-full gap-2"
              >
                <QrCode01Icon className="size-4" />
                {t.downloadQr}
              </Button>
            </div>
          </div>

          <div className="space-y-4 border-t border-border pt-6">
            {/* Results link. Read-only card until the teacher asks to edit, so the
                common case stays a single obvious button. */}
            <div className="rounded-lg border border-border bg-muted/30 p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 space-y-1">
                  <p className="font-mono text-[0.6875rem] uppercase tracking-[0.14em] text-muted-foreground">
                    {t.resultUrlLabel}
                  </p>
                  {editingResult ? null : quiz.resultUrl ? (
                    <a
                      href={quiz.resultUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block max-w-full truncate text-sm font-medium underline decoration-border underline-offset-4 transition-colors hover:decoration-foreground"
                    >
                      {describeResultHost(quiz.resultUrl)}
                    </a>
                  ) : (
                    <p className="text-sm text-muted-foreground">{t.resultUrlEmpty}</p>
                  )}
                </div>
                {editingResult ? null : quiz.resultUrl ? (
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="h-9 gap-2"
                    title={t.openInNewTab}
                  >
                    <a href={quiz.resultUrl} target="_blank" rel="noopener noreferrer">
                      <ArrowUpRight01Icon className="size-4" />
                      {t.viewResults}
                    </a>
                  </Button>
                ) : null}
              </div>

              {editingResult ? (
                <div className="mt-3 space-y-2">
                  <Label htmlFor={`result-url-${quiz.id}`} className="sr-only">
                    {t.resultUrlLabel}
                  </Label>
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <Input
                      id={`result-url-${quiz.id}`}
                      type="url"
                      inputMode="url"
                      autoFocus
                      spellCheck={false}
                      value={resultDraft}
                      onChange={(event) => {
                        setResultDraft(event.target.value);
                        if (resultError) setResultError("");
                      }}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          event.preventDefault();
                          void handleSaveResultUrl();
                        }
                      }}
                      placeholder={t.resultUrlPlaceholder}
                      aria-invalid={resultError ? true : undefined}
                      className="h-10 flex-1 font-mono text-xs"
                    />
                    <Button
                      type="button"
                      onClick={() => void handleSaveResultUrl()}
                      disabled={savingResult}
                      className="h-10 shrink-0 gap-2 sm:w-28"
                    >
                      <CheckmarkCircle01Icon className="size-4" />
                      {t.save}
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => {
                        setEditingResult(false);
                        setResultDraft(quiz.resultUrl ?? "");
                        setResultError("");
                      }}
                      className="h-10 shrink-0 sm:w-24"
                    >
                      {t.cancel}
                    </Button>
                  </div>
                  {resultError ? (
                    <p role="alert" className="text-xs text-destructive">
                      {resultError}
                    </p>
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      {t.resultUrlHint}
                    </p>
                  )}
                </div>
              ) : null}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="results" className="mt-4 space-y-4">
          <div className="border-t border-border pt-6">
            <ParticipantTable
              submissions={quiz.submissions}
              locale={locale}
              onRequestDelete={onRequestDeleteSubmission}
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
