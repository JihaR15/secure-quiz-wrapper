"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLanguage } from "@/components/providers";
import { ArrowRight01Icon } from "hugeicons-react";

type CreateQuizFormProps = {
  title: string;
  url: string;
  error: string;
  submitting: boolean;
  onTitleChange: (value: string) => void;
  onUrlChange: (value: string) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  idPrefix?: string;
};

export function CreateQuizForm({
  title,
  url,
  error,
  submitting,
  onTitleChange,
  onUrlChange,
  onSubmit,
  idPrefix = "create",
}: CreateQuizFormProps) {
  const { t } = useLanguage();
  const titleId = `${idPrefix}-title`;
  const urlId = `${idPrefix}-url`;

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-12">
        <div className="space-y-2 sm:col-span-6 lg:col-span-4">
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

        <div className="space-y-2 sm:col-span-6 lg:col-span-6">
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

        <div className="flex items-end sm:col-span-12 lg:col-span-2">
          <Button
            type="submit"
            disabled={submitting}
            className="h-10 w-full gap-2 lg:whitespace-nowrap"
          >
            {submitting ? t.creating : t.generateQuiz}
            {submitting ? null : <ArrowRight01Icon className="size-4" />}
          </Button>
        </div>
      </div>

      {error ? (
        <p role="alert" className="text-xs text-destructive">
          {error}
        </p>
      ) : null}
    </form>
  );
}
