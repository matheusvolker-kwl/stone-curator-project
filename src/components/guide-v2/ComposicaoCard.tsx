import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
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
  // 4 maiores agregadas
  const resumo = pecas.slice(0, 4).map((p) => ({ nome: p.nome, qty: p.qty }));
  const economia = Math.ceil(conjunto.preco / 0.97 - conjunto.preco);

  return (
    <article
      className={cn(
        "relative bg-card border flex flex-col transition-colors",
        highlight
          ? "border-western-green-deep border-2"
          : "border-western-stone-warm/20 hover:border-western-stone-warm/60"
      )}
    >
      <div
        className="aspect-[4/3] w-full relative overflow-hidden"
        style={{
          background:
            "linear-gradient(160deg, hsl(var(--western-cream-muted) / 0.5), hsl(var(--western-cream)))",
        }}
      >
        {highlight && (
          <span className="absolute top-3 right-3 font-mono text-[9px] uppercase tracking-wider px-2.5 py-1 bg-western-gold text-western-cream">
            Mais especificado
          </span>
        )}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="font-display text-2xl text-western-green-deep/30">{conjunto.nome.split(" ").pop()}</span>
        </div>
      </div>

      <div className="p-7 flex flex-col flex-1">
        <div className="text-eyebrow mb-2">
          {nivelLabelMap[nivel]} · {getPecaCount(nivel)} peças
        </div>
        <h3 className="font-display text-[22px] text-western-green-deep leading-tight mb-2">{conjunto.nome}</h3>
        <p className="font-sans text-[13px] italic text-western-stone-warm leading-relaxed mb-5">
          {nivelMicrocopy[nivel]}
        </p>

        <div className="border-t border-western-stone-warm/15 pt-4 mb-5">
          <ul className="space-y-1.5">
            {resumo.map((r, i) => (
              <li
                key={i}
                className="flex items-baseline justify-between font-mono text-[11px] uppercase tracking-[0.12em] text-western-stone-warm"
              >
                <span className="truncate pr-2">{r.nome}</span>
                <span>{r.qty}×</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-auto">
          <div className="font-display text-[28px] font-medium text-western-green-deep leading-none mb-1.5">
            {formatPreco(conjunto.preco)}
          </div>
          {economia >= 50 && (
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-western-stone-warm/70 mb-5">
              Economia de {formatPreco(economia)} em relação às peças avulsas
            </p>
          )}

          <Link
            to={refinarHref}
            className="btn-dark w-full"
          >
            Personalizar esta composição <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </article>
  );
}
