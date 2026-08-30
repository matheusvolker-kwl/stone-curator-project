import { useQuery } from "@tanstack/react-query";
import { fetchProduct } from "@/lib/datasource";
import { formatBRL } from "@/lib/catalog/client";

/**
 * Preço da Western Box, lido do WooCommerce.
 *
 * POR QUE ISTO EXISTE
 * O preço estava escrito à mão como "R$ 149,90" em dois arquivos: oito vezes na
 * página da Box (incluindo o botão de comprar e o valor enviado ao carrinho) e
 * duas vezes na home. Quando o dono subiu o preço para R$ 349,90 no WooCommerce
 * em 28/08/2026, as duas páginas continuaram anunciando 149,90 e o checkout
 * cobrava 349,90 — o cliente lia um valor e pagava mais que o dobro.
 *
 * Atualizar os dez lugares resolveria hoje e quebraria de novo na próxima
 * mudança de preço. Por isso a fonte passou a ser o WooCommerce, que é quem
 * cobra. Um lugar só, e quem manda é quem emite a cobrança.
 *
 * O react-query deduplica pela chave, então as várias chamadas desta página
 * compartilham uma única requisição.
 */

const BOX_HANDLE = "western-box-samples-catalogo";

/**
 * Só aparece se a consulta falhar — por isso é o preço correto de hoje, nunca
 * um número velho. Se você mudar o preço no Woo, mude aqui também: é a rede de
 * segurança, não a verdade.
 */
const PRECO_PADRAO = 349.9;

export function usePrecoBox(): { valor: number; rotulo: string; carregando: boolean } {
  const { data, isLoading } = useQuery({
    queryKey: ["product", BOX_HANDLE],
    queryFn: () => fetchProduct(BOX_HANDLE),
    staleTime: 5 * 60 * 1000,
  });

  // Os dois caminhos que ProductPage.tsx usa, na mesma ordem.
  const bruto =
    data?.variants?.edges?.[0]?.node?.price?.amount ??
    data?.priceRange?.minVariantPrice?.amount;

  const valor = bruto != null && Number.isFinite(Number(bruto)) ? Number(bruto) : PRECO_PADRAO;
  return { valor, rotulo: formatBRL(valor), carregando: isLoading };
}
