import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Check, ChevronDown } from "lucide-react";
import GuideHeader from "@/components/guide-v2/GuideHeader";
import TipoCard from "@/components/guide-v2/TipoCard";
import AreaInput from "@/components/guide-v2/AreaInput";
import AcabamentoCard from "@/components/guide-v2/AcabamentoCard";
import SectionDivider from "@/components/guide-v2/SectionDivider";
import Reveal from "@/components/shared/Reveal";
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

export default function GuiaContexto() {
  const navigate = useNavigate();
  const [tipo, setTipo] = useState<TipoVisual | undefined>();
  const [area, setArea] = useState("");
  const [acabamento, setAcabamento] = useState<Acabamento | undefined>();
  const [highlight, setHighlight] = useState<string | null>(null);

  const refTipo = useRef<HTMLDivElement>(null);
  const refArea = useRef<HTMLDivElement>(null);
  const refAcab = useRef<HTMLDivElement>(null);

  const areaNum = area ? parseInt(area, 10) : 0;
  const valid = !!tipo && areaNum >= 1 && areaNum <= 200 && !!acabamento;

  useEffect(() => {
    if (!highlight) return;
    const t = setTimeout(() => setHighlight(null), 2000);
    return () => clearTimeout(t);
  }, [highlight]);

  const handleSubmit = () => {
    if (!tipo) {
      refTipo.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      setHighlight("tipo");
      return;
    }
    if (!area || areaNum < 1 || areaNum > 200) {
      refArea.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      setHighlight("area");
      return;
    }
    if (!acabamento) {
      refAcab.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      setHighlight("acabamento");
      return;
    }
    const qs = buildContextQuery({ tipoVisual: tipo, area: areaNum, acabamento });
    navigate(`/guia-de-composicao/composicoes?${qs}`);
  };

  return (
    <div className="min-h-screen surface-ivory relative">
      <GuideHeader step={1} />

      {/* Hero — Ricardo no ateliê */}
      <section className="relative bg-western-ivory border-b border-western-gold/20">
        <div className="container-western grid grid-cols-1 md:grid-cols-[5fr_7fr] gap-0 md:gap-10 items-stretch">
          <div className="py-12 md:py-20 pr-0 md:pr-6 flex flex-col justify-center">
            <p className="font-display italic text-lg md:text-xl text-western-stone-warm mb-3">
              O ponto de partida do seu projeto.
            </p>
            <p className="eyebrow-bar mb-5">Guia de composição · Etapa 01</p>
            <h1 className="font-display text-[34px] md:text-[52px] text-western-green-deep leading-[1.05] mb-6">
              Conte sobre o projeto que você está atendendo.
            </h1>
            <div className="w-12 h-px bg-western-gold mb-5" />
            <p className="font-display italic text-[15px] md:text-[17px] text-western-stone-warm max-w-md leading-relaxed">
              Em três perguntas, mostramos três caminhos de composição com peças, preço e visualização da composição.
            </p>
          </div>
          <div className="relative h-[280px] md:h-[460px] overflow-hidden">
            {/* divisor vertical hairline gold à esquerda */}
            <div aria-hidden className="hidden md:block absolute left-0 top-8 bottom-8 w-px bg-western-gold/30 z-10" />
            <img
              src={ricardoAtelie}
              alt="Ricardo Western, fundador, no ateliê de Cajamar"
              className="absolute inset-0 w-full h-full object-cover"
            />
            <p className="absolute bottom-3 right-4 font-mono text-[9px] uppercase tracking-[0.22em] text-western-cream/80 z-10">
              Ricardo Western · ateliê Cajamar
            </p>
          </div>
        </div>
      </section>

      {/* Como funciona — orientação editorial */}
      <section className="border-b border-western-stone-warm/15">
        <div className="container-western py-10 md:py-12">
          <p className="eyebrow-bar mb-6 text-center md:text-left">Como funciona o guia</p>
          <ol className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-10">
            {[
              { n: "01", t: "Conte sobre o ambiente", d: "Tipo, área aproximada e o tom de acabamento." },
              { n: "02", t: "Veja três caminhos", d: "Composições essencial, equilibrada e completa." },
              { n: "03", t: "Refine e finalize", d: "Ajuste peças, some autorais e feche o pedido." },
            ].map((s) => (
              <li key={s.n} className="flex gap-4">
                <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-western-gold pt-1.5">{s.n}</span>
                <div>
                  <h3 className="font-display text-[20px] text-western-green-deep leading-tight">{s.t}</h3>
                  <p className="font-display italic text-[14px] text-western-stone-warm mt-1.5 leading-relaxed">{s.d}</p>
                </div>
              </li>
            ))}
          </ol>
          <div className="flex flex-col items-center mt-10">
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-western-stone-warm mb-3">
              Comece pela primeira pergunta
            </p>
            <ChevronDown className="h-5 w-5 text-western-gold animate-bounce" />
          </div>
        </div>
      </section>

      <main className="container-western max-w-[920px] pt-16 pb-32 relative">
        {/* 01 */}
        <section ref={refTipo}>
          <Reveal variant="fade-up" duration={700} delay={140}>
            <div className="flex items-center justify-between gap-4 mb-3">
              <p className={`eyebrow-bar transition-colors ${highlight === "tipo" ? "!text-western-green-deep" : ""}`}>
                01 · Tipo de ambiente
              </p>
              {tipo && (
                <span className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.22em] text-western-green-deep">
                  <Check className="h-3 w-3 text-western-gold" /> {tipoVisualMap[tipo].label}
                </span>
              )}
            </div>
            <p className="font-display italic text-[15px] text-western-stone-warm mb-7 max-w-[560px]">
              Selecione o tipo que mais se aproxima do projeto que você está atendendo.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
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
          </Reveal>
        </section>

        <SectionDivider />

        {/* 02 */}
        <section ref={refArea} className="mt-12">
          <Reveal variant="fade-up" duration={700} delay={140}>
            <div className="flex items-center justify-between gap-4 mb-3">
              <p className={`eyebrow-bar transition-colors ${highlight === "area" ? "!text-western-green-deep" : ""}`}>
                02 · Área aproximada
              </p>
              {areaNum >= 1 && areaNum <= 200 && (
                <span className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.22em] text-western-green-deep">
                  <Check className="h-3 w-3 text-western-gold" /> {areaNum} m²
                </span>
              )}
            </div>
            <p className="font-display italic text-[15px] text-western-stone-warm mb-7 max-w-[560px]">
              Digite a metragem aproximada (entre 1 e 200 m²). Pode ser estimativa.
            </p>
            <AreaInput value={area} onChange={setArea} id="area-input" />
          </Reveal>
        </section>

        <SectionDivider />

        {/* 03 */}
        <section ref={refAcab} className="mt-12">
          <Reveal variant="fade-up" duration={700} delay={140}>
            <div className="flex items-center justify-between gap-4 mb-3">
              <p className={`eyebrow-bar transition-colors ${highlight === "acabamento" ? "!text-western-green-deep" : ""}`}>
                03 · Acabamento dominante
              </p>
              {acabamento && (
                <span className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.22em] text-western-green-deep">
                  <Check className="h-3 w-3 text-western-gold" /> {acabamentoMeta[acabamento].label}
                </span>
              )}
            </div>
            <p className="font-display italic text-[15px] text-western-stone-warm mb-7 max-w-[560px]">
              Escolha o tom dominante das pedras. Único para todas as peças do conjunto — você troca no próximo passo se quiser.
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

        <SectionDivider />

        {/* CTA */}
        <div className="mt-10">
          <button type="button" onClick={handleSubmit} disabled={!valid} className="btn-dark">
            Ver composições <ArrowRight className="h-4 w-4" />
          </button>
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-western-stone-warm/80 mt-6">
            Está sem tempo?{" "}
            <a
              href={whatsappConsultor("piscina", "Variada")}
              target="_blank"
              rel="noreferrer"
              className="link-underline text-western-green-deep"
            >
              Falar com consultor diretamente →
            </a>
          </p>
        </div>
      </main>

      <img
        src={brasao}
        alt=""
        aria-hidden
        className="hidden md:block fixed bottom-6 right-6 w-20 opacity-[0.04] pointer-events-none select-none z-0"
      />
    </div>
  );
}
