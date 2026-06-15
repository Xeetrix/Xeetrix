create table if not exists public.github_connections (
  id uuid primary key default gen_random_uuid(),
  provider text not null default 'github',
  github_username text,
  installation_id text,
  access_token_encrypted text not null,
  status text not null default 'connected' check (status in ('connected','disconnected','error')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (provider, github_username)
);

create table if not exists public.github_repositories (
  id uuid primary key default gen_random_uuid(),
  connection_id uuid not null references public.github_connections(id) on delete cascade,
  repo_full_name text not null,
  repo_url text not null,
  default_branch text,
  status text not null default 'connected' check (status in ('connected','disconnected','error')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (connection_id, repo_full_name)
);

create table if not exists public.github_issues (
  id uuid primary key default gen_random_uuid(),
  repository_id uuid references public.github_repositories(id) on delete set null,
  github_issue_number integer not null,
  github_issue_url text,
  title text not null,
  body text not null,
  status text not null default 'open' check (status in ('open','closed')),
  source_type text not null,
  source_id text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists github_connections_status_idx on public.github_connections(status, updated_at desc);
create index if not exists github_repositories_connection_idx on public.github_repositories(connection_id, status);
create index if not exists github_issues_source_idx on public.github_issues(source_type, source_id, created_at desc);
create index if not exists github_issues_created_idx on public.github_issues(created_at desc);
