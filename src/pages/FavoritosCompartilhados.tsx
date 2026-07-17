import { useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Heart, ArrowRight } from "lucide-react";
import { fetchProductsByHandles } from "@/lib/datasource";
import ProductCard from "@/components/product/ProductCard";
import Seo from "@/components/seo/Seo";

export default function FavoritosCompartilhados() {
  const [params] = useSearchParams();
  const raw = params.get("itens") ?? "";

  const handles = useMemo(() => {
    const seen = new Set<string>();
    return raw
      .split(",")
      .map((s) => s.trim())
      .filter((s) => {
        if (!s || seen.has(s)) return false;
        seen.add(s);
        return true;
      })
      .slice(0, 50);
  }, [raw]);

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["shared-favorites", handles.join(",")],
    queryFn: () => fetchProductsByHandles(handles),
    enabled: handles.length > 0,
    staleTime: 60_000,
  });

  return (
    <div className="surface-ivory min-h-[60vh]">
      {/* noindex: conteúdo parametrizado por link. O Seo ainda emite title/og —
          é o que o WhatsApp mostra quando a seleção é compartilhada. */}
      <Seo
        title="Seleção compartilhada — Western"
        description="Uma seleção de peças do catálogo Western enviada por alguém. Veja cada peça e monte o seu próprio orçamento."
        path="/favoritos-compartilhados"
        noindex
      />
      <div className="container-western py-10 md:py-16">
        <header className="mb-10 max-w-2xl md:mb-14">
          <p className="text-eyebrow mb-4">Seleção compartilhada</p>
          <h1 className="display-lg text-western-green-deep">Peças selecionadas</h1>
          <p className="text-body mt-5 max-w-[46ch]">
            Uma seleção enviada por alguém. Explore cada peça e monte o seu próprio
            orçamento.
          </p>
        </header>

        {handles.length === 0 ? (
          /* Vazio nunca é beco sem saída: cartão do sistema + CTA verde */
          <div className="rounded-2xl border border-western-border-soft bg-white p-8 text-center md:p-12">
            <Heart
              className="mx-auto mb-4 h-8 w-8 text-western-stone-warm/50"
              aria-hidden="true"
            />
            <p className="text-body mb-6">Nenhuma peça nesta seleção.</p>
            <Link to="/produtos" className="btn-primary w-full sm:w-auto">
              Ver o catálogo
              <ArrowRight className="h-5 w-5" aria-hidden="true" />
            </Link>
          </div>
        ) : isLoading ? (
          <div
            className="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4"
            aria-hidden="true"
          >
            {Array.from({ length: Math.min(handles.length, 8) }).map((_, i) => (
              <div
                key={i}
                className="aspect-square animate-pulse rounded-lg bg-western-stone-warm/10"
              />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="rounded-2xl border border-western-border-soft bg-white p-8 text-center md:p-12">
            <p className="text-body mb-6">
              Nenhuma peça encontrada para esta seleção.
            </p>
            <Link to="/produtos" className="btn-primary w-full sm:w-auto">
              Ver o catálogo
              <ArrowRight className="h-5 w-5" aria-hidden="true" />
            </Link>
          </div>
        ) : (
          /* Reaproveita o ProductCard já migrado: card V3 + preço gated (B2B).
             `grid` no <li> faz o card esticar em largura e altura (linhas alinhadas). */
          <ul className="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((p) => (
              <li key={p.id} className="grid">
                <ProductCard product={p} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
