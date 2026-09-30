import fs from "fs";
import path from "path";
import postgres from "postgres";
import type { Admin, DatabaseSchema, Quiz, Submission, ViolationType } from "@/lib/types";

export type { Admin, Quiz, Submission, ViolationType } from "@/lib/types";

/**
 * Storage layer.
 *
 * Two interchangeable backends behind one async interface:
 *
 * - Postgres (Supabase, Neon, Vercel Postgres, any pg host) whenever
 *   `DATABASE_URL` is set. This is what serverless hosts such as Vercel
 *   require, because their filesystem is read-only and does not survive
 *   between invocations.
 * - A JSON file at `.data/db.json` otherwise, so local development and
 *   self-hosted installs keep working with zero configuration.
 *
 * Both return the exact same shapes, with timestamps as ISO strings, so
 * nothing above this file has to care which backend is live.
 */
interface Store {
  readonly kind: "postgres" | "json";
  findAdminByEmail(email: string): Promise<Admin | undefined>;
  findAdminById(id: string): Promise<Admin | undefined>;
  createAdmin(admin: Admin): Promise<Admin>;
  updateAdminPassword(id: string, passwordHash: string): Promise<boolean>;
  updateAdminProfile(
    id: string,
    updates: { name?: string; passwordHash?: string }
  ): Promise<Admin | null>;
  getQuizzesByAdmin(adminId: string): Promise<Quiz[]>;
  getQuizById(quizId: string): Promise<Quiz | undefined>;
  createQuiz(quiz: Quiz): Promise<Quiz>;
  updateQuizResultUrl(quizId: string, adminId: string, resultUrl: string | null): Promise<Quiz | null>;
  deleteQuiz(quizId: string, adminId: string): Promise<boolean>;
  getSubmissionsByQuiz(quizId: string): Promise<Submission[]>;
  getSubmissionsByQuizIds(quizIds: string[]): Promise<Submission[]>;
  createSubmission(submission: Submission): Promise<Submission>;
  updateSubmissionViolations(
    submissionId: string,
    violationType: ViolationType
  ): Promise<Submission | null>;
  updateSubmissionStatus(
    submissionId: string,
    status: Submission["status"]
  ): Promise<Submission | null>;
  deleteSubmission(submissionId: string): Promise<boolean>;
}

/* ------------------------------------------------------------------ *
 * JSON file backend
 * ------------------------------------------------------------------ */

const EMPTY_BREAKDOWN: Submission["violationBreakdown"] = {
  tab: 0,
  window: 0,
  clipboard: 0,
  contextmenu: 0,
};

/** Submissions written before breakdowns existed read as all zeros. */
const withBreakdown = (
  breakdown: Submission["violationBreakdown"] | null | undefined
): Submission["violationBreakdown"] => ({
  ...EMPTY_BREAKDOWN,
  ...(breakdown ?? {}),
});

const DATA_DIR = path.join(process.cwd(), ".data");
const DB_FILE = path.join(DATA_DIR, "db.json");

function readJsonDb(): DatabaseSchema {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (!fs.existsSync(DB_FILE)) {
    const initial: DatabaseSchema = { admins: [], quizzes: [], submissions: [] };
    fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2), "utf-8");
    return initial;
  }

  try {
    return JSON.parse(fs.readFileSync(DB_FILE, "utf-8")) as DatabaseSchema;
  } catch {
    const initial: DatabaseSchema = { admins: [], quizzes: [], submissions: [] };
    fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2), "utf-8");
    return initial;
  }
}

function writeJsonDb(data: DatabaseSchema): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf-8");
}

