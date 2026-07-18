import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Loader2, Minus, Plus, Unlock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cdnImg, formatBRL } from "@/lib/catalog/client";
import { useAuth } from "@/hooks/useAuth";

interface Props {
  /** Ref no PRÓPRIO botão inline "Adicionar ao pedido". A barra só aparece
   *  quando esse botão sai da viewport para cima — evita dois CTAs iguais. */
  triggerRef: React.RefObject<HTMLElement>;
  productImage: string | null;
  productTitle: string;
  selectedFinish: string | null;
  priceAmount?: string;
  priceCurrency?: string;
  fallbackPriceLabel?: string;
  qty: number;
  onQtyChange: (qty: number) => void;
  onAdd: () => void;
  isLoading: boolean;
  canAdd: boolean;
  pendingOptionLabel?: string | null;
  available: boolean;
}

export default function StickyBuyBarLab({
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
  const orcamentoTo = "/para-sua-casa";
  const [visible, setVisible] = useState(false);
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = triggerRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        // Só aparece quando o botão inline saiu da tela ROLANDO PRA CIMA.
        setVisible(!entry.isIntersecting && entry.boundingClientRect.top < 0);
      },
      { threshold: 0, rootMargin: "0px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [triggerRef]);

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
      /* Fundo SÓLIDO: o creme a 97% deixava o rodapé verde escuro atravessar e
         o texto (escuro) ficava ilegível sobre ele. */
      className={`fixed inset-x-0 bottom-0 z-40 bg-western-ivory border-t border-western-border-soft shadow-[0_-4px_20px_rgba(23,32,24,0.10)] transition-all duration-200 motion-reduce:transition-none ${
        visible
          ? "translate-y-0 opacity-100 pointer-events-auto"
          : "translate-y-full opacity-0 pointer-events-none"
      }`}
    >
      <div className="container-western py-3 md:py-3.5">
        {/* DESKTOP */}
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
              <p className="font-sans text-[16px] font-semibold text-western-green-deep truncate leading-tight">
                {productTitle}
              </p>
              {selectedFinish && (
                <p className="text-meta mt-0.5">{selectedFinish}</p>
              )}
            </div>
          </div>

          {isApproved ? (
            <>
              {priceLabel && (
                <span className="font-sans text-[18px] font-bold text-western-green-deep flex-shrink-0 tabular-nums">
                  {priceLabel}
                </span>
              )}
              <div className="flex items-center rounded-lg border border-western-border-strong h-control flex-shrink-0 overflow-hidden">
                <button
                  onClick={() => onQtyChange(Math.max(1, qty - 1))}
                  className="h-control w-12 flex items-center justify-center hover:bg-western-paper transition-colors text-western-green-deep"
                  aria-label="Diminuir"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="px-3 font-sans text-[15px] font-semibold min-w-[2ch] text-center tabular-nums text-western-green-deep">
                  {qty}
                </span>
                <button
                  onClick={() => onQtyChange(qty + 1)}
                  className="h-control w-12 flex items-center justify-center hover:bg-western-paper transition-colors text-western-green-deep"
                  aria-label="Aumentar"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              {/* CTA primário = VERDE (V3). Fundo da barra é claro, então o verde tem contraste. */}
              <Button
                onClick={onAdd}
                disabled={!canAdd || !available || isLoading}
                className="flex-shrink-0 px-8"
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : pendingOptionLabel ? (
                  `Selecione ${pendingOptionLabel}`
                ) : !available ? (
                  "Indisponível"
                ) : (
                  "Adicionar ao orçamento"
                )}
              </Button>
            </>
          ) : (
            <>
              {/* Visitante: a ação primária é virar parceiro (é o que libera o preço). */}
              <Link to="/parceiro/cadastro" className="btn-primary flex-shrink-0">
                <Unlock className="h-5 w-5" /> Ver preço de parceiro
              </Link>
              <Link
                to={orcamentoTo}
                className="btn-outline-forest flex-shrink-0"
              >
                Peça um orçamento
              </Link>
            </>
          )}
        </div>

        {/* MOBILE */}
        <div className="md:hidden">
          <div className="flex items-center gap-3 mb-2.5">
            {productImage && (
              <div className="w-11 h-11 flex-shrink-0 rounded-sm overflow-hidden bg-western-paper border border-western-border-soft">
                <img
                  src={cdnImg(productImage, 160)}
                  alt=""
                  className="w-full h-full object-contain p-0.5"
                  loading="lazy"
                />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="font-sans text-[15px] font-semibold text-western-green-deep truncate leading-tight">
                {productTitle}
              </p>
              {isApproved && priceLabel && (
                <p className="font-sans text-[16px] font-bold text-western-green-deep tabular-nums leading-tight mt-0.5">
                  {priceLabel}
                </p>
              )}
            </div>
            {isApproved && (
              <div className="flex items-center rounded-lg border border-western-border-strong h-12 flex-shrink-0 overflow-hidden">
                <button
                  onClick={() => onQtyChange(Math.max(1, qty - 1))}
                  className="h-12 w-11 flex items-center justify-center text-western-green-deep"
                  aria-label="Diminuir"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="px-1.5 font-sans text-[15px] font-semibold min-w-[2ch] text-center tabular-nums text-western-green-deep">
                  {qty}
                </span>
                <button
                  onClick={() => onQtyChange(qty + 1)}
                  className="h-12 w-11 flex items-center justify-center text-western-green-deep"
                  aria-label="Aumentar"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
          {isApproved ? (
            <Button
              onClick={onAdd}
              disabled={!canAdd || !available || isLoading}
              className="w-full"
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : pendingOptionLabel ? (
                `Selecione ${pendingOptionLabel}`
              ) : !available ? (
                "Indisponível"
              ) : (
                "Adicionar ao orçamento"
              )}
            </Button>
          ) : (
            /* Visitante: uma decisão por vez — virar parceiro é o que libera o preço. */
            <div className="flex flex-col gap-2">
              <Link to="/parceiro/cadastro" className="btn-primary w-full">
                <Unlock className="h-5 w-5" /> Ver preço de parceiro
              </Link>
              <Link to={orcamentoTo} className="btn-outline-forest w-full">
                Peça um orçamento
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
