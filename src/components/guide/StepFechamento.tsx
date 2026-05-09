import { useState } from "react";
import { ArrowLeft, FileDown, MessageCircle, RotateCcw, ShoppingBag } from "lucide-react";
import { useCartStore } from "@/stores/cartStore";
import { cdnImg, formatBRL } from "@/lib/shopify/client";
import { whatsappConjunto, type ConjuntoLeaf, type GuideAnswers, type Tipo } from "@/data/guideMap";
import SketchLeadModal from "./SketchLeadModal";

interface Props {
  conjunto: ConjuntoLeaf;
  answers: GuideAnswers;
  acabamento: string;
  onBack: () => void;
  onReset: () => void;
}

export default function StepFechamento({ conjunto, answers, acabamento, onBack, onReset }: Props) {
  const items = useCartStore((s) => s.items);
  const total = items.reduce(
    (acc, i) => acc + parseFloat(i.price.amount) * i.quantity,
    0
  );
  const totalQty = items.reduce((acc, i) => acc + i.quantity, 0);
  const [sketchOpen, setSketchOpen] = useState(false);

  const openCart = () => window.dispatchEvent(new CustomEvent("western:open-cart"));

  return (
    <div className="animate-in fade-in duration-300">
      <p className="text-eyebrow mb-3">Etapa 09 · Fechamento</p>
      <h2 className="font-display text-3xl md:text-4xl text-western-green-deep leading-tight mb-3">
        Seu projeto está montado
      </h2>
      <p className="text-western-stone-warm leading-relaxed max-w-2xl mb-10">
        Confira o resumo, baixe a prancha técnica para enviar ao cliente final ou
        fale direto com um consultor para fechar a condição comercial.
      </p>

      <div className="grid lg:grid-cols-[1.3fr_1fr] gap-10">
        {/* Resumo */}
        <div className="border border-western-stone-warm/20 bg-white">
          <div className="px-5 py-4 border-b border-western-stone-warm/15 flex items-center justify-between">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-western-green-deep">
              Resumo do orçamento
            </p>
            <p className="text-xs text-western-stone-warm">
              {totalQty} {totalQty === 1 ? "item" : "itens"}
            </p>
          </div>

          {items.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-sm text-western-stone-warm">
                Nenhum item adicionado ainda. Volte às etapas anteriores para montar o projeto.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-western-stone-warm/15">
              {items.map((i) => (
                <li key={i.variantId} className="flex gap-4 p-4">
                  <div className="w-16 h-16 bg-western-cream/40 shrink-0 overflow-hidden">
                    {i.productImage && (
                      <img
                        src={cdnImg(i.productImage, 200)}
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
                    <p className="text-xs text-western-stone-warm mt-0.5">
                      {i.variantTitle !== "Default Title" ? i.variantTitle : ""} · Qtd {i.quantity}
                    </p>
                  </div>
                  <p className="text-sm text-western-green-deep font-mono whitespace-nowrap">
                    {formatBRL(parseFloat(i.price.amount) * i.quantity, i.price.currencyCode)}
                  </p>
                </li>
              ))}
            </ul>
          )}

          <div className="px-5 py-4 border-t border-western-stone-warm/15 flex items-baseline justify-between">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-western-green-deep">
              Total parcial
            </p>
            <p className="font-display text-2xl text-western-green-deep">
              {formatBRL(total, "BRL")}
            </p>
          </div>
        </div>

        {/* CTAs */}
        <div className="space-y-3">
          <button
            type="button"
            onClick={openCart}
            disabled={items.length === 0}
            className="btn-gold w-full justify-center disabled:opacity-60"
          >
            <ShoppingBag className="h-4 w-4" /> Abrir orçamento completo
          </button>
          <button
            type="button"
            onClick={() => setSketchOpen(true)}
            className="btn-outline-forest w-full justify-center"
          >
            <FileDown className="h-4 w-4" /> Baixar prancha técnica (PDF + .skp)
          </button>
          <a
            href={whatsappConjunto(`${conjunto.nome} (acabamento ${acabamento})`)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 h-11 w-full font-mono text-xs uppercase tracking-[0.22em] text-western-green-deep border border-western-green-deep/20 hover:border-western-green-deep transition-colors"
          >
            <MessageCircle className="h-4 w-4" /> Falar com consultor
          </a>

          <p className="text-xs text-western-stone-warm/80 leading-relaxed pt-4">
            Pedido mínimo R$ 2.000 · Produção 15 dias úteis após pagamento ·
            PIX, TED ou boleto · Frete por transportadora ou retirada gratuita em São Paulo.
          </p>
        </div>
      </div>

      <div className="mt-12 pt-6 border-t border-western-stone-warm/15 flex items-center justify-between flex-wrap gap-4">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-western-stone-warm hover:text-western-green-deep transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Voltar
        </button>
        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-western-stone-warm hover:text-western-green-deep transition-colors"
        >
          <RotateCcw className="h-3.5 w-3.5" /> Refazer guia
        </button>
      </div>

      <SketchLeadModal
        open={sketchOpen}
        onClose={() => setSketchOpen(false)}
        conjuntoNome={conjunto.nome}
        conjuntoHandle={conjunto.handle}
        acabamento={acabamento}
        contexto={{ tipo: answers.tipo, areaM2: undefined }}
      />
    </div>
  );
}
