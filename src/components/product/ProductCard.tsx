import { Link } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import type { ShopifyProductNode } from "@/lib/catalog/types";
import { cdnImg, cdnSrcSet } from "@/lib/catalog/client";
import { fetchProduct } from "@/lib/datasource";
import { ArrowRight, Lock } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import WishlistButton from "./WishlistButton";
import GatedPrice from "@/components/shared/GatedPrice";

interface Props {
  product: ShopifyProductNode;
  surface?: "forest" | "cream";
}

const FINISH_SWATCHES: Record<string, string> = {
  quartzo: "38 35% 86%",
  arenito: "32 36% 65%",
  moledo: "20 30% 45%",
  granito: "140 8% 22%",
};

const DEFAULT_FINISHES = ["Quartzo", "Arenito", "Moledo", "Granito"];

function dimensionFromTitle(t: string): string | null {
  const m = t.match(/(\d+)\s*[x×]\s*(\d+)(?:\s*[x×]\s*(\d+))?/i);
  if (!m) return null;
  return m[3] ? `${m[1]}×${m[2]}×${m[3]} cm` : `${m[1]}×${m[2]} cm`;
}

/* === Card de peça (V3) =====================================================
 * Hierarquia: o card INTEIRO é o link para a PDP e a única ação explícita é o
 * CTA VERDE "Ver a peça". O gate de preço é INFORMAÇÃO (linha com cadeado),
 * nunca um botão — o destaque visual não pode ir para a porta fechada.
 *
 * Regras que este arquivo tem que respeitar:
 *  - Um alvo por card. O coração some no mobile (favoritos é fase 2 e rouba
 *    área de toque); no desktop ele aparece no hover, ancorado no CARD.
 *  - O nome da peça NUNCA pode ser truncado a ponto de duas peças diferentes
 *    virarem o mesmo rótulo ("Cascata Lajedo…" Boreal vs. Yporanga). Título em
 *    17px no mobile com até 3 linhas, altura reservada para alinhar a fileira.
 *  - Nada abaixo de 14px: o código da peça saiu de cima da foto e vive na área
 *    de texto, a 14px, junto da linha.
 *  - Mídia = uma superfície só (branco, igual ao card): a foto é um retângulo
 *    branco e sobre fundo bege ela flutuava, deixando faixa morta embaixo.
 *  - Nada de <a>/<button> aninhado: o card já é um <Link>. O CTA é um <span>
 *    estilizado (o clique é o do card) e o GatedPrice vai com linked={false}.
 * ========================================================================== */
