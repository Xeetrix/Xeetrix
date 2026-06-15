alter table public.agent_improvement_proposals add column if not exists evidence jsonb not null default '[]'::jsonb;
alter table public.agent_improvement_proposals add column if not exists metrics jsonb not null default '[]'::jsonb;
alter table public.agent_improvement_proposals add column if not exists confidence_score integer not null default 0;
alter table public.agent_improvement_proposals add column if not exists reasoning_chain jsonb not null default '[]'::jsonb;
alter table public.agent_improvement_proposals add column if not exists engineering_plan jsonb not null default '{}'::jsonb;
alter table public.agent_improvement_proposals add column if not exists prompt_history jsonb not null default '[]'::jsonb;
alter table public.agent_improvement_proposals add column if not exists execution_status text not null default 'Proposed';
alter table public.agent_improvement_proposals add column if not exists github_issue_number integer;
alter table public.agent_improvement_proposals add column if not exists github_issue_url text;
alter table public.agent_improvement_proposals add column if not exists deployed_at timestamptz;

do $$ begin
  alter table public.agent_improvement_proposals add constraint agent_improvement_execution_status_check check (execution_status in ('Proposed','Approved','Issue Created','Prompt Generated','In Development','Testing','Deployed'));
exception when duplicate_object then null;
end $$;

create table if not exists public.agent_codex_prompt_history (
  id uuid primary key default gen_random_uuid(),
  proposal_key text not null,
  github_issue_number integer,
  prompt text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.agent_execution_events (
  id uuid primary key default gen_random_uuid(),
  proposal_key text not null,
  status text not null check (status in ('Proposed','Approved','Issue Created','Prompt Generated','In Development','Testing','Deployed')),
  github_issue_number integer,
  github_issue_url text,
  commit_sha text,
  deployment_url text,
  notes text,
  created_at timestamptz not null default now()
);

alter table public.github_issues add column if not exists evidence jsonb not null default '[]'::jsonb;
alter table public.github_issues add column if not exists metrics jsonb not null default '[]'::jsonb;
alter table public.github_issues add column if not exists reasoning jsonb not null default '[]'::jsonb;
alter table public.github_issues add column if not exists acceptance_criteria jsonb not null default '[]'::jsonb;
alter table public.github_issues add column if not exists suggested_implementation text;

create index if not exists agent_improvement_execution_status_idx on public.agent_improvement_proposals(execution_status, updated_at desc);
create index if not exists agent_codex_prompt_history_proposal_idx on public.agent_codex_prompt_history(proposal_key, created_at desc);
create index if not exists agent_execution_events_proposal_idx on public.agent_execution_events(proposal_key, created_at desc);
