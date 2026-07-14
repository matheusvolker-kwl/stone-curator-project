import { ReactNode } from "react";
import Seo from "@/components/seo/Seo";

/* DS V3 — wrapper da prosa legal.
 *
 * A prosa base agora nasce no V3: sem serifa, sem mono, sem 12px. Duas regras
 * de cascata sustentam isso sem sabotar o que as páginas compõem por dentro:
 *
 * 1. RITMO por combinador FILHO (`[&>p]`, `[&>h2]`…). Blocos compostos que as
 *    páginas colocam aqui dentro (nav de políticas, card de pós-venda, faixa de
 *    fechamento) são aninhados, logo ficam imunes e mantêm o próprio espaçamento.
 *    Também evita o `space-y-*` do container vencer a margem do h2 por
 *    especificidade — bug silencioso do wrapper antigo.
 * 2. TIPOGRAFIA por descendente (`[&_h2]`), para alcançar prosa aninhada.
 *
 * Links: escopo `a:not([class])` — só âncora de prosa "crua" vira link verde.
 * Âncora com classe (btn-primary, btn-gold, btn-outline-cream, chip da nav)
 * mantém a própria pele: um `[&_a]:text-*` genérico é UTILITY e venceria o
 * .btn-* (que vive em @layer components), quebrando o texto dos CTAs.
 *
 * O corpo (17px/1.6, stone-warm) vem por HERANÇA do container — qualquer
 * utility direta no filho vence, então a faixa escura segue mandando na cor.
 */
export default function LegalPage({
  eyebrow,
  titulo,
  atualizadoEm,
  seoPath,
  seoTitle,
  seoDescription,
  children,
}: {
  eyebrow: string;
  titulo: string;
  atualizadoEm: string;
  seoPath?: string;
  seoTitle?: string;
  seoDescription?: string;
  children: ReactNode;
}) {
  return (
    <div className="surface-ivory">
      {seoPath && (
        <Seo
          title={seoTitle ?? `${eyebrow} — Western`}
          description={seoDescription ?? titulo}
          path={seoPath}
        />
      )}
      <div className="container-western py-20 md:py-24 max-w-3xl">
        <p className="text-eyebrow mb-4">{eyebrow}</p>
        {/* Filete dourado: acento fino, não texto. */}
        <div className="w-12 h-px bg-western-gold mb-6" />
        <h1 className="display-xl text-western-green-deep mb-3">{titulo}</h1>
        <p className="text-meta mb-12">Atualizado em {atualizadoEm}</p>

        <div
          className={[
            // Corpo: 17px/1.6 herdado pelos filhos.
            "font-sans text-[17px] leading-[1.6] text-western-stone-warm",

            // h2 — display Archivo 650, só aqui porque ≥22px (24→28px).
            "[&_h2]:font-display [&_h2]:font-[650] [&_h2]:text-[1.5rem] md:[&_h2]:text-[1.75rem]",
            "[&_h2]:leading-[1.15] [&_h2]:tracking-[-0.01em] [&_h2]:text-western-green-deep",
            "[&>h2]:mt-12 [&>h2]:mb-3",

            // h3 — sans semibold 20px. Era mono 12px dourado: ilegível e fora do V3.
            // tracking-normal zera o letter-spacing de display que o @layer base
            // aplica em h1–h5 (só faz sentido no Archivo, não numa sans de leitura).
            "[&_h3]:font-sans [&_h3]:text-[1.25rem] [&_h3]:font-semibold [&_h3]:leading-[1.3]",
            "[&_h3]:tracking-normal [&_h3]:text-western-green-deep",
            "[&>h3]:mt-8 [&>h3]:mb-2",

            // Ritmo dos blocos de prosa (escopo filho — não vaza para os compostos).
            "[&>p]:mb-5",
            "[&>ul]:mb-6 [&>ul]:list-disc [&>ul]:pl-6 [&>ul]:space-y-2",
            "[&_li]:marker:text-western-bronze",

            // Ênfase: tinta verde, semibold (o padrão do browser puxaria 700).
            "[&_strong]:font-semibold [&_strong]:text-western-green-deep",

            // Link de prosa: verde (CTA), sublinhado que firma no hover.
            "[&_a:not([class])]:text-western-cta [&_a:not([class])]:underline",
            "[&_a:not([class])]:decoration-western-cta/40 [&_a:not([class])]:underline-offset-2",
            "[&_a:not([class])]:hover:decoration-western-cta",
          ].join(" ")}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
