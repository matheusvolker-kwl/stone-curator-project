
REVOKE EXECUTE ON FUNCTION public.cleanup_old_cartoes_cnpj() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.cleanup_old_cartoes_cnpj() TO service_role;
