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

  const totalPecas = real ? real.reduce((s, r) => s + r.qty, 0) : getPecaCount(nivel);

  return (
    <article
      className={cn(
        "relative h-full bg-white rounded-xl flex flex-col overflow-hidden transition-shadow duration-300",
        highlight
          ? "border-2 border-western-gold shadow-[0_28px_48px_-30px_hsl(var(--western-stone-dark)/0.35)]"
          : "border border-western-border-soft shadow-[0_18px_36px_-30px_hsl(var(--western-stone-dark)/0.3)] hover:shadow-[0_26px_44px_-30px_hsl(var(--western-stone-dark)/0.38)]"
      )}
    >
      {highlight && (
        <p className="absolute top-4 left-4 z-10 inline-flex items-center rounded-sm bg-western-gold px-3 py-1.5 font-sans text-[14px] font-semibold tracking-[0.06em] text-western-green-deep">
          Mais especificado
        </p>
      )}

      <div className="aspect-[4/3] w-full overflow-hidden bg-western-paper">
        <img
          src={image}
          alt=""
          aria-hidden
          loading="lazy"
          decoding="async"
          className="w-full h-full object-cover"
        />
      </div>

      <div className="p-6 md:p-7 flex flex-col flex-1 border-t border-western-border-soft">
        <p className="text-eyebrow mb-3">
          {nivelLabelMap[nivel]} · {totalPecas} peças
        </p>

        <h3 className="display-md text-western-green-deep mb-3">{conjunto.nome}</h3>

        <p className="text-body mb-6">{nivelMeta[nivel].detalhe}</p>

        <div className="border-t border-western-border-soft pt-5 mb-6">
          <ul className="space-y-2">
            {resumo.map((r, i) => (
              <li
                key={i}
                className="flex items-baseline justify-between gap-3 font-sans text-[15px] text-western-stone-warm"
              >
                <span className="truncate">{r.nome}</span>
                <span className="font-semibold tabular-nums text-western-green-deep flex-shrink-0">
                  {r.qty}×
                </span>
              </li>
            ))}
            {extras > 0 && (
              <li className="pt-1 font-sans text-[15px] text-western-stone-warm">
                + {extras} outra{extras > 1 ? "s" : ""} peça{extras > 1 ? "s" : ""}
              </li>
            )}
          </ul>
        </div>

        <div className="mt-auto">
          <div className="mb-5">
            <GatedPrice amount={preco} variant="block" className="text-price" />
          </div>

          <Link to={conjuntoHref ?? `/conjuntos/${conjunto.handle}`} className="btn-primary w-full">
            Ver esta composição <ArrowRight className="h-5 w-5" aria-hidden />
          </Link>
        </div>
      </div>
    </article>
  );
}
