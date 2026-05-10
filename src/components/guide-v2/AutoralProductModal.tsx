import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Check, ChevronDown, Plus, X } from "lucide-react";
import { formatPreco } from "@/data/guideMap";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import type { AutoralItem } from "./autoraisCatalog";

interface Props {
  item: AutoralItem | null;
  index: number;
  selected: boolean;
  onClose: () => void;
  onToggle: () => void;
}

function splitDescricao(d?: string): { resumo: string; resto: string } {
  if (!d) return { resumo: "", resto: "" };
  const clean = d.replace(/\s+/g, " ").trim();
  // Primeira frase (até primeiro ponto seguido de espaço/fim)
  const m = clean.match(/^(.+?[.!?])(\s+|$)/);
  if (!m) return { resumo: clean, resto: "" };
  return { resumo: m[1], resto: clean.slice(m[0].length).trim() };
}

export default function AutoralProductModal({ item, selected, onClose, onToggle }: Props) {
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
      <DialogContent className="max-w-[560px] p-0 bg-western-cream border-0 overflow-hidden gap-0">
        {item && (
          <>
            <div className="h-[3px] bg-western-gold" />
            <div className="grid grid-cols-1 md:grid-cols-[5fr_6fr]">
              {/* Imagem */}
              <div className="relative aspect-square md:aspect-auto bg-western-paper overflow-hidden">
                {item.imageUrl ? (
                  <img
                    src={item.imageUrl}
                    alt={item.nome}
                    className="w-full h-full object-contain p-5"
                  />
                ) : (
                  <div className="w-full h-full bg-western-paper" />
                )}
              </div>

              {/* Conteúdo */}
              <div className="relative p-6 md:p-7 flex flex-col">
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Fechar"
                  className="absolute top-3 right-3 inline-flex items-center justify-center w-8 h-8 text-western-stone-warm hover:text-western-green-deep transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>

                <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-western-gold mb-2">
                  {item.codigo} · Item autoral
                </p>
                <h3 className="font-display text-[22px] text-western-green-deep leading-tight pr-8">
                  {item.nome}
                </h3>
                <div className="w-8 h-px bg-western-gold mt-3 mb-3" />

                {/* Preço — destaque imediato */}
                {isApproved ? (
                  <p className="font-display text-[26px] text-western-green-deep leading-none">
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

                {/* Resumo */}
                {resumo && (
                  <p className="font-display italic text-[13.5px] text-western-stone-warm leading-relaxed mt-4">
                    {resumo}
                  </p>
                )}

                {/* Specs em linha */}
                {specs && (
                  <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-western-stone-warm/90 mt-4">
                    {specs}
                  </p>
                )}

                {/* CTA */}
                <button
                  type="button"
                  onClick={() => { onToggle(); onClose(); }}
                  className={cn(
                    "mt-5 inline-flex items-center justify-center gap-2 h-11 font-mono text-[11px] uppercase tracking-[0.22em] transition-colors",
                    selected
                      ? "bg-western-green-deep text-western-cream"
                      : "bg-western-gold text-western-green-deep hover:bg-western-gold-soft"
                  )}
                >
                  {selected ? (
                    <><Check className="h-3.5 w-3.5" /> Remover do projeto</>
                  ) : (
                    <><Plus className="h-3.5 w-3.5" /> Adicionar ao projeto</>
                  )}
                </button>

                {/* Mais detalhes — colapsado */}
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
