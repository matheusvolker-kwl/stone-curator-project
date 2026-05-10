create table if not exists public.client_errors (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  source text not null,
  severity text not null default 'error',
  message text not null,
  stack text,
  user_id uuid,
  user_email text,
  url text,
  user_agent text,
  context jsonb not null default '{}'::jsonb
);

create index if not exists client_errors_created_at_idx on public.client_errors (created_at desc);
create index if not exists client_errors_source_idx on public.client_errors (source);
create index if not exists client_errors_user_id_idx on public.client_errors (user_id);

alter table public.client_errors enable row level security;

drop policy if exists "Admins read client errors" on public.client_errors;
create policy "Admins read client errors"
  on public.client_errors
  for select
  to authenticated
  using (app_private.has_role(auth.uid(), 'admin'::app_role));