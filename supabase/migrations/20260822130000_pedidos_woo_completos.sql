-- Faz a ponte de pedidos Woo -> painel carregar o pedido inteiro.
--
-- Sintomas que isto destrava:
--  (6) "retirar na Western" aparecia como transportadora  -> shipping_lines nunca era lido,
--      e modo_entrega caía no default 'frete' da tabela.
--  (9) tela de pedidos sem itens nem forma de pagamento   -> pagamento nunca era ingerido.
--  (--) pedido de comprador SEM CONTA estourava NOT NULL   -> user_id passa a aceitar null,
--      que é exatamente o que a coluna needs_linking já pressupunha.

-- 1. Comprador sem conta no site é um caso legítimo (B2C).
--    A RLS "Partners read own orders" usa auth.uid() = user_id; com NULL nunca casa,
--    então o pedido órfão fica visível só para admin — comportamento desejado.
alter table public.production_orders
  alter column user_id drop not null;

-- 2. Campos do pedido comercial que o webhook precisa espelhar.
alter table public.production_orders
  add column if not exists woo_status            text,
  add column if not exists payment_method        text,
  add column if not exists payment_method_title  text,
  add column if not exists shipping_method_id    text,
  add column if not exists shipping_total        numeric,
  add column if not exists date_paid             timestamptz,
  add column if not exists cliente_nome          text,
  add column if not exists cliente_email         text,
  add column if not exists cliente_telefone      text;

comment on column public.production_orders.payment_status is
  'LEGADO: guarda o status do PEDIDO no Woo, não o do pagamento. Use woo_status.';
comment on column public.production_orders.woo_status is
  'Status do pedido no WooCommerce (processing, completed, on-hold, cancelled...).';
comment on column public.production_orders.payment_method_title is
  'Forma de pagamento como o cliente viu (ex.: "Pix", "Boleto", "Cartão de crédito").';

-- 3. Busca de usuário por e-mail sem varrer a lista inteira.
--    O ingest fazia .ilike("empresa", email) (coluna errada) e caía num
--    listUsers({ perPage: 200 }) que ignora quem estiver fora das 200 primeiras.
create or replace function public.find_user_id_by_email(_email text)
returns uuid
language sql
security definer
stable
set search_path = auth, public, pg_temp
as $$
  select id from auth.users
   where lower(email) = lower(trim(_email))
   limit 1;
$$;

revoke all on function public.find_user_id_by_email(text) from public, anon, authenticated;

-- 4. Índice para as consultas do painel por pedido do Woo.
create index if not exists production_orders_woo_status_idx
  on public.production_orders (woo_status)
  where woo_order_id is not null;
