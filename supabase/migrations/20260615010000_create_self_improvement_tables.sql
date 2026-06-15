create table if not exists public.agent_system_audits (
  id uuid primary key default gen_random_uuid(),
  snapshot jsonb not null default '{}'::jsonb,
  metrics jsonb not null default '[]'::jsonb,
  weaknesses jsonb not null default '[]'::jsonb,
  captured_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table if not exists public.agent_improvement_proposals (
  id uuid primary key default gen_random_uuid(),
  proposal_key text not null unique,
  audit_id uuid references public.agent_system_audits(id) on delete set null,
  observation text not null,
  problem text not null,
  recommendation text not null,
  expected_impact text not null,
  risk_level text not null check (risk_level in ('low','medium','high')),
  implementation_complexity text not null check (implementation_complexity in ('low','medium','high')),
  codex_prompt text not null,
  status text not null default 'later' check (status in ('useful','not_useful','later','approved')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.agent_feedback add column if not exists proposal_key text;
alter table public.agent_feedback add column if not exists feedback_type text;
alter table public.agent_feedback add constraint agent_feedback_feedback_type_check check (feedback_type is null or feedback_type in ('useful','not_useful','later','approved')) not valid;

create index if not exists agent_system_audits_captured_idx on public.agent_system_audits(captured_at desc);
create index if not exists agent_improvement_proposals_status_idx on public.agent_improvement_proposals(status, created_at desc);
create index if not exists agent_feedback_proposal_idx on public.agent_feedback(proposal_key, created_at desc);
