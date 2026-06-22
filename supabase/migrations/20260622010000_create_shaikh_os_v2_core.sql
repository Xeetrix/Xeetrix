create extension if not exists pgcrypto;

create table if not exists public.os_tasks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  project_name text,
  status text not null default 'pending',
  priority text,
  due_at timestamptz,
  source_command text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.os_memories (
  id uuid primary key default gen_random_uuid(),
  memory_type text not null default 'note',
  title text,
  content text not null,
  project_name text,
  entities jsonb not null default '[]'::jsonb,
  confidence numeric(3,2),
  source_command text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.os_conversations (
  id uuid primary key default gen_random_uuid(),
  user_message text not null,
  assistant_message text,
  mode text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.os_agent_logs (
  id uuid primary key default gen_random_uuid(),
  command_id uuid,
  step text not null,
  input jsonb,
  output jsonb,
  error text,
  model text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.os_action_plans (
  id uuid primary key default gen_random_uuid(),
  command_id uuid not null,
  raw_command text not null,
  intent text,
  action_type text not null,
  project_name text,
  title text,
  payload jsonb not null default '{}'::jsonb,
  confidence numeric(3,2),
  requires_confirmation boolean not null default true,
  status text not null default 'proposed',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists os_tasks_status_due_idx on public.os_tasks (status, due_at);
create index if not exists os_tasks_project_idx on public.os_tasks (project_name);
create index if not exists os_memories_project_idx on public.os_memories (project_name);
create index if not exists os_memories_type_idx on public.os_memories (memory_type);
create index if not exists os_action_plans_command_idx on public.os_action_plans (command_id);
create index if not exists os_action_plans_status_idx on public.os_action_plans (status);
