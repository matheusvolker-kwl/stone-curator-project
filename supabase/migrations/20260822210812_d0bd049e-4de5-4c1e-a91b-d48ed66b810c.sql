alter table public.production_orders
  alter column user_id drop not null;

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

create index if not exists production_orders_woo_status_idx
  on public.production_orders (woo_status)
  where woo_order_id is not null;