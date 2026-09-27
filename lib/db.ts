import fs from "fs";
import path from "path";

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

interface DatabaseSchema {
  admins: Admin[];
  quizzes: Quiz[];
  submissions: Submission[];
}

const DATA_DIR = path.join(process.cwd(), ".data");
const DB_FILE = path.join(DATA_DIR, "db.json");

function ensureDbFile(): DatabaseSchema {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (!fs.existsSync(DB_FILE)) {
    const initialData: DatabaseSchema = {
      admins: [],
      quizzes: [],
      submissions: [],
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2), "utf-8");
    return initialData;
  }

  try {
    const content = fs.readFileSync(DB_FILE, "utf-8");
    return JSON.parse(content) as DatabaseSchema;
  } catch {
    const initialData: DatabaseSchema = {
      admins: [],
      quizzes: [],
      submissions: [],
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2), "utf-8");
    return initialData;
  }
}

function saveDb(data: DatabaseSchema): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf-8");
}

// Admin DB Helpers
export function findAdminByEmail(email: string): Admin | undefined {
  const db = ensureDbFile();
  return db.admins.find((a) => a.email.toLowerCase() === email.toLowerCase());
}

export function findAdminById(id: string): Admin | undefined {
  const db = ensureDbFile();
  return db.admins.find((a) => a.id === id);
}

export function createAdmin(admin: Admin): Admin {
  const db = ensureDbFile();
  db.admins.push(admin);
  saveDb(db);
  return admin;
}

// Quiz DB Helpers
export function getQuizzesByAdmin(adminId: string): Quiz[] {
  const db = ensureDbFile();
  return db.quizzes.filter((q) => q.adminId === adminId);
}

export function getQuizById(quizId: string): Quiz | undefined {
  const db = ensureDbFile();
  return db.quizzes.find((q) => q.id === quizId);
}

export function createQuiz(quiz: Quiz): Quiz {
  const db = ensureDbFile();
  db.quizzes.push(quiz);
  saveDb(db);
  return quiz;
}

export function deleteQuiz(quizId: string, adminId: string): boolean {
  const db = ensureDbFile();
  const index = db.quizzes.findIndex((q) => q.id === quizId && q.adminId === adminId);
  if (index !== -1) {
    db.quizzes.splice(index, 1);
    db.submissions = db.submissions.filter((s) => s.quizId !== quizId);
    saveDb(db);
    return true;
  }
  return false;
}

// Submission DB Helpers
export function getSubmissionsByQuiz(quizId: string): Submission[] {
  const db = ensureDbFile();
  return db.submissions.filter((s) => s.quizId === quizId);
}

export function createSubmission(submission: Submission): Submission {
  const db = ensureDbFile();
  db.submissions.push(submission);
  saveDb(db);
  return submission;
}

export function updateSubmissionViolations(
  submissionId: string,
  violationCount: number
): Submission | null {
  const db = ensureDbFile();
  const sub = db.submissions.find((s) => s.id === submissionId);
  if (sub) {
    sub.violationCount = violationCount;
    sub.lastActiveAt = new Date().toISOString();
    saveDb(db);
    return sub;
  }
  return null;
}
