// Inspire-se — página ÚNICA por segmento (fusão de Inspire-se + Obras).
// Cada segmento: introdução → galeria de fotos gerais → exemplos de obra reais
// (shop-the-look com "adicionar ao orçamento"). O aprofundamento de cada obra
// vive em /obras/:slug (mente do criador em acordeão).
import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowRight, Plus, MessageCircle, Check } from "lucide-react";
import Seo from "@/components/seo/Seo";
import Reveal from "@/components/shared/Reveal";
import GatedPrice from "@/components/shared/GatedPrice";
import { BUSINESS } from "@/config/business";
import { OBRAS_BY_SLUG, obraComposicao, type Obra } from "@/data/obras";
import { OBRA_COVER } from "@/data/obraImages";
import { SEGMENTOS } from "@/data/segmentos";
import { useComposicaoCart } from "@/lib/composicao/useComposicaoCart";
import { papelDaPeca } from "@/components/guide-v2/papelPeca";

const NORM: Record<string, string> = {
  piscina: "piscinas",
  lago: "lagos",
  jardim: "jardins",
  cascata: "cascatas",
  revestimento: "revestimentos",
  viveiro: "viveiros",
  especial: "especiais",
};

const waObra = (titulo: string) =>
  `https://wa.me/${BUSINESS.whatsappFabrica}?text=${encodeURIComponent(
    `Olá! Vi a obra "${titulo}" no site da Western e queria algo parecido.`,
  )}`;

function Galeria({ fotos, label }: { fotos: string[]; label: string }) {
  if (!fotos.length) return null;
  return (
    <div className="mt-8 columns-2 md:columns-3 gap-4 [column-fill:_balance]">
      {fotos.map((src, i) => (
        <img
          key={src}
          src={src}
          alt={`${label} — foto ${i + 1}`}
          loading="lazy"
          decoding="async"
          className="mb-4 w-full rounded-[12px] break-inside-avoid bg-western-cream-muted"
        />
      ))}
    </div>
  );
}

