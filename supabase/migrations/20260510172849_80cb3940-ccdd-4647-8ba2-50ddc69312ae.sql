-- 1) Novo tipo de lead
ALTER TYPE public.lead_type ADD VALUE IF NOT EXISTS 'pdf_pedido';

-- 2) Tabela de registro de downloads (sem armazenar o binário)
CREATE TABLE IF NOT EXISTS public.pedido_pdf_downloads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL,
  user_id uuid NOT NULL,
  scenario text NOT NULL CHECK (scenario IN ('admin','cliente')),
  filename text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_pedido_pdf_downloads_order ON public.pedido_pdf_downloads(order_id);
CREATE INDEX IF NOT EXISTS idx_pedido_pdf_downloads_user ON public.pedido_pdf_downloads(user_id);

ALTER TABLE public.pedido_pdf_downloads ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins read all pdf downloads" ON public.pedido_pdf_downloads;
CREATE POLICY "Admins read all pdf downloads"
  ON public.pedido_pdf_downloads
  FOR SELECT TO authenticated
  USING (app_private.has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Partners read own pdf downloads" ON public.pedido_pdf_downloads;
CREATE POLICY "Partners read own pdf downloads"
  ON public.pedido_pdf_downloads
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);
