# Refino da página Sobre — fluxo dos irmãos + respiros

## Diagnóstico

Hoje a página tem **duas seções consecutivas** falando dos mesmos dois irmãos:

```
[NÚMEROS]  py-14
   ↓ (surface-cream → surface-paper)
[IRMÃOS BOTELHO]  py-20/28
  · eyebrow "Os irmãos Botelho"
  · H2 "Ricardo no desenho, Luiz Carlos na engenharia…"
  · foto widescreen 21:9 (gruta) + caption flutuante
   ↓ (surface-paper → surface-ivory)
[FAMÍLIA BOTELHO]  py-24/32
  · eyebrow "A família Botelho"
  · H2 "A família que trouxe uma tecnologia do Arizona…"
  · retrato 4:5 (segundo retrato) + caption lateral
  · 3 parágrafos (1993 / 1996 / 2026)
```

Resultado: dois eyebrows, dois H2, duas fotos dos mesmos irmãos, e um total de ~50vh de padding vertical entre números e o início da narrativa. É redundante e cria as faixas em branco.

## O que muda

### 1. Fundir as duas seções em uma única seção editorial

Estrutura nova:

```
[A FAMÍLIA BOTELHO]  surface-ivory  py-20/24
  · eyebrow único: "Os irmãos Botelho · 2ª geração"
  · H2 único combinando os dois títulos:
       "Ricardo no desenho,
        Luiz Carlos na engenharia.
        Trinta anos do mesmo ateliê, da mesma família."
  · FOTO HERO widescreen 21:9 (gruta — irmaosGruta) com caption flutuante
       → essa é a única foto dos irmãos na seção
  · narrativa em coluna controlada (max-w-3xl) abaixo da foto:
       parágrafo 1993 (Luiz Duarte)
       parágrafo 1996 (Ricardo + Luiz Carlos)
       parágrafo 2026 (33 anos)
  · pequeno bloco de assinatura no fim:
       "Ricardo & Luiz Carlos Botelho · 2ª geração · Cajamar/SP"
       (substitui o caption do retrato 4:5 que sai)
```

A foto retrato 4:5 (`ricardo-luiz-carlos.webp`) sai da página Sobre — ela já aparecia logo acima na widescreen, então cumpre função redundante. O conteúdo textual dos 3 parágrafos é preservado integralmente.

### 2. Calibrar paddings entre seções

- **Stats**: mantém `py-14 md:py-16`
- **Seção fundida dos irmãos**: `py-20 md:py-24` (era 20+28 e 24+32 separados)
- **Citação atmosférica** (Ricardo): mantém — funciona como respiro depois da narrativa
- **4 Pilares**: reduzir de `py-24 md:py-28` para `py-20 md:py-24`
- **Galeria**: idem `py-20 md:py-24`
- **Manifesto**: idem `py-20 md:py-24`
- **Arquitetos + Marcas**: idem `py-20 md:py-24`

Isso elimina o efeito "andar de elevador entre seções" que está causando os espaços estranhos.

### 3. Pequenos ajustes de continuidade

- Stats band: trocar borda inferior pra `border-western-stone-warm/15` ficar coerente com o `surface-ivory` que vem logo embaixo (a transição cream→paper→ivory criava 3 tons quase iguais em sequência → vamos pra cream→ivory direto, removendo a paper intermediária dos irmãos).
- A seção fundida usa `surface-ivory` (não mais `surface-paper`), eliminando uma troca de superfície.

## Não muda

- Hero, citação atmosférica, 4 pilares, galeria de obras, manifesto de vocabulário, arquitetos, marcas, CTA final — todos preservados.
- Conteúdo textual integral dos 3 parágrafos da história.
- Foto da gruta widescreen continua sendo a imagem principal dos irmãos.

## Arquivos

- `src/pages/About.tsx` — único arquivo afetado.
