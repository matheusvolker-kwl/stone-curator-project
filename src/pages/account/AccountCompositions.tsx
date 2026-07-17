import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { FileStack } from "lucide-react";
import { cdnImg, formatBRL } from "@/lib/catalog/client";
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
 * Composições = os orçamentos que o parceiro enviou (carrinho ou guia de
 * composição). Cada um vira uma CONVERSA com o time Western.
 *
 * É grade visual, não tabela: a composição é um conjunto de peças, e a foto das
 * peças é o que o parceiro reconhece. Mas os 4 estados (carregando · vazio ·
 * ERRO · sucesso) seguem o mesmo idioma do backoffice.
 *
 * Camada de dados PRESERVADA: leads(type="orcamento") do usuário + quote_threads
 * pelos lead_id. A diferença é que agora o `error` das duas queries é capturado —
 * antes um 403 virava lista vazia e o parceiro achava que tinha perdido tudo.
 */

interface PayloadItem {
  title?: string;
  image?: string | null;
  quantity?: number;
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

interface Composition extends Lead {
  thread?: Thread;
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
      <span className="sr-only">Carregando composições…</span>
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="rounded-2xl border border-western-border-soft bg-white overflow-hidden">
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

export default function AccountCompositions() {
  const { user } = useAuth();
  const [items, setItems] = useState<Composition[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<unknown>(null);

  const carregar = useCallback(async () => {
    if (!user) return;
    setCarregando(true);
    setErro(null);

    const { data: leads, error: erroLeads } = await supabase
      .from("leads")
      .select("id, nome, empresa, origem, created_at, payload")
      .eq("user_id", user.id)
      .eq("type", "orcamento")
      .order("created_at", { ascending: false });

    if (erroLeads) {
      setErro(erroLeads);
      setCarregando(false);
      return;
    }

    const linhas = (leads ?? []) as unknown as Lead[];
    const ids = linhas.map((l) => l.id);

    let threads: Thread[] = [];
    if (ids.length > 0) {
      const { data, error: erroThreads } = await supabase
        .from("quote_threads")
        .select("lead_id, status, updated_at")
        .in("lead_id", ids);

      // Se as threads falham, a composição existe mas o status é DESCONHECIDO —
      // e mostrar "Aguardando equipe" para todas seria mentir. Erro é erro.
      if (erroThreads) {
        setErro(erroThreads);
        setCarregando(false);
        return;
      }
      threads = (data ?? []) as unknown as Thread[];
    }

    setItems(
      linhas.map((l) => ({
        ...l,
        thread: threads.find((t) => t.lead_id === l.id),
      })),
    );
    setCarregando(false);
  }, [user]);

  useEffect(() => {
    void carregar();
  }, [carregar]);

  return (
    <div>
      <PageHeader
        eyebrow="Composições"
        titulo="Orçamentos e projetos em conversa"
        subtitulo="Todo orçamento enviado pelo carrinho ou pelo guia de composição inicia uma conversa com o time Western."
        /* UMA ação primária por tela: no vazio, quem leva o CTA é o estado vazio. */
        acao={
          !carregando && !erro && items.length > 0 ? (
            <Link to="/guia-de-composicao" className="btn-primary tap-target">
              Montar nova composição
            </Link>
          ) : undefined
        }
      />

      {erro ? (
        <EstadoErro erro={erro} onRetry={() => void carregar()} />
      ) : carregando ? (
        <GradeCarregando />
      ) : items.length === 0 ? (
        <EstadoVazio
          icone={FileStack}
          titulo="Nenhuma composição ainda"
          mensagem="Monte um conjunto no guia de composição ou envie o carrinho para orçamento — a conversa com o ateliê começa aqui."
          acao={
            <Link to="/guia-de-composicao" className="btn-primary tap-target">
              Abrir guia de composição
            </Link>
          }
        />
      ) : (
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
                className="flex flex-col overflow-hidden rounded-2xl border border-western-border-soft bg-white"
              >
                {/* Faixa visual das peças — é assim que o parceiro reconhece a composição. */}
                <div className="flex h-28 items-stretch gap-px bg-western-border-soft">
                  {fotos.length > 0 ? (
                    <>
                      {fotos.map((p, i) => (
                        <div key={i} className="flex-1 bg-western-paper p-2">
                          <img
                            src={cdnImg(p.image ?? "", 240)}
                            alt={p.title ?? "Peça da composição"}
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
                    {it.payload?.numero ? `Nº ${it.payload.numero} · ` : ""}
                    <time dateTime={it.created_at} title={dataAbsoluta(it.created_at)}>
                      {dataRelativa(it.created_at)}
                    </time>
                    {it.origem ? ` · ${it.origem}` : ""}
                  </p>

                  <h3 className="display-md mt-1 text-western-green-deep">
                    <span className="tabular-nums">{qtdPecas}</span> {qtdPecas === 1 ? "peça" : "peças"}
                  </h3>

                  <p className="text-price mt-1 text-[24px]">{formatBRL(subtotal)}</p>

                  {it.payload?.summary && (
                    <p className="text-meta mt-2 line-clamp-2">{it.payload.summary}</p>
                  )}

                  <div className="mt-4 pt-4 border-t border-western-border-soft">
                    <StatusBadge status={status} label={ROTULO_CLIENTE[status]} />
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
