create table if not exists public.google_service_connections (
  id uuid primary key default gen_random_uuid(),
  source_id uuid not null references public.connected_sources(id) on delete cascade,
  service_name text not null,
  status text not null default 'not_enabled',
  scopes text[] not null default '{}',
  last_sync_at timestamptz,
  last_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (source_id, service_name)
);

create table if not exists public.gmail_messages (
  id uuid primary key default gen_random_uuid(),
  source_id uuid not null references public.connected_sources(id) on delete cascade,
  google_message_id text not null,
  thread_id text,
  from_email text,
  from_name text,
  to_emails text[] not null default '{}',
  subject text,
  snippet text,
  received_at timestamptz,
  project_id text,
  intent text,
  priority text,
  needs_follow_up boolean not null default false,
  status text not null default 'imported',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (source_id, google_message_id)
);

create table if not exists public.calendar_events (
  id uuid primary key default gen_random_uuid(),
  source_id uuid not null references public.connected_sources(id) on delete cascade,
  google_event_id text not null,
  title text,
  description text,
  start_at timestamptz,
  end_at timestamptz,
  attendees jsonb not null default '[]'::jsonb,
  project_id text,
  status text not null default 'imported',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (source_id, google_event_id)
);

create table if not exists public.google_documents (
  id uuid primary key default gen_random_uuid(),
  source_id uuid not null references public.connected_sources(id) on delete cascade,
  google_file_id text not null,
  name text,
  mime_type text,
  web_url text,
  project_id text,
  summary text,
  status text not null default 'imported',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (source_id, google_file_id)
);

create table if not exists public.google_sheets (
  id uuid primary key default gen_random_uuid(),
  source_id uuid not null references public.connected_sources(id) on delete cascade,
  google_file_id text not null,
  name text,
  web_url text,
  project_id text,
  summary text,
  status text not null default 'imported',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (source_id, google_file_id)
);

create index if not exists google_service_connections_source_idx on public.google_service_connections(source_id);
create index if not exists gmail_messages_source_received_idx on public.gmail_messages(source_id, received_at desc);
create index if not exists calendar_events_source_start_idx on public.calendar_events(source_id, start_at asc);
create index if not exists google_documents_source_updated_idx on public.google_documents(source_id, updated_at desc);
create index if not exists google_sheets_source_updated_idx on public.google_sheets(source_id, updated_at desc);
