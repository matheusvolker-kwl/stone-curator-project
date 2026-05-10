
-- Wave 1 fixes: padronizar has_role para app_private + permitir DELETE de PDFs próprios

-- 1. leads (DELETE)
DROP POLICY IF EXISTS "Admins delete leads" ON public.leads;
CREATE POLICY "Admins delete leads" ON public.leads
  FOR DELETE TO authenticated
  USING (app_private.has_role(auth.uid(), 'admin'::app_role));

-- 2. quote_threads
DROP POLICY IF EXISTS "Admins manage quote threads" ON public.quote_threads;
CREATE POLICY "Admins manage quote threads" ON public.quote_threads
  FOR ALL TO authenticated
  USING (app_private.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (app_private.has_role(auth.uid(), 'admin'::app_role));

-- 3. quote_proposals
DROP POLICY IF EXISTS "Admins manage proposals" ON public.quote_proposals;
CREATE POLICY "Admins manage proposals" ON public.quote_proposals
  FOR ALL TO authenticated
  USING (app_private.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (app_private.has_role(auth.uid(), 'admin'::app_role));

-- 4. orcamentos bucket: permitir DELETE do próprio arquivo
CREATE POLICY "Users delete own orcamentos"
  ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'orcamentos'
    AND name LIKE auth.uid()::text || '/%'
  );
