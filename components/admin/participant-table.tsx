"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Delete02Icon } from "hugeicons-react";
import { useLanguage } from "@/components/providers";
import { formatTime, riskLevel } from "@/lib/quiz-format";
import type { Translation } from "@/lib/i18n";
import type { Submission } from "@/lib/db";

type ParticipantTableProps = {
  submissions: Submission[];
  locale: string;
  onRequestDelete: (submission: Submission) => void;
};

function riskBadge(risk: "none" | "warning" | "high", label: string) {
  return (
    <Badge
      variant="outline"
      className={
        risk === "high"
          ? "border-destructive/40 text-destructive"
          : risk === "warning"
            ? "border-warning/40 text-warning"
            : "border-success/40 text-success"
      }
    >
      {label}
    </Badge>
  );
}

const breakdownValue = (submission: Submission, key: keyof Submission["violationBreakdown"]) =>
  submission.violationBreakdown?.[key] ?? 0;

/** Compact per-type counts, `t` comes from the hook so labels stay bilingual. */
function BreakdownLine({
  submission,
  t,
}: {
  submission: Submission;
  t: Translation;
}) {
  const labels = [
    ["tab", "vioTab"],
    ["window", "vioWindow"],
    ["clipboard", "vioClipboard"],
    ["contextmenu", "vioContext"],
  ] as const;

  return (
    <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1 font-mono text-[0.6875rem] tabular-nums text-muted-foreground">
      {labels.map(([key, labelKey]) => (
        <span key={key} className="shrink-0">
          <span className="text-foreground/80">{breakdownValue(submission, key)}</span>
          {" · "}
          {t[labelKey]}
        </span>
      ))}
    </div>
  );
}

export function ParticipantTable({
  submissions,
  locale,
  onRequestDelete,
}: ParticipantTableProps) {
  const { t } = useLanguage();

  const deleteButton = (submission: Submission, className: string) => (
    <button
      type="button"
      onClick={() => onRequestDelete(submission)}
      title={t.deleteParticipant}
      aria-label={`${t.deleteParticipant}: ${submission.participantName}`}
      className={`${className} rounded-md p-2.5 text-muted-foreground transition-colors hover:text-destructive focus-visible:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:p-1.5`}
    >
      <Delete02Icon className="size-4" />
    </button>
  );

  if (submissions.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border px-4 py-12 text-center">
        <p className="text-pretty text-sm text-muted-foreground">{t.noParticipants}</p>
      </div>
    );
  }

  return (
    <>
      {/* Phones: a stacked record per participant. A 46rem table inside a 390px
          pane can only scroll sideways, which hides half the data. */}
      <ul className="divide-y divide-border overflow-hidden rounded-lg border border-border sm:hidden">
        {submissions.map((submission, index) => {
          const risk = riskLevel(submission.violationCount);

          return (
            <li key={submission.id} className="flex items-start gap-3 p-3.5">
              <span className="mt-0.5 font-mono text-[0.6875rem] tabular-nums text-muted-foreground">
                {String(index + 1).padStart(2, "0")}
              </span>

              <div className="min-w-0 flex-1 space-y-2">
                <p className="truncate text-sm font-medium tracking-[-0.01em]">
                  {submission.participantName}
                </p>

                <div className="flex flex-wrap items-center gap-2">
                  {riskBadge(
                    risk,
                    risk === "high" ? t.riskHigh : risk === "warning" ? t.riskWarning : t.riskNormal,
                  )}
                  <span className="font-mono text-xs text-muted-foreground">
                    {submission.violationCount} {t.violations.toLowerCase()}
                  </span>
                </div>

                <BreakdownLine submission={submission} t={t} />

                <dl className="grid grid-cols-2 gap-x-3 gap-y-1 font-mono text-[0.6875rem] tabular-nums">
                  <dt className="text-muted-foreground">{t.startedAt}</dt>
                  <dd className="truncate">{formatTime(submission.startedAt, locale)}</dd>
                  <dt className="text-muted-foreground">{t.lastActive}</dt>
                  <dd className="truncate">{formatTime(submission.lastActiveAt, locale)}</dd>
                </dl>
              </div>

              {deleteButton(submission, "shrink-0")}
            </li>
          );
        })}
      </ul>

      {/* From sm up there is room for the real table. */}
      <div className="hidden overflow-x-auto rounded-lg border border-border sm:block">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-12 pl-4 font-mono text-[0.6875rem] font-normal uppercase tracking-[0.12em] text-muted-foreground">
                #
              </TableHead>
              <TableHead className="font-mono text-[0.6875rem] font-normal uppercase tracking-[0.12em] text-muted-foreground">
                {t.participantName}
              </TableHead>
              <TableHead className="text-right font-mono text-[0.6875rem] font-normal uppercase tracking-[0.12em] text-muted-foreground">
                {t.violations}
              </TableHead>
              <TableHead className="font-mono text-[0.6875rem] font-normal uppercase tracking-[0.12em] text-muted-foreground">
                {t.status}
              </TableHead>
              <TableHead className="font-mono text-[0.6875rem] font-normal uppercase tracking-[0.12em] text-muted-foreground">
                {t.startedAt}
              </TableHead>
              <TableHead className="font-mono text-[0.6875rem] font-normal uppercase tracking-[0.12em] text-muted-foreground">
                {t.lastActive}
              </TableHead>
              <TableHead className="pr-4 text-right font-mono text-[0.6875rem] font-normal uppercase tracking-[0.12em] text-muted-foreground">
                {t.actions}
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {submissions.map((submission, index) => {
              const risk = riskLevel(submission.violationCount);

              return (
                <TableRow key={submission.id}>
                  <TableCell className="pl-4 font-mono text-xs tabular-nums text-muted-foreground">
                    {String(index + 1).padStart(2, "0")}
                  </TableCell>

                  <TableCell className="font-medium tracking-[-0.01em]">
                    <span className="block max-w-[18ch] truncate">
                      {submission.participantName}
                    </span>
                    <BreakdownLine submission={submission} t={t} />
                  </TableCell>

                  <TableCell className="text-right font-mono text-sm tabular-nums">
                    <span
                      className={
                        risk === "none"
                          ? "text-muted-foreground"
                          : risk === "warning"
                            ? "text-warning"
                            : "text-destructive"
                      }
                    >
                      {submission.violationCount}
                    </span>
                  </TableCell>

                  <TableCell>
                    {riskBadge(
                      risk,
                      risk === "high"
                        ? t.riskHigh
                        : risk === "warning"
                          ? t.riskWarning
                          : t.riskNormal,
                    )}
                  </TableCell>

                  <TableCell className="whitespace-nowrap font-mono text-xs tabular-nums text-muted-foreground">
                    {formatTime(submission.startedAt, locale)}
                  </TableCell>

                  <TableCell className="whitespace-nowrap font-mono text-xs tabular-nums text-muted-foreground">
                    {formatTime(submission.lastActiveAt, locale)}
                  </TableCell>

                  <TableCell className="pr-4 text-right">
                    {deleteButton(submission, "inline-block")}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
