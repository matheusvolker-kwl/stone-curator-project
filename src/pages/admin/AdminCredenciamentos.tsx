import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Search, ShieldCheck, ShieldX, ExternalLink, ChevronRight, FileText } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  DataTable, type Coluna,
  EstadoErro,
  StatusBadge, type TomStatus,
  Tabs,
  CelulaData,
} from "@/components/backoffice";
import { TIERS, TIER_LABEL, type Tier } from "@/components/admin/adminUtils";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";

/**
 * Credenciamentos — a fila de revisão humana.
 *
 * Esta tela é embutida em /admin/parceiros (aba "Credenciamento"), por isso NÃO
 * tem PageHeader próprio: quem dá o título é a página que a hospeda.
 *
 * O que era bug e foi consertado:
 *  1. `load()` fazia toast do erro e mesmo assim `setRows(data ?? [])` — um 403
 *     virava "Nenhum cadastro" e o dono ficava CEGO. Agora o erro vira estado e
 *     a tabela mostra EstadoErro (tela diferente do vazio) com "Tentar de novo".
 *  2. Aprovar gravava `credenciamentos.status_manual = aprovado` e depois fazia
 *     `await supabase.from("partner_profiles").update(...)` SEM olhar o erro. Se
 *     essa segunda escrita falhasse, o painel dizia "Aprovado" e o parceiro
 *     continuava sem acesso ao atacado. Agora o erro é propagado.
 */

interface Cred {
  id: string;
  created_at: string;
  user_id: string | null;
  cnpj: string;
  nome: string | null;
  email: string | null;
  empresa: string | null;
  decisao: "aprovado" | "analise" | "reprovado" | "solicitar_cartao";
  motivo: string | null;
  fonte: string | null;
  cnae_principal: string | null;
  cnaes_secundarios: string[] | null;
  cnae_match: string | null;
  cnae_match_tier: string | null;
  situacao: string | null;
  tier: string | null;
  protocolo: string | null;
  card_path: string | null;
  status_manual: "pendente" | "aprovado" | "recusado" | "na";
  reviewed_by: string | null;
  reviewed_at: string | null;
  review_note: string | null;
}

const formatCnpj = (c: string) => c.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, "$1.$2.$3/$4-$5");
const formatCnae = (c: string | null) => c ? c.replace(/^(\d{4})(\d)(\d{2})$/, "$1-$2/$3") : "—";

const DECISAO_LABEL: Record<string, string> = {
  aprovado: "Aprovado",
  analise: "Precisa da sua análise",
  reprovado: "Reprovado (empresa inativa)",
  solicitar_cartao: "Aguardando Cartão CNPJ",
};

/** Tom da decisão automática — dessaturado, na paleta semântica do DS. */
const DECISAO_TOM: Record<string, TomStatus> = {
  aprovado: "positivo",
  analise: "aviso",
  reprovado: "negativo",
  solicitar_cartao: "info",
};

function fonteLabel(f: string | null | undefined): string {
  if (!f || f === "na") return "Não confirmado";
  if (f === "receitaws" || f === "brasilapi" || f === "cnpja") return "Governo (Receita)";
  if (f === "cartao" || f === "documento") return "Documento enviado";
  return f;
}

/**
 * Grava a decisão. Regra de negócio inalterada — o que mudou é que agora o erro
 * da SEGUNDA escrita (partner_profiles) também sobe. Sem isto, "aprovado" podia
 * ser mentira: o cadastro virava aprovado e o acesso ao atacado, não.
 */
