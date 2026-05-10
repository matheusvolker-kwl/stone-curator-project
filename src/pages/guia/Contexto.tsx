import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
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
import { tipoImage } from "@/components/guide-v2/imagery";
import { buildContextQuery } from "@/components/guide-v2/useGuideQuery";
import { whatsappConsultor } from "@/data/guideMap";
import brasao from "@/assets/brasao.png";
import ricardoAtelie from "@/assets/hero/ricardo-atelie.png";

const TIPOS: Array<{ value: TipoVisual }> = [
  { value: "piscina" },
  { value: "lago" },
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
      <GuideHeader />

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
              Em três perguntas, mostramos três caminhos de composição com peças, preço e prévia em SketchUp.
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

      <main className="container-western max-w-[920px] pt-16 pb-32 relative">
        {/* 01 */}
        <section ref={refTipo}>
          <Reveal variant="fade-up" duration={700} delay={140}>
            <p className={`eyebrow-bar mb-7 transition-colors ${highlight === "tipo" ? "!text-western-green-deep" : ""}`}>
              01 · Tipo de ambiente
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
              {TIPOS.map((t) => (
                <TipoCard
                  key={t.value}
                  value={t.value}
                  label={tipoVisualMap[t.value].label}
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
            <p className={`eyebrow-bar mb-7 transition-colors ${highlight === "area" ? "!text-western-green-deep" : ""}`}>
              02 · Área aproximada
            </p>
            <AreaInput value={area} onChange={setArea} id="area-input" />
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-western-stone-warm/70 mt-4">
              Digite a metragem aproximada da área. Pode ser estimativa.
            </p>
          </Reveal>
        </section>

        <SectionDivider />

        {/* 03 */}
        <section ref={refAcab} className="mt-12">
          <Reveal variant="fade-up" duration={700} delay={140}>
            <p className={`eyebrow-bar mb-3 transition-colors ${highlight === "acabamento" ? "!text-western-green-deep" : ""}`}>
              03 · Acabamento dominante
            </p>
            <p className="font-display italic text-[15px] text-western-stone-warm mb-7 max-w-[560px]">
              O acabamento é único para todas as peças do conjunto. Você pode trocar no próximo passo.
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
              href={whatsappConsultor("lago", "Variada")}
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
