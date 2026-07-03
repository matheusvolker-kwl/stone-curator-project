import { Link, Navigate } from "react-router-dom";
import GuideHeader from "@/components/guide-v2/GuideHeader";
import ComposicaoCard from "@/components/guide-v2/ComposicaoCard";
import ContextoChips from "@/components/guide-v2/ContextoChips";
import SectionDivider from "@/components/guide-v2/SectionDivider";
import Reveal from "@/components/shared/Reveal";
import { acabamentoMeta, tipoVisualMap } from "@/components/guide-v2/types";
import { nivelImage } from "@/components/guide-v2/imagery";
import { conjuntoRenders } from "@/data/conjuntoRenders";
import { buildContextQuery, useGuideContext } from "@/components/guide-v2/useGuideQuery";
import {
  guideMap,
  m2ToTamanhoId,
  whatsappConsultor,
  type ConjuntoLeaf,
  type Nivel,
} from "@/data/guideMap";
import brasao from "@/assets/brasao.png";

const NIVEIS: Nivel[] = ["essencial", "equilibrada", "completa"];

export default function GuiaComposicoes() {
  const ctx = useGuideContext();

  if (!ctx.tipoVisual || !ctx.area || !ctx.acabamento) {
    return <Navigate to="/guia-de-composicao" replace />;
  }

  const { tipo, copy, label } = tipoVisualMap[ctx.tipoVisual];
  const tamanhoId = m2ToTamanhoId(tipo, ctx.area);
  const acabLabel = acabamentoMeta[ctx.acabamento].label;

  const isConsultor = tamanhoId === "consultor";
  const conjuntos: Partial<Record<Nivel, ConjuntoLeaf>> = {};
  const isHibrido = tipo === "lago-hibrido";

  if (!isConsultor) {
    const node = guideMap[tipo][tamanhoId];
    NIVEIS.forEach((n) => {
      const c = node[n];
      if (c) conjuntos[n] = c;
    });
  }

  const backQs = buildContextQuery(ctx);

  return (
    <div className="min-h-screen surface-paper relative">
      <GuideHeader step={2} breadcrumb={{ label: "Voltar · Contexto", to: `/guia-de-composicao?${backQs}` }} />
      <ContextoChips tipo={ctx.tipoVisual} area={ctx.area} acabamento={ctx.acabamento} />

      <main className="container-western pt-14 md:pt-20 pb-32 relative">
        <Reveal variant="fade-up" duration={800}>
          <p className="font-display italic text-xl md:text-2xl text-western-green-deep mb-5">
            Três caminhos. Mesma alma.
          </p>
        </Reveal>
        <Reveal variant="fade-up" duration={700} delay={120}>
          <p className="eyebrow-bar mb-5">Guia de composição · Etapa 02</p>
          <h1 className="font-display text-3xl md:text-[48px] text-western-green-deep leading-[1.08] mb-6 max-w-4xl">
            Para {copy} de {ctx.area} m² no {acabLabel}.
          </h1>
          <div className="w-12 h-px bg-western-gold mb-6" />
          <p className="font-display italic text-lg text-western-stone-warm max-w-2xl leading-relaxed">
            Cada composição é ponto de partida. No próximo passo você ajusta peças, quantidades e adiciona itens autorais.
          </p>
        </Reveal>

        {isHibrido && (
          <Reveal variant="fade-up" duration={700} delay={180}>
            <div className="mt-10 border-l-2 border-western-gold pl-5 py-4 bg-western-gold/[0.06] max-w-3xl">
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-western-gold mb-2">
                ◆ Sobre o Lago Híbrido
              </p>
              <p className="font-display italic text-[15px] text-western-stone-warm leading-relaxed">
                Este conjunto fornece a estrutura principal em pedras Western. Você complementa
                a margem do lago com pedras naturais que já possua ou adquira localmente.
              </p>
            </div>
          </Reveal>
        )}



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
            {/* Banda forest atrás do destaque equilibrada */}
            <div className="relative mt-20">
              {/* faixa verde decorativa que enquadra o card central */}
              <div
                aria-hidden
                className="hidden lg:block absolute top-[18%] bottom-[8%] left-1/2 -translate-x-1/2 w-[36%] surface-forest"
                style={{ zIndex: 0 }}
              />
              <div className="relative grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 z-10 px-0 lg:px-3 pt-0 lg:pt-10 pb-0 lg:pb-10">
                {NIVEIS.map((n, i) => {
                  const c = conjuntos[n];
                  if (!c) return null;
                  const refinarParams = new URLSearchParams();
                  refinarParams.set("acabamento", ctx.acabamento!);
                  refinarParams.set("tipo", ctx.tipoVisual!);
                  refinarParams.set("area", String(ctx.area));
                  refinarParams.set("nivel", n);
                  return (
                    <Reveal key={n} variant="fade-up" delay={i * 140} duration={750}>
                      <ComposicaoCard
                        conjunto={c}
                        nivel={n}
                        image={conjuntoRenders[c.handle] ?? nivelImage[n]}
                        highlight={n === "equilibrada"}
                        refinarHref={`/guia-de-composicao/refinar/${c.handle}?${refinarParams.toString()}`}
                      />
                    </Reveal>
                  );
                })}
              </div>
            </div>

            <div className="mt-24">
              <SectionDivider />
            </div>

            <div className="mt-12 text-center max-w-xl mx-auto">
              <p className="eyebrow-bar justify-center mb-4">Não encontrou o que procura?</p>
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

      <img
        src={brasao}
        alt=""
        aria-hidden
        className="hidden md:block fixed bottom-6 right-6 w-20 opacity-[0.04] pointer-events-none select-none z-0"
      />
    </div>
  );
}
