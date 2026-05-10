CREATE POLICY "Users update own quote pdfs"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'orcamentos' AND (auth.uid())::text = (storage.foldername(name))[1])
WITH CHECK (bucket_id = 'orcamentos' AND (auth.uid())::text = (storage.foldername(name))[1]);