const jsonStore: Store = {
  kind: "json",

  async findAdminByEmail(email) {
    const db = readJsonDb();
    return db.admins.find((a) => a.email.toLowerCase() === email.toLowerCase());
  },

  async findAdminById(id) {
    const db = readJsonDb();
    return db.admins.find((a) => a.id === id);
  },

  async createAdmin(admin) {
    const db = readJsonDb();
    db.admins.push(admin);
    writeJsonDb(db);
    return admin;
  },

  async updateAdminPassword(id, passwordHash) {
    const db = readJsonDb();
    const admin = db.admins.find((a) => a.id === id);
    if (!admin) return false;
    admin.passwordHash = passwordHash;
    writeJsonDb(db);
    return true;
  },

  async updateAdminProfile(id, updates) {
    const db = readJsonDb();
    const admin = db.admins.find((a) => a.id === id);
    if (!admin) return null;
    if (updates.name !== undefined && updates.name.trim()) {
      admin.name = updates.name.trim();
    }
    if (updates.passwordHash !== undefined) {
      admin.passwordHash = updates.passwordHash;
    }
    writeJsonDb(db);
    return admin;
  },

  async getQuizzesByAdmin(adminId) {
    const db = readJsonDb();
    return db.quizzes.filter((q) => q.adminId === adminId).map(withResultUrl);
  },

  async getQuizById(quizId) {
    const db = readJsonDb();
    const quiz = db.quizzes.find((q) => q.id === quizId);
    return quiz ? withResultUrl(quiz) : undefined;
  },

  async createQuiz(quiz) {
    const db = readJsonDb();
    const stored: Quiz = { ...quiz, resultUrl: quiz.resultUrl ?? null };
    db.quizzes.push(stored);
    writeJsonDb(db);
    return stored;
  },

  async updateQuizResultUrl(quizId, adminId, resultUrl) {
    const db = readJsonDb();
    const quiz = db.quizzes.find((q) => q.id === quizId && q.adminId === adminId);
    if (!quiz) return null;
    quiz.resultUrl = resultUrl;
    writeJsonDb(db);
    return withResultUrl(quiz);
  },

  async deleteQuiz(quizId, adminId) {
    const db = readJsonDb();
    const index = db.quizzes.findIndex((q) => q.id === quizId && q.adminId === adminId);
    if (index === -1) return false;
    db.quizzes.splice(index, 1);
    db.submissions = db.submissions.filter((s) => s.quizId !== quizId);
    writeJsonDb(db);
    return true;
  },

  async getSubmissionsByQuiz(quizId) {
    const db = readJsonDb();
    return db.submissions
      .filter((s) => s.quizId === quizId)
      .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime())
      .map((s) => ({ ...s, violationBreakdown: withBreakdown(s.violationBreakdown) }));
  },

  async getSubmissionsByQuizIds(quizIds) {
    if (quizIds.length === 0) return [];
    const db = readJsonDb();
    const wanted = new Set(quizIds);
    return db.submissions
      .filter((s) => wanted.has(s.quizId))
      .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime())
      .map((s) => ({ ...s, violationBreakdown: withBreakdown(s.violationBreakdown) }));
  },

  async createSubmission(submission) {
    const db = readJsonDb();
    db.submissions.push(submission);
    writeJsonDb(db);
    return { ...submission, violationBreakdown: withBreakdown(submission.violationBreakdown) };
  },

  async updateSubmissionViolations(submissionId, violationType) {
    const db = readJsonDb();
    const sub = db.submissions.find((s) => s.id === submissionId);
    if (!sub) return null;
    sub.violationCount = (sub.violationCount || 0) + 1;
    sub.violationBreakdown = withBreakdown(sub.violationBreakdown);
    sub.violationBreakdown[violationType] = (sub.violationBreakdown[violationType] || 0) + 1;
    sub.lastActiveAt = new Date().toISOString();
    writeJsonDb(db);
    return { ...sub, violationBreakdown: { ...sub.violationBreakdown } };
  },

  async updateSubmissionStatus(submissionId, status) {
    const db = readJsonDb();
    const sub = db.submissions.find((s) => s.id === submissionId);
    if (!sub) return null;
    sub.status = status;
    sub.lastActiveAt = new Date().toISOString();
    writeJsonDb(db);
    return { ...sub, violationBreakdown: withBreakdown(sub.violationBreakdown) };
  },

  async deleteSubmission(submissionId) {
    const db = readJsonDb();
    const index = db.submissions.findIndex((s) => s.id === submissionId);
    if (index === -1) return false;
    db.submissions.splice(index, 1);
    writeJsonDb(db);
    return true;
  },
};

