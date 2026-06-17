# Plano de implementação

## O que vou alterar

### 1. Faixa de parceiros na Home
- Trocar o eyebrow de `Prova de procedência` para `Parceiros de longa data`.
- Manter o bloco editorial, o ritmo visual e a animação atuais.
- Preservar a chamada dos arquitetos exatamente como prova social separada dos parceiros corporativos.

### 2. Logos corporativos: título, descrição e sem saída do site
- Ajustar o componente `MarcasInstitucionais` para permitir exibição puramente institucional, sem redirecionamento externo.
- Na Home, inserir um título e uma descrição para esse grupo de marcas, em linha com o posicionamento que você pediu, algo na direção de:
  - título: `Empresas que confiam na Western`
  - descrição: texto curto explicando que são marcas e parceiros corporativos recorrentes.
- Manter as logos com a mesma animação, proporção e presença visual.
- Remover o clique que leva para sites externos nesse contexto da Home.
- Preservar o uso atual do componente em outras páginas para não quebrar trechos já prontos.

## 3. Novas imagens de capa das linhas
Vou substituir as capas das linhas abaixo pelas imagens que você enviou:
- Pedras Médias
- Pedras Pequenas
- Revestimentos
- Pedras de Borda
- Pisadas

### Onde essas novas capas entram
- Home: cards de linhas exibidos em `ColecoesGrid`
- Página `/linhas`: grade principal de linhas

### O que não vou mexer
- Não vou alterar produtos, textos internos das coleções ou páginas de produto.
- Não vou mudar o layout da Home nem da página `/linhas` além da atualização de conteúdo visual e textual solicitada.
- Não vou alterar a página interna de cada linha (`/linhas/:handle`) nesta etapa, a menos que você peça depois.

## Abordagem técnica
- Criar um mapeamento local por `handle` de coleção para sobrescrever apenas a imagem exibida no frontend dessas 5 linhas.
- Usar os arquivos enviados como assets do projeto, com alt text apropriado por linha.
- Aplicar esse mapeamento tanto em `src/components/home/ColecoesGrid.tsx` quanto em `src/pages/Linhas.tsx`.
- Evoluir `src/components/shared/MarcasInstitucionais.tsx` para suportar modo sem link externo, sem afetar os usos existentes.
- Ajustar a seção correspondente em `src/pages/Index.tsx` com o novo título/copy da prova social corporativa.

## Arquivos que pretendo alterar
- `src/components/shared/MarcasInstitucionais.tsx`
- `src/pages/Index.tsx`
- `src/components/home/ColecoesGrid.tsx`
- `src/pages/Linhas.tsx`

## Novos assets
- As 5 imagens enviadas serão incorporadas como capas dessas linhas no frontend.

## Resultado esperado
- A Home passa a mostrar `Parceiros de longa data` no bloco institucional.
- As logos corporativas continuam animadas, mas deixam de abrir sites externos.
- O bloco ganha título e descrição para contextualizar Biopet, Cristal Pool, Genesis, Cobasi etc.
- As linhas selecionadas passam a usar suas novas capas na Home e em `/linhas`. 

## Observação
- Vou usar um texto institucional curto e elegante para o bloco de parceiros corporativos, sem inventar novas seções nem mudar a estrutura da página.