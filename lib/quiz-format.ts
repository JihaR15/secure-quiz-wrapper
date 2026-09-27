import type { Quiz, Submission } from "@/lib/db";

export type QuizWithSubmissions = Quiz & { submissions: Submission[] };

export function getQuizUrl(origin: string, quiz: Quiz): string {
  return origin
    ? `${origin}/quiz?form=${quiz.encodedUrl}&id=${quiz.id}`
    : `/quiz?form=${quiz.encodedUrl}&id=${quiz.id}`;
}

export function formatDate(iso: string, locale: string): string {
  return new Date(iso).toLocaleDateString(locale, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function formatTime(iso: string, locale: string): string {
  return new Date(iso).toLocaleTimeString(locale, {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function riskLevel(count: number): "none" | "warning" | "high" {
  if (count >= 5) return "high";
  if (count > 0) return "warning";
  return "none";
}
