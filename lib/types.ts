export interface Admin {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  createdAt: string;
}

export interface Quiz {
  id: string;
  adminId: string;
  title: string;
  formUrl: string;
  encodedUrl: string;
  /** Optional link to the published results sheet, supplied by the teacher. */
  resultUrl: string | null;
  createdAt: string;
}

export type ViolationType = "tab" | "window" | "clipboard" | "contextmenu";

export type ViolationBreakdown = Record<ViolationType, number>;

export interface Submission {
  id: string;
  quizId: string;
  participantName: string;
  violationCount: number;
  /** Per-type violation counts. Backfills to zeros when absent from old rows. */
  violationBreakdown: ViolationBreakdown;
  status: "active" | "completed";
  startedAt: string;
  lastActiveAt: string;
}

export interface DatabaseSchema {
  admins: Admin[];
  quizzes: Quiz[];
  submissions: Submission[];
}
