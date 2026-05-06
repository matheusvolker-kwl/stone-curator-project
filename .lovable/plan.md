## Diagnóstico

O menu está bugado por dois motivos:

1. **Breakpoint apertado**: o nav desktop ativa em `md` (768px). Com 5 itens + "Parceiro" + carrinho + logo, não cabe — o menu se sobrepõe ao logo (visível nos prints `/linhas` e `/colecoes`).
2. **Logo desproporcional** no menu mobile (logo gigante centralizado ao lado do hambúrguer) e oscilando entre `h-10`/`h-12` sem padrão claro.

Os arquivos de logo enviados (`WESTERN_BEGE_HORIZONTAL` e `WESTERN_VERDE_HORIZONTAL`) estão **corretos** — boa proporção, transparente, versões verde e bege. Vou substituir os atuais.

---

## Mudanças

### 1. Substituir arquivos de logo
- `src/assets/logo-horizontal-bege.png` ← `WESTERN_BEGE_HORIZONTAL-2.png`
- `src/assets/logo-horizontal-verde.png` ← `WESTERN_VERDE_HORIZONTAL.png`

### 2. `src/components/layout/Header.tsx`
- **Subir breakpoint do nav desktop** de `md:` para `lg:` (1024px). Abaixo de 1024px o usuário usa o drawer hambúrguer — evita o aperto em tablets.
- **Padronizar logo**: `h-9 lg:h-10 w-auto` em todas as resoluções (uma só altura consistente).
- **Padronizar padding do header**: `py-4 lg:py-5`.
- **Lógica de cor (já existe e está correta)**: `isCream` → logo verde + texto verde; caso contrário → logo bege + texto creme. Aplicada uniformemente em todas as rotas via array `CREAM_ROUTES`. Vou só **garantir consistência**: home (`/`) usa fundo verde → logo bege; `/linhas`, `/conjuntos`, `/guia-de-compra`, `/parceiro/*` usam fundo creme → logo verde; `/sobre`, `/contato`, `/produtos/:handle` ficam no padrão verde (header transparente sobre hero verde no topo).
- **Adicionar `whitespace-nowrap`** nos links do nav para garantir que nunca quebrem em duas linhas.
- **Drawer mobile**: ajustar a altura do logo do drawer também (`h-8`) para casar com a nova padronização.

### 3. Verificar todas as rotas
Após o ajuste, conferir visualmente em `/`, `/linhas`, `/conjuntos`, `/guia-de-compra`, `/sobre`, `/contato`, `/produtos/:handle`, `/parceiro/login`, `/parceiro/cadastro` que:
- Logo aparece no mesmo tamanho
- Cor do logo combina com a cor do menu (ambos verdes ou ambos beges)
- Não há sobreposição de itens
