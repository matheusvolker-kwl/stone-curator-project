DROP POLICY IF EXISTS "Admins read all quote pdfs rows" ON public.quote_pdfs;

CREATE POLICY "Admins read all quote pdfs rows"
ON public.quote_pdfs
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));