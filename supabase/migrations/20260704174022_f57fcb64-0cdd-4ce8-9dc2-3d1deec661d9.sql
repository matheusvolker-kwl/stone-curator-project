
ALTER TABLE public.production_orders
  ADD COLUMN IF NOT EXISTS woo_order_id bigint,
  ADD COLUMN IF NOT EXISTS itens jsonb,
  ADD COLUMN IF NOT EXISTS payment_status text,
  ADD COLUMN IF NOT EXISTS origem text DEFAULT 'manual',
  ADD COLUMN IF NOT EXISTS needs_linking boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS conjuntos text;

CREATE UNIQUE INDEX IF NOT EXISTS production_orders_woo_order_id_key
  ON public.production_orders(woo_order_id)
  WHERE woo_order_id IS NOT NULL;
