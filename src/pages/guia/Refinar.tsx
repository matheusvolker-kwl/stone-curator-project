import { useEffect, useMemo, useState } from "react";
import { Link, Navigate, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { ChevronDown, ChevronUp, ExternalLink } from "lucide-react";
import GuideHeader from "@/components/guide-v2/GuideHeader";
import PecaRow from "@/components/guide-v2/PecaRow";
import AutoralCard from "@/components/guide-v2/AutoralCard";
import AcabamentoCard from "@/components/guide-v2/AcabamentoCard";
import ProjetoSidebar from "@/components/guide-v2/ProjetoSidebar";
import {
  acabamentoMeta,
  nivelLabelMap,
  tipoVisualMap,
  type Acabamento,
  type ProjetoExtra,
  type ProjetoPeca,
  type TipoVisual,
} from "@/components/guide-v2/types";
import { autoralToExtra, getAutoraisFor } from "@/components/guide-v2/autoraisCatalog";
import { getPecasPlaceholder } from "@/components/guide-v2/pecasPlaceholder";
import { buildContextQuery } from "@/components/guide-v2/useGuideQuery";
import {
  guideMap,
  m2ToTamanhoId,
  tamanhoLabels,
  type ConjuntoLeaf,
  type Nivel,
} from "@/data/guideMap";

function findConjunto(handle: string): { conjunto: ConjuntoLeaf; nivel: Nivel } | null {
  let found: { conjunto: ConjuntoLeaf; nivel: Nivel } | null = null;
  const walk = (n: unknown, key?: string) => {
    if (!n || typeof n !== "object") return;
    if ("handle" in (n as object) && (n as ConjuntoLeaf).handle === handle) {
      found = { conjunto: n as ConjuntoLeaf, nivel: (key as Nivel) ?? "equilibrada" };
      return;
    }
    Object.entries(n as Record<string, unknown>).forEach(([k, v]) => walk(v, k));
  };
  walk(guideMap);
  return found;
}

export default function GuiaRefinar() {
  const { handle } = useParams();
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();

  const found = useMemo(() => (handle ? findConjunto(handle) : null), [handle]);
  const acabamento = (params.get("acabamento") as Acabamento | null) ?? "moledo";
  const tipoVisual = (params.get("tipo") as TipoVisual | null) ?? "lago";
  const area = params.get("area");
  const nivelParam = (params.get("nivel") as Nivel | null) ?? found?.nivel ?? "equilibrada";

  const [pecas, setPecas] = useState<ProjetoPeca[]>([]);
  const [extras, setExtras] = useState<ProjetoExtra[]>([]);
  const [showAcab, setShowAcab] = useState(false);

  useEffect(() => {
    setPecas(getPecasPlaceholder(nivelParam));
  }, [nivelParam]);

  if (!found) {
    return <Navigate to="/guia-de-composicao" replace />;
  }
  const { conjunto } = found;
  const tipoMeta = tipoVisualMap[tipoVisual];
  const tamanhoId = area ? m2ToTamanhoId(tipoMeta.tipo, Number(area)) : null;

  const onQty = (id: string, qty: number) => {
    setPecas((prev) =>
      qty <= 0 ? prev.filter((p) => p.id !== id) : prev.map((p) => (p.id === id ? { ...p, qty } : p))
    );
  };
  const onRemove = (id: string) => setPecas((prev) => prev.filter((p) => p.id !== id));

  const autorais = getAutoraisFor(tipoVisual);
  const isExtraSelected = (id: string) => extras.some((e) => e.id === id);
  const toggleExtra = (id: string) => {
    setExtras((prev) =>
      prev.some((e) => e.id === id)
        ? prev.filter((e) => e.id !== id)
        : [...prev, autoralToExtra(autorais.find((a) => a.id === id)!)]
    );
  };

  const setAcabamento = (a: Acabamento) => {
    const next = new URLSearchParams(params);
    next.set("acabamento", a);
    setParams(next, { replace: true });
    setShowAcab(false);
  };

  const ctx = { tipoVisual, area: area ? Number(area) : undefined, acabamento };
  const backToCaminhos = `/guia-de-composicao/composicoes?${buildContextQuery(ctx)}`;

  const onFinalizar = () => navigate("/guia-de-composicao/finalizar");

  return (
    <div className="min-h-screen bg-western-cream">
      <GuideHeader breadcrumb={{ label: "Voltar · Três caminhos", to: backToCaminhos }} />
      <main className="mx-auto max-w-[1280px] px-6 md:px-16 pt-12 pb-32 lg:pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-10 items-start">
          <div className="min-w-0">
            {/* Cabeçalho */}
            <div className="flex items-start justify-between gap-6">
              <div>
                <p className="text-eyebrow mb-3">Composição base</p>
                <h1 className="font-display text-3xl md:text-[40px] text-western-green-deep leading-[1.1]">
                  {conjunto.nome}
                </h1>
                <div className="flex flex-wrap gap-2 mt-4">
                  <Tag>{tipoMeta.label}</Tag>
                  {tamanhoId && tamanhoId !== "consultor" && (
                    <Tag>{tamanhoLabels[tamanhoId]}</Tag>
                  )}
                  <Tag>{nivelLabelMap[nivelParam]}</Tag>
                  <Tag>{acabamentoMeta[acabamento].label}</Tag>
                </div>
                <p className="font-display italic text-base md:text-lg text-western-stone-warm leading-relaxed mt-5 max-w-[600px]">
                  {conjunto.subtitulo}. Cascata central com pedras de apoio que constroem volume sem
                  sobrecarregar o espaço.
                </p>
              </div>
              <Link
                to={backToCaminhos}
                className="hidden md:inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-western-stone-warm hover:text-western-green-deep flex-shrink-0"
              >
                <ExternalLink className="h-3 w-3" /> Trocar de composição
              </Link>
            </div>

            {/* Peças */}
            <section className="mt-16">
              <p className="text-eyebrow mb-2">Peças desta composição</p>
              <div className="mt-4">
                {pecas.map((p) => (
                  <PecaRow key={p.id} peca={p} onQty={onQty} onRemove={onRemove} />
                ))}
              </div>
            </section>

            {/* Autorais */}
            <section className="mt-16">
              <p className="text-eyebrow mb-2">Adicionar itens autorais</p>
              <h2 className="font-display text-2xl md:text-[28px] text-western-green-deep leading-tight">
                Peças que somam ao projeto.
              </h2>
              <p className="font-sans italic text-[14px] text-western-stone-warm max-w-[600px] mt-3">
                Estas peças são vendidas avulsas e não fazem parte do conjunto base. Adicione ao projeto e elas
                viajam no mesmo pedido com frete otimizado.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-7">
                {autorais.map((a) => (
                  <AutoralCard
                    key={a.id}
                    item={a}
                    selected={isExtraSelected(a.id)}
                    onToggle={() => toggleExtra(a.id)}
                  />
                ))}
              </div>
            </section>

            {/* Trocar acabamento */}
            <section className="mt-16">
              <p className="text-eyebrow mb-2">
                Acabamento atual: {acabamentoMeta[acabamento].label}
              </p>
              <button
                type="button"
                onClick={() => setShowAcab((v) => !v)}
                className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.22em] text-western-green-deep hover:text-western-gold transition-colors"
              >
                {showAcab ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                {showAcab ? "Fechar" : "Trocar acabamento desta composição"}
              </button>
              {showAcab && (
                <div className="mt-5 max-w-2xl">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {(Object.keys(acabamentoMeta) as Acabamento[]).map((a, i) => (
                      <AcabamentoCard
                        key={a}
                        value={a}
                        index={i + 1}
                        selected={acabamento === a}
                        onSelect={setAcabamento}
                      />
                    ))}
                  </div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-western-stone-warm/70 mt-4">
                    Trocar o acabamento recalcula o projeto inteiro.
                  </p>
                </div>
              )}
            </section>
          </div>

          <ProjetoSidebar
            conjunto={conjunto}
            pecas={pecas}
            extras={extras}
            acabamento={acabamento}
            onFinalizar={onFinalizar}
          />
        </div>
      </main>
    </div>
  );
}

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="font-mono text-[10px] uppercase tracking-[0.18em] px-2.5 py-1 bg-western-cream-muted/30 text-western-green-deep">
      {children}
    </span>
  );
}
