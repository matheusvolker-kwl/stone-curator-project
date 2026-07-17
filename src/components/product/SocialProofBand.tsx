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
      {/* GRID de colunas fixas em vez de flex-wrap: 6 marcas ÷ (2 no mobile, 3 no
          desktop) dão sempre LINHAS CHEIAS — nunca o 4+2 que deixava Cristal Pool
          e Genesis órfãos numa 2ª linha. Nenhuma marca cortada. */}
      <div className="container-western max-w-4xl text-center">
        <p className="text-[14px] font-semibold uppercase tracking-[0.06em] text-western-gold mb-6">
          Especificado e revendido por
        </p>
        <ul className="grid grid-cols-2 sm:grid-cols-3 items-center justify-items-center gap-x-6 gap-y-5">
          {marcas.map((m) => (
            <li
              key={m.slug}
              className="font-display text-[16px] md:text-[18px] leading-tight text-center text-western-green-deep/70 hover:text-western-green-deep transition-colors"
            >
              {m.nome}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
