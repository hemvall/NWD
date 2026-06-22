-- Adds set tracking to lifts and a workout calendar (Push / Pull / Legs / Arms).
-- Safe to run after 0001 — idempotent.

-- ── Number of sets per logged lift ────────────────────────────────────────
alter table public.sport_lifts
  add column if not exists sets integer not null default 1;

-- ── Workout calendar: one workout type per user per day ───────────────────
create table if not exists public.sport_workouts (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users (id) on delete cascade,
  workout_date  date not null,
  type          text not null,
  created_at    timestamptz not null default now(),
  unique (user_id, workout_date)
);

create index if not exists sport_workouts_user_date_idx on public.sport_workouts (user_id, workout_date);

alter table public.sport_workouts enable row level security;

do $$
begin
  if not exists (select 1 from pg_policies where tablename = 'sport_workouts' and policyname = 'own rows') then
    create policy "own rows" on public.sport_workouts
      for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
  end if;
end $$;