async function aplicarDecisao(
  r: Cred,
  decisao: "aprovado" | "recusado",
  opts?: { tier?: Tier; note?: string },
) {
  const tier: Tier = opts?.tier ?? ((r.tier as Tier) || "light");

  const patch: Record<string, unknown> = {
    status_manual: decisao,
    reviewed_at: new Date().toISOString(),
  };
  if (opts?.note !== undefined) patch.review_note = opts.note || null;
  if (decisao === "aprovado") patch.tier = tier;

  const { error } = await supabase.from("credenciamentos").update(patch as never).eq("id", r.id);
  if (error) throw error;

  if (!r.user_id) return;

  if (decisao === "aprovado") {
    const { error: perfilErro } = await supabase.from("partner_profiles").update({
      status: "approved",
      tier,
      credenciamento_id: r.id,
      credenciado_em: new Date().toISOString(),
      credenciado_fonte: r.fonte ?? "manual",
      approved_at: new Date().toISOString(),
    } as never).eq("user_id", r.user_id);
    if (perfilErro) throw perfilErro;
  } else {
    const { error: perfilErro } = await supabase
      .from("partner_profiles")
      .update({ status: "rejected" } as never)
      .eq("user_id", r.user_id);
    if (perfilErro) throw perfilErro;
  }
}

