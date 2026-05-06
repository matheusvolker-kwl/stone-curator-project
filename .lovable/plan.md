## Diagnóstico

Nos prints, o logo aparece bem menor que o texto do menu — está em `h-9 lg:h-10` (~36–40px), enquanto o menu + ícones ocupam altura visual maior. Preciso subir o logo e dar respiro ao header.

## Mudanças em `src/components/layout/Header.tsx`

1. **Logo principal**: `h-9 lg:h-10` → `h-12 lg:h-14` (48–56px). Fica proporcional ao menu sem dominar.
2. **Padding do header**: `py-4 lg:py-5` → `py-3 lg:py-4` para compensar o logo maior e manter a barra enxuta.
3. **Logo do drawer mobile**: `h-8` → `h-10`, casando com a nova proporção.

Sem outras alterações — cores, breakpoint `lg` e estrutura permanecem.

Se mesmo assim ficar pequeno, o próximo passo seria revisar os PNGs (eles podem ter muito padding transparente em volta do desenho, o que faz o logo "real" parecer menor que a altura do `<img>`). Nesse caso eu te aviso e você reenvia os arquivos cropados.
