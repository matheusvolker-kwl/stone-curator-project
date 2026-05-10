import { Link, Navigate } from "react-router-dom";
import GuideHeader from "@/components/guide-v2/GuideHeader";
import ComposicaoCard from "@/components/guide-v2/ComposicaoCard";
import Reveal from "@/components/shared/Reveal";
import { acabamentoMeta, tipoVisualMap } from "@/components/guide-v2/types";
import { buildContextQuery, useGuideContext } from "@/components/guide-v2/useGuideQuery";
import {
  guideMap,
  m2ToTamanhoId,
  whatsappConsultor,
  type ConjuntoLeaf,
  type Nivel,
} from "@/data/guideMap";

const NIVEIS: Nivel[] = ["essencial", "equilibrada", "completa"];

export default function GuiaComposicoes() {
  const ctx = useGuideContext();

  if (!ctx.tipoVisual || !ctx.area || !ctx.acabamento) {
    return <Navigate to="/guia-de-composicao" replace />;
  }

  const { tipo, variante, copy, label } = tipoVisualMap[ctx.tipoVisual];
  const tamanhoId = m2ToTamanhoId(tipo, ctx.area);
  const acabLabel = acabamentoMeta[ctx.acabamento].label;

  const isConsultor = tamanhoId === "consultor";
  const conjuntos: Partial<Record<Nivel, ConjuntoLeaf>> = {};

  if (!isConsultor) {
    const sizeNode = (guideMap[tipo] as Record<string, unknown>)[tamanhoId] as Record<string, unknown>;
    const node =
      tipo === "piscina"
        ? sizeNode
        : ((sizeNode as Record<string, unknown>)[variante!] as Record<string, unknown>);
    NIVEIS.forEach((n) => {
      const c = (node as Record<string, ConjuntoLeaf>)[n];
      if (c) conjuntos[n] = c;
    });
  }

  const backQs = buildContextQuery(ctx);

  return (
    <div className="min-h-screen surface-ivory">
      <GuideHeader breadcrumb={{ label: "Voltar · Contexto do projeto", to: `/guia-de-composicao?${backQs}` }} />
      <main className="container-western pt-16 md:pt-20 pb-32">
        <Reveal variant="fade-up" duration={700}>
          <p className="text-eyebrow mb-5">Guia de composição · Etapa 02 · Resultado</p>
          <h1 className="font-display text-3xl md:text-[48px] text-western-green-deep leading-[1.08] mb-6 max-w-4xl">
            Para {copy} de {ctx.area} m² no {acabLabel}, três caminhos.
          </h1>
          <div className="w-12 h-px bg-western-gold mb-6" />
          <p className="font-display italic text-lg text-western-stone-warm max-w-2xl leading-relaxed">
            Cada composição é ponto de partida. No próximo passo você ajusta peças, quantidades e adiciona itens autorais.
          </p>
        </Reveal>

        {isConsultor ? (
          <div className="mt-20 max-w-xl">
            <h2 className="font-display text-2xl md:text-3xl text-western-green-deep mb-6 leading-tight">
              Para projetos {label.toLowerCase()} de {ctx.area} m², trabalhamos sob consulta.
            </h2>
            <a href={whatsappConsultor(tipo, "Sob consulta")} target="_blank" rel="noreferrer" className="btn-dark">
              Falar com consultor →
            </a>
          </div>
        ) : (
          <>
            <div className="mt-16 md:mt-20 grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
              {NIVEIS.map((n, i) => {
                const c = conjuntos[n];
                if (!c) return null;
                const refinarParams = new URLSearchParams();
                refinarParams.set("acabamento", ctx.acabamento!);
                refinarParams.set("tipo", ctx.tipoVisual!);
                refinarParams.set("area", String(ctx.area));
                refinarParams.set("nivel", n);
                return (
                  <Reveal key={n} variant="fade-up" delay={i * 100} duration={700}>
                    <ComposicaoCard
                      conjunto={c}
                      nivel={n}
                      highlight={n === "equilibrada"}
                      refinarHref={`/guia-de-composicao/refinar/${c.handle}?${refinarParams.toString()}`}
                    />
                  </Reveal>
                );
              })}
            </div>

            <div className="divider-hairline mt-24" />

            <div className="mt-12 text-center max-w-xl mx-auto">
              <p className="text-eyebrow mb-4">Não encontrou o que procura?</p>
              <p className="font-display text-lg text-western-green-deep leading-relaxed">
                Os 3 caminhos acima são pré-montados, mas você pode{" "}
                <Link to="/conjuntos" className="link-underline text-western-gold">
                  começar do zero
                </Link>{" "}
                e montar peça por peça.
              </p>
              <p className="text-sm text-western-stone-warm mt-6">
                Ou{" "}
                <a
                  href={whatsappConsultor(tipo, "Variada")}
                  target="_blank"
                  rel="noreferrer"
                  className="link-underline text-western-green-deep"
                >
                  falar com um consultor
                </a>{" "}
                para projetos fora do padrão.
              </p>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
