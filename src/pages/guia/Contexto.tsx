import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Check } from "lucide-react";
import GuideHeader from "@/components/guide-v2/GuideHeader";
import TipoCard from "@/components/guide-v2/TipoCard";
import AreaInput from "@/components/guide-v2/AreaInput";
import AcabamentoCard from "@/components/guide-v2/AcabamentoCard";
import SectionDivider from "@/components/guide-v2/SectionDivider";
import Reveal from "@/components/shared/Reveal";
import Seo from "@/components/seo/Seo";
import {
  acabamentoMeta,
  tipoVisualMap,
  type Acabamento,
  type TipoVisual,
} from "@/components/guide-v2/types";
import { tipoImage, tipoMicrocopy } from "@/components/guide-v2/imagery";
import { buildContextQuery } from "@/components/guide-v2/useGuideQuery";
import { whatsappConsultor } from "@/data/guideMap";
import brasao from "@/assets/brasao.png";
import ricardoAtelie from "@/assets/hero/ricardo-atelie.webp";

const TIPOS: Array<{ value: TipoVisual }> = [
  { value: "piscina" },
  { value: "lago" },
  { value: "lago-hibrido" },
  { value: "jardim-fonte" },
  { value: "jardim-seco" },
];

const STORAGE_KEY = "western-guia-contexto";
const VALID_TIPOS: TipoVisual[] = ["piscina", "lago", "lago-hibrido", "jardim-fonte", "jardim-seco"];

/**
 * O header do guia é sticky com 80px. Ancorar uma seção no topo sem reservar
 * espaço fazia a barra cobrir a pergunta (o input de metragem, no mobile).
 * scroll-mt = altura do header + respiro.
 */
const SCROLL_ANCHOR = "scroll-mt-[104px]";

/**
 * Cabeçalho reutilizável de pergunta (01/02/03) — redesign da 1ª dobra do guia
 * (2026-07-17). Um numeral-token quieto (verde só no highlight de validação, pra
 * NÃO duplicar o círculo verde de etapa ativa do GuideHeader sticky) + h2 real
 * (a11y) + chip "selecionado". Aplicado igual nas 3 perguntas = ritmo.
 */
function QuestionHead({
  n,
  title,
  help,
  highlighted,
  selection,
}: {
  n: string;
  title: string;
  help: string;
  highlighted?: boolean;
  selection?: { label: string };
}) {
  return (
    <div className="mb-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span
            aria-hidden
            className={`inline-flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg border font-sans text-[15px] font-semibold tabular-nums transition-colors ${
              highlighted
                ? "border-western-cta bg-western-cta text-western-cream"
                : "border-western-border-strong bg-white text-western-bronze"
            }`}
          >
            {n}
          </span>
          <h2 className="text-title-sm text-western-green-deep">{title}</h2>
        </div>
        {selection && (
          <span className="inline-flex items-center gap-2 rounded-full border border-western-border-soft bg-white px-3 py-1 font-sans text-[14px] font-semibold text-western-green-deep">
            <Check className="h-4 w-4 text-western-gold" aria-hidden /> {selection.label}
          </span>
        )}
      </div>
      {/* help pendura sob o título no desktop (pl-12 = token 36 + gap 12);
          flush-left no mobile para não comer largura em 375px */}
      <p className="text-body mt-3 max-w-[58ch] md:pl-12">{help}</p>
    </div>
  );
}

function readStored(): { tipo?: TipoVisual; area?: string; acabamento?: Acabamento } {
  try {
    const raw = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
    if (!raw) return {};
    const parsed = JSON.parse(raw) as { tipo?: unknown; area?: unknown; acabamento?: unknown };
    const tipo = typeof parsed.tipo === "string" && (VALID_TIPOS as string[]).includes(parsed.tipo)
      ? (parsed.tipo as TipoVisual)
      : undefined;
    const area = typeof parsed.area === "string" ? parsed.area : "";
    const acabamento = typeof parsed.acabamento === "string" && parsed.acabamento in acabamentoMeta
      ? (parsed.acabamento as Acabamento)
      : undefined;
    return { tipo, area, acabamento };
  } catch {
    return {};
  }
}

