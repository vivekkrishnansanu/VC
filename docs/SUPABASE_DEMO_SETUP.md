# Supabase Demo Setup (Storage for Demo, MySQL for Production)

For demo environments, we can store onboarding progress + answers in Supabase (Postgres) so the UI can **save/resume**.

For production, we will continue to use **Prisma + MySQL** (as already designed).

## What we store in Supabase (demo)

We store JSON “snapshots” in two tables:

- `demo_onboarding_sessions`: step progress (current step, completed steps, status, locked)
- `demo_location_onboarding`: onboarding answers (all form fields as JSON)

This avoids having to re-model the full MySQL Prisma schema inside Supabase for demo purposes.

## 1) Create a Supabase project

Create a project in Supabase and copy:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY` (server-side only; never expose to the browser)

## 2) Run this SQL in Supabase (SQL Editor)

```sql
create table if not exists public.demo_onboarding_sessions (
  location_id text primary key,
  payload jsonb not null,
  updated_at timestamptz not null default now()
);

create table if not exists public.demo_location_onboarding (
  location_id text primary key,
  payload jsonb not null,
  updated_at timestamptz not null default now()
);
```

## 3) Add env vars locally

Set these in your `.env` (server-side only):

```bash
SUPABASE_URL="https://YOUR_PROJECT.supabase.co"
SUPABASE_SERVICE_ROLE_KEY="YOUR_SERVICE_ROLE_KEY"
```

## 4) What endpoints use Supabase (demo)

When the env vars above are present, these endpoints will persist to Supabase:

- `GET/PATCH /api/onboarding/session`
- `GET/PATCH /api/onboarding/data`
- `POST /api/onboarding/copy`

If env vars are **not** present, the app falls back to in-memory storage for sessions/onboarding data.

