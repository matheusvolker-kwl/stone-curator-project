import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Check, ChevronsUpDown, Download, ExternalLink, Instagram, Globe,
  Loader2, MessageCircle, Save, Search, ShieldCheck, ShieldX, Trash2, X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription,
} from "@/components/ui/sheet";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  DataTable, type Coluna, EstadoErro, StatusBadge, Tabs, PageHeader, CelulaData,
} from "@/components/backoffice";
import { toCSV, downloadCSV, TIERS, TIER_LABEL, type Partner, type Tier } from "@/components/admin/adminUtils";
import { CredenciamentoTab } from "./AdminCredenciamentos";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { cn } from "@/lib/utils";

/**
 * PARCEIROS — lista → detalhe.
 *
 * A lista é a mesma <DataTable/> do resto do backoffice (4 estados, ordenação,
 * seleção). O detalhe é uma tela de duas colunas: dados à esquerda, CARD DE AÇÃO
 * fixo à direita — o card responde "qual é o próximo passo com este parceiro?".
 *
 * O detalhe vive em `?id=` (mesma rota, sem mexer no App.tsx), então é linkável
 * e sobrevive a um F5.
 *
 * Nada de "0 silencioso": toda query guarda o erro cru e a tela mostra a mensagem
 * real. Contagem desconhecida fica `undefined` — nunca 0.
 */

type Aba = "credenciamento" | "ativos";
type FiltroStatus = "all" | Partner["status"];

const STATUS_ORDEM: Partner["status"][] = ["pending", "approved", "rejected", "cancelled"];
const STATUS_ROTULO: Record<Partner["status"], string> = {
  pending: "Em análise",
  approved: "Aprovados",
  rejected: "Recusados",
  cancelled: "Cancelados",
};

/* Nível é um atributo comercial, não um status — badge próprio, dessaturado. */
const NIVEL_CLS: Record<Tier, string> = {
  padrao: "border-western-border-strong bg-western-paper text-western-stone-warm",
  vitrine: "border-western-gold/45 bg-western-gold/10 text-western-bronze",
  partner: "border-western-cta/35 bg-western-cta/[0.07] text-western-cta",
};

function NivelBadge({ tier }: { tier: Tier }) {
  return (
    <span
      className={cn(
        "inline-flex items-center whitespace-nowrap rounded-sm border px-2.5 py-1",
        "text-[14px] font-semibold leading-none",
        NIVEL_CLS[tier] ?? NIVEL_CLS.padrao,
      )}
    >
      {TIER_LABEL[tier] ?? tier}
    </span>
  );
}

/** Só formata o telefone que já existe. Não inventa DDI/DDD. */
function linkWhatsApp(telefone: string | null): string | null {
  if (!telefone) return null;
  const digitos = telefone.replace(/\D/g, "");
  if (digitos.length < 10) return null;
  const comDDI = digitos.length <= 11 ? `55${digitos}` : digitos;
  return `https://wa.me/${comDDI}`;
}

function linkSite(site: string | null): string | null {
  if (!site) return null;
  return /^https?:\/\//i.test(site) ? site : `https://${site}`;
}

/* ═══════════════════════════════════════════════════════════════════════════
 * Página
 * ═══════════════════════════════════════════════════════════════════════════ */