/* ------------------------------------------------------------------ *
 * Postgres backend
 * ------------------------------------------------------------------ */

interface AdminRow {
  id: string;
  email: string;
  password_hash: string;
  name: string;
  created_at: Date | string;
}

interface QuizRow {
  id: string;
  admin_id: string;
  title: string;
  form_url: string;
  encoded_url: string;
  result_url: string | null;
  created_at: Date | string;
}

interface SubmissionRow {
  id: string;
  quiz_id: string;
  participant_name: string;
  violation_count: number;
  violation_breakdown: Submission["violationBreakdown"] | null;
  status: Submission["status"];
  started_at: Date | string;
  last_active_at: Date | string;
}

const iso = (value: Date | string): string =>
  value instanceof Date ? value.toISOString() : new Date(value).toISOString();

const toAdmin = (row: AdminRow): Admin => ({
  id: row.id,
  email: row.email,
  passwordHash: row.password_hash,
  name: row.name,
  createdAt: iso(row.created_at),
});

const toQuiz = (row: QuizRow): Quiz => ({
  id: row.id,
  adminId: row.admin_id,
  title: row.title,
  formUrl: row.form_url,
  encodedUrl: row.encoded_url,
  resultUrl: row.result_url ?? null,
  createdAt: iso(row.created_at),
});

/** Quizzes written before resultUrl existed simply have none. */
const withResultUrl = (quiz: Quiz): Quiz => ({
  ...quiz,
  resultUrl: quiz.resultUrl ?? null,
});

const toSubmission = (row: SubmissionRow): Submission => ({
  id: row.id,
  quizId: row.quiz_id,
  participantName: row.participant_name,
  violationCount: row.violation_count,
  violationBreakdown: withBreakdown(row.violation_breakdown),
  status: row.status,
  startedAt: iso(row.started_at),
  lastActiveAt: iso(row.last_active_at),
});

