# Auditoria de preço — Conjuntos vs peças reais

Puxei o catálogo Woo pelo connector (WESTERN WOOCOMMERCE, mesma rota do app) e as composições de `src/data/conjuntoComposicao.ts` + fallbacks de `src/data/guideMap.ts`.

## Achado #1 — preço NÃO varia por acabamento

Amostrei as variações de 3 peças representativas (`pedra-grande-1`, `cascata-sabino`, `pedra-media-5`). Nas 4 variações (Arenito/Granito/Moledo/Quartzo) o `price` é **idêntico** em cada peça. Assumindo que o mesmo vale para todo o catálogo (padrão confirmado em amostra), **soma Arenito = soma Moledo = soma Quartzo = soma Granito** em todos os conjuntos. Por isso mostro uma coluna única `soma real`.

Se você quiser certeza total de que nenhuma peça tem variação diferenciada, posso rodar as 40+ chamadas de `/variations` — avisa.

## Achado #2 (crítico) — bug T1 persiste: 3 peças voltam com `price="0"`

Estas peças são produtos WooCommerce do tipo `bundle` cujo parent devolve `price="0"` no endpoint `/products`; o preço real está nas caixas-filho (`CSC — Caixa 1/3` etc.):

| handle (parent) | price parent | preço real (soma caixas) | como |
|---|---|---|---|
| `cascata-santa-clara` | **0** | **R$ 2.250** | 3× `csc-caixa-*/3` @ R$ 750 |
| `cascata-santa-barbara` | **0** | **R$ 3.585** | 3× `csb-caixa-*/3` @ R$ 1.195 |
| `fonte-sabino-com-lago` | **0** | **R$ 4.235** | 2× `fsl-caixa-*/2` @ R$ 2.117,50 |

Se o front pegar o `price` do parent (que é o que `fetchProductsByHandles` recebe hoje), qualquer conjunto que contenha essas 3 peças fica com preço somado **abaixo do fallback** — em 6 casos vai a zero de contribuição da peça-chave, e nos essenciais o carrinho vai literalmente a R$ 0 ao lado de um fallback de milhares de reais.

## Tabela (ordenada pela divergência PARENT × fallback — o risco real)

Legenda: `Δ parent%` = como o app calcula hoje via preço do parent Woo (0 nos bundles). `Δ real%` = soma reconstruída somando as caixas.

| conjunto | fallback | soma (parent Woo) | soma real | Δ parent | Δ real | bundle-zero |
|---|---:|---:|---:|---:|---:|---|
| conjunto-piscina-caio-essencial | 2.250 | **0** | 2.250 | **−100,0%** | 0,0% | cascata-santa-clara×1 |
| conjunto-piscina-buzios-essencial | 3.585 | **0** | 3.585 | **−100,0%** | 0,0% | cascata-santa-barbara×1 |
| conjunto-jardim-fonte-tabocas-essencial | 4.235 | **0** | 4.235 | **−100,0%** | 0,0% | fonte-sabino-com-lago×1 |
| conjunto-piscina-itacare-equilibrado | 2.800 | 550 | 2.800 | −80,4% | 0,0% | cascata-santa-clara×1 |
| conjunto-jardim-fonte-iguacu-equilibrado | 5.335 | 1.100 | 5.335 | −79,4% | 0,0% | fonte-sabino-com-lago×1 |
| conjunto-piscina-maresias-equilibrado | 4.750 | 1.165 | 4.750 | −75,5% | 0,0% | cascata-santa-barbara×1 |
| conjunto-piscina-trancoso-completo | 3.120 | 870 | 3.120 | −72,1% | 0,0% | cascata-santa-clara×1 |
| conjunto-piscina-pipa-completo | 5.195 | 1.610 | 5.195 | −69,0% | 0,0% | cascata-santa-barbara×1 |
| conjunto-piscina-maragogi-essencial | 6.410 | 2.825 | 6.410 | −55,9% | 0,0% | cascata-santa-barbara×1 |
| conjunto-jardim-fonte-itambe-completo | 7.815 | 3.580 | 7.815 | −54,2% | 0,0% | fonte-sabino-com-lago×1 |
| conjunto-piscina-jericoacoara-equilibrado | 8.050 | 4.465 | 8.050 | −44,5% | 0,0% | cascata-santa-barbara×1 |
| conjunto-lago-mundau-completo | 8.580 | 6.330 | 8.580 | −26,2% | 0,0% | cascata-santa-clara×1 |
| conjunto-lago-amazonas-completo | 16.325 | 12.740 | 16.325 | −22,0% | 0,0% | cascata-santa-barbara×1 |
| conjunto-lago-marau-equilibrado | 13.085 | 10.835 | 13.085 | −17,2% | 0,0% | cascata-santa-clara×1 |
| — todos os outros 31 conjuntos — | ✓ | igual ao real | igual | 0,0% | 0,0% | — |

Os 31 conjuntos restantes (todas as famílias `lago`, `lago-hibrido`, `jardim-seco`, e as duas fontes `andorinhas`/`veu` etc.) batem exatamente com o fallback, **inclusive `conjunto-piscina-noronha-completo`** que só usa cascatas do tipo variable com preço no parent.

## Resumo executivo

- **0 / 45** conjuntos divergem >10% quando o preço é reconstruído corretamente (fallback está calibrado).
- **14 / 45** conjuntos (31%) divergem >10% pelo que o app enxerga hoje via parent-price, com **6 conjuntos indo a preço zero na peça-âncora** (essencial → carrinho pode fechar a R$ 0).
- **14 / 45** têm ao menos uma peça em bundle-zero (mesmos 14 acima). Peças-âncora:
  - `cascata-santa-clara` — em 5 conjuntos (mundau, caio, itacare, trancoso, + implícito em piscina/lago).
  - `cascata-santa-barbara` — em 6 conjuntos (amazonas, buzios, maresias, pipa, maragogi, jericoacoara).
  - `fonte-sabino-com-lago` — em 3 conjuntos (tabocas, iguacu, itambe).
- Nenhuma peça está ausente do catálogo (todos os handles foram resolvidos pelo Woo).

## Próximo passo sugerido (quando for corrigir — não agora)

O bug não está nos preços do guideMap — está em como o front resolve `cascata-santa-clara`, `cascata-santa-barbara` e `fonte-sabino-com-lago` no catálogo. Duas rotas:

1. **Ajustar `groupAcabamentoBundles`/`adaptAcabamentoGroup`** para somar as caixas-filho quando o `bundle.price` vier `0`; ou
2. **Corrigir no Woo** (definir o preço do bundle como soma dos itens) e a leitura passa a bater sozinha.

Me avisa qual rota você quer que eu monte em plano de implementação — não editei nada agora.
