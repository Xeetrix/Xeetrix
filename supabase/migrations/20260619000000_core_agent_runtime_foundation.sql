create table if not exists public.agent_memories (
  id uuid primary key default gen_random_uuid(),
  observation_id uuid references public.agent_observations(id) on delete set null,
  memory_type text not null default 'note',
  title text,
  summary text,
  content text,
  project_name text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.agent_entities (
  id uuid primary key default gen_random_uuid(),
  entity_type text not null,
  name text not null,
  aliases text[] not null default '{}',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(entity_type, name)
);

create table if not exists public.agent_facts (
  id uuid primary key default gen_random_uuid(),
  subject text not null,
  predicate text not null,
  object jsonb not null default '{}'::jsonb,
  confidence numeric(4,3) not null default 0.700,
  source_memory_id uuid references public.agent_memories(id) on delete set null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.agent_goals (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  status text not null default 'active',
  priority text not null default 'medium',
  project_name text,
  due_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- agent_action_plans is the single canonical runtime/action plan table.
-- The stale runtime-plan table is intentionally not created; active runtime paths use the canonical action-plan table.
alter table public.agent_action_plans add column if not exists command_id text;
alter table public.agent_action_plans add column if not exists raw_command text;
alter table public.agent_action_plans add column if not exists execution_result jsonb not null default '{}'::jsonb;
alter table public.agent_action_plans add column if not exists updated_at timestamptz not null default now();

create table if not exists public.agent_tool_calls (
  id uuid primary key default gen_random_uuid(),
  command_id text,
  plan_id uuid references public.agent_action_plans(id) on delete set null,
  tool_name text not null,
  input jsonb not null default '{}'::jsonb,
  output jsonb not null default '{}'::jsonb,
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

create table if not exists public.agent_evaluations (
  id uuid primary key default gen_random_uuid(),
  command_id text,
  plan_id uuid references public.agent_action_plans(id) on delete set null,
  score numeric(4,3),
  label text,
  reasoning jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.agent_lessons (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  lesson text not null,
  source_evaluation_id uuid references public.agent_evaluations(id) on delete set null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.agent_command_events (
  id uuid primary key default gen_random_uuid(),
  command_id text not null,
  event_type text not null check (event_type in ('observation','retrieved_context','reasoning','action_plan','confirmation','cancel','execution_result','answer')),
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists agent_memories_project_idx on public.agent_memories(project_name, created_at desc);
create index if not exists agent_memories_type_idx on public.agent_memories(memory_type, created_at desc);
create index if not exists agent_action_plans_runtime_status_idx on public.agent_action_plans(status, created_at desc);
create index if not exists agent_command_events_command_idx on public.agent_command_events(command_id, created_at desc);
create index if not exists agent_tool_calls_plan_idx on public.agent_tool_calls(plan_id, created_at desc);
