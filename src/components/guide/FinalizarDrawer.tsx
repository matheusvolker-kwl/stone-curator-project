import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FileDown, MessageCircle, ShoppingBag, Sparkles, TrendingDown, User } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useCartStore } from "@/stores/cartStore";
import { useGuideStore } from "@/stores/guideStore";
import { cdnImg, formatBRL } from "@/lib/shopify/client";
import { whatsappConjunto, type ConjuntoLeaf, type GuideAnswers } from "@/data/guideMap";
import { BUSINESS } from "@/config/business";
import GatedPrice from "@/components/shared/GatedPrice";
import { useAuth } from "@/hooks/useAuth";
import SketchLeadModal from "./SketchLeadModal";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  conjunto: ConjuntoLeaf;
  answers: GuideAnswers;
  acabamento: string;
}

export default function FinalizarDrawer({ open, onOpenChange, conjunto, answers, acabamento }: Props) {
  const items = useCartStore((s) => s.items);
  const { isApproved } = useAuth();
  const nome = useGuideStore((s) => s.nome);
  const setNome = useGuideStore((s) => s.setNome);
  const areaM2 = useGuideStore((s) => s.areaM2);
  const total = items.reduce(
    (acc, i) => acc + parseFloat(i.price.amount) * i.quantity,
    0
  );
  const totalQty = items.reduce((acc, i) => acc + i.quantity, 0);
  const [sketchOpen, setSketchOpen] = useState(false);
  const [nameDraft, setNameDraft] = useState(nome ?? "");

  useEffect(() => {
    setNameDraft(nome ?? "");
  }, [nome]);

  const commitName = () => {
    const trimmed = nameDraft.trim();
    if (trimmed && trimmed !== nome) setNome(trimmed);
  };

  const openCart = () => {
    onOpenChange(false);
    setTimeout(() => window.dispatchEvent(new CustomEvent("western:open-cart")), 200);
  };

  const estimadoNatural = Math.round(total * 1.7);
  const economia = estimadoNatural - total;
  const firstName = nome ? nome.split(/\s+/)[0] : "";

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-0 gap-0">
          <DialogHeader className="px-6 pt-6 pb-2">
            <p className="text-eyebrow mb-2">Finalizar projeto</p>
            <DialogTitle className="font-display text-2xl md:text-3xl text-western-green-deep leading-tight">
              {firstName ? `Pronto, ${firstName}. Seu projeto está montado.` : "Pronto. Seu projeto está montado."}
            </DialogTitle>
            <DialogDescription className="text-sm text-western-stone-warm leading-relaxed">
              {totalQty} {totalQty === 1 ? "item curado" : "itens curados"}
              {isApproved ? `, ${formatBRL(total, "BRL")} em composição autoral.` : " em composição autoral."}{" "}
              Solicite a proposta, baixe a prancha técnica ou fale com um consultor.
            </DialogDescription>
          </DialogHeader>

          <div className="px-6 pb-6 space-y-5">
            {!nome && (
              <div className="flex items-center gap-3 border border-western-stone-warm/20 bg-white pl-4 pr-1 py-1">
                <User className="h-4 w-4 text-western-gold shrink-0" />
                <input
                  type="text"
                  value={nameDraft}
                  onChange={(e) => setNameDraft(e.target.value)}
                  onBlur={commitName}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); commitName(); } }}
                  placeholder="Como podemos chamar você?"
                  maxLength={60}
                  className="flex-1 bg-transparent py-2 text-sm text-western-green-deep placeholder:text-western-stone-warm/60 focus:outline-none"
                  aria-label="Seu nome"
                />
                <button
                  type="button"
                  onClick={commitName}
                  className="font-mono text-[10px] uppercase tracking-[0.2em] px-3 py-2 text-western-stone-warm hover:text-western-green-deep transition-colors"
                >
                  Salvar
                </button>
              </div>
            )}

            <div className="border border-western-stone-warm/20 bg-white">
              <div className="px-5 py-3 border-b border-western-stone-warm/15 flex items-center justify-between">
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-western-green-deep">
                  Resumo do projeto
                </p>
                <p className="text-xs text-western-stone-warm">
                  {totalQty} {totalQty === 1 ? "item" : "itens"}
                </p>
              </div>

              {items.length === 0 ? (
                <div className="p-8 text-center">
                  <p className="text-sm text-western-stone-warm">
                    Nenhum item adicionado ainda. Adicione o conjunto base para continuar.
                  </p>
                </div>
              ) : (
                <ul className="divide-y divide-western-stone-warm/15 max-h-[280px] overflow-y-auto">
                  {items.map((i) => (
                    <li key={i.variantId} className="flex gap-3 p-3">
                      <div className="w-12 h-12 bg-western-cream/40 shrink-0 overflow-hidden">
                        {i.productImage && (
                          <img
                            src={cdnImg(i.productImage, 160)}
                            alt={i.productTitle}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-display text-sm text-western-green-deep leading-tight truncate">
                          {i.productTitle}
                        </p>
                        <p className="text-xs text-western-stone-warm/80">
                          Qtd {i.quantity}
                        </p>
                      </div>
                      <GatedPrice
                        amount={parseFloat(i.price.amount) * i.quantity}
                        currency={i.price.currencyCode}
                        variant="badge"
                        className="text-sm text-western-green-deep font-mono whitespace-nowrap"
                      />
                    </li>
                  ))}
                </ul>
              )}

              <div className="px-5 py-3 border-t border-western-stone-warm/15 flex items-baseline justify-between">
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-western-green-deep">
                  Total parcial
                </p>
                {isApproved ? (
                  <p className="font-display text-2xl text-western-green-deep">
                    {formatBRL(total, "BRL")}
                  </p>
                ) : (
                  <GatedPrice amount={total} variant="block" className="font-display text-2xl text-western-green-deep" />
                )}
              </div>

              {isApproved && economia > 0 && items.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="px-5 py-3 border-t border-western-gold/30 bg-western-cream/40 flex items-start gap-3"
                >
                  <TrendingDown className="h-4 w-4 text-western-gold mt-0.5 shrink-0" />
                  <p className="text-sm text-western-stone-warm leading-snug">
                    Economia estimada de <strong className="text-western-green-deep">{formatBRL(economia, "BRL")}</strong>{" "}
                    versus equivalente em pedra natural — e ~40 dias mais rápido.
                  </p>
                </motion.div>
              )}
            </div>

            <div className="space-y-3">
              <button
                type="button"
                onClick={openCart}
                disabled={items.length === 0}
                className="w-full inline-flex items-center justify-center gap-3 h-14 bg-western-gold text-western-green-deep hover:bg-western-gold/90 font-display text-base transition-colors disabled:opacity-50 shadow-[0_18px_40px_-20px_rgba(184,146,79,0.6)]"
              >
                <ShoppingBag className="h-5 w-5" />
                Solicitar proposta com este orçamento
              </button>

              <button
                type="button"
                onClick={() => setSketchOpen(true)}
                className="w-full inline-flex items-center justify-center gap-2 h-11 border border-western-green-deep text-western-green-deep hover:bg-western-green-deep hover:text-western-cream font-mono text-xs uppercase tracking-[0.22em] transition-colors"
              >
                <FileDown className="h-4 w-4" /> Baixar prancha técnica (PDF + .skp)
              </button>

              <a
                href={whatsappConjunto(`${conjunto.nome} (acabamento ${acabamento})`)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 w-full font-mono text-[11px] uppercase tracking-[0.22em] text-western-stone-warm hover:text-western-green-deep transition-colors py-2"
              >
                <MessageCircle className="h-4 w-4" /> Falar com um consultor
              </a>
            </div>

            <div className="pt-3 border-t border-western-stone-warm/15 flex items-start gap-2">
              <Sparkles className="h-4 w-4 text-western-gold mt-0.5 shrink-0" />
              <p className="text-xs text-western-stone-warm/85 leading-relaxed">
                Pedido mínimo {BUSINESS.pedidoMinimoLabel} · Produção {BUSINESS.prazoProducaoDias} dias úteis após confirmação ·
                Frete por transportadora ou retirada gratuita em {BUSINESS.cidadeAtelie}/{BUSINESS.ufAtelie}.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <SketchLeadModal
        open={sketchOpen}
        onClose={() => setSketchOpen(false)}
        conjuntoNome={conjunto.nome}
        conjuntoHandle={conjunto.handle}
        acabamento={acabamento}
        contexto={{ tipo: answers.tipo, areaM2 }}
        nomePreFill={nome}
      />
    </>
  );
}
