"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Delete02Icon, Search01Icon } from "hugeicons-react";
import { useLanguage } from "@/components/providers";
import { formatDate, QuizWithSubmissions } from "@/lib/quiz-format";

type QuizListProps = {
  quizzes: QuizWithSubmissions[];
  selectedId: string | null;
  query: string;
  locale: string;
  onQueryChange: (value: string) => void;
  onSelect: (id: string) => void;
  onRequestDelete: (quiz: QuizWithSubmissions) => void;
};

export function QuizList({
  quizzes,
  selectedId,
  query,
  locale,
  onQueryChange,
  onSelect,
  onRequestDelete,
}: QuizListProps) {
  const { t } = useLanguage();
  const listRef = React.useRef<HTMLUListElement | null>(null);

  const filtered = React.useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return quizzes;
    return quizzes.filter((quiz) => quiz.title.toLowerCase().includes(needle));
  }, [quizzes, query]);

  const onKeyDown = (event: React.KeyboardEvent<HTMLUListElement>) => {
    if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
    event.preventDefault();
    const items = Array.from(
      listRef.current?.querySelectorAll<HTMLButtonElement>("[data-quiz-item]") ?? [],
    );
    const current = items.findIndex((item) => item === document.activeElement);
    const nextIndex =
      event.key === "ArrowDown"
        ? Math.min(current + 1, items.length - 1)
        : Math.max(current - 1, 0);
    items[nextIndex === -1 ? 0 : nextIndex]?.focus();
  };

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search01Icon
          aria-hidden
          className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder={t.searchQuizzes}
          aria-label={t.searchQuizzes}
          className="h-10 pl-9 sm:h-9"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border px-4 py-10 text-center">
          <p className="text-sm font-medium">{t.noQuizzesTitle}</p>
          <p className="mx-auto mt-1 max-w-[30ch] text-pretty text-xs text-muted-foreground">
            {t.noQuizzesSub}
          </p>
        </div>
      ) : (
        <ul
          ref={listRef}
          onKeyDown={onKeyDown}
          className="space-y-1 outline-none"
          aria-label={t.myQuizzes}
        >
          {filtered.map((quiz) => {
            const selected = quiz.id === selectedId;
            const violations = quiz.submissions.reduce(
              (total, submission) => total + submission.violationCount,
              0,
            );

            return (
              <li key={quiz.id}>
                <div
                  className={`group relative flex items-start gap-2 rounded-lg border-l-2 py-2.5 pl-3 pr-2 transition-colors ${
                    selected
                      ? "border-l-primary bg-accent/60"
                      : "border-l-transparent hover:bg-muted/60"
                  }`}
                >
                  <button
                    type="button"
                    data-quiz-item
                    onClick={() => onSelect(quiz.id)}
                    aria-current={selected}
                    className="min-w-0 flex-1 text-left outline-none focus-visible:underline"
                  >
                    <span className="block truncate text-sm font-medium tracking-[-0.01em]">
                      {quiz.title}
                    </span>
                    <span className="mt-1 flex flex-wrap items-center gap-x-2.5 gap-y-0.5 font-mono text-[0.6875rem] tabular-nums text-muted-foreground">
                      <span className={`inline-flex items-center gap-1 font-sans text-[0.65rem] font-medium px-1.5 py-0.5 rounded ${
                        (quiz.isActive ?? true)
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                          : "bg-muted text-muted-foreground line-through decoration-transparent"
                      }`}>
                        <span className={`size-1.5 rounded-full ${
                          (quiz.isActive ?? true) ? "bg-emerald-500" : "bg-muted-foreground/60"
                        }`} />
                        {(quiz.isActive ?? true) ? t.quizStatusActive : t.quizStatusInactive}
                      </span>
                      <span>{formatDate(quiz.createdAt, locale)}</span>
                      <span>
                        {quiz.submissions.length} {t.participants.toLowerCase()}
                      </span>
                      <span className={violations > 0 ? "text-destructive" : undefined}>
                        {violations} {t.violations.toLowerCase()}
                      </span>
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onRequestDelete(quiz)}
                    title={t.deleteQuiz}
                    aria-label={`${t.deleteQuiz}: ${quiz.title}`}
                    className="mt-0.5 shrink-0 rounded-md p-2.5 text-muted-foreground transition-colors hover:text-destructive focus-visible:text-destructive sm:p-1.5 sm:opacity-0 sm:focus-visible:opacity-100 sm:group-hover:opacity-100"
                  >
                    <Delete02Icon className="size-4" />
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
