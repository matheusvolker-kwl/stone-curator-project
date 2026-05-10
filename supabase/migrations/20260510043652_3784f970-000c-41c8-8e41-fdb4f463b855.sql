-- Enum
DO $$ BEGIN
  CREATE TYPE public.quote_status AS ENUM ('novo','em_atendimento','proposta_enviada','fechado','perdido','arquivado');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Threads
CREATE TABLE IF NOT EXISTS public.quote_threads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid NOT NULL UNIQUE,
  status public.quote_status NOT NULL DEFAULT 'novo',
  notas text,
  pago_em timestamptz,
  forma_pagamento text,
  parcelas int,
  valor_final numeric,
  observacoes_venda text,
  archived_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.quote_threads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage quote threads"
ON public.quote_threads FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER quote_threads_touch
BEFORE UPDATE ON public.quote_threads
FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- Proposals
CREATE TABLE IF NOT EXISTS public.quote_proposals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid NOT NULL,
  numero text NOT NULL,
  items jsonb NOT NULL DEFAULT '[]'::jsonb,
  subtotal numeric NOT NULL DEFAULT 0,
  discount_pct numeric NOT NULL DEFAULT 0,
  discount_value numeric NOT NULL DEFAULT 0,
  total numeric NOT NULL DEFAULT 0,
  forma_pagamento text,
  parcelas int DEFAULT 1,
  validade_dias int DEFAULT 7,
  observacoes text,
  pdf_path text,
  sent_at timestamptz,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS quote_proposals_lead_idx ON public.quote_proposals(lead_id, created_at DESC);

ALTER TABLE public.quote_proposals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage proposals"
ON public.quote_proposals FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Auto thread on new orcamento lead
CREATE OR REPLACE FUNCTION public.create_quote_thread()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.type::text = 'orcamento' THEN
    INSERT INTO public.quote_threads (lead_id) VALUES (NEW.id)
    ON CONFLICT (lead_id) DO NOTHING;
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS on_lead_insert_quote_thread ON public.leads;
CREATE TRIGGER on_lead_insert_quote_thread
AFTER INSERT ON public.leads
FOR EACH ROW EXECUTE FUNCTION public.create_quote_thread();

-- Backfill existing orcamento leads
INSERT INTO public.quote_threads (lead_id)
SELECT id FROM public.leads
WHERE type::text = 'orcamento'
ON CONFLICT (lead_id) DO NOTHING;

-- Allow admins to delete leads (clean garbage)
CREATE POLICY "Admins delete leads"
ON public.leads FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Storage policies for proposal PDFs (saved under propostas/<lead_id>.pdf)
CREATE POLICY "Admins read all orcamentos files"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'orcamentos' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins upload proposal pdfs"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'orcamentos' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins update proposal pdfs"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'orcamentos' AND public.has_role(auth.uid(), 'admin'))
WITH CHECK (bucket_id = 'orcamentos' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins delete orcamentos files"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'orcamentos' AND public.has_role(auth.uid(), 'admin'));