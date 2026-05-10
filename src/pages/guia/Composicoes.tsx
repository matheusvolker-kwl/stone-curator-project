import { Link, Navigate } from "react-router-dom";
import GuideHeader from "@/components/guide-v2/GuideHeader";
import ComposicaoCard from "@/components/guide-v2/ComposicaoCard";
import {
  acabamentoMeta,
  nivelLabelMap,
  tipoVisualMap,
} from "@/components/guide-v2/types";
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
  let conjuntos: Partial<Record<Nivel, ConjuntoLeaf>> = {};

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
    <div className="min-h-screen bg-western-cream">
      <GuideHeader breadcrumb={{ label: "Voltar · Contexto do projeto", to: `/guia-de-composicao?${backQs}` }} />
      <main className="mx-auto max-w-[1280px] px-6 md:px-16 pt-16 pb-32">
        <p className="text-eyebrow mb-4">Guia de composição · Resultado</p>
        <h1 className="font-display text-3xl md:text-[44px] text-western-green-deep leading-[1.1] mb-5 max-w-3xl">
          Para {copy} de {ctx.area} m² no {acabLabel}, três caminhos.
        </h1>
        <p className="font-sans text-base text-western-stone-warm max-w-2xl leading-relaxed">
          Cada composição é ponto de partida. No próximo passo você ajusta peças, quantidades e adiciona itens
          autorais.
        </p>

        {isConsultor ? (
          <div className="mt-16 max-w-xl">
            <h2 className="font-display text-2xl text-western-green-deep mb-4">
              Para projetos {label.toLowerCase()} de {ctx.area} m², trabalhamos sob consulta.
            </h2>
            <a
              href={whatsappConsultor(tipo, "Sob consulta")}
              target="_blank"
              rel="noreferrer"
              className="btn-dark"
            >
              Falar com consultor →
            </a>
          </div>
        ) : (
          <>
            <div className="mt-16 grid grid-cols-1 lg:grid-cols-3 gap-6">
              {NIVEIS.map((n) => {
                const c = conjuntos[n];
                if (!c) return null;
                const refinarParams = new URLSearchParams();
                refinarParams.set("acabamento", ctx.acabamento!);
                refinarParams.set("tipo", ctx.tipoVisual!);
                refinarParams.set("area", String(ctx.area));
                refinarParams.set("nivel", n);
                return (
                  <ComposicaoCard
                    key={n}
                    conjunto={c}
                    nivel={n}
                    highlight={n === "equilibrada"}
                    refinarHref={`/guia-de-composicao/refinar/${c.handle}?${refinarParams.toString()}`}
                  />
                );
              })}
            </div>

            <div className="mt-20 text-center max-w-xl mx-auto">
              <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-western-stone-warm/70 mb-3">
                Não encontrou o que procura?
              </p>
              <p className="text-base text-western-green-deep">
                Os 3 caminhos acima são pré-montados, mas você pode{" "}
                <Link to="/conjuntos" className="underline underline-offset-4 hover:text-western-gold">
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
                  className="underline underline-offset-4 hover:text-western-gold"
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
