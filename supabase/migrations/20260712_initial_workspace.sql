create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  plan text not null default 'free' check (plan in ('free', 'creator', 'studio', 'agency')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.workspaces (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  local_id text not null default 'personal',
  name text not null default 'My Content Workspace',
  mode text not null default 'brand' check (mode in ('brand', 'agency')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (owner_id, local_id)
);

create table if not exists public.workspace_members (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'owner' check (role in ('owner', 'editor', 'viewer')),
  created_at timestamptz not null default now(),
  unique (workspace_id, user_id)
);

create table if not exists public.brands (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  owner_id uuid not null references auth.users(id) on delete cascade,
  local_id text not null,
  name text not null,
  category text not null default '',
  brain_data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (workspace_id, local_id)
);

create table if not exists public.content_projects (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  brand_id uuid not null references public.brands(id) on delete cascade,
  owner_id uuid not null references auth.users(id) on delete cascade,
  local_id text not null,
  title text not null default 'Untitled content',
  objective text not null default 'Awareness',
  format text not null default 'Short video',
  platform text not null default 'Multi-platform',
  status text not null default 'Idea' check (status in ('Idea', 'Draft', 'Review', 'Approved', 'Published', 'Learned')),
  scheduled_for date,
  content_data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (workspace_id, local_id)
);

create table if not exists public.content_versions (
  id uuid primary key default gen_random_uuid(),
  content_project_id uuid not null references public.content_projects(id) on delete cascade,
  owner_id uuid not null references auth.users(id) on delete cascade,
  local_id text not null,
  label text not null,
  reason text not null default '',
  output jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (content_project_id, local_id)
);

create table if not exists public.memory_entries (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  brand_id uuid not null references public.brands(id) on delete cascade,
  content_project_id uuid references public.content_projects(id) on delete cascade,
  owner_id uuid not null references auth.users(id) on delete cascade,
  entry_type text not null,
  value text not null,
  source text not null default 'brand_brain',
  approved_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.revision_logs (
  id uuid primary key default gen_random_uuid(),
  content_project_id uuid not null references public.content_projects(id) on delete cascade,
  owner_id uuid not null references auth.users(id) on delete cascade,
  reason text not null,
  classification text,
  source text not null default 'manual',
  created_at timestamptz not null default now()
);

create table if not exists public.performance_entries (
  id uuid primary key default gen_random_uuid(),
  content_project_id uuid not null references public.content_projects(id) on delete cascade,
  owner_id uuid not null references auth.users(id) on delete cascade,
  metric text not null default 'Manual result',
  value text not null default '',
  notes text not null default '',
  captured_at timestamptz not null default now()
);

create table if not exists public.approvals (
  id uuid primary key default gen_random_uuid(),
  content_project_id uuid not null references public.content_projects(id) on delete cascade,
  owner_id uuid not null references auth.users(id) on delete cascade,
  owner_name text not null default 'Founder',
  state text not null default 'Drafting',
  revision_reason text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.exports (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  content_project_id uuid references public.content_projects(id) on delete set null,
  owner_id uuid not null references auth.users(id) on delete cascade,
  export_type text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.ai_runs (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  brand_id uuid references public.brands(id) on delete set null,
  content_project_id uuid references public.content_projects(id) on delete set null,
  owner_id uuid not null references auth.users(id) on delete cascade,
  job_type text not null,
  model text not null,
  input_summary jsonb not null default '{}'::jsonb,
  context_sources jsonb not null default '[]'::jsonb,
  output jsonb not null default '{}'::jsonb,
  disposition text not null default 'pending' check (disposition in ('pending', 'approved', 'rejected')),
  adopted_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists workspaces_owner_id_idx on public.workspaces(owner_id);
create index if not exists brands_workspace_id_idx on public.brands(workspace_id);
create index if not exists content_projects_brand_id_idx on public.content_projects(brand_id);
create index if not exists content_projects_workspace_scheduled_for_idx on public.content_projects(workspace_id, scheduled_for) where scheduled_for is not null;
create index if not exists ai_runs_owner_created_idx on public.ai_runs(owner_id, created_at desc);

create or replace function public.set_updated_at()
returns trigger language plpgsql security invoker as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id) values (new.id) on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();
insert into public.profiles (id) select id from auth.users on conflict (id) do nothing;

drop trigger if exists profiles_updated_at on public.profiles;
create trigger profiles_updated_at before update on public.profiles for each row execute function public.set_updated_at();
drop trigger if exists workspaces_updated_at on public.workspaces;
create trigger workspaces_updated_at before update on public.workspaces for each row execute function public.set_updated_at();
drop trigger if exists brands_updated_at on public.brands;
create trigger brands_updated_at before update on public.brands for each row execute function public.set_updated_at();
drop trigger if exists content_projects_updated_at on public.content_projects;
create trigger content_projects_updated_at before update on public.content_projects for each row execute function public.set_updated_at();
drop trigger if exists approvals_updated_at on public.approvals;
create trigger approvals_updated_at before update on public.approvals for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.workspaces enable row level security;
alter table public.workspace_members enable row level security;
alter table public.brands enable row level security;
alter table public.content_projects enable row level security;
alter table public.content_versions enable row level security;
alter table public.memory_entries enable row level security;
alter table public.revision_logs enable row level security;
alter table public.performance_entries enable row level security;
alter table public.approvals enable row level security;
alter table public.exports enable row level security;
alter table public.ai_runs enable row level security;

create policy "profiles own data" on public.profiles for all using (id = auth.uid()) with check (id = auth.uid());
create policy "workspaces own data" on public.workspaces for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "workspace members own data" on public.workspace_members for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "brands own data" on public.brands for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "content projects own data" on public.content_projects for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "versions own data" on public.content_versions for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "memory own data" on public.memory_entries for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "revisions own data" on public.revision_logs for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "performance own data" on public.performance_entries for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "approvals own data" on public.approvals for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "exports own data" on public.exports for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "ai runs own data" on public.ai_runs for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());
