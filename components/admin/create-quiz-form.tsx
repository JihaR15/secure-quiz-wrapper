"use client";

import * as React from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLanguage } from "@/components/providers";
import { isHttpUrl } from "@/lib/result-url";
import { ArrowRight01Icon } from "hugeicons-react";

type CreateQuizFormProps = {
  title: string;
  url: string;
  resultUrl: string;
  resultUrlError: string;
  isStealthMode?: boolean;
  error: string;
  submitting: boolean;
  onTitleChange: (value: string) => void;
  onUrlChange: (value: string) => void;
  onResultUrlChange: (value: string) => void;
  onStealthModeChange?: (value: boolean) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  idPrefix?: string;
};

export function CreateQuizForm({
  title,
  url,
  resultUrl,
  resultUrlError,
  isStealthMode = false,
  error,
  submitting,
  onTitleChange,
  onUrlChange,
  onResultUrlChange,
  onStealthModeChange,
  onSubmit,
  idPrefix = "create",
}: CreateQuizFormProps) {
  const { t } = useLanguage();
  const titleId = `${idPrefix}-title`;
  const urlId = `${idPrefix}-url`;
  const resultId = `${idPrefix}-result-url`;

  async function handleCopyResultLink() {
    const link = resultUrl.trim();
    if (!link || !isHttpUrl(link)) return;
    try {
      await navigator.clipboard.writeText(link);
      toast.success(t.copy);
    } catch {
      toast.error(t.resultUrlInvalid);
    }
  }

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor={titleId} className="text-xs text-muted-foreground">
          {t.quizTitle}
        </Label>
        <Input
          id={titleId}
          name="title"
          value={title}
          onChange={(event) => onTitleChange(event.target.value)}
          placeholder={t.quizTitlePlaceholder}
          autoComplete="off"
          className="h-10"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor={urlId} className="text-xs text-muted-foreground">
          {t.targetUrl}
        </Label>
        <Input
          id={urlId}
          name="formUrl"
          type="url"
          inputMode="url"
          value={url}
          onChange={(event) => onUrlChange(event.target.value)}
          placeholder={t.formUrlPlaceholder}
          autoComplete="off"
          spellCheck={false}
          className="h-10 font-mono text-xs"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor={resultId} className="text-xs text-muted-foreground">
          {t.resultUrlLabel}
        </Label>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Input
            id={resultId}
            name="resultUrl"
            type="url"
            inputMode="url"
            value={resultUrl}
            onChange={(event) => onResultUrlChange(event.target.value)}
            placeholder={t.resultUrlPlaceholder}
            autoComplete="off"
            spellCheck={false}
            aria-invalid={resultUrlError ? true : undefined}
            aria-describedby={resultUrlError ? `${resultId}-error` : `${resultId}-hint`}
            className="h-10 flex-1 font-mono text-xs"
          />
          {resultUrl.trim() ? (
            <Button
              type="button"
              variant="outline"
              onClick={handleCopyResultLink}
              className="h-10 shrink-0"
            >
              {t.copy}
            </Button>
          ) : null}
        </div>
        {resultUrlError ? (
          <p id={`${resultId}-error`} className="text-xs text-destructive">
            {resultUrlError}
          </p>
        ) : (
          <p id={`${resultId}-hint`} className="text-xs text-muted-foreground">
            {t.resultUrlHint}
          </p>
        )}
      </div>

      {/* Stealth Mode (Mode Sembunyi) Toggle - Default ON */}
      <div className="rounded-xl border border-border/70 bg-muted/30 p-3.5 space-y-2">
        <div className="flex items-center justify-between">
          <Label
            htmlFor={`${idPrefix}-stealth-mode`}
            className="text-xs font-semibold cursor-pointer select-none text-foreground flex items-center gap-2"
          >
            <span>{t.stealthModeLabel}</span>
          </Label>
          <input
            id={`${idPrefix}-stealth-mode`}
            type="checkbox"
            checked={isStealthMode}
            onChange={(e) => onStealthModeChange?.(e.target.checked)}
            className="size-4.5 rounded border-border text-primary focus:ring-primary cursor-pointer accent-emerald-600"
          />
        </div>
        <p className="text-[11px] text-muted-foreground leading-relaxed">
          {t.stealthModeHint}
        </p>
      </div>

      {error ? (
        <p role="alert" className="text-xs text-destructive">
          {error}
        </p>
      ) : null}

      <div className="flex items-center justify-end gap-3 pt-3 border-t border-border/60">
        <Button
          type="submit"
          disabled={submitting}
          className="h-10 w-full sm:w-auto min-w-[140px] gap-2"
        >
          {submitting ? t.creating : t.generateQuiz}
          {submitting ? null : <ArrowRight01Icon className="size-4" />}
        </Button>
      </div>
    </form>
  );
}