export default function ProductCard({ product }: Props) {
  const img = product.images.edges[0]?.node;
  const sku = product.variants.edges[0]?.node?.sku ?? "";
  const code = sku.split("-")[1] ?? sku.slice(0, 4).toUpperCase();
  const linha = product.collections?.edges?.[0]?.node?.title ?? null;
  const queryClient = useQueryClient();
  // Mesma fonte de verdade do GatedPrice: o preço só existe para o parceiro
  // aprovado. Aqui isso decide apenas QUAL bloco ocupa o slot (preço x aviso).
  const { isApproved, session } = useAuth();

  // Detecta acabamentos disponíveis a partir das opções
  const finishOption = product.options.find((o) => /acabament|cor|finish/i.test(o.name));
  const finishes = finishOption?.values?.length ? finishOption.values : DEFAULT_FINISHES;

  // Detecta dimensão a partir do variant title ou do título
  const variantTitle = product.variants.edges[0]?.node?.title ?? "";
  const dim =
    dimensionFromTitle(variantTitle) ||
    dimensionFromTitle(product.title) ||
    null;

  // Prefetch do PDP no hover/focus — clique fica instantâneo
  const prefetch = () => {
    queryClient.prefetchQuery({
      queryKey: ["product", product.handle],
      queryFn: () => fetchProduct(product.handle),
      staleTime: 1000 * 60 * 5,
    });
  };

  return (
    <Link
      to={`/produtos/${product.handle}`}
      onMouseEnter={prefetch}
      onFocus={prefetch}
      onTouchStart={prefetch}
      className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-western-border-soft bg-white shadow-[0_2px_10px_-6px_hsl(var(--western-stone-dark)/0.25)] transition-shadow duration-200 hover:shadow-[0_14px_30px_-16px_hsl(var(--western-stone-dark)/0.35)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-western-cta focus-visible:ring-offset-2"
    >
      {/* Favoritar: só no desktop, no hover, ancorado no canto do CARD.
          No mobile ele encavalava a foto (duas caixas brancas se fundindo) e
          concorria com o CTA — um alvo por card. */}
      <div className="absolute top-3 right-3 z-10 hidden transition-opacity md:block md:opacity-0 md:group-hover:opacity-100 md:focus-within:opacity-100">
        <WishlistButton
          handle={product.handle}
          title={product.title}
          image={img ? cdnImg(img.url, 400) : null}
          className="h-12 w-12 rounded-lg border-western-border-strong shadow-sm"
        />
      </div>

      {/* Mídia: superfície única (branca, igual à do card) + proporção fixa.
          Antes o fundo era bege e a foto (retângulo branco) flutuava dentro. */}
      <div className="aspect-[4/3] overflow-hidden border-b border-western-border-soft bg-white">
        {img ? (
          <img
            src={cdnImg(img.url, 700)}
            srcSet={cdnSrcSet(img.url, [400, 700, 1000])}
            sizes="(min-width: 1024px) 320px, 45vw"
            width={700}
            height={700}
            alt={img.altText || product.title}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-contain p-3 transition-transform duration-500 ease-out group-hover:scale-[1.03] md:p-4"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-western-cream/60 text-[14px] font-semibold text-western-stone-warm">
            Foto da peça
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-3 md:p-5">
        {/* Linha + código da peça: 14px (o badge de 12px sobre a foto morreu). */}
        {(linha || code) && (
          <p className="text-meta flex flex-wrap items-center gap-x-1.5">
            {linha && <span>{linha}</span>}
            {linha && code && <span aria-hidden="true">·</span>}
            {code && (
              <span className="font-semibold tracking-[0.04em] text-western-bronze">{code}</span>
            )}
          </p>
        )}

        {/* Nome: 2–3 linhas, altura reservada. "Cascata Lajedo Boreal" e
            "Cascata Lajedo Yporanga" TÊM que sair diferentes na grade. */}
        <h3 className="font-sans text-[17px] font-semibold leading-[1.3] text-western-green-deep line-clamp-3 min-h-[44px] break-words group-hover:underline group-hover:decoration-western-gold group-hover:underline-offset-4 md:text-[20px] md:leading-[1.25] md:line-clamp-2 md:min-h-[50px]">
          {product.title}
        </h3>

        {dim && <p className="text-meta">{dim}</p>}

        {/* Acabamentos — tamanho fixo + shrink-0: no celular os swatches
            colapsavam em barras porque o flex os espremia. */}
        <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1.5">
          <span className="flex shrink-0 items-center gap-1.5">
            {finishes.slice(0, 4).map((f) => {
              const key = f.toLowerCase().split(/\s+/)[0];
              const swatch = FINISH_SWATCHES[key] ?? "30 12% 55%";
              return (
                <span
                  key={f}
                  title={f}
                  aria-hidden="true"
                  className="h-4 w-4 shrink-0 rounded-full ring-1 ring-western-border-strong"
                  style={{ backgroundColor: `hsl(${swatch})` }}
                />
              );
            })}
          </span>
          <span className="text-meta">
            {finishes.length} {finishes.length === 1 ? "acabamento" : "acabamentos"}
          </span>
        </div>

        <div className="mt-auto flex flex-col gap-2.5 border-t border-western-border-soft pt-3">
          {isApproved ? (
            <GatedPrice
              amount={product.priceRange.minVariantPrice.amount}
              currency={product.priceRange.minVariantPrice.currencyCode}
              className="font-sans text-[20px] font-bold tabular-nums text-western-green-deep"
              linked={false}
            />
          ) : (
            /* O gate é INFORMAÇÃO, não botão: sem borda, sem cara de CTA, sem
               roubar o clique do card. Mas o TEXTO enquadra como VALOR (há um
               preço de atacado a destravar), não como "bloqueado" — por isso
               bronze, não cinza. O caminho de cadastro continua na PDP. */
            <p className="flex items-start gap-1.5 font-sans text-[14px] font-semibold leading-snug text-western-bronze">
              <Lock className="mt-[2px] h-4 w-4 shrink-0" aria-hidden="true" />
              <span>
                {session ? "Preço liberado após a aprovação" : "Preço de parceiro no cadastro"}
              </span>
            </p>
          )}

          {/* CTA primário do card: VERDE, 52px, raio 10px, largura total, uma
              linha. É um <span> de propósito — quem clica é o <Link> do card. */}
          <span className="inline-flex min-h-control w-full items-center justify-center gap-2 whitespace-nowrap rounded-lg bg-western-cta px-3 font-sans text-[16px] font-semibold text-western-cream transition-colors group-hover:bg-western-green-deep md:px-5">
            Ver a peça
            <ArrowRight
              className="h-4 w-4 shrink-0 transition-transform group-hover:translate-x-0.5"
              aria-hidden="true"
            />
          </span>
        </div>
      </div>
    </Link>
  );
}