function ObraLook({ obra, index }: { obra: Obra; index: number }) {
  const composicao = useMemo(() => obraComposicao(obra), [obra]);
  const { isLoading, totalPreco, addToOrcamento } = useComposicaoCart(composicao, "moledo");
  const [added, setAdded] = useState(false);
  const cover = OBRA_COVER[obra.slug];
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
    <article
      className={`grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-14 items-center ${
        index % 2 === 1 ? "lg:[&>*:first-child]:order-2" : ""
      }`}
    >
      <Link
        to={`/obras/${obra.slug}`}
        className="group relative frame-product rounded-[16px] overflow-hidden aspect-[4/3] block"
        aria-label={`Ver obra ${obra.titulo}`}
      >
        {cover ? (
          <img
            src={cover}
            alt={obra.titulo}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="w-full h-full bg-western-green-deep flex items-center justify-center text-center px-8">
            <span className="font-display text-western-gold-soft text-[20px] leading-snug">
              {obra.titulo}
            </span>
          </div>
        )}
      </Link>

      <div>
        <p className="text-eyebrow mb-2">{obra.cliente ?? obra.local ?? "Obra Western"}</p>
        <Link to={`/obras/${obra.slug}`} className="group inline-block">
          <h3 className="display-md text-western-green-deep transition-colors group-hover:text-western-bronze">
            {obra.titulo}
          </h3>
        </Link>

        {isHibrido && (
          <span className="mt-3 inline-flex items-center gap-1.5 rounded-[6px] border border-western-gold/50 bg-western-gold/15 px-3 py-1 text-[14px] font-semibold text-western-bronze">
            <span aria-hidden>◆</span> Lago híbrido · natural + Western
          </span>
        )}

        <p className="text-body max-w-[56ch] mt-4">{obra.conceito}</p>

        {obra.skus && obra.skus.length > 0 && (
          <>
            <p className="text-eyebrow mt-7 mb-2">Peças usadas</p>
            <div className="flex flex-wrap gap-2.5">
              {obra.skus.map((s) => {
                const papel = papelDaPeca(s.codigo);
                const inner = (
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
                    className="tap-target inline-flex items-center gap-2 rounded-full border border-western-border-strong bg-white px-4 text-[15px] font-semibold text-western-green-deep transition-colors hover:border-western-green-deep hover:bg-western-paper"
                  >
                    {inner}
                  </Link>
                ) : (
                  <span
                    key={s.codigo + s.nome}
                    title={papel?.frase}
                    className="inline-flex items-center gap-2 rounded-full border border-western-border-strong bg-white px-4 py-1.5 text-[15px] font-semibold text-western-green-deep"
                  >
                    {inner}
                  </span>
                );
              })}
            </div>
          </>
        )}

        {obra.creditos && obra.creditos.length > 0 && (
          <p className="text-meta mt-4">{obra.creditos.join(" · ")}</p>
        )}

        <div className="mt-7 flex flex-col sm:flex-row sm:items-center gap-4">
          {comprable ? (
            <>
              <button
                type="button"
                onClick={onAdd}
                disabled={isLoading}
                className="btn-primary w-full sm:w-auto"
              >
                {added ? (
                  <>
                    <Check className="h-5 w-5" /> Adicionada
                  </>
                ) : (
                  <>
                    <Plus className="h-5 w-5" /> Adicionar ao orçamento
                  </>
                )}
              </button>
              <GatedPrice amount={totalPreco} variant="block" className="text-price" />
            </>
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
          <Link
            to={`/obras/${obra.slug}`}
            className="tap-target inline-flex items-center gap-1.5 font-sans text-[15px] font-semibold text-western-green-deep hover:text-western-bronze"
          >
            Ver a obra <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </article>
  );
}

export default function Inspiracoes() {
  const [params, setParams] = useSearchParams();
  const raw = params.get("seg") ?? params.get("tipo") ?? "piscinas";
  const id = NORM[raw] ?? raw;
  const cur = SEGMENTOS.find((s) => s.id === id) ?? SEGMENTOS[0];

  const setSeg = (segId: string) => {
    const next = new URLSearchParams(params);
    next.delete("tipo");
    next.set("seg", segId);
    setParams(next, { replace: true });
  };

  const obras = cur.obraSlugs
    .map((slug) => OBRAS_BY_SLUG[slug])
    .filter((o): o is Obra => Boolean(o));

  return (
    <div className="surface-ivory">
      <Seo
        title="Inspire-se — obras e ideias com pedra Western"
        description="Piscinas, lagos, cascatas, jardins, revestimentos e viveiros: a ideia por trás de cada segmento, fotos de obras reais e as peças usadas — com preço de parceiro."
        path="/inspiracoes"
      />
      <div className="container-western py-12 md:py-20">
        <Reveal variant="fade-up">
          <div className="max-w-3xl">
            <p className="text-eyebrow mb-4">Inspire-se · Por segmento</p>
            <div className="w-12 h-px bg-western-gold mb-8" />
            <h1 className="display-xl text-western-green-deep">
              O que você vai criar com pedra?
            </h1>
            <p className="text-body mt-5 max-w-[60ch]">
              Escolha um caminho — a ideia por trás, fotos de obras reais e as peças que compõem
              cada cena.
            </p>
          </div>
        </Reveal>

        {/* Seletor de segmento */}
        <div role="group" aria-label="Segmento" className="flex flex-wrap gap-3 mt-9">
          {SEGMENTOS.map((s) => {
            const on = cur.id === s.id;
            return (
              <button
                key={s.id}
                type="button"
                aria-pressed={on}
                onClick={() => setSeg(s.id)}
                className={`tap-target inline-flex items-center justify-center px-5 rounded-full border text-[15px] font-semibold transition-colors ${
                  on
                    ? "bg-western-cta text-western-cream border-western-cta"
                    : "bg-white border-western-border-strong text-western-green-deep hover:bg-western-paper hover:border-western-green-deep"
                }`}
              >
                {s.label}
              </button>
            );
          })}
        </div>

        {/* Segmento ativo: intro + galeria + exemplos */}
        <div className="mt-12 md:mt-16">
          <Reveal variant="fade-up">
            <div className="max-w-3xl">
              <p className="text-eyebrow mb-3">{cur.eyebrow}</p>
              <h2 className="display-lg text-western-green-deep">{cur.label}</h2>
              <p className="text-body mt-4 max-w-[64ch]">{cur.intro}</p>
            </div>
          </Reveal>

          <Galeria fotos={cur.galeria} label={cur.label} />

          {obras.length > 0 && (
            <>
              <Reveal variant="fade-up">
                <p className="text-eyebrow mt-16 md:mt-20 mb-2">Obras deste segmento</p>
                <h2 className="display-md text-western-green-deep">
                  Veja executado — e leve a composição.
                </h2>
              </Reveal>
              <div className="mt-12 space-y-16 md:space-y-24">
                {obras.map((obra, i) => (
                  <Reveal key={`${cur.id}-${obra.slug}`} variant="fade-up">
                    <ObraLook obra={obra} index={i} />
                  </Reveal>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Rampa B2C */}
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
          </section>
        </Reveal>
      </div>
    </div>
  );
}
