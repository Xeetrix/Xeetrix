alter table public.github_issues add column if not exists weakness_summary text;
alter table public.github_issues add column if not exists recommendation text;
alter table public.github_issues add column if not exists impact text;
alter table public.github_issues add column if not exists proposal_source text;
alter table public.github_issues add column if not exists generated_timestamp timestamptz;
alter table public.github_issues add column if not exists github_api_response jsonb;

create index if not exists github_issues_generated_idx on public.github_issues(generated_timestamp desc);
