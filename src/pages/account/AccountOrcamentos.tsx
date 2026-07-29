import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Download, FileStack, Loader2, ShoppingBag } from "lucide-react";
import { cdnImg, formatBRL } from "@/lib/catalog/client";
import { buildCartItem, useCartStore } from "@/stores/cartStore";
import { fetchProductsByHandlesHydrated } from "@/lib/datasource";
import {
  EstadoErro,
  EstadoVazio,
  PageHeader,
  StatusBadge,
  dataRelativa,
  dataAbsoluta,
} from "@/components/backoffice";
import type { QuoteStatus } from "@/components/admin/quoteTypes";

/**
 * MEUS ORÇAMENTOS — a página ÚNICA do orçamento na conta (2026-07-18).
 *
 * Antes eram DUAS telas para o mesmo evento: /orcamentos listava só os PDFs
 * (quote_pdfs) e /composicoes listava só a conversa (leads + quote_threads) —
 * com os rótulos trocados entre si. Agora: cada orçamento enviado é UM card,
 * com a conversa (status) E o PDF juntos. Vocabulário do produto: carrinho =
 * o agora · ORÇAMENTO = o documento/conversa que sai dele · pedido = o
 * histórico · "composição" fica reservado para a cena/conjunto (DS §11).
 *
 * Camada de dados: leads(type="orcamento") + quote_threads (status) +
 * quote_pdfs (arquivo por lead_id). PDFs órfãos (sem lead) aparecem numa
 * lista simples abaixo da grade — nada some.
 */

interface PayloadItem {
  title?: string;
  image?: string | null;
  quantity?: number;
  /** Guardados por summarizeItems desde 2026-07 — permitem recriar o carrinho. */
  handle?: string;
  variantId?: string;
  options?: { name: string; value: string }[];
}

interface Lead {
  id: string;
  nome: string | null;
  empresa: string | null;
  origem: string | null;
  created_at: string;
  payload: {
    items?: PayloadItem[];
    subtotal?: number;
    numero?: string;
    summary?: string;
  } | null;
}

interface Thread {
  lead_id: string;
  status: QuoteStatus;
  updated_at: string;
}

interface QuotePdf {
  id: string;
  storage_path: string;
  subtotal: number;
  items_count: number;
  created_at: string;
  lead_id: string | null;
}

interface Orcamento extends Lead {
  thread?: Thread;
  pdf?: QuotePdf;
}

/* Rótulos voltados ao PARCEIRO. O admin lê "novo"; o parceiro precisa saber o
 * que isso significa para ele. Os tons vêm do STATUS_META (StatusBadge). */
const ROTULO_CLIENTE: Record<QuoteStatus, string> = {
  novo: "Aguardando equipe",
  em_atendimento: "Equipe respondendo",
  proposta_enviada: "Proposta enviada",
  fechado: "Fechado",
  perdido: "Encerrado",
  arquivado: "Arquivado",
};

