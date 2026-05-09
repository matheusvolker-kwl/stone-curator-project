import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, FileDown, MessageCircle, RotateCcw, ShoppingBag, Sparkles, TrendingDown, User } from "lucide-react";
import { useCartStore } from "@/stores/cartStore";
import { useGuideStore } from "@/stores/guideStore";
import { cdnImg, formatBRL } from "@/lib/shopify/client";
import { whatsappConjunto, type ConjuntoLeaf, type GuideAnswers } from "@/data/guideMap";
import SketchLeadModal from "./SketchLeadModal";

interface Props {
  conjunto: ConjuntoLeaf;
  answers: GuideAnswers;
  acabamento: string;
  onBack: () => void;
  onReset: () => void;
}

// Confete leve: partículas douradas em CSS, sem dependências.
// Respeita prefers-reduced-motion e memoiza partículas.
function Confetti() {
  const pieces = useMemo(
    () =>
      Array.from({ length: 24 }, () => ({
        left: Math.random() * 100,
        delay: Math.random() * 0.6,
        duration: 1.6 + Math.random() * 1.2,
        drift: (Math.random() - 0.5) * 80,
        size: 4 + Math.random() * 5,
        isGold: Math.random() > 0.3,
      })),
    []
  );
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden motion-reduce:hidden" aria-hidden>
      {pieces.map((p, i) => (
        <motion.span
          key={i}
          initial={{ y: -20, x: 0, opacity: 0, rotate: 0 }}
          animate={{ y: "120%", x: p.drift, opacity: [0, 1, 1, 0], rotate: 360 }}
          transition={{ duration: p.duration, delay: p.delay, ease: "easeOut" }}
          className="absolute top-0 block"
          style={{
            left: `${p.left}%`,
            width: p.size,
            height: p.size * 0.4,
            backgroundColor: p.isGold ? "hsl(var(--western-gold))" : "hsl(var(--western-cream))",
          }}
        />
      ))}
    </div>
  );
}

export default function StepFechamento({ conjunto, answers, acabamento, onBack, onReset }: Props) {
  const items = useCartStore((s) => s.items);
  const nome = useGuideStore((s) => s.nome);
  const setNome = useGuideStore((s) => s.setNome);
  const areaM2 = useGuideStore((s) => s.areaM2);
  const total = items.reduce(
    (acc, i) => acc + parseFloat(i.price.amount) * i.quantity,
    0
  );
  const totalQty = items.reduce((acc, i) => acc + i.quantity, 0);
  const [sketchOpen, setSketchOpen] = useState(false);
  const [showConfetti, setShowConfetti] = useState(true);
  const [nameDraft, setNameDraft] = useState(nome ?? "");

  useEffect(() => {
    const t = setTimeout(() => setShowConfetti(false), 3000);
    return () => clearTimeout(t);
  }, []);

  const openCart = () => window.dispatchEvent(new CustomEvent("western:open-cart"));

  const commitName = () => {
    const trimmed = nameDraft.trim();
    if (trimmed && trimmed !== nome) setNome(trimmed);
  };

  // Estimativa simples de economia vs. pedra natural (multiplicador conservador 1.7x)
  const estimadoNatural = Math.round(total * 1.7);
  const economia = estimadoNatural - total;
  const firstName = nome ? nome.split(/\s+/)[0] : "";

  return (
    <div className="relative">
      <AnimatePresence>{showConfetti && items.length > 0 && <Confetti />}</AnimatePresence>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <p className="text-eyebrow mb-3">Etapa 09 · Fechamento</p>
        <h2 className="font-display text-4xl md:text-5xl text-western-green-deep leading-[1.05] mb-4">
          {firstName ? <>Pronto, {firstName}.<br />Seu projeto está montado.</> : <>Pronto. Seu projeto<br />está montado.</>}
        </h2>
        <p className="text-western-stone-warm leading-relaxed max-w-2xl mb-6 text-lg">
          {totalQty} {totalQty === 1 ? "item curado" : "itens curados"}, {formatBRL(total, "BRL")} em
          composição autoral. Envie para o cliente final, abra o orçamento ou fale direto com
          um consultor para fechar a condição comercial.
        </p>

        {!nome && (
          <div className="mb-10 inline-flex items-center gap-3 border border-western-stone-warm/20 bg-white pl-4 pr-1 py-1 max-w-md">
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
              aria-label="Seu nome para personalizar o fechamento"
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
      </motion.div>

      <div className="grid lg:grid-cols-[1.3fr_1fr] gap-10">
        {/* Resumo */}
        <div className="border border-western-stone-warm/20 bg-white">
          <div className="px-5 py-4 border-b border-western-stone-warm/15 flex items-center justify-between">
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
                Nenhum item adicionado ainda. Volte às etapas anteriores para montar o projeto.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-western-stone-warm/15">
              {items.map((i, idx) => (
                <motion.li
                  key={i.variantId}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.08, duration: 0.3 }}
                  className="flex gap-4 p-4"
                >
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
                </motion.li>
              ))}
            </ul>
          )}

          <div className="px-5 py-4 border-t border-western-stone-warm/15 flex items-baseline justify-between">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-western-green-deep">
              Total parcial
            </p>
            <motion.p
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ delay: items.length * 0.08, type: "spring", stiffness: 280 }}
              className="font-display text-3xl text-western-green-deep"
            >
              {formatBRL(total, "BRL")}
            </motion.p>
          </div>

          {economia > 0 && items.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.4 }}
              className="px-5 py-4 border-t border-western-gold/30 bg-western-cream/40 flex items-start gap-3"
            >
              <TrendingDown className="h-4 w-4 text-western-gold mt-0.5 shrink-0" />
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-western-gold mb-1">
                  Economia estimada
                </p>
                <p className="text-sm text-western-stone-warm leading-snug">
                  Cerca de <strong className="text-western-green-deep">{formatBRL(economia, "BRL")}</strong>{" "}
                  versus equivalente em pedra natural — e ~40 dias mais rápido na produção.
                </p>
              </div>
            </motion.div>
          )}
        </div>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="space-y-4"
        >
          <button
            type="button"
            onClick={openCart}
            disabled={items.length === 0}
            className="w-full inline-flex items-center justify-center gap-3 h-16 bg-western-gold text-western-green-deep hover:bg-western-gold/90 font-display text-lg transition-colors disabled:opacity-50 shadow-[0_18px_40px_-20px_rgba(184,146,79,0.6)]"
          >
            <ShoppingBag className="h-5 w-5" />
            Solicitar proposta com este orçamento
          </button>

          <button
            type="button"
            onClick={() => setSketchOpen(true)}
            className="w-full inline-flex items-center justify-center gap-2 h-12 border border-western-green-deep text-western-green-deep hover:bg-western-green-deep hover:text-western-cream font-mono text-xs uppercase tracking-[0.22em] transition-colors"
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

          <div className="pt-4 border-t border-western-stone-warm/15">
            <div className="flex items-start gap-2">
              <Sparkles className="h-4 w-4 text-western-gold mt-0.5 shrink-0" />
              <p className="text-xs text-western-stone-warm/85 leading-relaxed">
                Pedido mínimo R$ 2.000 · Produção 15 dias úteis após pagamento ·
                PIX, TED ou boleto · Frete por transportadora ou retirada gratuita em São Paulo.
              </p>
            </div>
          </div>
        </motion.div>
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
        contexto={{ tipo: answers.tipo, areaM2 }}
        nomePreFill={nome}
      />
    </div>
  );
}
