Diagnóstico confirmado:
- A URL publicada `stone-curator-project.lovable.app` carrega os arquivos, mas o JavaScript quebra com `supabaseUrl is required`.
- O preview interno renderiza normalmente, então o app em si funciona; o problema está no build publicado sem as variáveis públicas do backend embutidas.

Plano de correção:
1. Ajustar a configuração de build para garantir que `VITE_SUPABASE_URL` e `VITE_SUPABASE_PUBLISHABLE_KEY` sejam injetadas no bundle publicado, usando os valores públicos do Lovable Cloud quando o ambiente de publish não fornecer `VITE_*`.
2. Manter o arquivo auto-gerado do cliente do backend intacto, sem editar `src/integrations/supabase/client.ts`.
3. Validar no preview após a alteração que a home continua renderizando sem erro.
4. Pedir a republicação/Update do site e então testar novamente a URL publicada até confirmar que deixou de ficar branca.