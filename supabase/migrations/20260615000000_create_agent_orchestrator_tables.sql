create table if not exists public.agent_observations (
  id uuid primary key default gen_random_uuid(),
  source_type text not null,
  source_id text not null,
  raw_text text not null,
  metadata jsonb not null default '{}'::jsonb,
  received_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table if not exists public.agent_reasoning_logs (
  id uuid primary key default gen_random_uuid(),
  observation_id uuid references public.agent_observations(id) on delete set null,
  understanding jsonb not null default '{}'::jsonb,
  related_context jsonb not null default '{}'::jsonb,
  reasoning jsonb not null default '{}'::jsonb,
  confidence numeric(4,3),
  created_at timestamptz not null default now()
);

create table if not exists public.agent_action_plans (
  id uuid primary key default gen_random_uuid(),
  observation_id uuid references public.agent_observations(id) on delete set null,
  reasoning_log_id uuid references public.agent_reasoning_logs(id) on delete set null,
  command_id text,
  raw_command text,
  action_type text not null check (action_type in ('save_memory','create_task','create_reminder','create_meeting','answer_query','suggest_only','ask_clarification','update_existing_item')),
  target_table text,
  payload jsonb not null default '{}'::jsonb,
  explanation text,
  confidence numeric(4,3),
  requires_confirmation boolean not null default true,
  status text not null default 'proposed',
  created_at timestamptz not null default now(),
  execution_result jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  executed_at timestamptz
);

create table if not exists public.agent_feedback (
  id uuid primary key default gen_random_uuid(),
  action_plan_id uuid references public.agent_action_plans(id) on delete set null,
  raw_feedback text not null,
  correction jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.agent_preferences (
  id uuid primary key default gen_random_uuid(),
  preference_key text not null unique,
  preference_value jsonb not null default '{}'::jsonb,
  source text not null default 'agent_feedback',
  confidence numeric(4,3) not null default 0.700,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists agent_observations_source_idx on public.agent_observations(source_type, source_id, received_at desc);
create index if not exists agent_reasoning_logs_observation_idx on public.agent_reasoning_logs(observation_id, created_at desc);
create index if not exists agent_action_plans_status_idx on public.agent_action_plans(status, action_type, created_at desc);
create index if not exists agent_feedback_action_plan_idx on public.agent_feedback(action_plan_id, created_at desc);
