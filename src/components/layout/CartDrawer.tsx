import { Sheet, SheetContent, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/stores/cartStore";
import { formatBRL, cdnImg } from "@/lib/catalog/client";
import {
  Minus,
  Plus,
  Trash2,
  Loader2,
  MessageCircle,
  Lock,
  ArrowLeft,
  ArrowRight,
  Download,
  Truck,
  ShieldCheck,
  FileText,
} from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { BUSINESS } from "@/config/business";
import { useAuth } from "@/hooks/useAuth";
import CartCrossSell from "@/components/cart/CartCrossSell";
import QuoteRequestModal from "@/components/cart/QuoteRequestModal";
import EmptyCartHints from "@/components/cart/EmptyCartHints";


import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { registerPedidoNovoLead } from "@/lib/leads/pedidoNovo";




export default function CartDrawer({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { items, isLoading, updateQuantity, removeItem } = useCartStore();
  // (auth context obtained below)
  const [quoteOpen, setQuoteOpen] = useState(false);
  const totalQty = items.reduce((s, i) => s + i.quantity, 0);
  const subtotal = items.reduce((s, i) => s + parseFloat(i.price.amount) * i.quantity, 0);
  const currency = items[0]?.price.currencyCode ?? "BRL";


  const { user, isApproved, empresa } = useAuth();
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  // Pedido mínimo B2B — informativo (progresso no orçamento), nunca bloqueia o
  // checkout: a Western Box é vendida sem mínimo e sem cadastro.
  const minOrder = BUSINESS.pedidoMinimoBRL;
  const belowMin = isApproved && subtotal > 0 && subtotal < minOrder;
  const minPct = Math.min(100, Math.round((subtotal / minOrder) * 100));

  const handleCheckout = async () => {
    if (checkoutLoading) return;
    setCheckoutLoading(true);

    // Fire-and-forget: registra lead antes do redirect
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
        origem: "cart_checkout",
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
      // Se parceiro aprovado, solicita um TICKET OPACO ao backend.
      // O ticket é apenas uma string aleatória; o payload PJ nunca trafega
      // pelo browser — o mu-plugin do Woo troca o ticket server-to-server.
      let ticket: string | null = null;
      if (isApproved && user) {
        try {
          const { data, error } = await supabase.functions.invoke("checkout-ticket-create", {
            method: "POST",
          });
          if (error) console.warn("[checkout-ticket-create] failed", error);
          else if (typeof data?.ticket === "string" && data.ticket.length >= 16) {
            ticket = data.ticket;
          }
        } catch (e) {
          // Segue como visitante em caso de falha — não bloqueia o checkout.
          console.warn("[checkout-ticket-create] exception", e);
        }
      }

      // Hand-off top-level (form POST) → cookies first-party no domínio do Woo.
      const { submitCheckoutHandoff } = await import("@/lib/woo-checkout");
      const result = submitCheckoutHandoff(items, ticket);

      if (result.submitted === 0) {
        toast.error("Não foi possível abrir o checkout", {
          description: "Atualize a página e tente novamente, ou fale conosco no WhatsApp.",
        });
        return;
      }
      if (result.skipped > 0) {
        console.warn("[checkout] skipped lines", result.skipped);
        toast.warning("Alguns itens não puderam ser enviados ao checkout", {
          description: `${result.skipped} ${result.skipped === 1 ? "item ficou" : "itens ficaram"} de fora. Revise sua composição ou fale no WhatsApp.`,
          duration: 8000,
        });
      }
      onOpenChange(false);
      // navegação top-level já foi disparada por form.submit().
    } catch (e) {
      console.error(e);
      toast.error("Instabilidade no checkout", {
        description: "Tente novamente em alguns minutos ou fale conosco no WhatsApp.",
      });
    } finally {
      setCheckoutLoading(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-lg h-[100dvh] flex flex-col min-h-0 p-0 surface-ivory border-l border-western-border-soft"
      >
        {/* Cabeçalho — claro e quente (tela de compra). */}
        <div className="px-5 md:px-8 pt-5 md:pt-6 pb-4 surface-paper border-b border-western-border-soft">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="tap-target inline-flex items-center gap-2 -ml-1 font-sans text-[16px] font-semibold text-western-green-deep hover:text-western-cta transition-colors"
          >
            <ArrowLeft className="h-5 w-5" /> Continuar comprando
          </button>
          <div className="mt-1">
            <p className="text-eyebrow">Seu orçamento</p>
            <SheetTitle className="display-md text-western-green-deep mt-1.5">
              Composição atual
            </SheetTitle>
            <SheetDescription className="text-meta mt-1.5">
              {totalQty === 0
                ? "Nenhuma peça selecionada."
                : `${totalQty} ${totalQty === 1 ? "peça" : "peças"} · garantia de ${BUSINESS.garantiaLabel} e reposição garantida`}
            </SheetDescription>
          </div>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-5 md:px-8 py-6">
          {items.length === 0 ? (
            <div className="space-y-6">
              <div className="text-center py-6">
                <p className="text-body max-w-xs mx-auto">
                  Quando você adicionar uma peça, ela aparece aqui.
                </p>
              </div>
              <EmptyCartHints onNavigate={() => onOpenChange(false)} />
            </div>
          ) : (
            <ul>
              {items.map((item, idx) => (
                <li
                  key={item.variantId}
                  className={`flex gap-4 py-5 ${
                    idx === items.length - 1 ? "" : "border-b border-western-border-soft"
                  }`}
                >
                  <div className="w-[84px] h-[84px] flex-shrink-0 overflow-hidden rounded-[10px] bg-western-paper border border-western-border-soft">
                    {item.productImage && (
                      <img
                        src={cdnImg(item.productImage, 200)}
                        alt={item.productTitle}
                        className="w-full h-full object-contain p-1.5"
                      />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h4 className="font-sans text-[17px] font-semibold leading-snug text-western-green-deep">
                          {item.productTitle}
                        </h4>
                        {item.selectedOptions.length > 0 && (
                          <p className="font-sans text-[15px] text-western-stone-warm mt-0.5">
                            {item.selectedOptions.map((o) => o.value).join(" · ")}
                          </p>
                        )}
                      </div>

                      <div className="text-right flex-shrink-0">
                        {isApproved ? (
                          <>
                            <p className="font-sans text-[18px] font-bold tabular-nums text-western-green-deep leading-tight">
                              {formatBRL(
                                parseFloat(item.price.amount) * item.quantity,
                                item.price.currencyCode,
                              )}
                            </p>
                            {item.quantity > 1 && (
                              <p className="font-sans text-[14px] text-western-stone-warm mt-0.5">
                                {formatBRL(item.price.amount, item.price.currencyCode)} / peça
                              </p>
                            )}
                          </>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 font-sans text-[15px] font-semibold text-western-bronze">
                            <Lock className="h-4 w-4" /> Parceiro
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-4 mt-3 flex-wrap">
                      <div className="inline-flex items-center rounded-[10px] border border-western-border-strong bg-white overflow-hidden">
                        <button
                          onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                          className="h-12 w-12 flex items-center justify-center text-western-green-deep hover:bg-western-paper transition-colors"
                          aria-label="Diminuir quantidade"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="px-2 font-sans text-[16px] font-semibold min-w-[2.5ch] text-center tabular-nums text-western-green-deep">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                          className="h-12 w-12 flex items-center justify-center text-western-green-deep hover:bg-western-paper transition-colors"
                          aria-label="Aumentar quantidade"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>

                      <button
                        onClick={() => removeItem(item.variantId)}
                        className="tap-target inline-flex items-center gap-2 px-1 font-sans text-[15px] font-semibold text-[#B3372E] hover:underline"
                        aria-label={`Remover ${item.productTitle}`}
                      >
                        <Trash2 className="h-4 w-4" /> Remover
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}

          {items.length > 0 && (
            <a
              href={`https://wa.me/${BUSINESS.whatsappFabrica}`}
              target="_blank"
              rel="noopener noreferrer"
              className="tap-target inline-flex items-center gap-2 mt-4 font-sans text-[16px] font-semibold text-western-green-deep hover:text-western-cta transition-colors"
            >
              <MessageCircle className="h-5 w-5 text-western-bronze" /> Dúvidas? Falar com o ateliê
            </a>
          )}

          {items.length > 0 && (() => {
            const soAvulsos = items.every((i) => i.wooKind !== "bundle" && !i.conjuntoRef);
            const crossHandle = soAvulsos ? "conjuntos" : (items[0]?.collectionHandle ?? "conjuntos");
            return (
              <div className="mt-8 -mx-5 md:-mx-8">
                <CartCrossSell
                  collectionHandle={crossHandle}
                  excludeHandles={items.map((i) => i.productHandle)}
                  onNavigate={() => onOpenChange(false)}
                />
              </div>
            );
          })()}
        </div>

        {items.length > 0 && (
          <div className="px-5 md:px-8 py-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] surface-paper border-t border-western-border-soft shadow-[0_-12px_32px_-24px_rgba(30,26,22,0.35)] space-y-4">
            {/* Subtotal — protagonista da barra fixa */}
            <div className="flex justify-between items-baseline gap-3">
              <span className="font-sans text-[16px] font-semibold text-western-green-deep">
                Subtotal
                <span className="font-normal text-western-stone-warm">
                  {" "}· {totalQty} {totalQty === 1 ? "peça" : "peças"}
                </span>
              </span>
              {isApproved ? (
                <span className="font-sans text-[26px] font-bold tabular-nums text-western-green-deep leading-none">
                  {formatBRL(subtotal, currency)}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 font-sans text-[16px] font-semibold text-western-bronze">
                  <Lock className="h-4 w-4" /> Parceiro
                </span>
              )}
            </div>

            {/* Pedido mínimo — progresso, nunca bloqueio (Western Box não tem mínimo) */}
            {isApproved && (
              <div>
                <div className="h-2 rounded-full bg-western-border-soft overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-[width] duration-300 ease-out ${
                      belowMin ? "bg-[#9C6812]" : "bg-[#2E7D4F]"
                    }`}
                    style={{ width: `${minPct}%` }}
                  />
                </div>
                <p
                  className={`font-sans text-[14px] font-semibold mt-1.5 ${
                    belowMin ? "text-[#9C6812]" : "text-[#2E7D4F]"
                  }`}
                >
                  {belowMin
                    ? `Faltam ${formatBRL(minOrder - subtotal, currency)} para o pedido mínimo de ${BUSINESS.pedidoMinimoLabel}`
                    : `Pedido mínimo de ${BUSINESS.pedidoMinimoLabel} atingido`}
                </p>
              </div>
            )}

            {/* Frete — cotado por CEP no checkout */}
            {isApproved && (
              <div className="rounded-[10px] border border-western-border-soft bg-western-ivory px-3.5 py-3">
                <div className="flex items-start gap-2.5">
                  <Truck className="h-5 w-5 text-western-bronze flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-eyebrow">Frete calculado no checkout</p>
                    <p className="font-sans text-[15px] leading-normal text-western-stone-warm mt-1">
                      Cotamos por CEP, incluindo pedidos multivolume, na etapa de pagamento.
                      Retirada grátis em {BUSINESS.cidadeAtelie}/{BUSINESS.ufAtelie}.
                    </p>
                    <a
                      href={`https://wa.me/${BUSINESS.whatsappFabrica}?text=${encodeURIComponent(
                        "Olá, Western. Estou montando um pedido grande / de obra e gostaria de uma cotação logística dedicada.",
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center mt-2 font-sans text-[15px] font-semibold text-western-green-deep hover:underline"
                    >
                      Pedido grande ou obra? Falar no WhatsApp
                      <ArrowRight className="h-4 w-4 ml-1.5" />
                    </a>
                  </div>
                </div>
              </div>
            )}

            {/* Preço gated — política comercial B2B */}
            {!isApproved && (
              <div className="flex items-start gap-2.5 rounded-[10px] border border-western-border-soft bg-western-ivory px-3.5 py-3">
                <Lock className="h-5 w-5 text-western-bronze flex-shrink-0 mt-0.5" />
                <p className="font-sans text-[15px] leading-normal text-western-stone-warm">
                  Preços B2B liberados após aprovação do cadastro. Você pode solicitar orçamento agora mesmo.
                </p>
              </div>
            )}

            {/* CTA primário — VERDE, full-width, 52px+ */}
            {isApproved ? (
              <Button
                onClick={handleCheckout}
                disabled={isLoading || checkoutLoading}
                className="group w-full h-14 rounded-[10px] bg-western-cta text-western-cream hover:bg-western-green-deep font-sans text-[16px] font-semibold normal-case tracking-normal [&_svg]:size-5 disabled:opacity-45"
              >
                {isLoading || checkoutLoading ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  <>
                    Finalizar compra
                    <ArrowRight className="transition-transform motion-safe:group-hover:translate-x-0.5" />
                  </>
                )}
              </Button>
            ) : (
              <Button
                onClick={() => setQuoteOpen(true)}
                className="w-full h-14 rounded-[10px] bg-western-cta text-western-cream hover:bg-western-green-deep font-sans text-[16px] font-semibold normal-case tracking-normal [&_svg]:size-5"
              >
                <Download /> Baixar composição (PDF)
              </Button>
            )}

            {/* CTA secundário */}
            {isApproved && (
              <button
                type="button"
                onClick={() => setQuoteOpen(true)}
                className="btn-outline-forest w-full"
              >
                <Download className="h-5 w-5" /> Baixar composição (PDF)
              </button>
            )}

            {/* Saída para a página cheia do orçamento — o drawer é para conferir
                rápido; ajustar quantidade item a item pede a mesa grande. */}
            <Link
              to="/carrinho"
              onClick={() => onOpenChange(false)}
              className="flex items-center justify-center gap-1.5 min-h-[48px] font-sans text-[15px] font-semibold text-western-green-deep hover:text-western-bronze transition-colors"
            >
              Ver orçamento completo
              <ArrowRight className="h-4 w-4" />
            </Link>

            {!isApproved && (
              <Link
                to="/parceiro/login"
                onClick={() => onOpenChange(false)}
                className="tap-target flex items-center justify-center font-sans text-[16px] font-semibold text-western-green-deep hover:text-western-cta transition-colors"
              >
                Já é parceiro? Entre para ver preços
              </Link>
            )}

            {/* Formas de pagamento */}
            {isApproved && (
              <div className="flex items-center justify-center gap-3 flex-wrap">
                {["Pix", "Boleto", "Cartão até 12×"].map((label, i) => (
                  <div key={label} className="flex items-center gap-3">
                    {i > 0 && <span className="text-western-gold text-[9px]">◆</span>}
                    <span className="font-sans text-[14px] font-semibold text-western-stone-warm">
                      {label}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Sinais de confiança perto da decisão */}
            <div className="pt-1 space-y-1.5">
              <p className="flex items-start gap-2 font-sans text-[14px] leading-snug text-western-stone-warm">
                <FileText className="h-4 w-4 text-western-bronze flex-shrink-0 mt-0.5" />
                Empresa brasileira · NF-e em todo pedido · CNPJ {BUSINESS.cnpj}
              </p>
              <p className="flex items-start gap-2 font-sans text-[14px] leading-snug text-western-stone-warm">
                <ShieldCheck className="h-4 w-4 text-western-bronze flex-shrink-0 mt-0.5" />
                Garantia de {BUSINESS.garantiaLabel} · reposição garantida · entrega rastreada
              </p>
              <p className="flex items-start gap-2 font-sans text-[14px] leading-snug text-western-stone-warm">
                <Lock className="h-4 w-4 text-western-bronze flex-shrink-0 mt-0.5" />
                Você conclui o pagamento em ambiente seguro, fora do site. Produção em {BUSINESS.prazoProducaoLabel}.
              </p>
            </div>
          </div>
        )}
      </SheetContent>
      <QuoteRequestModal open={quoteOpen} onOpenChange={setQuoteOpen} />
    </Sheet>
  );
}
