-- AlltagsArena public MVP schema.
-- Privacy principle: raw user values are private by default; public views should
-- expose only alias, hero name, display stats, and fight results.

create extension if not exists "pgcrypto";

create table public.players (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid unique,
  alias text not null check (char_length(alias) between 2 and 32),
  created_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table public.heroes (
  id uuid primary key default gen_random_uuid(),
  player_id uuid not null references public.players(id) on delete cascade,
  hero_name text not null check (char_length(hero_name) between 2 and 64),
  source text not null check (source in ('manual', 'random', 'mixed', 'nhanes_seed')),
  raw_values jsonb not null,
  derived_stats jsonb not null,
  is_public boolean not null default true,
  created_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table public.fights (
  id uuid primary key default gen_random_uuid(),
  hero_1_id uuid not null references public.heroes(id),
  hero_2_id uuid not null references public.heroes(id),
  winner_hero_id uuid references public.heroes(id),
  result_code_hero_1 integer not null,
  result_code_hero_2 integer not null,
  rest_hp_hero_1 numeric(6, 1) not null,
  rest_hp_hero_2 numeric(6, 1) not null,
  rounds_started integer not null,
  was_ko boolean not null default false,
  fight_log jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  check (hero_1_id <> hero_2_id)
);

create index heroes_player_id_idx on public.heroes(player_id);
create index heroes_public_idx on public.heroes(is_public) where deleted_at is null;
create index fights_hero_1_idx on public.fights(hero_1_id);
create index fights_hero_2_idx on public.fights(hero_2_id);
create index fights_winner_idx on public.fights(winner_hero_id);

alter table public.players enable row level security;
alter table public.heroes enable row level security;
alter table public.fights enable row level security;

-- Public read policies are intentionally narrow. Raw values remain in `heroes`,
-- so clients should prefer server routes or future public views.
create policy "players can read their own row"
on public.players
for select
using (auth.uid() = auth_user_id);

create policy "players can update their own row"
on public.players
for update
using (auth.uid() = auth_user_id)
with check (auth.uid() = auth_user_id);

create policy "players can read their own heroes"
on public.heroes
for select
using (
  exists (
    select 1 from public.players
    where players.id = heroes.player_id
      and players.auth_user_id = auth.uid()
  )
);

create policy "players can insert their own heroes"
on public.heroes
for insert
with check (
  exists (
    select 1 from public.players
    where players.id = heroes.player_id
      and players.auth_user_id = auth.uid()
  )
);

create policy "players can update their own heroes"
on public.heroes
for update
using (
  exists (
    select 1 from public.players
    where players.id = heroes.player_id
      and players.auth_user_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.players
    where players.id = heroes.player_id
      and players.auth_user_id = auth.uid()
  )
);

create policy "players can read fights involving their heroes"
on public.fights
for select
using (
  exists (
    select 1
    from public.heroes
    join public.players on players.id = heroes.player_id
    where heroes.id in (fights.hero_1_id, fights.hero_2_id)
      and players.auth_user_id = auth.uid()
  )
);

-- Service-role server routes handle public matchmaking and fight insertion.
