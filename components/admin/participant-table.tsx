"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Delete02Icon,
  ArrowDown01Icon,
  ArrowUp01Icon,
  ArrowLeft01Icon,
  ArrowRight01Icon,
} from "hugeicons-react";
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

function BreakdownAccordionContent({
  submission,
  t,
}: {
  submission: Submission;
  t: Translation;
}) {
  const items = [
    { key: "tab", label: t.vioTab, count: breakdownValue(submission, "tab") },
    { key: "window", label: t.vioWindow, count: breakdownValue(submission, "window") },
    { key: "clipboard", label: t.vioClipboard, count: breakdownValue(submission, "clipboard") },
    { key: "contextmenu", label: t.vioContext, count: breakdownValue(submission, "contextmenu") },
  ] as const;

  return (
    <div className="grid grid-cols-2 gap-2 rounded-lg border border-border/60 bg-muted/30 p-3 sm:grid-cols-4">
      {items.map((item) => (
        <div
          key={item.key}
          className="flex flex-col rounded-md border border-border/40 bg-background/60 p-2 text-center"
        >
          <span className="text-[0.6875rem] font-medium text-muted-foreground">{item.label}</span>
          <span className="font-mono text-base font-semibold tabular-nums text-foreground">
            {item.count}
          </span>
        </div>
      ))}
    </div>
  );
}

export function ParticipantTable({
  submissions,
  locale,
  onRequestDelete,
}: ParticipantTableProps) {
  const { t, language } = useLanguage();
  const [expandedIds, setExpandedIds] = React.useState<Set<string>>(new Set());
  const [page, setPage] = React.useState(1);
  const pageSize = 10;

  const totalPages = Math.max(1, Math.ceil(submissions.length / pageSize));

  // Reset page if bounds change
  React.useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [submissions.length, totalPages, page]);

  const startIndex = (page - 1) * pageSize;
  const endIndex = Math.min(submissions.length, startIndex + pageSize);
  const currentSubmissions = submissions.slice(startIndex, endIndex);

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const deleteButton = (submission: Submission, className: string) => (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onRequestDelete(submission);
      }}
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
    <div className="space-y-4">
      {/* Mobile list view */}
      <ul className="divide-y divide-border overflow-hidden rounded-lg border border-border sm:hidden">
        {currentSubmissions.map((submission, index) => {
          const globalIndex = startIndex + index;
          const risk = riskLevel(submission.violationCount);
          const isExpanded = expandedIds.has(submission.id);

          return (
            <li key={submission.id} className="flex flex-col p-3.5 space-y-3">
              <div className="flex items-start gap-3">
                <span className="mt-0.5 font-mono text-[0.6875rem] tabular-nums text-muted-foreground">
                  {String(globalIndex + 1).padStart(2, "0")}
                </span>

                <div className="min-w-0 flex-1 space-y-2">
                  <p className="truncate text-sm font-medium tracking-[-0.01em]">
                    {submission.participantName}
                  </p>

                  <div className="flex flex-wrap items-center gap-2">
                    {riskBadge(
                      risk,
                      risk === "high"
                        ? t.riskHigh
                        : risk === "warning"
                          ? t.riskWarning
                          : t.riskNormal,
                    )}
                    <span className="font-mono text-xs text-muted-foreground">
                      {submission.violationCount} {t.violations.toLowerCase()}
                    </span>
                  </div>

                  <dl className="grid grid-cols-2 gap-x-3 gap-y-1 font-mono text-[0.6875rem] tabular-nums">
                    <dt className="text-muted-foreground">{t.startedAt}</dt>
                    <dd className="truncate">{formatTime(submission.startedAt, locale)}</dd>
                    <dt className="text-muted-foreground">{t.lastActive}</dt>
                    <dd className="truncate">{formatTime(submission.lastActiveAt, locale)}</dd>
                  </dl>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => toggleExpand(submission.id)}
                    aria-expanded={isExpanded}
                    aria-label="Toggle violation details"
                    className="flex items-center gap-1 rounded-md border border-border p-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted"
                  >
                    {isExpanded ? (
                      <ArrowUp01Icon className="size-4" />
                    ) : (
                      <ArrowDown01Icon className="size-4" />
                    )}
                  </button>
                  {deleteButton(submission, "")}
                </div>
              </div>

              {isExpanded && (
                <div className="pt-1">
                  <BreakdownAccordionContent submission={submission} t={t} />
                </div>
              )}
            </li>
          );
        })}
      </ul>

      {/* Desktop table view */}
      <div className="hidden overflow-x-auto rounded-lg border border-border sm:block">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-10 pl-4 font-mono text-[0.6875rem] font-normal uppercase tracking-[0.12em] text-muted-foreground">
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
            {currentSubmissions.map((submission, index) => {
              const globalIndex = startIndex + index;
              const risk = riskLevel(submission.violationCount);
              const isExpanded = expandedIds.has(submission.id);

              return (
                <React.Fragment key={submission.id}>
                  <TableRow
                    onClick={() => toggleExpand(submission.id)}
                    className="cursor-pointer transition-colors hover:bg-muted/50"
                  >
                    <TableCell className="pl-4 font-mono text-xs tabular-nums text-muted-foreground">
                      {String(globalIndex + 1).padStart(2, "0")}
                    </TableCell>

                    <TableCell className="font-medium tracking-[-0.01em]">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleExpand(submission.id);
                          }}
                          aria-expanded={isExpanded}
                          className="rounded p-0.5 text-muted-foreground hover:bg-muted"
                        >
                          {isExpanded ? (
                            <ArrowUp01Icon className="size-4 text-primary" />
                          ) : (
                            <ArrowDown01Icon className="size-4" />
                          )}
                        </button>
                        <span className="truncate">{submission.participantName}</span>
                      </div>
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

                  {isExpanded && (
                    <TableRow className="bg-muted/20 hover:bg-muted/20">
                      <TableCell colSpan={7} className="p-3 pl-12 pr-4">
                        <BreakdownAccordionContent submission={submission} t={t} />
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Controls */}
      {submissions.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <p className="font-mono text-xs text-muted-foreground">
            {language === "id"
              ? `Menampilkan ${startIndex + 1}-${endIndex} dari ${submissions.length} peserta`
              : `Showing ${startIndex + 1}-${endIndex} of ${submissions.length} participants`}
          </p>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="h-8 gap-1.5 px-3 text-xs"
            >
              <ArrowLeft01Icon className="size-3.5" />
              <span>{t.prevPage}</span>
            </Button>

            <span className="font-mono text-xs px-2 text-muted-foreground font-medium">
              {page} / {totalPages}
            </span>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="h-8 gap-1.5 px-3 text-xs"
            >
              <span>{t.nextPage}</span>
              <ArrowRight01Icon className="size-3.5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
