CREATE UNIQUE INDEX IF NOT EXISTS quote_pdfs_user_storage_path_key
ON public.quote_pdfs (user_id, storage_path);