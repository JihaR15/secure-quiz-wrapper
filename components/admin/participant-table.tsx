"use client";

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
import type { Submission } from "@/lib/db";

type ParticipantTableProps = {
  submissions: Submission[];
  locale: string;
  onRequestDelete: (submission: Submission) => void;
};

export function ParticipantTable({
  submissions,
  locale,
  onRequestDelete,
}: ParticipantTableProps) {
  const { t } = useLanguage();

  if (submissions.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border px-4 py-12 text-center">
        <p className="text-pretty text-sm text-muted-foreground">{t.noParticipants}</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table className="min-w-[46rem]">
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
                  <span className="block max-w-[16ch] truncate">
                    {submission.participantName}
                  </span>
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
                    {risk === "high"
                      ? t.riskHigh
                      : risk === "warning"
                        ? t.riskWarning
                        : t.riskNormal}
                  </Badge>
                </TableCell>

                <TableCell className="font-mono text-xs tabular-nums text-muted-foreground">
                  {formatTime(submission.startedAt, locale)}
                </TableCell>

                <TableCell className="font-mono text-xs tabular-nums text-muted-foreground">
                  {formatTime(submission.lastActiveAt, locale)}
                </TableCell>

                <TableCell className="pr-4 text-right">
                  <button
                    type="button"
                    onClick={() => onRequestDelete(submission)}
                    title={t.deleteParticipant}
                    aria-label={`${t.deleteParticipant}: ${submission.participantName}`}
                    className="rounded-md p-2.5 text-muted-foreground transition-colors hover:text-destructive focus-visible:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:p-1.5"
                  >
                    <Delete02Icon className="size-4" />
                  </button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
