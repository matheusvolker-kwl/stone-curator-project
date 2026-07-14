import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Check, Copy, ChevronRight, Loader2 } from "lucide-react";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription,
} from "@/components/ui/sheet";
import {
  DataTable, type Coluna,
  StatusBadge, rotuloStatus,
  Tabs,
  PageHeader,
  CelulaData,
  dataAbsoluta,
} from "@/components/backoffice";
import type { Lead } from "@/components/admin/adminUtils";

/**
 * Amostras — fila Pendente → Aprovado → Enviado → Entregue.
 *
 * Consertado: `const { data } = await supabase…` e `setSamples(data ?? [])`.
 * O erro era descartado, então uma falha de carga aparecia como "nenhuma amostra"
 * — a mesma armadilha que já escondeu um parceiro pendente do dono. Agora o erro
 * é estado e a tabela mostra EstadoErro (tela diferente do vazio) com "Tentar de novo".
 */

const STATUSES = ["pending", "approved", "shipped", "delivered"] as const;
type SampleStatus = (typeof STATUSES)[number];

/** O próximo degrau da esteira. `delivered` é o fim da linha. */
const PROXIMO: Record<SampleStatus, SampleStatus | null> = {
  pending: "approved",
  approved: "shipped",
  shipped: "delivered",
  delivered: null,
};

/** Rótulo da ação que LEVA a cada status. */
const ACAO_LABEL: Record<SampleStatus, string> = {
  pending: "Voltar para pendente",
  approved: "Aprovar",
  shipped: "Marcar como enviado",
  delivered: "Marcar como entregue",
};

function statusDe(l: Lead): SampleStatus {
  const s = (l.payload as { aprovacao_status?: string } | null)?.aprovacao_status;
  return s && (STATUSES as readonly string[]).includes(s) ? (s as SampleStatus) : "pending";
}

const enderecoDe = (l: Lead) => [l.endereco, l.cidade, l.uf, l.cep].filter(Boolean).join(", ");

