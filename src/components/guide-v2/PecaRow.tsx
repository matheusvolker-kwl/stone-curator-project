import { useState } from "react";
import { Minus, Plus } from "lucide-react";
import GatedPrice from "@/components/shared/GatedPrice";
import { papelDaPeca } from "./papelPeca";
import type { ProjetoPeca } from "./types";

interface Props {
  peca: ProjetoPeca;
  index?: number;
  onQty: (id: string, qty: number) => void;
  onRemove: (id: string) => void;
}

export default function PecaRow({ peca, onQty, onRemove }: Props) {
  const [confirm, setConfirm] = useState(false);
  const [pulse, setPulse] = useState<number | null>(null);

  const handleQty = (next: number) => {
    setPulse(next);
    onQty(peca.id, Math.max(0, next));
    window.setTimeout(() => setPulse(null), 320);
  };

  const specs = [
    peca.codigo,
    peca.pesoKg ? `${peca.pesoKg} kg` : null,
    peca.dim && peca.dim !== "—" ? peca.dim : null,
  ].filter(Boolean);

  // Papel na composição (gramática de projeto) — derivado do código/handle.
  const papel = papelDaPeca(peca.codigo);

  return (
    <div className="flex flex-col md:flex-row md:items-start gap-5 py-6 border-b border-western-border-soft first:border-t">
      <div className="flex gap-4 md:gap-5 flex-1 min-w-0">
        <div className="w-24 h-24 flex-shrink-0 rounded-[10px] bg-western-paper border border-western-border-soft overflow-hidden">
          {peca.imageUrl ? (
            <img
              src={peca.imageUrl}
              alt={peca.nome}
              loading="lazy"
              decoding="async"
              className="w-full h-full object-contain p-2"
            />
          ) : (
            <div className="w-full h-full bg-western-paper" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h4 className="font-sans text-[18px] md:text-[20px] font-semibold text-western-green-deep leading-snug break-words">
            {peca.nome}
          </h4>
          {papel && (
            <span
              className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-western-gold/15 px-2.5 py-0.5 font-sans text-[12.5px] font-semibold text-western-bronze"
              title={papel.frase}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-western-gold" aria-hidden />
              {papel.papel}
              <span className="sr-only"> — {papel.frase}</span>
            </span>
          )}
          <p className="text-meta mt-1.5 break-words">{specs.join(" · ")}</p>
          {/* Preço unitário só para parceiro aprovado (gate B2B). O sidebar
              já traz o CTA do gate — sem repetir chip em cada linha. */}
          <GatedPrice
            amount={peca.preco}
            variant="hidden"
            className="font-sans text-[17px] font-semibold tabular-nums text-western-green-deep mt-2"
          />
        </div>
      </div>

      <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-start gap-4 md:gap-3 flex-shrink-0">
        <div className="inline-flex items-center rounded-[10px] border border-western-border-strong bg-white overflow-hidden">
          <button
            type="button"
            onClick={() => handleQty(peca.qty - 1)}
            className="w-12 h-12 flex items-center justify-center text-western-green-deep hover:bg-western-paper transition-colors"
            aria-label={`Diminuir quantidade de ${peca.nome}`}
          >
            <Minus className="h-4 w-4" aria-hidden />
          </button>
          <span
            key={pulse ?? peca.qty}
            className="w-12 text-center font-sans text-[16px] font-semibold tabular-nums text-western-green-deep animate-fade-in"
          >
            {peca.qty}
          </span>
          <button
            type="button"
            onClick={() => handleQty(peca.qty + 1)}
            className="w-12 h-12 flex items-center justify-center text-western-green-deep hover:bg-western-paper transition-colors"
            aria-label={`Aumentar quantidade de ${peca.nome}`}
          >
            <Plus className="h-4 w-4" aria-hidden />
          </button>
        </div>

        {confirm ? (
          <div className="inline-flex items-center gap-3 font-sans text-[16px]">
            <span className="text-western-stone-warm">Remover?</span>
            <button
              type="button"
              onClick={() => onRemove(peca.id)}
              className="tap-target font-semibold text-destructive underline underline-offset-4"
            >
              Sim
            </button>
            <button
              type="button"
              onClick={() => setConfirm(false)}
              className="tap-target text-western-stone-warm"
            >
              Cancelar
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setConfirm(true)}
            className="tap-target inline-flex items-center font-sans text-[16px] text-western-stone-warm hover:text-destructive transition-colors"
          >
            Remover
          </button>
        )}
      </div>
    </div>
  );
}
