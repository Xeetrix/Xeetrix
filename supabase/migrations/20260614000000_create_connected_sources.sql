create extension if not exists pgcrypto;

create table if not exists public.connected_sources (
  id uuid primary key default gen_random_uuid(),
  provider text not null,
  account_email text not null,
  display_name text,
  status text not null default 'connected',
  access_token_encrypted text not null,
  refresh_token_encrypted text not null,
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (provider, account_email)
);

create table if not exists public.source_sync_logs (
  id uuid primary key default gen_random_uuid(),
  source_id uuid not null references public.connected_sources(id) on delete cascade,
  sync_type text not null,
  status text not null,
  message text,
  created_at timestamptz not null default now()
);

create index if not exists connected_sources_provider_idx on public.connected_sources(provider);
create index if not exists source_sync_logs_source_id_created_at_idx on public.source_sync_logs(source_id, created_at desc);
