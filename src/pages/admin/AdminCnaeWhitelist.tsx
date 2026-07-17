import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Plus, Trash2, Info } from "lucide-react";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { DataTable, type Coluna, Tabs } from "@/components/backoffice";

/**
 * CNAEs que credenciam. Vive dentro de /admin/configuracoes (aba CNAE), por isso
 * não tem PageHeader próprio.
 *
 * Consertado: `load()` dava toast do erro e mesmo assim fazia `setRows(data ?? [])`.
 * Resultado: uma falha de RLS virava "nenhum CNAE cadastrado" — e um CNAE verde
 * "sumido" da tela é um credenciamento automático que o dono acha que não existe.
 * Agora o erro é estado e a tabela mostra EstadoErro com "Tentar de novo".
 *
 * Também trocamos o `confirm()` nativo do navegador por ConfirmDialog: remover um
 * CNAE muda quem entra sozinho no atacado.
 */

type Faixa = "verde" | "amarela" | "laranja";
interface Row { codigo: string; tier: Faixa; descricao: string | null }

/* Dessaturado, na paleta semântica do DS: sucesso #2E7D4F · aviso #9C6812 · bronze. */
const FAIXA_CLS: Record<Faixa, string> = {
  verde: "border-status-success/30 bg-status-success/[0.07] text-status-success",
  amarela: "border-status-warning/30 bg-status-warning/[0.07] text-status-warning",
  laranja: "border-western-bronze/35 bg-western-bronze/[0.07] text-western-bronze",
};

const FAIXA_LABEL: Record<Faixa, string> = {
  verde: "Verde — aprova sozinho",
  amarela: "Amarela — análise",
  laranja: "Laranja — análise",
};

const FAIXAS: Faixa[] = ["verde", "amarela", "laranja"];

const formatCnae = (c: string) => c.replace(/^(\d{4})(\d)(\d{2})$/, "$1-$2/$3");

const campoCls =
  "h-control w-full rounded-sm border border-western-border-strong bg-white px-3 text-[16px] text-western-green-deep placeholder:text-western-stone-warm/70 transition-colors focus:border-western-cta focus:outline-none focus:ring-2 focus:ring-western-cta/20";

