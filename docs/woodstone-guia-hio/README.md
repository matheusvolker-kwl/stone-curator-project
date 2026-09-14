# Woodstone — guia de vendas HIO

`WesternWoodstoneGuiaHIO.pdf` é o guia de consulta rápida entregue à equipe de
vendas da HIO. O PDF é gerado a partir do HTML em `src/`, impresso pelo Chromium
em A4 (594,96 × 841,92 pt, exatamente o formato da versão original).

## Como regerar o PDF

```sh
cd src
python3 build.py            # gera guia.html a partir do conteúdo em build.py
chromium --headless --disable-gpu --no-pdf-header-footer \
         --print-to-pdf=../WesternWoodstoneGuiaHIO.pdf \
         --virtual-time-budget=8000 "file://$PWD/guia.html"
```

## Estrutura

| arquivo | o que é |
| --- | --- |
| `build.py` | conteúdo do guia (peças, preços, passo a passo, FAQ) e montagem do HTML |
| `style.css` | design system do guia — cores, tipografia e grades, todas em `pt` |
| `margins.json` | escala de espaçamento vertical do guia (ver "Ritmo vertical") |
| `assets/` | fotos das peças, texturas das tonalidades e logos Western/HIO |
| `fonts/` | Instrument Sans e IBM Plex Mono (SIL Open Font License) |
| `assets/arboreal*.png` | marca ArboREAL — lockup completo, símbolo e logotipo isolados |

Para alterar texto ou preços, edite `build.py`. Para mexer em espaçamento
vertical, ajuste `margins.json` — os valores são somados como `margin-top`
(ou `padding`) aos blocos correspondentes.

## Ritmo vertical

O espaçamento não é livre: cada página fecha com 18 a 26 pt de folga antes do
fio do rodapé, e os vãos equivalentes se repetem entre páginas — fio de seção
para primeira linha é ~13 pt na tabela de venda e na de formas de pagamento,
por exemplo. Três regras sustentam isso:

- **a descrição da peça tem altura fixa de três linhas** (`.desc{min-height}`),
  para que tudo abaixo dela caia na mesma altura nas cinco páginas de peça,
  independente do tamanho do texto;
- **a coluna MEDIDAS é mais larga que PESO e MADEIRA** (`1.35fr .85fr .8fr`),
  porque só ela recebe valores longos — sem isso a medida do Elo quebra em duas
  linhas e desalinha a página;
- **o painel de preços tem altura fixa**, então o conteúdo interno
  (`t_pricecol`, `t_pricev`, `t_pricen`) precisa somar menos que ela — hoje
  73 pt dentro de 78 pt.

Ao acrescentar conteúdo, confira a folga do rodapé nas sete páginas antes de
fechar; abaixo de ~12 pt o texto começa a brigar com o rodapé.

## Política de frete e instalação

Num raio de até 100 km da capital a Western assume o frete e a instalação,
mediante pagamento de taxa extra de entrega e instalação. Distâncias maiores
deverão ser cotadas com a equipe da Western. A regra aparece em três pontos do
guia: o chip da capa, a tabela de formas de pagamento e o passo 5 do passo a
passo (mais a pergunta "Quem entrega e instala?").


## Marcas no documento

Woodstone é uma coleção ArboREAL × Western, vendida pela HIO. As três marcas
aparecem assim:

- **capa** — faixa "A MATÉRIA" traz o lockup Western × ArboREAL, no ponto em que
  o material é explicado;
- **páginas de peça** — o logotipo da ArboREAL fecha o crédito "a madeira é
  sempre Pequiá maciço da ArboREAL", ao lado das tonalidades;
- **rodapé de todas as páginas** — Western | ArboREAL | HIO.

O logotipo veio de `public/expolazer2026/img/logo-arboreal-branco.png`
(versão branca), recortado e recolorido para o verde-tinta do guia. Se a
ArboREAL fornecer um arquivo vetorial oficial, troque `assets/arboreal*.png`.

## Pendências

Três itens dependem de arquivos que ainda não chegaram:

1. **Fonte de títulos** — Cabinet Grotesk já está pedida no CSS, mas os arquivos
   não estão no repositório; ver `src/fonts/LEIA-ME-cabinet-grotesk.txt`. Até lá
   os títulos saem em Instrument Sans.
2. **Bios oficiais das peças** — as descrições atuais são as do PDF original. As
   oficiais estão nas páginas de produto em arboreal.online e devem substituí-las
   em `PRODUCTS[*]["desc"]` dentro de `build.py`.
3. **Fotos aprovadas** — as imagens atuais foram extraídas do PDF original. As
   finais aprovadas devem substituir `assets/<peça>-hero.jpg`, `-b.jpg` e
   `-c.jpg`. O enquadramento de cada foto é ajustável por peça em `build.py`
   pelos campos `fhero` e `fshot` (valores de `object-position`, ex.: `"50% 30%"`).
