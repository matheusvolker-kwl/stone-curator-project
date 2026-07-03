## Objetivo
Substituir a imagem de fundo do hero de `/parceria` pela foto enviada (pedra bege à beira da piscina de água turquesa).

## Passos

1. **Otimizar a imagem** (originalmente ~1920px PNG):
   - Gerar `hero-parceria.webp` em 1800px de largura (qualidade ~82), para desktop/retina.
   - Gerar `hero-parceria-sm.webp` em 900px de largura (qualidade ~78), para mobile.
   - Ambas com `cwebp` no sandbox.

2. **Hospedar via Lovable Assets** (CDN), não commitar binários:
   - `lovable-assets create` para cada variante → gera `src/assets/hero-parceria.webp.asset.json` e `src/assets/hero-parceria-sm.webp.asset.json`.

3. **Editar `src/pages/Parceria.tsx`**:
   - Remover imports `hero-cascata` / `hero-cascata-sm`.
   - Importar os dois novos pointers JSON.
   - Trocar `src` / `srcSet` do `<img>` do hero pelos `.url` dos assets.
   - Atualizar o `alt` para descrever a nova cena ("Pedra artesanal Western à beira de piscina com água cristalina.").
   - **Ajuste de corte**: manter `object-cover`, trocar `object-center` por `object-[center_60%]` para que a pedra (parte inferior/central da foto) fique visível abaixo do texto do hero, e a água/vegetação superior componha o topo. O overlay verde escuro existente permanece para garantir legibilidade do texto claro.
   - Manter `width={1800} height={ratio}` correto da nova imagem (a foto enviada é 1920×~1440, ratio 4:3).

4. **Não alterar** mais nada: `ParceriaDireto` continua usando `hero-cascata`, outras páginas idem.

5. Rodar `tsgo --noEmit` ao final.

## Detalhes técnicos
- `object-position` escolhida (`center 60%`) porque o texto do hero está alinhado ao rodapé (`items-end pb-24`); mover o foco visual para baixo evita que a pedra fique atrás do texto e mantém água/plantas como plano de fundo do título.
- Gradient overlay atual já vai de 70% opacidade no topo → 88% no rodapé; funciona bem sobre a foto clara/turquesa sem ajuste extra.
- Nenhuma imagem binária permanece no repositório — só pointers `.asset.json`.
