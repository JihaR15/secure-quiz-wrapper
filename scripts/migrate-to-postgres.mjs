/**
 * Copies `.data/db.json` into Postgres.
 *
 * Usage:
 *   DATABASE_URL="postgresql://..." node scripts/migrate-to-postgres.mjs
 *
 * Safe to run repeatedly: every table is keyed by the same id the JSON file
 * uses, so rows are upserted instead of duplicated. Run it once before
 * switching the app over, and keep the JSON file as a backup.
 */
import fs from "fs";
import path from "path";
import postgres from "postgres";

const connectionString =
  process.env.DATABASE_URL || process.env.POSTGRES_URL || process.env.SUPABASE_DB_URL;

if (!connectionString) {
  console.error("DATABASE_URL belum diisi. Contoh:");
  console.error('  DATABASE_URL="postgresql://user:pass@host:5432/db" node scripts/migrate-to-postgres.mjs');
  process.exit(1);
}

const dbFile = path.join(process.cwd(), ".data", "db.json");
if (!fs.existsSync(dbFile)) {
  console.error(`.data/db.json tidak ditemukan di ${dbFile}`);
  process.exit(1);
}

const { admins = [], quizzes = [], submissions = [] } = JSON.parse(
  fs.readFileSync(dbFile, "utf-8")
);

if (admins.length + quizzes.length + submissions.length === 0) {
  console.log("Tidak ada data untuk dimigrasikan.");
  process.exit(0);
}

const sql = postgres(connectionString, { prepare: false, max: 1 });

async function main() {
  await sql.begin(async (tx) => {
    for (const admin of admins) {
      await tx`
        insert into admins (id, email, password_hash, name, created_at)
        values (${admin.id}, ${admin.email}, ${admin.passwordHash}, ${admin.name}, ${admin.createdAt})
        on conflict (id) do update set
          email = excluded.email,
          password_hash = excluded.password_hash,
          name = excluded.name
      `;
    }
    console.log(`admins      : ${admins.length}`);

    for (const quiz of quizzes) {
      await tx`
        insert into quizzes (id, admin_id, title, form_url, encoded_url, result_url, created_at)
        values (${quiz.id}, ${quiz.adminId}, ${quiz.title}, ${quiz.formUrl}, ${quiz.encodedUrl}, ${quiz.resultUrl ?? null}, ${quiz.createdAt})
        on conflict (id) do update set
          title = excluded.title,
          form_url = excluded.form_url,
          encoded_url = excluded.encoded_url,
          result_url = excluded.result_url
      `;
    }
    console.log(`quizzes     : ${quizzes.length}`);

    for (const sub of submissions) {
      await tx`
        insert into submissions (id, quiz_id, participant_name, violation_count, status, started_at, last_active_at)
        values (${sub.id}, ${sub.quizId}, ${sub.participantName}, ${sub.violationCount}, ${sub.status}, ${sub.startedAt}, ${sub.lastActiveAt})
        on conflict (id) do update set
          participant_name = excluded.participant_name,
          violation_count = excluded.violation_count,
          status = excluded.status,
          last_active_at = excluded.last_active_at
      `;
    }
    console.log(`submissions : ${submissions.length}`);

    const [counts] = await tx`
      select
        (select count(*) from admins)      as admins,
        (select count(*) from quizzes)     as quizzes,
        (select count(*) from submissions) as submissions
    `;
    console.log(
      `total di postgres: ${counts.admins} admins, ${counts.quizzes} quizzes, ${counts.submissions} submissions`
    );
  });

  await sql.end();
  console.log("Migrasi selesai. .data/db.json tetap dipakai sebagai backup.");
}

main().catch(async (error) => {
  console.error("Migrasi gagal:", error.message);
  await sql.end().catch(() => {});
  process.exit(1);
});
