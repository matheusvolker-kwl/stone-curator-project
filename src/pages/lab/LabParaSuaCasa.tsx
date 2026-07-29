/**
 * LAB — /para-sua-casa, três páginas COMPLETAS.
 * ---------------------------------------------------------------------------
 * Diferente do /lab/secoes: lá se compara um pedaço, aqui se compara a página
 * inteira. Por isso NÃO empilha — mostra uma de cada vez. Página inteira
 * empilhada não se julga, se sofre.
 *
 * O seletor é uma pílula FLUTUANTE no rodapé da tela, não uma barra grudada no
 * topo: as três abrem com hero de imagem cheia, e uma barra no topo destruiria
 * justamente a primeira dobra que está em julgamento.
 *
 * O que se julga aqui (pedido do dono): qual delas gera mais DESEJO antes de
 * pedir contato. As três carregam o mesmo conteúdo e as mesmas duas obras
 * (Módulo 15 e Conrado) — o que muda é a rota psicológica.
 *
 * NÃO É ROTA DE PRODUÇÃO: noindex, fora de menu e sitemap. Sai do ar depois da
 * escolha.
 */
import { useSearchParams } from "react-router-dom";
import Seo from "@/components/seo/Seo";

import ParaSuaCasaA from "./variantes/ParaSuaCasaA";
import ParaSuaCasaB from "./variantes/ParaSuaCasaB";
import ParaSuaCasaC from "./variantes/ParaSuaCasaC";

const VERSOES = [
  {
    letra: "A",
    nome: "Imersão",
    tese: "O desejo nasce de estar no lugar. Foto grande, pouca palavra, silêncio entre elas.",
    Componente: ParaSuaCasaA,
  },
  {
    letra: "B",
    nome: "As duas obras",
    tese: "O desejo nasce de prova. Dois capítulos com nome e lugar; o arco do Conrado em destaque.",
    Componente: ParaSuaCasaB,
  },
  {
    letra: "C",
    nome: "O seu quintal",
    tese: "O desejo nasce de projeção. As obras viram espelho: a aérea dá a escala, o croqui diz “o seu começa assim”.",
    Componente: ParaSuaCasaC,
  },
] as const;

export default function LabParaSuaCasa() {
  const [params, setParams] = useSearchParams();
  const letra = (params.get("v") ?? "A").toUpperCase();
  const atual = VERSOES.find((v) => v.letra === letra) ?? VERSOES[0];
  const Pagina = atual.Componente;

  return (
    <>
      <Seo
        title={`Lab · Para sua casa ${atual.letra} — ${atual.nome} (interno)`}
        description="Bancada de comparação de páginas completas. Rota interna, fora do site."
        path="/lab/casa"
        noindex
      />

      <Pagina />

      {/* SELETOR FLUTUANTE — fica por cima de tudo (z-50) e longe do topo, para
          não competir com o hero. Alvo de 48px, como manda o DS. */}
      <div className="fixed inset-x-0 bottom-4 z-50 flex justify-center px-4 print:hidden">
        <div className="flex max-w-full items-center gap-1 overflow-x-auto rounded-full border border-western-border-strong bg-western-ivory/95 p-1.5 shadow-[0_10px_40px_-12px_hsl(var(--western-stone-dark)/0.45)] backdrop-blur">
          <span className="shrink-0 pl-3 pr-1 font-sans text-[13px] font-semibold uppercase tracking-[0.08em] text-western-stone-warm">
            Lab
          </span>
          {VERSOES.map((v) => {
            const on = v.letra === atual.letra;
            return (
              <button
                key={v.letra}
                type="button"
                onClick={() => {
                  setParams({ v: v.letra });
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                aria-pressed={on}
                title={v.tese}
                className={`inline-flex h-12 shrink-0 items-center gap-2 rounded-full px-4 font-sans text-[15px] font-semibold transition-colors ${
                  on
                    ? "bg-western-cta text-western-cream"
                    : "text-western-green-deep hover:bg-western-paper"
                }`}
              >
                <span className="font-display text-[17px] leading-none">{v.letra}</span>
                <span className="hidden sm:inline">{v.nome}</span>
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}