function createPostgresStore(connectionString: string): Store {
  // prepare:false keeps the pooler in transaction mode working, and a small
  // pool per warm lambda keeps us well inside the provider's connection cap.
  const sql = postgres(connectionString, {
    prepare: false,
    max: Number(process.env.DATABASE_POOL_MAX ?? 2),
    idle_timeout: 20,
    connect_timeout: 10,
  });

  return {
    kind: "postgres",

    async findAdminByEmail(email) {
      const rows = await sql<AdminRow[]>`
        select * from admins where lower(email) = lower(${email}) limit 1
      `;
      return rows[0] ? toAdmin(rows[0]) : undefined;
    },

    async findAdminById(id) {
      const rows = await sql<AdminRow[]>`select * from admins where id = ${id} limit 1`;
      return rows[0] ? toAdmin(rows[0]) : undefined;
    },

    async createAdmin(admin) {
      const rows = await sql<AdminRow[]>`
        insert into admins (id, email, password_hash, name, created_at)
        values (${admin.id}, ${admin.email}, ${admin.passwordHash}, ${admin.name}, ${admin.createdAt})
        returning *
      `;
      return toAdmin(rows[0]);
    },

    async updateAdminPassword(id, passwordHash) {
      const rows = await sql<{ id: string }[]>`
        update admins
        set password_hash = ${passwordHash}
        where id = ${id}
        returning id
      `;
      return rows.length > 0;
    },

    async updateAdminProfile(id, updates) {
      const name = updates.name?.trim();
      const passwordHash = updates.passwordHash;

      if (name !== undefined && passwordHash !== undefined) {
        const rows = await sql<AdminRow[]>`
          update admins
          set name = ${name}, password_hash = ${passwordHash}
          where id = ${id}
          returning *
        `;
        return rows[0] ? toAdmin(rows[0]) : null;
      } else if (name !== undefined) {
        const rows = await sql<AdminRow[]>`
          update admins
          set name = ${name}
          where id = ${id}
          returning *
        `;
        return rows[0] ? toAdmin(rows[0]) : null;
      } else if (passwordHash !== undefined) {
        const rows = await sql<AdminRow[]>`
          update admins
          set password_hash = ${passwordHash}
          where id = ${id}
          returning *
        `;
        return rows[0] ? toAdmin(rows[0]) : null;
      }

      const rows = await sql<AdminRow[]>`select * from admins where id = ${id} limit 1`;
      return rows[0] ? toAdmin(rows[0]) : null;
    },

    async getQuizzesByAdmin(adminId) {
      const rows = await sql<QuizRow[]>`
        select * from quizzes where admin_id = ${adminId} order by created_at asc, id asc
      `;
      return rows.map(toQuiz);
    },

    async getQuizById(quizId) {
      const rows = await sql<QuizRow[]>`select * from quizzes where id = ${quizId} limit 1`;
      return rows[0] ? toQuiz(rows[0]) : undefined;
    },

    async createQuiz(quiz) {
      const rows = await sql<QuizRow[]>`
        insert into quizzes (id, admin_id, title, form_url, encoded_url, result_url, created_at)
        values (${quiz.id}, ${quiz.adminId}, ${quiz.title}, ${quiz.formUrl}, ${quiz.encodedUrl}, ${quiz.resultUrl ?? null}, ${quiz.createdAt})
        returning *
      `;
      return toQuiz(rows[0]);
    },

    async updateQuizResultUrl(quizId, adminId, resultUrl) {
      const rows = await sql<QuizRow[]>`
        update quizzes
        set result_url = ${resultUrl}
        where id = ${quizId} and admin_id = ${adminId}
        returning *
      `;
      return rows[0] ? toQuiz(rows[0]) : null;
    },

    async deleteQuiz(quizId, adminId) {
      // submissions are removed by the on delete cascade in supabase/schema.sql
      const rows = await sql<{ id: string }[]>`
        delete from quizzes where id = ${quizId} and admin_id = ${adminId} returning id
      `;
      return rows.length > 0;
    },

    async getSubmissionsByQuiz(quizId) {
      const rows = await sql<SubmissionRow[]>`
        select * from submissions where quiz_id = ${quizId} order by started_at desc, id desc
      `;
      return rows.map(toSubmission);
    },

    async getSubmissionsByQuizIds(quizIds) {
      if (quizIds.length === 0) return [];
      const rows = await sql<SubmissionRow[]>`
        select * from submissions
        where quiz_id in ${sql(quizIds)}
        order by started_at desc, id desc
      `;
      return rows.map(toSubmission);
    },

    async createSubmission(submission) {
      const rows = await sql<SubmissionRow[]>`
        insert into submissions (id, quiz_id, participant_name, violation_count, violation_breakdown, status, started_at, last_active_at)
        values (
          ${submission.id}, ${submission.quizId}, ${submission.participantName},
          ${submission.violationCount}, ${sql.json(submission.violationBreakdown ?? EMPTY_BREAKDOWN)},
          ${submission.status}, ${submission.startedAt}, ${submission.lastActiveAt}
        )
        returning *
      `;
      return toSubmission(rows[0]);
    },

    async updateSubmissionViolations(submissionId, violationType) {
      // Atomic increment on violation_count and jsonb_set for violation_breakdown.
      // This eliminates read-modify-write race conditions and ensures high-concurrency safety.
      const rows = await sql<SubmissionRow[]>`
        update submissions
        set violation_count = violation_count + 1,
            violation_breakdown = jsonb_set(
              coalesce(violation_breakdown, '{"tab":0,"window":0,"clipboard":0,"contextmenu":0}'::jsonb),
              array[${violationType}]::text[],
              to_jsonb(coalesce((violation_breakdown->>${violationType})::int, 0) + 1),
              true
            ),
            last_active_at = now()
        where id = ${submissionId}
        returning *
      `;
      return rows[0] ? toSubmission(rows[0]) : null;
    },

    async updateSubmissionStatus(submissionId, status) {
      const rows = await sql<SubmissionRow[]>`
        update submissions
        set status = ${status},
            last_active_at = now()
        where id = ${submissionId}
        returning *
      `;
      return rows[0] ? toSubmission(rows[0]) : null;
    },

    async deleteSubmission(submissionId) {
      const rows = await sql<{ id: string }[]>`
        delete from submissions where id = ${submissionId} returning id
      `;
      return rows.length > 0;
    },
  };
}

