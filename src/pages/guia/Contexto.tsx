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
import { tipoImage, guideHeroStrip } from "@/components/guide-v2/imagery";
import { buildContextQuery } from "@/components/guide-v2/useGuideQuery";
import { whatsappConsultor } from "@/data/guideMap";
import brasao from "@/assets/brasao.png";

const TIPOS: Array<{ value: TipoVisual; microcopy?: string }> = [
  { value: "piscina" },
  { value: "lago" },
  { value: "lago-reduzido", microcopy: "Versão econômica" },
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

      {/* Hero photographic strip — pedra real respirando atrás do contexto */}
      <div className="relative w-full h-[180px] md:h-[220px] overflow-hidden">
        <img
          src={guideHeroStrip}
          alt=""
          aria-hidden
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, hsl(var(--western-ivory) / 0.1) 0%, hsl(var(--western-ivory) / 0.85) 70%, hsl(var(--western-ivory)) 100%)",
          }}
        />
        <div className="container-western h-full flex items-end pb-7 relative">
          <p className="font-display italic text-xl md:text-2xl text-western-green-deep">
            O ponto de partida do seu projeto.
          </p>
        </div>
      </div>

      <main className="container-western max-w-[920px] pt-10 pb-32 relative">
        <Reveal variant="fade-up" duration={700}>
          <p className="eyebrow-bar mb-5">Guia de composição · Etapa 01</p>
          <h1 className="font-display text-4xl md:text-[56px] text-western-green-deep leading-[1.05] mb-6">
            Conte sobre o projeto que você está atendendo.
          </h1>
          <div className="w-12 h-px bg-western-gold mb-6" />
          <p className="font-display italic text-lg md:text-xl text-western-stone-warm leading-relaxed max-w-[600px]">
            Em três perguntas, mostramos três caminhos de composição com preço, peças e prévia em 3D.
          </p>
        </Reveal>

        {/* 01 */}
        <section ref={refTipo} className="mt-20">
          <Reveal variant="fade-up" duration={700} delay={140}>
            <p className={`eyebrow-bar mb-7 transition-colors ${highlight === "tipo" ? "!text-western-green-deep" : ""}`}>
              01 · Tipo de ambiente
            </p>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4">
              {TIPOS.map((t, i) => (
                <TipoCard
                  key={t.value}
                  value={t.value}
                  label={tipoVisualMap[t.value].label}
                  microcopy={t.microcopy}
                  image={tipoImage[t.value]}
                  selected={tipo === t.value}
                  onSelect={setTipo}
                  variant={i === 4 ? "wide" : undefined}
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
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
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

      {/* Brasão watermark */}
      <img
        src={brasao}
        alt=""
        aria-hidden
        className="hidden md:block fixed bottom-6 right-6 w-20 opacity-[0.04] pointer-events-none select-none z-0"
      />
    </div>
  );
}
