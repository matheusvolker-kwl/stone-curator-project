## Refinar o FAB do WhatsApp

O botão flutuante "FALAR COM CONSULTOR" está usando o ícone genérico `MessageCircle` do Lucide e tem um visual pesado (verde chapado, sombra muito saturada, bolha grande). Vou trocar pelo logo oficial do WhatsApp e refinar o acabamento.

### Mudanças em `src/components/layout/WhatsAppFAB.tsx`

1. **Logo do WhatsApp real**: substituir `MessageCircle` por um SVG inline do glifo oficial do WhatsApp (telefone dentro do balão), em branco, com tamanho proporcional. Sem dependências novas.
2. **Refino visual**:
   - Verde mais discreto: gradiente sutil `#1FAE54 → #25D366` (em vez do verde chapado puro).
   - Sombra mais suave e neutra (preto com baixa opacidade) em vez do "glow" verde saturado.
   - Borda interna 1px branca em baixa opacidade para dar profundidade.
   - Padding equilibrado, altura `h-12`, raio totalmente arredondado.
   - Tipografia mantém mono uppercase, mas tracking reduzido para `0.14em` e peso `medium` para parecer menos "tosco".
   - Separador vertical fino entre logo e texto (apenas no desktop quando o texto aparece).
   - Hover: leve `scale-[1.02]` + sombra um pouco mais marcada, sem mudar a cor abruptamente.
   - Respeitar `prefers-reduced-motion`.
3. **Acessibilidade**: manter `aria-label`, marcar o SVG como `aria-hidden`.
4. Lógica existente (esconder em PDP, link `wa.me`) **não muda**.

Sem alterações em outros arquivos.