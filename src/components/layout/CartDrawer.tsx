import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/stores/cartStore";
import { formatBRL } from "@/lib/shopify/client";
import { Minus, Plus, X, ExternalLink, Loader2, MessageCircle, Lock, FileDown } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { BUSINESS } from "@/config/business";
import { useAuth } from "@/hooks/useAuth";
import CartCrossSell from "@/components/cart/CartCrossSell";
import QuoteRequestModal from "@/components/cart/QuoteRequestModal";
import { downloadOrcamentoPdf } from "@/lib/pdf/orcamentoPdf";

const MIN_ORDER = BUSINESS.pedidoMinimoBRL;

export default function CartDrawer({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { items, isLoading, isSyncing, updateQuantity, removeItem, getCheckoutUrl, syncCart } =
    useCartStore();
  const { isApproved } = useAuth();
  const [quoteOpen, setQuoteOpen] = useState(false);
  const totalQty = items.reduce((s, i) => s + i.quantity, 0);
  const subtotal = items.reduce((s, i) => s + parseFloat(i.price.amount) * i.quantity, 0);
  const currency = items[0]?.price.currencyCode ?? "BRL";
  const meetsMinimum = subtotal >= MIN_ORDER;
  const progress = Math.min(100, (subtotal / MIN_ORDER) * 100);

  useEffect(() => {
    if (open) syncCart();
  }, [open, syncCart]);

  const handleCheckout = () => {
    const url = getCheckoutUrl();
    if (url) {
      window.open(url, "_blank");
      onOpenChange(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-lg flex flex-col p-0 bg-western-green-mid border-l border-western-gold/20 text-western-cream"
      >
        <SheetHeader className="px-5 md:px-8 pt-8 md:pt-10 pb-5 md:pb-6 border-b border-western-gold/15">
          <p className="text-eyebrow">Seu orçamento</p>
          <SheetTitle className="font-display text-2xl md:text-3xl tracking-wide text-western-cream">
            Composição atual
          </SheetTitle>
          <SheetDescription className="text-western-cream-muted">
            {totalQty === 0
              ? "Nenhuma peça selecionada."
              : `${totalQty} ${totalQty === 1 ? "peça" : "peças"} no orçamento.`}
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-5 md:px-8 py-6">
          {items.length === 0 ? (
            <div className="h-full flex items-center justify-center text-center">
              <p className="text-western-cream-muted max-w-xs leading-relaxed">
                Quando você adicionar uma peça, ela aparece aqui.
              </p>
            </div>
          ) : (
            <ul className="space-y-6">
              {items.map((item) => (
                <li key={item.variantId} className="relative flex gap-3 md:gap-4 pr-7">
                  <div className="frame-gallery w-16 h-16 md:w-20 md:h-20 flex-shrink-0">
                    {item.productImage && (
                      <img
                        src={item.productImage}
                        alt={item.productTitle}
                        className="w-full h-full object-contain p-1"
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col gap-1">
                    <h4 className="font-display text-base md:text-lg leading-tight">
                      {item.productTitle}
                    </h4>
                    <p className="text-spec text-western-cream-muted text-xs">
                      {item.selectedOptions.map((o) => o.value).join(" · ")}
                    </p>
                    <div className="flex items-center justify-between mt-2 gap-3 flex-wrap">
                      <p className="text-spec">
                        {isApproved ? formatBRL(item.price.amount, item.price.currencyCode) : "—"}
                      </p>
                      <div className="flex items-center border border-western-gold/30">
                        <button
                          onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                          className="h-9 w-9 flex items-center justify-center hover:bg-western-gold/10 transition-colors"
                          aria-label="Diminuir"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="px-3 text-spec min-w-[2ch] text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                          className="h-9 w-9 flex items-center justify-center hover:bg-western-gold/10 transition-colors"
                          aria-label="Aumentar"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => removeItem(item.variantId)}
                    className="absolute top-0 right-0 p-1.5 -m-1.5 text-western-cream-muted hover:text-western-gold-soft transition-colors"
                    aria-label="Remover peça"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}

          {items.length > 0 && (
            <div className="mt-8 -mx-5 md:-mx-8">
              <CartCrossSell
                collectionHandle={undefined}
                excludeHandles={items.map((i) => i.productHandle)}
                onNavigate={() => onOpenChange(false)}
              />
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div className="px-5 md:px-8 py-6 border-t border-western-gold/15 space-y-4">
            {isApproved && (
              <div>
                <div className="flex justify-between text-spec mb-2">
                  <span className="text-western-cream-muted">Pedido mínimo {formatBRL(MIN_ORDER)}</span>
                  <span className={meetsMinimum ? "text-western-gold-soft" : "text-western-cream-muted"}>
                    {Math.round(progress)}%
                  </span>
                </div>
                <div className="h-px bg-western-gold/20 relative overflow-hidden">
                  <div
                    className="h-full bg-western-gold transition-all duration-700"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}

            <div className="flex justify-between items-baseline">
              <span className="text-eyebrow">Subtotal</span>
              <span className="font-display text-2xl">
                {isApproved ? formatBRL(subtotal, currency) : "—"}
              </span>
            </div>

            {!isApproved && (
              <div className="flex items-start gap-3 p-3 border border-western-gold/30 bg-western-gold/5">
                <Lock className="h-3.5 w-3.5 text-western-gold-soft mt-0.5 flex-shrink-0" />
                <p className="text-spec text-western-cream-muted leading-relaxed text-xs">
                  Preços B2B liberados após aprovação do cadastro. Você pode solicitar orçamento agora mesmo.
                </p>
              </div>
            )}

            <p className="text-spec text-western-cream-muted leading-relaxed">
              Produção em 15 dias úteis após confirmação do pedido.
            </p>

            {/* CTA primário: Pagar online (aprovado) ou Solicitar orçamento (não aprovado) */}
            {isApproved ? (
              <Button
                onClick={handleCheckout}
                disabled={isLoading || isSyncing || !meetsMinimum}
                className="w-full h-14 bg-western-gold text-western-green-deep hover:bg-western-gold/90 font-mono text-xs uppercase tracking-[0.25em] rounded-none shadow-[0_18px_40px_-20px_rgba(184,146,79,0.6)] disabled:opacity-50"
              >
                {isLoading || isSyncing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    Pagar online <ExternalLink className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>
            ) : (
              <Button
                onClick={() => setQuoteOpen(true)}
                className="w-full h-14 bg-western-gold text-western-green-deep hover:bg-western-gold/90 font-mono text-xs uppercase tracking-[0.25em] rounded-none shadow-[0_18px_40px_-20px_rgba(184,146,79,0.6)]"
              >
                <MessageCircle className="h-4 w-4 mr-2" /> Solicitar orçamento
              </Button>
            )}

            {/* CTA secundário: Solicitar orçamento (quando aprovado) */}
            {isApproved && (
              <button
                type="button"
                onClick={() => setQuoteOpen(true)}
                className="w-full h-11 border border-western-gold/40 text-western-cream hover:border-western-gold font-mono text-[11px] uppercase tracking-[0.22em] inline-flex items-center justify-center gap-2 transition-colors"
              >
                <MessageCircle className="h-3.5 w-3.5" /> Solicitar orçamento
              </button>
            )}

            {/* Tertiary: PDF download */}
            <button
              type="button"
              onClick={() =>
                downloadOrcamentoPdf({
                  items,
                  subtotal,
                  currency,
                  showPrices: isApproved,
                })
              }
              className="w-full inline-flex items-center justify-center gap-2 text-western-cream-muted hover:text-western-gold-soft font-mono text-[10px] uppercase tracking-[0.22em] py-2 transition-colors"
            >
              <FileDown className="h-3.5 w-3.5" /> Baixar PDF da composição
            </button>

            {!isApproved && (
              <Link
                to="/parceiro/login"
                onClick={() => onOpenChange(false)}
                className="block text-center text-western-cream-muted hover:text-western-gold-soft font-mono text-[10px] uppercase tracking-[0.22em] pt-1 transition-colors"
              >
                Já é parceiro? Entre para ver preços
              </Link>
            )}

            {isApproved && !meetsMinimum && (
              <p className="text-spec text-western-cream-muted text-center">
                Faltam {formatBRL(MIN_ORDER - subtotal)} para checkout. Você pode solicitar orçamento sem mínimo.
              </p>
            )}
          </div>
        )}
      </SheetContent>
      <QuoteRequestModal open={quoteOpen} onOpenChange={setQuoteOpen} />
    </Sheet>
  );
}
