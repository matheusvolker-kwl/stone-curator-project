import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import iconePedra from "@/assets/icone-pedra-verde.png";
import { formatPreco, type ConjuntoLeaf, type Nivel } from "@/data/guideMap";
import { nivelLabelMap, nivelMicrocopy } from "./types";
import { getPecasPlaceholder, getPecaCount } from "./pecasPlaceholder";

interface Props {
  conjunto: ConjuntoLeaf;
  nivel: Nivel;
  highlight?: boolean;
  refinarHref: string;
}

export default function ComposicaoCard({ conjunto, nivel, highlight, refinarHref }: Props) {
  const pecas = getPecasPlaceholder(nivel);
  const resumo = pecas.slice(0, 4).map((p) => ({ nome: p.nome, qty: p.qty }));
  const economia = Math.ceil(conjunto.preco / 0.97 - conjunto.preco);

  return (
    <article
      className={cn(
        "relative bg-white border flex flex-col transition-all",
        highlight
          ? "border-western-green-deep border-2 shadow-[0_30px_48px_-30px_hsl(var(--western-stone-dark)/0.45)]"
          : "border-western-stone-warm/15 hover:border-western-gold/60 hover:shadow-[0_24px_40px_-28px_hsl(var(--western-stone-dark)/0.35)]"
      )}
    >
      <div className="aspect-[4/3] w-full relative overflow-hidden bg-western-paper flex items-center justify-center">
        <img src={iconePedra} alt="" aria-hidden className="h-20 opacity-25" />
        {highlight && (
          <span className="absolute top-4 right-4 font-mono text-[9px] uppercase tracking-[0.18em] px-2.5 py-1 bg-western-gold text-western-green-deep">
            Mais especificado
          </span>
        )}
      </div>

      <div className="p-7 md:p-8 flex flex-col flex-1 border-t border-western-stone-warm/10">
        <div className="text-eyebrow mb-3">
          {nivelLabelMap[nivel]} · {getPecaCount(nivel)} peças
        </div>
        <h3 className="font-display text-[24px] md:text-[26px] text-western-green-deep leading-[1.15] mb-3">
          {conjunto.nome}
        </h3>
        <p className="font-display italic text-[15px] text-western-stone-warm leading-relaxed mb-6">
          {nivelMicrocopy[nivel]}
        </p>

        <div className="border-t border-western-stone-warm/15 pt-5 mb-6">
          <ul className="space-y-2">
            {resumo.map((r, i) => (
              <li
                key={i}
                className="flex items-baseline justify-between font-mono text-[11px] uppercase tracking-[0.14em] text-western-stone-warm"
              >
                <span className="truncate pr-2">{r.nome}</span>
                <span className="text-western-green-deep">{r.qty}×</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-auto">
          <div className="font-display text-[32px] font-medium text-western-green-deep leading-none mb-2">
            {formatPreco(conjunto.preco)}
          </div>
          {economia >= 50 && (
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-western-gold mb-6">
              Economia de {formatPreco(economia)} vs. avulso
            </p>
          )}

          <Link to={refinarHref} className="btn-dark w-full">
            Personalizar <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </article>
  );
}
