REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM anon;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM authenticated;

DROP POLICY IF EXISTS "Admins read all quote pdfs rows" ON public.quote_pdfs;
CREATE POLICY "Admins read all quote pdfs rows"
ON public.quote_pdfs
FOR SELECT
TO authenticated
USING (app_private.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins read all quote pdfs" ON storage.objects;
DROP POLICY IF EXISTS "Admins read all orcamentos files" ON storage.objects;
DROP POLICY IF EXISTS "Admins upload proposal pdfs" ON storage.objects;
DROP POLICY IF EXISTS "Admins update proposal pdfs" ON storage.objects;
DROP POLICY IF EXISTS "Admins delete orcamentos files" ON storage.objects;

CREATE POLICY "Admins read all orcamentos files"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'orcamentos' AND app_private.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins upload proposal pdfs"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'orcamentos' AND app_private.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins update proposal pdfs"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'orcamentos' AND app_private.has_role(auth.uid(), 'admin'))
WITH CHECK (bucket_id = 'orcamentos' AND app_private.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins delete orcamentos files"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'orcamentos' AND app_private.has_role(auth.uid(), 'admin'));