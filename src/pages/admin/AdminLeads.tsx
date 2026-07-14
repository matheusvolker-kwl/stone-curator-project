import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ChevronLeft, ChevronRight, Download, Loader2, Mail, MessageCircle, Search, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription,
} from "@/components/ui/sheet";
import {
  DataTable, type Coluna,
  StatusBadge, type TomStatus,
  Tabs, type Aba,
  PageHeader, CelulaData, dataAbsoluta,
} from "@/components/backoffice";
import { toCSV, downloadCSV, type Lead, LEAD_TYPE_LABEL } from "@/components/admin/adminUtils";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { toast } from "sonner";

const PAGE_SIZE = 50;

const TIPOS = [
  "partner_signup",
  "newsletter",
  "amostras",
  "visita",
  "contato",
  "pedido_novo",
  "b2c_orcamento",
  "pdf_pedido",
] as const;

/** Tom do badge por tipo de lead. Dessaturado — o tipo informa, não grita. */
const TOM_POR_TIPO: Record<string, TomStatus> = {
  partner_signup: "info",
  newsletter: "neutro",
  amostras: "andamento",
  visita: "andamento",
  contato: "neutro",
  pedido_novo: "positivo",
  b2c_orcamento: "info",
  pdf_pedido: "aviso",
};

const CAMPOS_BUSCA = ["nome", "email", "telefone", "empresa", "cidade", "mensagem", "origem"];

/** Monta o filtro `or` da busca (server-side, case-insensitive). */
function filtroBusca(q: string): string {
  const pattern = `%${q.replace(/[%,]/g, " ")}%`;
  return CAMPOS_BUSCA.map((c) => `${c}.ilike.${pattern}`).join(",");
}

function soDigitos(v: string) {
  return v.replace(/\D/g, "");
}

function linkWhatsApp(telefone: string) {
  const fone = soDigitos(telefone);
  return `https://wa.me/${fone.startsWith("55") ? fone : `55${fone}`}`;
}