/* ------------------------------------------------------------------ *
 * Backend selection
 * ------------------------------------------------------------------ */

let store: Store | null = null;

function resolveStore(): Store {
  if (typeof window !== "undefined") {
    throw new Error(
      "lib/db is server-only. Import it from route handlers or server components."
    );
  }

  // Supabase names this POSTGRES_URL, Vercel Postgres names it POSTGRES_URL
  // too, and everyone else calls it DATABASE_URL. The 6543 transaction pooler
  // is deliberately not supported: it cannot hold prepared statements.
  const connectionString =
    process.env.DATABASE_URL ||
    process.env.POSTGRES_URL ||
    process.env.SUPABASE_DB_URL ||
    "";

  if (!connectionString) return jsonStore;

  if (connectionString.includes(":6543")) {
    throw new Error(
      "DATABASE_URL memakai port 6543 (transaction pooler). Gunakan Session pooler port 5432."
    );
  }

  return createPostgresStore(connectionString);
}

function getStore(): Store {
  if (!store) store = resolveStore();
  return store;
}

export function getStorageKind(): "postgres" | "json" {
  return getStore().kind;
}

/* ------------------------------------------------------------------ *
 * Public API
 * ------------------------------------------------------------------ */

export function findAdminByEmail(email: string): Promise<Admin | undefined> {
  return getStore().findAdminByEmail(email);
}

export function findAdminById(id: string): Promise<Admin | undefined> {
  return getStore().findAdminById(id);
}

export function createAdmin(admin: Admin): Promise<Admin> {
  return getStore().createAdmin(admin);
}

export function updateAdminPassword(id: string, passwordHash: string): Promise<boolean> {
  return getStore().updateAdminPassword(id, passwordHash);
}

export function updateAdminProfile(
  id: string,
  updates: { name?: string; passwordHash?: string }
): Promise<Admin | null> {
  return getStore().updateAdminProfile(id, updates);
}

export function getQuizzesByAdmin(adminId: string): Promise<Quiz[]> {
  return getStore().getQuizzesByAdmin(adminId);
}

export function getQuizById(quizId: string): Promise<Quiz | undefined> {
  return getStore().getQuizById(quizId);
}

export function createQuiz(quiz: Quiz): Promise<Quiz> {
  return getStore().createQuiz(quiz);
}

export function updateQuizResultUrl(
  quizId: string,
  adminId: string,
  resultUrl: string | null
): Promise<Quiz | null> {
  return getStore().updateQuizResultUrl(quizId, adminId, resultUrl);
}

export function deleteQuiz(quizId: string, adminId: string): Promise<boolean> {
  return getStore().deleteQuiz(quizId, adminId);
}

export function getSubmissionsByQuiz(quizId: string): Promise<Submission[]> {
  return getStore().getSubmissionsByQuiz(quizId);
}

export function getSubmissionsByQuizIds(quizIds: string[]): Promise<Submission[]> {
  return getStore().getSubmissionsByQuizIds(quizIds);
}

export function createSubmission(submission: Submission): Promise<Submission> {
  return getStore().createSubmission(submission);
}

export function updateSubmissionViolations(
  submissionId: string,
  violationType: ViolationType
): Promise<Submission | null> {
  return getStore().updateSubmissionViolations(submissionId, violationType);
}

export function updateSubmissionStatus(
  submissionId: string,
  status: Submission["status"]
): Promise<Submission | null> {
  return getStore().updateSubmissionStatus(submissionId, status);
}

export function deleteSubmission(submissionId: string): Promise<boolean> {
  return getStore().deleteSubmission(submissionId);
}
