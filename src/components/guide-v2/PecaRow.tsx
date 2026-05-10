import { useState } from "react";
import { Minus, Plus } from "lucide-react";
import { formatPreco } from "@/data/guideMap";
import type { ProjetoPeca } from "./types";

interface Props {
  peca: ProjetoPeca;
  onQty: (id: string, qty: number) => void;
  onRemove: (id: string) => void;
}

export default function PecaRow({ peca, onQty, onRemove }: Props) {
  const [confirm, setConfirm] = useState(false);

  return (
    <div className="flex items-start gap-5 py-5 border-b border-western-stone-warm/15">
      <div
        className="w-20 h-20 flex-shrink-0"
        style={{
          background:
            "linear-gradient(135deg, hsl(var(--western-cream-muted) / 0.5), hsl(var(--western-cream)))",
        }}
      />
      <div className="flex-1 min-w-0">
        <h4 className="font-display text-[18px] text-western-green-deep leading-tight">{peca.nome}</h4>
        <p className="font-mono text-[11px] uppercase tracking-[0.15em] text-western-stone-warm/70 mt-1">
          {peca.codigo} · {peca.pesoKg} kg · {peca.dim}
        </p>
        <p className="font-sans text-[14px] text-western-stone-warm mt-1.5">{formatPreco(peca.preco)}</p>
      </div>
      <div className="flex flex-col items-end gap-2">
        <div className="inline-flex items-center border border-western-stone-warm/30">
          <button
            type="button"
            onClick={() => onQty(peca.id, Math.max(0, peca.qty - 1))}
            className="w-9 h-9 flex items-center justify-center text-western-green-deep hover:bg-western-cream"
            aria-label="Diminuir"
          >
            <Minus className="h-3.5 w-3.5" />
          </button>
          <span className="w-9 text-center font-display text-base text-western-green-deep">{peca.qty}</span>
          <button
            type="button"
            onClick={() => onQty(peca.id, peca.qty + 1)}
            className="w-9 h-9 flex items-center justify-center text-western-green-deep hover:bg-western-cream"
            aria-label="Aumentar"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
        </div>
        {confirm ? (
          <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em]">
            <span className="text-western-stone-warm">Remover?</span>
            <button
              onClick={() => onRemove(peca.id)}
              className="text-western-green-deep underline"
              type="button"
            >
              Sim
            </button>
            <button
              onClick={() => setConfirm(false)}
              className="text-western-stone-warm/70"
              type="button"
            >
              Cancelar
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setConfirm(true)}
            className="font-mono text-[10px] uppercase tracking-[0.2em] text-western-stone-warm/80 hover:text-western-green-deep"
          >
            Remover ×
          </button>
        )}
      </div>
    </div>
  );
}
