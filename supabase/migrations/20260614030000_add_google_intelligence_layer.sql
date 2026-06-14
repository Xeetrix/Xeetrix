alter table public.gmail_messages
  add column if not exists contact_name text,
  add column if not exists organization text,
  add column if not exists is_unread boolean not null default false;

alter table public.google_documents
  add column if not exists organization text,
  add column if not exists document_type text,
  add column if not exists owner_email text,
  add column if not exists owner_name text;

alter table public.google_sheets
  add column if not exists organization text,
  add column if not exists document_type text,
  add column if not exists owner_email text,
  add column if not exists owner_name text;

create index if not exists gmail_messages_intelligence_idx on public.gmail_messages(project_id, organization, intent, priority, needs_follow_up, is_unread);
create index if not exists google_documents_intelligence_idx on public.google_documents(project_id, organization, document_type, updated_at desc);
create index if not exists google_sheets_intelligence_idx on public.google_sheets(project_id, organization, document_type, updated_at desc);
