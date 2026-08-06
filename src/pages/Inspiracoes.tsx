// /obras — a LISTA, por segmento. (Era /inspiracoes; "inspiração" promete ideia,
// "obras" é o que a página tem: obra entregue. /inspiracoes e /inspiracao
// redirecionam pra cá preservando a query string — ver RedirectObras em App.tsx.)
// Cada segmento: introdução → galeria de fotos gerais → exemplos de obra reais
// (shop-the-look com "adicionar ao orçamento"). O aprofundamento de cada obra
// vive em /obras/:slug (mente do criador em acordeão) — a lista é densidade,
// o detalhe é profundidade; não funda os dois.
// UX: seletor sticky + rolagem horizontal no mobile; galeria = carrossel no
// mobile / grade no desktop; troca de segmento rola para o topo do conteúdo.
import { useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowRight, Plus, MessageCircle, Check, Loader2 } from "lucide-react";
import Seo from "@/components/seo/Seo";
import Reveal from "@/components/shared/Reveal";
import Lightbox from "@/components/shared/Lightbox";
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

const waMsg = (assunto: string) =>
  `https://wa.me/${BUSINESS.whatsappFabrica}?text=${encodeURIComponent(
    `Olá! Vi ${assunto} no site da Western e queria algo parecido.`,
  )}`;

function Galeria({ fotos, label }: { fotos: string[]; label: string }) {
  // Hooks antes de qualquer return — a lista de fotos pode ser vazia.
  const [zoom, setZoom] = useState<number | null>(null);
  const itens = useMemo(
    () => fotos.map((src, i) => ({ src, alt: `${label} — foto ${i + 1}` })),
    [fotos, label],
  );
  if (!fotos.length) return null;
  // Mobile: carrossel horizontal com peek (menos scroll vertical). Desktop: grade.
  return (
    <>
      <div className="mt-6 flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide -mx-6 px-6 pb-2 sm:mx-0 sm:px-0 sm:overflow-visible sm:grid sm:grid-cols-2 lg:grid-cols-3">
        {itens.map((foto, i) => (
          <button
            key={foto.src}
            type="button"
            onClick={() => setZoom(i)}
            aria-label={`Ampliar ${foto.alt}`}
            className="group snap-start shrink-0 w-[78vw] max-w-[440px] sm:w-auto sm:max-w-none overflow-hidden rounded-[14px] aspect-[4/3] bg-western-cream-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-western-gold focus-visible:ring-offset-2"
          >
            <img
              src={foto.src}
              alt={foto.alt}
              loading="lazy"
              decoding="async"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            />
          </button>
        ))}
      </div>
      <Lightbox
        fotos={itens}
        index={zoom}
        onIndexChange={setZoom}
        onClose={() => setZoom(null)}
        label={label}
      />
    </>
  );
}

