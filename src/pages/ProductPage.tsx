import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchProduct, isSeasonal } from "@/lib/shopify/queries";
import { useMemo, useState } from "react";
import { buildCartItem, useCartStore } from "@/stores/cartStore";
import { formatBRL } from "@/lib/shopify/client";
import { Button } from "@/components/ui/button";
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

        <div className="grid md:grid-cols-2 gap-10 lg:gap-16 items-start">
          {/* Gallery */}
          <div>
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
          <div className="md:py-4 text-western-green-deep">
            {collection && <p className="text-eyebrow mb-5">{collection.title}</p>}
            <div className="w-12 h-px bg-western-gold mb-6" />
            <h1 className="font-display text-4xl md:text-5xl leading-tight">
              {product.title}
            </h1>
            {sku && <p className="text-spec text-western-stone-warm mt-3">SKU {sku}</p>}

            {product.description && (
              <p className="mt-8 text-western-stone-warm leading-relaxed">
                {product.description}
              </p>
            )}

            {/* Options */}
            {product.options
              .filter((o) => o.values.length > 1 || o.name.toLowerCase() !== "title")
              .map((option) => (
                <div key={option.name} className="mt-10">
                  <p className="text-eyebrow mb-4">{option.name}</p>
                  <div className="flex flex-wrap gap-3">
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

            {/* Price + Add */}
            <div className="mt-12 pt-8 border-t border-western-stone-warm/20">
              <div className="flex items-baseline justify-between mb-6">
                <span className="text-eyebrow">Condição parceiro</span>
                <span className="font-display text-3xl text-western-green-deep">
                  {variant && formatBRL(variant.price.amount, variant.price.currencyCode)}
                </span>
              </div>

              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center border border-western-stone-warm/30">
                  <button
                    onClick={() => setQty(Math.max(1, qty - 1))}
                    className="px-4 py-3 hover:bg-western-gold/10 transition-colors"
                    aria-label="Diminuir"
                  >
                    −
                  </button>
                  <span className="px-5 text-spec">{qty}</span>
                  <button
                    onClick={() => setQty(qty + 1)}
                    className="px-4 py-3 hover:bg-western-gold/10 transition-colors"
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

              <p className="text-spec text-western-stone-warm leading-relaxed">
                Produção em 15 dias úteis após confirmação do pagamento. Pedido
                mínimo de R$ 1.000.
              </p>
            </div>

            {/* 3D Model */}
            <div className="mt-10 p-6 border border-western-stone-warm/20">
              <p className="text-eyebrow mb-2">Modelo 3D — SketchUp</p>
              <p className="text-spec text-western-stone-warm mb-4">
                Baixe o modelo desta peça para usar diretamente em seu projeto.
              </p>
              <a
                href={modelo3dUrl ?? "https://3dwarehouse.sketchup.com/by/WesternPools"}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 link-underline text-western-gold font-mono text-xs uppercase tracking-[0.2em]"
              >
                Abrir no 3D Warehouse <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>

            {/* Tech sheet */}
            <div className="mt-10">
              <p className="text-eyebrow mb-4">Ficha técnica</p>
              <dl className="space-y-2 text-spec">
                <Row dt="Material" dd="Composto mineral de alta resistência" />
                <Row dt="Garantia" dd="1 ano" />
                <Row dt="Origem" dd="São Paulo · Brasil" />
              </dl>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ dt, dd }: { dt: string; dd: string }) {
  return (
    <div className="flex justify-between border-b border-western-stone-warm/15 py-2">
      <dt className="text-western-stone-warm">{dt}</dt>
      <dd className="text-western-green-deep">{dd}</dd>
    </div>
  );
}
