import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import GuideHeader from "@/components/guide-v2/GuideHeader";
import TipoCard from "@/components/guide-v2/TipoCard";
import AreaInput from "@/components/guide-v2/AreaInput";
import AcabamentoCard from "@/components/guide-v2/AcabamentoCard";
import { acabamentoMeta, tipoVisualMap, type Acabamento, type TipoVisual } from "@/components/guide-v2/types";
import { buildContextQuery } from "@/components/guide-v2/useGuideQuery";
import { whatsappConsultor } from "@/data/guideMap";

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
    <div className="min-h-screen bg-western-cream">
      <GuideHeader />
      <main className="mx-auto max-w-[880px] px-6 md:px-8 pt-16 pb-32">
        <p className="text-eyebrow mb-4">Guia de composição</p>
        <h1 className="font-display text-3xl md:text-5xl text-western-green-deep leading-[1.1] mb-5">
          Conte sobre o projeto que você está atendendo.
        </h1>
        <p className="font-display italic text-lg text-western-stone-warm leading-relaxed max-w-[560px]">
          Em duas perguntas, mostramos três caminhos de composição com preço, peças e prévia em 3D.
        </p>

        {/* Pergunta 1 */}
        <section ref={refTipo} className="mt-16">
          <p
            className={`text-eyebrow mb-5 transition-colors ${
              highlight === "tipo" ? "text-western-green-deep" : ""
            }`}
          >
            01 · Tipo de ambiente
          </p>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {TIPOS.map((t, i) => (
              <TipoCard
                key={t.value}
                value={t.value}
                label={tipoVisualMap[t.value].label}
                microcopy={t.microcopy}
                selected={tipo === t.value}
                onSelect={setTipo}
                variant={i === 4 ? "wide" : undefined}
              />
            ))}
          </div>
        </section>

        {/* Pergunta 2 */}
        <section ref={refArea} className="mt-14">
          <p
            className={`text-eyebrow mb-4 transition-colors ${
              highlight === "area" ? "text-western-green-deep" : ""
            }`}
          >
            02 · Área aproximada
          </p>
          <AreaInput value={area} onChange={setArea} id="area-input" />
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-western-stone-warm/70 mt-3">
            Digite a metragem aproximada da área. Pode ser estimativa.
          </p>
        </section>

        {/* Pergunta 3 */}
        <section ref={refAcab} className="mt-14">
          <p
            className={`text-eyebrow mb-2 transition-colors ${
              highlight === "acabamento" ? "text-western-green-deep" : ""
            }`}
          >
            03 · Acabamento dominante
          </p>
          <p className="font-sans italic text-[13px] text-western-stone-warm mb-5 max-w-[520px]">
            O acabamento é único para todas as peças do conjunto. Você pode trocar no próximo passo.
          </p>
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
        </section>

        {/* CTA */}
        <div className="mt-16">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!valid}
            className="btn-dark"
          >
            Ver composições <ArrowRight className="h-4 w-4" />
          </button>
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-western-stone-warm/70 mt-5">
            Está sem tempo?{" "}
            <a
              href={whatsappConsultor("lago", "Variada")}
              target="_blank"
              rel="noreferrer"
              className="text-western-green-deep hover:text-western-gold underline-offset-4 hover:underline"
            >
              → Falar com consultor diretamente
            </a>
          </p>
        </div>
      </main>
    </div>
  );
}