function GradeCarregando() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3" aria-busy="true" aria-live="polite">
      <span className="sr-only">Carregando orçamentos…</span>
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="rounded-xl border border-western-border-soft bg-white overflow-hidden">
          <div className="h-28 bg-western-border-soft/60 animate-pulse" />
          <div className="p-5 space-y-3">
            <div className="h-3 w-1/3 rounded-sm bg-western-border-soft animate-pulse" />
            <div className="h-4 w-2/3 rounded-sm bg-western-border-soft/80 animate-pulse" />
            <div className="h-6 w-32 rounded-sm bg-western-border-soft/60 animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function AccountOrcamentos() {
  const { user } = useAuth();
  const [items, setItems] = useState<Orcamento[]>([]);
  const [orfaos, setOrfaos] = useState<QuotePdf[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<unknown>(null);
  const [baixando, setBaixando] = useState<string | null>(null);

  const carregar = useCallback(async () => {
    if (!user) return;
    setCarregando(true);
    setErro(null);

    const [leadsRes, pdfsRes] = await Promise.all([
      supabase
        .from("leads")
        .select("id, nome, empresa, origem, created_at, payload")
        .eq("user_id", user.id)
        .eq("type", "orcamento")
        .order("created_at", { ascending: false }),
      supabase
        .from("quote_pdfs")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false }),
    ]);

    // O `error` é capturado de propósito: um 403 de RLS NÃO pode virar
    // "nenhum orçamento" — o parceiro acharia que perdeu tudo.
    if (leadsRes.error) {
      setErro(leadsRes.error);
      setCarregando(false);
      return;
    }
    if (pdfsRes.error) {
      setErro(pdfsRes.error);
      setCarregando(false);
      return;
    }

    const linhas = (leadsRes.data ?? []) as unknown as Lead[];
    const pdfs = (pdfsRes.data ?? []) as unknown as QuotePdf[];
    const ids = linhas.map((l) => l.id);

    let threads: Thread[] = [];
    if (ids.length > 0) {
      const { data, error: erroThreads } = await supabase
        .from("quote_threads")
        .select("lead_id, status, updated_at")
        .in("lead_id", ids);

      // Se as threads falham, o orçamento existe mas o status é DESCONHECIDO —
      // e mostrar "Aguardando equipe" para todos seria mentir. Erro é erro.
      if (erroThreads) {
        setErro(erroThreads);
        setCarregando(false);
        return;
      }
      threads = (data ?? []) as unknown as Thread[];
    }

    const idsSet = new Set(ids);
    setItems(
      linhas.map((l) => ({
        ...l,
        thread: threads.find((t) => t.lead_id === l.id),
        pdf: pdfs.find((p) => p.lead_id === l.id),
      })),
    );
    setOrfaos(pdfs.filter((p) => !p.lead_id || !idsSet.has(p.lead_id)));
    setCarregando(false);
  }, [user]);

  useEffect(() => {
    void carregar();
  }, [carregar]);

  const baixarPdf = async (pdf: QuotePdf) => {
    setBaixando(pdf.id);
    try {
      const { data, error } = await supabase.storage
        .from("orcamentos")
        .createSignedUrl(pdf.storage_path, 3600);

      if (error || !data) {
        toast.error("Não consegui abrir o PDF. Tente de novo em instantes.");
        return;
      }

      try {
        const response = await fetch(data.signedUrl);
        if (!response.ok) throw new Error("Download failed");
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `western-orcamento-${new Date(pdf.created_at).toISOString().slice(0, 10)}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.setTimeout(() => URL.revokeObjectURL(url), 30000);
      } catch {
        window.open(data.signedUrl, "_blank", "noopener,noreferrer");
      }
    } finally {
      setBaixando(null);
    }
  };

  /* "Adicionar ao carrinho" — o retorno do orçamento (pedido do dono, 18/07):
   * o parceiro acerta com o cliente dele e volta dias depois. Recriamos o
   * carrinho RE-HIDRATANDO cada peça por handle no catálogo atual (preço de
   * hoje, disponibilidade de hoje) e casando a variante por id — nunca clonando
   * dados velhos do payload. Peça fora do ar não entra e é contada no aviso. */
  const addItem = useCartStore((s) => s.addItem);
  const [recriando, setRecriando] = useState<string | null>(null);

  const adicionarAoCarrinho = async (it: Orcamento) => {
    const pecas = (Array.isArray(it.payload?.items) ? it.payload!.items! : []) as PayloadItem[];
    const compraveis = pecas.filter((p) => p.handle);
    if (compraveis.length === 0) {
      toast.error("Este orçamento é antigo e não guarda os dados das peças — monte pelo catálogo.");
      return;
    }
    setRecriando(it.id);
    try {
      const handles = [...new Set(compraveis.map((p) => p.handle!))];
      const produtos = await fetchProductsByHandlesHydrated(handles);
      const porHandle = new Map(produtos.map((p) => [p.handle, p]));
      let ok = 0;
      let fora = 0;

      for (const p of compraveis) {
        const produto = porHandle.get(p.handle!);
        if (!produto) {
          fora++;
          continue;
        }
        const variantes = produto.variants.edges.map((e) => e.node);
        const porId = p.variantId ? variantes.find((v) => v.id === p.variantId) : undefined;
        const porOpcoes =
          !porId && p.options?.length
            ? variantes.find((v) =>
                p.options!.every((o) =>
                  v.selectedOptions.some((s) => s.name === o.name && s.value === o.value),
                ),
              )
            : undefined;
        const variante = porId ?? porOpcoes;
        if (!variante) {
          fora++;
          continue;
        }
        const item = buildCartItem(produto, variante.id, p.quantity ?? 1);
        if (item) {
          addItem(item, { silent: true });
          ok++;
        } else {
          fora++;
        }
      }

      if (ok > 0) {
        toast.success(
          `${ok} ${ok === 1 ? "peça adicionada" : "peças adicionadas"} ao carrinho` +
            (fora > 0 ? ` · ${fora} ${fora === 1 ? "indisponível" : "indisponíveis"}` : "") +
            ".",
          { action: { label: "Ver", onClick: () => window.dispatchEvent(new CustomEvent("western:open-cart")) } },
        );
      } else {
        toast.error("As peças deste orçamento não estão mais disponíveis no catálogo.");
      }
    } catch {
      toast.error("Não consegui recriar o carrinho agora. Tente de novo em instantes.");
    } finally {
      setRecriando(null);
    }
  };

  const botaoPdf = (pdf: QuotePdf) => (
    <button
      type="button"
      onClick={() => void baixarPdf(pdf)}
      disabled={baixando === pdf.id}
      className="tap-target inline-flex items-center justify-center gap-2 rounded-lg border border-western-green-deep/25 px-4 text-[15px] font-semibold text-western-green-deep transition-colors hover:bg-western-paper disabled:opacity-50"
    >
      {baixando === pdf.id ? (
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
      ) : (
        <Download className="h-4 w-4" aria-hidden="true" />
      )}
      PDF
    </button>
  );

  return (
    <div>
      <PageHeader
        eyebrow="Meus orçamentos"
        titulo="Orçamentos enviados"
        subtitulo="Cada orçamento enviado pelo carrinho ou pelo guia vira uma conversa com o time Western — e o PDF fica guardado aqui, pronto para reaproveitar e mandar para o cliente."
        /* UMA ação primária por tela: no vazio, quem leva o CTA é o estado vazio. */
        acao={
          !carregando && !erro && items.length > 0 ? (
            <Link to="/linhas" className="btn-primary tap-target">
              Ver produtos
            </Link>
          ) : undefined
        }
      />

      {erro ? (
        <EstadoErro erro={erro} onRetry={() => void carregar()} />
      ) : carregando ? (
        <GradeCarregando />
      ) : items.length === 0 && orfaos.length === 0 ? (
        <EstadoVazio
          icone={FileStack}
          titulo="Nenhum orçamento ainda"
          mensagem="Monte o carrinho e envie para orçamento — a conversa com o ateliê e o PDF aparecem aqui automaticamente."
          acao={
            <Link to="/linhas" className="btn-primary tap-target">
              Ver produtos
            </Link>
          }
        />
      ) : (
        <>
          <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {items.map((it) => {
              const status: QuoteStatus = it.thread?.status ?? "novo";
              const pecas = Array.isArray(it.payload?.items) ? it.payload!.items! : [];
              const qtdPecas = pecas.length;
              const subtotal = it.payload?.subtotal ?? 0;
              const fotos = pecas.filter((p) => Boolean(p.image)).slice(0, 4);
              const restante = qtdPecas - fotos.length;

              return (
                <li
                  key={it.id}
                  className="flex flex-col overflow-hidden rounded-xl border border-western-border-soft bg-white"
                >
                  {/* Faixa visual das peças — é assim que o parceiro reconhece o orçamento. */}
                  <div className="flex h-28 items-stretch gap-px bg-western-border-soft">
                    {fotos.length > 0 ? (
                      <>
                        {fotos.map((p, i) => (
                          <div key={i} className="flex-1 bg-western-paper p-2">
                            <img
                              src={cdnImg(p.image ?? "", 240)}
                              alt={p.title ?? "Peça do orçamento"}
                              className="h-full w-full object-contain"
                              loading="lazy"
                            />
                          </div>
                        ))}
                        {restante > 0 && (
                          <div className="grid w-16 flex-shrink-0 place-items-center bg-western-paper text-[14px] font-semibold tabular-nums text-western-stone-warm">
                            +{restante}
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="grid flex-1 place-items-center bg-western-paper">
                        <FileStack className="h-7 w-7 text-western-stone-warm/40" aria-hidden="true" />
                      </div>
                    )}
                  </div>

                  <div className="flex flex-1 flex-col p-5">
                    <p className="text-meta">
                      {it.payload?.numero && (
                        <>
                          <span className="font-semibold tracking-wide text-western-bronze">
                            Nº {it.payload.numero}
                          </span>
                          {" · "}
                        </>
                      )}
                      <time dateTime={it.created_at} title={dataAbsoluta(it.created_at)}>
                        {dataRelativa(it.created_at)}
                      </time>
                      {it.origem ? ` · ${it.origem}` : ""}
                    </p>

                    <h3 className="display-md mt-1 text-western-green-deep">
                      <span className="tabular-nums">{qtdPecas}</span>{" "}
                      {qtdPecas === 1 ? "peça" : "peças"}
                    </h3>

                    <p className="text-price mt-1 text-[20px]">{formatBRL(subtotal)}</p>

                    {it.payload?.summary && (
                      <p className="text-meta mt-2 line-clamp-2">{it.payload.summary}</p>
                    )}

                    <div className="mt-4 space-y-3 border-t border-western-border-soft pt-4">
                      <StatusBadge status={status} label={ROTULO_CLIENTE[status]} />
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => void adicionarAoCarrinho(it)}
                          disabled={recriando === it.id}
                          className="tap-target inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-western-cta px-4 text-[15px] font-semibold text-western-cream transition-colors hover:bg-western-green-deep disabled:opacity-50"
                        >
                          {recriando === it.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                          ) : (
                            <ShoppingBag className="h-4 w-4" aria-hidden="true" />
                          )}
                          Adicionar ao carrinho
                        </button>
                        {it.pdf && botaoPdf(it.pdf)}
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>

          {orfaos.length > 0 && (
            <section className="mt-8" aria-label="Outros PDFs de orçamento">
              <h2 className="text-eyebrow mb-3">Outros PDFs de orçamento</h2>
              <ul className="divide-y divide-western-border-soft rounded-xl border border-western-border-soft bg-white">
                {orfaos.map((p) => (
                  <li key={p.id} className="flex items-center justify-between gap-4 px-5 py-4">
                    <div>
                      <p className="font-sans text-[15px] font-semibold text-western-green-deep">
                        {p.items_count} {p.items_count === 1 ? "peça" : "peças"}
                        {p.subtotal > 0 ? ` · ${formatBRL(p.subtotal, "BRL")}` : ""}
                      </p>
                      <p className="text-meta mt-0.5">
                        <time dateTime={p.created_at} title={dataAbsoluta(p.created_at)}>
                          {dataRelativa(p.created_at)}
                        </time>
                      </p>
                    </div>
                    {botaoPdf(p)}
                  </li>
                ))}
              </ul>
            </section>
          )}
        </>
      )}
    </div>
  );
}
