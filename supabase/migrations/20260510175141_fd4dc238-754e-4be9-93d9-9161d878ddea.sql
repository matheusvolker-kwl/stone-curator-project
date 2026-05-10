
-- 1. Enum lead_type: adicionar pedido_novo
ALTER TYPE lead_type ADD VALUE IF NOT EXISTS 'pedido_novo';

-- 2. Coluna items_hash em leads
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS items_hash text;
CREATE INDEX IF NOT EXISTS idx_leads_orcamento_dedup
  ON public.leads (user_id, email, items_hash, created_at DESC)
  WHERE type = 'orcamento';

-- 3. RPC: register_orcamento_lead — dedup 24h por (user|email, items_hash)
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

  -- Procura lead recente (24h) com mesma composição e mesmo dono (user_id se logado, senão email)
  SELECT id INTO existing_id
  FROM public.leads
  WHERE type = 'orcamento'
    AND items_hash = _items_hash
    AND created_at > now() - interval '24 hours'
    AND (
      (uid IS NOT NULL AND user_id = uid)
      OR (uid IS NULL AND email = _email)
    )
  ORDER BY created_at DESC
  LIMIT 1;

  IF existing_id IS NOT NULL THEN
    UPDATE public.leads
    SET payload = COALESCE(payload, '{}'::jsonb)
                  || jsonb_build_object(
                    'downloads', COALESCE((payload->>'downloads')::int, 1) + 1,
                    'last_download_at', now()
                  )
    WHERE id = existing_id;
    RETURN QUERY SELECT existing_id, true;
    RETURN;
  END IF;

  INSERT INTO public.leads (
    type, items_hash, nome, email, telefone, empresa, cidade,
    origem, mensagem, payload, user_id
  ) VALUES (
    'orcamento', _items_hash, _nome, _email, _telefone, _empresa, _cidade,
    _origem, _mensagem, COALESCE(_payload, '{}'::jsonb), uid
  )
  RETURNING id INTO new_id;

  RETURN QUERY SELECT new_id, false;
END $$;

GRANT EXECUTE ON FUNCTION public.register_orcamento_lead(text,text,text,text,text,text,text,text,jsonb) TO anon, authenticated;

-- 4. RPC: promote_quote_lead_to_order — admin promove orçamento existente para pedido_novo
CREATE OR REPLACE FUNCTION public.promote_quote_lead_to_order(
  _lead_id uuid,
  _order_id uuid
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
      payload = COALESCE(payload, '{}'::jsonb)
                || jsonb_build_object(
                  'promoted_at', now(),
                  'order_id', _order_id,
                  'promoted_by', uid
                )
  WHERE id = _lead_id;
END $$;

GRANT EXECUTE ON FUNCTION public.promote_quote_lead_to_order(uuid,uuid) TO authenticated;

-- 5. Trigger: validação status × modo_entrega
CREATE OR REPLACE FUNCTION public.validate_production_order_status()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.modo_entrega = 'retirada' AND NEW.status IN ('em_transporte', 'entregue') THEN
    RAISE EXCEPTION 'status % inválido para modo retirada', NEW.status;
  END IF;
  IF NEW.modo_entrega = 'frete' AND NEW.status = 'retirado' THEN
    RAISE EXCEPTION 'status retirado inválido para modo frete';
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_validate_production_order_status ON public.production_orders;
CREATE TRIGGER trg_validate_production_order_status
BEFORE INSERT OR UPDATE ON public.production_orders
FOR EACH ROW EXECUTE FUNCTION public.validate_production_order_status();
