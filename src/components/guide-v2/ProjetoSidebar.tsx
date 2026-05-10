import { useState } from "react";
import { ArrowRight, Download } from "lucide-react";
import { Link } from "react-router-dom";
import { formatPreco, type ConjuntoLeaf } from "@/data/guideMap";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from "@/hooks/useAuth";
import { Lock } from "lucide-react";
import type { Acabamento, ProjetoExtra, ProjetoPeca } from "./types";
import { acabamentoMeta } from "./types";
import { toast } from "sonner";

interface Props {
  conjunto: ConjuntoLeaf;
  pecas: ProjetoPeca[];
  extras: ProjetoExtra[];
  acabamento: Acabamento;
  onFinalizar: () => void;
}

function PanelBody({ conjunto, pecas, extras, acabamento, onFinalizar }: Props) {
  const { isApproved, session } = useAuth();
  const subBase = pecas.reduce((a, p) => a + p.preco * p.qty, 0);
  const subExtras = extras.reduce((a, e) => a + e.preco * e.qty, 0);
  const desconto = Math.round(subBase * 0.03);
  const total = subBase + subExtras - desconto;

  return (
    <div className="bg-white border border-western-stone-warm/15 shadow-[0_30px_50px_-32px_hsl(var(--western-stone-dark)/0.25)] flex flex-col">
      {/* gold hairline top */}
      <div className="h-[3px] bg-western-gold" />
      <div className="p-7 md:p-8 flex flex-col gap-6">
        <div>
          <p className="text-eyebrow mb-3">Seu projeto</p>
          <h3 className="font-display text-[22px] text-western-green-deep leading-tight">{conjunto.nome}</h3>
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-western-gold mt-2">
            Acabamento {acabamentoMeta[acabamento].label}
          </p>
        </div>

        <div className="border-t border-western-stone-warm/15 pt-5">
          <p className="text-eyebrow mb-3">Composição base</p>
          <ul className="space-y-1.5">
            {pecas.map((p) => (
              <li key={p.id} className="flex justify-between text-[13px] text-western-green-deep/90">
                <span className="truncate pr-2">{p.nome}</span>
                <span className="font-mono text-western-stone-warm">{p.qty}×</span>
              </li>
            ))}
          </ul>

          {extras.length > 0 && (
            <>
              <p className="text-eyebrow mt-5 mb-3">Peças adicionadas</p>
              <ul className="space-y-1.5">
                {extras.map((e) => (
                  <li key={e.id} className="flex justify-between text-[13px] text-western-green-deep/90">
                    <span className="truncate pr-2">{e.nome}</span>
                    <span className="font-mono text-western-stone-warm">{e.qty}×</span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>

        {isApproved ? (
          <>
            <div className="border-t border-western-stone-warm/15 pt-5 space-y-2 text-[14px]">
              <div className="flex justify-between text-western-stone-warm">
                <span>Subtotal composição</span>
                <span className="font-mono">{formatPreco(subBase)}</span>
              </div>
              {subExtras > 0 && (
                <div className="flex justify-between text-western-stone-warm">
                  <span>Peças adicionais</span>
                  <span className="font-mono">{formatPreco(subExtras)}</span>
                </div>
              )}
              <div className="flex justify-between text-western-gold">
                <span>Desconto conjunto (3%)</span>
                <span className="font-mono">−{formatPreco(desconto)}</span>
              </div>
            </div>

            <div className="border-t border-western-stone-warm/15 pt-5">
              <p className="text-eyebrow mb-2">Total</p>
              <p className="font-display text-[34px] font-medium text-western-green-deep leading-none">
                {formatPreco(total)}
              </p>
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-western-stone-warm/70 mt-2.5">
                Pedido único · frete otimizado
              </p>
            </div>
          </>
        ) : (
          <div className="border border-western-gold/40 bg-western-gold/5 p-5">
            <p className="text-eyebrow flex items-center gap-2 mb-2">
              <Lock className="h-3 w-3" /> Preços para parceiros
            </p>
            <p className="text-[13px] text-western-green-deep mb-4 leading-relaxed">
              Acesse para visualizar valores e finalizar o projeto.
            </p>
            <div className="flex flex-col gap-2">
              <Link to={session ? "/minha-conta" : "/parceiro/login"} className="btn-dark w-full text-[10px]">
                Acessar para ver preço
              </Link>
              <Link to="/parceiro/cadastro" className="btn-outline-forest w-full text-[10px]">
                Solicitar cadastro B2B
              </Link>
            </div>
          </div>
        )}

        <div className="flex flex-col gap-3">
          <button
            type="button"
            onClick={onFinalizar}
            disabled={!isApproved}
            className="btn-dark w-full h-[54px] disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Revisar e finalizar <ArrowRight className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => toast("Prévia em SketchUp em breve.")}
            className="inline-flex items-center justify-center gap-2 h-11 border border-western-green-deep text-western-green-deep font-mono text-[11px] uppercase tracking-[0.22em] hover:bg-western-green-deep hover:text-western-cream transition-colors"
          >
            <Download className="h-3.5 w-3.5" /> Baixar prévia em SketchUp
          </button>
          <button
            type="button"
            onClick={() => toast(session ? "Projeto salvo no seu painel." : "Faça login para salvar o projeto.")}
            className="text-[12px] text-western-stone-warm hover:text-western-green-deep underline-offset-4 hover:underline self-center mt-1"
          >
            Salvar projeto e decidir depois
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ProjetoSidebar(props: Props) {
  const [open, setOpen] = useState(false);
  const totalQty =
    props.pecas.reduce((a, p) => a + p.qty, 0) + props.extras.reduce((a, e) => a + e.qty, 0);
  const subBase = props.pecas.reduce((a, p) => a + p.preco * p.qty, 0);
  const subExtras = props.extras.reduce((a, e) => a + e.preco * e.qty, 0);
  const total = subBase + subExtras - Math.round(subBase * 0.03);
  const { isApproved } = useAuth();

  return (
    <>
      <aside className="hidden lg:block sticky top-24 self-start">
        <PanelBody {...props} />
      </aside>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <button
            type="button"
            className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-western-green-deep text-western-cream h-20 px-5 flex items-center justify-between shadow-[0_-8px_24px_-12px_rgba(0,0,0,0.3)]"
          >
            <div className="text-left">
              <div className="font-mono text-[10px] uppercase tracking-[0.22em] opacity-70">Seu projeto</div>
              <div className="font-display text-lg leading-tight mt-0.5">
                {isApproved ? formatPreco(total) : "Preço para parceiros"}
              </div>
            </div>
            <span className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.22em] bg-western-gold text-western-green-deep px-4 py-2.5">
              Ver projeto ({totalQty})
            </span>
          </button>
        </SheetTrigger>
        <SheetContent side="bottom" className="h-[90vh] overflow-y-auto bg-western-ivory p-6">
          <PanelBody {...props} />
        </SheetContent>
      </Sheet>
    </>
  );
}