export default function AdminLeads() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [leads, setLeads] = useState<Lead[]>([]);
  const [total, setTotal] = useState(0);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<unknown>(null);

  /** Contagem por tipo para as abas. `undefined` = ainda não sei (não mostro 0). */
  const [contagens, setContagens] = useState<Record<string, number> | null>(null);

  // Os tiles do dashboard fazem deep link (?type=pedido_novo, ?type=partner_signup).
  // Sem ler isso, o cockpit prometia uma fila e entregava a lista inteira.
  const [tipo, setTipo] = useState<string>(() => {
    const t = searchParams.get("type");
    return t && (TIPOS as readonly string[]).includes(t) ? t : "all";
  });
  const [qInput, setQInput] = useState("");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(0);
  const [detalhe, setDetalhe] = useState<Lead | null>(null);
  const [exportando, setExportando] = useState(false);
  const [selecionados, setSelecionados] = useState<Set<string>>(new Set());
  const [confirmarExclusao, setConfirmarExclusao] = useState(false);
  const [excluindo, setExcluindo] = useState(false);
  const [nonce, setNonce] = useState(0);

  /* Debounce da busca */
  useEffect(() => {
    const t = setTimeout(() => {
      setQ(qInput.trim());
      setPage(0);
    }, 300);
    return () => clearTimeout(t);
  }, [qInput]);

  useEffect(() => { setPage(0); }, [tipo]);

  /* Contexto mudou → seleção antiga não vale mais */
  useEffect(() => { setSelecionados(new Set()); }, [tipo, q, page, nonce]);

  /* ── Lista (os 4 estados moram aqui: o `error` É guardado) ── */
  useEffect(() => {
    let cancelado = false;
    setCarregando(true);
    setErro(null);

    (async () => {
      let query = supabase
        .from("leads")
        .select("*", { count: "exact" })
        // /admin/orcamentos cuida dos orçamentos abertos
        .neq("type", "orcamento")
        .order("last_activity_at", { ascending: false })
        .range(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE - 1);

      if (tipo !== "all") query = query.eq("type", tipo as never);
      if (q) query = query.or(filtroBusca(q));

      const { data, count, error } = await query;
      if (cancelado) return;

      if (error) {
        // Sem isto, um 403 vira "nenhum lead" e o dono fica cego.
        console.error(error);
        setErro(error);
        setLeads([]);
        setTotal(0);
      } else {
        setLeads((data as Lead[]) ?? []);
        setTotal(count ?? 0);
      }
      setCarregando(false);
    })();

    return () => { cancelado = true; };
  }, [tipo, q, page, nonce]);

  /* ── Contagens das abas (head count: exato, sem trafegar linhas) ── */
  useEffect(() => {
    let cancelado = false;

    (async () => {
      const contar = async (t?: string) => {
        let query = supabase
          .from("leads")
          .select("id", { count: "exact", head: true })
          .neq("type", "orcamento");
        if (t) query = query.eq("type", t as never);
        if (q) query = query.or(filtroBusca(q));
        const { count, error } = await query;
        if (error) throw error;
        return count ?? 0;
      };

      try {
        const [todos, ...porTipo] = await Promise.all([contar(), ...TIPOS.map((t) => contar(t))]);
        if (cancelado) return;
        const mapa: Record<string, number> = { all: todos };
        TIPOS.forEach((t, i) => { mapa[t] = porTipo[i]; });
        setContagens(mapa);
      } catch (e) {
        // Contagem é acessório: se falhar, a aba fica SEM número (nunca com 0 mentiroso).
        console.warn("Contagem de leads por tipo falhou", e);
        if (!cancelado) setContagens(null);
      }
    })();

    return () => { cancelado = true; };
  }, [q, nonce]);

  const recarregar = useCallback(() => setNonce((n) => n + 1), []);

  const totalPaginas = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const abas: Aba[] = useMemo(
    () => [
      { key: "all", label: "Todos", count: contagens?.all },
      ...TIPOS.map((t) => ({
        key: t,
        label: LEAD_TYPE_LABEL[t] ?? t,
        count: contagens?.[t],
      })),
    ],
    [contagens],
  );

  /* ── Exportar ── */
  const exportarCsv = async () => {
    setExportando(true);
    try {
      let query = supabase
        .from("leads")
        .select("*")
        .neq("type", "orcamento")
        .order("last_activity_at", { ascending: false })
        .limit(5000);
      if (tipo !== "all") query = query.eq("type", tipo as never);
      if (q) query = query.or(filtroBusca(q));

      const { data, error } = await query;
      if (error) {
        // Antes: o erro era engolido e baixava um CSV vazio como se estivesse tudo certo.
        console.error(error);
        toast.error("Não consegui exportar. Tente de novo.");
        return;
      }
      const linhas = (data ?? []) as unknown as Record<string, unknown>[];
      if (linhas.length === 0) {
        toast.info("Nada para exportar neste filtro.");
        return;
      }
      downloadCSV(`leads-${new Date().toISOString().slice(0, 10)}.csv`, toCSV(linhas));
    } finally {
      setExportando(false);
    }
  };

  const exportarSelecionados = (ids: string[]) => {
    const linhas = leads
      .filter((l) => ids.includes(l.id))
      .map((l) => l as unknown as Record<string, unknown>);
    if (linhas.length === 0) return;
    downloadCSV(`leads-selecionados-${new Date().toISOString().slice(0, 10)}.csv`, toCSV(linhas));
  };

  const excluirSelecionados = async () => {
    const ids = Array.from(selecionados);
    if (ids.length === 0) return;
    setExcluindo(true);
    try {
      const resultados = await Promise.allSettled(
        ids.map((id) => supabase.from("leads").delete().eq("id", id)),
      );
      let ok = 0;
      let falhou = 0;
      resultados.forEach((r) => {
        if (r.status === "fulfilled" && !r.value.error) ok++;
        else falhou++;
      });
      if (falhou === 0) toast.success(`${ok} lead(s) excluído(s).`);
      else if (ok === 0) toast.error(`Falha ao excluir ${falhou} lead(s).`);
      else toast.warning(`${ok} excluído(s), ${falhou} falharam.`);
    } catch (e) {
      console.error(e);
      toast.error("Erro ao excluir leads.");
    } finally {
      setExcluindo(false);
      setConfirmarExclusao(false);
      setSelecionados(new Set());
      recarregar();
    }
  };

  /* ── Colunas ── */
  const colunas: Coluna<Lead>[] = useMemo(
    () => [
      {
        key: "type",
        header: "Tipo",
        width: "180px",
        sortable: true,
        sortValue: (l) => LEAD_TYPE_LABEL[l.type] ?? l.type,
        render: (l) => (
          <StatusBadge
            status={l.type}
            label={LEAD_TYPE_LABEL[l.type] ?? l.type}
            tom={TOM_POR_TIPO[l.type] ?? "neutro"}
          />
        ),
      },
      {
        key: "nome",
        header: "Quem",
        sortable: true,
        principalNoMobile: true,
        sortValue: (l) => l.nome ?? l.empresa ?? l.email ?? "",
        render: (l) => {
          const downloads = (l.payload as Record<string, unknown> | null)?.downloads as number | undefined;
          const local = [l.cidade, l.uf].filter(Boolean).join("/");
          return (
            <div className="min-w-0">
              <p className="font-semibold text-western-green-deep break-words">
                {l.nome || l.empresa || l.email || "(sem nome)"}
                {typeof downloads === "number" && downloads > 1 && (
                  <span className="ml-2 text-[14px] font-semibold tabular-nums text-western-bronze">
                    {downloads}× downloads
                  </span>
                )}
              </p>
              {(local || l.empresa || l.origem) && (
                <p className="text-meta mt-0.5 break-words">
                  {[l.nome && l.empresa ? l.empresa : null, local || null, l.origem || null]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
              )}
            </div>
          );
        },
      },
      {
        key: "contato",
        header: "Contato",
        width: "240px",
        render: (l) => (
          <div className="flex flex-col gap-1 md:items-start items-end">
            {l.email && (
              <a
                href={`mailto:${l.email}`}
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center gap-1.5 text-[16px] text-western-green-deep hover:text-western-cta hover:underline break-all"
              >
                <Mail className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
                {l.email}
              </a>
            )}
            {l.telefone && (
              <a
                href={linkWhatsApp(l.telefone)}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center gap-1.5 text-[16px] tabular-nums text-western-green-deep hover:text-western-cta hover:underline"
              >
                <MessageCircle className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
                {l.telefone}
              </a>
            )}
            {!l.email && !l.telefone && <span className="text-meta">—</span>}
          </div>
        ),
      },
      {
        key: "mensagem",
        header: "Mensagem",
        ocultarNoMobile: true,
        render: (l) =>
          l.mensagem ? (
            <p className="text-meta line-clamp-1 max-w-[280px]" title={l.mensagem}>
              {l.mensagem}
            </p>
          ) : (
            <span className="text-meta">—</span>
          ),
      },
      {
        key: "last_activity_at",
        header: "Atividade",
        align: "right",
        width: "140px",
        sortable: true,
        sortValue: (l) => l.last_activity_at ?? l.created_at,
        render: (l) => <CelulaData valor={l.last_activity_at ?? l.created_at} className="text-meta" />,
      },
    ],
    [],
  );

  return (
    <div>
      <PageHeader
        eyebrow="Operação"
        titulo="Leads"
        subtitulo="Todos os formulários do site, unificados. Clique numa linha para ver tudo o que veio."
        acoesSecundarias={
          <button
            type="button"
            onClick={exportarCsv}
            disabled={exportando}
            className="btn-outline-forest tap-target"
          >
            {exportando ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <Download className="h-4 w-4" aria-hidden="true" />
            )}
            Exportar CSV
          </button>
        }
      />

      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <Tabs
          abas={abas}
          ativa={tipo}
          onChange={(k) => {
            setTipo(k);
            setPage(0);
            const p = new URLSearchParams(searchParams);
            if (k === "all") p.delete("type");
            else p.set("type", k);
            setSearchParams(p, { replace: true });
          }}
        />

        <div className="relative w-full lg:max-w-sm">
          <Search
            className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-western-stone-warm"
            aria-hidden="true"
          />
          <Input
            value={qInput}
            onChange={(e) => setQInput(e.target.value)}
            placeholder="Buscar nome, e-mail, mensagem…"
            aria-label="Buscar leads"
            className="h-[52px] rounded-[6px] border-western-border-strong bg-white pl-11 text-[16px] placeholder:text-western-stone-warm/70"
          />
        </div>
      </div>

      <DataTable
        linhas={leads}
        colunas={colunas}
        getId={(l) => l.id}
        isLoading={carregando}
        error={erro}
        onRetry={recarregar}
        onRowClick={(l) => setDetalhe(l)}
        vazio={{
          titulo: q || tipo !== "all" ? "Nenhum lead neste filtro" : "Nenhum lead ainda",
          mensagem:
            q || tipo !== "all"
              ? "Tente outro tipo ou limpe a busca."
              : "Quando alguém preencher um formulário do site, ele aparece aqui.",
        }}
        selecao={{
          selecionados,
          onChange: setSelecionados,
          barra: (ids) => (
            <>
              <button
                type="button"
                onClick={() => exportarSelecionados(ids)}
                className="btn-outline-forest tap-target px-4"
              >
                <Download className="h-4 w-4" aria-hidden="true" />
                Exportar CSV
              </button>
              <button
                type="button"
                onClick={() => setConfirmarExclusao(true)}
                disabled={excluindo}
                className="tap-target inline-flex items-center justify-center gap-2 rounded-[10px] border border-[#B3372E]/50 px-4 text-[16px] font-semibold text-[#B3372E] transition-colors hover:bg-[#B3372E]/10 disabled:opacity-45"
              >
                {excluindo ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                ) : (
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                )}
                Excluir
              </button>
            </>
          ),
        }}
      />

      {/* Paginação */}
      {!carregando && !erro && total > PAGE_SIZE && (
        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-western-border-soft pt-4">
          <p className="text-meta tabular-nums">
            Página {page + 1} de {totalPaginas} · {total} {total === 1 ? "lead" : "leads"}
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={page === 0}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              className="btn-outline-forest tap-target px-4"
            >
              <ChevronLeft className="h-4 w-4" aria-hidden="true" />
              Anterior
            </button>
            <button
              type="button"
              disabled={page >= totalPaginas - 1}
              onClick={() => setPage((p) => p + 1)}
              className="btn-outline-forest tap-target px-4"
            >
              Próxima
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={confirmarExclusao}
        onOpenChange={setConfirmarExclusao}
        title={`Excluir ${selecionados.size} lead(s) permanentemente?`}
        description="Não tem volta. Os leads selecionados e seu histórico serão apagados."
        confirmLabel={excluindo ? "Excluindo…" : "Excluir"}
        danger
        onConfirm={excluirSelecionados}
      />

      {/* ── Detalhe (painel lateral) ── */}
      <Sheet open={!!detalhe} onOpenChange={(aberto) => !aberto && setDetalhe(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
          {detalhe && (
            <>
              <SheetHeader className="text-left">
                <div className="mb-3">
                  <StatusBadge
                    status={detalhe.type}
                    label={LEAD_TYPE_LABEL[detalhe.type] ?? detalhe.type}
                    tom={TOM_POR_TIPO[detalhe.type] ?? "neutro"}
                  />
                </div>
                <SheetTitle className="display-md text-western-green-deep">
                  {detalhe.nome || detalhe.empresa || detalhe.email || "(sem nome)"}
                </SheetTitle>
                <SheetDescription className="text-meta">
                  Recebido em {dataAbsoluta(detalhe.created_at)}
                  {detalhe.last_activity_at && detalhe.last_activity_at !== detalhe.created_at && (
                    <> · última atividade em {dataAbsoluta(detalhe.last_activity_at)}</>
                  )}
                </SheetDescription>
              </SheetHeader>

              {/* Falar com a pessoa — o próximo passo de um lead é responder. */}
              {(detalhe.telefone || detalhe.email) && (
                <div className="mt-6 flex flex-wrap gap-3">
                  {detalhe.telefone && (
                    <a
                      href={linkWhatsApp(detalhe.telefone)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-primary tap-target flex-1"
                    >
                      <MessageCircle className="h-4 w-4" aria-hidden="true" />
                      WhatsApp
                    </a>
                  )}
                  {detalhe.email && (
                    <a href={`mailto:${detalhe.email}`} className="btn-outline-forest tap-target flex-1">
                      <Mail className="h-4 w-4" aria-hidden="true" />
                      E-mail
                    </a>
                  )}
                </div>
              )}

              <dl className="mt-8 space-y-3">
                <Campo rotulo="Nome" valor={detalhe.nome} />
                <Campo rotulo="E-mail" valor={detalhe.email} />
                <Campo rotulo="Telefone" valor={detalhe.telefone} />
                <Campo rotulo="Empresa" valor={detalhe.empresa} />
                <Campo rotulo="CNPJ" valor={detalhe.cnpj} numerica />
                <Campo rotulo="Segmento" valor={detalhe.segmento} />
                <Campo rotulo="Cidade/UF" valor={[detalhe.cidade, detalhe.uf].filter(Boolean).join("/")} />
                <Campo rotulo="Endereço" valor={detalhe.endereco} />
                <Campo rotulo="CEP" valor={detalhe.cep} numerica />
                <Campo rotulo="Origem" valor={detalhe.origem} />
              </dl>

              {detalhe.mensagem && (
                <div className="mt-6 rounded-[16px] border border-western-border-soft bg-western-paper p-4">
                  <p className="text-eyebrow mb-2">Mensagem</p>
                  <p className="text-[17px] leading-[1.6] whitespace-pre-wrap text-western-green-deep">
                    {detalhe.mensagem}
                  </p>
                </div>
              )}

              {detalhe.payload && Object.keys(detalhe.payload).length > 0 && (
                <div className="mt-6 border-t border-western-border-soft pt-5">
                  <p className="text-eyebrow mb-3">Dados adicionais</p>
                  <dl className="space-y-3">
                    {Object.entries(detalhe.payload).map(([k, v]) => (
                      <Campo
                        key={k}
                        rotulo={k}
                        valor={v === null || v === undefined ? "" : typeof v === "object" ? JSON.stringify(v) : String(v)}
                      />
                    ))}
                  </dl>
                </div>
              )}
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

function Campo({ rotulo, valor, numerica }: { rotulo: string; valor?: string | null; numerica?: boolean }) {
  if (!valor) return null;
  return (
    <div className="flex flex-col gap-0.5 sm:flex-row sm:gap-4">
      <dt className="text-sublabel sm:w-36 sm:flex-shrink-0 sm:pt-0.5">{rotulo}</dt>
      <dd
        className={`flex-1 break-words text-[16px] text-western-green-deep ${numerica ? "tabular-nums" : ""}`}
      >
        {valor}
      </dd>
    </div>
  );
}
