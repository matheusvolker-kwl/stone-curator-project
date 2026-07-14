import { SOCIAL_PROOF, type MarcaComLogo } from "@/data/socialProof";

/**
 * PDP: prova social ENXUTA — só uma faixa fina de wordmarks (não clona o bloco da home).
 * Benchmark (2026-07-14): na PDP a prova social pesada empurra o CTA e dilui; use 1 faixa
 * curta e específica. O grid de rostos + números fica só na HOME.
 */
export default function SocialProofBand() {
  const marcas = (SOCIAL_PROOF.marcas as readonly MarcaComLogo[]).slice(0, 6);
  if (!marcas.length) return null;

  return (
    <section className="bg-white border-y border-western-stone-warm/12 py-8 md:py-10">
      <div className="container-western max-w-4xl text-center">
        <p className="font-mono text-[10px] uppercase tracking-[0.26em] text-western-gold mb-5">
          Especificado e revendido por
        </p>
        <ul className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 md:gap-x-12">
          {marcas.map((m) => (
            <li
              key={m.slug}
              className="font-display text-[17px] md:text-[19px] leading-none text-western-green-deep/70 hover:text-western-green-deep transition-colors"
            >
              {m.nome}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
