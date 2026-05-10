-- 1. partner_status enum: add 'cancelled'
ALTER TYPE partner_status ADD VALUE IF NOT EXISTS 'cancelled';

-- 2. partner_profiles: novas colunas
ALTER TABLE public.partner_profiles
  ADD COLUMN IF NOT EXISTS tier text NOT NULL DEFAULT 'light'
    CHECK (tier IN ('light','gold','platinum','partner')),
  ADD COLUMN IF NOT EXISTS discount_override numeric,
  ADD COLUMN IF NOT EXISTS payment_methods jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS newsletter_opt_in boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS cancellation_reason text,
  ADD COLUMN IF NOT EXISTS cancelled_at timestamptz;

-- 3. tier_defaults
CREATE TABLE IF NOT EXISTS public.tier_defaults (
  tier text PRIMARY KEY CHECK (tier IN ('light','gold','platinum','partner')),
  discount_pct numeric NOT NULL DEFAULT 0,
  boleto boolean NOT NULL DEFAULT false,
  parcelas_max integer NOT NULL DEFAULT 1,
  kit_gratis boolean NOT NULL DEFAULT false,
  updated_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO public.tier_defaults (tier, discount_pct, boleto, parcelas_max, kit_gratis) VALUES
  ('light',     5,  false, 1,  false),
  ('gold',      10, true,  3,  false),
  ('platinum',  15, true,  6,  true),
  ('partner',   20, true,  12, true)
ON CONFLICT (tier) DO NOTHING;

ALTER TABLE public.tier_defaults ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated read tier defaults"
  ON public.tier_defaults FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins manage tier defaults"
  ON public.tier_defaults FOR ALL TO authenticated
  USING (has_role(auth.uid(),'admin'))
  WITH CHECK (has_role(auth.uid(),'admin'));

-- 4. saved_carts (1 por usuário)
CREATE TABLE IF NOT EXISTS public.saved_carts (
  user_id uuid PRIMARY KEY,
  items jsonb NOT NULL DEFAULT '[]'::jsonb,
  cart_id text,
  checkout_url text,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.saved_carts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own saved cart"
  ON public.saved_carts FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins read saved carts"
  ON public.saved_carts FOR SELECT TO authenticated
  USING (has_role(auth.uid(),'admin'));

-- 5. guide_exports
CREATE TABLE IF NOT EXISTS public.guide_exports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  pdf_url text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_guide_exports_user_created
  ON public.guide_exports(user_id, created_at DESC);

ALTER TABLE public.guide_exports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own exports"
  ON public.guide_exports FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert own exports"
  ON public.guide_exports FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins read all exports"
  ON public.guide_exports FOR SELECT TO authenticated
  USING (has_role(auth.uid(),'admin'));

-- 6. projects
CREATE TABLE IF NOT EXISTS public.projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  nome text NOT NULL,
  cidade text,
  status text NOT NULL DEFAULT 'em_andamento'
    CHECK (status IN ('em_andamento','concluido','pausado','cancelado')),
  notas text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_projects_user_created
  ON public.projects(user_id, created_at DESC);

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own projects"
  ON public.projects FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins read all projects"
  ON public.projects FOR SELECT TO authenticated
  USING (has_role(auth.uid(),'admin'));

-- 7. system_flags (one-shot guards)
CREATE TABLE IF NOT EXISTS public.system_flags (
  key text PRIMARY KEY,
  value jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.system_flags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage flags"
  ON public.system_flags FOR ALL TO authenticated
  USING (has_role(auth.uid(),'admin'))
  WITH CHECK (has_role(auth.uid(),'admin'));

-- 8. timestamps trigger reuse for projects/saved_carts
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END $$;

DROP TRIGGER IF EXISTS trg_projects_updated ON public.projects;
CREATE TRIGGER trg_projects_updated BEFORE UPDATE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

DROP TRIGGER IF EXISTS trg_saved_carts_updated ON public.saved_carts;
CREATE TRIGGER trg_saved_carts_updated BEFORE UPDATE ON public.saved_carts
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();