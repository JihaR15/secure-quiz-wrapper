"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Add01Icon, Comment01Icon, Logout01Icon, UserIcon } from "hugeicons-react";
import { Logo, Wordmark } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DotGrid } from "@/components/react-bits/dot-grid";
import { CreateQuizForm } from "@/components/admin/create-quiz-form";
import { EditProfileDialog } from "@/components/admin/edit-profile-dialog";
import { FeedbackDialog } from "@/components/feedback/feedback-dialog";
import { QuizList } from "@/components/admin/quiz-list";
import { QuizDetail } from "@/components/admin/quiz-detail";
import { LanguageToggle } from "@/components/site/language-toggle";
import { ThemeToggle } from "@/components/site/theme-toggle";
import { useLanguage, useTheme } from "@/components/providers";
import { getQuizUrl, QuizWithSubmissions } from "@/lib/quiz-format";
import { isHttpUrl } from "@/lib/result-url";
import type { Submission } from "@/lib/db";

const LOCALE = { id: "id-ID", en: "en-GB" } as const;

function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <Skeleton className="h-3 w-28" />
        <Skeleton className="h-8 w-72" />
        <Skeleton className="h-3.5 w-full max-w-md" />
      </div>
      <div className="grid gap-6 lg:grid-cols-12">
        <div className="space-y-2 lg:col-span-4">
          <Skeleton className="h-9 w-full" />
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-14 w-full" />
          ))}
        </div>
        <div className="space-y-4 lg:col-span-8">
          <Skeleton className="h-10 w-full" />
          <div className="grid grid-cols-2 gap-px sm:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-20 w-full" />
            ))}
          </div>
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const { t, language } = useLanguage();
  const { theme } = useTheme();
  const locale = LOCALE[language];

  const [quizzes, setQuizzes] = React.useState<QuizWithSubmissions[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [selectedQuizId, setSelectedQuizId] = React.useState<string | null>(null);
  const [query, setQuery] = React.useState("");
  const [adminName, setAdminName] = React.useState("");
  const [adminEmail, setAdminEmail] = React.useState("");
  const [isProfileModalOpen, setIsProfileModalOpen] = React.useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = React.useState(false);

  const [titleInput, setTitleInput] = React.useState("");
  const [urlInput, setUrlInput] = React.useState("");
  const [resultUrlInput, setResultUrlInput] = React.useState("");
  const [resultUrlError, setResultUrlError] = React.useState("");
  const [error, setError] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = React.useState(false);

  const [mobilePane, setMobilePane] = React.useState("quizzes");
  const [copiedId, setCopiedId] = React.useState<string | null>(null);
  const [quizPendingDelete, setQuizPendingDelete] =
    React.useState<QuizWithSubmissions | null>(null);
  const [submissionPendingDelete, setSubmissionPendingDelete] =
    React.useState<Submission | null>(null);

  const loadQuizzes = React.useCallback(
    async (adminName?: string, silent = false) => {
      if (adminName !== undefined) setAdminName(adminName);

      try {
        const res = await fetch("/api/quizzes");
        const data = await res.json();

        if (res.ok && Array.isArray(data.quizzes)) {
          const nextQuizzes: QuizWithSubmissions[] = data.quizzes;
          setQuizzes(nextQuizzes);
          // Keep the current selection when it survives, otherwise fall back.
          setSelectedQuizId((current) =>
            current && nextQuizzes.some((quiz) => quiz.id === current)
              ? current
              : (nextQuizzes[0]?.id ?? null),
          );
        }
      } catch {
        if (!silent) toast.error(t.toastNetworkError);
      }
    },
    [t.toastNetworkError],
  );

  // Browser-only value, read as a snapshot so SSR and hydration stay in sync.
  const origin = React.useSyncExternalStore(
    React.useCallback(() => () => {}, []),
    () => window.location.origin,
    () => "",
  );

  React.useEffect(() => {
    let cancelled = false;

    fetch("/api/auth/me")
      .then((res) =>
        res
          .json()
          .then(
            (body: {
              authenticated?: boolean;
              admin?: { name?: string; email?: string };
            }) => ({ res, body })
          )
      )
      .then(({ res, body }) => {
        if (cancelled) return;
        if (!res.ok || !body.authenticated) {
          router.replace("/admin/login");
          return;
        }
        if (body.admin?.email) setAdminEmail(body.admin.email);
        return loadQuizzes(body.admin?.name ?? "");
      })
      .catch(() => {
        if (!cancelled) router.replace("/admin/login");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [loadQuizzes, router]);

  // Periodic auto-refresh every 5 seconds to update participant table and violations live
  React.useEffect(() => {
    if (loading) return;
    const interval = setInterval(() => {
      void loadQuizzes(undefined, true);
    }, 5000);

    return () => clearInterval(interval);
  }, [loading, loadQuizzes]);

  const selectedQuiz = quizzes.find((quiz) => quiz.id === selectedQuizId) ?? null;

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/admin/login");
  };

  const handleCreateQuiz = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!titleInput.trim() || !urlInput.trim()) {
      setError(t.formRequired);
      return;
    }

    // The results link is optional, so only validate it when it was filled in.
    const resultLink = resultUrlInput.trim();
    if (resultLink && !isHttpUrl(resultLink)) {
      setResultUrlError(t.resultUrlInvalid);
      return;
    }

    setSubmitting(true);
    setError("");
    setResultUrlError("");

    try {
      const res = await fetch("/api/quizzes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: titleInput.trim(),
          formUrl: urlInput.trim(),
          resultUrl: resultLink,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? t.toastCreateFailed);
        return;
      }

      setTitleInput("");
      setUrlInput("");
      setResultUrlInput("");
      setIsCreateModalOpen(false);
      toast.success(t.toastCreated);
      await loadQuizzes();
    } catch {
      setError(t.toastNetworkError);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateResultUrl = async (
    quizId: string,
    resultUrl: string
  ): Promise<boolean> => {
    try {
      const res = await fetch("/api/quizzes", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quizId, resultUrl }),
      });
      if (!res.ok) return false;
      await loadQuizzes();
      return true;
    } catch {
      return false;
    }
  };

  const handleCopyLink = async (quiz: QuizWithSubmissions) => {
    const fullUrl = getQuizUrl(origin, quiz);

    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopiedId(quiz.id);
      window.setTimeout(() => setCopiedId(null), 2200);
    } catch {
      toast.error(t.toastCopyFailed);
    }
  };

  const confirmDeleteQuiz = async () => {
    if (!quizPendingDelete) return;
    const target = quizPendingDelete;
    setQuizPendingDelete(null);

    try {
      const res = await fetch(`/api/quizzes?id=${target.id}`, { method: "DELETE" });
      if (!res.ok) return;
      setSelectedQuizId((current) => (current === target.id ? null : current));
      toast.success(t.toastDeletedQuiz);
      await loadQuizzes();
    } catch {
      toast.error(t.toastNetworkError);
    }
  };

  const confirmDeleteSubmission = async () => {
    if (!submissionPendingDelete) return;
    const target = submissionPendingDelete;
    setSubmissionPendingDelete(null);

    try {
      const res = await fetch(`/api/submissions?id=${target.id}`, { method: "DELETE" });
      if (!res.ok) return;
      toast.success(t.toastDeletedSubmission);
      await loadQuizzes();
    } catch {
      toast.error(t.toastNetworkError);
    }
  };

  const adminFirstName = adminName.trim().split(" ")[0] || adminName;

  return (
    <div className="flex min-h-svh flex-col overflow-x-clip bg-background">
      {/* React Bits DotGrid: a magnetic dot field instead of the landing hero\'s
          Threads shader. It stays out of the way — masked to the upper right and
          painted under the cards — and it costs a canvas 2D pass, not a fragment
          shader evaluating Perlin noise 40 times per pixel. */}
      <div className="fixed inset-0 -z-10">
        <DotGrid
          className="size-full [mask-image:radial-gradient(120%_85%_at_78%_0%,#000_10%,transparent_72%)]"
          dotSize={theme === "dark" ? 3 : 2.5}
          gap={theme === "dark" ? 30 : 28}
          baseColor={
            theme === "dark" ? "rgba(240,244,238,0.16)" : "rgba(18,22,18,0.11)"
          }
          activeColor={
            theme === "dark" ? "rgba(126,231,183,0.95)" : "rgba(13,120,86,0.85)"
          }
        />
      </div>

      <header className="sticky top-0 z-40 border-b border-border/70 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex h-16 w-full max-w-[1400px] items-center justify-between gap-3 px-4 sm:px-6">
          <Link
            href="/"
            className="flex shrink-0 items-center gap-2.5 py-1.5"
            aria-label={t.appName}
          >
            <Logo priority />
            <Wordmark className="hidden sm:inline" />
          </Link>

          <div className="flex items-center gap-1 sm:gap-1.5">
            {adminFirstName ? (
              <button
                type="button"
                onClick={() => setIsProfileModalOpen(true)}
                title={t.accountSettings}
                aria-label={t.accountSettings}
                className="group flex items-center gap-1.5 rounded-full border border-border/80 bg-card/60 px-2 py-1 text-xs font-medium text-foreground transition-all hover:bg-muted hover:border-foreground/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:px-3 sm:py-1.5 sm:text-sm"
              >
                <div className="flex size-5 items-center justify-center rounded-full bg-primary/10 text-primary transition-colors group-hover:bg-primary/20">
                  <UserIcon className="size-3 sm:size-3.5" />
                </div>
                <span className="max-w-[8ch] truncate sm:max-w-[14ch]">{adminFirstName}</span>
              </button>
            ) : null}
            <LanguageToggle className="h-9 sm:h-8" />
            <ThemeToggle className="size-9 sm:size-8" />
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              title={t.logout}
              aria-label={t.logout}
              className="size-9 sm:size-8"
            >
              <Logout01Icon className="size-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1400px] flex-1 px-4 py-10 sm:px-6 sm:py-14">
        {loading ? (
          <DashboardSkeleton />
        ) : (
          <div className="space-y-10">
            {/* Page title & Actions */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <span aria-hidden className="h-px w-8 bg-primary" />
                  <span className="font-mono text-[0.6875rem] uppercase tracking-[0.2em] text-muted-foreground">
                    {t.adminConsole}
                  </span>
                </div>
                <h1 className="font-display text-[clamp(1.75rem,4vw,2.75rem)] font-medium leading-[1.05] tracking-[-0.03em] text-balance">
                  {t.dashboardTitle}
                </h1>
                <p className="max-w-[62ch] text-pretty text-sm leading-relaxed text-muted-foreground">
                  {t.dashboardSub}
                </p>
              </div>

              <div className="shrink-0 sm:self-center">
                <Button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="h-10 w-full sm:w-auto gap-2 px-4 shadow-sm"
                >
                  <Add01Icon className="size-4" />
                  <span>{t.newQuizModalButton}</span>
                </Button>
              </div>
            </div>

            {/* Create quiz dialog modal */}
            <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
              <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Add01Icon className="size-4 text-primary" />
                    <span>{t.createQuizTitle}</span>
                  </DialogTitle>
                  <DialogDescription>
                    {t.newQuizModalDesc}
                  </DialogDescription>
                </DialogHeader>
                <div className="pt-2">
                  <CreateQuizForm
                    title={titleInput}
                    url={urlInput}
                    resultUrl={resultUrlInput}
                    resultUrlError={resultUrlError}
                    error={error}
                    submitting={submitting}
                    onTitleChange={setTitleInput}
                    onUrlChange={setUrlInput}
                    onResultUrlChange={setResultUrlInput}
                    onSubmit={handleCreateQuiz}
                  />
                </div>
              </DialogContent>
            </Dialog>

            {/* Quizzes + detail. Below lg the two panes become tabs; at lg both
                are shown side by side, so the inactive panel is only hidden
                with a `lg:hidden` override rather than the `hidden` attribute. */}
            <Tabs
              value={mobilePane}
              onValueChange={setMobilePane}
              className="gap-6 lg:hidden"
            >
              <TabsList>
                <TabsTrigger value="quizzes" className="h-10 sm:h-8">
                  {t.tabQuizzes}
                  <span className="font-mono text-[0.6875rem] tabular-nums opacity-60">
                    {quizzes.length}
                  </span>
                </TabsTrigger>
                <TabsTrigger value="detail" className="h-10 sm:h-8">
                  {t.tabDetail}
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="grid gap-8 lg:grid-cols-12">
              <section
                className={`space-y-4 lg:col-span-4 ${
                  mobilePane === "detail" ? "hidden lg:block" : ""
                }`}
              >
                <h2 className="flex items-baseline gap-2 text-sm font-semibold tracking-[-0.01em]">
                  {t.myQuizzes}
                  <span className="font-mono text-xs font-normal tabular-nums text-muted-foreground">
                    ({quizzes.length})
                  </span>
                </h2>
                <QuizList
                  quizzes={quizzes}
                  selectedId={selectedQuizId}
                  query={query}
                  locale={locale}
                  onQueryChange={setQuery}
                  onSelect={setSelectedQuizId}
                  onRequestDelete={setQuizPendingDelete}
                />
              </section>

              <section
                className={`lg:col-span-8 ${
                  mobilePane === "quizzes" ? "hidden lg:block" : ""
                }`}
              >
                {selectedQuiz ? (
                  <QuizDetail
                    key={selectedQuiz.id}
                    quiz={selectedQuiz}
                    origin={origin}
                    locale={locale}
                    copied={copiedId === selectedQuiz.id}
                    onCopy={handleCopyLink}
                    onRequestDeleteSubmission={setSubmissionPendingDelete}
                    onUpdateResultUrl={handleUpdateResultUrl}
                  />
                ) : (
                  <div className="rounded-xl border border-dashed border-border px-6 py-16 text-center">
                    <p className="text-sm font-medium">{t.noQuizSelectedTitle}</p>
                    <p className="mx-auto mt-1.5 max-w-[38ch] text-pretty text-sm text-muted-foreground">
                      {t.noQuizSelectedSub}
                    </p>
                  </div>
                )}
              </section>
            </div>
          </div>
        )}
      </main>

      <footer className="mt-auto border-t border-border/60 py-6">
        <div className="mx-auto flex max-w-[1400px] flex-col items-center justify-between gap-3 px-4 text-xs text-muted-foreground sm:flex-row sm:px-6">
          <p>© {new Date().getFullYear()} Secure Quiz Wrapper · Controlled Assessment System</p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsFeedbackOpen(true)}
            className="h-8 gap-2 rounded-full border-border bg-card/60 text-xs shadow-sm hover:bg-muted"
          >
            <Comment01Icon className="size-3.5 text-primary" />
            <span>{t.feedbackButton}</span>
          </Button>
        </div>
      </footer>

      <AlertDialog
        open={quizPendingDelete !== null}
        onOpenChange={(open) => !open && setQuizPendingDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t.deleteQuizTitle}</AlertDialogTitle>
            <AlertDialogDescription>
              {quizPendingDelete
                ? `${quizPendingDelete.title} — ${t.deleteQuizBody}`
                : t.deleteQuizBody}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t.cancel}</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteQuiz}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              {t.deleteConfirm}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={submissionPendingDelete !== null}
        onOpenChange={(open) => !open && setSubmissionPendingDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t.deleteParticipantTitle}</AlertDialogTitle>
            <AlertDialogDescription>
              {submissionPendingDelete
                ? `${submissionPendingDelete.participantName} — ${t.deleteParticipantBody}`
                : t.deleteParticipantBody}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t.cancel}</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteSubmission}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              {t.deleteConfirm}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <EditProfileDialog
        open={isProfileModalOpen}
        onOpenChange={setIsProfileModalOpen}
        currentName={adminName}
        currentEmail={adminEmail}
        onSuccess={(updatedName) => {
          setAdminName(updatedName);
        }}
      />
      <FeedbackDialog
        open={isFeedbackOpen}
        onOpenChange={setIsFeedbackOpen}
        defaultName={adminName}
        defaultEmail={adminEmail}
      />
    </div>
  );
}
