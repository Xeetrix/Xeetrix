alter table public.source_sync_logs add column if not exists endpoint text;
alter table public.source_sync_logs add column if not exists http_status integer;
alter table public.source_sync_logs add column if not exists error_code text;
alter table public.source_sync_logs add column if not exists missing_scope text;
alter table public.source_sync_logs add column if not exists raw_response jsonb;

alter table public.google_service_connections add column if not exists granted_scopes text[] not null default '{}';
alter table public.google_service_connections add column if not exists missing_scopes text[] not null default '{}';
alter table public.google_service_connections add column if not exists diagnostic jsonb;
