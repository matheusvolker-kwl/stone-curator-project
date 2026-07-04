import { Link } from "react-router-dom";
import { ArrowRight, Info } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { formatPreco, PEDIDO_MINIMO, type ConjuntoLeaf, type Nivel } from "@/data/guideMap";
import { fetchProduct } from "@/lib/datasource";
import { useAuth } from "@/hooks/useAuth";
import { nivelLabelMap, nivelMicrocopy } from "./types";
import { getPecasPlaceholder, getPecaCount } from "./pecasPlaceholder";
import { conjuntoComposicao, handleToDisplayName } from "@/data/conjuntoComposicao";

interface Props {
  conjunto: ConjuntoLeaf;
  nivel: Nivel;
  image: string;
  highlight?: boolean;
  refinarHref: string;
}

export default function ComposicaoCard({ conjunto, nivel, image, highlight, refinarHref }: Props) {
  const real = conjuntoComposicao[conjunto.handle];
  const pecas = getPecasPlaceholder(nivel);
  const distintas = real ? real.length : pecas.length;
  const resumo = real
    ? real.slice(0, 4).map((r) => ({ nome: handleToDisplayName(r.handle), qty: r.qty }))
    : pecas.slice(0, 4).map((p) => ({ nome: p.nome, qty: p.qty }));
  const extras = Math.max(0, distintas - 4);


  // Preço vem do Shopify (fonte de verdade). Fallback: preço do brief no guideMap.
  const { data: produto } = useQuery({
    queryKey: ["conjunto-product", conjunto.handle],
    queryFn: () => fetchProduct(conjunto.handle),
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  const precoShopify = produto
    ? parseFloat(produto.priceRange.minVariantPrice.amount)
    : NaN;
  const preco = Number.isFinite(precoShopify) ? precoShopify : conjunto.preco;
  const economia = Math.ceil(preco / 0.97 - preco);
  const abaixoDoMinimo = preco < PEDIDO_MINIMO;

  return (
    <article
      className={cn(
        "relative bg-white flex flex-col transition-all duration-500 group",
        highlight
          ? "shadow-[0_44px_64px_-32px_hsl(var(--western-stone-dark)/0.5)] -translate-y-2"
          : "shadow-[0_24px_44px_-30px_hsl(var(--western-stone-dark)/0.35)] hover:shadow-[0_36px_56px_-32px_hsl(var(--western-stone-dark)/0.45)] hover:-translate-y-1"
      )}
    >
      {highlight && (
        <div
          aria-hidden
          className="absolute -top-3 left-7 z-10 px-3 py-2 bg-western-gold text-western-green-deep font-mono text-[10px] uppercase tracking-[0.22em] shadow-[0_10px_18px_-10px_hsl(var(--western-stone-dark)/0.45)]"
        >
          Mais especificado
        </div>
      )}

      <div className="aspect-[4/3] w-full relative overflow-hidden bg-western-paper">
        <img
          src={image}
          alt=""
          aria-hidden
          loading="lazy"
          decoding="async"
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
        />
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "linear-gradient(180deg, transparent 50%, hsl(var(--western-green-deep) / 0.45) 100%)",
          }}
        />
      </div>

      <div className="p-7 md:p-8 flex flex-col flex-1 border-t border-western-stone-warm/10 relative">
        <div className="eyebrow-bar mb-3">
          {nivelLabelMap[nivel]} · {real ? real.reduce((s, r) => s + r.qty, 0) : getPecaCount(nivel)} peças
        </div>
        <h3 className="font-display text-[26px] md:text-[28px] text-western-green-deep leading-[1.1] mb-3">
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
          <div className="font-display text-[34px] font-medium text-western-green-deep leading-none mb-2">
            {formatPreco(preco)}
          </div>
          {economia >= 50 && !abaixoDoMinimo && (
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-western-gold mb-6">
              Economia de {formatPreco(economia)} vs. avulso
            </p>
          )}
          {abaixoDoMinimo && (
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-western-stone-warm mb-6 inline-flex items-start gap-1.5 leading-snug">
              <Info className="h-3 w-3 mt-0.5 flex-shrink-0 text-western-gold" />
              Pedido mínimo {formatPreco(PEDIDO_MINIMO)} · some itens autorais para atingir.
            </p>
          )}

          <Link to={`/conjuntos/${conjunto.handle}`} className="btn-dark w-full">
            Ver esta composição <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </article>
  );
}
