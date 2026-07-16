// Inspirações — lookbook SHOPPABLE de obras reais (v2). Cada obra do acervo vira
// uma cena com "a ideia por trás", as peças reais (→ PDP) e "adicionar a obra ao
// orçamento" reusando o motor de composição→carrinho (useComposicaoCart).
// Obras sob-medida (revestimento/mobiliário) entram como inspiração sem carrinho,
// com rampa para o ateliê. Preço só após cadastro (gate B2B) — o próprio gate é a
// rampa turnkey para quem é B2C.
import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowRight, Plus, MessageCircle, Check } from "lucide-react";
import Seo from "@/components/seo/Seo";
import Reveal from "@/components/shared/Reveal";
import GatedPrice from "@/components/shared/GatedPrice";
import { BUSINESS } from "@/config/business";
import { OBRAS_BY_SLUG, obraComposicao, type Obra } from "@/data/obras";
import { useComposicaoCart } from "@/lib/composicao/useComposicaoCart";
import { papelDaPeca } from "@/components/guide-v2/papelPeca";

import coverShowroom from "@/assets/obras/showroom.webp";
import coverTato from "@/assets/obras/tato.webp";
import coverNeymar from "@/assets/obras/neymar.webp";
import coverTapirai from "@/assets/obras/tapirai.webp";
import coverEvandro from "@/assets/obras/evandro.webp";
import coverUnique from "@/assets/obras/unique.webp";
import coverRosewood from "@/assets/obras/rosewood.webp";

const COVER: Record<string, string> = {
  "showroom-riviera": coverShowroom,
  "casa-de-praia-tato": coverTato,
  "lago-neymar": coverNeymar,
  tapirai: coverTapirai,
  "evandro-mesquita": coverEvandro,
  "unique-garden": coverUnique,
  rosewood: coverRosewood,
};

const TABS: Array<{ id: string; label: string; intro: string; obras: string[] }> = [
  {
    id: "piscina",
    label: "Piscina",
    intro:
      "Piscinas-praia reais e as peças que dão vida a cada cena. Cada pedra tem um papel — âncora, volume, transição e borda.",
    obras: ["showroom-riviera", "casa-de-praia-tato", "tapirai"],
  },
  {
    id: "lago",
    label: "Lago",
    intro:
      "Espelhos d'água vivos — inclusive o lago híbrido do Neymar, onde pedra natural e Western convivem na mesma margem.",
    obras: ["lago-neymar", "evandro-mesquita"],
  },
  {
    id: "revestimento",
    label: "Revestimento",
    intro:
      "A pedra que veste ambientes — balcões, paredes e villas. Obras sob medida: converse com o ateliê para uma composição própria.",
    obras: ["unique-garden", "rosewood"],
  },
];

const waObra = (titulo: string) =>
  `https://wa.me/${BUSINESS.whatsappFabrica}?text=${encodeURIComponent(
    `Olá! Vi a obra "${titulo}" no site da Western e queria algo parecido.`,
  )}`;

function ObraLook({ obra, index }: { obra: Obra; index: number }) {
  const composicao = useMemo(() => obraComposicao(obra), [obra]);
  const { isLoading, totalPreco, addToOrcamento } = useComposicaoCart(composicao, "moledo");
  const [added, setAdded] = useState(false);
  const comprable = obra.tipo === "comprable" && composicao.length > 0;
  const isHibrido = obra.slug === "lago-neymar";

  const onAdd = () => {
    const ok = addToOrcamento({
      label: `Obra ${obra.titulo} adicionada ao orçamento`,
      description: `${composicao.length} ${composicao.length === 1 ? "peça" : "peças"} Western · acabamento Moledo`,
      conjuntoRef: obra.slug,
    });
    if (ok) setAdded(true);
  };

  return (
    <Reveal variant="fade-up">
      <article
        className={`grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center ${
          index % 2 === 1 ? "lg:[&>*:first-child]:order-2" : ""
        }`}
      >
        <div className="relative frame-product rounded-[16px] overflow-hidden aspect-[4/3]">
          <span className="absolute top-4 left-4 z-10 w-11 h-11 flex items-center justify-center rounded-[10px] bg-western-green-deep text-western-gold font-sans font-bold text-[18px] tabular-nums">
            {String(index + 1).padStart(2, "0")}
          </span>
          <img
            src={COVER[obra.slug]}
            alt={obra.titulo}
            loading={index === 0 ? "eager" : "lazy"}
            decoding="async"
            className="w-full h-full object-cover"
          />
        </div>

        <div>
          <p className="text-eyebrow mb-2">{obra.cliente ?? obra.local ?? "Obra Western"}</p>
          <h2 className="display-md text-western-green-deep">{obra.titulo}</h2>

          {isHibrido && (
            <span className="mt-3 inline-flex items-center gap-1.5 rounded-[6px] border border-western-gold/50 bg-western-gold/15 px-3 py-1 text-[14px] font-semibold text-western-bronze">
              <span aria-hidden>◆</span> Lago híbrido · natural + Western
            </span>
          )}

          <p className="text-eyebrow mt-6 mb-2">A ideia por trás</p>
          <p className="text-body max-w-[56ch]">{obra.conceito}</p>

          {obra.skus && obra.skus.length > 0 && (
            <>
              <p className="text-eyebrow mt-8 mb-1">Peças usadas</p>
              <p className="text-meta mb-3">
                {comprable ? "Toque para ver a peça" : "Composição sob medida"}
              </p>
              <div className="flex flex-wrap gap-2.5">
                {obra.skus.map((s) => {
                  const papel = papelDaPeca(s.codigo);
                  const chip = (
                    <>
                      <span className="h-2 w-2 rounded-full bg-western-gold" aria-hidden />
                      <span className="tabular-nums">{s.qty}×</span> {s.nome}
                    </>
                  );
                  return s.handle ? (
                    <Link
                      key={s.codigo + s.nome}
                      to={`/produtos/${s.handle}`}
                      title={papel?.frase}
                      className="group/chip tap-target inline-flex items-center gap-2 rounded-full border border-western-border-strong bg-white px-4 text-[15px] font-semibold text-western-green-deep transition-colors hover:border-western-green-deep hover:bg-western-paper"
                    >
                      {chip}
                      <ArrowRight className="h-4 w-4 text-western-bronze transition-transform motion-safe:group-hover/chip:translate-x-0.5" aria-hidden />
                    </Link>
                  ) : (
                    <span
                      key={s.codigo + s.nome}
                      title={papel?.frase}
                      className="inline-flex items-center gap-2 rounded-full border border-western-border-strong bg-white px-4 py-1.5 text-[15px] font-semibold text-western-green-deep"
                    >
                      {chip}
                    </span>
                  );
                })}
              </div>
            </>
          )}

          {obra.creditos && obra.creditos.length > 0 && (
            <p className="text-meta mt-4">{obra.creditos.join(" · ")}</p>
          )}

          {/* Ação: comprável = adicionar ao orçamento (gate de preço) · sob-medida = ateliê */}
          <div className="mt-7">
            {comprable ? (
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <button
                  type="button"
                  onClick={onAdd}
                  disabled={isLoading}
                  className="btn-primary w-full sm:w-auto"
                >
                  {added ? (
                    <>
                      <Check className="h-5 w-5" /> Adicionada ao orçamento
                    </>
                  ) : (
                    <>
                      <Plus className="h-5 w-5" /> Adicionar a obra ao orçamento
                    </>
                  )}
                </button>
                <GatedPrice amount={totalPreco} variant="block" className="text-price" />
              </div>
            ) : (
              <a
                href={waObra(obra.titulo)}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-gold w-full sm:w-auto"
              >
                <MessageCircle className="h-5 w-5" /> Falar com o ateliê
              </a>
            )}
          </div>
        </div>
      </article>
    </Reveal>
  );
}

