import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Check, Plus } from "lucide-react";
import { formatPreco } from "@/data/guideMap";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "react-router-dom";
import type { AutoralItem } from "./autoraisCatalog";

interface Props {
  item: AutoralItem | null;
  index: number;
  selected: boolean;
  onClose: () => void;
  onToggle: () => void;
}

export default function AutoralProductModal({ item, selected, onClose, onToggle }: Props) {
  const { isApproved, session } = useAuth();
  const open = !!item;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-[640px] p-0 bg-western-cream border-0 overflow-hidden">
        {item && (
          <>
            <div className="h-[3px] bg-western-gold" />
            <div className="grid grid-cols-1 md:grid-cols-[1fr_1.1fr]">
              <div className="aspect-[4/3] md:aspect-auto bg-western-paper overflow-hidden">
                {item.imageUrl ? (
                  <img src={item.imageUrl} alt={item.nome} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-western-paper" />
                )}
              </div>
              <div className="p-7 md:p-8 flex flex-col">
                <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-western-gold mb-2">
                  {item.codigo} · Item autoral
                </p>
                <h3 className="font-display text-[26px] text-western-green-deep leading-tight">
                  {item.nome}
                </h3>
                <div className="w-10 h-px bg-western-gold mt-4 mb-4" />
                <p className="font-display italic text-[14px] text-western-stone-warm leading-relaxed">
                  {item.descricao}
                </p>

                <dl className="mt-5 space-y-1.5 font-mono text-[11px] uppercase tracking-[0.18em] text-western-stone-warm">
                  <div className="flex justify-between">
                    <dt>Peso</dt>
                    <dd className="text-western-green-deep">{item.pesoKg} kg</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt>Dimensões</dt>
                    <dd className="text-western-green-deep">{item.dim}</dd>
                  </div>
                </dl>

                <div className="mt-6 pt-5 border-t border-western-stone-warm/15">
                  {isApproved ? (
                    <p className="font-display text-[28px] text-western-green-deep leading-none">
                      {formatPreco(item.preco)}
                    </p>
                  ) : (
                    <div>
                      <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-western-stone-warm">
                        Preço para parceiros
                      </p>
                      <Link
                        to={session ? "/minha-conta" : "/parceiro/login"}
                        className="font-mono text-[11px] uppercase tracking-[0.22em] text-western-gold hover:text-western-green-deep transition-colors mt-1 inline-block"
                      >
                        Acessar para ver preço →
                      </Link>
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    onToggle();
                    onClose();
                  }}
                  className={
                    selected
                      ? "mt-6 inline-flex items-center justify-center gap-2 h-12 bg-western-green-deep text-western-cream font-mono text-[11px] uppercase tracking-[0.22em]"
                      : "mt-6 inline-flex items-center justify-center gap-2 h-12 bg-western-gold text-western-green-deep font-mono text-[11px] uppercase tracking-[0.22em] hover:bg-western-gold-soft transition-colors"
                  }
                >
                  {selected ? (
                    <><Check className="h-3.5 w-3.5" /> Remover do projeto</>
                  ) : (
                    <><Plus className="h-3.5 w-3.5" /> Adicionar ao projeto</>
                  )}
                </button>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
