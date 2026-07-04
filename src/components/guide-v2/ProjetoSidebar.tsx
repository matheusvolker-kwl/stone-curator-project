import { useState } from "react";
import { Download, ExternalLink, Loader2, Lock } from "lucide-react";
import { Link } from "react-router-dom";
import { formatPreco, type ConjuntoLeaf } from "@/data/guideMap";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from "@/hooks/useAuth";
import type { Acabamento, ProjetoExtra, ProjetoPeca } from "./types";
import { acabamentoMeta } from "./types";
import { toast } from "sonner";

interface Props {
  conjunto: ConjuntoLeaf;
  pecas: ProjetoPeca[];
  extras: ProjetoExtra[];
  acabamento: Acabamento;
  isCustomizado: boolean;
  onResetBase?: () => void;
  onFinalizar: () => void;
  onFinalizarCompra?: () => void;
  checkoutLoading?: boolean;
}

function PanelBody({
  conjunto,
  pecas,
  extras,
  acabamento,
  isCustomizado,
  onResetBase,
  onFinalizar,
  onFinalizarCompra,
  checkoutLoading = false,
}: Props) {
  const { isApproved, session } = useAuth();
  const subBase = pecas.reduce((a, p) => a + p.preco * p.qty, 0);
  const subExtras = extras.reduce((a, e) => a + e.preco * e.qty, 0);
  const total = subBase + subExtras;

  return (
    <div className="surface-forest shadow-[0_36px_56px_-30px_hsl(var(--western-stone-dark)/0.45)] flex flex-col relative overflow-hidden">
      <div className="h-[3px] bg-western-gold" />
      <div className="p-6 flex flex-col gap-4">
        {/* Badge curado / sob consulta */}
        <div
          className={
            isCustomizado
              ? "inline-flex items-center gap-2 self-start px-2.5 py-1 border border-western-gold/60 text-western-gold font-mono text-[9px] uppercase tracking-[0.22em]"
              : "inline-flex items-center gap-2 self-start px-2.5 py-1 bg-western-gold/15 border border-western-gold/50 text-western-gold-soft font-mono text-[9px] uppercase tracking-[0.22em]"
          }
        >
          ◆ {isCustomizado ? "Projeto autoral · sob consulta" : "Conjunto curado · SketchUp incluso"}
        </div>

        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-western-gold-soft mb-2">
            Seu projeto
          </p>
          <h3 className="font-display text-[20px] text-western-cream leading-tight">{conjunto.nome}</h3>
          <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-western-gold mt-1.5">
            Acabamento {acabamentoMeta[acabamento].label}
          </p>
        </div>

        <div className="border-t border-western-cream/15 pt-4">
          <p className="font-mono text-[9px] uppercase tracking-[0.25em] text-western-gold-soft mb-2">
            Composição base
          </p>
          <ul className="space-y-1">
            {pecas.map((p) => (
              <li key={p.id} className="flex justify-between text-[13px] text-western-cream/90">
                <span className="truncate pr-2">{p.nome}</span>
                <span className="font-sans tabular-nums text-western-cream-muted">{p.qty}×</span>
              </li>
            ))}
          </ul>

          {extras.length > 0 && (
            <>
              <p className="font-mono text-[9px] uppercase tracking-[0.25em] text-western-gold-soft mt-4 mb-2">
                Peças adicionadas
              </p>
              <ul className="space-y-1">
                {extras.map((e) => (
                  <li key={e.id} className="flex justify-between text-[13px] text-western-cream/90">
                    <span className="truncate pr-2">{e.nome}</span>
                    <span className="font-sans tabular-nums text-western-cream-muted">{e.qty}×</span>
                  </li>
                ))}
              </ul>
            </>
          )}

          {isCustomizado && onResetBase && (
            <button
              type="button"
              onClick={onResetBase}
              className="mt-3 font-mono text-[10px] uppercase tracking-[0.22em] text-western-cream-muted hover:text-western-gold underline-offset-4 hover:underline"
            >
              ← Voltar à composição original
            </button>
          )}
        </div>

        {isApproved ? (
          <>
            <div className="border-t border-western-cream/15 pt-4 space-y-1.5 text-[13px]">
              <div className="flex justify-between text-western-cream-muted">
                <span>Subtotal composição</span>
                <span className="font-sans tabular-nums">{formatPreco(subBase)}</span>
              </div>
              {subExtras > 0 && (
                <div className="flex justify-between text-western-cream-muted">
                  <span>Peças adicionais</span>
                  <span className="font-sans tabular-nums">{formatPreco(subExtras)}</span>
                </div>
              )}
            </div>

            <div className="border-t border-western-cream/15 pt-4">
              <p className="font-mono text-[9px] uppercase tracking-[0.25em] text-western-gold-soft mb-1.5">
                {isCustomizado ? "Total estimado" : "Total"}
              </p>
              <p className="font-display text-[30px] font-medium text-western-cream leading-none">
                {formatPreco(total)}
              </p>
              <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-western-cream-muted/80 mt-2">
                {isCustomizado ? "Confirmado pela equipe em até 3 dias úteis" : "Pedido único · frete otimizado"}
              </p>
            </div>
          </>
        ) : (
          <div className="border border-western-gold/40 bg-western-gold/10 p-4">
            <p className="font-mono text-[9px] uppercase tracking-[0.25em] text-western-gold flex items-center gap-2 mb-1.5">
              <Lock className="h-3 w-3" /> Preços para parceiros
            </p>
            <p className="text-[12.5px] text-western-cream mb-3 leading-relaxed">
              Acesse para visualizar valores e finalizar o projeto.
            </p>
            <div className="flex flex-col gap-2">
              <Link
                to={session ? "/minha-conta" : "/parceiro/login"}
                className="inline-flex items-center justify-center gap-2 h-10 px-4 bg-western-gold text-western-green-deep font-mono text-[10px] uppercase tracking-[0.22em] hover:bg-western-gold-soft transition-colors"
              >
                Acessar para ver preço
              </Link>
              <Link
                to="/parceiro/cadastro"
                className="inline-flex items-center justify-center gap-2 h-10 px-4 border border-western-cream/40 text-western-cream font-mono text-[10px] uppercase tracking-[0.22em] hover:border-western-gold transition-colors"
              >
                Solicitar cadastro B2B
              </Link>
            </div>
          </div>
        )}

        <div className="flex flex-col gap-2.5">
          {isApproved && !isCustomizado && onFinalizarCompra ? (
            <button
              type="button"
              onClick={onFinalizarCompra}
              disabled={checkoutLoading}
              className="inline-flex items-center justify-center gap-3 h-12 bg-gradient-to-b from-western-gold to-western-gold/90 text-western-green-deep font-sans font-medium text-[14px] tracking-[0.02em] hover:from-western-gold-soft hover:to-western-gold transition-colors shadow-[0_18px_40px_-20px_rgba(184,146,79,0.7)] disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {checkoutLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Finalizar compra"}
              {!checkoutLoading && <ExternalLink className="h-4 w-4" />}
            </button>
          ) : (
            <button
              type="button"
              onClick={onFinalizar}
              disabled={!isApproved && !isCustomizado}
              className="inline-flex items-center justify-center gap-3 h-12 bg-gradient-to-b from-western-gold to-western-gold/90 text-western-green-deep font-sans font-medium text-[14px] tracking-[0.02em] hover:from-western-gold-soft hover:to-western-gold transition-colors shadow-[0_18px_40px_-20px_rgba(184,146,79,0.7)] disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isCustomizado ? "Solicitar orçamento sob consulta" : "Baixar composição (PDF)"}
              <Download className="h-4 w-4" />
            </button>
          )}
          {isApproved && !isCustomizado && (
            <button
              type="button"
              onClick={onFinalizar}
              className="inline-flex items-center justify-center gap-2 h-10 border border-western-cream/40 text-western-cream font-sans text-[12.5px] hover:border-western-gold hover:text-western-gold transition-colors"
            >
              <Download className="h-3.5 w-3.5" /> Baixar composição (PDF)
            </button>
          )}
          {!isCustomizado && (
            <button
              type="button"
              onClick={() => toast("Prévia em SketchUp em breve.")}
              className="inline-flex items-center justify-center gap-2 h-10 border border-western-cream/40 text-western-cream font-sans text-[12.5px] hover:border-western-gold hover:text-western-gold transition-colors"
            >
              <Download className="h-3.5 w-3.5" /> Baixar prévia em SketchUp
            </button>
          )}
          <button
            type="button"
            onClick={() => toast(session ? "Projeto salvo no seu painel." : "Faça login para salvar o projeto.")}
            className="text-[12px] text-western-cream-muted hover:text-western-cream underline-offset-4 hover:underline self-center"
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
  const total = subBase + subExtras;
  const { isApproved } = useAuth();

  return (
    <>
      <aside className="hidden lg:block lg:sticky lg:top-[calc(var(--guide-sticky-top,0px)+1.25rem)] self-start">
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
            <span className="inline-flex items-center gap-2 font-sans font-medium text-[13px] bg-western-gold text-western-green-deep px-4 py-2.5">
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
