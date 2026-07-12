create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  plan text not null default 'free' check (plan in ('free', 'solo', 'studio')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  client_key text not null,
  name text not null,
  industry text not null default '',
  profile_data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (owner_id, client_key)
);

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  client_id uuid not null references public.clients(id) on delete cascade,
  local_id text not null,
  title text not null,
  status text not null default 'New lead',
  workspace_data jsonb not null default '{}'::jsonb,
  started_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (owner_id, local_id)
);

create table if not exists public.approvals (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,
  owner_name text not null default 'Founder',
  state text not null default 'Drafting',
  revision_reason text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.memory_entries (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  client_id uuid not null references public.clients(id) on delete cascade,
  project_id uuid references public.projects(id) on delete cascade,
  entry_type text not null,
  value text not null,
  source text not null default 'workspace',
  created_at timestamptz not null default now()
);

create table if not exists public.revision_logs (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,
  local_id text not null,
  reason text not null,
  approval_state text,
  approval_owner text,
  occurred_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique (owner_id, project_id, local_id)
);

create table if not exists public.learning_logs (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,
  local_id text not null,
  happened_at timestamptz not null default now(),
  status text,
  feedback text,
  learning text,
  winning_pattern text,
  next_decision text,
  changed_fields jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  unique (owner_id, project_id, local_id)
);

create table if not exists public.efficiency_snapshots (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,
  local_id text not null,
  captured_at timestamptz not null default now(),
  brief_prep_minutes numeric not null default 0,
  approval_wait_days numeric not null default 0,
  revision_rounds numeric not null default 0,
  report_prep_minutes numeric not null default 0,
  created_at timestamptz not null default now(),
  unique (owner_id, project_id, local_id)
);

create table if not exists public.exports (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  project_id uuid references public.projects(id) on delete set null,
  export_type text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.ai_runs (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  project_id uuid references public.projects(id) on delete set null,
  job_type text not null,
  model text not null,
  input_summary jsonb not null default '{}'::jsonb,
  context_sources jsonb not null default '[]'::jsonb,
  output jsonb not null default '{}'::jsonb,
  disposition text not null default 'pending' check (disposition in ('pending', 'approved', 'rejected')),
  adopted_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists clients_owner_id_idx on public.clients(owner_id);
create index if not exists projects_owner_id_idx on public.projects(owner_id);
create index if not exists projects_client_id_idx on public.projects(client_id);
create index if not exists ai_runs_owner_created_idx on public.ai_runs(owner_id, created_at desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
security invoker
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_updated_at on public.profiles;
create trigger profiles_updated_at before update on public.profiles for each row execute function public.set_updated_at();
drop trigger if exists clients_updated_at on public.clients;
create trigger clients_updated_at before update on public.clients for each row execute function public.set_updated_at();
drop trigger if exists projects_updated_at on public.projects;
create trigger projects_updated_at before update on public.projects for each row execute function public.set_updated_at();
drop trigger if exists approvals_updated_at on public.approvals;
create trigger approvals_updated_at before update on public.approvals for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id) values (new.id) on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();

insert into public.profiles (id)
select id from auth.users
on conflict (id) do nothing;

alter table public.profiles enable row level security;
alter table public.clients enable row level security;
alter table public.projects enable row level security;
alter table public.approvals enable row level security;
alter table public.memory_entries enable row level security;
alter table public.revision_logs enable row level security;
alter table public.learning_logs enable row level security;
alter table public.efficiency_snapshots enable row level security;
alter table public.exports enable row level security;
alter table public.ai_runs enable row level security;

create policy "profiles read own data" on public.profiles for select using (id = auth.uid());
create policy "clients own data" on public.clients for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "projects own data" on public.projects for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "approvals own data" on public.approvals for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "memory own data" on public.memory_entries for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "revisions own data" on public.revision_logs for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "learning own data" on public.learning_logs for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "efficiency own data" on public.efficiency_snapshots for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "exports own data" on public.exports for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "ai runs own data" on public.ai_runs for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());
