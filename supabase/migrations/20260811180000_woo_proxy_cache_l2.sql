-- Cache L2 compartilhado do woo-proxy.
-- O Map em memória da edge function é por instância (morre a cada cold start);
-- esta tabela é compartilhada entre todas as instâncias. Guarda o corpo CRU do
-- Woo (com preço) — por isso RLS ligado e ZERO policies: só a service role
-- (as edge functions) alcança. Pode ser truncada a qualquer momento sem quebrar
-- nada (o próximo request paga o Woo e repovoa).

create table if not exists public.woo_proxy_cache (
  cache_key    text primary key,
  status       smallint    not null,
  content_type text        not null default 'application/json',
  body         text        not null,
  fetched_at   timestamptz not null default now()
);

alter table public.woo_proxy_cache enable row level security;
