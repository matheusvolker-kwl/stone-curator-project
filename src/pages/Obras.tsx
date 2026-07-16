// /obras — portfólio / prova social. Grade image-led com filtro por linguagem.
// O texto longo ("mente do criador") vive no detalhe /obras/:slug (acordeão),
// não aqui — a grade é escaneável.
import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ShoppingBag } from "lucide-react";
import Seo from "@/components/seo/Seo";
import Reveal from "@/components/shared/Reveal";
import { OBRAS, obraComposicao, type ObraLinguagem } from "@/data/obras";
import { OBRA_COVER } from "@/data/obraImages";

const LINGUAGEM_LABEL: Record<ObraLinguagem, string> = {
  piscina: "Piscina",
  lago: "Lago",
  jardim: "Jardim",
  cascata: "Cascata",
  revestimento: "Revestimento",
  viveiro: "Viveiro",
  mobiliario: "Mobiliário",
};

const FILTROS: Array<{ id: string; label: string }> = [
  { id: "todas", label: "Todas" },
  { id: "piscina", label: "Piscinas" },
  { id: "lago", label: "Lagos" },
  { id: "cascata", label: "Cascatas" },
  { id: "revestimento", label: "Revestimentos" },
  { id: "mobiliario", label: "Especiais" },
];

export default function Obras() {
  const [filtro, setFiltro] = useState("todas");

  const obras = OBRAS.filter((o) => OBRA_COVER[o.slug]).filter(
    (o) => filtro === "todas" || o.linguagens.includes(filtro as ObraLinguagem),
  );

  return (
    <div className="surface-ivory min-h-screen">
      <Seo
        title="Obras entregues — Western"
        description="Projetos reais executados com pedra artesanal Western: piscinas naturais, lagos, cascatas e revestimentos. A ideia por trás de cada obra e as peças usadas."
        path="/obras"
      />
      <div className="container-western py-12 md:py-20">
        <Reveal variant="fade-up">
          <div className="max-w-3xl">
            <p className="text-eyebrow mb-4">Obras entregues · Prova real</p>
            <div className="w-12 h-px bg-western-gold mb-8" />
            <h1 className="display-xl text-western-green-deep">
              Projetos reais, pedra Western.
            </h1>
            <p className="text-body mt-5 max-w-[60ch]">
              De piscinas-praia de celebridades a revestimentos em endereços icônicos — cada obra
              com a ideia por trás e as peças que a compõem.
            </p>
          </div>
        </Reveal>

        {/* Filtro por linguagem */}
        <div role="group" aria-label="Filtrar por tipo" className="flex flex-wrap gap-3 mt-9">
          {FILTROS.map((f) => {
            const on = filtro === f.id;
            return (
              <button
                key={f.id}
                type="button"
                aria-pressed={on}
                onClick={() => setFiltro(f.id)}
                className={`tap-target inline-flex items-center justify-center px-5 rounded-full border text-[15px] font-semibold transition-colors ${
                  on
                    ? "bg-western-cta text-western-cream border-western-cta"
                    : "bg-white border-western-border-strong text-western-green-deep hover:bg-western-paper hover:border-western-green-deep"
                }`}
              >
                {f.label}
              </button>
            );
          })}
        </div>

        {/* Grade */}
        <div className="mt-10 md:mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {obras.map((obra, i) => {
            const comprable = obra.tipo === "comprable" && obraComposicao(obra).length > 0;
            return (
              <Reveal key={obra.slug} variant="fade-up" delay={(i % 3) * 80}>
                <Link to={`/obras/${obra.slug}`} className="group block">
                  <div className="relative frame-product rounded-[16px] overflow-hidden aspect-[4/3]">
                    <img
                      src={OBRA_COVER[obra.slug]}
                      alt={obra.titulo}
                      loading={i < 3 ? "eager" : "lazy"}
                      decoding="async"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    />
                    <span className="absolute top-3 left-3 inline-flex items-center rounded-[6px] bg-western-green-deep/90 px-2.5 py-1 font-sans text-[12px] font-semibold uppercase tracking-[0.06em] text-western-cream">
                      {LINGUAGEM_LABEL[obra.linguagens[0]]}
                    </span>
                    {comprable && (
                      <span className="absolute top-3 right-3 inline-flex items-center gap-1 rounded-[6px] bg-western-gold px-2.5 py-1 font-sans text-[12px] font-semibold text-western-green-deep">
                        <ShoppingBag className="h-3.5 w-3.5" /> Comprável
                      </span>
                    )}
                  </div>
                  <div className="mt-3.5">
                    <p className="text-meta">{obra.cliente ?? obra.local ?? "Western"}</p>
                    <h2 className="font-sans text-[19px] font-semibold text-western-green-deep leading-snug mt-0.5 transition-colors group-hover:text-western-bronze">
                      {obra.titulo}
                    </h2>
                    <p className="text-[14px] leading-snug text-western-stone-warm mt-1.5 line-clamp-2">
                      {obra.snippet}
                    </p>
                  </div>
                </Link>
              </Reveal>
            );
          })}
        </div>

        {/* CTA fecho */}
        <Reveal variant="fade-up">
          <section className="mt-16 md:mt-24 surface-forest rounded-[16px] text-center px-6 py-12 md:py-16">
            <h2 className="display-md text-western-cream max-w-xl mx-auto">
              Quer uma obra dessas no seu projeto?
            </h2>
            <p className="text-[17px] leading-[1.6] text-western-cream-muted max-w-[46ch] mx-auto mt-4 mb-8">
              Monte a composição com preço de parceiro (CNPJ), ou fale com o ateliê para uma obra
              completa, do projeto 3D à instalação.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-lg mx-auto">
              <Link to="/guia-de-composicao" className="btn-gold w-full sm:w-auto">
                Montar no guia <ArrowRight className="h-5 w-5" aria-hidden />
              </Link>
              <Link to="/contrate-a-western" className="btn-outline-cream w-full sm:w-auto">
                Contratar a Western
              </Link>
            </div>
          </section>
        </Reveal>
      </div>
    </div>
  );
}
