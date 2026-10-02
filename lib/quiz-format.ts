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

export function formatDuration(
  startedAt: string | Date,
  lastActiveAt: string | Date,
  language: string = "id"
): string {
  const start = new Date(startedAt).getTime();
  const end = new Date(lastActiveAt).getTime();

  if (isNaN(start) || isNaN(end) || end < start) {
    return "-";
  }

  const diffMs = end - start;
  const totalSeconds = Math.floor(diffMs / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const isId = language === "id";

  if (hours > 0) {
    if (minutes === 0) {
      return isId ? `${hours} jam` : `${hours}h`;
    }
    return isId ? `${hours} jam ${minutes} mnt` : `${hours}h ${minutes}m`;
  }

  if (minutes > 0) {
    if (seconds === 0) {
      return isId ? `${minutes} mnt` : `${minutes}m`;
    }
    return isId ? `${minutes} mnt ${seconds} dtk` : `${minutes}m ${seconds}s`;
  }

  return isId ? `${seconds} dtk` : `${seconds}s`;
}

