
CREATE TABLE public.checkout_tickets (
  ticket text PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  payload jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL,
  consumed_at timestamptz NULL,
  consumer_ip text NULL
);

CREATE INDEX checkout_tickets_expires_idx ON public.checkout_tickets (expires_at);
CREATE INDEX checkout_tickets_user_idx ON public.checkout_tickets (user_id);

GRANT ALL ON public.checkout_tickets TO service_role;
-- No grants to anon/authenticated: only edge functions (service role) touch this table.

ALTER TABLE public.checkout_tickets ENABLE ROW LEVEL SECURITY;

-- Deny-by-default: no policies for anon/authenticated. Only service_role bypasses RLS.
CREATE POLICY "service role manages tickets"
  ON public.checkout_tickets
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Atomic one-shot consume: returns the payload only if not yet consumed and not expired.
CREATE OR REPLACE FUNCTION public.consume_checkout_ticket(_ticket text, _ip text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _payload jsonb;
BEGIN
  UPDATE public.checkout_tickets
     SET consumed_at = now(),
         consumer_ip = _ip
   WHERE ticket = _ticket
     AND consumed_at IS NULL
     AND expires_at > now()
  RETURNING payload INTO _payload;

  RETURN _payload; -- null if not found / expired / already consumed
END;
$$;

REVOKE ALL ON FUNCTION public.consume_checkout_ticket(text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.consume_checkout_ticket(text, text) TO service_role;

-- Periodic cleanup of expired tickets (called from redeem function opportunistically).
CREATE OR REPLACE FUNCTION public.cleanup_expired_checkout_tickets()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  removed integer := 0;
BEGIN
  WITH del AS (
    DELETE FROM public.checkout_tickets
     WHERE expires_at < now() - interval '5 minutes'
     RETURNING 1
  )
  SELECT count(*) INTO removed FROM del;
  RETURN removed;
END;
$$;

REVOKE ALL ON FUNCTION public.cleanup_expired_checkout_tickets() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.cleanup_expired_checkout_tickets() TO service_role;
