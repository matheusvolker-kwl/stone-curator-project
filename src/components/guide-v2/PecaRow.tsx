import { useState } from "react";
import { Minus, Plus } from "lucide-react";
import { formatPreco } from "@/data/guideMap";
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

  return (
    <div className="flex flex-col md:flex-row md:items-start gap-4 md:gap-5 py-6 border-b border-western-stone-warm/15 first:border-t">
      <div className="flex gap-4 md:gap-5 flex-1 min-w-0">
        <div className="w-20 h-20 md:w-24 md:h-24 flex-shrink-0 bg-western-paper border border-western-stone-warm/10 overflow-hidden">
          {peca.imageUrl ? (
            <img src={peca.imageUrl} alt={peca.nome} loading="lazy" decoding="async" className="w-full h-full object-contain p-1.5" />
          ) : (
            <div className="w-full h-full bg-western-paper" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-display text-[18px] md:text-[19px] text-western-green-deep leading-tight break-words">{peca.nome}</h4>
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-western-gold mt-1.5 break-words">
            {peca.codigo}{peca.pesoKg ? ` · ${peca.pesoKg} kg` : ""}{peca.dim && peca.dim !== "—" ? ` · ${peca.dim}` : ""}
          </p>
          <p className="font-sans text-[16px] md:text-[17px] font-medium tabular-nums text-western-green-deep mt-2">{formatPreco(peca.preco)}</p>
        </div>
      </div>
      <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-start gap-3 md:gap-2.5">
        <div className="inline-flex items-center border border-western-stone-warm/30 bg-white">
          <button
            type="button"
            onClick={() => handleQty(peca.qty - 1)}
            className="w-11 h-11 flex items-center justify-center text-western-green-deep hover:bg-western-paper transition-colors"
            aria-label="Diminuir"
          >
            <Minus className="h-3.5 w-3.5" />
          </button>
          <span
            key={pulse ?? peca.qty}
            className="w-11 text-center font-sans font-medium text-[16px] tabular-nums text-western-green-deep animate-fade-in"
          >
            {peca.qty}
          </span>
          <button
            type="button"
            onClick={() => handleQty(peca.qty + 1)}
            className="w-11 h-11 flex items-center justify-center text-western-green-deep hover:bg-western-paper transition-colors"
            aria-label="Aumentar"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
        </div>
        {confirm ? (
          <div className="flex items-center gap-2 font-sans text-[12px]">
            <span className="text-western-stone-warm">Remover?</span>
            <button onClick={() => onRemove(peca.id)} className="text-destructive font-medium underline" type="button">
              Sim
            </button>
            <button onClick={() => setConfirm(false)} className="text-western-stone-warm/70" type="button">
              Cancelar
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setConfirm(true)}
            className="font-sans text-[12px] text-western-stone-warm hover:text-destructive transition-colors"
          >
            Remover
          </button>
        )}
      </div>
    </div>
  );
}
