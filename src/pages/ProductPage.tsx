import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchProduct, isSeasonal } from "@/lib/shopify/queries";
import { useMemo, useState } from "react";
import { buildCartItem, useCartStore } from "@/stores/cartStore";
import { formatBRL } from "@/lib/shopify/client";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ChevronLeft, ExternalLink, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function ProductPage() {
  const { handle = "" } = useParams();
  const { data: product, isLoading } = useQuery({
    queryKey: ["product", handle],
    queryFn: () => fetchProduct(handle),
    enabled: !!handle,
  });

  const [activeOptions, setActiveOptions] = useState<Record<string, string>>({});
  const [activeImage, setActiveImage] = useState(0);
  const [qty, setQty] = useState(1);
  const addItem = useCartStore((s) => s.addItem);
  const isLoadingCart = useCartStore((s) => s.isLoading);

  const variant = useMemo(() => {
    if (!product) return null;
    const variants = product.variants.edges.map((e) => e.node);
    if (Object.keys(activeOptions).length === 0) return variants[0];
    return (
      variants.find((v) =>
        v.selectedOptions.every((o) => activeOptions[o.name] === o.value)
      ) ?? variants[0]
    );
  }, [product, activeOptions]);

  if (isLoading) {
    return (
      <div className="surface-ivory">
        <div className="container-western py-32">
          <div className="grid md:grid-cols-2 gap-12">
            <div className="aspect-square bg-western-stone-warm/10 animate-pulse" />
            <div className="space-y-4">
              <div className="h-12 w-2/3 bg-western-stone-warm/10 animate-pulse" />
              <div className="h-4 w-1/3 bg-western-stone-warm/10 animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="surface-ivory">
        <div className="container-western py-32 text-center">
          <h1 className="font-display text-4xl text-western-green-deep">Peça não encontrada</h1>
          <Link to="/linhas" className="link-underline mt-6 inline-block text-western-gold">
            Voltar para linhas
          </Link>
        </div>
      </div>
    );
  }

  const images = product.images.edges.map((e) => e.node);
  const sku = variant?.sku ?? "";
  const modelo3dUrl = product.modelo3d?.value;
  const collection = product.collections?.edges?.[0]?.node;
  const parentSeasonal = collection ? isSeasonal(collection) : false;
  const parentRoute = collection
    ? parentSeasonal
      ? `/colecoes/${collection.handle}`
      : `/linhas/${collection.handle}`
    : "/linhas";
  const parentLabel = collection?.title ?? "Linhas";

  const handleAdd = async () => {
    if (!variant) return;
    const item = buildCartItem(product, variant.id, qty);
    if (!item) return;
    await addItem(item);
    toast.success("Peça adicionada ao pedido", {
      description: product.title,
      position: "top-right",
    });
  };

  const visibleOptions = product.options.filter(
    (o) => o.values.length > 1 || o.name.toLowerCase() !== "title"
  );

  return (
    <div className="surface-ivory">
      <div className="container-western py-12 md:py-20">
        <Link
          to={parentRoute}
          className="inline-flex items-center gap-2 text-western-stone-warm hover:text-western-gold transition-colors font-mono text-xs uppercase tracking-[0.2em] mb-10"
        >
          <ChevronLeft className="h-4 w-4" />
          {parentLabel}
        </Link>

        <div className="grid md:grid-cols-2 gap-10 lg:gap-20 items-start">
          {/* Gallery */}
          <div className="md:sticky md:top-24">
            <div className="frame-product aspect-square overflow-hidden">
              {images[activeImage] && (
                <img
                  src={images[activeImage].url}
                  alt={images[activeImage].altText ?? product.title}
                  className="w-full h-full object-contain p-8"
                />
              )}
            </div>
            {images.length > 1 && (
              <div className="flex gap-3 mt-4 overflow-x-auto">
                {images.map((img, idx) => (
                  <button
                    key={img.url}
                    onClick={() => setActiveImage(idx)}
                    className={`frame-product w-20 h-20 flex-shrink-0 transition-opacity ${
                      idx === activeImage ? "opacity-100" : "opacity-60 hover:opacity-90"
                    }`}
                    aria-label={`Imagem ${idx + 1}`}
                  >
                    <img src={img.url} alt="" className="w-full h-full object-contain p-1" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="md:py-2 text-western-green-deep">
            {/* Header */}
            {collection && <p className="text-eyebrow mb-5">{collection.title}</p>}
            <div className="w-12 h-px bg-western-gold mb-6" />
            <h1 className="font-display text-4xl md:text-5xl leading-[1.05]">
              {product.title}
            </h1>
            {sku && (
              <p className="text-spec text-western-stone-warm mt-3 tracking-[0.15em]">
                SKU · {sku}
              </p>
            )}

            {/* Short description — sempre visível */}
            {product.description && (
              <p className="mt-8 text-western-stone-warm leading-[1.75] text-[15px] max-w-prose">
                {product.description}
              </p>
            )}

            {/* Options */}
            {visibleOptions.length > 0 && (
              <div className="mt-12 space-y-8">
                {visibleOptions.map((option) => (
                  <div key={option.name}>
                    <p className="text-eyebrow mb-4">{option.name}</p>
                    <div className="flex flex-wrap gap-2.5">
                      {option.values.map((val) => {
                        const selected =
                          (activeOptions[option.name] ??
                            variant?.selectedOptions.find((o) => o.name === option.name)?.value) ===
                          val;
                        return (
                          <button
                            key={val}
                            onClick={() =>
                              setActiveOptions((prev) => ({ ...prev, [option.name]: val }))
                            }
                            className={`px-5 py-2.5 font-mono text-xs uppercase tracking-[0.2em] border transition-all duration-300 ${
                              selected
                                ? "border-western-gold text-western-gold bg-western-gold/5"
                                : "border-western-stone-warm/25 text-western-green-deep hover:border-western-gold/60"
                            }`}
                          >
                            {val}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Price + Add — bloco compacto */}
            <div className="mt-12 pt-8 border-t border-western-stone-warm/20">
              <div className="flex items-baseline justify-between mb-7">
                <span className="text-eyebrow">Condição parceiro</span>
                <span className="font-display text-3xl text-western-green-deep">
                  {variant && formatBRL(variant.price.amount, variant.price.currencyCode)}
                </span>
              </div>

              <div className="flex items-stretch gap-3">
                <div className="flex items-center border border-western-stone-warm/30">
                  <button
                    onClick={() => setQty(Math.max(1, qty - 1))}
                    className="px-4 hover:bg-western-gold/10 transition-colors text-western-green-deep"
                    aria-label="Diminuir"
                  >
                    −
                  </button>
                  <span className="px-4 text-spec min-w-[2ch] text-center">{qty}</span>
                  <button
                    onClick={() => setQty(qty + 1)}
                    className="px-4 hover:bg-western-gold/10 transition-colors text-western-green-deep"
                    aria-label="Aumentar"
                  >
                    +
                  </button>
                </div>
                <Button
                  onClick={handleAdd}
                  disabled={!variant?.availableForSale || isLoadingCart}
                  className="flex-1 h-12 bg-western-green-deep text-western-cream hover:bg-western-green-mid font-mono text-xs uppercase tracking-[0.25em] rounded-none"
                >
                  {isLoadingCart ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : variant?.availableForSale ? (
                    "Adicionar ao pedido"
                  ) : (
                    "Indisponível"
                  )}
                </Button>
              </div>

              <p className="text-spec text-western-stone-warm/80 leading-relaxed mt-5 text-xs">
                Produção em 15 dias úteis · pedido mínimo R$ 1.000
              </p>
            </div>

            {/* Accordions — detalhes secundários */}
            <Accordion
              type="single"
              collapsible
              className="mt-14 border-t border-western-stone-warm/20"
            >
              <ProductAccordion numeral="I" title="Ficha técnica" value="ficha">
                <dl className="space-y-0">
                  <SpecRow dt="Material" dd="Composto mineral de alta resistência" />
                  <SpecRow dt="Acabamento" dd="Texturizado mineral" />
                  <SpecRow dt="Garantia" dd="1 ano" />
                  <SpecRow dt="Origem" dd="São Paulo · Brasil" />
                </dl>
              </ProductAccordion>

              <ProductAccordion numeral="II" title="Modelo 3D · SketchUp" value="modelo">
                <p className="text-spec text-western-stone-warm leading-relaxed mb-5">
                  Baixe o modelo desta peça para integrar diretamente em seu projeto
                  arquitetônico.
                </p>
                <a
                  href={modelo3dUrl ?? "https://3dwarehouse.sketchup.com/by/WesternPools"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 link-underline text-western-gold font-mono text-xs uppercase tracking-[0.2em]"
                >
                  Abrir no 3D Warehouse <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </ProductAccordion>

              <ProductAccordion numeral="III" title="Produção & entrega" value="entrega">
                <p className="text-spec text-western-stone-warm leading-[1.8]">
                  Cada peça é produzida sob encomenda em nosso ateliê em São Paulo.
                  Prazo de produção de 15 dias úteis após confirmação do pagamento.
                  Frete calculado conforme destino e dimensões.
                </p>
              </ProductAccordion>

              <ProductAccordion numeral="IV" title="Cuidados" value="cuidados">
                <p className="text-spec text-western-stone-warm leading-[1.8]">
                  Limpeza com pano macio levemente úmido. Evite produtos abrasivos
                  ou ácidos. Para uso externo, recomenda-se selante mineral a cada
                  18 meses.
                </p>
              </ProductAccordion>
            </Accordion>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProductAccordion({
  numeral,
  title,
  value,
  children,
}: {
  numeral: string;
  title: string;
  value: string;
  children: React.ReactNode;
}) {
  return (
    <AccordionItem
      value={value}
      className="border-b border-western-stone-warm/20"
    >
      <AccordionTrigger className="py-6 hover:no-underline group [&>svg]:text-western-stone-warm">
        <span className="flex items-baseline gap-5 text-left">
          <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-western-gold w-5">
            {numeral}.
          </span>
          <span className="font-display text-xl text-western-green-deep group-hover:text-western-gold transition-colors">
            {title}
          </span>
        </span>
      </AccordionTrigger>
      <AccordionContent className="pb-8 pl-10">{children}</AccordionContent>
    </AccordionItem>
  );
}

function SpecRow({ dt, dd }: { dt: string; dd: string }) {
  return (
    <div className="flex justify-between border-b border-western-stone-warm/15 py-3 text-spec">
      <dt className="text-western-stone-warm">{dt}</dt>
      <dd className="text-western-green-deep">{dd}</dd>
    </div>
  );
}
