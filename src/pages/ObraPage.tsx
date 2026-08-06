// /obras/:slug — detalhe da obra. Mídia primeiro → conceito (sempre visível) →
// "mente do criador" em ACORDEÃO (texto longo opt-in, reconcilia acervo denso ×
// diretriz anti-texto) → ficha → peças com papel + adicionar ao orçamento.
import { useMemo, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { ArrowRight, ChevronLeft, Plus, Check, MessageCircle, Loader2 } from "lucide-react";
import Seo from "@/components/seo/Seo";
import Reveal from "@/components/shared/Reveal";
import Lightbox from "@/components/shared/Lightbox";
import GatedPrice from "@/components/shared/GatedPrice";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { BUSINESS } from "@/config/business";
import { OBRAS_BY_SLUG, obraComposicao } from "@/data/obras";
import { OBRA_COVER, OBRA_GALERIA } from "@/data/obraImages";
import { useComposicaoCart } from "@/lib/composicao/useComposicaoCart";
import { papelDaPeca } from "@/components/guide-v2/papelPeca";

export default function ObraPage() {
  const { slug } = useParams();
  const obra = slug ? OBRAS_BY_SLUG[slug] : undefined;
  const composicao = useMemo(() => (obra ? obraComposicao(obra) : []), [obra]);
  const { totalPreco, addToOrcamento } = useComposicaoCart(composicao, "moledo");
  const galeria = (slug && OBRA_GALERIA[slug]) || (slug && OBRA_COVER[slug] ? [OBRA_COVER[slug]] : []);
  const [ativa, setAtiva] = useState(0);
  const [added, setAdded] = useState(false);
  const [adding, setAdding] = useState(false);
  const [zoom, setZoom] = useState<number | null>(null);
  // O alt de cada foto é o título da obra — a única descrição que o dado
  // garante. Não inventar legenda por foto: a galeria não sabe o que cada
  // imagem mostra.
  const fotos = useMemo(
    () => galeria.map((src) => ({ src, alt: obra?.titulo ?? "" })),
    [galeria, obra],
  );

  if (!obra || !slug || !OBRA_COVER[slug]) {
    return <Navigate to="/obras" replace />;
  }

  const comprable = obra.tipo === "comprable" && composicao.length > 0;
  const waHref = `https://wa.me/${BUSINESS.whatsappFabrica}?text=${encodeURIComponent(
    `Olá! Vi a obra "${obra.titulo}" no site da Western e queria algo parecido.`,
  )}`;

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
    <div className="surface-ivory min-h-screen">
      <Seo
        title={`${obra.titulo}${obra.cliente ? ` · ${obra.cliente}` : ""} — Obra Western`}
        description={obra.snippet}
        path={`/obras/${obra.slug}`}
        ogType="article"
      />

      <div className="container-western pt-6">
        <Link
          to="/obras"
          className="tap-target inline-flex items-center gap-1.5 font-sans text-[14px] font-semibold text-western-stone-warm hover:text-western-green-deep transition-colors"
        >
          <ChevronLeft className="h-4 w-4" /> Obras
        </Link>
      </div>

      <div className="container-western pt-6 pb-16 md:pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-10 lg:gap-16 items-start">
          {/* Mídia */}
          <div className="lg:sticky lg:top-24">
            <Reveal variant="fade-up">
              <button
                type="button"
                onClick={() => setZoom(ativa)}
                aria-label={`Ampliar foto de ${obra.titulo}`}
                className="group frame-product rounded-xl overflow-hidden aspect-[4/3] block w-full cursor-zoom-in focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-western-gold focus-visible:ring-offset-2"
              >
                <img
                  src={galeria[ativa] ?? OBRA_COVER[slug]}
                  alt={obra.titulo}
                  loading="eager"
                  decoding="async"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                />
              </button>
            </Reveal>
            {galeria.length > 1 && (
              <div className="mt-3 flex gap-3">
                {galeria.map((g, i) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setAtiva(i)}
                    aria-label={`Ver imagem ${i + 1}`}
                    aria-pressed={ativa === i}
                    className={`relative w-20 h-16 rounded-[8px] overflow-hidden border-2 transition-colors ${
                      ativa === i ? "border-western-gold" : "border-transparent hover:border-western-border-strong"
                    }`}
                  >
                    <img src={g} alt="" loading="lazy" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Ao navegar ampliado, a miniatura ativa acompanha — fechar cai na
                foto que a pessoa estava vendo, não na que ela abriu. */}
            <Lightbox
              fotos={fotos}
              index={zoom}
              onIndexChange={(i) => {
                setZoom(i);
                setAtiva(i);
              }}
              onClose={() => setZoom(null)}
              label={obra.titulo}
            />
          </div>

          {/* Conteúdo */}
          <div>
            <Reveal variant="fade-up">
              <p className="text-eyebrow mb-2">
                {[obra.cliente, obra.estudio, obra.local].filter(Boolean).join(" · ")}
              </p>
              <h1 className="display-xl text-western-green-deep">{obra.titulo}</h1>
              <div className="w-12 h-px bg-western-gold mt-5 mb-6" />

              <div className="flex flex-wrap gap-2 mb-6">
                {obra.linguagens.map((l) => (
                  <span
                    key={l}
                    className="inline-flex items-center rounded-full border border-western-border-strong bg-white px-3.5 py-1.5 font-sans text-[13px] font-semibold text-western-green-deep capitalize"
                  >
                    {l}
                  </span>
                ))}
              </div>

              <p className="text-body max-w-[60ch]">{obra.conceito}</p>
            </Reveal>

            {/* Mente do criador — acordeão (texto longo opt-in) */}
            {obra.menteDoCriador && (
              <Reveal variant="fade-up">
                <Accordion type="single" collapsible className="mt-8 border-t border-b border-western-border-soft">
                  <AccordionItem value="mente" className="border-0">
                    <AccordionTrigger className="text-left font-sans font-semibold text-[16px] text-western-green-deep hover:no-underline py-5">
                      A mente do criador — como esta obra foi pensada
                    </AccordionTrigger>
                    <AccordionContent className="text-western-stone-warm text-[15px] leading-[1.65] pb-6 max-w-[64ch]">
                      {obra.menteDoCriador}
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </Reveal>
            )}

            {/* Ficha */}
            {obra.ficha && obra.ficha.length > 0 && (
              <div className="mt-8 flex flex-wrap gap-2">
                {obra.ficha.map((f) => (
                  <span
                    key={f}
                    className="inline-flex items-center rounded-sm bg-western-paper border border-western-border-soft px-3 py-1.5 font-sans text-[14px] text-western-green-deep"
                  >
                    {f}
                  </span>
                ))}
              </div>
            )}

            {/* Peças + papel */}
            {obra.skus && obra.skus.length > 0 && (
              <div className="mt-10">
                <p className="text-eyebrow mb-4">
                  {comprable ? "As peças desta obra" : "Composição sob medida"}
                </p>
                <ul className="space-y-2.5">
                  {obra.skus.map((s) => {
                    const papel = papelDaPeca(s.codigo);
                    return (
                      <li
                        key={s.codigo + s.nome}
                        className="flex items-center gap-3 border-b border-western-border-soft pb-2.5 last:border-0"
                      >
                        <span className="font-sans text-[15px] font-semibold tabular-nums text-western-bronze w-8">
                          {s.qty}×
                        </span>
                        {s.handle ? (
                          <Link
                            to={`/produtos/${s.handle}`}
                            className="font-sans text-[15px] font-semibold text-western-green-deep hover:text-western-bronze hover:underline underline-offset-4 transition-colors"
                          >
                            {s.nome}
                          </Link>
                        ) : (
                          <span className="font-sans text-[15px] font-semibold text-western-green-deep">
                            {s.nome}
                          </span>
                        )}
                        {papel && (
                          <span
                            className="ml-auto inline-flex items-center gap-1.5 rounded-full bg-western-gold/15 px-2.5 py-0.5 font-sans text-[12px] font-semibold text-western-bronze"
                            title={papel.frase}
                          >
                            {papel.papel}
                          </span>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}

            {obra.creditos && obra.creditos.length > 0 && (
              <p className="text-meta mt-5">{obra.creditos.join(" · ")}</p>
            )}

            {/* Ação */}
            <div className="mt-8">
              {comprable ? (
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
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
                        <Plus className="h-5 w-5" /> Adicionar a obra ao orçamento
                      </>
                    )}
                  </button>
                  <GatedPrice amount={totalPreco} variant="block" className="text-price" />
                </div>
              ) : (
                <a
                  href={waHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-gold w-full sm:w-auto"
                >
                  <MessageCircle className="h-5 w-5" /> Falar com o ateliê
                </a>
              )}
              <p className="text-meta mt-4">
                É para a sua casa e não tem CNPJ?{" "}
                <Link to="/para-sua-casa" className="link-underline font-semibold text-western-green-deep">
                  A Western faz a obra completa
                </Link>
                .
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
