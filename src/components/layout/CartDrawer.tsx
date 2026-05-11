import { Sheet, SheetContent, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/stores/cartStore";
import { formatBRL } from "@/lib/shopify/client";
import { Minus, Plus, X, ExternalLink, Loader2, MessageCircle, Lock, ArrowLeft, ShieldCheck, Clock, Download } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { BUSINESS } from "@/config/business";
import { useAuth } from "@/hooks/useAuth";
import CartCrossSell from "@/components/cart/CartCrossSell";
import QuoteRequestModal from "@/components/cart/QuoteRequestModal";
import EmptyCartHints from "@/components/cart/EmptyCartHints";
import FreeShippingProgress from "@/components/cart/FreeShippingProgress";
import CalcFrete from "@/components/cart/CalcFrete";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { registerPedidoNovoLead } from "@/lib/leads/pedidoNovo";

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
  // (auth context obtained below)
  const [quoteOpen, setQuoteOpen] = useState(false);
  const totalQty = items.reduce((s, i) => s + i.quantity, 0);
  const subtotal = items.reduce((s, i) => s + parseFloat(i.price.amount) * i.quantity, 0);
  const currency = items[0]?.price.currencyCode ?? "BRL";
  const meetsMinimum = subtotal >= MIN_ORDER;
  const distinctFinishes = new Set(
    items.flatMap((i) =>
      i.selectedOptions
        .filter((o) => /acabamento|finish/i.test(o.name))
        .map((o) => o.value)
    )
  ).size;
  const savedToastShownRef = useRef(false);

  useEffect(() => {
    if (open) syncCart();
  }, [open, syncCart]);

  // "Sua composição foi salva" — uma vez por sessão, 5s após mudança com itens.
  useEffect(() => {
    if (items.length === 0 || savedToastShownRef.current) return;
    const t = window.setTimeout(() => {
      if (savedToastShownRef.current) return;
      savedToastShownRef.current = true;
      toast.success("Sua composição foi salva", {
        description: "Você pode voltar mais tarde — ela continua aqui.",
        position: "bottom-right",
        duration: 4000,
      });
    }, 5000);
    return () => window.clearTimeout(t);
  }, [items.length]);

  const { user, isApproved, empresa } = useAuth();
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const handleCheckout = async () => {
    // Validação cliente do pedido mínimo
    if (subtotal < MIN_ORDER) {
      toast.error("Pedido mínimo R$ 2.000", {
        description: `Faltam ${formatBRL(MIN_ORDER - subtotal)} para finalizar.`,
      });
      return;
    }
    // Garantir SKU em todos os itens (necessário para Yampi)
    const semSku = items.filter((i) => !i.sku);
    if (semSku.length > 0) {
      toast.error("Erro ao iniciar checkout", {
        description: "Itens sem SKU. Por favor, fale conosco no WhatsApp.",
      });
      return;
    }

    setCheckoutLoading(true);

    // Fire-and-forget: registra lead de venda direta antes de abrir checkout externo
    void (async () => {
      let profile: { nome?: string; telefone?: string; cidade?: string; empresa?: string } | null = null;
      if (user) {
        const { data } = await supabase
          .from("partner_profiles")
          .select("nome, telefone, cidade, empresa")
          .eq("user_id", user.id)
          .maybeSingle();
        profile = data ?? null;
      }
      await registerPedidoNovoLead({
        items,
        subtotal,
        currency,
        userId: user?.id ?? null,
        origem: "cart_checkout_yampi",
        contact: {
          nome: profile?.nome ?? null,
          email: user?.email ?? null,
          telefone: profile?.telefone ?? null,
          empresa: profile?.empresa ?? empresa ?? null,
          cidade: profile?.cidade ?? null,
        },
      });
    })();

    try {
      const { data, error } = await supabase.functions.invoke("criar-carrinho-yampi", {
        body: {
          items: items.map((i) => ({
            sku: i.sku,
            quantidade: i.quantity,
            valor_unitario: parseFloat(i.price.amount),
          })),
          utm_source: "site_lovable",
          utm_medium: "carrinho",
        },
      });
      if (error) throw error;
      const url = (data as { checkout_url?: string } | null)?.checkout_url;
      if (!url) {
        throw new Error("checkout_url ausente");
      }
      window.location.href = url;
    } catch (e) {
      console.error("yampi_checkout", e);
      toast.error("Erro ao iniciar checkout", {
        description: "Por favor, tente novamente ou fale conosco no WhatsApp.",
      });
    } finally {
      setCheckoutLoading(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-lg flex flex-col p-0 bg-western-green-mid border-l border-western-gold/20 text-western-cream"
      >
        <div className="px-5 md:px-8 pt-6 md:pt-8 pb-5 md:pb-6 border-b border-western-gold/15 space-y-3">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.22em] text-western-cream-muted hover:text-western-gold-soft transition-colors -ml-1"
          >
            <ArrowLeft className="h-3 w-3" /> Continuar comprando
          </button>
          <div>
            <p className="text-eyebrow">Seu orçamento</p>
            <SheetTitle className="font-display text-2xl md:text-3xl tracking-wide text-western-cream">
              Composição atual
            </SheetTitle>
            <SheetDescription className="text-western-cream-muted">
              {totalQty === 0
                ? "Nenhuma peça selecionada."
                : `${totalQty} ${totalQty === 1 ? "peça" : "peças"}${
                    distinctFinishes > 1 ? ` · ${distinctFinishes} acabamentos` : ""
                  }`}
            </SheetDescription>
          </div>
          {items.length > 0 && isApproved && (
            <FreeShippingProgress subtotal={subtotal} minimum={MIN_ORDER} />
          )}
        </div>

        <div className="flex-1 overflow-y-auto px-5 md:px-8 py-6">
          {items.length === 0 ? (
            <div className="space-y-6">
              <div className="text-center py-6">
                <p className="text-western-cream-muted max-w-xs mx-auto leading-relaxed">
                  Quando você adicionar uma peça, ela aparece aqui.
                </p>
              </div>
              <EmptyCartHints onNavigate={() => onOpenChange(false)} />
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

          {items.length > 0 && isApproved && (
            <div className="mt-8">
              <CalcFrete items={items} />
            </div>
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

            <div className="flex items-center justify-between gap-3 py-2 border-y border-western-gold/10">
              <div className="flex items-center gap-2 text-western-cream-muted">
                <Clock className="h-3.5 w-3.5 text-western-gold-soft" />
                <span className="font-mono text-[10px] uppercase tracking-[0.22em]">
                  Produção 15 dias
                </span>
              </div>
              <div className="flex items-center gap-2 text-western-cream-muted">
                <ShieldCheck className="h-3.5 w-3.5 text-western-gold-soft" />
                <span className="font-mono text-[10px] uppercase tracking-[0.22em]">
                  +30 anos no atelier
                </span>
              </div>
            </div>

            {/* CTA primário: Finalizar compra (aprovado) ou Baixar composição (não aprovado) */}
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
                    Finalizar compra <ExternalLink className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>
            ) : (
              <Button
                onClick={() => setQuoteOpen(true)}
                className="w-full h-14 bg-western-gold text-western-green-deep hover:bg-western-gold/90 font-mono text-xs uppercase tracking-[0.25em] rounded-none shadow-[0_18px_40px_-20px_rgba(184,146,79,0.6)]"
              >
                <Download className="h-4 w-4 mr-2" /> Baixar composição (PDF)
              </Button>
            )}

            {/* CTA secundário: Baixar composição (quando aprovado) */}
            {isApproved && (
              <button
                type="button"
                onClick={() => setQuoteOpen(true)}
                className="w-full h-11 border border-western-gold/40 text-western-cream hover:border-western-gold font-mono text-[11px] uppercase tracking-[0.22em] inline-flex items-center justify-center gap-2 transition-colors"
              >
                <Download className="h-3.5 w-3.5" /> Baixar composição (PDF)
              </button>
            )}

            {/* PDF apenas após formulário (Solicitar orçamento) */}

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