export default function AdminPartners() {
  const [searchParams, setSearchParams] = useSearchParams();
  const aba: Aba = searchParams.get("tab") === "ativos" ? "ativos" : "credenciamento";
  const detalheId = searchParams.get("id");

  const [contagens, setContagens] = useState<{ cred?: number; parceiros?: number }>({});
  const [erroContagens, setErroContagens] = useState<unknown>(null);

  const carregarContagens = useCallback(async () => {
    setErroContagens(null);
    const [c, p] = await Promise.all([
      supabase.from("credenciamentos").select("id", { count: "exact", head: true }).eq("status_manual", "pendente"),
      supabase.from("partner_profiles").select("id", { count: "exact", head: true }),
    ]);
    /* Um 403 aqui NÃO pode virar "0 pendentes". Sem número > número errado. */
    if (c.error || p.error) {
      setErroContagens(c.error ?? p.error);
      setContagens({});
      return;
    }
    setContagens({ cred: c.count ?? 0, parceiros: p.count ?? 0 });
  }, []);

  useEffect(() => { carregarContagens(); }, [carregarContagens]);

  const irPara = (proxima: Aba) => {
    const next = new URLSearchParams(searchParams);
    next.set("tab", proxima);
    next.delete("id");
    setSearchParams(next, { replace: true });
  };

  const abrirDetalhe = (id: string) => {
    const next = new URLSearchParams(searchParams);
    next.set("tab", "ativos");
    next.set("id", id);
    setSearchParams(next);
  };

  const fecharDetalhe = () => {
    const next = new URLSearchParams(searchParams);
    next.delete("id");
    setSearchParams(next);
  };

  /* ── DETALHE (lista → detalhe, mesma rota) ── */
  if (detalheId) {
    return (
      <ParceiroDetalhe
        id={detalheId}
        onVoltar={fecharDetalhe}
        onMudou={carregarContagens}
        onIrParaCredenciamento={() => irPara("credenciamento")}
      />
    );
  }

  return (
    <div>
      <PageHeader
        eyebrow="Programa Western Pro"
        titulo="Parceiros"
        subtitulo="Analise credenciamentos, gerencie parceiros ativos e ajuste nível, desconto e permissões."
      />

      {erroContagens && (
        <EstadoErro
          compacto
          className="mb-6"
          titulo="Não consegui contar as pendências"
          erro={erroContagens}
          onRetry={carregarContagens}
        />
      )}

      <Tabs
        className="mb-6"
        abas={[
          { key: "credenciamento", label: "Credenciamento", count: contagens.cred },
          { key: "ativos", label: "Parceiros", count: contagens.parceiros },
        ]}
        ativa={aba}
        onChange={(k) => irPara(k as Aba)}
      />

      {aba === "credenciamento" ? (
        <CredenciamentoTab />
      ) : (
        <ListaParceiros onAbrir={abrirDetalhe} onMudou={carregarContagens} />
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
 * Dados (compartilhados por lista e detalhe)
 * ═══════════════════════════════════════════════════════════════════════════ */

/**
 * 9.0909 -> "9,0909" · 5 -> "5" · 10 -> "10" · 0 -> "0"
 *
 * So mexe DEPOIS da virgula. A primeira versao usava /\.?0+$/ e comia o zero
 * de numeros inteiros: 10 virava "1" e 0 virava vazio — um desconto de 10%
 * apareceria como 1% no painel.
 */
function formatarPct(n: number): string {
  const t = String(n);
  if (!t.includes(".")) return t;
  return t.replace(/0+$/, "").replace(/\.$/, "").replace(".", ",");
}

/**
 * O que o percentual significa na tabela comercial (regra de 29/08/2026).
 * O dono le a tabela em "quanto o parceiro paga", nao em percentual — e os
 * numeros ficaram quebrados de proposito, para o PRECO fechar exato.
 */
const SIGNIFICADO_TIER: Record<Tier, string> = {
  padrao: "paga o preço de tabela cheio",
  vitrine: "paga 5% acima da tabela de atacado",
  partner: "paga a tabela de atacado, sem acréscimo",
};

/** Percentual efetivo: override individual, senão o padrão do nível. */
function descontoEfetivo(p: Partner, padroes: Record<string, number>) {
  const padrao = padroes[p.tier] ?? null;
  const usado = p.discount_override ?? padrao;
  return { padrao, usado, personalizado: p.discount_override != null };
}

/* ═══════════════════════════════════════════════════════════════════════════
 * LISTA
 * ═══════════════════════════════════════════════════════════════════════════ */

function ListaParceiros({
  onAbrir, onMudou,
}: {
  onAbrir: (id: string) => void;
  onMudou: () => void;
}) {
  const [parceiros, setParceiros] = useState<Partner[]>([]);
  const [padroesTier, setPadroesTier] = useState<Record<string, number>>({});
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<unknown>(null);

  const [filtroStatus, setFiltroStatus] = useState<FiltroStatus>("all");
  const [filtroSegmento, setFiltroSegmento] = useState("all");
  const [filtroUf, setFiltroUf] = useState("all");
  const [busca, setBusca] = useState("");

  const [selecionados, setSelecionados] = useState<Set<string>>(new Set());
  const [ocupado, setOcupado] = useState(false);
  const [nivelEmLote, setNivelEmLote] = useState<Tier>("padrao");
  const [abrirNivelLote, setAbrirNivelLote] = useState(false);
  const [confirmarNivel, setConfirmarNivel] = useState(false);
  const [confirmarRevogar, setConfirmarRevogar] = useState(false);
  const [confirmarExcluir, setConfirmarExcluir] = useState(false);

  const carregar = useCallback(async () => {
    setCarregando(true);
    setErro(null);
    const [pr, tdr] = await Promise.all([
      supabase.from("partner_profiles").select("*").order("created_at", { ascending: false }),
      supabase.from("tier_defaults").select("tier, discount_pct"),
    ]);
    /* O erro é guardado CRU e mostrado. Nunca `data ?? []` em cima de um erro. */
    if (pr.error) {
      setErro(pr.error);
      setCarregando(false);
      return;
    }
    setParceiros((pr.data as Partner[]) ?? []);

    /* tier_defaults é acessório: se falhar, a lista ainda vale — mas o desconto
     * padrão vira "—" em vez de mentir um percentual. */
    const mapa: Record<string, number> = {};
    if (!tdr.error) {
      ((tdr.data ?? []) as Array<{ tier: string; discount_pct: number }>).forEach((t) => {
        mapa[t.tier] = t.discount_pct;
      });
    }
    setPadroesTier(mapa);
    setCarregando(false);
  }, []);

  useEffect(() => { carregar(); }, [carregar]);

  const segmentos = useMemo(
    () => Array.from(new Set(parceiros.map((p) => p.segmento).filter(Boolean))) as string[],
    [parceiros],
  );
  const ufs = useMemo(
    () => Array.from(new Set(parceiros.map((p) => p.estado).filter(Boolean))) as string[],
    [parceiros],
  );

  const porStatus = useMemo(() => {
    const c: Record<string, number> = {};
    parceiros.forEach((p) => { c[p.status] = (c[p.status] ?? 0) + 1; });
    return c;
  }, [parceiros]);

  const filtrados = useMemo(() => parceiros.filter((p) => {
    if (filtroStatus !== "all" && p.status !== filtroStatus) return false;
    if (filtroSegmento !== "all" && p.segmento !== filtroSegmento) return false;
    if (filtroUf !== "all" && p.estado !== filtroUf) return false;
    if (busca) {
      const alvo = [p.nome, p.empresa, p.cnpj, p.cidade].filter(Boolean).join(" ").toLowerCase();
      if (!alvo.includes(busca.toLowerCase())) return false;
    }
    return true;
  }), [parceiros, filtroStatus, filtroSegmento, filtroUf, busca]);

  /* Mudou o filtro → a seleção antiga não faz mais sentido. */
  useEffect(() => { setSelecionados(new Set()); }, [filtroStatus, filtroSegmento, filtroUf, busca]);

  const linhasSelecionadas = useMemo(
    () => parceiros.filter((p) => selecionados.has(p.id)),
    [parceiros, selecionados],
  );
  const aprovadosSelecionados = useMemo(
    () => linhasSelecionadas.filter((p) => p.status === "approved"),
    [linhasSelecionadas],
  );

  const colunas = useMemo<ReadonlyArray<Coluna<Partner>>>(() => [
    {
      key: "empresa",
      header: "Empresa",
      principalNoMobile: true,
      sortable: true,
      sortValue: (p) => p.empresa ?? p.nome ?? "",
      render: (p) => (
        <div className="min-w-0">
          <p className="truncate font-semibold text-western-green-deep">{p.empresa || p.nome || "—"}</p>
          <p className="truncate text-[14px] text-western-stone-warm">
            {[p.nome, p.cnpj].filter(Boolean).join(" · ") || "sem CNPJ"}
          </p>
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      width: "150px",
      sortable: true,
      render: (p) => <StatusBadge status={p.status} />,
    },
    {
      key: "tier",
      header: "Nível",
      width: "190px",
      sortable: true,
      render: (p) => (p.status === "approved" ? <NivelBadge tier={p.tier} /> : <span className="text-meta">—</span>),
    },
    {
      key: "desconto",
      header: "Desconto",
      align: "right",
      width: "130px",
      sortable: true,
      sortValue: (p) => descontoEfetivo(p, padroesTier).usado,
      render: (p) => {
        if (p.status !== "approved") return <span className="text-meta">—</span>;
        const { usado, personalizado } = descontoEfetivo(p, padroesTier);
        if (usado == null) return <span className="text-meta">—</span>;
        return (
          <span className={cn("font-semibold", personalizado && "text-western-bronze")}>
            {usado}%{personalizado ? " *" : ""}
          </span>
        );
      },
    },
    {
      key: "local",
      header: "Cidade/UF",
      width: "170px",
      sortable: true,
      sortValue: (p) => p.cidade ?? "",
      ocultarNoMobile: true,
      render: (p) => [p.cidade, p.estado].filter(Boolean).join("/") || "—",
    },
    {
      key: "created_at",
      header: "Entrou",
      align: "right",
      width: "140px",
      sortable: true,
      render: (p) => <CelulaData valor={p.created_at} />,
    },
  ], [padroesTier]);

  /* ── Ações em massa (regras de negócio idênticas às de antes) ── */

  const exportarSelecionados = (ids: string[]) => {
    const linhas = parceiros.filter((p) => ids.includes(p.id));
    if (!linhas.length) return;
    downloadCSV(
      `parceiros-selecionados-${new Date().toISOString().slice(0, 10)}.csv`,
      toCSV(linhas as unknown as Record<string, unknown>[]),
    );
    toast.success(`${linhas.length} parceiro(s) exportados.`);
  };

  const revogarEmLote = async () => {
    if (!aprovadosSelecionados.length) { setConfirmarRevogar(false); return; }
    setOcupado(true);
    const res = await Promise.all(
      aprovadosSelecionados.map((p) =>
        supabase.from("partner_profiles").update({ status: "rejected", approved_at: null } as never).eq("id", p.id),
      ),
    );
    const falhas = res.filter((r) => r.error);
    setOcupado(false);
    setConfirmarRevogar(false);
    if (falhas.length) {
      toast.error(`${falhas.length} de ${res.length} não foram revogados.`, {
        description: falhas[0].error?.message,
      });
    } else {
      toast.success(`Acesso revogado de ${res.length} parceiro(s).`);
    }
    setSelecionados(new Set());
    await carregar();
    onMudou();
  };

  const mudarNivelEmLote = async () => {
    if (!aprovadosSelecionados.length) { setConfirmarNivel(false); return; }
    setOcupado(true);
    const res = await Promise.all(
      aprovadosSelecionados.map((p) =>
        supabase.from("partner_profiles").update({ tier: nivelEmLote } as never).eq("id", p.id),
      ),
    );
    const falhas = res.filter((r) => r.error);
    setOcupado(false);
    setConfirmarNivel(false);
    setAbrirNivelLote(false);
    if (falhas.length) {
      toast.error(`${falhas.length} de ${res.length} não mudaram de nível.`, {
        description: falhas[0].error?.message,
      });
    } else {
      toast.success(`${res.length} parceiro(s) movidos para ${TIER_LABEL[nivelEmLote]}.`);
    }
    setSelecionados(new Set());
    await carregar();
  };

  const excluirEmLote = async () => {
    if (!linhasSelecionadas.length) { setConfirmarExcluir(false); return; }
    setOcupado(true);
    /* Papéis primeiro (evita admin órfão), depois o perfil. */
    const idsUsuarios = linhasSelecionadas.map((p) => p.user_id);
    const papeis = await supabase.from("user_roles").delete().in("user_id", idsUsuarios);
    const res = await Promise.all(
      linhasSelecionadas.map((p) => supabase.from("partner_profiles").delete().eq("id", p.id)),
    );
    const falhas = res.filter((r) => r.error);
    setOcupado(false);
    setConfirmarExcluir(false);
    if (falhas.length) {
      toast.error(`${falhas.length} de ${res.length} não foram excluídos.`, {
        description: falhas[0].error?.message,
      });
    } else if (papeis.error) {
      /* Antes este erro era engolido — e sobrava papel de admin sem perfil. */
      toast.warning(`${res.length} cadastro(s) excluído(s), mas os papéis de acesso não foram removidos.`, {
        description: papeis.error.message,
      });
    } else {
      toast.success(`${res.length} cadastro(s) excluído(s).`);
    }
    setSelecionados(new Set());
    await carregar();
    onMudou();
  };

  return (
    <div>
      {/* ── Filtros ── */}
      <div className="mb-4 flex flex-wrap gap-2">
        <ChipStatus ativo={filtroStatus === "all"} onClick={() => setFiltroStatus("all")} rotulo="Todos" contagem={parceiros.length} />
        {STATUS_ORDEM.map((s) => (
          <ChipStatus
            key={s}
            ativo={filtroStatus === s}
            onClick={() => setFiltroStatus(s)}
            rotulo={STATUS_ROTULO[s]}
            contagem={porStatus[s] ?? 0}
          />
        ))}
      </div>

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <div className="relative min-w-[240px] max-w-md flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-western-stone-warm" aria-hidden="true" />
          <Input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Nome, empresa, CNPJ, cidade…"
            aria-label="Buscar parceiro"
            className="h-control rounded-sm border-western-border-strong pl-10 text-[15px]"
          />
        </div>

        <Select value={filtroSegmento} onValueChange={setFiltroSegmento}>
          <SelectTrigger className="h-control w-[200px] rounded-sm border-western-border-strong text-[15px]" aria-label="Segmento">
            <SelectValue placeholder="Segmento" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os segmentos</SelectItem>
            {segmentos.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>

        <Select value={filtroUf} onValueChange={setFiltroUf}>
          <SelectTrigger className="h-control w-[130px] rounded-sm border-western-border-strong text-[15px]" aria-label="UF">
            <SelectValue placeholder="UF" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas UFs</SelectItem>
            {ufs.map((u) => <SelectItem key={u} value={u}>{u}</SelectItem>)}
          </SelectContent>
        </Select>

        <button
          type="button"
          onClick={() => downloadCSV(
            `parceiros-${new Date().toISOString().slice(0, 10)}.csv`,
            toCSV(filtrados as unknown as Record<string, unknown>[]),
          )}
          disabled={!filtrados.length}
          className="btn-outline-forest"
        >
          <Download className="h-4 w-4" aria-hidden="true" />
          Exportar CSV
        </button>
      </div>

      <DataTable
        linhas={filtrados}
        getId={(p) => p.id}
        colunas={colunas}
        isLoading={carregando}
        error={erro}
        onRetry={carregar}
        onRowClick={(p) => onAbrir(p.id)}
        vazio={
          parceiros.length === 0
            ? {
                titulo: "Nenhum parceiro cadastrado",
                mensagem: "Quando alguém se cadastrar no Programa Western Pro, aparece aqui.",
              }
            : {
                titulo: "Nenhum parceiro neste filtro",
                mensagem: "Ajuste o status, o segmento ou a busca para ver outros cadastros.",
              }
        }
        selecao={{
          selecionados,
          onChange: setSelecionados,
          barra: (ids) => (
            <>
              <Button
                onClick={() => exportarSelecionados(ids)}
                disabled={ocupado}
                variant="outline"
                className="tap-target rounded-lg border-western-border-strong text-[15px] font-semibold"
              >
                <Download className="mr-2 h-4 w-4" aria-hidden="true" /> Exportar
              </Button>
              <Button
                onClick={() => setAbrirNivelLote(true)}
                disabled={ocupado || aprovadosSelecionados.length === 0}
                variant="outline"
                title={aprovadosSelecionados.length === 0 ? "Selecione ao menos um parceiro aprovado" : undefined}
                className="tap-target rounded-lg border-western-border-strong text-[15px] font-semibold"
              >
                <ChevronsUpDown className="mr-2 h-4 w-4" aria-hidden="true" />
                Mudar nível
                {aprovadosSelecionados.length > 0 && aprovadosSelecionados.length !== ids.length
                  ? ` (${aprovadosSelecionados.length})`
                  : ""}
              </Button>
              <Button
                onClick={() => setConfirmarRevogar(true)}
                disabled={ocupado || aprovadosSelecionados.length === 0}
                title={aprovadosSelecionados.length === 0 ? "Selecione ao menos um parceiro aprovado" : undefined}
                className="tap-target rounded-lg bg-status-error text-[15px] font-semibold text-white hover:bg-[#8f2c25]"
              >
                <ShieldX className="mr-2 h-4 w-4" aria-hidden="true" />
                Revogar acesso
                {aprovadosSelecionados.length > 0 && aprovadosSelecionados.length !== ids.length
                  ? ` (${aprovadosSelecionados.length})`
                  : ""}
              </Button>
              <Button
                onClick={() => setConfirmarExcluir(true)}
                disabled={ocupado}
                variant="ghost"
                className="tap-target rounded-lg text-[15px] font-semibold text-status-error hover:bg-status-error/10"
              >
                <Trash2 className="mr-2 h-4 w-4" aria-hidden="true" /> Excluir
              </Button>
            </>
          ),
        }}
      />

      {filtrados.some((p) => p.status === "approved" && p.discount_override != null) && (
        <p className="text-meta mt-3">* Desconto personalizado — sobrescreve o padrão do nível.</p>
      )}

      {/* Escolha do nível em lote */}
      <Sheet open={abrirNivelLote} onOpenChange={setAbrirNivelLote}>
        <SheetContent className="w-full sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Mudar o nível de {aprovadosSelecionados.length} parceiro(s)</SheetTitle>
            <SheetDescription>
              Só parceiros aprovados mudam de nível. Descontos personalizados individuais são mantidos.
            </SheetDescription>
          </SheetHeader>

          <div className="mt-6 space-y-5">
            <div>
              <Label className="text-eyebrow mb-2 block">Novo nível</Label>
              <Select value={nivelEmLote} onValueChange={(v) => setNivelEmLote(v as Tier)}>
                <SelectTrigger className="h-control rounded-sm border-western-border-strong text-[15px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TIERS.map((t) => <SelectItem key={t} value={t}>{TIER_LABEL[t]}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setAbrirNivelLote(false)} className="btn-outline-forest flex-1">
                Cancelar
              </button>
              <button type="button" onClick={() => setConfirmarNivel(true)} className="btn-primary flex-1">
                Aplicar
              </button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      <ConfirmDialog
        open={confirmarNivel}
        onOpenChange={setConfirmarNivel}
        title={`Mudar ${aprovadosSelecionados.length} parceiro(s) para ${TIER_LABEL[nivelEmLote]}?`}
        description="Os padrões de desconto do novo nível passam a valer imediatamente."
        confirmLabel={ocupado ? "Aplicando…" : "Aplicar"}
        onConfirm={mudarNivelEmLote}
      />

      <ConfirmDialog
        open={confirmarRevogar}
        onOpenChange={setConfirmarRevogar}
        title={`Revogar o acesso de ${aprovadosSelecionados.length} parceiro(s)?`}
        description="Eles perdem imediatamente o acesso ao Programa Western Pro e ao catálogo de atacado. Você pode reverter individualmente depois."
        confirmLabel={ocupado ? "Revogando…" : "Revogar acesso"}
        danger
        onConfirm={revogarEmLote}
      />

      <ConfirmDialog
        open={confirmarExcluir}
        onOpenChange={setConfirmarExcluir}
        title={`Excluir ${linhasSelecionadas.length} cadastro(s) de parceiro?`}
        description={`Isto apaga permanentemente o perfil, as configurações de nível e o papel de admin (se houver) de ${linhasSelecionadas.length} parceiro(s). A ação NÃO pode ser desfeita. Digite EXCLUIR para confirmar.`}
        confirmLabel={ocupado ? "Excluindo…" : "Excluir cadastros"}
        danger
        requireText="EXCLUIR"
        onConfirm={excluirEmLote}
      />
    </div>
  );
}

function ChipStatus({
  ativo, onClick, rotulo, contagem,
}: {
  ativo: boolean;
  onClick: () => void;
  rotulo: string;
  contagem: number;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={ativo}
      className={cn(
        "tap-target inline-flex items-center gap-2 rounded-sm border px-4 text-[15px] font-semibold transition-colors",
        ativo
          ? "border-western-cta bg-western-cta/[0.08] text-western-green-deep"
          : "border-western-border-strong text-western-stone-warm hover:border-western-green-deep hover:text-western-green-deep",
      )}
    >
      {rotulo}
      <span className="tabular-nums text-western-stone-warm">{contagem}</span>
    </button>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
 * DETALHE — dados à esquerda, CARD DE AÇÃO à direita
 * ═══════════════════════════════════════════════════════════════════════════ */

function ParceiroDetalhe({
  id, onVoltar, onMudou, onIrParaCredenciamento,
}: {
  id: string;
  onVoltar: () => void;
  onMudou: () => void;
  onIrParaCredenciamento: () => void;
}) {
  const [parceiro, setParceiro] = useState<Partner | null>(null);
  const [ehAdmin, setEhAdmin] = useState(false);
  const [padroesTier, setPadroesTier] = useState<Record<string, number>>({});
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<unknown>(null);

  /* Formulário (só vale para aprovado) */
  const [nivel, setNivel] = useState<Tier>("padrao");
  const [desconto, setDesconto] = useState("");
  const [boleto, setBoleto] = useState(false);
  const [parcelas, setParcelas] = useState("1");
  const [kit, setKit] = useState(false);
  const [admin, setAdmin] = useState(false);
  const [confirmarAdmin, setConfirmarAdmin] = useState(false);

  /* Senha provisoria: o dono resolve na ligacao, sem depender de e-mail. */
  const [senhaGerada, setSenhaGerada] = useState<string | null>(null);
  const [gerandoSenha, setGerandoSenha] = useState(false);
  const [confirmarSenha, setConfirmarSenha] = useState(false);
  const [erroSenha, setErroSenha] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);

  const [statusPendente, setStatusPendente] = useState<Partner["status"] | null>(null);
  const [confirmarExcluir, setConfirmarExcluir] = useState(false);

  const carregar = useCallback(async () => {
    setCarregando(true);
    setErro(null);

    const { data, error } = await supabase.from("partner_profiles").select("*").eq("id", id).maybeSingle();
    if (error) { setErro(error); setCarregando(false); return; }
    if (!data) { setParceiro(null); setCarregando(false); return; }

    const p = data as Partner;
    setParceiro(p);

    const [papeis, padroes] = await Promise.all([
      supabase.from("user_roles").select("user_id").eq("role", "admin").eq("user_id", p.user_id),
      supabase.from("tier_defaults").select("tier, discount_pct"),
    ]);

    /* Se não dá para saber se é admin, não afirme que NÃO é: bloqueia o toggle. */
    if (papeis.error) { setErro(papeis.error); setCarregando(false); return; }

    const admGravado = ((papeis.data ?? []) as Array<{ user_id: string }>).length > 0;
    setEhAdmin(admGravado);

    const mapa: Record<string, number> = {};
    if (!padroes.error) {
      ((padroes.data ?? []) as Array<{ tier: string; discount_pct: number }>).forEach((t) => {
        mapa[t.tier] = t.discount_pct;
      });
    }
    setPadroesTier(mapa);

    /* Reidrata o formulário com o que está no banco. */
    setNivel(p.tier);
    setDesconto(p.discount_override != null ? String(p.discount_override) : "");
    const pm = (p.payment_methods ?? {}) as { boleto?: boolean; parcelas_max?: number; kit_gratis?: boolean };
    setBoleto(!!pm.boleto);
    setParcelas(String(pm.parcelas_max ?? 1));
    setKit(!!pm.kit_gratis);
    setAdmin(admGravado);

    setCarregando(false);
  }, [id]);

  useEffect(() => { carregar(); }, [carregar]);

  const aplicarStatus = async (status: Partner["status"]) => {
    if (!parceiro) return;
    const approvedAt = status === "approved" ? new Date().toISOString() : null;
    const { error } = await supabase
      .from("partner_profiles")
      .update({ status, approved_at: approvedAt } as never)
      .eq("id", parceiro.id);
    if (error) { toast.error("Não foi possível atualizar.", { description: error.message }); return; }
    toast.success(
      status === "approved" ? "Parceiro aprovado." : status === "rejected" ? "Acesso negado." : "Status atualizado.",
    );
    await carregar();
    onMudou();
  };

  /** Rebaixar quem já está aprovado é destrutivo → confirma. */
  const pedirStatus = async (status: Partner["status"]) => {
    if (parceiro?.status === "approved" && status !== "approved") {
      setStatusPendente(status);
      return;
    }
    await aplicarStatus(status);
  };

  const salvar = async () => {
    if (!parceiro) return;
    setSalvando(true);

    const payment_methods = {
      boleto,
      parcelas_max: Math.max(1, Math.min(12, parseInt(parcelas, 10) || 1)),
      kit_gratis: kit,
    };
    const discount_override = desconto.trim() === ""
      ? null
      : Math.max(0, Math.min(100, parseFloat(desconto)));

    const { error } = await supabase
      .from("partner_profiles")
      .update({ tier: nivel, discount_override, payment_methods } as never)
      .eq("id", parceiro.id);
    if (error) { toast.error("Erro ao salvar.", { description: error.message }); setSalvando(false); return; }

    /* Papel de admin — o erro aqui era engolido antes; agora aparece. */
    let erroPapel: { message: string } | null = null;
    if (admin && !ehAdmin) {
      const r = await supabase.from("user_roles").upsert(
        { user_id: parceiro.user_id, role: "admin" },
        { onConflict: "user_id,role" },
      );
      erroPapel = r.error;
    } else if (!admin && ehAdmin) {
      const r = await supabase.from("user_roles").delete().eq("user_id", parceiro.user_id).eq("role", "admin");
      erroPapel = r.error;
    }

    setSalvando(false);
    if (erroPapel) {
      toast.error("Configurações salvas, mas o acesso de admin NÃO mudou.", { description: erroPapel.message });
    } else {
      toast.success("Configurações atualizadas.");
    }
    await carregar();
  };

  const excluir = async () => {
    if (!parceiro) return;
    setConfirmarExcluir(false);
    const papeis = await supabase.from("user_roles").delete().eq("user_id", parceiro.user_id);
    const { error } = await supabase.from("partner_profiles").delete().eq("id", parceiro.id);
    if (error) { toast.error("Erro ao excluir.", { description: error.message }); return; }
    if (papeis.error) {
      toast.warning("Cadastro excluído, mas os papéis de acesso não foram removidos.", {
        description: papeis.error.message,
      });
    } else {
      toast.success("Cadastro excluído.");
    }
    onMudou();
    onVoltar();
  };

  const voltar = { to: "/admin/parceiros?tab=ativos", label: "Parceiros" };

  if (carregando) {
    return (
      <div>
        <PageHeader voltar={voltar} titulo="Carregando…" />
        <div className="flex justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-western-cta" aria-label="Carregando" />
        </div>
      </div>
    );
  }

  if (erro) {
    return (
      <div>
        <PageHeader voltar={voltar} titulo="Parceiro" />
        <EstadoErro erro={erro} onRetry={carregar} />
      </div>
    );
  }

  if (!parceiro) {
    return (
      <div>
        <PageHeader voltar={voltar} titulo="Parceiro não encontrado" />
        <div className="rounded-xl border border-dashed border-western-border-strong bg-western-paper px-6 py-14 text-center">
          <p className="font-display text-[18px] font-semibold text-western-green-deep">
            Este cadastro não existe mais
          </p>
          <p className="text-body mx-auto mt-2 max-w-md">
            Ele pode ter sido excluído. Volte à lista para ver os parceiros atuais.
          </p>
          <button type="button" onClick={onVoltar} className="btn-primary mt-6">Voltar à lista</button>
        </div>
      </div>
    );
  }

  const p = parceiro;
  const aprovado = p.status === "approved";
  const temCred = !!p.credenciamento_id;
  const decidirNoCredenciamento = temCred && p.status !== "approved" && p.status !== "cancelled";
  const { padrao, usado, personalizado } = descontoEfetivo(p, padroesTier);
  const whatsapp = linkWhatsApp(p.telefone);
  const site = linkSite(p.site);

  /* O próximo passo, em uma frase. É o que o card de ação responde. */
  const proximoPasso = decidirNoCredenciamento
    ? "Este cadastro veio de um credenciamento — a decisão é tomada lá, com a análise de CNPJ."
    : p.status === "pending"
      ? "Cadastro aguardando sua decisão. Aprovar libera o preço de atacado."
      : p.status === "approved"
        ? "Parceiro ativo. Ajuste o nível, o desconto e as condições de pagamento."
        : p.status === "rejected"
          ? "Acesso negado. Você pode reverter para análise a qualquer momento."
          : "Parceiro cancelado. Reverter para análise reabre o cadastro.";

  return (
    <div>
      <PageHeader
        voltar={voltar}
        eyebrow="Parceiro"
        titulo={p.empresa || p.nome || "Parceiro"}
        subtitulo={[p.nome, p.cargo, p.segmento].filter(Boolean).join(" · ") || undefined}
      />

      <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
        {/* ── ESQUERDA: os dados ── */}
        <div className="space-y-8">
          <Bloco titulo="Identificação">
            <Campo rotulo="Empresa" valor={p.empresa} />
            <Campo rotulo="CNPJ" valor={p.cnpj} numerico />
            <Campo rotulo="Responsável" valor={[p.nome, p.cargo].filter(Boolean).join(" · ")} />
            <Campo rotulo="Segmento" valor={p.segmento} />
            <Campo rotulo="Newsletter" valor={p.newsletter_opt_in ? "Aceita receber" : "Não aceita"} />
          </Bloco>

          <Bloco titulo="Contato">
            <Campo rotulo="Telefone" valor={p.telefone} numerico />
            <Campo rotulo="Instagram" valor={p.instagram ? `@${p.instagram.replace(/^@/, "")}` : null} />
            <Campo rotulo="Site" valor={p.site} />
          </Bloco>

          <Bloco titulo="Endereço">
            <Campo rotulo="CEP" valor={p.cep} numerico />
            <Campo rotulo="Logradouro" valor={[p.endereco, p.numero].filter(Boolean).join(", ")} />
            <Campo rotulo="Complemento" valor={p.complemento} />
            <Campo rotulo="Bairro" valor={p.bairro} />
            <Campo rotulo="Cidade/UF" valor={[p.cidade, p.estado].filter(Boolean).join("/")} />
          </Bloco>

          {p.cancellation_reason && (
            <Bloco titulo="Motivo do cancelamento">
              <p className="whitespace-pre-wrap text-[16px] leading-[1.6] text-western-green-deep">
                {p.cancellation_reason}
              </p>
              {p.cancelled_at && (
                <p className="text-meta mt-2">
                  Cancelado <CelulaData valor={p.cancelled_at} />
                </p>
              )}
            </Bloco>
          )}

          {/* Acesso do parceiro — resolve a ligacao "nao consigo entrar" sem depender
              de e-mail, que e problema aberto nesta loja. */}
          {p.status === "approved" && (
            <Bloco titulo="Acesso">
              {senhaGerada ? (
                <div className="space-y-3">
                  <p className="text-meta">Leia esta senha para o cliente agora:</p>
                  {/* data-clarity-mask: o Microsoft Clarity grava a tela (index.html).
                      O padrao dele mascara CAMPO de formulario, nao texto comum — e a
                      senha aqui e texto. Sem isto, cada senha ditada ficaria gravada num
                      servidor da Microsoft junto com o nome do parceiro. */}
                  <p
                    data-clarity-mask="true"
                    className="select-all rounded border border-western-gold/40 bg-western-cream px-4 py-3 text-center font-mono text-[22px] tracking-wide text-western-green-deep"
                  >
                    {senhaGerada}
                  </p>
                  <p className="text-meta">
                    Ela <strong>não aparece de novo</strong>. Ao entrar, o parceiro será obrigado
                    a criar uma senha própria — você deixa de conhecer a senha dele.
                  </p>
                  <button type="button" className="btn-outline-forest" onClick={() => setSenhaGerada(null)}>
                    Fechar
                  </button>
                </div>
              ) : confirmarSenha ? (
                <div className="space-y-3">
                  <p className="text-[15px] leading-[1.6] text-western-green-deep">
                    A senha atual de <strong>{p.empresa || p.nome}</strong> deixa de funcionar na hora.
                    Faça isto com o cliente na linha.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      className="btn-primary"
                      disabled={gerandoSenha}
                      onClick={async () => {
                        setGerandoSenha(true);
                        setErroSenha(null);
                        try {
                          setSenhaGerada(await gerarSenhaProvisoria(p.user_id));
                          setConfirmarSenha(false);
                        } catch (e) {
                          setErroSenha(e instanceof Error ? e.message : "Não consegui gerar a senha.");
                        } finally {
                          setGerandoSenha(false);
                        }
                      }}
                    >
                      {gerandoSenha ? "Gerando…" : "Confirmar e gerar"}
                    </button>
                    <button type="button" className="btn-outline-forest" onClick={() => setConfirmarSenha(false)}>
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <button type="button" className="btn-outline-forest" onClick={() => setConfirmarSenha(true)}>
                    Gerar senha provisória
                  </button>
                  <p className="text-meta">
                    Para quando o cliente ligar sem conseguir entrar. Você dita a senha por
                    telefone e ele troca no primeiro acesso.
                  </p>
                </div>
              )}
              {erroSenha && (
                <p className="mt-3 rounded border border-western-gold/40 px-3 py-2 text-[15px] text-western-green-deep">
                  {erroSenha}
                </p>
              )}
            </Bloco>
          )}

          {/* Linha do tempo */}
          <Bloco titulo="Linha do tempo">
            <Campo rotulo="Cadastro" valor={null}>
              <CelulaData valor={p.created_at} className="text-[15px] text-western-green-deep" />
            </Campo>
            {p.approved_at && (
              <Campo rotulo="Aprovado" valor={null}>
                <CelulaData valor={p.approved_at} className="text-[15px] text-western-green-deep" />
              </Campo>
            )}
            {p.cancelled_at && (
              <Campo rotulo="Cancelado" valor={null}>
                <CelulaData valor={p.cancelled_at} className="text-[15px] text-western-green-deep" />
              </Campo>
            )}
          </Bloco>

          {/* Zona sensível — separada, no fim, nunca perto do botão primário. */}
          <div className="rounded-xl border border-status-error/30 bg-status-error/[0.04] p-5">
            <p className="text-[14px] font-semibold uppercase tracking-[0.06em] text-status-error">Ação irreversível</p>
            <p className="text-body mt-2">
              Excluir apaga o perfil, as configurações de nível e o papel de admin deste parceiro. Não dá para desfazer.
            </p>
            <button
              type="button"
              onClick={() => setConfirmarExcluir(true)}
              className="tap-target mt-4 inline-flex items-center gap-2 rounded-lg border border-status-error/50 px-5 text-[15px] font-semibold text-status-error transition-colors hover:bg-status-error/10"
            >
              <Trash2 className="h-4 w-4" aria-hidden="true" />
              Excluir cadastro
            </button>
          </div>
        </div>

        {/* ── DIREITA: o card de ação (fixo) ── */}
        <aside className="lg:sticky lg:top-6 lg:self-start">
          <div className="rounded-xl border border-western-border-strong bg-white p-6">
            <div className="flex items-center justify-between gap-3">
              <StatusBadge status={p.status} />
              {aprovado && <NivelBadge tier={p.tier} />}
            </div>

            <p className="text-body mt-4">{proximoPasso}</p>

            {/* Desconto real em vigor */}
            {aprovado && (
              <div className="mt-5 rounded-lg border border-western-border-soft bg-western-paper p-4">
                <p className="text-[14px] font-semibold uppercase tracking-[0.06em] text-western-bronze">
                  Desconto em vigor
                </p>
                {/* O percentual e verdadeiro mas nao comunica nada: 9,0909% nao
                    diz ao dono o que o parceiro paga. A linha de baixo traduz
                    para a regra comercial, que e como ele pensa a tabela. */}
                <p className="mt-1 text-[20px] font-semibold tabular-nums text-western-green-deep">
                  {usado == null ? "—" : `${formatarPct(usado)}%`}
                </p>
                <p className="text-meta mt-1">
                  {usado == null
                    ? "Não consegui ler o padrão do nível."
                    : personalizado
                      ? `personalizado — o padrão do nível é ${padrao == null ? "—" : `${formatarPct(padrao)}%`}`
                      : SIGNIFICADO_TIER[p.tier]}
                </p>
              </div>
            )}

            {/* Contatos diretos */}
            {(whatsapp || site || p.instagram) && (
              <div className="mt-5 flex flex-wrap gap-2">
                {whatsapp && (
                  <a
                    href={whatsapp}
                    target="_blank"
                    rel="noreferrer"
                    className="tap-target inline-flex items-center gap-2 rounded-lg border border-western-border-strong px-4 text-[15px] font-semibold text-western-green-deep transition-colors hover:bg-western-paper"
                  >
                    <MessageCircle className="h-4 w-4" aria-hidden="true" /> WhatsApp
                  </a>
                )}
                {site && (
                  <a
                    href={site}
                    target="_blank"
                    rel="noreferrer"
                    className="tap-target inline-flex items-center gap-2 rounded-lg border border-western-border-strong px-4 text-[15px] font-semibold text-western-green-deep transition-colors hover:bg-western-paper"
                  >
                    <Globe className="h-4 w-4" aria-hidden="true" /> Site
                  </a>
                )}
                {p.instagram && (
                  <a
                    href={`https://instagram.com/${p.instagram.replace(/^@/, "")}`}
                    target="_blank"
                    rel="noreferrer"
                    className="tap-target inline-flex items-center gap-2 rounded-lg border border-western-border-strong px-4 text-[15px] font-semibold text-western-green-deep transition-colors hover:bg-western-paper"
                  >
                    <Instagram className="h-4 w-4" aria-hidden="true" /> Instagram
                  </a>
                )}
              </div>
            )}

            <div className="my-6 h-px bg-western-border-soft" />

            {/* ── O PRÓXIMO PASSO ── */}
            {decidirNoCredenciamento ? (
              <button type="button" onClick={onIrParaCredenciamento} className="btn-primary w-full">
                <ExternalLink className="h-4 w-4" aria-hidden="true" />
                Analisar no credenciamento
              </button>
            ) : !aprovado ? (
              <div className="space-y-3">
                {p.status !== "cancelled" && (
                  <button type="button" onClick={() => pedirStatus("approved")} className="btn-primary w-full">
                    <Check className="h-4 w-4" aria-hidden="true" />
                    Aprovar parceiro
                  </button>
                )}
                {p.status !== "rejected" && p.status !== "cancelled" && (
                  <button type="button" onClick={() => pedirStatus("rejected")} className="btn-outline-forest w-full">
                    <X className="h-4 w-4" aria-hidden="true" />
                    Recusar
                  </button>
                )}
                {p.status !== "pending" && (
                  <button
                    type="button"
                    onClick={() => pedirStatus("pending")}
                    className="tap-target w-full rounded-lg text-[15px] font-semibold text-western-stone-warm transition-colors hover:text-western-green-deep"
                  >
                    Reverter para análise
                  </button>
                )}
                <p className="text-meta">
                  Nível, desconto e permissões só ficam disponíveis depois de aprovar.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                <div>
                  <Label className="text-eyebrow mb-2 block">Nível</Label>
                  <Select value={nivel} onValueChange={(v) => setNivel(v as Tier)}>
                    <SelectTrigger className="h-control rounded-sm border-western-border-strong text-[15px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TIERS.map((t) => <SelectItem key={t} value={t}>{TIER_LABEL[t]}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <p className="text-meta mt-2">
                    O nível define os padrões de desconto, boleto e parcelas (ajustáveis em Configurações).
                  </p>
                </div>

                <div>
                  <Label className="text-eyebrow mb-2 block" htmlFor="desconto">
                    Desconto personalizado (%)
                  </Label>
                  <Input
                    id="desconto"
                    type="number"
                    min={0}
                    max={100}
                    step="0.5"
                    value={desconto}
                    onChange={(e) => setDesconto(e.target.value)}
                    placeholder="Vazio = usa o padrão do nível"
                    className="h-control rounded-sm border-western-border-strong text-[15px]"
                  />
                </div>

                <div className="flex items-center justify-between gap-4 border-t border-western-border-soft pt-5">
                  <div className="min-w-0">
                    <Label className="text-[15px] font-semibold text-western-green-deep">Liberar boleto</Label>
                    <p className="text-meta">Pode fechar o pedido com boleto bancário.</p>
                  </div>
                  <Switch checked={boleto} onCheckedChange={setBoleto} aria-label="Liberar boleto" />
                </div>

                <div>
                  <Label className="text-eyebrow mb-2 block" htmlFor="parcelas">Parcelas máximas</Label>
                  <Input
                    id="parcelas"
                    type="number"
                    min={1}
                    max={12}
                    value={parcelas}
                    onChange={(e) => setParcelas(e.target.value)}
                    className="h-control rounded-sm border-western-border-strong text-[15px]"
                  />
                </div>

                <div className="flex items-center justify-between gap-4 border-t border-western-border-soft pt-5">
                  <div className="min-w-0">
                    <Label className="text-[15px] font-semibold text-western-green-deep">Kit de amostras grátis</Label>
                    <p className="text-meta">Aprovação imediata, sem custo.</p>
                  </div>
                  <Switch checked={kit} onCheckedChange={setKit} aria-label="Kit de amostras grátis" />
                </div>

                <div className="rounded-lg border border-status-error/30 bg-status-error/[0.04] p-4">
                  <p className="inline-flex items-center gap-2 text-[14px] font-semibold uppercase tracking-[0.06em] text-status-error">
                    <ShieldCheck className="h-4 w-4" aria-hidden="true" />
                    Acesso ao sistema
                  </p>
                  <div className="mt-3 flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <Label className="text-[15px] font-semibold text-western-green-deep">Promover a admin</Label>
                      <p className="text-[14px] leading-[1.5] text-western-stone-dark/85">
                        Dá acesso <strong>total</strong> ao painel — leads, orçamentos, pedidos, parceiros e configurações.
                      </p>
                    </div>
                    <Switch
                      checked={admin}
                      onCheckedChange={(v) => {
                        if (v && !admin) setConfirmarAdmin(true);
                        else setAdmin(v);
                      }}
                      aria-label="Promover a admin"
                    />
                  </div>
                </div>

                {/* A ÚNICA ação primária da tela. Verde. */}
                <button type="button" onClick={salvar} disabled={salvando} className="btn-primary w-full">
                  {salvando ? (
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                  ) : (
                    <><Save className="h-4 w-4" aria-hidden="true" /> Salvar configurações</>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => pedirStatus("rejected")}
                  className="tap-target w-full rounded-lg text-[15px] font-semibold text-status-error transition-colors hover:bg-status-error/10"
                >
                  Revogar acesso do parceiro
                </button>
              </div>
            )}
          </div>
        </aside>
      </div>

      <ConfirmDialog
        open={confirmarAdmin}
        onOpenChange={setConfirmarAdmin}
        title="Promover a administrador?"
        description="Isto dá acesso TOTAL ao painel administrativo para esta pessoa. A mudança só vale depois de salvar."
        confirmLabel="Sim, promover"
        danger
        onConfirm={() => { setAdmin(true); setConfirmarAdmin(false); }}
      />

      <ConfirmDialog
        open={!!statusPendente}
        onOpenChange={(o) => { if (!o) setStatusPendente(null); }}
        title={
          statusPendente === "rejected"
            ? "Revogar o acesso deste parceiro?"
            : statusPendente === "cancelled"
              ? "Cancelar este parceiro?"
              : "Reverter para em análise?"
        }
        description={`${p.empresa || p.nome || "Este parceiro"} perde imediatamente o acesso ao Programa Western Pro e ao preço de atacado. Confirmar?`}
        confirmLabel={statusPendente === "rejected" ? "Revogar acesso" : "Confirmar"}
        danger
        onConfirm={async () => {
          const alvo = statusPendente;
          setStatusPendente(null);
          if (alvo) await aplicarStatus(alvo);
        }}
      />

      <ConfirmDialog
        open={confirmarExcluir}
        onOpenChange={setConfirmarExcluir}
        title="Excluir o cadastro deste parceiro?"
        description={`Isto apaga permanentemente o perfil de ${p.empresa || p.nome || "este parceiro"}, o nível, o desconto e o papel de admin. A ação NÃO pode ser desfeita. Digite EXCLUIR para confirmar.`}
        confirmLabel="Excluir cadastro"
        danger
        requireText="EXCLUIR"
        onConfirm={excluir}
      />
    </div>
  );
}

/* ── Blocos do detalhe ── */

/** Gera a senha provisoria e devolve o texto para o dono ler em voz alta. */
/** Traduz o codigo da funcao para uma frase que diz se a senha mudou ou nao. */
const ERRO_SENHA: Record<string, string> = {
  forbidden: "Só administrador pode gerar senha. A senha do parceiro NÃO foi alterada.",
  parceiro_nao_encontrado: "Não encontrei esse parceiro. A senha NÃO foi alterada.",
  falha_ao_preparar: "Não consegui preparar a troca. A senha do parceiro NÃO foi alterada — ele continua entrando com a atual.",
  falha_ao_definir_senha: "Não consegui definir a senha nova. A senha atual do parceiro continua valendo.",
};

async function gerarSenhaProvisoria(userId: string) {
  const { data, error } = await supabase.functions.invoke("admin-senha-provisoria", {
    body: { user_id: userId },
  });

  if (error) {
    // O supabase-js descarta o corpo em resposta nao-2xx. Sem ler o corpo, todo
    // erro viraria a mesma frase em ingles e o dono nao saberia se a senha do
    // parceiro mudou ou nao — que e a unica coisa que importa nesse momento.
    let codigo = "";
    try {
      const ctx = (error as { context?: Response }).context;
      if (ctx) codigo = (await ctx.clone().json())?.error ?? "";
    } catch { /* corpo ilegivel: cai na frase generica */ }
    throw new Error(
      ERRO_SENHA[codigo] ??
        "Não consegui gerar a senha. Confira se o parceiro ainda entra com a senha atual antes de tentar de novo.",
    );
  }

  if (!data?.senha) throw new Error("A função respondeu sem a senha. Não repita: verifique com o parceiro se a senha dele mudou.");
  return data.senha as string;
}

function Bloco({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-western-border-soft bg-white p-6">
      <h2 className="text-eyebrow mb-4">{titulo}</h2>
      <dl className="space-y-3">{children}</dl>
    </section>
  );
}

function Campo({
  rotulo, valor, numerico, children,
}: {
  rotulo: string;
  valor?: string | null;
  numerico?: boolean;
  children?: React.ReactNode;
}) {
  if (!children && !valor) return null;
  return (
    <div className="flex flex-col gap-1 sm:flex-row sm:gap-4">
      <dt className="w-40 flex-shrink-0 text-[14px] font-semibold uppercase tracking-[0.06em] text-western-bronze">
        {rotulo}
      </dt>
      <dd
        className={cn(
          "min-w-0 flex-1 break-words text-[15px] text-western-green-deep",
          numerico && "tabular-nums",
        )}
      >
        {children ?? valor}
      </dd>
    </div>
  );
}
