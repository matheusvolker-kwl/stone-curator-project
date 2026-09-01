import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Save } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import {
  DataTable, type Coluna,
  PageHeader,
  Tabs,
} from "@/components/backoffice";
import { TIERS, TIER_LABEL, type Tier } from "@/components/admin/adminUtils";
import AdminCnaeWhitelist from "./AdminCnaeWhitelist";

/**
 * Configurações — padrões por nível do Western Pro + CNAEs que credenciam.
 *
 * Antes: `const { data } = await supabase.from("tier_defaults")…` — se a query
 * falhasse, a tela mostrava os 4 níveis zerados como se fossem os valores reais
 * do banco. O dono poderia salvar por cima achando que estava só confirmando.
 * Agora o erro é estado, a tabela mostra EstadoErro e o salvar fica travado.
 *
 * Também mudou a ergonomia: era um botão "Salvar" por card (4 ações primárias
 * competindo). Agora é UMA ação primária verde no topo, que grava só o que mudou.
 */

interface TierDefault {
  tier: Tier;
  discount_pct: number;
  boleto: boolean;
  parcelas_max: number;
  kit_gratis: boolean;
}

const VAZIO: Omit<TierDefault, "tier"> = {
  discount_pct: 0,
  boleto: false,
  parcelas_max: 1,
  kit_gratis: false,
};

const numCls =
  "h-tap w-[100px] rounded-sm border border-western-border-strong bg-white px-3 text-right text-[15px] tabular-nums text-western-green-deep transition-colors focus:border-western-cta focus:outline-none focus:ring-2 focus:ring-western-cta/20";