export default function GuiaContexto() {
  const navigate = useNavigate();
  const [tipo, setTipo] = useState<TipoVisual | undefined>(() => readStored().tipo);
  const [area, setArea] = useState(() => readStored().area ?? "");
  const [acabamento, setAcabamento] = useState<Acabamento | undefined>(() => readStored().acabamento);
  const [highlight, setHighlight] = useState<string | null>(null);

  const refTipo = useRef<HTMLDivElement>(null);
  const refArea = useRef<HTMLDivElement>(null);
  const refAcab = useRef<HTMLDivElement>(null);

  const areaNum = area ? parseInt(area, 10) : 0;
  const valid = !!tipo && areaNum >= 1 && areaNum <= 200 && !!acabamento;

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ tipo, area, acabamento }));
    } catch {
      /* ignore */
    }
  }, [tipo, area, acabamento]);

  useEffect(() => {
    if (!highlight) return;
    const t = setTimeout(() => setHighlight(null), 2000);
    return () => clearTimeout(t);
  }, [highlight]);

  const handleSubmit = () => {
    if (!tipo) {
      refTipo.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      setHighlight("tipo");
      return;
    }
    if (!area || areaNum < 1 || areaNum > 200) {
      refArea.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      setHighlight("area");
      return;
    }
    if (!acabamento) {
      refAcab.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      setHighlight("acabamento");
      return;
    }
    const qs = buildContextQuery({ tipoVisual: tipo, area: areaNum, acabamento });
    navigate(`/guia-de-composicao/composicoes?${qs}`);
  };

  return (
    <div className="min-h-screen surface-ivory relative">
      <Seo
        title="Guia de composição — Western"
        description="Conte o contexto do projeto — tipo, área e acabamento — e veja três caminhos de composição com peças, preço e visualização."
        path="/guia-de-composicao"
      />
      <GuideHeader step={1} />

      {/* Cabeçalho da etapa — split editorial numa calha única (redesign 1ª
          dobra, 2026-07-17): texto 7col / retrato 5col; a borda direita do
          retrato cai no rail = borda direita da grade de cards abaixo. Nada
          centralizado; o equilíbrio vem da assimetria 7/5 e das bordas
          coincidentes. No mobile o retrato vira faixa de 44px (não empurra a
          1ª pergunta pra baixo da dobra). */}
      <section className="bg-western-ivory border-b border-western-border-soft">
        <div className="container-western py-9 md:py-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 lg:items-center">
            <div className="lg:col-span-7">
              <p className="text-eyebrow mb-3">Contexto</p>
              <h1 className="display-lg text-western-green-deep mb-4">Conte sobre o projeto.</h1>
              <p className="text-body max-w-[54ch]">
                Três perguntas rápidas. No fim, três caminhos de composição — com peças, preço
                e visualização.
              </p>

              {/* Ricardo em escala de pessoa — só mobile/tablet. */}
              <div className="lg:hidden mt-7 flex items-center gap-3">
                <img
                  src={ricardoAtelie}
                  alt="Ricardo Western, fundador, no ateliê de Cajamar"
                  className="h-11 w-11 flex-shrink-0 rounded-full object-cover object-center ring-1 ring-western-border-strong"
                />
                <p className="text-meta">
                  Guiado por{" "}
                  <span className="font-semibold text-western-green-deep">Ricardo Western</span> ·
                  fundador, ateliê Cajamar
                </p>
              </div>
            </div>

            {/* Retrato — desktop. Borda direita no rail = borda direita dos cards. */}
            <figure className="hidden lg:block lg:col-span-5 m-0">
              <div className="relative overflow-hidden rounded-xl border border-western-border-soft aspect-[4/3]">
                <img
                  src={ricardoAtelie}
                  alt="Ricardo Western, fundador, no ateliê de Cajamar"
                  className="absolute inset-0 h-full w-full object-cover object-center"
                />
                <div
                  aria-hidden
                  className="absolute inset-x-0 bottom-0 h-2/5 pointer-events-none"
                  style={{
                    background:
                      "linear-gradient(180deg, transparent, hsl(var(--western-green-deep) / 0.78))",
                  }}
                />
                <figcaption className="absolute bottom-3 left-4 right-4 flex items-center gap-2 font-sans text-[13px] font-semibold tracking-[0.04em] text-western-cream">
                  <span aria-hidden className="inline-block h-1.5 w-1.5 rounded-full bg-western-gold" />
                  Ricardo Western · fundador, ateliê Cajamar
                </figcaption>
              </div>
            </figure>
          </div>
        </div>
      </section>

      <main className="container-western pt-9 md:pt-10 pb-28 relative">
        {/* Perguntas usam o RAIL INTEIRO (sem max-w-[920px]): assim a borda
            direita da grade de cards coincide com a do retrato acima — o
            alinhamento que matava o "torto". */}
        {/* 01 — a 1ª pergunta renderiza JÁ no load (auditoria): sem gate de
            scroll-reveal, senão o preview/crawler/scroll-rápido pega vazio. */}
        <section ref={refTipo} className={SCROLL_ANCHOR}>
          <QuestionHead
            n="01"
            title="Tipo de ambiente"
            help="Selecione o que mais se aproxima do projeto que você está atendendo."
            highlighted={highlight === "tipo"}
            selection={tipo ? { label: tipoVisualMap[tipo].label } : undefined}
          />
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-5">
            {TIPOS.map((t) => (
              <TipoCard
                key={t.value}
                value={t.value}
                label={tipoVisualMap[t.value].label}
                microcopy={tipoMicrocopy[t.value]}
                image={tipoImage[t.value]}
                selected={tipo === t.value}
                onSelect={setTipo}
              />
            ))}
          </div>
        </section>

        <div className="mt-14">
          <SectionDivider />
        </div>

        {/* 02 */}
        <section ref={refArea} className={`mt-14 ${SCROLL_ANCHOR}`}>
          <Reveal variant="fade-up" duration={700} delay={140}>
            <QuestionHead
              n="02"
              title="Área aproximada"
              help="Digite a metragem aproximada (entre 1 e 200 m²). Pode ser estimativa."
              highlighted={highlight === "area"}
              selection={areaNum >= 1 && areaNum <= 200 ? { label: `${areaNum} m²` } : undefined}
            />
            <div className="md:pl-12">
              <AreaInput value={area} onChange={setArea} id="area-input" />
            </div>
          </Reveal>
        </section>

        <div className="mt-14">
          <SectionDivider />
        </div>

        {/* 03 */}
        <section ref={refAcab} className={`mt-14 ${SCROLL_ANCHOR}`}>
          <Reveal variant="fade-up" duration={700} delay={140}>
            <QuestionHead
              n="03"
              title="Acabamento dominante"
              help="Escolha o tom dominante das pedras. Único para todas as peças do conjunto — você troca no próximo passo se quiser."
              highlighted={highlight === "acabamento"}
              selection={acabamento ? { label: acabamentoMeta[acabamento].label } : undefined}
            />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5">
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
          </Reveal>
        </section>

        <div className="mt-14">
          <SectionDivider />
        </div>

        {/* CTA */}
        <div className="mt-12">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!valid}
            className="btn-primary w-full md:w-auto"
          >
            Ver composições <ArrowRight className="h-5 w-5" aria-hidden />
          </button>
          <p className="text-meta mt-6">
            Está sem tempo?{" "}
            <a
              href={whatsappConsultor("piscina", "Variada")}
              target="_blank"
              rel="noreferrer"
              className="link-underline font-semibold text-western-green-deep"
            >
              Falar com consultor diretamente
            </a>
          </p>
        </div>
      </main>

      {/* Como funciona — apoio, deliberadamente abaixo da dobra */}
      <section className="border-t border-western-border-soft surface-paper">
        <div className="container-western py-12 md:py-16">
          <p className="text-eyebrow mb-8">Como funciona o guia</p>
          <ol className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10">
            {[
              { n: "01", t: "Conte sobre o ambiente", d: "Tipo, área aproximada e o tom de acabamento." },
              { n: "02", t: "Veja três caminhos", d: "Composições essencial, equilibrada e completa." },
              { n: "03", t: "Refine e finalize", d: "Ajuste peças, adicione autorais (exclusivas) e feche o pedido." },
            ].map((s) => (
              <li key={s.n} className="flex gap-4">
                <span className="font-sans text-[14px] font-semibold tracking-[0.06em] text-western-bronze pt-1">
                  {s.n}
                </span>
                <div>
                  <h3 className="font-sans text-[18px] font-semibold text-western-green-deep leading-snug">
                    {s.t}
                  </h3>
                  <p className="text-body mt-2">{s.d}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <img
        src={brasao}
        alt=""
        aria-hidden
        className="hidden md:block fixed bottom-6 right-6 w-20 opacity-[0.04] pointer-events-none select-none z-0"
      />
    </div>
  );
}
