CREATE OR REPLACE FUNCTION public.register_pedido_pdf_download(
  _order_id uuid,
  _filename text
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid uuid := auth.uid();
  ord public.production_orders%ROWTYPE;
  prof public.partner_profiles%ROWTYPE;
  user_email text;
  download_id uuid;
  contact_email text;
  contact_phone text;
BEGIN
  IF uid IS NULL THEN
    RAISE EXCEPTION 'authentication required';
  END IF;

  IF _filename IS NULL OR length(_filename) < 5 THEN
    RAISE EXCEPTION 'invalid filename';
  END IF;

  SELECT * INTO ord FROM public.production_orders
   WHERE id = _order_id AND user_id = uid;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'order not found or not owned';
  END IF;

  SELECT email INTO user_email FROM auth.users WHERE id = uid;
  SELECT * INTO prof FROM public.partner_profiles WHERE user_id = uid LIMIT 1;

  -- 1. Registro no perfil do cliente
  INSERT INTO public.pedido_pdf_downloads (order_id, user_id, scenario, filename)
  VALUES (_order_id, uid, 'cliente', _filename)
  RETURNING id INTO download_id;

  -- 2. Evento na linha do tempo do pedido (visível ao admin)
  INSERT INTO public.production_order_events (order_id, status, note, created_by)
  VALUES (_order_id, NULL, 'PDF baixado pelo cliente: ' || _filename, uid);

  -- 3. Lead na fila do admin — respeita o check de email/telefone do leads
  contact_email := COALESCE(NULLIF(user_email, ''), NULL);
  contact_phone := COALESCE(NULLIF(prof.telefone, ''), NULL);

  IF contact_email IS NOT NULL OR contact_phone IS NOT NULL THEN
    INSERT INTO public.leads (
      type, nome, email, telefone, empresa, cidade, origem, mensagem, payload, user_id
    ) VALUES (
      'pdf_pedido',
      COALESCE(prof.nome, 'Parceiro'),
      contact_email,
      contact_phone,
      prof.empresa,
      prof.cidade,
      'pdf_pedido_baixado',
      'Parceiro baixou o PDF do pedido ' || ord.numero,
      jsonb_build_object(
        'order_id', _order_id,
        'numero', ord.numero,
        'titulo', ord.titulo,
        'filename', _filename,
        'status', ord.status,
        'modo_entrega', ord.modo_entrega
      ),
      uid
    );
  END IF;

  RETURN download_id;
END $$;

GRANT EXECUTE ON FUNCTION public.register_pedido_pdf_download(uuid, text) TO authenticated;
