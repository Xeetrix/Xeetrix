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
  session_id text not null,
  speaker text not null,
  message text not null,
  mode text,
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

create table if not exists public.os_reflections (
  id uuid primary key default gen_random_uuid(),
  command_id uuid,
  outcome text,
  failure_reason text,
  lesson text,
  improvement_suggestion text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists os_tasks_status_due_idx on public.os_tasks (status, due_at);
create index if not exists os_tasks_project_idx on public.os_tasks (project_name);
create index if not exists os_memories_project_idx on public.os_memories (project_name);
create index if not exists os_memories_type_idx on public.os_memories (memory_type);
create index if not exists os_conversations_session_idx on public.os_conversations (session_id, created_at);
create index if not exists os_action_plans_command_idx on public.os_action_plans (command_id);
create index if not exists os_action_plans_status_idx on public.os_action_plans (status);
create index if not exists os_agent_logs_command_idx on public.os_agent_logs (command_id, created_at);
create index if not exists os_reflections_command_idx on public.os_reflections (command_id, created_at);

grant usage on schema public to service_role;
grant select, insert, update, delete on public.os_tasks to service_role;
grant select, insert, update, delete on public.os_memories to service_role;
grant select, insert, update, delete on public.os_conversations to service_role;
grant select, insert, update, delete on public.os_action_plans to service_role;
grant select, insert, update, delete on public.os_agent_logs to service_role;
grant select, insert, update, delete on public.os_reflections to service_role;

notify pgrst, 'reload schema';
