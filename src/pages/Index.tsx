import { useQuery } from "@tanstack/react-query";
import { fetchCollections, isSeasonal } from "@/lib/datasource";
import Seo from "@/components/seo/Seo";

import ColecoesGrid from "@/components/home/ColecoesGrid";
import ProjetosSection from "@/components/home/ProjetosSection";
import ArtistaSection from "@/components/home/ArtistaSection";
import HeroVideo from "@/components/home/HeroVideo";
import WesternBoxTeaser from "@/components/home/WesternBoxTeaser";
import Modelos3DModule from "@/components/home/Modelos3DModule";
import NumerosStrip from "@/components/home/NumerosStrip";
import TrustBar from "@/components/home/TrustBar";
import ProcessoSection from "@/components/home/ProcessoSection";
import MarcasInstitucionais from "@/components/shared/MarcasInstitucionais";
import Reveal from "@/components/shared/Reveal";

export default function Index() {
  const { data: collections = [], isLoading: loadingCollections } = useQuery({
    queryKey: ["collections"],
    queryFn: () => fetchCollections(20),
  });

  const isAmostras = (c: typeof collections[number]) => {
    const h = (c.handle || "").toLowerCase();
    const t = (c.title || "").toLowerCase();
    return (
      h === "amostras" ||
      h === "amostra" ||
      h.includes("amostra") ||
      h.includes("western-box") ||
      t.trim() === "amostras" ||
      t.includes("western box")
    );
  };
  const linhasAll = collections.filter(
    (c) => !isSeasonal(c) && c.handle !== "conjuntos" && !isAmostras(c),
  );
  const linhas = linhasAll.slice(0, 10);

  return (
    <>
      <Seo
        title="Western — Pedras artesanais para paisagismo profissional"
        description="Catálogo B2B de pedras artesanais para arquitetos e paisagistas. Fabricadas peça a peça em São Paulo, com modelos 3D no SketchUp Warehouse."
        path="/"
        ogType="website"
      />

      {/* 1) HERO editorial com vídeo */}
      <HeroVideo />

      {/* 2) PROVA SOCIAL — projetos assinados */}
      <Reveal variant="fade-up" duration={800}>
        <ProjetosSection />
      </Reveal>

      {/* 3) VITRINE — coleções por linha (elo direto pro catálogo) */}
      <Reveal variant="fade-up" duration={800}>
        <ColecoesGrid collections={linhas} isLoading={loadingCollections} />
      </Reveal>

      {/* 4) WESTERN BOX — amostras, risco zero */}
      <WesternBoxTeaser />

      {/* 5) MÓDULO 3D — captura de lead pra arquitetos */}
      <Modelos3DModule />

      {/* 6) ATELIER — Ricardo */}
      <Reveal variant="fade-up" duration={800}>
        <ArtistaSection />
      </Reveal>

      {/* 7) PROCESSO — 6 etapas com fotos grandes */}
      <ProcessoSection />

      {/* 8) NÚMEROS com contagem animada */}
      <NumerosStrip />

      {/* 9) INSTITUCIONAL — arquitetos + parceiros corporativos */}
      <section className="surface-forest py-14 md:py-20 border-y border-western-gold/15">
        <div className="container-western max-w-4xl">
          <Reveal variant="fade-up" duration={750}>
            <div className="text-center mb-10 md:mb-12">
              <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-western-gold-soft/85 mb-5">
                Parceiros de longa data
              </p>
              <div className="w-10 h-px bg-western-gold/50 mx-auto mb-7" />
              <h2 className="font-display text-2xl md:text-[2rem] text-western-cream leading-[1.2] max-w-2xl mx-auto">
                Especificada pelos arquitetos que assinam os jardins mais publicados do país.
              </h2>
              <p className="mt-6 font-mono text-[11px] uppercase tracking-[0.24em] text-western-gold-soft/85">
                Marcelo Faisal · Fabiano Hayasaki · Ronaldo Luidi
              </p>
            </div>
          </Reveal>

          <Reveal variant="fade-up" delay={120} duration={750}>
            <div className="pt-8 md:pt-10 border-t border-western-gold/15">
              <div className="text-center max-w-2xl mx-auto mb-8 md:mb-10">
                <h3 className="font-display text-2xl md:text-[2rem] text-western-cream leading-[1.15] mb-4">
                  Empresas que confiam na Western.
                </h3>
                <p className="text-base leading-relaxed text-western-cream-muted">
                  Biopet, Cristal Pool, Genesis e outros parceiros corporativos que mantêm a Western em seus projetos e operações ao longo dos anos.
                </p>
              </div>
              <MarcasInstitucionais compacta variante="dark" semBordas semLinks />
            </div>
          </Reveal>
        </div>
      </section>

      {/* 10) TRUST BAR — barra de confiança final */}
      <TrustBar />
    </>
  );
}
