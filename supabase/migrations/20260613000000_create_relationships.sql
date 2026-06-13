create table if not exists public.relationships (
  id uuid primary key default gen_random_uuid(),
  source_type text not null,
  source_id text not null,
  target_type text not null,
  target_id text not null,
  relationship_type text not null,
  created_at timestamptz not null default now(),
  constraint relationships_no_self_link check (source_type <> target_type or source_id <> target_id)
);

create index if not exists relationships_source_idx
  on public.relationships (source_type, source_id, created_at desc);

create index if not exists relationships_target_idx
  on public.relationships (target_type, target_id, created_at desc);

create unique index if not exists relationships_unique_link_idx
  on public.relationships (source_type, source_id, target_type, target_id, relationship_type);
