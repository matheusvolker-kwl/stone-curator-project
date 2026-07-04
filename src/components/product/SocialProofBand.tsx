import SocialProof from "@/components/shared/SocialProof";

/**
 * Faixa de prova social usada em PDPs e páginas de conjunto.
 * Mantida como wrapper do componente único `SocialProof` (fonte de verdade
 * em `src/data/socialProof.ts`) para preservar imports existentes.
 */
export default function SocialProofBand() {
  return (
    <section className="surface-forest py-14 md:py-20 border-y border-western-gold/15">
      <div className="container-western">
        <SocialProof
          variant="dark"
          groups={["celebridades", "profissionais", "parceiros", "empresas"]}
        />
      </div>
    </section>
  );
}