function ObraLook({ obra, index }: { obra: Obra; index: number }) {
  const composicao = useMemo(() => obraComposicao(obra), [obra]);
  const { totalPreco, addToOrcamento } = useComposicaoCart(composicao, "moledo");
  const [added, setAdded] = useState(false);
  const [adding, setAdding] = useState(false);
  const cover = OBRA_COVER[obra.slug];
  const comprable = obra.tipo === "comprable" && composicao.length > 0;
  const isHibrido = obra.slug === "lago-neymar";

  const onAdd = async () => {
    if (adding) return;
    setAdding(true);
    try {
      const ok = await addToOrcamento({
        label: `Obra ${obra.titulo} adicionada ao orçamento`,
        description: `${composicao.length} ${composicao.length === 1 ? "peça" : "peças"} Western · acabamento Moledo`,
        conjuntoRef: obra.slug,
      });
      if (ok) setAdded(true);
    } finally {
      setAdding(false);
    }
  };

  return (
    <article
      className={`grid grid-cols-1 lg:grid-cols-2 gap-7 lg:gap-14 items-center ${
        index % 2 === 1 ? "lg:[&>*:first-child]:order-2" : ""
      }`}
    >
      <Link
        to={`/obras/${obra.slug}`}
        className="group relative frame-product rounded-xl overflow-hidden aspect-[4/3] block"
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
            <span className="font-display text-western-gold-soft text-[18px] leading-snug">
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
          <span className="mt-3 inline-flex items-center gap-1.5 rounded-sm border border-western-gold/50 bg-western-gold/15 px-3 py-1 text-[14px] font-semibold text-western-bronze">
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

        <div className="mt-7">
          {comprable ? (
            <>
              {/* Preço em cima; abaixo as DUAS ações LADO A LADO. "Ver a obra"
                  virou botão outline (não mais link de texto discreto), pareado
                  com "Adicionar ao orçamento" — dono pediu mais visível/acessível
                  e ao lado (2026-07-18). */}
              <GatedPrice amount={totalPreco} variant="block" className="text-price" />
              <div className="mt-4 flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={onAdd}
                  disabled={adding}
                  className="btn-primary w-full sm:w-auto"
                >
                  {added ? (
                    <>
                      <Check className="h-5 w-5" /> Adicionada ao orçamento
                    </>
                  ) : adding ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" /> Adicionando…
                    </>
                  ) : (
                    <>
                      <Plus className="h-5 w-5" /> Adicionar ao orçamento
                    </>
                  )}
                </button>
                <Link
                  to={`/obras/${obra.slug}`}
                  className="btn-outline-forest w-full sm:w-auto"
                >
                  Ver a obra <ArrowRight className="h-5 w-5" />
                </Link>
              </div>
            </>
          ) : (
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <a
                href={waMsg(`a obra "${obra.titulo}"`)}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-gold w-full sm:w-auto"
              >
                <MessageCircle className="h-5 w-5" /> Falar com o ateliê
              </a>
              <Link
                to={`/obras/${obra.slug}`}
                className="tap-target inline-flex items-center gap-1.5 font-sans text-[15px] font-semibold text-western-green-deep hover:text-western-bronze"
              >
                Ver a obra <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}

export default function Inspiracoes() {
  const [params, setParams] = useSearchParams();
  const contentRef = useRef<HTMLDivElement>(null);
  const raw = params.get("seg") ?? params.get("tipo") ?? "piscinas";
  const id = NORM[raw] ?? raw;
  const cur = SEGMENTOS.find((s) => s.id === id) ?? SEGMENTOS[0];

  const setSeg = (segId: string) => {
    const next = new URLSearchParams(params);
    next.delete("tipo");
    next.set("seg", segId);
    setParams(next, { replace: true });
    // começa no topo do conteúdo do novo segmento (abaixo dos stickies)
    requestAnimationFrame(() => {
      contentRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  const obras = cur.obraSlugs
    .map((slug) => OBRAS_BY_SLUG[slug])
    .filter((o): o is Obra => Boolean(o));

  return (
    <div className="surface-ivory">
      <Seo
        title="Obras — piscinas, lagos, cascatas e jardins com pedra Western"
        description="Piscinas, lagos, cascatas, jardins, revestimentos e viveiros: a ideia por trás de cada segmento, fotos de obras reais e as peças usadas — com preço de parceiro."
        path="/obras"
      />

      {/* Abertura — lead-in compacto (não é .section: encosta no seletor sticky
          logo abaixo, por isso pb-6 e top enxuto — puxa a 1ª foto pra dobra). */}
      <div className="container-western pt-10 md:pt-12 pb-6">
        <Reveal variant="fade-up">
          <div className="max-w-3xl">
            <p className="text-eyebrow mb-3">Obras · Por segmento</p>
            <div className="w-12 h-px bg-western-gold mb-6" />
            <h1 className="display-xl text-western-green-deep">Obras entregues, por segmento.</h1>
            <p className="text-body mt-5 max-w-[60ch]">
              Escolha um caminho — a ideia por trás, fotos de obras reais e as peças que compõem
              cada cena.
            </p>
          </div>
        </Reveal>
      </div>

      {/* Seletor de segmento — sticky, rolagem horizontal no mobile */}
      <div className="sticky top-[64px] z-30 surface-ivory border-y border-western-border-soft shadow-[0_8px_18px_-14px_rgba(15,41,24,0.35)]">
        <div className="container-western">
          <div
            role="group"
            aria-label="Segmento"
            className="flex gap-2.5 overflow-x-auto scrollbar-hide snap-x py-3 -mx-6 px-6 md:mx-0 md:px-0 md:flex-wrap md:overflow-visible"
          >
            {SEGMENTOS.map((s) => {
              const on = cur.id === s.id;
              return (
                <button
                  key={s.id}
                  type="button"
                  aria-pressed={on}
                  onClick={() => setSeg(s.id)}
                  className={`shrink-0 snap-start tap-target inline-flex items-center justify-center px-5 rounded-full border text-[15px] font-semibold transition-colors ${
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
        </div>
      </div>

      {/* Conteúdo do segmento — top enxuto (exceção declarada ao ritmo nomeado):
          fica logo sob o seletor sticky e sobe a galeria pra dobra no desktop. */}
      <div ref={contentRef} className="container-western pt-6 md:pt-8 pb-12 md:pb-16 scroll-mt-[128px]">
        <Reveal variant="fade-up">
          <div className="max-w-3xl">
            <p className="text-eyebrow mb-3">{cur.eyebrow}</p>
            <h2 className="display-lg text-western-green-deep">{cur.label}</h2>
            <p className="text-body mt-4 max-w-[64ch]">{cur.intro}</p>
          </div>
        </Reveal>

        <Galeria fotos={cur.galeria} label={cur.label} />

        {obras.length > 0 ? (
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
        ) : (
          <Reveal variant="fade-up">
            <div className="mt-12 rounded-xl border border-western-border-soft bg-white p-7 md:p-9 text-center">
              <p className="text-body max-w-[54ch] mx-auto">
                Quer {cur.label.toLowerCase()} assim no seu projeto? Monte a composição com preço de
                parceiro, ou fale direto com o ateliê.
              </p>
              {/* UMA ação primária (verde) — o secundário é outline, não sólido. */}
              <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto">
                <Link to="/guia-de-composicao" className="btn-primary w-full sm:w-auto">
                  Montar no guia
                </Link>
                <a
                  href={waMsg(`a linha de ${cur.label.toLowerCase()}`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-outline-forest w-full sm:w-auto"
                >
                  <MessageCircle className="h-5 w-5" /> Falar com o ateliê
                </a>
              </div>
            </div>
          </Reveal>
        )}
      </div>

      {/* Fecho */}
      <div className="container-western pb-16 md:pb-24">
        <p className="text-center text-meta">
          É para a sua casa e você não tem CNPJ?{" "}
          <Link to="/para-sua-casa" className="link-underline font-semibold text-western-green-deep">
            A Western faz a obra completa
          </Link>
          .
        </p>

        <Reveal variant="fade-up">
          <section className="mt-10 md:mt-16 surface-forest rounded-xl text-center px-6 py-12 md:py-16">
            <h2 className="display-md text-western-cream max-w-xl mx-auto">Prefere montar do zero?</h2>
            <p className="text-[16px] leading-[1.6] text-western-cream-muted max-w-[44ch] mx-auto mt-4 mb-8">
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
