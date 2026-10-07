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
  /** When true, hides violation warnings and counts from participants (logged secretly for admin). */
  isStealthMode: boolean;
  /** When true, quiz is active and accessible by participants. When false, shows inactive notice. */
  isActive: boolean;
  createdAt: string;
}

export type ViolationType = "tab" | "window";

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
