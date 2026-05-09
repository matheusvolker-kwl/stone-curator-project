import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronUp, ShoppingBag, Truck, Sparkles } from "lucide-react";
import { useCartStore } from "@/stores/cartStore";
import { cdnImg, formatBRL } from "@/lib/shopify/client";
import GatedPrice from "@/components/shared/GatedPrice";
import { useAuth } from "@/hooks/useAuth";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

interface Props {
  /** Texto que descreve a etapa atual no painel (ex: "Etapa 06 · Complementos"). */
  stepLabel: string;
}

function useTotals() {
  const items = useCartStore((s) => s.items);
  const total = items.reduce(
    (acc, i) => acc + parseFloat(i.price.amount) * i.quantity,
    0
  );
  const totalQty = items.reduce((acc, i) => acc + i.quantity, 0);
  return { items, total, totalQty };
}

function ItemRow({ item }: { item: ReturnType<typeof useCartStore.getState>["items"][number] }) {
  return (
    <motion.li
      layout
      initial={{ opacity: 0, x: 24, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 24, scale: 0.9 }}
      transition={{ type: "spring", stiffness: 320, damping: 28 }}
      className="flex gap-3 items-center"
    >
      <div className="relative h-12 w-12 bg-western-cream/50 shrink-0 overflow-hidden border border-western-stone-warm/15">
        {item.productImage ? (
          <img
            src={cdnImg(item.productImage, 160)}
            alt={item.productTitle}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-western-green-deep" />
        )}
        {item.quantity > 1 && (
          <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-western-gold text-western-green-deep font-mono text-[10px] flex items-center justify-center">
            {item.quantity}
          </span>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-display text-sm text-western-green-deep leading-tight truncate">
          {item.productTitle}
        </p>
        <GatedPrice
          amount={parseFloat(item.price.amount) * item.quantity}
          currency={item.price.currencyCode}
          variant="badge"
          className="font-mono text-[10px] uppercase tracking-[0.18em] text-western-stone-warm/80"
        />
      </div>
    </motion.li>
  );
}

function TotalDisplay({ total, totalQty }: { total: number; totalQty: number }) {
  const { isApproved } = useAuth();
  const prevTotal = useRef(total);
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    if (total !== prevTotal.current) {
      setPulse(true);
      const t = setTimeout(() => setPulse(false), 600);
      prevTotal.current = total;
      return () => clearTimeout(t);
    }
  }, [total]);

  return (
    <div>
      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-western-stone-warm">
        {isApproved ? "Orçamento parcial" : "Itens no projeto"} · {totalQty} {totalQty === 1 ? "item" : "itens"}
      </p>
      {isApproved ? (
        <motion.p
          animate={pulse ? { scale: [1, 1.06, 1], color: ["#1f3a26", "#b8924f", "#1f3a26"] } : {}}
          transition={{ duration: 0.6 }}
          className="font-display text-2xl text-western-green-deep leading-tight"
        >
          {formatBRL(total, "BRL")}
        </motion.p>
      ) : (
        <GatedPrice amount={total} variant="block" className="font-display text-2xl text-western-green-deep leading-tight" />
      )}
    </div>
  );
}

