import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Check, ChevronDown, Minus, Plus, Trash2, X } from "lucide-react";
import { formatPreco } from "@/data/guideMap";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import type { AutoralItem } from "./autoraisCatalog";

interface Props {
  item: AutoralItem | null;
  index: number;
  selected: boolean;
  qty: number;
  onClose: () => void;
  onToggle: () => void;
  onSetQty: (qty: number) => void;
}

function splitDescricao(d?: string): { resumo: string; resto: string } {
  if (!d) return { resumo: "", resto: "" };
  const clean = d.replace(/\s+/g, " ").trim();
  const m = clean.match(/^(.+?[.!?])(\s+|$)/);
  if (!m) return { resumo: clean, resto: "" };
  return { resumo: m[1], resto: clean.slice(m[0].length).trim() };
}

export default function AutoralProductModal({ item, selected, qty, onClose, onToggle, onSetQty }: Props) {
  const { isApproved, session } = useAuth();
  const [showMais, setShowMais] = useState(false);
  const open = !!item;

  const { resumo, resto } = splitDescricao(item?.descricao);
  const specs = [
    item?.pesoKg ? `${item.pesoKg} kg` : null,
    item?.dim && item.dim !== "—" ? item.dim : null,
  ].filter(Boolean).join(" · ");

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) {
          setShowMais(false);
          onClose();
        }
      }}
    >
      <DialogContent className="max-w-[580px] p-0 bg-western-cream border-0 overflow-hidden gap-0">
        {item && (
          <>
            {/* Botão fechar — flutuante acima de tudo */}
            <button
              type="button"
              onClick={onClose}
              aria-label="Fechar"
              className="absolute top-3 right-3 z-20 inline-flex items-center justify-center w-8 h-8 rounded-full bg-western-cream/95 backdrop-blur-sm text-western-stone-warm hover:text-western-green-deep hover:bg-white shadow-sm transition-colors"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="grid grid-cols-1 md:grid-cols-[5fr_6fr]">
              {/* Imagem */}
              <div className="relative aspect-square md:aspect-auto bg-western-paper overflow-hidden border-r border-western-stone-warm/10">
                {item.imageUrl ? (
                  <img
                    src={item.imageUrl}
                    alt={item.nome}
                    className="w-full h-full object-contain p-6"
                  />
                ) : (
                  <div className="w-full h-full bg-western-paper" />
                )}
              </div>

              {/* Conteúdo */}
              <div className="relative p-6 md:p-7 flex flex-col">
                <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-western-gold mb-2 pr-8">
                  {item.codigo} · Item autoral
                </p>
                <h3 className="font-display text-[24px] text-western-green-deep leading-tight pr-8">
                  {item.nome}
                </h3>
                <div className="w-8 h-px bg-western-gold mt-3 mb-4" />

                {/* Preço */}
                {isApproved ? (
                  <p className="font-display text-[28px] text-western-green-deep leading-none">
                    {formatPreco(item.preco)}
                  </p>
                ) : (
                  <div>
                    <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-western-stone-warm">
                      Preço para parceiros
                    </p>
                    <Link
                      to={session ? "/minha-conta" : "/parceiro/login"}
                      className="font-mono text-[10px] uppercase tracking-[0.22em] text-western-gold hover:text-western-green-deep transition-colors mt-1 inline-block"
                    >
                      Acessar para ver preço →
                    </Link>
                  </div>
                )}

                {resumo && (
                  <p className="font-display italic text-[13.5px] text-western-stone-warm leading-relaxed mt-4">
                    {resumo}
                  </p>
                )}

                {specs && (
                  <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-western-stone-warm/90 mt-4">
                    {specs}
                  </p>
                )}

                {/* CTA / Stepper */}
                <div className="mt-5">
                  {selected ? (
                    <div className="flex items-stretch gap-2">
                      {/* Stepper */}
                      <div className="flex-1 inline-flex items-center justify-between border border-western-green-deep bg-white">
                        <button
                          type="button"
                          onClick={() => onSetQty(Math.max(1, qty - 1))}
                          disabled={qty <= 1}
                          aria-label="Diminuir"
                          className="w-11 h-11 inline-flex items-center justify-center text-western-green-deep hover:bg-western-paper transition-colors disabled:opacity-30"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <div className="flex flex-col items-center">
                          <span className="font-display text-[20px] text-western-green-deep leading-none">{qty}</span>
                          <span className="font-mono text-[8px] uppercase tracking-[0.22em] text-western-stone-warm/70 mt-0.5">no projeto</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => onSetQty(qty + 1)}
                          aria-label="Aumentar"
                          className="w-11 h-11 inline-flex items-center justify-center text-western-green-deep hover:bg-western-paper transition-colors"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      {/* Remover */}
                      <button
                        type="button"
                        onClick={() => { onToggle(); onClose(); }}
                        aria-label="Remover do projeto"
                        className="w-11 h-11 inline-flex items-center justify-center border border-western-stone-warm/30 text-western-stone-warm hover:border-western-green-deep hover:text-western-green-deep transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => onSetQty(1)}
                      className="w-full inline-flex items-center justify-center gap-2 h-12 bg-western-gold text-western-green-deep font-mono text-[11px] uppercase tracking-[0.22em] hover:bg-western-gold-soft transition-colors"
                    >
                      <Plus className="h-3.5 w-3.5" /> Adicionar ao projeto
                    </button>
                  )}
                </div>

                {/* Mais detalhes */}
                {resto && (
                  <div className="mt-4 pt-4 border-t border-western-stone-warm/15">
                    <button
                      type="button"
                      onClick={() => setShowMais((v) => !v)}
                      className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.22em] text-western-stone-warm hover:text-western-green-deep transition-colors"
                    >
                      <ChevronDown
                        className={cn("h-3 w-3 transition-transform", showMais && "rotate-180")}
                      />
                      {showMais ? "Menos detalhes" : "Mais detalhes"}
                    </button>
                    {showMais && (
                      <p className="font-display italic text-[13px] text-western-stone-warm leading-relaxed mt-3 animate-fade-in">
                        {resto}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
