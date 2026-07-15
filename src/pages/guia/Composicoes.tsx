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
    <div className="min-h-screen surface-ivory relative">
      <GuideHeader step={2} breadcrumb={{ label: "Voltar · Contexto", to: `/guia-de-composicao?${backQs}` }} />
      <ContextoChips tipo={ctx.tipoVisual} area={ctx.area} acabamento={ctx.acabamento} />

      {/* Header (80px) + barra de contexto (44px) são sticky: reserva o espaço. */}
      <main className="container-western pt-12 md:pt-16 pb-24 relative">
        <Reveal variant="fade-up" duration={700} delay={120}>
          <p className="text-eyebrow mb-4">Guia de composição · Etapa 02</p>
          <h1 className="display-xl text-western-green-deep mb-6 max-w-[20ch] md:max-w-[24ch]">
            Três pontos de partida para os {ctx.area} m² do seu projeto.
          </h1>
          <div className="w-12 h-px bg-western-gold mb-6" />
          <p className="text-body max-w-[62ch]">
            Uma cena — {copy}, acabamento {acabLabel.toLowerCase()} — em três densidades. Escolha a
            base mais próxima; no próximo passo você ajusta tudo peça por peça.
          </p>
        </Reveal>

        {isHibrido && (
          <Reveal variant="fade-up" duration={700} delay={180}>
            <div className="mt-10 max-w-3xl rounded-[10px] border border-western-gold/40 bg-western-gold/[0.08] p-5 md:p-6">
              <p className="text-eyebrow mb-2">◆ Sobre o Lago Híbrido</p>
              <p className="text-body">
                Este conjunto fornece a estrutura principal em pedras Western. Você complementa a
                margem do lago com pedras naturais que já possua ou adquira localmente.
              </p>
            </div>
          </Reveal>
        )}

        {isConsultor ? (
          <div className="mt-16 max-w-2xl">
            <h2 className="display-lg text-western-green-deep mb-6">
              Para projetos {label.toLowerCase()} de {ctx.area} m², trabalhamos sob consulta.
            </h2>
            <p className="text-body mb-8 max-w-[54ch]">
              Um consultor do ateliê monta a composição com você, peça por peça.
            </p>
            <a
              href={whatsappConsultor(tipo, "Sob consulta")}
              target="_blank"
              rel="noreferrer"
              className="btn-primary w-full md:w-auto"
            >
              Falar com consultor
            </a>
          </div>
        ) : (
          <>
            <div className="mt-14 md:mt-16 grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 items-stretch">
              {NIVEIS.map((n, i) => {
                const c = conjuntos[n];
                if (!c) return null;
                const refinarParams = new URLSearchParams();
                refinarParams.set("acabamento", ctx.acabamento!);
                refinarParams.set("tipo", ctx.tipoVisual!);
                refinarParams.set("area", String(ctx.area));
                refinarParams.set("nivel", n);
                return (
                  <Reveal key={n} variant="fade-up" delay={i * 140} duration={750} className="h-full">
                    <ComposicaoCard
                      conjunto={c}
                      nivel={n}
                      image={conjuntoRenders[c.handle] ?? nivelImage[n]}
                      highlight={n === "equilibrada"}
                      refinarHref={`/guia-de-composicao/refinar/${c.handle}?${refinarParams.toString()}`}
                      conjuntoHref={`/conjuntos/${c.handle}?${refinarParams.toString()}`}
                    />
                  </Reveal>
                );
              })}
            </div>

            <div className="mt-20">
              <SectionDivider />
            </div>

            <div className="mt-12 max-w-2xl mx-auto text-center">
              <p className="text-eyebrow text-center mb-4">Não encontrou o que procura?</p>
              <p className="text-body text-western-green-deep">
                Os três caminhos acima são pré-montados, mas você pode{" "}
                <Link to="/conjuntos" className="link-underline font-semibold text-western-green-deep">
                  começar do zero
                </Link>{" "}
                e montar peça por peça.
              </p>
              <p className="text-meta mt-5">
                Ou{" "}
                <a
                  href={whatsappConsultor(tipo, "Variada")}
                  target="_blank"
                  rel="noreferrer"
                  className="link-underline font-semibold text-western-green-deep"
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