export function CredenciamentoTab() {
  const [rows, setRows] = useState<Cred[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<unknown>(null);
  const [tab, setTab] = useState<"pendentes" | "decididos">("pendentes");
  const [q, setQ] = useState("");
  const [editing, setEditing] = useState<Cred | null>(null);
  const [selecionados, setSelecionados] = useState<Set<string>>(new Set());
  const [confirmApproveOpen, setConfirmApproveOpen] = useState(false);
  const [confirmRejectOpen, setConfirmRejectOpen] = useState(false);
  const [bulkBusy, setBulkBusy] = useState(false);

  const load = useCallback(async () => {
    setCarregando(true);
    setErro(null);
    const { data, error } = await supabase
      .from("credenciamentos")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(500);
    // Sem isto, um 403 vira "nenhum cadastro" e o dono não vê o parceiro esperando.
    if (error) setErro(error);
    else setRows((data as Cred[]) ?? []);
    setCarregando(false);
  }, []);

  useEffect(() => { void load(); }, [load]);

  const porStatus = useMemo(() => {
    const pendentes = rows.filter((r) => r.status_manual === "pendente");
    return { pendentes, decididos: rows.filter((r) => r.status_manual !== "pendente") };
  }, [rows]);

  const filtered = useMemo(() => {
    const base = tab === "pendentes" ? porStatus.pendentes : porStatus.decididos;
    const termo = q.trim().toLowerCase();
    if (!termo) return base;
    return base.filter((r) =>
      [r.empresa, r.nome, r.cnpj, r.email, r.protocolo]
        .filter(Boolean).join(" ").toLowerCase().includes(termo),
    );
  }, [porStatus, tab, q]);

  // Trocar de aba ou buscar zera a seleção — senão o dono aprova o que não vê.
  useEffect(() => { setSelecionados(new Set()); }, [tab, q]);

  const isPendentes = tab === "pendentes";

  const linhasSelecionadas = useMemo(
    () => rows.filter((r) => selecionados.has(r.id) && r.status_manual === "pendente"),
    [rows, selecionados],
  );
  const aprovaveis = useMemo(() => linhasSelecionadas.filter((r) => !!r.user_id), [linhasSelecionadas]);
  const semConta = linhasSelecionadas.length - aprovaveis.length;

  const limparSelecao = () => setSelecionados(new Set());

  const handleBulkApprove = async () => {
    if (aprovaveis.length === 0) {
      toast.error("Nenhum cadastro elegível.", { description: "Os selecionados não têm conta vinculada." });
      setConfirmApproveOpen(false);
      return;
    }
    setBulkBusy(true);
    const results = await Promise.allSettled(aprovaveis.map((r) => aplicarDecisao(r, "aprovado")));
    const ok = results.filter((x) => x.status === "fulfilled").length;
    const falhas = results.length - ok;
    setBulkBusy(false);
    setConfirmApproveOpen(false);

    if (falhas === 0 && semConta === 0) {
      toast.success(`${ok} cadastro(s) aprovado(s).`);
    } else if (ok === 0) {
      toast.error("Nenhum cadastro foi aprovado.", {
        description: falhas ? `${falhas} falharam. Tente de novo.` : undefined,
      });
    } else {
      toast.success(`${ok} aprovado(s).`, {
        description: [
          falhas ? `${falhas} falharam` : null,
          semConta ? `${semConta} pulados (sem conta vinculada)` : null,
        ].filter(Boolean).join(" · "),
      });
    }
    limparSelecao();
    await load();
  };

  const handleBulkReject = async () => {
    if (linhasSelecionadas.length === 0) { setConfirmRejectOpen(false); return; }
    setBulkBusy(true);
    const results = await Promise.allSettled(linhasSelecionadas.map((r) => aplicarDecisao(r, "recusado")));
    const ok = results.filter((x) => x.status === "fulfilled").length;
    const falhas = results.length - ok;
    setBulkBusy(false);
    setConfirmRejectOpen(false);

    if (ok === 0) toast.error("Nenhum cadastro foi recusado.", { description: `${falhas} falharam.` });
    else toast.success(`${ok} recusado(s).`, falhas ? { description: `${falhas} falharam` } : undefined);

    limparSelecao();
    await load();
  };

  const colunas: ReadonlyArray<Coluna<Cred>> = useMemo(() => {
    const base: Coluna<Cred>[] = [
      {
        key: "empresa",
        header: "Empresa / CNPJ",
        principalNoMobile: true,
        sortable: true,
        sortValue: (r) => r.empresa ?? r.nome ?? r.cnpj,
        render: (r) => (
          <div className="min-w-0">
            <p className="font-semibold text-western-green-deep truncate">{r.empresa ?? r.nome ?? "—"}</p>
            <p className="text-[14px] text-western-stone-warm tabular-nums truncate">
              {formatCnpj(r.cnpj)}
              {r.email ? ` · ${r.email}` : ""}
            </p>
            {isPendentes && !r.user_id && (
              <span className="mt-1 inline-flex items-center rounded-sm border border-status-warning/30 bg-status-warning/[0.07] px-2 py-0.5 text-[14px] font-semibold leading-none text-status-warning">
                Sem conta vinculada
              </span>
            )}
          </div>
        ),
      },
      {
        key: "decisao",
        header: "Decisão automática",
        sortable: true,
        render: (r) => (
          <StatusBadge
            status={r.decisao}
            label={DECISAO_LABEL[r.decisao] ?? r.decisao}
            tom={DECISAO_TOM[r.decisao] ?? "neutro"}
          />
        ),
      },
      {
        key: "cnae_principal",
        header: "CNAE",
        numerica: true,
        ocultarNoMobile: true,
        render: (r) => (
          <div className="whitespace-nowrap">
            <p className="text-[15px] text-western-green-deep">{formatCnae(r.cnae_principal)}</p>
            {r.cnae_match && r.cnae_match !== r.cnae_principal && (
              <p className="text-[14px] text-western-stone-warm">
                match {formatCnae(r.cnae_match)} · {r.cnae_match_tier}
              </p>
            )}
          </div>
        ),
      },
      {
        key: "fonte",
        header: "Confirmação",
        ocultarNoMobile: true,
        sortable: true,
        sortValue: (r) => fonteLabel(r.fonte),
        render: (r) => <span className="text-[15px] text-western-stone-warm">{fonteLabel(r.fonte)}</span>,
      },
      {
        key: "card_path",
        header: "Cartão",
        ocultarNoMobile: true,
        render: (r) =>
          r.card_path ? (
            <span className="inline-flex items-center gap-1.5 text-[15px] font-semibold text-western-bronze">
              <FileText className="h-4 w-4" aria-hidden="true" /> Enviado
            </span>
          ) : (
            <span className="text-meta">—</span>
          ),
      },
      {
        key: "created_at",
        header: "Recebido",
        align: "right",
        sortable: true,
        sortValue: (r) => r.created_at,
        render: (r) => <CelulaData valor={r.created_at} className="text-western-stone-warm" />,
      },
    ];

    // Na aba "Decididos", o que importa é o veredito humano — não o automático.
    if (!isPendentes) {
      base.splice(2, 0, {
        key: "status_manual",
        header: "Revisão",
        sortable: true,
        render: (r) => <StatusBadge status={r.status_manual} />,
      });
    }

    base.push({
      key: "acao",
      header: "",
      align: "right",
      width: "56px",
      ocultarNoMobile: true,
      render: () => (
        <ChevronRight className="ml-auto h-4 w-4 text-western-stone-warm/45" aria-hidden="true" />
      ),
    });

    return base;
  }, [isPendentes]);

  return (
    <div>
      <p className="text-body mb-6 max-w-3xl">
        Cadastros que precisam de revisão humana — CNAE em faixa amarela/laranja, fora da whitelist,
        ou Cartão CNPJ enviado.
      </p>

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <Tabs
          abas={[
            { key: "pendentes", label: "Pendentes", count: carregando || erro ? undefined : porStatus.pendentes.length },
            { key: "decididos", label: "Decididos", count: carregando || erro ? undefined : porStatus.decididos.length },
          ]}
          ativa={tab}
          onChange={(k) => setTab(k as "pendentes" | "decididos")}
        />

        <div className="relative ml-auto min-w-[240px] flex-1 md:max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-western-stone-warm" aria-hidden="true" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Empresa, CNPJ, e-mail, protocolo…"
            aria-label="Buscar credenciamento"
            className="h-tap rounded-sm border-western-border-strong bg-white pl-10 text-[15px] text-western-green-deep placeholder:text-western-stone-warm/70"
          />
        </div>
      </div>

      <DataTable
        linhas={filtered}
        colunas={colunas}
        getId={(r) => r.id}
        isLoading={carregando}
        error={erro}
        onRetry={load}
        onRowClick={(r) => setEditing(r)}
        vazio={
          isPendentes
            ? {
                titulo: q ? "Nenhum cadastro encontrado" : "Nenhum credenciamento pendente",
                mensagem: q
                  ? "Nada bate com essa busca. Limpe o campo para ver a fila inteira."
                  : "Quando um cadastro cair em análise manual, ele aparece aqui.",
              }
            : {
                titulo: q ? "Nenhum cadastro encontrado" : "Nada decidido ainda",
                mensagem: q
                  ? "Nada bate com essa busca."
                  : "Cadastros aprovados ou recusados por você ficam registrados aqui.",
              }
        }
        selecao={
          isPendentes
            ? {
                selecionados,
                onChange: setSelecionados,
                barra: () => (
                  <>
                    {semConta > 0 && (
                      <span className="text-[14px] font-semibold text-status-warning">
                        {semConta} sem conta — será pulado
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => setConfirmRejectOpen(true)}
                      disabled={bulkBusy}
                      className="tap-target inline-flex items-center gap-2 rounded-lg border border-status-error/45 px-4 text-[15px] font-semibold text-status-error transition-colors hover:bg-status-error/10 disabled:opacity-45"
                    >
                      <ShieldX className="h-4 w-4" aria-hidden="true" />
                      Recusar
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmApproveOpen(true)}
                      disabled={bulkBusy || aprovaveis.length === 0}
                      className="btn-primary"
                    >
                      <ShieldCheck className="h-4 w-4" aria-hidden="true" />
                      Aprovar {aprovaveis.length > 0 ? aprovaveis.length : ""}
                    </button>
                  </>
                ),
              }
            : undefined
        }
      />

      <ConfirmDialog
        open={confirmApproveOpen}
        onOpenChange={setConfirmApproveOpen}
        title={`Aprovar ${aprovaveis.length} cadastro(s)?`}
        description={
          <>
            Eles ganham acesso ao catálogo de atacado <strong>na hora</strong>, com o nível atual de cada cadastro.
            {semConta > 0 && (
              <>
                {"\n\n"}Atenção: {semConta} selecionado(s) sem conta vinculada serão pulados.
              </>
            )}
            {"\n\n"}Digite APROVAR para confirmar.
          </>
        }
        confirmLabel={bulkBusy ? "Aprovando…" : `Aprovar ${aprovaveis.length}`}
        requireText="APROVAR"
        onConfirm={handleBulkApprove}
      />

      <ConfirmDialog
        open={confirmRejectOpen}
        onOpenChange={setConfirmRejectOpen}
        title={`Recusar ${linhasSelecionadas.length} cadastro(s)?`}
        description="Os cadastros ficam marcados como recusados e o parceiro não terá acesso ao atacado."
        confirmLabel={bulkBusy ? "Recusando…" : `Recusar ${linhasSelecionadas.length}`}
        danger
        onConfirm={handleBulkReject}
      />

      <ReviewDrawer cred={editing} onClose={() => setEditing(null)} onSaved={load} />
    </div>
  );
}

export default CredenciamentoTab;

/* ─────────────────────────────────────────────────────────────
 * Detalhe / decisão
 * ───────────────────────────────────────────────────────────── */

function ReviewDrawer({ cred, onClose, onSaved }: { cred: Cred | null; onClose: () => void; onSaved: () => void }) {
  const [tier, setTier] = useState<Tier>("light");
  const [note, setNote] = useState("");
  const [cardUrl, setCardUrl] = useState<string | null>(null);
  const [cardErro, setCardErro] = useState<unknown>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!cred) return;
    setTier((cred.tier as Tier) ?? "light");
    setNote("");
    setCardUrl(null);
    setCardErro(null);
    if (cred.card_path) {
      supabase.storage.from("cartoes-cnpj").createSignedUrl(cred.card_path, 300).then(({ data, error }) => {
        // O documento é a prova. Se o link falhar, o dono precisa SABER — não
        // pode simplesmente sumir da tela como se não houvesse cartão.
        if (error) setCardErro(error);
        else setCardUrl(data?.signedUrl ?? null);
      });
    }
  }, [cred]);

  if (!cred) return null;

  const apply = async (decisao: "aprovado" | "recusado") => {
    setSaving(true);
    try {
      await aplicarDecisao(cred, decisao, { tier, note });
      toast.success(decisao === "aprovado" ? "Cadastro aprovado." : "Cadastro recusado.");
      onSaved();
      onClose();
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      toast.error("Falha ao salvar a decisão.", { description: msg });
    } finally {
      setSaving(false);
    }
  };

  const reavaliar = async () => {
    setSaving(true);
    const { data, error } = await supabase.functions.invoke("credenciar", {
      body: {
        cnpj: cred.cnpj,
        nome: cred.nome ?? undefined,
        email: cred.email ?? undefined,
        mode: "reavaliar",
        credenciamento_id: cred.id,
      },
    });
    setSaving(false);
    if (error) { toast.error("Falha ao reavaliar.", { description: error.message }); return; }
    const decisao = (data as { decisao?: string } | null)?.decisao ?? "?";
    toast.success(`Reavaliado: ${DECISAO_LABEL[decisao] ?? decisao}.`);
    onSaved();
    onClose();
  };

  return (
    <Sheet open={!!cred} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
        <SheetHeader className="text-left">
          <SheetTitle className="display-md text-western-green-deep">
            {cred.empresa ?? cred.nome ?? "Sem nome"}
          </SheetTitle>
          <SheetDescription className="text-[15px] tabular-nums text-western-stone-warm">
            {formatCnpj(cred.cnpj)}{cred.protocolo ? ` · ${cred.protocolo}` : ""}
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* O veredito da máquina, e por quê. */}
          <section className="rounded-xl border border-western-border-soft bg-western-paper p-4">
            <p className="text-eyebrow mb-3">Decisão automática</p>
            <div className="flex flex-wrap items-center gap-3">
              <StatusBadge
                status={cred.decisao}
                label={DECISAO_LABEL[cred.decisao] ?? cred.decisao}
                tom={DECISAO_TOM[cred.decisao] ?? "neutro"}
              />
              <span className="text-[15px] text-western-stone-warm">
                Confirmação: {fonteLabel(cred.fonte)}
              </span>
            </div>
            {cred.motivo && <p className="text-body mt-3 text-[15px]">{cred.motivo}</p>}
          </section>

          <dl className="space-y-3">
            <Linha k="Situação" v={cred.situacao} />
            <Linha k="Nome" v={cred.nome} />
            <Linha k="E-mail" v={cred.email} />
            <Linha k="CNAE principal" v={formatCnae(cred.cnae_principal)} />
            <Linha
              k="CNAE que deu match"
              v={cred.cnae_match ? `${formatCnae(cred.cnae_match)} (faixa ${cred.cnae_match_tier})` : "—"}
            />
            <Linha
              k="Secundários"
              v={cred.cnaes_secundarios?.length ? cred.cnaes_secundarios.map(formatCnae).join(", ") : "—"}
            />
            {cred.status_manual !== "pendente" && cred.status_manual !== "na" && (
              <Linha k="Revisão" v={`${cred.status_manual === "aprovado" ? "Aprovado" : "Recusado"}${cred.review_note ? ` — ${cred.review_note}` : ""}`} />
            )}
          </dl>

          {cred.card_path && (
            <section className="rounded-xl border border-western-border-soft p-4">
              <p className="text-eyebrow mb-3">Cartão CNPJ</p>
              {cardErro ? (
                <EstadoErro erro={cardErro} titulo="Não consegui abrir o documento" compacto />
              ) : cardUrl ? (
                <a
                  href={cardUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="tap-target inline-flex items-center gap-2 text-[15px] font-semibold text-western-bronze hover:text-western-green-deep"
                >
                  Abrir documento
                  <ExternalLink className="h-4 w-4" aria-hidden="true" />
                </a>
              ) : (
                <Loader2 className="h-4 w-4 animate-spin text-western-stone-warm" aria-label="Carregando documento" />
              )}
            </section>
          )}

          {/* Card de ação — o próximo passo, sempre no fim e sempre igual. */}
          <section className="space-y-4 border-t border-western-border-soft pt-6">
            <div>
              <Label className="text-eyebrow mb-2 block">Nível ao aprovar</Label>
              <Select value={tier} onValueChange={(v) => setTier(v as Tier)}>
                <SelectTrigger className="h-control rounded-sm border-western-border-strong text-[15px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TIERS.map((t) => <SelectItem key={t} value={t}>{TIER_LABEL[t]}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-eyebrow mb-2 block">Nota interna (opcional)</Label>
              <Input
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Fica registrada no cadastro."
                className="h-control rounded-sm border-western-border-strong text-[15px]"
              />
            </div>

            {!cred.user_id && (
              <p className="rounded-lg border border-status-warning/35 bg-status-warning/[0.07] p-3 text-[15px] leading-[1.5] text-status-warning">
                Cadastro sem conta vinculada — não é possível liberar o acesso. O cliente precisa criar
                a conta em /parceiro/cadastro primeiro.
              </p>
            )}

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => apply("recusado")}
                disabled={saving}
                className="tap-target inline-flex h-control items-center justify-center gap-2 rounded-lg border border-status-error/45 px-5 text-[15px] font-semibold text-status-error transition-colors hover:bg-status-error/10 disabled:opacity-45"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <ShieldX className="h-4 w-4" aria-hidden="true" />}
                Recusar
              </button>

              <button
                type="button"
                onClick={() => apply("aprovado")}
                disabled={saving || !cred.user_id}
                className="btn-primary"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <ShieldCheck className="h-4 w-4" aria-hidden="true" />}
                Aprovar
              </button>
            </div>

            <button
              type="button"
              onClick={reavaliar}
              disabled={saving}
              className="tap-target w-full rounded-lg border border-western-border-strong px-5 text-[15px] font-semibold text-western-stone-warm transition-colors hover:border-western-green-deep hover:text-western-green-deep disabled:opacity-45"
            >
              Reavaliar nas fontes (Receita / BrasilAPI / CNPJá)
            </button>
          </section>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function Linha({ k, v }: { k: string; v: string | null | undefined }) {
  return (
    <div className="flex gap-4">
      <dt className="w-[150px] flex-shrink-0 text-[14px] font-semibold uppercase tracking-[0.06em] text-western-bronze">
        {k}
      </dt>
      <dd className="min-w-0 flex-1 break-words text-[15px] text-western-green-deep">{v || "—"}</dd>
    </div>
  );
}
