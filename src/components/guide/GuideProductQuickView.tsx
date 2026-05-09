import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUpRight, Check, ExternalLink, Loader2, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import FinishSelector from "@/components/product/FinishSelector";
import GatedPrice from "@/components/shared/GatedPrice";
import { fetchProduct } from "@/lib/shopify/queries";
import { cdnImg } from "@/lib/shopify/client";
import { parseProductDescription } from "@/lib/shopify/parseDescription";
import { buildCartItem, useCartStore } from "@/stores/cartStore";

interface Props {
  /** Handle do produto Shopify */
  handle: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Quick View modal de produto dentro do Guia.
 * Mantém o usuário na etapa atual (sem navegar para /produtos/...).
 */
export default function GuideProductQuickView({ handle, open, onOpenChange }: Props) {
  const { data: product, isLoading } = useQuery({
    queryKey: ["quick-view", handle],
    queryFn: () => (handle ? fetchProduct(handle) : Promise.resolve(null)),
    enabled: !!handle && open,
    staleTime: 5 * 60 * 1000,
  });

  const addItem = useCartStore((s) => s.addItem);
  const cartItems = useCartStore((s) => s.items);
  const cartLoading = useCartStore((s) => s.isLoading);

  const finishOption = product?.options.find((o) => /acabamento/i.test(o.name));
  const finishValues = finishOption?.values ?? [];
  const [acabamento, setAcabamento] = useState<string>(finishValues[0] ?? "");
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    if (finishValues.length && !finishValues.includes(acabamento)) {
      setAcabamento(finishValues[0]);
    }
  }, [finishValues, acabamento]);

  // Reset state quando o modal abre com novo produto
  useEffect(() => {
    if (open) setActiveImage(0);
  }, [open, handle]);

  const selectedVariant = useMemo(() => {
    if (!product) return null;
    if (!finishOption) return product.variants.edges[0]?.node ?? null;
    return (
      product.variants.edges.find((e) =>
        e.node.selectedOptions.some(
          (o) => /acabamento/i.test(o.name) && o.value.toLowerCase() === acabamento.toLowerCase()
        )
      )?.node ?? product.variants.edges[0]?.node ?? null
    );
  }, [product, acabamento, finishOption]);

  const parsed = useMemo(
    () => (product?.descriptionHtml ? parseProductDescription(product.descriptionHtml) : null),
    [product]
  );

  const images = product?.images.edges.map((e) => e.node.url) ?? [];
  const hero = images[activeImage] ?? images[0];

  const inCart = product ? cartItems.some((i) => i.productHandle === product.handle) : false;

  const handleAdd = async () => {
    if (!product || !selectedVariant) {
      toast.error("Produto indisponível agora.");
      return;
    }
    const item = buildCartItem(product, selectedVariant.id, 1);
    if (!item) return;
    await addItem(item);
    toast.success(`${product.title} adicionado`, {
      description: acabamento ? `Acabamento ${acabamento}.` : undefined,
    });
    // Mantém aberto para encadear ações; user fecha quando quiser.
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl w-[calc(100vw-2rem)] sm:w-full p-0 max-h-[90vh] overflow-hidden flex flex-col bg-white border-western-stone-warm/20">
        <DialogHeader className="sr-only">
          <DialogTitle>{product?.title ?? "Produto"}</DialogTitle>
          <DialogDescription>Visualização rápida do produto sem sair do guia.</DialogDescription>
        </DialogHeader>

        <div className="grid md:grid-cols-[1.1fr_1fr] gap-0 overflow-hidden flex-1 min-h-0">
          {/* Imagens */}
          <div className="bg-western-cream/40 flex flex-col min-h-0">
            <div className="relative aspect-square md:aspect-auto md:flex-1 min-h-[280px] overflow-hidden">
              {isLoading ? (
                <Skeleton className="w-full h-full rounded-none" />
              ) : hero ? (
                <AnimatePresence mode="wait">
                  <motion.img
                    key={hero}
                    src={cdnImg(hero, 1000)}
                    alt={product?.title ?? ""}
                    className="absolute inset-0 w-full h-full object-contain p-6"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    loading="lazy"
                  />
                </AnimatePresence>
              ) : (
                <div className="w-full h-full bg-western-green-deep/10" />
              )}
            </div>
            {images.length > 1 && (
              <div className="flex gap-2 p-3 overflow-x-auto scrollbar-hide border-t border-western-stone-warm/15">
                {images.slice(0, 6).map((url, i) => (
                  <button
                    key={url}
                    type="button"
                    onClick={() => setActiveImage(i)}
                    className={`shrink-0 h-14 w-14 overflow-hidden border transition-colors ${
                      i === activeImage ? "border-western-gold" : "border-western-stone-warm/20 hover:border-western-stone-warm/40"
                    }`}
                    aria-label={`Imagem ${i + 1}`}
                  >
                    <img src={cdnImg(url, 200)} alt="" className="w-full h-full object-cover" loading="lazy" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Detalhes */}
          <div className="flex flex-col min-h-0 overflow-y-auto">
            <div className="p-6 md:p-8 flex-1 flex flex-col gap-5">
              {isLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-7 w-2/3" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ) : product ? (
                <>
                  <div>
                    <p className="text-eyebrow mb-2">Visualização rápida</p>
                    <h3 className="font-display text-2xl md:text-3xl text-western-green-deep leading-tight">
                      {product.title}
                    </h3>
                    {parsed?.lead && (
                      <p className="mt-3 text-sm text-western-stone-warm leading-relaxed">
                        {parsed.lead}
                      </p>
                    )}
                  </div>

                  {finishValues.length > 1 && (
                    <div>
                      <p className="font-mono uppercase tracking-[0.18em] text-[11px] text-western-green-deep mb-3">
                        Acabamento
                      </p>
                      <FinishSelector
                        values={finishValues}
                        selected={acabamento}
                        onSelect={setAcabamento}
                      />
                    </div>
                  )}

                  {parsed?.aplicacoes && parsed.aplicacoes.length > 0 && (
                    <div>
                      <p className="font-mono uppercase tracking-[0.18em] text-[11px] text-western-green-deep mb-2">
                        Aplicações
                      </p>
                      <ul className="space-y-1.5">
                        {parsed.aplicacoes.slice(0, 5).map((a, i) => (
                          <li key={i} className="text-sm text-western-stone-warm flex gap-2">
                            <span className="text-western-gold/70 font-mono text-[10px] mt-0.5">·</span>
                            <span>{a}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </>
              ) : (
                <p className="text-sm text-western-stone-warm">Produto indisponível.</p>
              )}
            </div>

            {/* Sticky footer */}
            <div className="border-t border-western-stone-warm/15 bg-western-cream/30 p-5 md:p-6 space-y-3">
              <div className="flex items-baseline justify-between gap-3">
                <p className="text-spec text-western-stone-warm">A partir de</p>
                {selectedVariant ? (
                  <GatedPrice
                    amount={selectedVariant.price.amount}
                    currency={selectedVariant.price.currencyCode}
                    className="font-display text-2xl text-western-green-deep"
                  />
                ) : (
                  <Skeleton className="h-7 w-28" />
                )}
              </div>
              <button
                type="button"
                onClick={handleAdd}
                disabled={cartLoading || !selectedVariant}
                className={`w-full justify-center ${inCart ? "btn-outline-forest" : "btn-gold"} disabled:opacity-60`}
              >
                {cartLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : inCart ? (
                  <>
                    <Check className="h-4 w-4" /> Adicionado · adicionar de novo
                  </>
                ) : (
                  <>
                    <ShoppingBag className="h-4 w-4" /> Adicionar ao orçamento
                  </>
                )}
              </button>
              {product && (
                <Link
                  to={`/produtos/${product.handle}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-western-stone-warm hover:text-western-green-deep transition-colors"
                >
                  Abrir página completa <ExternalLink className="h-3 w-3" />
                </Link>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
