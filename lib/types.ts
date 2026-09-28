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
  createdAt: string;
}

export interface Submission {
  id: string;
  quizId: string;
  participantName: string;
  violationCount: number;
  status: "active" | "completed";
  startedAt: string;
  lastActiveAt: string;
}

export interface DatabaseSchema {
  admins: Admin[];
  quizzes: Quiz[];
  submissions: Submission[];
}
