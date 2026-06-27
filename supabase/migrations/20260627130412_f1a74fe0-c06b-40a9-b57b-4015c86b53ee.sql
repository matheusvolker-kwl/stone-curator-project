
-- 1) cnae_whitelist
CREATE TABLE IF NOT EXISTS public.cnae_whitelist (
  codigo text PRIMARY KEY,
  tier text NOT NULL CHECK (tier IN ('verde','amarela','laranja')),
  descricao text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.cnae_whitelist TO anon, authenticated;
GRANT ALL ON public.cnae_whitelist TO service_role;

ALTER TABLE public.cnae_whitelist ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "cnae_whitelist_read_all" ON public.cnae_whitelist;
CREATE POLICY "cnae_whitelist_read_all" ON public.cnae_whitelist
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "cnae_whitelist_admin_write" ON public.cnae_whitelist;
CREATE POLICY "cnae_whitelist_admin_write" ON public.cnae_whitelist
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP TRIGGER IF EXISTS trg_cnae_whitelist_touch ON public.cnae_whitelist;
CREATE TRIGGER trg_cnae_whitelist_touch
  BEFORE UPDATE ON public.cnae_whitelist
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

INSERT INTO public.cnae_whitelist (codigo, tier) VALUES
  ('4299501','verde'),('8130300','verde'),('4322301','verde'),('4330499','verde'),
  ('4330401','verde'),('4399199','verde'),('4399103','verde'),('4120400','verde'),
  ('7111100','verde'),('4321500','verde'),('4744006','verde'),('4744005','verde'),
  ('4744099','verde'),('4744001','verde'),('4744002','verde'),('4744003','verde'),
  ('4744004','verde'),('4741500','verde'),('4743100','verde'),('4679602','verde'),
  ('4679604','verde'),('4679699','verde'),
  ('4213800','amarela'),('4212000','amarela'),('4391600','amarela'),('4110700','amarela'),
  ('7112000','amarela'),('7410202','amarela'),('7410299','amarela'),
  ('5510801','laranja'),('5510802','laranja'),('9312300','laranja'),('9313100','laranja'),
  ('8112500','laranja'),('6810201','laranja')
ON CONFLICT (codigo) DO NOTHING;

-- 2) credenciamentos
CREATE TABLE IF NOT EXISTS public.credenciamentos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  cnpj text NOT NULL,
  nome text,
  email text,
  empresa text,
  decisao text NOT NULL CHECK (decisao IN ('aprovado','analise','reprovado','solicitar_cartao')),
  motivo text,
  fonte text CHECK (fonte IN ('receitaws','brasilapi','cnpja','cartao','nenhuma')),
  cnae_principal text,
  cnaes_secundarios text[],
  cnae_match text,
  cnae_match_tier text,
  situacao text,
  tier text,
  protocolo text UNIQUE,
  card_path text,
  status_manual text NOT NULL DEFAULT 'pendente'
    CHECK (status_manual IN ('pendente','aprovado','recusado','na')),
  reviewed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_at timestamptz,
  review_note text,
  raw_response jsonb
);

CREATE INDEX IF NOT EXISTS idx_credenciamentos_status_created
  ON public.credenciamentos (status_manual, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_credenciamentos_user
  ON public.credenciamentos (user_id);
CREATE INDEX IF NOT EXISTS idx_credenciamentos_cnpj
  ON public.credenciamentos (cnpj);

GRANT SELECT ON public.credenciamentos TO authenticated;
GRANT ALL ON public.credenciamentos TO service_role;

ALTER TABLE public.credenciamentos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "credenciamentos_self_read" ON public.credenciamentos;
CREATE POLICY "credenciamentos_self_read" ON public.credenciamentos
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(),'admin'));

DROP POLICY IF EXISTS "credenciamentos_admin_update" ON public.credenciamentos;
CREATE POLICY "credenciamentos_admin_update" ON public.credenciamentos
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(),'admin'))
  WITH CHECK (public.has_role(auth.uid(),'admin'));

-- 3) partner_profiles
ALTER TABLE public.partner_profiles
  ADD COLUMN IF NOT EXISTS credenciamento_id uuid REFERENCES public.credenciamentos(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS credenciado_em timestamptz,
  ADD COLUMN IF NOT EXISTS credenciado_fonte text;

-- 4) Storage policies (bucket criado via storage tool)
DROP POLICY IF EXISTS "cartoes_cnpj_user_insert" ON storage.objects;
CREATE POLICY "cartoes_cnpj_user_insert" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'cartoes-cnpj'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "cartoes_cnpj_user_read_own" ON storage.objects;
CREATE POLICY "cartoes_cnpj_user_read_own" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'cartoes-cnpj'
    AND (
      (storage.foldername(name))[1] = auth.uid()::text
      OR public.has_role(auth.uid(),'admin')
    )
  );

DROP POLICY IF EXISTS "cartoes_cnpj_admin_all" ON storage.objects;
CREATE POLICY "cartoes_cnpj_admin_all" ON storage.objects
  FOR ALL TO authenticated
  USING (bucket_id = 'cartoes-cnpj' AND public.has_role(auth.uid(),'admin'))
  WITH CHECK (bucket_id = 'cartoes-cnpj' AND public.has_role(auth.uid(),'admin'));
