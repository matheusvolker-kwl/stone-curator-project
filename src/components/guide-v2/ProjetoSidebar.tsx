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
    <div className="bg-card border border-western-stone-warm/20 p-7 flex flex-col gap-5">
      <div>
        <p className="text-eyebrow mb-2">Seu projeto</p>
        <h3 className="font-display text-[20px] text-western-green-deep leading-tight">{conjunto.nome}</h3>
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-western-stone-warm/70 mt-1">
          Acabamento {acabamentoMeta[acabamento].label}
        </p>
      </div>

      <div className="border-t border-western-stone-warm/15 pt-4">
        <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-western-stone-warm mb-2">
          Composição base
        </p>
        <ul className="space-y-1">
          {pecas.map((p) => (
            <li key={p.id} className="flex justify-between text-[13px] text-western-green-deep/90">
              <span className="truncate pr-2">{p.nome}</span>
              <span className="font-mono">{p.qty}×</span>
            </li>
          ))}
        </ul>

        {extras.length > 0 && (
          <>
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-western-stone-warm mt-4 mb-2">
              Peças adicionadas
            </p>
            <ul className="space-y-1">
              {extras.map((e) => (
                <li key={e.id} className="flex justify-between text-[13px] text-western-green-deep/90">
                  <span className="truncate pr-2">{e.nome}</span>
                  <span className="font-mono">{e.qty}×</span>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>

      {isApproved ? (
        <>
          <div className="border-t border-western-stone-warm/15 pt-4 space-y-1.5 text-[14px]">
            <div className="flex justify-between text-western-stone-warm">
              <span>Subtotal composição</span>
              <span>{formatPreco(subBase)}</span>
            </div>
            {subExtras > 0 && (
              <div className="flex justify-between text-western-stone-warm">
                <span>Peças adicionais</span>
                <span>{formatPreco(subExtras)}</span>
              </div>
            )}
            <div className="flex justify-between text-western-stone-warm">
              <span>Desconto conjunto (3%)</span>
              <span>−{formatPreco(desconto)}</span>
            </div>
          </div>

          <div className="border-t border-western-stone-warm/15 pt-4">
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-western-stone-warm mb-1">
              Total
            </p>
            <p className="font-display text-[28px] font-medium text-western-green-deep leading-none">
              {formatPreco(total)}
            </p>
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-western-stone-warm/70 mt-2">
              Pedido único · frete otimizado
            </p>
          </div>
        </>
      ) : (
        <div className="border border-western-gold/40 bg-western-gold/5 p-4">
          <p className="text-eyebrow flex items-center gap-2 mb-2">
            <Lock className="h-3 w-3" /> Preços para parceiros
          </p>
          <p className="text-[13px] text-western-green-deep mb-3">
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

      <div className="flex flex-col gap-2.5">
        <button
          type="button"
          onClick={onFinalizar}
          disabled={!isApproved}
          className="btn-dark w-full h-[52px] disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Revisar e finalizar projeto <ArrowRight className="h-4 w-4" />
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
          className="text-[13px] text-western-stone-warm hover:text-western-green-deep underline-offset-4 hover:underline"
        >
          Salvar projeto e decidir depois
        </button>
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
      {/* Desktop: sticky */}
      <aside className="hidden lg:block sticky top-24 self-start">
        <PanelBody {...props} />
      </aside>

      {/* Mobile: barra fixa + sheet */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <button
            type="button"
            className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-western-green-deep text-western-cream h-20 px-5 flex items-center justify-between shadow-[0_-8px_24px_-12px_rgba(0,0,0,0.3)]"
          >
            <div className="text-left">
              <div className="font-mono text-[10px] uppercase tracking-[0.2em] opacity-70">Seu projeto</div>
              <div className="font-display text-lg leading-tight">
                {isApproved ? formatPreco(total) : "Preço para parceiros"}
              </div>
            </div>
            <span className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.22em] bg-western-gold text-western-green-deep px-4 py-2.5">
              Ver projeto ({totalQty})
            </span>
          </button>
        </SheetTrigger>
        <SheetContent side="bottom" className="h-[90vh] overflow-y-auto bg-western-cream p-6">
          <PanelBody {...props} />
        </SheetContent>
      </Sheet>
    </>
  );
}
