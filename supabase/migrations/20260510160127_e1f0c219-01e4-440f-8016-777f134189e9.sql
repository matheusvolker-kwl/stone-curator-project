DROP POLICY IF EXISTS "Users read own quote PDFs" ON storage.objects;
DROP POLICY IF EXISTS "Users upload own quote PDFs" ON storage.objects;
DROP POLICY IF EXISTS "Users update own quote PDFs" ON storage.objects;

CREATE POLICY "Users read own quote PDFs"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'orcamentos'
  AND name LIKE auth.uid()::text || '/%'
);

CREATE POLICY "Users upload own quote PDFs"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'orcamentos'
  AND name LIKE auth.uid()::text || '/%'
);

CREATE POLICY "Users update own quote PDFs"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'orcamentos'
  AND name LIKE auth.uid()::text || '/%'
)
WITH CHECK (
  bucket_id = 'orcamentos'
  AND name LIKE auth.uid()::text || '/%'
);