export default function AdminSettings() {
  const [searchParams, setSearchParams] = useSearchParams();
  const rawTab = searchParams.get("tab");
  const aba: "tiers" | "cnae" = rawTab === "cnae" ? "cnae" : "tiers";

  const trocarAba = (k: "tiers" | "cnae") => {
    const next = new URLSearchParams(searchParams);
    next.set("tab", k);
    setSearchParams(next, { replace: true });
  };

  /* O estado dos níveis vive aqui em cima porque a ação primária ("Salvar
     alterações") mora no PageHeader — uma por tela, e verde. */
  const [defs, setDefs] = useState<TierDefault[]>([]);
  const [originais, setOriginais] = useState<TierDefault[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<unknown>(null);
  const [salvando, setSalvando] = useState(false);

  const load = useCallback(async () => {
    setCarregando(true);
    setErro(null);
    const { data, error } = await supabase.from("tier_defaults").select("*").order("tier");
    if (error) {
      setErro(error);
    } else {
      const linhas: TierDefault[] = TIERS.map((t) => {
        const achado = (data as TierDefault[] | null)?.find((d) => d.tier === t);
        return achado ?? { tier: t, ...VAZIO };
      });
      setDefs(linhas);
      setOriginais(linhas);
    }
    setCarregando(false);
  }, []);

  useEffect(() => { void load(); }, [load]);

  const sujos = useMemo(() => {
    if (erro || carregando) return [];
    return defs.filter((d) => {
      const o = originais.find((x) => x.tier === d.tier);
      if (!o) return true;
      return (
        o.discount_pct !== d.discount_pct ||
        o.parcelas_max !== d.parcelas_max ||
        o.boleto !== d.boleto ||
        o.kit_gratis !== d.kit_gratis
      );
    });
  }, [defs, originais, erro, carregando]);

  const update = (tier: Tier, patch: Partial<TierDefault>) =>
    setDefs((ds) => ds.map((d) => (d.tier === tier ? { ...d, ...patch } : d)));

  const salvar = async () => {
    if (sujos.length === 0) return;
    setSalvando(true);
    const resultados = await Promise.allSettled(
      sujos.map(async (t) => {
        const { error } = await supabase.from("tier_defaults").upsert({
          tier: t.tier,
          discount_pct: t.discount_pct,
          boleto: t.boleto,
          parcelas_max: t.parcelas_max,
          kit_gratis: t.kit_gratis,
        } as never, { onConflict: "tier" });
        if (error) throw error;
      }),
    );
    setSalvando(false);

    const ok = resultados.filter((r) => r.status === "fulfilled").length;
    const falhas = resultados.length - ok;

    if (falhas === 0) {
      toast.success(`${ok} nível(is) atualizado(s).`);
    } else {
      const primeira = resultados.find((r) => r.status === "rejected") as PromiseRejectedResult | undefined;
      const msg = primeira?.reason instanceof Error ? primeira.reason.message : undefined;
      toast.error(`${falhas} nível(is) não salvaram.`, { description: msg });
    }
    // Recarrega para o "sujo" refletir o que o banco realmente tem.
    await load();
  };

  const colunas: ReadonlyArray<Coluna<TierDefault>> = useMemo(() => [
    {
      key: "tier",
      header: "Nível",
      principalNoMobile: true,
      render: (t) => <span className="font-semibold text-western-green-deep">{TIER_LABEL[t.tier]}</span>,
    },
    {
      key: "discount_pct",
      header: "Desconto (%)",
      align: "right",
      render: (t) => (
        <input
          type="number"
          min={0}
          max={100}
          /* step="any" de proposito. A regra comercial de 31/08/2026 produz
             percentuais quebrados — 8,3333 no Vitrine e 16,6667 no Partner —
             porque o que precisa ser exato e o PRECO que o parceiro paga, nao
             o percentual. Com step="0.5" as setinhas empurravam para 4,5 ou 5
             e o navegador podia recusar o valor ao salvar: quem viesse arrumar
             outra coisa nesta tela quebraria os precos sem perceber. */
          step="any"
          value={t.discount_pct}
          onChange={(e) =>
            update(t.tier, {
              // min/max do HTML so afetam as setinhas: digitar 500 passava direto
              // e zerava o preco de toda a vitrine. Trava de verdade aqui.
              discount_pct: Math.min(100, Math.max(0, parseFloat(e.target.value) || 0)),
            })
          }
          aria-label={`Desconto padrão de ${TIER_LABEL[t.tier]}`}
          className={`${numCls} ml-auto`}
        />
      ),
    },
    {
      key: "parcelas_max",
      header: "Parcelas máx.",
      align: "right",
      render: (t) => (
        <input
          type="number"
          min={1}
          max={12}
          value={t.parcelas_max}
          onChange={(e) =>
            update(t.tier, {
              parcelas_max: Math.min(12, Math.max(1, parseInt(e.target.value, 10) || 1)),
            })
          }
          aria-label={`Parcelas máximas de ${TIER_LABEL[t.tier]}`}
          className={`${numCls} ml-auto`}
        />
      ),
    },
    {
      key: "boleto",
      header: "Boleto",
      render: (t) => (
        <div className="tap-target flex items-center">
          <Switch
            checked={t.boleto}
            onCheckedChange={(v) => update(t.tier, { boleto: v })}
            aria-label={`Permitir boleto no ${TIER_LABEL[t.tier]}`}
          />
        </div>
      ),
    },
    {
      key: "kit_gratis",
      header: "Kit grátis",
      render: (t) => (
        <div className="tap-target flex items-center">
          <Switch
            checked={t.kit_gratis}
            onCheckedChange={(v) => update(t.tier, { kit_gratis: v })}
            aria-label={`Kit de amostras grátis no ${TIER_LABEL[t.tier]}`}
          />
        </div>
      ),
    },
  ], []);

  return (
    <div>
      <PageHeader
        eyebrow="Configurações"
        titulo={aba === "tiers" ? "Padrões por nível" : "CNAEs que credenciam"}
        subtitulo={
          aba === "tiers"
            ? "Estes valores valem para todos os parceiros do nível — a menos que haja desconto individual em Parceiros."
            : "Quais atividades aprovam sozinhas o credenciamento e quais vão para a sua análise."
        }
        acao={
          aba === "tiers" ? (
            <button
              type="button"
              onClick={salvar}
              disabled={salvando || sujos.length === 0}
              className="btn-primary"
            >
              {salvando ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Save className="h-4 w-4" aria-hidden="true" />}
              {salvando
                ? "Salvando…"
                : sujos.length > 0
                  ? `Salvar ${sujos.length} ${sujos.length > 1 ? "alterações" : "alteração"}`
                  : "Salvar alterações"}
            </button>
          ) : undefined
        }
      />

      <Tabs
        abas={[
          { key: "tiers", label: "Padrões por nível" },
          { key: "cnae", label: "CNAEs que credenciam" },
        ]}
        ativa={aba}
        onChange={trocarAba}
        className="mb-6"
      />

      {aba === "tiers" ? (
        <DataTable
          linhas={defs}
          colunas={colunas}
          getId={(t) => t.tier}
          isLoading={carregando}
          error={erro}
          onRetry={load}
          vazio={{ titulo: "Nenhum nível configurado", mensagem: "Os quatro níveis do Western Pro deveriam aparecer aqui." }}
        />
      ) : (
        <AdminCnaeWhitelist />
      )}
    </div>
  );
}