export default function Inspiracoes() {
  const [params, setParams] = useSearchParams();
  const tipoParam = params.get("tipo") ?? "piscina";
  const cur = TABS.find((t) => t.id === tipoParam) ?? TABS[0];

  const setTipo = (id: string) => {
    const next = new URLSearchParams(params);
    next.set("tipo", id);
    setParams(next, { replace: true });
  };

  const obras = cur.obras
    .map((slug) => OBRAS_BY_SLUG[slug])
    .filter((o): o is Obra => Boolean(o));

  return (
    <div className="surface-ivory">
      <Seo
        title="Inspire-se — obras reais com pedra Western"
        description="Lookbook de obras reais: piscina, lago e revestimento. Veja a ideia por trás de cada cena, as peças usadas e adicione a obra ao seu orçamento."
        path="/inspiracoes"
      />
      <div className="container-western py-12 md:py-20">
        <Reveal variant="fade-up">
          <div className="max-w-3xl">
            <p className="text-eyebrow mb-4">Inspire-se · Obras reais</p>
            <div className="w-12 h-px bg-western-gold mb-8" />
            <div role="group" aria-label="Tipo de obra" className="flex flex-wrap gap-3 mb-8">
              {TABS.map((t) => {
                const on = cur.id === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    aria-pressed={on}
                    onClick={() => setTipo(t.id)}
                    className={`tap-target inline-flex items-center justify-center px-6 rounded-full border text-[16px] font-semibold transition-colors ${
                      on
                        ? "bg-western-cta text-western-cream border-western-cta"
                        : "bg-white border-western-border-strong text-western-green-deep hover:bg-western-paper hover:border-western-green-deep"
                    }`}
                  >
                    {t.label}
                  </button>
                );
              })}
            </div>
            <h1 className="display-xl text-western-green-deep">Obras reais, pedra Western.</h1>
            <p className="text-body mt-5 max-w-[60ch]">{cur.intro}</p>
          </div>
        </Reveal>

        <div className="mt-14 md:mt-20 space-y-16 md:space-y-24">
          {obras.map((obra, i) => (
            <ObraLook key={`${cur.id}-${obra.slug}`} obra={obra} index={i} />
          ))}
        </div>

        {/* Rampa B2C discreta e persistente */}
        <Reveal variant="fade-up">
          <p className="mt-16 text-center text-meta">
            É para a sua casa e você não tem CNPJ?{" "}
            <Link to="/para-sua-casa" className="link-underline font-semibold text-western-green-deep">
              A Western faz a obra completa
            </Link>
            .
          </p>
        </Reveal>

        {/* CTA — guia */}
        <Reveal variant="fade-up">
          <section className="mt-10 md:mt-16 surface-forest rounded-[16px] text-center px-6 py-12 md:py-16">
            <h2 className="display-md text-western-cream max-w-xl mx-auto">
              Prefere montar do zero?
            </h2>
            <p className="text-[17px] leading-[1.6] text-western-cream-muted max-w-[44ch] mx-auto mt-4 mb-8">
              Responda 3 perguntas no guia e o ateliê monta uma composição no seu acabamento, com
              preço de parceiro após o cadastro (CNPJ).
            </p>
            <div className="max-w-sm mx-auto">
              <Link to="/guia-de-composicao" className="btn-gold w-full">
                Montar no guia <ArrowRight className="h-5 w-5" aria-hidden />
              </Link>
            </div>
            <p className="mt-7 text-[14px] text-western-cream-muted">
              Ateliê desde 1993 · Compra segura · Garantia de 1 ano
            </p>
          </section>
        </Reveal>
      </div>
    </div>
  );
}
