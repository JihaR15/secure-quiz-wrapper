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
  Calendar03Icon,
  ArrowExpand01Icon,
  ArrowShrink01Icon,
  Cancel01Icon,
} from "hugeicons-react";
import { useLanguage } from "@/components/providers";
import { formatDate, formatDuration, formatTime, riskLevel } from "@/lib/quiz-format";
import type { Translation } from "@/lib/i18n";
import type { Submission } from "@/lib/db";

type ParticipantTableProps = {
  submissions: Submission[];
  locale: string;
  onRequestDelete: (submission: Submission) => void;
};

type RiskOption = "none" | "warning" | "high";
type SortColumn =
  | "name"
  | "date"
  | "violations"
  | "startedAt"
  | "lastActiveAt"
  | "duration";
type SortDirection = "asc" | "desc";

function SortIndicator({
  columnKey,
  activeKey,
  direction,
}: {
  columnKey: SortColumn;
  activeKey: SortColumn;
  direction: SortDirection;
}) {
  if (activeKey === columnKey) {
    return direction === "asc" ? (
      <ArrowUp01Icon className="size-3.5 text-primary shrink-0 transition-transform" />
    ) : (
      <ArrowDown01Icon className="size-3.5 text-primary shrink-0 transition-transform" />
    );
  }
  return (
    <Sorting01Icon className="size-3.5 text-muted-foreground/35 group-hover:text-muted-foreground shrink-0 transition-colors" />
  );
}

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
  const [selectedDate, setSelectedDate] = React.useState<string>("");
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const [sortColumn, setSortColumn] = React.useState<SortColumn>("startedAt");
  const [sortDirection, setSortDirection] = React.useState<SortDirection>("desc");
  const [viewMode, setViewMode] = React.useState<"pagination" | "viewMore">("pagination");
  const [page, setPage] = React.useState(1);
  const pageSize = 10;

  // Keyboard shortcut (Escape) to close fullscreen
  React.useEffect(() => {
    if (!isFullscreen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsFullscreen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isFullscreen]);

  // Prevent background scroll when fullscreen is active
  React.useEffect(() => {
    if (isFullscreen) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [isFullscreen]);

  // Unique available dates from submissions for quick filtering
  const availableDates = React.useMemo(() => {
    const set = new Set<string>();
    submissions.forEach((s) => {
      if (s.startedAt) {
        const d = new Date(s.startedAt);
        if (!isNaN(d.getTime())) {
          const y = d.getFullYear();
          const m = String(d.getMonth() + 1).padStart(2, "0");
          const day = String(d.getDate()).padStart(2, "0");
          set.add(`${y}-${m}-${day}`);
        }
      }
    });
    return Array.from(set).sort().reverse();
  }, [submissions]);

  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortColumn(column);
      setSortDirection(column === "name" || column === "duration" ? "asc" : "desc");
    }
    setPage(1);
  };

  const handlePresetSort = (val: string) => {
    switch (val) {
      case "newest":
        setSortColumn("startedAt");
        setSortDirection("desc");
        break;
      case "oldest":
        setSortColumn("startedAt");
        setSortDirection("asc");
        break;
      case "nameAsc":
        setSortColumn("name");
        setSortDirection("asc");
        break;
      case "nameDesc":
        setSortColumn("name");
        setSortDirection("desc");
        break;
      case "fastest":
        setSortColumn("duration");
        setSortDirection("asc");
        break;
      case "slowest":
        setSortColumn("duration");
        setSortDirection("desc");
        break;
      case "mostViolations":
        setSortColumn("violations");
        setSortDirection("desc");
        break;
      case "leastViolations":
        setSortColumn("violations");
        setSortDirection("asc");
        break;
    }
    setPage(1);
  };

  const currentPresetValue = React.useMemo(() => {
    if (sortColumn === "startedAt" || sortColumn === "date") {
      return sortDirection === "desc" ? "newest" : "oldest";
    }
    if (sortColumn === "name") {
      return sortDirection === "asc" ? "nameAsc" : "nameDesc";
    }
    if (sortColumn === "duration") {
      return sortDirection === "asc" ? "fastest" : "slowest";
    }
    if (sortColumn === "violations") {
      return sortDirection === "desc" ? "mostViolations" : "leastViolations";
    }
    return "";
  }, [sortColumn, sortDirection]);

  const getSortLabel = React.useCallback(() => {
    if (sortColumn === "name") {
      return sortDirection === "asc"
        ? (language === "id" ? "Nama (A-Z)" : "Name (A-Z)")
        : (language === "id" ? "Nama (Z-A)" : "Name (Z-A)");
    }
    if (sortColumn === "date") {
      return sortDirection === "desc"
        ? (language === "id" ? "Tanggal (Terbaru)" : "Date (Newest)")
        : (language === "id" ? "Tanggal (Terlama)" : "Date (Oldest)");
    }
    if (sortColumn === "startedAt") {
      return sortDirection === "desc" ? t.sortNewest : t.sortOldest;
    }
    if (sortColumn === "lastActiveAt") {
      return sortDirection === "desc"
        ? (language === "id" ? "Aktivitas (Terbaru)" : "Activity (Newest)")
        : (language === "id" ? "Aktivitas (Terlama)" : "Activity (Oldest)");
    }
    if (sortColumn === "duration") {
      return sortDirection === "asc"
        ? t.sortFastest
        : (language === "id" ? "Durasi Terlama" : "Slowest Duration");
    }
    if (sortColumn === "violations") {
      return sortDirection === "desc"
        ? (language === "id" ? "Pelanggaran (Terbanyak)" : "Most Violations")
        : (language === "id" ? "Pelanggaran (Tersedikit)" : "Fewest Violations");
    }
    return t.sortBy;
  }, [sortColumn, sortDirection, t, language]);

  // Sort submissions based on selected sort criteria
  const sortedSubmissions = React.useMemo(() => {
    const list = [...submissions];

    const getDurationMs = (sub: Submission) => {
      const start = new Date(sub.startedAt).getTime();
      const end = new Date(sub.lastActiveAt).getTime();
      if (isNaN(start) || isNaN(end) || end < start) return Infinity;
      return end - start;
    };

    return list.sort((a, b) => {
      let comparison = 0;
      switch (sortColumn) {
        case "name":
          comparison = a.participantName.localeCompare(b.participantName, locale, {
            sensitivity: "base",
          });
          break;
        case "date":
        case "startedAt": {
          const timeA = new Date(a.startedAt).getTime();
          const timeB = new Date(b.startedAt).getTime();
          comparison = timeA - timeB;
          break;
        }
        case "lastActiveAt": {
          const timeA = new Date(a.lastActiveAt).getTime();
          const timeB = new Date(b.lastActiveAt).getTime();
          comparison = timeA - timeB;
          break;
        }
        case "violations":
          comparison = a.violationCount - b.violationCount;
          break;
        case "duration": {
          const durA = getDurationMs(a);
          const durB = getDurationMs(b);
          if (durA === Infinity && durB === Infinity) comparison = 0;
          else if (durA === Infinity) return 1;
          else if (durB === Infinity) return -1;
          else comparison = sortDirection === "asc" ? durA - durB : durB - durA;
          return comparison !== 0
            ? comparison
            : new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime();
        }
      }

      if (comparison === 0) {
        comparison = new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime();
        return comparison;
      }

      return sortDirection === "asc" ? comparison : -comparison;
    });
  }, [submissions, sortColumn, sortDirection, locale]);

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

  // Real-time search, multi-select violation status & specific date filtering
  const filteredSubmissions = React.useMemo(() => {
    let result = sortedSubmissions;
    if (selectedRisks.size < 3) {
      result = result.filter((sub) => selectedRisks.has(riskLevel(sub.violationCount)));
    }
    if (selectedDate) {
      result = result.filter((sub) => {
        const d = new Date(sub.startedAt);
        if (isNaN(d.getTime())) return false;
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, "0");
        const day = String(d.getDate()).padStart(2, "0");
        return `${y}-${m}-${day}` === selectedDate;
      });
    }
    const q = searchQuery.trim().toLowerCase();
    if (q) {
      result = result.filter((sub) =>
        sub.participantName.toLowerCase().includes(q)
      );
    }
    return result;
  }, [sortedSubmissions, searchQuery, selectedRisks, selectedDate]);

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

  const renderToolbar = (inFullscreen: boolean) => (
    <div className="flex flex-col gap-2.5 shrink-0">
      {/* Baris 1: Pencarian (kiri) & Kontrol Tampilan / Layar Penuh (kanan) */}
      <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
        {/* Kiri: Search bar */}
        <div className="relative w-full sm:w-72">
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

        {/* Kanan: Jumlah peserta, toggle pagination/lihat semua, dan tombol layar penuh */}
        <div className="flex items-center justify-between sm:justify-end gap-2.5">
          <span className="font-mono text-xs text-muted-foreground whitespace-nowrap">
            {filteredSubmissions.length} {t.participants.toLowerCase()}
          </span>

          <div className="inline-flex rounded-lg border border-border bg-muted/40 p-0.5 text-xs">
            <button
              type="button"
              onClick={() => setViewMode("pagination")}
              className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors cursor-pointer ${
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
              className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors cursor-pointer ${
                viewMode === "viewMore"
                  ? "bg-background text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t.viewMore}
            </button>
          </div>

          {/* Tombol Full Screen (hanya ditampilkan pada mode biasa agar tidak ada 2 tombol di modal) */}
          {!inFullscreen && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsFullscreen(true)}
              className="size-8 p-0 text-xs font-normal cursor-pointer"
              title={t.fullScreen}
              aria-label={t.fullScreen}
            >
              <ArrowExpand01Icon className="size-4 text-muted-foreground" />
            </Button>
          )}
        </div>
      </div>

      {/* Baris 2: Filter Pelanggaran, Filter Tanggal, dan Urutkan */}
      <div className="flex flex-wrap items-center gap-2">
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
                className="text-primary hover:underline font-medium cursor-pointer"
              >
                {language === "id" ? "Pilih Semua" : "Select All"}
              </button>
              <button
                type="button"
                onClick={clearAllRisks}
                className="text-muted-foreground hover:underline cursor-pointer"
              >
                Reset
              </button>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Filter Tanggal Tertentu Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="h-9 gap-2 text-xs font-normal"
            >
              <Calendar03Icon className="size-3.5 text-muted-foreground" />
              <span>
                {selectedDate
                  ? formatDate(selectedDate + "T00:00:00", locale)
                  : t.allDates}
              </span>
              {selectedDate && (
                <span className="size-1.5 rounded-full bg-primary" />
              )}
              <ArrowDown01Icon className="size-3 text-muted-foreground opacity-70" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56 p-2">
            <DropdownMenuLabel className="text-xs font-semibold px-1 py-1 text-muted-foreground">
              {t.filterDate}
            </DropdownMenuLabel>

            <div className="px-1 py-1.5">
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => {
                  setSelectedDate(e.target.value);
                  setPage(1);
                }}
                className="h-8 text-xs cursor-pointer"
              />
            </div>

            {availableDates.length > 0 && (
              <>
                <DropdownMenuSeparator className="my-1" />
                <div className="max-h-36 overflow-y-auto space-y-0.5">
                  {availableDates.map((dateStr) => {
                    const count = submissions.filter((s) => {
                      const d = new Date(s.startedAt);
                      const y = d.getFullYear();
                      const m = String(d.getMonth() + 1).padStart(2, "0");
                      const day = String(d.getDate()).padStart(2, "0");
                      return `${y}-${m}-${day}` === dateStr;
                    }).length;

                    const isSelected = selectedDate === dateStr;
                    return (
                      <button
                        key={dateStr}
                        type="button"
                        onClick={() => {
                          setSelectedDate(isSelected ? "" : dateStr);
                          setPage(1);
                        }}
                        className={`flex w-full items-center justify-between rounded px-2 py-1 text-xs transition-colors cursor-pointer ${
                          isSelected
                            ? "bg-primary text-primary-foreground font-medium"
                            : "hover:bg-muted text-foreground"
                        }`}
                      >
                        <span>{formatDate(dateStr + "T00:00:00", locale)}</span>
                        <span className="font-mono text-[0.6875rem] opacity-75 tabular-nums">
                          ({count})
                        </span>
                      </button>
                    );
                  })}
                </div>
              </>
            )}

            {selectedDate && (
              <>
                <DropdownMenuSeparator className="my-1" />
                <button
                  type="button"
                  onClick={() => {
                    setSelectedDate("");
                    setPage(1);
                  }}
                  className="flex w-full items-center justify-center rounded px-2 py-1 text-xs text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer"
                >
                  {language === "id" ? "Reset (Semua Tanggal)" : "Reset (All Dates)"}
                </button>
              </>
            )}
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
              <span>{getSortLabel()}</span>
              <ArrowDown01Icon className="size-3 text-muted-foreground opacity-70" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-52 p-1.5">
            <DropdownMenuLabel className="text-xs font-semibold px-2 py-1 text-muted-foreground">
              {t.sortBy}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuRadioGroup
              value={currentPresetValue}
              onValueChange={handlePresetSort}
            >
              <DropdownMenuRadioItem value="newest" className="text-xs cursor-pointer">
                {t.sortNewest}
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="oldest" className="text-xs cursor-pointer">
                {t.sortOldest}
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="nameAsc" className="text-xs cursor-pointer">
                {language === "id" ? "Nama (A-Z)" : "Name (A-Z)"}
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="nameDesc" className="text-xs cursor-pointer">
                {language === "id" ? "Nama (Z-A)" : "Name (Z-A)"}
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="fastest" className="text-xs cursor-pointer">
                {t.sortFastest}
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="slowest" className="text-xs cursor-pointer">
                {language === "id" ? "Durasi Terlama" : "Slowest Duration"}
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="mostViolations" className="text-xs cursor-pointer">
                {language === "id" ? "Pelanggaran Terbanyak" : "Most Violations"}
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="leastViolations" className="text-xs cursor-pointer">
                {language === "id" ? "Pelanggaran Tersedikit" : "Fewest Violations"}
              </DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );

  const renderTable = (inFullscreen: boolean) => {
    if (filteredSubmissions.length === 0) {
      return (
        <div className="flex-1 flex items-center justify-center rounded-lg border border-dashed border-border px-4 py-8 text-center min-h-[160px]">
          <p className="text-xs text-muted-foreground">
            {language === "id"
              ? "Tidak ada peserta yang cocok dengan kriteria filter status, tanggal, atau pencarian."
              : "No participants match the filter, date, or search criteria."}
          </p>
        </div>
      );
    }

    return (
      <div
        className={`rounded-lg border border-border bg-card ${
          inFullscreen
            ? "flex-1 min-h-0 overflow-y-auto overflow-x-auto shadow-inner"
            : viewMode === "viewMore"
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
                      <dt className="text-muted-foreground">{t.date}</dt>
                      <dd className="truncate">{formatDate(submission.startedAt, locale)}</dd>
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
                      className="flex items-center gap-1 rounded-md border border-border p-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted cursor-pointer"
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
                inFullscreen || viewMode === "viewMore"
                  ? "sticky top-0 z-20 bg-card/95 backdrop-blur shadow-xs border-b border-border"
                  : ""
              }
            >
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-10 pl-4 font-mono text-[0.6875rem] font-normal uppercase tracking-[0.12em] text-muted-foreground">
                  #
                </TableHead>
                <TableHead className="font-mono text-[0.6875rem] font-normal uppercase tracking-[0.12em] text-muted-foreground">
                  <button
                    type="button"
                    onClick={() => handleSort("name")}
                    className="group inline-flex items-center gap-1.5 transition-colors hover:text-foreground cursor-pointer select-none"
                    title={`Urutkan ${t.participantName}`}
                  >
                    <span>{t.participantName}</span>
                    <SortIndicator columnKey="name" activeKey={sortColumn} direction={sortDirection} />
                  </button>
                </TableHead>
                <TableHead className="font-mono text-[0.6875rem] font-normal uppercase tracking-[0.12em] text-muted-foreground">
                  <button
                    type="button"
                    onClick={() => handleSort("date")}
                    className="group inline-flex items-center gap-1.5 transition-colors hover:text-foreground cursor-pointer select-none"
                    title={`Urutkan ${t.date}`}
                  >
                    <span>{t.date}</span>
                    <SortIndicator columnKey="date" activeKey={sortColumn} direction={sortDirection} />
                  </button>
                </TableHead>
                <TableHead className="font-mono text-[0.6875rem] font-normal uppercase tracking-[0.12em] text-muted-foreground">
                  <button
                    type="button"
                    onClick={() => handleSort("violations")}
                    className="group inline-flex items-center gap-1.5 transition-colors hover:text-foreground cursor-pointer select-none"
                    title={`Urutkan ${language === "id" ? "Pelanggaran & Status" : "Violations & Status"}`}
                  >
                    <span>{language === "id" ? "Pelanggaran & Status" : "Violations & Status"}</span>
                    <SortIndicator columnKey="violations" activeKey={sortColumn} direction={sortDirection} />
                  </button>
                </TableHead>
                <TableHead className="font-mono text-[0.6875rem] font-normal uppercase tracking-[0.12em] text-muted-foreground">
                  <button
                    type="button"
                    onClick={() => handleSort("startedAt")}
                    className="group inline-flex items-center gap-1.5 transition-colors hover:text-foreground cursor-pointer select-none"
                    title={`Urutkan ${t.startedAt}`}
                  >
                    <span>{t.startedAt}</span>
                    <SortIndicator columnKey="startedAt" activeKey={sortColumn} direction={sortDirection} />
                  </button>
                </TableHead>
                <TableHead className="font-mono text-[0.6875rem] font-normal uppercase tracking-[0.12em] text-muted-foreground">
                  <button
                    type="button"
                    onClick={() => handleSort("lastActiveAt")}
                    className="group inline-flex items-center gap-1.5 transition-colors hover:text-foreground cursor-pointer select-none"
                    title={`Urutkan ${t.lastActive}`}
                  >
                    <span>{t.lastActive}</span>
                    <SortIndicator columnKey="lastActiveAt" activeKey={sortColumn} direction={sortDirection} />
                  </button>
                </TableHead>
                <TableHead className="font-mono text-[0.6875rem] font-normal uppercase tracking-[0.12em] text-muted-foreground">
                  <button
                    type="button"
                    onClick={() => handleSort("duration")}
                    className="group inline-flex items-center gap-1.5 transition-colors hover:text-foreground cursor-pointer select-none"
                    title={`Urutkan ${t.duration}`}
                  >
                    <span>{t.duration}</span>
                    <SortIndicator columnKey="duration" activeKey={sortColumn} direction={sortDirection} />
                  </button>
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
                            className="rounded p-0.5 text-muted-foreground hover:bg-muted cursor-pointer"
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

                      {/* Tanggal Column */}
                      <TableCell className="whitespace-nowrap font-mono text-xs tabular-nums text-muted-foreground">
                        {formatDate(submission.startedAt, locale)}
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
                        <TableCell colSpan={8} className="p-3 pl-12 pr-4">
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
    );
  };

  const renderPagination = () => {
    if (viewMode !== "pagination" || filteredSubmissions.length === 0) return null;
    return (
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1 shrink-0">
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
    );
  };

  return (
    <>
      {/* Normal Embedded View */}
      <div className="space-y-3.5">
        {renderToolbar(false)}
        {renderTable(false)}
        {renderPagination()}
      </div>

      {/* Full Screen Modal View */}
      {isFullscreen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={t.participantResults}
          className="fixed inset-0 z-50 flex flex-col bg-background/98 backdrop-blur-md p-3.5 sm:p-6 overflow-hidden animate-in fade-in-0 duration-200"
        >
          {/* Full Screen Header */}
          <div className="flex items-center justify-between pb-3 border-b border-border mb-3.5 shrink-0">
            <div className="flex items-center gap-2.5">
              <h2 className="text-base sm:text-lg font-semibold tracking-tight">
                {t.participantResults}
              </h2>
              <Badge
                variant="outline"
                className="gap-1.5 text-[0.6875rem] border-emerald-500/40 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 font-normal"
              >
                <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                {t.realtimeBadge}
              </Badge>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsFullscreen(false)}
                className="h-8 gap-1.5 text-xs font-normal cursor-pointer"
              >
                <ArrowShrink01Icon className="size-3.5" />
                <span>{t.exitFullScreen}</span>
                <kbd className="hidden sm:inline-block ml-1 px-1.5 py-0.5 text-[0.625rem] bg-muted border border-border rounded font-mono text-muted-foreground">
                  ESC
                </kbd>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsFullscreen(false)}
                aria-label={t.exitFullScreen}
                className="size-8 text-muted-foreground hover:text-foreground sm:hidden cursor-pointer"
              >
                <Cancel01Icon className="size-4" />
              </Button>
            </div>
          </div>

          {/* Full Screen Table and Controls */}
          <div className="flex-1 flex flex-col min-h-0 space-y-3.5">
            {renderToolbar(true)}
            <div className="flex-1 min-h-0 flex flex-col">
              {renderTable(true)}
            </div>
            {renderPagination()}
          </div>
        </div>
      )}
    </>
  );
}
