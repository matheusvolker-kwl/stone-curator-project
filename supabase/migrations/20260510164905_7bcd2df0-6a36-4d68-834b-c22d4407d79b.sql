-- Enums
do $$ begin
  create type public.production_status as enum (
    'aguardando','em_producao','controle_qualidade','pronto',
    'em_transporte','entregue','retirado','cancelado'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.fulfillment_mode as enum ('retirada','frete');
exception when duplicate_object then null; end $$;

-- Pedidos de produção
create table if not exists public.production_orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  numero text not null unique,
  titulo text not null,
  lead_id uuid,
  status public.production_status not null default 'aguardando',
  modo_entrega public.fulfillment_mode not null default 'frete',
  prazo_dias_uteis integer not null default 15,
  produzir_ate date,
  previsao_entrega date,
  tracking_code text,
  transportadora text,
  endereco_entrega text,
  valor_total numeric(12,2),
  observacoes_admin text,
  observacoes_cliente text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists production_orders_user_id_idx on public.production_orders (user_id);
create index if not exists production_orders_status_idx on public.production_orders (status);
create index if not exists production_orders_created_at_idx on public.production_orders (created_at desc);

drop trigger if exists trg_production_orders_touch on public.production_orders;
create trigger trg_production_orders_touch
  before update on public.production_orders
  for each row execute function public.touch_updated_at();

alter table public.production_orders enable row level security;

drop policy if exists "Partners read own orders" on public.production_orders;
create policy "Partners read own orders"
  on public.production_orders for select to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Admins read all orders" on public.production_orders;
create policy "Admins read all orders"
  on public.production_orders for select to authenticated
  using (app_private.has_role(auth.uid(), 'admin'::app_role));

drop policy if exists "Admins manage orders" on public.production_orders;
create policy "Admins manage orders"
  on public.production_orders for all to authenticated
  using (app_private.has_role(auth.uid(), 'admin'::app_role))
  with check (app_private.has_role(auth.uid(), 'admin'::app_role));

-- Linha do tempo
create table if not exists public.production_order_events (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.production_orders(id) on delete cascade,
  status public.production_status,
  note text,
  created_by uuid,
  created_at timestamptz not null default now()
);

create index if not exists production_order_events_order_id_idx
  on public.production_order_events (order_id, created_at desc);

alter table public.production_order_events enable row level security;

drop policy if exists "Partners read own order events" on public.production_order_events;
create policy "Partners read own order events"
  on public.production_order_events for select to authenticated
  using (exists (
    select 1 from public.production_orders o
    where o.id = order_id and o.user_id = auth.uid()
  ));

drop policy if exists "Admins read all order events" on public.production_order_events;
create policy "Admins read all order events"
  on public.production_order_events for select to authenticated
  using (app_private.has_role(auth.uid(), 'admin'::app_role));

drop policy if exists "Admins manage order events" on public.production_order_events;
create policy "Admins manage order events"
  on public.production_order_events for all to authenticated
  using (app_private.has_role(auth.uid(), 'admin'::app_role))
  with check (app_private.has_role(auth.uid(), 'admin'::app_role));

-- Realtime
alter table public.production_orders replica identity full;
alter table public.production_order_events replica identity full;

do $$ begin
  alter publication supabase_realtime add table public.production_orders;
exception when duplicate_object then null; end $$;

do $$ begin
  alter publication supabase_realtime add table public.production_order_events;
exception when duplicate_object then null; end $$;

-- Auto-evento quando o status muda
create or replace function public.log_production_status_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if (tg_op = 'INSERT') then
    insert into public.production_order_events (order_id, status, note, created_by)
    values (new.id, new.status, 'Pedido criado', auth.uid());
  elsif (tg_op = 'UPDATE' and new.status is distinct from old.status) then
    insert into public.production_order_events (order_id, status, note, created_by)
    values (new.id, new.status, null, auth.uid());
  end if;
  return new;
end $$;

drop trigger if exists trg_production_orders_status on public.production_orders;
create trigger trg_production_orders_status
  after insert or update of status on public.production_orders
  for each row execute function public.log_production_status_change();