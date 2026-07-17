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

      {/* Cabeçalho compacto — o retrato acompanha o h1 (não empurra a 1ª
          pergunta para baixo da dobra). A ação — escolher o tipo — começa
          logo abaixo, ainda na dobra, nos dois viewports. */}
      <section className="bg-western-ivory border-b border-western-border-soft">
        <div className="container-western py-8 md:py-9">
          <div className="grid grid-cols-[1fr_auto] gap-5 md:gap-10 items-center">
            <div>
              <p className="text-eyebrow mb-3">Etapa 01 de 3 · Contexto</p>
              <h1 className="display-lg text-western-green-deep mb-3">
                Conte sobre o projeto.
              </h1>
              <p className="text-body max-w-[52ch]">
                Três perguntas. No fim, três caminhos de composição — com peças, preço e
                visualização.
              </p>
            </div>

            <figure className="relative m-0 h-[116px] w-[92px] md:h-[200px] md:w-[300px] flex-shrink-0 overflow-hidden rounded-2xl">
              <img
                src={ricardoAtelie}
                alt="Ricardo Western, fundador, no ateliê de Cajamar"
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div
                aria-hidden
                className="absolute inset-x-0 bottom-0 h-1/2 pointer-events-none"
                style={{
                  background:
                    "linear-gradient(180deg, transparent, hsl(var(--western-green-deep) / 0.72))",
                }}
              />
              <figcaption className="absolute bottom-3 left-4 right-4 hidden md:block font-sans text-[13px] font-semibold tracking-[0.06em] text-western-cream">
                Ricardo Western · ateliê Cajamar
              </figcaption>
            </figure>
          </div>
        </div>
      </section>

      <main className="container-western pt-8 md:pt-9 pb-28 relative">
        <div className="max-w-[920px]">
        {/* 01 — a 1ª pergunta renderiza JÁ no load (auditoria): sem gate de
            scroll-reveal, senão o preview/crawler/scroll-rápido pega vazio. */}
        <section ref={refTipo} className={SCROLL_ANCHOR}>
          <div>
            <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
              <p
                className={`text-eyebrow transition-colors ${
                  highlight === "tipo" ? "!text-western-green-deep" : ""
                }`}
              >
                01 · Tipo de ambiente
              </p>
              {tipo && (
                <span className="inline-flex items-center gap-2 font-sans text-[14px] font-semibold text-western-green-deep">
                  <Check className="h-4 w-4 text-western-gold" aria-hidden /> {tipoVisualMap[tipo].label}
                </span>
              )}
            </div>
            <p className="text-body mb-6 max-w-[56ch]">
              Selecione o que mais se aproxima do projeto que você está atendendo.
            </p>
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
          </div>
        </section>

        <div className="mt-14">
          <SectionDivider />
        </div>

        {/* 02 */}
        <section ref={refArea} className={`mt-14 ${SCROLL_ANCHOR}`}>
          <Reveal variant="fade-up" duration={700} delay={140}>
            <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
              <p
                className={`text-eyebrow transition-colors ${
                  highlight === "area" ? "!text-western-green-deep" : ""
                }`}
              >
                02 · Área aproximada
              </p>
              {areaNum >= 1 && areaNum <= 200 && (
                <span className="inline-flex items-center gap-2 font-sans text-[14px] font-semibold text-western-green-deep tabular-nums">
                  <Check className="h-4 w-4 text-western-gold" aria-hidden /> {areaNum} m²
                </span>
              )}
            </div>
            <p className="text-body mb-8 max-w-[56ch]">
              Digite a metragem aproximada (entre 1 e 200 m²). Pode ser estimativa.
            </p>
            <AreaInput value={area} onChange={setArea} id="area-input" />
          </Reveal>
        </section>

        <div className="mt-14">
          <SectionDivider />
        </div>

        {/* 03 */}
        <section ref={refAcab} className={`mt-14 ${SCROLL_ANCHOR}`}>
          <Reveal variant="fade-up" duration={700} delay={140}>
            <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
              <p
                className={`text-eyebrow transition-colors ${
                  highlight === "acabamento" ? "!text-western-green-deep" : ""
                }`}
              >
                03 · Acabamento dominante
              </p>
              {acabamento && (
                <span className="inline-flex items-center gap-2 font-sans text-[14px] font-semibold text-western-green-deep">
                  <Check className="h-4 w-4 text-western-gold" aria-hidden />{" "}
                  {acabamentoMeta[acabamento].label}
                </span>
              )}
            </div>
            <p className="text-body mb-8 max-w-[56ch]">
              Escolha o tom dominante das pedras. Único para todas as peças do conjunto — você troca
              no próximo passo se quiser.
            </p>
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
                  <h3 className="font-sans text-[20px] font-semibold text-western-green-deep leading-snug">
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
