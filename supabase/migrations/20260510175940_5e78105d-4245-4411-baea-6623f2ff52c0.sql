
-- 1. Coluna last_activity_at
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS last_activity_at timestamptz NOT NULL DEFAULT now();
CREATE INDEX IF NOT EXISTS idx_leads_last_activity ON public.leads (last_activity_at DESC);

-- Backfill once
UPDATE public.leads SET last_activity_at = created_at WHERE last_activity_at IS NULL OR last_activity_at < created_at;

-- 2. Atualiza register_orcamento_lead para bumpar last_activity_at
CREATE OR REPLACE FUNCTION public.register_orcamento_lead(
  _items_hash text,
  _nome text,
  _email text,
  _telefone text,
  _empresa text,
  _cidade text,
  _mensagem text,
  _origem text,
  _payload jsonb
) RETURNS TABLE(lead_id uuid, was_updated boolean)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid uuid := auth.uid();
  existing_id uuid;
  new_id uuid;
BEGIN
  IF _items_hash IS NULL OR length(_items_hash) < 8 THEN
    RAISE EXCEPTION 'invalid items_hash';
  END IF;
  IF _email IS NULL AND _telefone IS NULL THEN
    RAISE EXCEPTION 'email or telefone required';
  END IF;

  SELECT id INTO existing_id
  FROM public.leads
  WHERE type = 'orcamento'
    AND items_hash = _items_hash
    AND created_at > now() - interval '24 hours'
    AND (
      (uid IS NOT NULL AND user_id = uid)
      OR (uid IS NULL AND email = _email)
    )
  ORDER BY created_at DESC LIMIT 1;

  IF existing_id IS NOT NULL THEN
    UPDATE public.leads
    SET payload = COALESCE(payload, '{}'::jsonb)
                  || jsonb_build_object(
                    'downloads', COALESCE((payload->>'downloads')::int, 1) + 1,
                    'last_download_at', now()
                  ),
        last_activity_at = now()
    WHERE id = existing_id;
    RETURN QUERY SELECT existing_id, true;
    RETURN;
  END IF;

  INSERT INTO public.leads (
    type, items_hash, nome, email, telefone, empresa, cidade,
    origem, mensagem, payload, user_id, last_activity_at
  ) VALUES (
    'orcamento', _items_hash, _nome, _email, _telefone, _empresa, _cidade,
    _origem, _mensagem, COALESCE(_payload, '{}'::jsonb), uid, now()
  )
  RETURNING id INTO new_id;

  RETURN QUERY SELECT new_id, false;
END $$;

-- 3. RPC: register_pedido_novo_lead — venda direta (carrinho/guia → checkout)
CREATE OR REPLACE FUNCTION public.register_pedido_novo_lead(
  _items_hash text,
  _nome text,
  _email text,
  _telefone text,
  _empresa text,
  _cidade text,
  _mensagem text,
  _origem text,
  _payload jsonb
) RETURNS TABLE(lead_id uuid, was_updated boolean)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid uuid := auth.uid();
  existing_id uuid;
  new_id uuid;
BEGIN
  IF _items_hash IS NULL OR length(_items_hash) < 8 THEN
    RAISE EXCEPTION 'invalid items_hash';
  END IF;
  IF _email IS NULL AND _telefone IS NULL THEN
    RAISE EXCEPTION 'email or telefone required';
  END IF;

  -- Idempotência curta (5 min) para evitar duplo clique no checkout
  SELECT id INTO existing_id
  FROM public.leads
  WHERE type = 'pedido_novo'
    AND items_hash = _items_hash
    AND created_at > now() - interval '5 minutes'
    AND (
      (uid IS NOT NULL AND user_id = uid)
      OR (uid IS NULL AND email = _email)
    )
  ORDER BY created_at DESC LIMIT 1;

  IF existing_id IS NOT NULL THEN
    UPDATE public.leads
    SET last_activity_at = now(),
        payload = COALESCE(payload, '{}'::jsonb)
                  || jsonb_build_object('checkout_clicks', COALESCE((payload->>'checkout_clicks')::int, 1) + 1)
    WHERE id = existing_id;
    RETURN QUERY SELECT existing_id, true;
    RETURN;
  END IF;

  INSERT INTO public.leads (
    type, items_hash, nome, email, telefone, empresa, cidade,
    origem, mensagem, payload, user_id, last_activity_at
  ) VALUES (
    'pedido_novo', _items_hash, _nome, _email, _telefone, _empresa, _cidade,
    _origem, _mensagem, COALESCE(_payload, '{}'::jsonb), uid, now()
  )
  RETURNING id INTO new_id;

  RETURN QUERY SELECT new_id, false;
END $$;

GRANT EXECUTE ON FUNCTION public.register_pedido_novo_lead(text,text,text,text,text,text,text,text,jsonb) TO anon, authenticated;

-- 4. promote_quote_lead_to_order: order_id agora opcional
CREATE OR REPLACE FUNCTION public.promote_quote_lead_to_order(
  _lead_id uuid,
  _order_id uuid DEFAULT NULL
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid uuid := auth.uid();
BEGIN
  IF NOT app_private.has_role(uid, 'admin') THEN
    RAISE EXCEPTION 'admin only';
  END IF;
  UPDATE public.leads
  SET type = 'pedido_novo',
      last_activity_at = now(),
      payload = COALESCE(payload, '{}'::jsonb)
                || jsonb_build_object(
                  'promoted_at', now(),
                  'order_id', _order_id,
                  'promoted_by', uid
                )
  WHERE id = _lead_id;
END $$;

-- 5. View: funil de conversão (admin)
CREATE OR REPLACE VIEW public.lead_conversion_funnel AS
SELECT
  date_trunc('week', created_at)::date AS semana,
  count(*) FILTER (WHERE type = 'orcamento') AS orcamentos,
  count(*) FILTER (WHERE type = 'pedido_novo') AS pedidos,
  count(*) FILTER (WHERE type = 'pedido_novo' AND payload ? 'promoted_at') AS promovidos,
  count(*) FILTER (WHERE type = 'pdf_pedido') AS pdf_redownloads,
  ROUND(
    100.0 * count(*) FILTER (WHERE type = 'pedido_novo')::numeric
    / NULLIF(count(*) FILTER (WHERE type IN ('orcamento','pedido_novo')), 0),
    1
  ) AS taxa_conversao_pct,
  ROUND(AVG(
    EXTRACT(EPOCH FROM (
      (payload->>'promoted_at')::timestamptz - created_at
    )) / 3600
  ) FILTER (WHERE type = 'pedido_novo' AND payload ? 'promoted_at')::numeric, 1) AS horas_medias_ate_promocao
FROM public.leads
WHERE created_at > now() - interval '180 days'
GROUP BY 1
ORDER BY 1 DESC;

ALTER VIEW public.lead_conversion_funnel SET (security_invoker = true);
GRANT SELECT ON public.lead_conversion_funnel TO authenticated;
