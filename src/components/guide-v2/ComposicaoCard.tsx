import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { nivelMeta, type ConjuntoLeaf, type Nivel } from "@/data/guideMap";
import { fetchProduct, fetchProductsByHandles } from "@/lib/datasource";
import { useAuth } from "@/hooks/useAuth";
import GatedPrice from "@/components/shared/GatedPrice";
import { nivelLabelMap } from "./types";
import { getPecasPlaceholder, getPecaCount } from "./pecasPlaceholder";
import { conjuntoComposicao, handleToDisplayName } from "@/data/conjuntoComposicao";

interface Props {
  conjunto: ConjuntoLeaf;
  nivel: Nivel;
  image: string;
  highlight?: boolean;
  refinarHref: string;
  /** Href da PDP do conjunto COM o contexto do guia (tipo/área/acabamento). */
  conjuntoHref?: string;
}

export default function ComposicaoCard({ conjunto, nivel, image, highlight, refinarHref, conjuntoHref }: Props) {
  const { isApproved } = useAuth();
  const real = conjuntoComposicao[conjunto.handle];
  const pecas = getPecasPlaceholder(nivel);
  const distintas = real ? real.length : pecas.length;
  const resumo = real
    ? real.slice(0, 4).map((r) => ({ nome: handleToDisplayName(r.handle), qty: r.qty }))
    : pecas.slice(0, 4).map((p) => ({ nome: p.nome, qty: p.qty }));
  const extras = Math.max(0, distintas - 4);


  // Preço: soma REAL do manifesto (peça × qty, catálogo Woo) para parceiro
  // aprovado; fallbacks: produto do conjunto no Woo → preço do brief.
  // Visitante nunca vê número — GatedPrice mostra o chip do gate B2B.
  const { data: produto } = useQuery({
    queryKey: ["conjunto-product", conjunto.handle],
    queryFn: () => fetchProduct(conjunto.handle),
    staleTime: 5 * 60 * 1000,
    retry: 1,
    enabled: isApproved,
  });
  const { data: pecasReais } = useQuery({
    queryKey: ["conjunto-soma", conjunto.handle],
    queryFn: () => fetchProductsByHandles(real!.map((r) => r.handle)),
    staleTime: 5 * 60 * 1000,
    enabled: isApproved && !!real?.length,
  });

  const somaReal = useMemo(() => {
    if (!real?.length || !pecasReais?.length) return NaN;
    const byHandle = new Map(pecasReais.map((p) => [p.handle, p]));
    let s = 0;
    for (const r of real) {
      const p = byHandle.get(r.handle);
      const unit = p ? parseFloat(p.priceRange.minVariantPrice.amount) : NaN;
      if (!Number.isFinite(unit) || unit <= 0) return NaN;
      s += unit * r.qty;
    }
    return s;
  }, [real, pecasReais]);

  const precoShopify = produto
    ? parseFloat(produto.priceRange.minVariantPrice.amount)
    : NaN;
  const preco =
    Number.isFinite(somaReal) && somaReal > 0
      ? somaReal
      : Number.isFinite(precoShopify) && precoShopify > 0
        ? precoShopify
        : conjunto.preco;


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
          {nivelMeta[nivel].detalhe}
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
            {extras > 0 && (
              <li className="pt-1 font-mono text-[10px] uppercase tracking-[0.18em] text-western-stone-warm/80 italic">
                + {extras} outra{extras > 1 ? "s" : ""} peça{extras > 1 ? "s" : ""}
              </li>
            )}
          </ul>
        </div>

        <div className="mt-auto">
          <div className="mb-5">
            <GatedPrice
              amount={preco}
              variant="block"
              className="font-display text-[34px] font-medium text-western-green-deep leading-none"
            />
          </div>

          <Link to={conjuntoHref ?? `/conjuntos/${conjunto.handle}`} className="btn-dark w-full">
            Ver esta composição <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </article>
  );
}