export default function AdminCnaeWhitelist() {
  const [rows, setRows] = useState<Row[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<unknown>(null);
  const [filtro, setFiltro] = useState<Faixa | "todos">("todos");
  const [novo, setNovo] = useState<{ codigo: string; tier: Faixa; descricao: string }>({
    codigo: "", tier: "verde", descricao: "",
  });
  const [salvando, setSalvando] = useState(false);
  const [faixaPendente, setFaixaPendente] = useState<{ codigo: string; tier: Faixa } | null>(null);
  const [removerPendente, setRemoverPendente] = useState<Row | null>(null);

  const load = useCallback(async () => {
    setCarregando(true);
    setErro(null);
    const { data, error } = await supabase
      .from("cnae_whitelist")
      .select("codigo, tier, descricao")
      .order("tier", { ascending: true })
      .order("codigo", { ascending: true });
    // Erro é ERRO. Nunca lista vazia.
    if (error) setErro(error);
    else setRows((data as Row[]) ?? []);
    setCarregando(false);
  }, []);

  useEffect(() => { void load(); }, [load]);

  const contagens = useMemo(() => ({
    todos: rows.length,
    verde: rows.filter((r) => r.tier === "verde").length,
    amarela: rows.filter((r) => r.tier === "amarela").length,
    laranja: rows.filter((r) => r.tier === "laranja").length,
  }), [rows]);

  const filtradas = useMemo(
    () => (filtro === "todos" ? rows : rows.filter((r) => r.tier === filtro)),
    [rows, filtro],
  );

  const adicionar = async () => {
    const codigo = novo.codigo.replace(/\D/g, "").slice(0, 7);
    if (codigo.length !== 7) { toast.error("O CNAE precisa ter 7 dígitos."); return; }
    setSalvando(true);
    const { error } = await supabase.from("cnae_whitelist").upsert({
      codigo, tier: novo.tier, descricao: novo.descricao.trim() || null,
    });
    setSalvando(false);
    if (error) { toast.error("Não consegui salvar.", { description: error.message }); return; }
    toast.success(`CNAE ${formatCnae(codigo)} adicionado na faixa ${novo.tier}.`);
    setNovo({ codigo: "", tier: novo.tier, descricao: "" });
    await load();
  };

  const remover = async (codigo: string) => {
    const { error } = await supabase.from("cnae_whitelist").delete().eq("codigo", codigo);
    if (error) { toast.error("Não consegui remover.", { description: error.message }); return; }
    setRows((rs) => rs.filter((r) => r.codigo !== codigo));
    toast.success(`CNAE ${formatCnae(codigo)} removido.`);
  };

  const trocarFaixa = async (codigo: string, tier: Faixa) => {
    const anterior = rows.find((r) => r.codigo === codigo)?.tier;
    setRows((rs) => rs.map((r) => (r.codigo === codigo ? { ...r, tier } : r))); // otimista
    const { error } = await supabase.from("cnae_whitelist").update({ tier }).eq("codigo", codigo);
    if (error) {
      // Desfaz: a tela não pode mostrar uma faixa que o banco não gravou.
      if (anterior) setRows((rs) => rs.map((r) => (r.codigo === codigo ? { ...r, tier: anterior } : r)));
      toast.error("Não consegui mudar a faixa.", { description: error.message });
      return;
    }
    toast.success(`${formatCnae(codigo)} agora é ${tier}.`);
  };

  const colunas: ReadonlyArray<Coluna<Row>> = useMemo(() => [
    {
      key: "codigo",
      header: "CNAE",
      width: "140px",
      numerica: true,
      sortable: true,
      principalNoMobile: true,
      render: (r) => (
        <span className="font-semibold tabular-nums text-western-green-deep">{formatCnae(r.codigo)}</span>
      ),
    },
    {
      key: "tier",
      header: "Faixa",
      width: "200px",
      sortable: true,
      render: (r) => (
        <Select
          value={r.tier}
          onValueChange={(v) => {
            const proxima = v as Faixa;
            if (proxima === r.tier) return;
            setFaixaPendente({ codigo: r.codigo, tier: proxima });
          }}
        >
          <SelectTrigger
            aria-label={`Faixa do CNAE ${formatCnae(r.codigo)}`}
            className={`h-tap w-[180px] rounded-sm border text-[16px] font-semibold ${FAIXA_CLS[r.tier]}`}
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {FAIXAS.map((f) => (
              <SelectItem key={f} value={f}>{FAIXA_LABEL[f]}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      ),
    },
    {
      key: "descricao",
      header: "Descrição",
      sortable: true,
      render: (r) => (
        <span className="text-[16px] text-western-stone-warm">{r.descricao ?? "—"}</span>
      ),
    },
    {
      key: "acao",
      header: "",
      align: "right",
      width: "72px",
      render: (r) => (
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); setRemoverPendente(r); }}
          aria-label={`Remover CNAE ${formatCnae(r.codigo)}`}
          className="tap-target ml-auto inline-flex items-center justify-center rounded-lg text-western-stone-warm transition-colors hover:text-status-error"
        >
          <Trash2 className="h-4 w-4" aria-hidden="true" />
        </button>
      ),
    },
  ], []);

  return (
    <div>
      <div className="mb-6 flex max-w-3xl items-start gap-2.5 rounded-lg border border-status-success/30 bg-status-success/[0.06] p-4">
        <Info className="mt-0.5 h-4 w-4 flex-shrink-0 text-status-success" aria-hidden="true" />
        <p className="text-[16px] leading-[1.5] text-western-green-deep">
          <strong className="font-semibold">Verde</strong> aprova sozinho qualquer empresa com esse CNAE —
          principal <em>ou</em> secundário. Nunca reprova ninguém, só libera.{" "}
          <strong className="font-semibold">Amarela</strong> e <strong className="font-semibold">Laranja</strong>{" "}
          mandam o cadastro para a sua análise. Edições valem na hora, para novos cadastros.
        </p>
      </div>

      {/* Adicionar — a única ação primária desta aba. */}
      <section className="mb-8 rounded-2xl border border-western-border-soft bg-western-paper p-5">
        <p className="text-eyebrow mb-4">Adicionar CNAE</p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-[150px_200px_1fr_auto]">
          <input
            inputMode="numeric"
            placeholder="0000000"
            value={novo.codigo}
            onChange={(e) => setNovo({ ...novo, codigo: e.target.value })}
            aria-label="Código CNAE (7 dígitos)"
            className={`${campoCls} tabular-nums`}
          />

          <Select value={novo.tier} onValueChange={(v) => setNovo({ ...novo, tier: v as Faixa })}>
            <SelectTrigger aria-label="Faixa do novo CNAE" className="h-control rounded-sm border-western-border-strong text-[16px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {FAIXAS.map((f) => <SelectItem key={f} value={f}>{FAIXA_LABEL[f]}</SelectItem>)}
            </SelectContent>
          </Select>

          <input
            placeholder="Descrição (opcional)"
            value={novo.descricao}
            onChange={(e) => setNovo({ ...novo, descricao: e.target.value })}
            aria-label="Descrição do CNAE"
            className={campoCls}
          />

          <button type="button" onClick={adicionar} disabled={salvando} className="btn-primary">
            {salvando ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Plus className="h-4 w-4" aria-hidden="true" />}
            Adicionar
          </button>
        </div>
      </section>

      <Tabs
        abas={[
          { key: "todos", label: "Todos", count: carregando || erro ? undefined : contagens.todos },
          { key: "verde", label: "Verde", count: carregando || erro ? undefined : contagens.verde },
          { key: "amarela", label: "Amarela", count: carregando || erro ? undefined : contagens.amarela },
          { key: "laranja", label: "Laranja", count: carregando || erro ? undefined : contagens.laranja },
        ]}
        ativa={filtro}
        onChange={setFiltro}
        className="mb-4"
      />

      <DataTable
        linhas={filtradas}
        colunas={colunas}
        getId={(r) => r.codigo}
        isLoading={carregando}
        error={erro}
        onRetry={load}
        vazio={{
          titulo: filtro === "todos" ? "Nenhum CNAE cadastrado" : `Nenhum CNAE na faixa ${filtro}`,
          mensagem:
            filtro === "todos"
              ? "Sem CNAE na lista, todo credenciamento cai na sua análise manual."
              : "Troque de aba para ver as outras faixas.",
        }}
      />

      <ConfirmDialog
        open={!!faixaPendente}
        onOpenChange={(o) => { if (!o) setFaixaPendente(null); }}
        title="Mudar a faixa deste CNAE?"
        description={
          faixaPendente
            ? `${formatCnae(faixaPendente.codigo)} passa para ${faixaPendente.tier.toUpperCase()}.\n\n${
                faixaPendente.tier === "verde"
                  ? "VERDE aprova sozinho qualquer empresa com esse CNAE — principal ou secundário. Só libera, nunca reprova."
                  : "Empresas com este CNAE passam a exigir a sua análise (não aprovam sozinhas)."
              }`
            : ""
        }
        confirmLabel="Sim, aplicar"
        danger={faixaPendente?.tier === "verde"}
        onConfirm={async () => {
          if (!faixaPendente) return;
          const { codigo, tier } = faixaPendente;
          setFaixaPendente(null);
          await trocarFaixa(codigo, tier);
        }}
      />

      <ConfirmDialog
        open={!!removerPendente}
        onOpenChange={(o) => { if (!o) setRemoverPendente(null); }}
        title="Remover este CNAE da lista?"
        description={
          removerPendente
            ? `${formatCnae(removerPendente.codigo)}${removerPendente.descricao ? ` — ${removerPendente.descricao}` : ""}.\n\n${
                removerPendente.tier === "verde"
                  ? "Ele deixa de aprovar sozinho: empresas com esse CNAE passam a cair na sua análise manual."
                  : "Empresas com esse CNAE continuam caindo na análise manual, como já caem hoje."
              }`
            : ""
        }
        confirmLabel="Remover"
        danger
        onConfirm={async () => {
          const alvo = removerPendente;
          setRemoverPendente(null);
          if (alvo) await remover(alvo.codigo);
        }}
      />
    </div>
  );
}
