import { useState } from "react";
import { Download, ExternalLink, FileText, Loader2, Lock, ShieldCheck, Truck } from "lucide-react";
import { Link } from "react-router-dom";
import { formatPreco, type ConjuntoLeaf } from "@/data/guideMap";
import { BUSINESS } from "@/config/business";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import type { Acabamento, ProjetoExtra, ProjetoPeca } from "./types";
import { acabamentoMeta } from "./types";
import { toast } from "sonner";

export interface ProjetoMeta {
  conjuntoHandle?: string;
  conjuntoNome?: string;
  tipoVisual?: string;
  areaM2?: number;
  nivel?: string;
}

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
  projetoMeta?: ProjetoMeta;
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
  projetoMeta,
}: Props) {
  const { isApproved, session, user } = useAuth();
  const subBase = pecas.reduce((a, p) => a + p.preco * p.qty, 0);
  const subExtras = extras.reduce((a, e) => a + e.preco * e.qty, 0);
  const total = subBase + subExtras;
  const [salvando, setSalvando] = useState(false);

  const handleSalvar = async () => {
    if (salvando) return;
    setSalvando(true);
    const snapshot = {
      kind: "composicao_guia" as const,
      savedAt: new Date().toISOString(),
      acabamento: acabamentoMeta[acabamento].label,
      conjunto: conjunto.nome,
      ...projetoMeta,
      total,
      pecas: pecas.map((p) => ({
        id: p.id,
        nome: p.nome,
        qty: p.qty,
        preco: p.preco,
        variantId: (p as unknown as { variantId?: string }).variantId,
        productHandle: (p as unknown as { productHandle?: string }).productHandle,
      })),
      extras: extras.map((e) => ({
        id: e.id,
        nome: e.nome,
        qty: e.qty,
        preco: e.preco,
        variantId: (e as unknown as { variantId?: string }).variantId,
        productHandle: (e as unknown as { productHandle?: string }).productHandle,
      })),
    };
    try {
      if (user) {
        const { error } = await supabase.from("guide_exports").insert({
          user_id: user.id,
          payload: snapshot,
        });
        if (error) throw error;
        toast.success("Projeto salvo em Minha conta.");
      } else {
        const key = "western-projetos-salvos";
        const raw = localStorage.getItem(key);
        const arr = raw ? (JSON.parse(raw) as unknown[]) : [];
        const next = [snapshot, ...arr].slice(0, 20);
        localStorage.setItem(key, JSON.stringify(next));
        toast.success("Projeto salvo neste navegador.");
      }
    } catch (err) {
      console.warn("[salvar-projeto]", err);
      toast.error("Não foi possível salvar. Tente novamente.");
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div className="rounded-[16px] border border-western-border-soft bg-white overflow-hidden shadow-[0_24px_44px_-32px_hsl(var(--western-stone-dark)/0.35)]">
      <div className="h-[3px] bg-western-gold" />

      <div className="p-6 flex flex-col gap-5">
        {/* Selo curado / sob consulta */}
        <p
          className={
            isCustomizado
              ? "self-start inline-flex items-center rounded-[6px] border border-western-gold px-3 py-1.5 font-sans text-[14px] font-semibold tracking-[0.06em] text-western-bronze"
              : "self-start inline-flex items-center rounded-[6px] bg-western-gold/15 border border-western-gold/50 px-3 py-1.5 font-sans text-[14px] font-semibold tracking-[0.06em] text-western-bronze"
          }
        >
          ◆ {isCustomizado ? "Projeto autoral · sob consulta" : "Conjunto curado Western"}
        </p>

        <div>
          <p className="text-eyebrow mb-2">Seu projeto</p>
          <h3 className="display-md text-western-green-deep">{conjunto.nome}</h3>
          <p className="text-meta mt-2">Acabamento {acabamentoMeta[acabamento].label}</p>
        </div>

        <div className="border-t border-western-border-soft pt-5">
          <p className="text-eyebrow mb-3">Composição base</p>
          <ul className="space-y-2">
            {pecas.map((p) => (
              <li
                key={p.id}
                className="flex justify-between gap-3 font-sans text-[16px] text-western-stone-warm"
              >
                <span className="truncate">{p.nome}</span>
                <span className="font-semibold tabular-nums text-western-green-deep flex-shrink-0">
                  {p.qty}×
                </span>
              </li>
            ))}
          </ul>

          {extras.length > 0 && (
            <>
              <p className="text-eyebrow mt-5 mb-3">Peças adicionadas</p>
              <ul className="space-y-2">
                {extras.map((e) => (
                  <li
                    key={e.id}
                    className="flex justify-between gap-3 font-sans text-[16px] text-western-stone-warm"
                  >
                    <span className="truncate">{e.nome}</span>
                    <span className="font-semibold tabular-nums text-western-green-deep flex-shrink-0">
                      {e.qty}×
                    </span>
                  </li>
                ))}
              </ul>
            </>
          )}

          {isCustomizado && onResetBase && (
            <button
              type="button"
              onClick={onResetBase}
              className="tap-target mt-3 inline-flex items-center font-sans text-[16px] font-semibold text-western-green-deep underline underline-offset-4 hover:text-western-bronze transition-colors"
            >
              Voltar à composição original
            </button>
          )}
        </div>

        {isApproved ? (
          <>
            <div className="border-t border-western-border-soft pt-5 space-y-2">
              <div className="flex justify-between font-sans text-[16px] text-western-stone-warm">
                <span>Subtotal composição</span>
                <span className="tabular-nums">{formatPreco(subBase)}</span>
              </div>
              {subExtras > 0 && (
                <div className="flex justify-between font-sans text-[16px] text-western-stone-warm">
                  <span>Peças adicionais</span>
                  <span className="tabular-nums">{formatPreco(subExtras)}</span>
                </div>
              )}
            </div>

            <div className="border-t border-western-border-soft pt-5">
              <p className="text-eyebrow mb-2">{isCustomizado ? "Total estimado" : "Total"}</p>
              <p className="text-price">{formatPreco(total)}</p>
              <p className="text-meta mt-2">
                {isCustomizado
                  ? "Confirmado pela equipe em até 3 dias úteis"
                  : "Pedido único · frete otimizado"}
              </p>
            </div>
          </>
        ) : (
          <div className="rounded-[10px] border border-western-border-soft bg-western-paper p-5">
            <p className="text-eyebrow inline-flex items-center gap-2 mb-2">
              <Lock className="h-4 w-4" aria-hidden /> Preços para parceiros
            </p>
            <p className="text-body mb-4">Acesse para visualizar valores e finalizar o projeto.</p>
            <div className="flex flex-col gap-3">
              <Link to={session ? "/minha-conta" : "/parceiro/login"} className="btn-primary w-full">
                Acessar para ver preço
              </Link>
              <Link to="/parceiro/cadastro" className="btn-outline-forest w-full">
                Solicitar cadastro B2B
              </Link>
            </div>
          </div>
        )}

        <div className="flex flex-col gap-3">
          {isApproved && !isCustomizado && onFinalizarCompra ? (
            <button
              type="button"
              onClick={onFinalizarCompra}
              disabled={checkoutLoading}
              className="btn-primary w-full"
            >
              {checkoutLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
              ) : (
                <>
                  Finalizar orçamento <ExternalLink className="h-5 w-5" aria-hidden />
                </>
              )}
            </button>
          ) : (
            <button
              type="button"
              onClick={onFinalizar}
              disabled={!isApproved && !isCustomizado}
              className="btn-primary w-full"
            >
              {isCustomizado ? "Solicitar orçamento sob consulta" : "Baixar composição (PDF)"}
              <Download className="h-5 w-5" aria-hidden />
            </button>
          )}

          {isApproved && !isCustomizado && (
            <button type="button" onClick={onFinalizar} className="btn-outline-forest w-full">
              <Download className="h-5 w-5" aria-hidden /> Baixar composição (PDF)
            </button>
          )}

          <button
            type="button"
            onClick={handleSalvar}
            disabled={salvando}
            className="tap-target self-center font-sans text-[16px] text-western-stone-warm underline underline-offset-4 hover:text-western-green-deep transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {salvando ? "Salvando…" : "Salvar projeto e decidir depois"}
          </button>
        </div>

        {/* Faixa de confiança transacional — reduz o atrito no momento de fechar
            (análogo à faixa de pagamento). Ref. kit guia.jsx:159-163. */}
        <div className="border-t border-western-border-soft pt-5 flex flex-wrap gap-x-4 gap-y-2.5">
          <span className="inline-flex items-center gap-1.5 font-sans text-[14px] text-western-stone-warm">
            <ShieldCheck className="h-4 w-4 text-western-bronze flex-shrink-0" aria-hidden />
            Garantia de {BUSINESS.garantiaLabel}
          </span>
          <span className="inline-flex items-center gap-1.5 font-sans text-[14px] text-western-stone-warm">
            <FileText className="h-4 w-4 text-western-bronze flex-shrink-0" aria-hidden />
            NF-e em todo pedido
          </span>
          <span className="inline-flex items-center gap-1.5 font-sans text-[14px] text-western-stone-warm">
            <Truck className="h-4 w-4 text-western-bronze flex-shrink-0" aria-hidden />
            Reposição garantida
          </span>
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
      <aside className="hidden lg:block lg:sticky lg:top-[calc(var(--guide-sticky-top,124px)+1.25rem)] self-start">
        <PanelBody {...props} />
      </aside>

      {/* Barra fixa mobile — subtotal + ação sempre visíveis (h-20; o main
          reserva pb-32 para ela). Fundo claro: tela de compra. */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <button
            type="button"
            className="lg:hidden fixed bottom-0 left-0 right-0 z-40 h-20 px-5 flex items-center justify-between gap-4 bg-western-ivory border-t border-western-border-strong shadow-[0_-8px_24px_-12px_hsl(var(--western-stone-dark)/0.28)]"
          >
            <span className="text-left min-w-0">
              <span className="block text-eyebrow">Seu projeto</span>
              <span className="block font-sans text-[18px] font-semibold tabular-nums text-western-green-deep truncate">
                {isApproved ? formatPreco(total) : "Preço para parceiros"}
              </span>
            </span>
            <span className="btn-primary flex-shrink-0">Ver projeto ({totalQty})</span>
          </button>
        </SheetTrigger>
        <SheetContent side="bottom" className="h-[90vh] overflow-y-auto bg-western-ivory p-5">
          <PanelBody {...props} />
        </SheetContent>
      </Sheet>
    </>
  );
}
