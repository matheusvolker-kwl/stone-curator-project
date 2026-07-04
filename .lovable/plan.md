# Relatório: ocorrências de "sketch" / "skp" em /src

Grep case-insensitive rodado em `src/`. Classificação por item + sugestão de copy/ação para os itens da categoria (A), que serão removidos.

---

## (A) PROMESSA DE ENTREGA DE SKETCHUP AO CLIENTE — REMOVER

Estes prometem entregar um arquivo `.skp` ou "prévia em SketchUp" ao cliente final. **Alvo de remoção.**

1. `src/data/guideMap.ts:388-396` → `interface SketchAssets { pdfUrl; skpUrl }` e `sketchAssetsFor(handle)` retornando `.pdf` e `.skp` em `/wp-content/uploads/sketches/`.
   → **Sugestão:** remover a interface e a função inteira. Buscar call sites e limpar.

2. `src/pages/ConjuntoPage.tsx:535` → `<Fact label="Extras" value="3D SketchUp · Garantia 1 ano" />`
   → **Sugestão:** trocar para `value="Garantia 1 ano"` (ou outro fact editorial equivalente).

3. `src/pages/ProductPage.tsx:257-259` → badge `Modelo 3D · SketchUp` com `aria-label="Modelo 3D SketchUp disponível"`.
   → **Sugestão:** remover a badge inteira (a PDP não vai mais prometer SketchUp).

4. `src/pages/ProductPage.tsx:459-490` → Callout "Modelo 3D SketchUp disponível" com CTA `Baixar .skp` / `3D Warehouse`.
   → **Sugestão:** remover o bloco inteiro do callout.

5. `src/components/product/ProductTabs.tsx:36-40` → constante `SKETCHUP_INCLUI` (bullets "Compatível com SketchUp Pro e Free…").
   → **Sugestão:** remover a constante.

6. `src/components/product/ProductTabs.tsx:197-232` → aba inteira "MODELO 3D · SKETCHUP" com CTA `Baixar modelo 3D (.skp)` / `Abrir no 3D Warehouse` e lista `SKETCHUP_INCLUI`.
   → **Sugestão:** remover a `TabsTrigger value="modelo3d"` (linha ~77 do arquivo — verificar) e o `TabsContent value="modelo3d"` inteiro.

7. `src/components/guide-v2/ProjetoSidebar.tsx:51` → badge `"Conjunto curado · SketchUp incluso"`.
   → **Sugestão:** trocar por `"Conjunto curado Western"` (ou apenas `"Conjunto curado"`).

8. `src/components/guide-v2/ProjetoSidebar.tsx:190-193` → botão `Baixar prévia em SketchUp` com `toast("Prévia em SketchUp em breve.")`.
   → **Sugestão:** remover o botão inteiro.

9. `src/pages/guia/Refinar.tsx:312` → texto "…O SketchUp é entregue apenas para os conjuntos…"
   → **Sugestão:** reescrever sem menção a SketchUp (ex.: "Você está ajustando a composição original — as peças e o total são recalculados em tempo real.") ou remover a frase.

10. `src/pages/guia/Contexto.tsx:87` → "…mostramos três caminhos de composição com peças, preço e prévia em SketchUp."
    → **Sugestão:** trocar `e prévia em SketchUp` por `e visualização da composição` (ou remover o trecho final).

11. `src/pages/guia/Contexto.tsx:113` → passo "03 — Refine e baixe o SketchUp / Ajuste peças, some autorais e leve a prévia."
    → **Sugestão:** trocar para algo como `{ n: "03", t: "Refine e finalize", d: "Ajuste peças, some autorais e envie ao cliente." }`.

12. `src/components/shared/PriceGate.tsx:36` → item da lista de benefícios: `"Artes, modelos SketchUp, guia de compra e de instalação"`.
    → **Sugestão:** trocar para `"Artes, guia de compra e de instalação"` (remover "modelos SketchUp").

---

## (A?) Fronteira — INSTITUCIONAL sobre o 3D Warehouse público

Estas menções **não** prometem entrega de `.skp` privado ao cliente — apontam para o canal público `3dwarehouse.sketchup.com/by/WesternPools` (arquivos disponíveis livremente lá). Preciso da tua decisão: **manter** (é diferencial institucional real) ou **remover junto** (descontinuar toda menção pública a SketchUp)?

- `src/config/business.ts:48` → `sketchupWarehouse: "https://3dwarehouse.sketchup.com/by/WesternPools"` (constante base).
- `src/pages/Index.tsx:55` → meta description "…modelos 3D no SketchUp Warehouse."
- `src/pages/Index.tsx:127` → card "Modelos 3D em SketchUp · +300 mil downloads…"
- `src/pages/FAQ.tsx:61` → resposta longa sobre baixar peças no 3D Warehouse.
- `src/pages/Contact.tsx:37-40` → card de canal "SketchUp 3D Warehouse".
- `src/pages/Parceria.tsx:125` → "4 acabamentos + 3D SketchUp".
- `src/pages/Parceria.tsx:138` → "Preço e 3D · Tabela de atacado e arquivos SketchUp."
- `src/pages/PorQueWestern.tsx:32,52` → argumentos longos sobre SketchUp Warehouse resolver "antes de comprar".
- `src/pages/ParceriaDireto.tsx:13` → "+300 mil · downloads dos modelos 3D no SketchUp".
- `src/components/product/WhyWesternStrip.tsx:24-27` → tile "Downloads no SketchUp Warehouse" com link.
- `src/components/layout/TopBar.tsx:8` → topbar "Modelos 3D · +300 mil downloads no SketchUp Warehouse".

Se a diretriz for "descontinuar TODA menção a SketchUp" (inclusive Warehouse público), este bloco vira (A) e sai junto. Se for só "não prometemos mais entregar .skp específico ao cliente/conjunto", este bloco fica como está.

---

## (B) FEATURE "MEUS SKETCHES" DA CONTA — não relacionada ao SketchUp

- `src/App.tsx:45` → `const AccountSketches = lazy(...)`
- `src/App.tsx:158` → `<Route path="sketches" element={<AccountSketches />} />`
- `src/pages/account/AccountSketches.tsx:6,13,15,22,27,29,36,45` → página inteira "Últimos guias salvos" (lê `guide_exports`, chama de "sketch" internamente).
- `src/components/account/AccountLayout.tsx:14` → comentário mencionando "sketches/favoritos/amostras/preferências" (rota escondida do menu mas ativa).

Nada aqui promete SketchUp — é o histórico de composições salvas do Guia de Compra. Fora do escopo desta limpeza.

---

## (C) OUTRO

Nenhuma ocorrência que não caiba em (A) ou (B).

---

## Resumo executivo

- **12 pontos claros de (A)** para remoção/reescrita (itens 1–12 acima) — concentrados em PDP (ProductPage, ProductTabs), Guia (ProjetoSidebar, Refinar, Contexto), ConjuntoPage, PriceGate e helper `sketchAssetsFor` em guideMap.
- **~11 pontos institucionais** apontando ao 3D Warehouse público — **preciso da tua decisão** antes de tocar.
- **(B) intocado.**

Me confirma: (a) removo só os 12 itens de promessa direta ao cliente e mantenho as menções institucionais ao 3D Warehouse público, ou (b) descontinuo TODA menção a SketchUp no site (inclusive Warehouse)? Com a resposta eu volto com um plano de edição.
