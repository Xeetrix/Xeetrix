-- Shaikh OS v2 is a single-owner personal operating system, not a SaaS app.
-- Canonical owner identity is always owner_id = 'shaikh'.

alter table if exists public.os_tasks add column if not exists owner_id text not null default 'shaikh';
alter table if exists public.os_memories add column if not exists owner_id text not null default 'shaikh';
alter table if exists public.os_conversations add column if not exists owner_id text not null default 'shaikh';
alter table if exists public.os_action_plans add column if not exists owner_id text not null default 'shaikh';
alter table if exists public.os_agent_logs add column if not exists owner_id text not null default 'shaikh';
alter table if exists public.os_reflections add column if not exists owner_id text not null default 'shaikh';

update public.os_tasks set owner_id = 'shaikh' where owner_id is null or owner_id <> 'shaikh';
update public.os_memories set owner_id = 'shaikh' where owner_id is null or owner_id <> 'shaikh';
update public.os_conversations set owner_id = 'shaikh' where owner_id is null or owner_id <> 'shaikh';
update public.os_action_plans set owner_id = 'shaikh' where owner_id is null or owner_id <> 'shaikh';
update public.os_agent_logs set owner_id = 'shaikh' where owner_id is null or owner_id <> 'shaikh';
update public.os_reflections set owner_id = 'shaikh' where owner_id is null or owner_id <> 'shaikh';

alter table if exists public.os_tasks alter column owner_id set default 'shaikh';
alter table if exists public.os_memories alter column owner_id set default 'shaikh';
alter table if exists public.os_conversations alter column owner_id set default 'shaikh';
alter table if exists public.os_action_plans alter column owner_id set default 'shaikh';
alter table if exists public.os_agent_logs alter column owner_id set default 'shaikh';
alter table if exists public.os_reflections alter column owner_id set default 'shaikh';

alter table if exists public.os_tasks alter column owner_id set not null;
alter table if exists public.os_memories alter column owner_id set not null;
alter table if exists public.os_conversations alter column owner_id set not null;
alter table if exists public.os_action_plans alter column owner_id set not null;
alter table if exists public.os_agent_logs alter column owner_id set not null;
alter table if exists public.os_reflections alter column owner_id set not null;

create index if not exists os_tasks_owner_created_idx on public.os_tasks (owner_id, created_at desc);
create index if not exists os_tasks_owner_status_due_idx on public.os_tasks (owner_id, status, due_at);
create index if not exists os_memories_owner_created_idx on public.os_memories (owner_id, created_at desc);
create index if not exists os_memories_owner_project_idx on public.os_memories (owner_id, project_name);
create index if not exists os_conversations_owner_session_idx on public.os_conversations (owner_id, session_id, created_at);
create index if not exists os_action_plans_owner_command_idx on public.os_action_plans (owner_id, command_id);
create index if not exists os_action_plans_owner_status_idx on public.os_action_plans (owner_id, status);
create index if not exists os_agent_logs_owner_command_idx on public.os_agent_logs (owner_id, command_id, created_at);
create index if not exists os_reflections_owner_command_idx on public.os_reflections (owner_id, command_id, created_at);

notify pgrst, 'reload schema';
