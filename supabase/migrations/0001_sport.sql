-- Sport / Gym section — persisted in Supabase (mirrors the finances tables).
-- Run this in the Supabase SQL editor (or via the CLI) once.

-- ── Profile: one row per user ─────────────────────────────────────────────
create table if not exists public.sport_profiles (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users (id) on delete cascade,
  name            text not null,
  gender          text not null,
  age             integer not null,
  height_cm       numeric not null,
  weight_kg       numeric not null,
  experience      text not null,
  activity        text not null,
  phase           text not null,
  objective       text not null,
  target_weight_kg numeric,
  lift_targets    jsonb,
  calorie_override numeric,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  unique (user_id)
);

-- ── Body-weight log: one entry per user per day ───────────────────────────
create table if not exists public.sport_body_entries (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users (id) on delete cascade,
  entry_date  date not null,
  weight_kg   numeric not null,
  created_at  timestamptz not null default now(),
  unique (user_id, entry_date)
);

-- ── Lift log: many entries per user ───────────────────────────────────────
create table if not exists public.sport_lifts (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users (id) on delete cascade,
  lift_date   date not null,
  lift        text not null,
  weight_kg   numeric not null,
  reps        integer not null,
  sets        integer not null default 1,
  created_at  timestamptz not null default now()
);

create index if not exists sport_body_entries_user_date_idx on public.sport_body_entries (user_id, entry_date);
create index if not exists sport_lifts_user_date_idx on public.sport_lifts (user_id, lift_date);

-- ── Row Level Security: each user only sees their own rows ─────────────────
alter table public.sport_profiles     enable row level security;
alter table public.sport_body_entries enable row level security;
alter table public.sport_lifts        enable row level security;

do $$
begin
  if not exists (select 1 from pg_policies where tablename = 'sport_profiles' and policyname = 'own rows') then
    create policy "own rows" on public.sport_profiles
      for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
  end if;
  if not exists (select 1 from pg_policies where tablename = 'sport_body_entries' and policyname = 'own rows') then
    create policy "own rows" on public.sport_body_entries
      for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
  end if;
  if not exists (select 1 from pg_policies where tablename = 'sport_lifts' and policyname = 'own rows') then
    create policy "own rows" on public.sport_lifts
      for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
  end if;
end $$;
