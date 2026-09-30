"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLanguage } from "@/components/providers";
import { isHttpUrl } from "@/lib/result-url";
import { Edit02Icon } from "hugeicons-react";

type EditQuizModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialTitle: string;
  initialFormUrl: string;
  initialResultUrl?: string | null;
  onSave: (updates: {
    title: string;
    formUrl: string;
    resultUrl: string;
  }) => Promise<boolean>;
};

export function EditQuizModal({
  open,
  onOpenChange,
  initialTitle,
  initialFormUrl,
  initialResultUrl,
  onSave,
}: EditQuizModalProps) {
  const { t } = useLanguage();
  const [prevOpen, setPrevOpen] = React.useState(open);
  const [title, setTitle] = React.useState(initialTitle);
  const [formUrl, setFormUrl] = React.useState(initialFormUrl);
  const [resultUrl, setResultUrl] = React.useState(initialResultUrl ?? "");
  const [error, setError] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);

  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) {
      setTitle(initialTitle);
      setFormUrl(initialFormUrl);
      setResultUrl(initialResultUrl ?? "");
      setError("");
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const cleanTitle = title.trim();
    const cleanUrl = formUrl.trim();
    const cleanResult = resultUrl.trim();

    if (!cleanTitle || !cleanUrl) {
      setError(t.formRequired);
      return;
    }

    if (!isHttpUrl(cleanUrl)) {
      setError(t.formUrlPlaceholder);
      return;
    }

    if (cleanResult && !isHttpUrl(cleanResult)) {
      setError(t.resultUrlInvalid);
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const ok = await onSave({
        title: cleanTitle,
        formUrl: cleanUrl,
        resultUrl: cleanResult,
      });
      if (ok) {
        onOpenChange(false);
      } else {
        setError(t.quizUpdateFailed);
      }
    } catch {
      setError(t.toastNetworkError);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg border-border sm:p-6">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit02Icon className="size-4 text-primary" />
            <span>{t.editQuizDialogTitle}</span>
          </DialogTitle>
          <DialogDescription>{t.editQuizDialogDesc}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} noValidate className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label htmlFor="edit-quiz-title" className="text-xs text-muted-foreground">
              {t.quizTitle}
            </Label>
            <Input
              id="edit-quiz-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t.quizTitlePlaceholder}
              autoComplete="off"
              className="h-10"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-quiz-url" className="text-xs text-muted-foreground">
              {t.targetUrl}
            </Label>
            <Input
              id="edit-quiz-url"
              type="url"
              inputMode="url"
              value={formUrl}
              onChange={(e) => setFormUrl(e.target.value)}
              placeholder={t.formUrlPlaceholder}
              autoComplete="off"
              spellCheck={false}
              className="h-10 font-mono text-xs"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-quiz-result-url" className="text-xs text-muted-foreground">
              {t.resultUrlLabel}
            </Label>
            <Input
              id="edit-quiz-result-url"
              type="url"
              inputMode="url"
              value={resultUrl}
              onChange={(e) => setResultUrl(e.target.value)}
              placeholder={t.resultUrlPlaceholder}
              autoComplete="off"
              spellCheck={false}
              className="h-10 font-mono text-xs"
            />
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              {t.resultUrlHint}
            </p>
          </div>

          {error ? (
            <p role="alert" className="text-xs text-destructive">
              {error}
            </p>
          ) : null}

          <DialogFooter className="gap-2 sm:gap-0 pt-2 border-t border-border/60">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
            >
              {t.cancel}
            </Button>
            <Button type="submit" disabled={submitting} className="min-w-[120px] ml-2">
              {submitting ? t.savingChanges : t.saveChanges}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
