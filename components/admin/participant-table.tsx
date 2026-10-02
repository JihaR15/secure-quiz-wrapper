"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  Search01Icon,
  FilterHorizontalIcon,
  Sorting01Icon,
} from "hugeicons-react";
import { useLanguage } from "@/components/providers";
import { formatDuration, formatTime, riskLevel } from "@/lib/quiz-format";
import type { Translation } from "@/lib/i18n";
import type { Submission } from "@/lib/db";

type ParticipantTableProps = {
  submissions: Submission[];
  locale: string;
  onRequestDelete: (submission: Submission) => void;
};

type RiskOption = "none" | "warning" | "high";
type SortOption = "newest" | "oldest" | "fastest" | "name";

function riskBadge(risk: "none" | "warning" | "high", label: string) {
  return (
    <Badge
      variant="outline"
      className={
        risk === "high"
          ? "border-destructive/40 text-destructive bg-destructive/10 font-medium whitespace-nowrap"
          : risk === "warning"
            ? "border-amber-500/40 text-amber-600 dark:text-amber-400 bg-amber-500/10 font-medium whitespace-nowrap"
            : "border-emerald-500/40 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 font-medium whitespace-nowrap"
      }
    >
      <span
        className={`mr-1.5 size-1.5 rounded-full shrink-0 ${
          risk === "high"
            ? "bg-destructive"
            : risk === "warning"
              ? "bg-amber-500"
              : "bg-emerald-500"
        }`}
      />
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
  ] as const;

  return (
    <div className="grid grid-cols-2 gap-2 rounded-lg border border-border/60 bg-muted/30 p-3">
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
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedRisks, setSelectedRisks] = React.useState<Set<RiskOption>>(
    new Set(["none", "warning", "high"])
  );
  const [sortBy, setSortBy] = React.useState<SortOption>("newest");
  const [viewMode, setViewMode] = React.useState<"pagination" | "viewMore">("pagination");
  const [page, setPage] = React.useState(1);
  const pageSize = 10;

  const getSortLabel = React.useCallback(
    (sort: SortOption) => {
      switch (sort) {
        case "newest":
          return t.sortNewest;
        case "oldest":
          return t.sortOldest;
        case "fastest":
          return t.sortFastest;
        case "name":
          return t.sortName;
      }
    },
    [t]
  );

  // Sort submissions based on selected sortBy criteria
  const sortedSubmissions = React.useMemo(() => {
    const list = [...submissions];

    const getDurationMs = (sub: Submission) => {
      const start = new Date(sub.startedAt).getTime();
      const end = new Date(sub.lastActiveAt).getTime();
      if (isNaN(start) || isNaN(end) || end < start) return Infinity;
      return end - start;
    };

    switch (sortBy) {
      case "oldest":
        return list.sort(
          (a, b) => new Date(a.startedAt).getTime() - new Date(b.startedAt).getTime()
        );
      case "fastest":
        return list.sort((a, b) => {
          const durA = getDurationMs(a);
          const durB = getDurationMs(b);
          if (durA !== durB) return durA - durB;
          return new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime();
        });
      case "name":
        return list.sort((a, b) =>
          a.participantName.localeCompare(b.participantName, locale, { sensitivity: "base" })
        );
      case "newest":
      default:
        return list.sort(
          (a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime()
        );
    }
  }, [submissions, sortBy, locale]);

  // Counts for each violation status
  const normalCount = React.useMemo(
    () => sortedSubmissions.filter((s) => riskLevel(s.violationCount) === "none").length,
    [sortedSubmissions]
  );
  const warningCount = React.useMemo(
    () => sortedSubmissions.filter((s) => riskLevel(s.violationCount) === "warning").length,
    [sortedSubmissions]
  );
  const highCount = React.useMemo(
    () => sortedSubmissions.filter((s) => riskLevel(s.violationCount) === "high").length,
    [sortedSubmissions]
  );

  const toggleRisk = (risk: RiskOption) => {
    setSelectedRisks((prev) => {
      const next = new Set(prev);
      if (next.has(risk)) {
        next.delete(risk);
      } else {
        next.add(risk);
      }
      return next;
    });
    setPage(1);
  };

  const selectAllRisks = () => {
    setSelectedRisks(new Set(["none", "warning", "high"]));
    setPage(1);
  };

  const clearAllRisks = () => {
    setSelectedRisks(new Set());
    setPage(1);
  };

  // Real-time search and multi-select violation status filtering
  const filteredSubmissions = React.useMemo(() => {
    let result = sortedSubmissions;
    if (selectedRisks.size < 3) {
      result = result.filter((sub) => selectedRisks.has(riskLevel(sub.violationCount)));
    }
    const q = searchQuery.trim().toLowerCase();
    if (q) {
      result = result.filter((sub) =>
        sub.participantName.toLowerCase().includes(q)
      );
    }
    return result;
  }, [sortedSubmissions, searchQuery, selectedRisks]);

  const totalPages = Math.max(1, Math.ceil(filteredSubmissions.length / pageSize));
  const currentPage = Math.min(Math.max(1, page), totalPages);

  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(filteredSubmissions.length, startIndex + pageSize);

  const displayedSubmissions =
    viewMode === "viewMore"
      ? filteredSubmissions
      : filteredSubmissions.slice(startIndex, endIndex);

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
    <div className="space-y-3.5">
      {/* Search filter, Multi-Select Dropdown Filter & View mode toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2 flex-1">
          {/* Search bar */}
          <div className="relative w-full sm:w-64">
            <Search01Icon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              placeholder={t.searchParticipants}
              className="h-9 pl-9 pr-3 text-xs"
            />
          </div>

          {/* Multi-Select Status Pelanggaran Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-9 gap-2 text-xs font-normal"
              >
                <FilterHorizontalIcon className="size-3.5 text-muted-foreground" />
                <span>{t.statusFilter}</span>
                {selectedRisks.size < 3 && (
                  <span className="flex size-4 items-center justify-center rounded-full bg-primary text-[0.625rem] font-bold text-primary-foreground tabular-nums">
                    {selectedRisks.size}
                  </span>
                )}
                <ArrowDown01Icon className="size-3 text-muted-foreground opacity-70" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56 p-1.5">
              <DropdownMenuLabel className="text-xs font-semibold px-2 py-1 text-muted-foreground">
                {t.statusFilter}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />

              <DropdownMenuCheckboxItem
                checked={selectedRisks.has("none")}
                onCheckedChange={() => toggleRisk("none")}
                className="text-xs cursor-pointer"
              >
                <div className="flex items-center justify-between w-full">
                  <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
                    <span className="size-1.5 rounded-full bg-emerald-500" />
                    {t.riskNormal}
                  </span>
                  <span className="font-mono text-[0.6875rem] text-muted-foreground tabular-nums">
                    ({normalCount})
                  </span>
                </div>
              </DropdownMenuCheckboxItem>

              <DropdownMenuCheckboxItem
                checked={selectedRisks.has("warning")}
                onCheckedChange={() => toggleRisk("warning")}
                className="text-xs cursor-pointer"
              >
                <div className="flex items-center justify-between w-full">
                  <span className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-medium">
                    <span className="size-1.5 rounded-full bg-amber-500" />
                    {t.riskWarning}
                  </span>
                  <span className="font-mono text-[0.6875rem] text-muted-foreground tabular-nums">
                    ({warningCount})
                  </span>
                </div>
              </DropdownMenuCheckboxItem>

              <DropdownMenuCheckboxItem
                checked={selectedRisks.has("high")}
                onCheckedChange={() => toggleRisk("high")}
                className="text-xs cursor-pointer"
              >
                <div className="flex items-center justify-between w-full">
                  <span className="flex items-center gap-1.5 text-destructive font-medium">
                    <span className="size-1.5 rounded-full bg-destructive" />
                    {t.riskHigh}
                  </span>
                  <span className="font-mono text-[0.6875rem] text-muted-foreground tabular-nums">
                    ({highCount})
                  </span>
                </div>
              </DropdownMenuCheckboxItem>

              <DropdownMenuSeparator />
              <div className="flex items-center justify-between px-2 py-1 text-[0.6875rem]">
                <button
                  type="button"
                  onClick={selectAllRisks}
                  className="text-primary hover:underline font-medium"
                >
                  {language === "id" ? "Pilih Semua" : "Select All"}
                </button>
                <button
                  type="button"
                  onClick={clearAllRisks}
                  className="text-muted-foreground hover:underline"
                >
                  Reset
                </button>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Single-Select Urutan / Sorting Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-9 gap-2 text-xs font-normal"
              >
                <Sorting01Icon className="size-3.5 text-muted-foreground" />
                <span>{getSortLabel(sortBy)}</span>
                <ArrowDown01Icon className="size-3 text-muted-foreground opacity-70" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-44 p-1.5">
              <DropdownMenuLabel className="text-xs font-semibold px-2 py-1 text-muted-foreground">
                {t.sortBy}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuRadioGroup
                value={sortBy}
                onValueChange={(val) => {
                  setSortBy(val as SortOption);
                  setPage(1);
                }}
              >
                <DropdownMenuRadioItem value="newest" className="text-xs cursor-pointer">
                  {t.sortNewest}
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="oldest" className="text-xs cursor-pointer">
                  {t.sortOldest}
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="fastest" className="text-xs cursor-pointer">
                  {t.sortFastest}
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="name" className="text-xs cursor-pointer">
                  {t.sortName}
                </DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* View mode toggle (Pagination vs Lihat Semua) & counter */}
        <div className="flex items-center justify-between sm:justify-end gap-2.5">
          <span className="font-mono text-xs text-muted-foreground">
            {filteredSubmissions.length} {t.participants.toLowerCase()}
          </span>

          <div className="inline-flex rounded-lg border border-border bg-muted/40 p-0.5 text-xs">
            <button
              type="button"
              onClick={() => setViewMode("pagination")}
              className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                viewMode === "pagination"
                  ? "bg-background text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t.viewPagination}
            </button>
            <button
              type="button"
              onClick={() => setViewMode("viewMore")}
              className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                viewMode === "viewMore"
                  ? "bg-background text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t.viewMore}
            </button>
          </div>
        </div>
      </div>

      {filteredSubmissions.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border px-4 py-8 text-center">
          <p className="text-xs text-muted-foreground">
            {language === "id"
              ? "Tidak ada peserta yang cocok dengan kriteria filter status atau pencarian."
              : "No participants match the filter or search criteria."}
          </p>
        </div>
      ) : (
        /* Boxed container with sticky header support */
        <div
          className={`rounded-lg border border-border bg-card ${
            viewMode === "viewMore"
              ? "max-h-[500px] overflow-y-auto overflow-x-auto shadow-inner"
              : "overflow-x-auto"
          }`}
        >
          {/* Mobile list view */}
          <ul className="divide-y divide-border sm:hidden">
            {displayedSubmissions.map((submission, index) => {
              const globalIndex =
                viewMode === "viewMore" ? index : startIndex + index;
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

                        <span className="font-mono text-xs text-muted-foreground tabular-nums">
                          ({submission.violationCount} {t.violations.toLowerCase()})
                        </span>
                      </div>

                      <dl className="grid grid-cols-2 gap-x-3 gap-y-1 font-mono text-[0.6875rem] tabular-nums">
                        <dt className="text-muted-foreground">{t.startedAt}</dt>
                        <dd className="truncate">{formatTime(submission.startedAt, locale)}</dd>
                        <dt className="text-muted-foreground">{t.lastActive}</dt>
                        <dd className="truncate">{formatTime(submission.lastActiveAt, locale)}</dd>
                        <dt className="text-muted-foreground">{t.duration}</dt>
                        <dd className="truncate font-medium text-foreground">
                          {formatDuration(submission.startedAt, submission.lastActiveAt, language)}
                        </dd>
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

          {/* Desktop table view with combined Status & Pelanggaran column and sticky header */}
          <div className="hidden sm:block">
            <Table>
              <TableHeader
                className={
                  viewMode === "viewMore"
                    ? "sticky top-0 z-20 bg-card/95 backdrop-blur shadow-xs border-b border-border"
                    : ""
                }
              >
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-10 pl-4 font-mono text-[0.6875rem] font-normal uppercase tracking-[0.12em] text-muted-foreground">
                    #
                  </TableHead>
                  <TableHead className="font-mono text-[0.6875rem] font-normal uppercase tracking-[0.12em] text-muted-foreground">
                    {t.participantName}
                  </TableHead>
                  <TableHead className="font-mono text-[0.6875rem] font-normal uppercase tracking-[0.12em] text-muted-foreground">
                    {language === "id" ? "Pelanggaran & Status" : "Violations & Status"}
                  </TableHead>
                  <TableHead className="font-mono text-[0.6875rem] font-normal uppercase tracking-[0.12em] text-muted-foreground">
                    {t.startedAt}
                  </TableHead>
                  <TableHead className="font-mono text-[0.6875rem] font-normal uppercase tracking-[0.12em] text-muted-foreground">
                    {t.lastActive}
                  </TableHead>
                  <TableHead className="font-mono text-[0.6875rem] font-normal uppercase tracking-[0.12em] text-muted-foreground">
                    {t.duration}
                  </TableHead>
                  <TableHead className="pr-4 text-right font-mono text-[0.6875rem] font-normal uppercase tracking-[0.12em] text-muted-foreground">
                    {t.actions}
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {displayedSubmissions.map((submission, index) => {
                  const globalIndex =
                    viewMode === "viewMore" ? index : startIndex + index;
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

                        {/* Combined Pelanggaran & Status Column */}
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {riskBadge(
                              risk,
                              risk === "high"
                                ? t.riskHigh
                                : risk === "warning"
                                  ? t.riskWarning
                                  : t.riskNormal,
                            )}
                            <span className="font-mono text-xs text-muted-foreground tabular-nums">
                              ({submission.violationCount})
                            </span>
                          </div>
                        </TableCell>

                        <TableCell className="whitespace-nowrap font-mono text-xs tabular-nums text-muted-foreground">
                          {formatTime(submission.startedAt, locale)}
                        </TableCell>

                        <TableCell className="whitespace-nowrap font-mono text-xs tabular-nums text-muted-foreground">
                          {formatTime(submission.lastActiveAt, locale)}
                        </TableCell>

                        <TableCell className="whitespace-nowrap font-mono text-xs tabular-nums font-medium text-foreground">
                          {formatDuration(submission.startedAt, submission.lastActiveAt, language)}
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
        </div>
      )}

      {/* Pagination Controls when in Pagination Mode */}
      {viewMode === "pagination" && filteredSubmissions.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
          <p className="font-mono text-xs text-muted-foreground">
            {language === "id"
              ? `Menampilkan ${startIndex + 1}-${endIndex} dari ${filteredSubmissions.length} peserta`
              : `Showing ${startIndex + 1}-${endIndex} of ${filteredSubmissions.length} participants`}
          </p>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={currentPage <= 1}
              className="h-8 gap-1.5 px-3 text-xs"
            >
              <ArrowLeft01Icon className="size-3.5" />
              <span>{t.prevPage}</span>
            </Button>

            <span className="font-mono text-xs px-2 text-muted-foreground font-medium">
              {currentPage} / {totalPages}
            </span>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages}
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
