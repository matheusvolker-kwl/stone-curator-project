/**
 * Legenda do acervo (código SKU) → handle de produto Woo/catálogo.
 * Fonte única para converter as peças descritas nas obras (Western-Acervo-Conteudo.md)
 * nos handles reais usados em /produtos/<handle> e no motor de composição.
 *
 * Todos os handles abaixo existem no catálogo (o app já linka /produtos/<handle>).
 * A blindagem nativa do carrinho descarta silenciosamente qualquer peça cujo
 * handle não resolva numa variante gid:// — então um handle sob-consulta não
 * quebra o checkout, só sai da lista "adicionar todos".
 */
export const SKU_HANDLE: Record<string, string> = {
  // Cascatas
  CSB: "cascata-santa-barbara",
  CSC: "cascata-santa-clara",
  CS: "cascata-sabino",
  CLY: "cascata-lajedo-yporanga",
  CLB: "cascata-lajedo-boreal",
  // Funcionais / acessórios
  PC: "pedra-champanheira",
  PS: "pedra-sonora",
  PL: "pedra-led",
  // Pedras de borda
  PB1: "pedra-de-borda-1",
  PB2: "pedra-de-borda-2",
  PB3: "pedra-de-borda-3",
  // Pedras grandes
  PG1: "pedra-grande-1",
  PG2: "pedra-grande-2",
  PG3: "pedra-grande-3",
  PG4: "pedra-grande-4",
  PG5: "pedra-grande-5",
  PG6: "pedra-grande-6",
  PG7: "pedra-grande-7",
  PG8: "pedra-grande-8",
  PG9: "pedra-grande-9",
  PG10: "pedra-grande-10",
  // Pedras médias
  PM1: "pedra-media-1",
  PM2: "pedra-media-2",
  PM3: "pedra-media-3",
  PM4: "pedra-media-4",
  PM5: "pedra-media-5",
  PM6: "pedra-media-6",
  PM7: "pedra-media-7",
  PM8: "pedra-media-8",
  // Pedras pequenas
  PP1: "pedra-pequena-1",
  PP2: "pedra-pequena-2",
  PP3: "pedra-pequena-3",
  PP4: "pedra-pequena-4",
  PP5: "pedra-pequena-5",
};

/** Resolve um código de SKU do acervo para o handle Woo (undefined se não mapeado). */
export function skuToHandle(codigo: string): string | undefined {
  return SKU_HANDLE[codigo.toUpperCase().trim()];
}
