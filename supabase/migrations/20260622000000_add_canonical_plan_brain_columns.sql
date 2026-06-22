-- Store the normalized server plan and brain snapshot directly on the canonical action-plan row.
-- Runtime writes only to public.agent_action_plans.
alter table public.agent_action_plans add column if not exists plan jsonb not null default '{}'::jsonb;
alter table public.agent_action_plans add column if not exists brain jsonb not null default '{}'::jsonb;

create index if not exists agent_action_plans_command_id_idx on public.agent_action_plans(command_id);
