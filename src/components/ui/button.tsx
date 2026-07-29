import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/**
 * Button — DS V3 (jul/2026)
 *
 * O que mudou e por quê:
 * - `default` era `bg-primary` = --primary = --western-gold (DOURADO). No V3 a ação
 *   primária é VERDE (--western-cta #1B3C26). Além de errado, por ser *utility* ela
 *   vencia `.btn-primary` (que vive em @layer components) na cascata — então quem
 *   escrevia `<Button className="btn-primary">` continuava com um botão dourado.
 *   Agora `default` já é verde: `.btn-primary` e `<Button>` concordam.
 * - Acento dourado virou variante explícita e opt-in (`gold`), para uso SOBRE FOTO
 *   OU VERDE, onde o verde não teria contraste. Não é mais o padrão silencioso.
 * - Altura 52px (--control-h) / sm 44px / raio 10px (--radius) / texto 16px semibold,
 *   sentence case, Source Sans 3 — sem mono, sem caixa-alta, sem cantos vivos.
 *
 * ATENÇÃO ao mexer aqui: `cn` é `twMerge`. As alturas são `h-*` (NÃO `min-h-*`) de
 * propósito — `min-h` não conflita com `h` no tailwind-merge, então um `min-h-control`
 * aqui sobreviveria ao `className` do consumidor e quebraria quem depende de
 * `buttonVariants()` com altura própria: Calendar (`h-7 w-7` no nav, `h-9 w-9` no dia),
 * SidebarTrigger (`h-7 w-7`) e as telas de admin (`h-9`/`h-10`/`h-11`).
 *
 * API preservada: mesmos nomes de variant (default/destructive/outline/secondary/
 * ghost/link) e size (default/sm/lg/icon) já consumidos por Button, buttonVariants,
 * alert-dialog, calendar, pagination, carousel e sidebar. `gold` é adição, não troca.
 */
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg font-sans text-[16px] font-semibold ring-offset-background transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-western-bronze focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-5 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        /* Primário do site: VERDE sobre fundo claro. Hover escurece (regra V3). */
        default: "bg-western-cta text-western-cream hover:bg-western-green-deep",
        /* Acento: dourado. Só sobre foto/verde, onde o verde não teria contraste. */
        gold: "bg-western-gold text-western-green-deep hover:bg-western-gold-soft",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        /* Secundário sobre fundo claro (equivale a .btn-outline-forest). */
        outline:
          "border border-western-border-strong bg-transparent text-western-green-deep hover:border-western-green-deep hover:bg-western-paper",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "text-western-green-deep hover:bg-western-paper hover:text-western-green-deep",
        /* Era text-primary (dourado) — dourado em texto sobre claro reprova no AA. */
        link: "text-western-green-deep underline-offset-4 hover:underline",
      },
      size: {
        default: "h-control px-7 py-2",
        sm: "h-[44px] px-5",
        lg: "h-[56px] px-8 text-[17px]",
        icon: "h-control w-[52px] px-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
