import { useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { ChevronDown, Minus, Plus, Trash2, X } from "lucide-react";
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

/**
 * Detalhe da peça autoral — DS V3.
 * Sem mono e sem itálico display: eyebrow bronze 14px, corpo 17px, meta 14px.
 * CTA primário VERDE (btn-primary) — o dourado sai de cena aqui, porque o
 * fundo é claro e o verde tem o contraste. Controles com 52px de altura.
 *
 * O `DialogContent` do shadcn já injeta um botão de fechar minúsculo (16px) no
 * canto — abaixo do mínimo de toque. Ele é o ÚLTIMO filho do content, então
 * `[&>button:last-child]:hidden` o esconde e nós desenhamos um X de 48px.
 */
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
      <DialogContent className="w-[calc(100%-24px)] max-w-[580px] gap-0 overflow-hidden rounded-2xl border-0 bg-western-ivory p-0 [&>button:last-child]:hidden">
        {item && (
          <>
            {/* Fechar — 48px, o mínimo de toque do sistema */}
            <button
              type="button"
              onClick={onClose}
              aria-label="Fechar"
              className="tap-target absolute right-3 top-3 z-20 inline-flex items-center justify-center rounded-lg border border-western-border-soft bg-western-ivory/95 text-western-green-deep backdrop-blur-sm transition-colors hover:bg-white"
            >
              <X className="h-5 w-5" aria-hidden />
            </button>

            <div className="grid grid-cols-1 md:grid-cols-[5fr_6fr]">
              {/* Imagem */}
              <div className="relative aspect-square overflow-hidden border-b border-western-border-soft bg-western-paper md:aspect-auto md:border-b-0 md:border-r">
                {item.imageUrl ? (
                  <img
                    src={item.imageUrl}
                    alt={item.nome}
                    className="h-full w-full object-contain p-6"
                  />
                ) : (
                  <div className="h-full w-full bg-western-paper" />
                )}
              </div>

              {/* Conteúdo */}
              <div className="relative flex flex-col p-6 md:p-7">
                <p className="text-eyebrow pr-14">{item.codigo} · Peça autoral</p>

                {/* Archivo 650 — só aqui, porque é o único título ≥22px do modal.
                    Utilities explícitas: as classes-base do DialogTitle (text-lg)
                    vivem em @layer utilities e venceriam um `.display-md`. */}
                <DialogTitle className="mt-2 pr-14 text-left font-display text-[22px] font-[650] leading-tight tracking-[-0.01em] text-western-green-deep md:text-[26px]">
                  {item.nome}
                </DialogTitle>

                {/* Preço */}
                <div className="mt-4">
                  {isApproved ? (
                    <p className="text-price">{formatPreco(item.preco)}</p>
                  ) : (
                    <>
                      <p className="text-eyebrow">Preço de parceiro</p>
                      <Link
                        to={session ? "/minha-conta" : "/parceiro/login"}
                        className="tap-target -ml-1 mt-0.5 inline-flex items-center gap-1.5 rounded-lg px-1 font-sans text-[16px] font-semibold text-western-green-deep underline underline-offset-4 transition-colors hover:text-western-cta"
                      >
                        Acessar para ver o preço
                      </Link>
                    </>
                  )}
                </div>

                {resumo && <p className="text-body mt-4">{resumo}</p>}

                {specs && <p className="text-meta mt-3">{specs}</p>}

                {/* CTA / Stepper */}
                <div className="mt-6">
                  {selected ? (
                    <div className="flex items-stretch gap-2">
                      <div className="inline-flex flex-1 items-center justify-between overflow-hidden rounded-lg border border-western-border-strong bg-white">
                        <button
                          type="button"
                          onClick={() => onSetQty(Math.max(1, qty - 1))}
                          disabled={qty <= 1}
                          aria-label="Diminuir quantidade"
                          className="inline-flex h-control w-[52px] items-center justify-center text-western-green-deep transition-colors hover:bg-western-paper disabled:opacity-30"
                        >
                          <Minus className="h-4 w-4" aria-hidden />
                        </button>
                        <span className="font-sans text-[16px] font-semibold tabular-nums text-western-green-deep">
                          {qty} no projeto
                        </span>
                        <button
                          type="button"
                          onClick={() => onSetQty(qty + 1)}
                          aria-label="Aumentar quantidade"
                          className="inline-flex h-control w-[52px] items-center justify-center text-western-green-deep transition-colors hover:bg-western-paper"
                        >
                          <Plus className="h-4 w-4" aria-hidden />
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => { onToggle(); onClose(); }}
                        aria-label="Remover peça do projeto"
                        className="inline-flex h-control w-[52px] flex-shrink-0 items-center justify-center rounded-lg border border-western-border-strong text-western-stone-warm transition-colors hover:border-western-green-deep hover:text-western-green-deep"
                      >
                        <Trash2 className="h-5 w-5" aria-hidden />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => onSetQty(1)}
                      className="btn-primary w-full"
                    >
                      <Plus className="h-5 w-5" aria-hidden /> Adicionar ao projeto
                    </button>
                  )}
                </div>

                {/* Mais detalhes */}
                {resto && (
                  <div className="mt-5 border-t border-western-border-soft pt-3">
                    <button
                      type="button"
                      onClick={() => setShowMais((v) => !v)}
                      aria-expanded={showMais}
                      className="tap-target -ml-2 inline-flex items-center gap-2 rounded-lg px-2 font-sans text-[16px] font-semibold text-western-green-deep transition-colors hover:text-western-cta"
                    >
                      <ChevronDown
                        className={cn("h-4 w-4 transition-transform", showMais && "rotate-180")}
                        aria-hidden
                      />
                      {showMais ? "Menos detalhes" : "Mais detalhes"}
                    </button>
                    {showMais && <p className="text-body animate-fade-in mt-2">{resto}</p>}
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
