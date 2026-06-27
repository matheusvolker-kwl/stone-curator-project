
-- 1. Tabelas auxiliares para rate-limit e proteção da cota ReceitaWS
CREATE TABLE IF NOT EXISTS public.credenciar_rate_buckets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bucket_key text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS credenciar_rate_buckets_key_time_idx
  ON public.credenciar_rate_buckets (bucket_key, created_at DESC);

GRANT ALL ON public.credenciar_rate_buckets TO service_role;
ALTER TABLE public.credenciar_rate_buckets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service role manages rate buckets"
  ON public.credenciar_rate_buckets FOR ALL
  USING (false) WITH CHECK (false);

CREATE TABLE IF NOT EXISTS public.credenciar_daily_counters (
  day date NOT NULL,
  counter_key text NOT NULL,
  count integer NOT NULL DEFAULT 0,
  PRIMARY KEY (day, counter_key)
);

GRANT ALL ON public.credenciar_daily_counters TO service_role;
ALTER TABLE public.credenciar_daily_counters ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service role manages daily counters"
  ON public.credenciar_daily_counters FOR ALL
  USING (false) WITH CHECK (false);

-- 2. Função de limpeza dos cartões CNPJ com 90 dias
CREATE OR REPLACE FUNCTION public.cleanup_old_cartoes_cnpj()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, storage
AS $$
DECLARE
  removed integer := 0;
BEGIN
  WITH del AS (
    DELETE FROM storage.objects
     WHERE bucket_id = 'cartoes-cnpj'
       AND created_at < now() - interval '90 days'
    RETURNING 1
  )
  SELECT count(*) INTO removed FROM del;

  DELETE FROM public.credenciar_rate_buckets
   WHERE created_at < now() - interval '2 days';

  DELETE FROM public.credenciar_daily_counters
   WHERE day < (current_date - interval '60 days');

  RETURN removed;
END;
$$;

-- 3. Agenda diária da limpeza (03:15 UTC)
CREATE EXTENSION IF NOT EXISTS pg_cron;
DO $$
BEGIN
  PERFORM cron.unschedule('cartoes-cnpj-cleanup-daily');
EXCEPTION WHEN OTHERS THEN NULL;
END $$;
SELECT cron.schedule(
  'cartoes-cnpj-cleanup-daily',
  '15 3 * * *',
  $$ SELECT public.cleanup_old_cartoes_cnpj(); $$
);
