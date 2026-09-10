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
| `margins.json` | espaçamentos verticais calibrados contra o layout original |
| `assets/` | fotos das peças, texturas das tonalidades e logos Western/HIO |
| `fonts/` | Instrument Sans e IBM Plex Mono (SIL Open Font License) |

Para alterar texto ou preços, edite `build.py`. Para mexer em espaçamento
vertical, ajuste `margins.json` — os valores são somados como `margin-top`
(ou `padding`) aos blocos correspondentes.

## Política de frete e instalação

Num raio de até 100 km da capital a Western assume o frete e a instalação,
mediante pagamento de taxa extra de entrega e instalação. Distâncias maiores
deverão ser cotadas com a equipe da Western. A regra aparece em três pontos do
guia: o chip da capa, a tabela de formas de pagamento e o passo 5 do passo a
passo (mais a pergunta "Quem entrega e instala?").
