import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Loader2, Lock, Minus, Plus, Unlock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cdnImg, formatBRL } from "@/lib/catalog/client";
import { useAuth } from "@/hooks/useAuth";

interface Props {
  /** Ref do bloco de CTAs primários inline. Quando ele sai da tela, a barra aparece. */
  triggerRef: React.RefObject<HTMLElement>;
  productImage: string | null;
  productTitle: string;
  selectedFinish: string | null;
  priceAmount?: string;
  priceCurrency?: string;
  /** "a partir de R$ 1.890" quando variante não escolhida. */
  fallbackPriceLabel?: string;
  qty: number;
  onQtyChange: (qty: number) => void;
  onAdd: () => void;
  isLoading: boolean;
  canAdd: boolean;
  pendingOptionLabel?: string | null;
  available: boolean;
}

export default function StickyBuyBar({
  triggerRef,
  productImage,
  productTitle,
  selectedFinish,
  priceAmount,
  priceCurrency,
  fallbackPriceLabel,
  qty,
  onQtyChange,
  onAdd,
  isLoading,
  canAdd,
  pendingOptionLabel,
  available,
}: Props) {
  const { isApproved } = useAuth();
  const [visible, setVisible] = useState(false);
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = triggerRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        // Só aparece quando o CTA inline está fora E o usuário rolou para baixo dele.
        const past = entry.boundingClientRect.top < 0;
        setVisible(!entry.isIntersecting && past);
      },
      { threshold: 0, rootMargin: "0px 0px -20% 0px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [triggerRef]);

  // Publica a altura da barra (quando visível) numa CSS var global para que
  // outros FABs (ex.: WhatsApp) se desloquem acima e não colidam.
  useEffect(() => {
    const root = document.documentElement;
    const update = () => {
      const h = visible && barRef.current ? barRef.current.offsetHeight : 0;
      root.style.setProperty("--sticky-buy-bar-h", `${h}px`);
    };
    update();
    const ro = barRef.current ? new ResizeObserver(update) : null;
    if (ro && barRef.current) ro.observe(barRef.current);
    window.addEventListener("resize", update);
    return () => {
      ro?.disconnect();
      window.removeEventListener("resize", update);
      root.style.setProperty("--sticky-buy-bar-h", "0px");
    };
  }, [visible]);

  const priceLabel = priceAmount && priceCurrency
    ? formatBRL(priceAmount, priceCurrency)
    : fallbackPriceLabel ?? "";

  return (
    <div
      ref={barRef}
      role="region"
      aria-label="Barra de compra"
      aria-hidden={!visible}
      className={`fixed inset-x-0 bottom-0 z-40 bg-western-cream/97 backdrop-blur border-t border-western-stone-warm/25 shadow-[0_-8px_24px_-12px_rgba(0,0,0,0.18)] transition-all duration-200 motion-reduce:transition-none ${
        visible
          ? "translate-y-0 opacity-100 pointer-events-auto"
          : "translate-y-full opacity-0 pointer-events-none"
      }`}
    >
      <div className="container-western py-3 md:py-3.5">
        {/* DESKTOP layout */}
        <div className="hidden md:flex items-center gap-5">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            {productImage && (
              <div className="w-11 h-11 flex-shrink-0 bg-western-paper border border-western-stone-warm/15">
                <img
                  src={cdnImg(productImage, 200)}
                  alt=""
                  className="w-full h-full object-contain p-0.5"
                  loading="lazy"
                />
              </div>
            )}
            <div className="min-w-0">
              <p className="font-display text-base text-western-green-deep truncate leading-tight">
                {productTitle}
              </p>
              {selectedFinish && (
                <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-western-stone-warm/80 mt-0.5">
                  {selectedFinish}
                </p>
              )}
            </div>
          </div>

          {isApproved ? (
            <>
              {priceLabel && (
                <span className="font-display text-xl text-western-green-deep flex-shrink-0 tabular-nums">
                  {priceLabel}
                </span>
              )}
              <div className="flex items-center border border-western-stone-warm/30 h-11 flex-shrink-0">
                <button
                  onClick={() => onQtyChange(Math.max(1, qty - 1))}
                  className="h-11 w-10 flex items-center justify-center hover:bg-western-gold/10 transition-colors text-western-green-deep"
                  aria-label="Diminuir"
                >
                  <Minus className="h-3.5 w-3.5" />
                </button>
                <span className="px-3 text-spec min-w-[2ch] text-center tabular-nums">
                  {qty}
                </span>
                <button
                  onClick={() => onQtyChange(qty + 1)}
                  className="h-11 w-10 flex items-center justify-center hover:bg-western-gold/10 transition-colors text-western-green-deep"
                  aria-label="Aumentar"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>
              <Button
                onClick={onAdd}
                disabled={!canAdd || !available || isLoading}
                className="h-11 px-7 bg-western-green-deep text-western-gold hover:bg-western-green-deep/90 border border-western-gold/30 hover:border-western-gold/60 font-mono font-bold text-xs uppercase tracking-[0.25em] rounded-none disabled:opacity-60 flex-shrink-0"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : pendingOptionLabel ? (
                  `Selecione ${pendingOptionLabel}`
                ) : !available ? (
                  "Indisponível"
                ) : (
                  "Adicionar ao pedido"
                )}
              </Button>
            </>
          ) : (
            <>
              <span className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.22em] text-western-stone-warm">
                <Unlock className="h-3 w-3" /> Ver preço de parceiro
              </span>
              <Link
                to="/parceiro/cadastro"
                className="h-11 px-7 inline-flex items-center justify-center bg-western-green-deep text-western-gold hover:bg-western-green-deep/90 border border-western-gold/30 hover:border-western-gold/60 font-mono font-bold text-xs uppercase tracking-[0.25em] flex-shrink-0"
              >
                Ver preço de parceiro
              </Link>
            </>
          )}
        </div>

        {/* MOBILE layout */}
        <div className="md:hidden">
          <div className="flex items-center gap-3 mb-2">
            {productImage && (
              <div className="w-10 h-10 flex-shrink-0 bg-western-paper border border-western-stone-warm/15">
                <img
                  src={cdnImg(productImage, 160)}
                  alt=""
                  className="w-full h-full object-contain p-0.5"
                  loading="lazy"
                />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="font-display text-sm text-western-green-deep truncate leading-tight">
                {productTitle}
              </p>
              {isApproved ? (
                priceLabel && (
                  <p className="font-display text-base text-western-green-deep tabular-nums leading-tight">
                    {priceLabel}
                  </p>
                )
              ) : (
                <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-western-stone-warm flex items-center gap-1 mt-0.5">
                  <Unlock className="h-2.5 w-2.5" /> Ver preço de parceiro
                </p>
              )}
            </div>
            {isApproved && (
              <div className="flex items-center border border-western-stone-warm/30 h-9 flex-shrink-0">
                <button
                  onClick={() => onQtyChange(Math.max(1, qty - 1))}
                  className="h-9 w-8 flex items-center justify-center text-western-green-deep"
                  aria-label="Diminuir"
                >
                  <Minus className="h-3 w-3" />
                </button>
                <span className="px-2 text-xs min-w-[2ch] text-center tabular-nums">
                  {qty}
                </span>
                <button
                  onClick={() => onQtyChange(qty + 1)}
                  className="h-9 w-8 flex items-center justify-center text-western-green-deep"
                  aria-label="Aumentar"
                >
                  <Plus className="h-3 w-3" />
                </button>
              </div>
            )}
          </div>
          {isApproved ? (
            <Button
              onClick={onAdd}
              disabled={!canAdd || !available || isLoading}
              className="w-full h-11 bg-western-green-deep text-western-gold hover:bg-western-green-deep/90 border border-western-gold/30 hover:border-western-gold/60 font-mono font-bold text-[11px] uppercase tracking-[0.25em] rounded-none disabled:opacity-60"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : pendingOptionLabel ? (
                `Selecione ${pendingOptionLabel}`
              ) : !available ? (
                "Indisponível"
              ) : (
                "Adicionar ao pedido"
              )}
            </Button>
          ) : (
            <Link
              to="/parceiro/cadastro"
              className="w-full h-11 inline-flex items-center justify-center bg-western-green-deep text-western-gold hover:bg-western-green-deep/90 border border-western-gold/30 hover:border-western-gold/60 font-mono font-bold text-[11px] uppercase tracking-[0.25em]"
            >
              Ver preço de parceiro
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