function PanelInner({ stepLabel }: { stepLabel: string }) {
  const { items, total, totalQty } = useTotals();
  const openCart = () => window.dispatchEvent(new CustomEvent("western:open-cart"));

  // C7: auto-scroll do painel para o último item adicionado
  const listRef = useRef<HTMLUListElement>(null);
  const prevCount = useRef(items.length);
  useEffect(() => {
    if (items.length > prevCount.current && listRef.current) {
      const last = listRef.current.lastElementChild as HTMLElement | null;
      last?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
    prevCount.current = items.length;
  }, [items.length]);

  return (
    <div className="flex flex-col h-full">
      <div className="px-5 py-4 border-b border-western-stone-warm/15">
        <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-western-gold mb-1">
          {stepLabel}
        </p>
        <p className="font-display text-base text-western-green-deep leading-tight">
          Seu projeto, em tempo real
        </p>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4">
        {items.length === 0 ? (
          <div className="text-center py-10">
            <Sparkles className="h-5 w-5 text-western-gold/60 mx-auto mb-3" />
            <p className="text-sm text-western-stone-warm leading-relaxed">
              Conforme você adicionar peças, o projeto se monta aqui.
            </p>
          </div>
        ) : (
          <ul ref={listRef} className="space-y-3">
            <AnimatePresence initial={false}>
              {items.map((i) => (
                <ItemRow key={i.variantId} item={i} />
              ))}
            </AnimatePresence>
          </ul>
        )}

        {totalQty >= 2 && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-5 flex items-start gap-2 p-3 bg-western-cream/60 border border-western-gold/30"
          >
            <Truck className="h-3.5 w-3.5 text-western-gold mt-0.5 shrink-0" />
            <p className="text-xs text-western-stone-warm leading-relaxed">
              Pedido único · frete otimizado pelas peças combinadas.
            </p>
          </motion.div>
        )}
      </div>

      <div className="border-t border-western-stone-warm/15 px-5 py-4 space-y-3">
        <TotalDisplay total={total} totalQty={totalQty} />
        <button
          type="button"
          onClick={openCart}
          disabled={items.length === 0}
          className="btn-gold w-full justify-center disabled:opacity-50"
        >
          <ShoppingBag className="h-4 w-4" /> Ver orçamento completo
        </button>
      </div>
    </div>
  );
}

export default function GuideAssemblySummary({ stepLabel }: Props) {
  const { items, total, totalQty } = useTotals();
  const [sheetOpen, setSheetOpen] = useState(false);

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        aria-label="Resumo do projeto em tempo real"
        aria-live="polite"
        className="hidden xl:block sticky top-24 self-start w-[320px] bg-white border border-western-stone-warm/20 max-h-[calc(100vh-8rem)]"
      >
        <PanelInner stepLabel={stepLabel} />
      </aside>

      {/* Mobile bottom bar */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetTrigger asChild>
          <button
            type="button"
            aria-label="Abrir resumo do projeto"
            className="xl:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-western-stone-warm/20 px-4 py-3 flex items-center justify-between gap-3 shadow-[0_-8px_24px_-12px_rgba(15,40,24,0.18)]"
          >
            <div className="flex items-center gap-3 min-w-0">
              {items.length > 0 ? (
                <div className="flex -space-x-2">
                  {items.slice(0, 3).map((i) => (
                    <div
                      key={i.variantId}
                      className="h-9 w-9 bg-western-cream border border-white overflow-hidden"
                    >
                      {i.productImage && (
                        <img
                          src={cdnImg(i.productImage, 120)}
                          alt=""
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      )}
                    </div>
                  ))}
                  {items.length > 3 && (
                    <div className="h-9 w-9 bg-western-green-deep text-western-cream flex items-center justify-center font-mono text-[10px] border border-white">
                      +{items.length - 3}
                    </div>
                  )}
                </div>
              ) : (
                <ShoppingBag className="h-5 w-5 text-western-stone-warm" />
              )}
              <div className="text-left min-w-0">
                <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-western-stone-warm">
                  {totalQty} {totalQty === 1 ? "item" : "itens"} no projeto
                </p>
                <p className="font-display text-base text-western-green-deep leading-tight truncate">
                  {formatBRL(total, "BRL")}
                </p>
              </div>
            </div>
            <ChevronUp className="h-4 w-4 text-western-stone-warm shrink-0" />
          </button>
        </SheetTrigger>
        <SheetContent side="bottom" className="p-0 max-h-[80vh] flex flex-col">
          <SheetHeader className="sr-only">
            <SheetTitle>Resumo do projeto</SheetTitle>
          </SheetHeader>
          <PanelInner stepLabel={stepLabel} />
        </SheetContent>
      </Sheet>
    </>
  );
}
