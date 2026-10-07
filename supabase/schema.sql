-- Schema for the Secure Quiz Wrapper.
--
-- Run this in the Supabase SQL editor (or any Postgres client) before
-- pointing DATABASE_URL at the project. It is safe to run more than once.
--
-- The app only ever talks to this database from the Next.js server using the
-- connection string, never from the browser. Do not enable the anon/public
-- API key for participants: a proctoring tool must not let examinees read or
-- edit their own records.

create table if not exists admins (
  id            text primary key,
  email         text not null unique,
  password_hash text not null,
  name          text not null,
  created_at    timestamptz not null default now()
);

create table if not exists quizzes (
  id          text primary key,
  admin_id    text not null references admins (id) on delete cascade,
  title       text not null,
  form_url    text not null,
  encoded_url text not null,
  result_url  text,
  is_stealth_mode boolean not null default false,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now()
);

-- The results link is optional, so rows written before this column existed
-- are backfilled here. Safe to run repeatedly.
alter table quizzes add column if not exists result_url text;

-- Stealth mode (hide violations from participants, logged secretly for admin)
alter table quizzes add column if not exists is_stealth_mode boolean not null default false;

-- Active status (when false, quiz is locked and inaccessible outside scheduled hours)
alter table quizzes add column if not exists is_active boolean not null default true;

create index if not exists quizzes_admin_id_created_at_idx
  on quizzes (admin_id, created_at);

create table if not exists submissions (
  id               text primary key,
  quiz_id          text not null references quizzes (id) on delete cascade,
  participant_name text not null,
  violation_count  integer not null default 0,
  violation_breakdown jsonb not null default '{}'::jsonb,
  status           text not null default 'active' check (status in ('active', 'completed')),
  started_at       timestamptz not null default now(),
  last_active_at   timestamptz not null default now()
);

-- Backfill rows written before per-type breakdowns existed. Safe to repeat.
alter table submissions add column if not exists violation_breakdown jsonb not null default '{}'::jsonb;

create index if not exists submissions_quiz_id_started_at_idx
  on submissions (quiz_id, started_at);
