-- Storage bucket privado para PDFs de orçamento
insert into storage.buckets (id, name, public) values ('orcamentos', 'orcamentos', false)
on conflict (id) do nothing;

-- Policies: dono lê/escreve, admin lê tudo
create policy "Users read own quote pdfs"
on storage.objects for select to authenticated
using (bucket_id = 'orcamentos' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Users upload own quote pdfs"
on storage.objects for insert to authenticated
with check (bucket_id = 'orcamentos' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Admins read all quote pdfs"
on storage.objects for select to authenticated
using (bucket_id = 'orcamentos' and public.has_role(auth.uid(), 'admin'));

-- Tabela quote_pdfs
create table public.quote_pdfs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  lead_id uuid,
  storage_path text not null,
  subtotal numeric not null default 0,
  items_count integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.quote_pdfs enable row level security;

create policy "Users see own quote pdfs"
on public.quote_pdfs for select to authenticated
using (auth.uid() = user_id);

create policy "Users insert own quote pdfs"
on public.quote_pdfs for insert to authenticated
with check (auth.uid() = user_id);

create policy "Admins read all quote pdfs rows"
on public.quote_pdfs for select to authenticated
using (public.has_role(auth.uid(), 'admin'));

create index idx_quote_pdfs_user on public.quote_pdfs(user_id, created_at desc);