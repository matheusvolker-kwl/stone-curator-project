import { Sheet, SheetContent, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { useCartStore } from "@/stores/cartStore";
import QtyInput from "@/components/shared/QtyInput";
import { formatBRL, cdnImg } from "@/lib/catalog/client";
import {
  Minus,
  Plus,
  Trash2,
  Lock,
  ArrowLeft,
  ArrowRight,
  Download,
} from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { BUSINESS } from "@/config/business";
import { useAuth } from "@/hooks/useAuth";
import { usePartnerPricing } from "@/hooks/usePartnerPricing";
import QuoteRequestModal from "@/components/cart/QuoteRequestModal";
import EmptyCartHints from "@/components/cart/EmptyCartHints";
import { totalComDesconto, unitarioComDesconto, vendaSugerida } from "@/lib/precoParceiro";

/**
 * Drawer do carrinho — PRÉVIA, não checkout: o cliente confere o que somou e
 * segue. A lista manda no espaço (opção A, escolha do dono 18/07): cabeçalho de
 * 2 linhas, itens compactos (thumb 64 / stepper 32), rodapé de ~190px. Antes,
 * cabeçalho + rodapé comiam ~470px e sobrava ~1 item e meio de lista.
 *
 * VOCABULÁRIO (regra do site): CARRINHO é o objeto — o título é "Meu carrinho".
 * ORÇAMENTO é o documento que sai dele — por isso "Baixar orçamento (PDF)".
 * "Composição" é cena montada (DS §11), não título de carrinho.
 */
export default function CartDrawer({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { items, updateQuantity, removeItem } = useCartStore();
  const [quoteOpen, setQuoteOpen] = useState(false);
  const totalQty = items.reduce((s, i) => s + i.quantity, 0);
  const currency = items[0]?.price.currencyCode ?? "BRL";

  const { isApproved } = useAuth();
  /* O desconto do tier PRECISA entrar aqui: a página do carrinho aplica
   * (usePartnerPricing) e o drawer não aplicava — o mesmo carrinho mostrava dois
   * valores diferentes para o parceiro, dependendo de onde ele olhasse.
   * Fonte única do cálculo: preço da variante × quantidade × (1 − desconto). */
  const { discountPct } = usePartnerPricing();
  const lineTotal = (amount: string, qty: number) =>
    totalComDesconto(parseFloat(amount), qty, discountPct);
  const unitPrice = (amount: string) => unitarioComDesconto(parseFloat(amount), discountPct);
  const subtotal = items.reduce((s, i) => s + lineTotal(i.price.amount, i.quantity), 0);
  // Quanto este carrinho revende, pelo preço sugerido ao consumidor final.
  // Sai do preço de TABELA de cada item, nunca do já descontado.
  const sugerido = items.reduce(
    (s, i) => s + vendaSugerida(parseFloat(i.price.amount)) * i.quantity,
    0,
  );

  // Pedido mínimo B2B — informativo (progresso no orçamento), nunca bloqueia o
  // checkout: a Western Box é vendida sem mínimo e sem cadastro.
  const minOrder = BUSINESS.pedidoMinimoBRL;
  const belowMin = isApproved && subtotal > 0 && subtotal < minOrder;
  const minPct = Math.min(100, Math.round((subtotal / minOrder) * 100));

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-lg h-[100dvh] flex flex-col min-h-0 p-0 surface-ivory border-l border-western-border-soft"
      >
        {/* Cabeçalho — 2 linhas: voltar + título com contador. O X é o do Sheet. */}
        <div className="px-5 md:px-6 pt-4 pb-3.5 surface-paper border-b border-western-border-soft">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="tap-target inline-flex items-center gap-1.5 -ml-1 font-sans text-[14px] font-semibold text-western-green-deep hover:text-western-cta transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Continuar comprando
          </button>
          <SheetTitle className="text-title-sm text-western-green-deep mt-1">
            Meu carrinho
            {totalQty > 0 && (
              <span className="font-sans text-[15px] font-normal text-western-stone-warm">
                {" "}· {totalQty} {totalQty === 1 ? "peça" : "peças"}
              </span>
            )}
          </SheetTitle>
          <SheetDescription className="sr-only">
            Prévia das peças do carrinho. Revisão, frete e pagamento ficam na página do carrinho.
          </SheetDescription>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-5 md:px-6">
          {items.length === 0 ? (
            <div className="space-y-6 py-6">
              <div className="text-center py-6">
                <p className="text-body max-w-xs mx-auto">
                  Quando você adicionar uma peça, ela aparece aqui.
                </p>
              </div>
              <EmptyCartHints onNavigate={() => onOpenChange(false)} />
            </div>
          ) : (
            <ul>
              {items.map((item) => (
                <li
                  key={item.variantId}
                  className="flex gap-3 py-3.5 border-b last:border-0 border-western-border-soft"
                >
                  <div className="w-16 h-16 flex-shrink-0 overflow-hidden rounded-lg bg-western-paper border border-western-border-soft">
                    {item.productImage && (
                      <img
                        src={cdnImg(item.productImage, 160)}
                        alt={item.productTitle}
                        className="w-full h-full object-contain p-1"
                      />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-sans text-[15px] font-semibold leading-snug text-western-green-deep truncate">
                        {item.productTitle}
                      </h4>
                      {isApproved ? (
                        <p className="font-sans text-[15px] font-bold tabular-nums text-western-green-deep whitespace-nowrap">
                          {formatBRL(
                            lineTotal(item.price.amount, item.quantity),
                            item.price.currencyCode,
                          )}
                        </p>
                      ) : (
                        <span className="inline-flex items-center gap-1 font-sans text-[13px] font-semibold text-western-bronze whitespace-nowrap">
                          <Lock className="h-3.5 w-3.5" /> Parceiro
                        </span>
                      )}
                    </div>

                    <p className="font-sans text-[13px] text-western-stone-warm mt-0.5 truncate">
                      {item.selectedOptions.map((o) => o.value).join(" · ")}
                      {isApproved && item.quantity > 1 && (
                        <> · {formatBRL(unitPrice(item.price.amount), item.price.currencyCode)} / peça</>
                      )}
                    </p>

                    <div className="flex items-center justify-between mt-2">
                      <div className="inline-flex items-center rounded-md border border-western-border-strong bg-white overflow-hidden">
                        <button
                          onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                          className="h-8 w-8 flex items-center justify-center text-western-green-deep hover:bg-western-paper transition-colors"
                          aria-label="Diminuir quantidade"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <QtyInput
                          value={item.quantity}
                          onCommit={(n) => updateQuantity(item.variantId, n)}
                          ariaLabel={`Quantidade de ${item.productTitle}`}
                          className="h-8 w-11 border-0 bg-transparent px-1 text-center font-sans text-[14px] font-semibold tabular-nums text-western-green-deep focus:outline-none"
                        />
                        <button
                          onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                          className="h-8 w-8 flex items-center justify-center text-western-green-deep hover:bg-western-paper transition-colors"
                          aria-label="Aumentar quantidade"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      <button
                        onClick={() => removeItem(item.variantId)}
                        className="h-8 w-8 flex items-center justify-center rounded-md text-western-stone-warm hover:text-status-error hover:bg-western-paper transition-colors"
                        aria-label={`Remover ${item.productTitle}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {items.length > 0 && (
          <div className="px-5 md:px-6 pt-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] surface-paper border-t border-western-border-soft shadow-[0_-12px_32px_-24px_rgba(30,26,22,0.35)] space-y-3">
            {/* Subtotal — protagonista da barra fixa */}
            <div className="flex justify-between items-baseline gap-3">
              <span className="font-sans text-[15px] font-semibold text-western-green-deep">
                Subtotal
                <span className="font-normal text-western-stone-warm">
                  {" "}· {totalQty} {totalQty === 1 ? "peça" : "peças"}
                </span>
              </span>
              {isApproved ? (
                <span className="font-sans text-[20px] font-bold tabular-nums text-western-green-deep leading-none">
                  {formatBRL(subtotal, currency)}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 font-sans text-[15px] font-semibold text-western-bronze">
                  <Lock className="h-4 w-4" /> Parceiro
                </span>
              )}
            </div>

            {/* O retorno do pedido — mesmo raciocínio da página do carrinho:
                o parceiro dimensiona a compra pelo que ela devolve. Aqui em uma
                linha só, porque a gaveta é consulta rápida. */}
            {isApproved && sugerido > 0 && (
              <div className="flex items-baseline justify-between gap-3 border-t border-western-border-soft pt-3">
                <span className="font-sans text-[13.5px] text-western-stone-warm">
                  Revende por {formatBRL(sugerido, currency)}
                </span>
                <span className="font-sans text-[15px] font-bold tabular-nums text-western-bronze whitespace-nowrap">
                  + {formatBRL(sugerido - subtotal, currency)}
                </span>
              </div>
            )}

            {/* Pedido mínimo — barra + rótulo numa linha, nunca bloqueio */}
            {isApproved && (
              <div className="flex items-center gap-2.5">
                <div className="h-1.5 flex-1 rounded-full bg-western-border-soft overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-[width] duration-300 ease-out ${
                      belowMin ? "bg-status-warning" : "bg-status-success"
                    }`}
                    style={{ width: `${minPct}%` }}
                  />
                </div>
                <p
                  className={`font-sans text-[13px] font-semibold whitespace-nowrap ${
                    belowMin ? "text-status-warning" : "text-status-success"
                  }`}
                >
                  {belowMin
                    ? `Faltam ${formatBRL(minOrder - subtotal, currency)} para ${BUSINESS.pedidoMinimoLabel}`
                    : `Mínimo de ${BUSINESS.pedidoMinimoLabel} atingido`}
                </p>
              </div>
            )}

            {/* CTA primário — leva SEMPRE à página do carrinho (revisão + frete +
                pagamento). O checkout direto saiu do drawer por decisão do dono. */}
            <Link
              to="/carrinho"
              onClick={() => onOpenChange(false)}
              className="group flex w-full items-center justify-center gap-2 h-12 rounded-lg bg-western-cta text-western-cream hover:bg-western-green-deep font-sans text-[15px] font-semibold [&_svg]:size-5 transition-colors"
            >
              Ir para o carrinho
              <ArrowRight className="transition-transform motion-safe:group-hover:translate-x-0.5" />
            </Link>

            {/* Última linha: orçamento à esquerda, garantia à direita. */}
            {isApproved ? (
              <div className="flex items-center justify-between pt-0.5">
                <button
                  type="button"
                  onClick={() => setQuoteOpen(true)}
                  className="tap-target inline-flex items-center gap-1.5 font-sans text-[14px] font-semibold text-western-green-deep hover:text-western-cta transition-colors"
                >
                  <Download className="h-4 w-4" /> Baixar orçamento (PDF)
                </button>
                <span className="inline-flex items-center gap-1.5 font-sans text-[13px] text-western-stone-warm">
                  <Lock className="h-3.5 w-3.5 text-western-bronze" /> Garantia de{" "}
                  {BUSINESS.garantiaLabel}
                </span>
              </div>
            ) : (
              <p className="text-center font-sans text-[13.5px] leading-snug text-western-stone-warm pt-0.5">
                Preços liberados após aprovação do cadastro ·{" "}
                <Link
                  to="/parceiro/login"
                  onClick={() => onOpenChange(false)}
                  className="font-semibold text-western-green-deep underline underline-offset-2 hover:text-western-cta transition-colors"
                >
                  Já é parceiro? Entrar
                </Link>
              </p>
            )}
          </div>
        )}
      </SheetContent>
      <QuoteRequestModal open={quoteOpen} onOpenChange={setQuoteOpen} />
    </Sheet>
  );
}