export default function AdminSamples() {
  const [samples, setSamples] = useState<Lead[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<unknown>(null);
  const [aba, setAba] = useState<"todos" | SampleStatus>("pending");
  const [detalhe, setDetalhe] = useState<Lead | null>(null);
  const [selecionados, setSelecionados] = useState<Set<string>>(new Set());
  const [aplicando, setAplicando] = useState(false);

  const load = useCallback(async () => {
    setCarregando(true);
    setErro(null);
    const { data, error } = await supabase
      .from("leads")
      .select("*")
      .eq("type", "amostras")
      .order("created_at", { ascending: false });
    if (error) setErro(error);
    else setSamples((data as Lead[]) ?? []);
    setCarregando(false);
  }, []);

  useEffect(() => { void load(); }, [load]);

  const contagens = useMemo(() => {
    const c: Record<string, number> = { todos: samples.length, pending: 0, approved: 0, shipped: 0, delivered: 0 };
    samples.forEach((s) => { c[statusDe(s)] += 1; });
    return c;
  }, [samples]);

  const filtradas = useMemo(
    () => (aba === "todos" ? samples : samples.filter((s) => statusDe(s) === aba)),
    [samples, aba],
  );

  useEffect(() => { setSelecionados(new Set()); }, [aba]);

  /** Grava o novo status dentro do payload (o campo é `payload.aprovacao_status`). */
  const gravarStatus = async (l: Lead, status: SampleStatus) => {
    const payload = {
      ...(l.payload ?? {}),
      aprovacao_status: status,
      ultima_atualizacao: new Date().toISOString(),
    };
    const { error } = await supabase.from("leads").update({ payload } as never).eq("id", l.id);
    if (error) throw error;
  };

  const avancarUm = async (l: Lead, status: SampleStatus) => {
    setAplicando(true);
    try {
      await gravarStatus(l, status);
      toast.success(`Amostra agora está em "${rotuloStatus(status)}".`);
      setDetalhe(null);
      await load();
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      toast.error("Não consegui atualizar.", { description: msg });
    } finally {
      setAplicando(false);
    }
  };

  const avancarLote = async (ids: string[], status: SampleStatus) => {
    const alvos = samples.filter((s) => ids.includes(s.id));
    if (alvos.length === 0) return;
    setAplicando(true);
    const r = await Promise.allSettled(alvos.map((l) => gravarStatus(l, status)));
    const ok = r.filter((x) => x.status === "fulfilled").length;
    const falhas = r.length - ok;
    setAplicando(false);

    if (ok === 0) toast.error("Nenhuma amostra foi atualizada.", { description: `${falhas} falharam.` });
    else if (falhas > 0) toast.success(`${ok} atualizada(s).`, { description: `${falhas} falharam.` });
    else toast.success(`${ok} amostra(s) em "${rotuloStatus(status)}".`);

    setSelecionados(new Set());
    await load();
  };

  const copiar = (texto: string) => {
    navigator.clipboard.writeText(texto).then(
      () => toast.success("Endereço copiado."),
      () => toast.error("Não consegui copiar."),
    );
  };

  const colunas: ReadonlyArray<Coluna<Lead>> = useMemo(() => [
    {
      key: "nome",
      header: "Solicitante",
      principalNoMobile: true,
      sortable: true,
      sortValue: (l) => l.nome ?? l.empresa ?? "",
      render: (l) => (
        <div className="min-w-0">
          <p className="truncate font-semibold text-western-green-deep">{l.nome || l.empresa || "—"}</p>
          <p className="truncate text-[14px] text-western-stone-warm">
            {[l.empresa, l.email].filter(Boolean).join(" · ") || "—"}
          </p>
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      sortValue: (l) => STATUSES.indexOf(statusDe(l)),
      render: (l) => <StatusBadge status={statusDe(l)} />,
    },
    {
      key: "cidade",
      header: "Destino",
      ocultarNoMobile: true,
      sortable: true,
      render: (l) => (
        <span className="text-[16px] text-western-stone-warm">
          {[l.cidade, l.uf].filter(Boolean).join(" / ") || "—"}
        </span>
      ),
    },
    {
      key: "telefone",
      header: "Telefone",
      ocultarNoMobile: true,
      numerica: true,
      render: (l) => <span className="text-[16px] text-western-stone-warm">{l.telefone || "—"}</span>,
    },
    {
      key: "created_at",
      header: "Pedido",
      align: "right",
      sortable: true,
      sortValue: (l) => l.created_at,
      render: (l) => <CelulaData valor={l.created_at} className="text-western-stone-warm" />,
    },
    {
      key: "acao",
      header: "",
      align: "right",
      width: "56px",
      ocultarNoMobile: true,
      render: () => <ChevronRight className="ml-auto h-4 w-4 text-western-stone-warm/45" aria-hidden="true" />,
    },
  ], []);

  // Só faz sentido avançar em lote quando a aba é UM status com próximo degrau.
  const alvoLote = aba !== "todos" ? PROXIMO[aba] : null;
  const statusDetalhe = detalhe ? statusDe(detalhe) : null;
  const proximoDetalhe = statusDetalhe ? PROXIMO[statusDetalhe] : null;

  return (
    <div>
      <PageHeader
        eyebrow="Amostras"
        titulo="Kits de amostras"
        subtitulo="Esteira Pendente → Aprovado → Enviado → Entregue. A política do ateliê é aprovar em até 2 dias úteis."
      />

      <Tabs
        abas={[
          { key: "pending", label: "Pendentes", count: carregando || erro ? undefined : contagens.pending },
          { key: "approved", label: "Aprovadas", count: carregando || erro ? undefined : contagens.approved },
          { key: "shipped", label: "Enviadas", count: carregando || erro ? undefined : contagens.shipped },
          { key: "delivered", label: "Entregues", count: carregando || erro ? undefined : contagens.delivered },
          { key: "todos", label: "Todas", count: carregando || erro ? undefined : contagens.todos },
        ]}
        ativa={aba}
        onChange={setAba}
        className="mb-6"
      />

      <DataTable
        linhas={filtradas}
        colunas={colunas}
        getId={(l) => l.id}
        isLoading={carregando}
        error={erro}
        onRetry={load}
        onRowClick={(l) => setDetalhe(l)}
        vazio={
          samples.length === 0
            ? {
                titulo: "As amostras agora são atendidas pela Western Box",
                mensagem: "Esta fila fica de pé para histórico e para receber pedidos legados.",
              }
            : {
                titulo: `Nenhuma amostra em "${aba === "todos" ? "todas" : rotuloStatus(aba)}"`,
                mensagem: "Troque de aba para ver as outras etapas da esteira.",
              }
        }
        selecao={
          alvoLote
            ? {
                selecionados,
                onChange: setSelecionados,
                barra: (ids) => (
                  <button
                    type="button"
                    onClick={() => avancarLote(ids, alvoLote)}
                    disabled={aplicando}
                    className="btn-primary"
                  >
                    {aplicando ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Check className="h-4 w-4" aria-hidden="true" />}
                    {ACAO_LABEL[alvoLote]} ({ids.length})
                  </button>
                ),
              }
            : undefined
        }
      />

      {/* ── Detalhe ── */}
      <Sheet open={!!detalhe} onOpenChange={(o) => !o && setDetalhe(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
          {detalhe && (
            <>
              <SheetHeader className="text-left">
                <SheetTitle className="display-md text-western-green-deep">
                  {detalhe.nome || detalhe.empresa || "Pedido de amostra"}
                </SheetTitle>
                <SheetDescription className="text-[16px] text-western-stone-warm">
                  Recebido em {dataAbsoluta(detalhe.created_at)}
                </SheetDescription>
              </SheetHeader>

              <div className="mt-6 space-y-6">
                <div>{statusDetalhe && <StatusBadge status={statusDetalhe} />}</div>

                <dl className="space-y-3">
                  <Linha k="Empresa" v={detalhe.empresa} />
                  <Linha k="CNPJ" v={detalhe.cnpj} />
                  <Linha k="E-mail" v={detalhe.email} />
                  <Linha k="Telefone" v={detalhe.telefone} />
                </dl>

                {enderecoDe(detalhe) && (
                  <section className="rounded-[16px] border border-western-border-soft bg-western-paper p-4">
                    <p className="text-eyebrow mb-2">Endereço de envio</p>
                    <div className="flex items-start justify-between gap-3">
                      <p className="min-w-0 flex-1 break-words text-[16px] leading-[1.5] text-western-green-deep">
                        {enderecoDe(detalhe)}
                      </p>
                      <button
                        type="button"
                        onClick={() => copiar(enderecoDe(detalhe))}
                        className="tap-target inline-flex flex-shrink-0 items-center gap-1.5 rounded-[10px] px-2 text-[16px] font-semibold text-western-stone-warm transition-colors hover:text-western-green-deep"
                      >
                        <Copy className="h-4 w-4" aria-hidden="true" />
                        Copiar
                      </button>
                    </div>
                  </section>
                )}

                {detalhe.mensagem && (
                  <section>
                    <p className="text-eyebrow mb-2">Mensagem</p>
                    <p className="whitespace-pre-wrap text-[16px] leading-[1.5] text-western-green-deep">
                      {detalhe.mensagem}
                    </p>
                  </section>
                )}

                <div className="border-t border-western-border-soft pt-6">
                  {proximoDetalhe ? (
                    <button
                      type="button"
                      onClick={() => avancarUm(detalhe, proximoDetalhe)}
                      disabled={aplicando}
                      className="btn-primary w-full"
                    >
                      {aplicando ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Check className="h-4 w-4" aria-hidden="true" />}
                      {ACAO_LABEL[proximoDetalhe]}
                    </button>
                  ) : (
                    <p className="text-body">Esta amostra já foi entregue. Nada pendente.</p>
                  )}
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

function Linha({ k, v }: { k: string; v: string | null | undefined }) {
  return (
    <div className="flex gap-4">
      <dt className="w-[120px] flex-shrink-0 text-[14px] font-semibold uppercase tracking-[0.06em] text-western-bronze">
        {k}
      </dt>
      <dd className="min-w-0 flex-1 break-words text-[16px] text-western-green-deep">{v || "—"}</dd>
    </div>
  );
}
