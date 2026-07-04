import SocialProof from "@/components/shared/SocialProof";

/**
 * Wrapper legado: agora só encaminha para o componente único `SocialProof`,
 * cuja fonte de verdade é `src/data/socialProof.ts`.
 */
export default function SocialProofBand() {
  return (
    <section className="surface-forest py-14 md:py-20 border-y border-western-gold/15">
      <div className="container-western max-w-5xl">
        <SocialProof
          variant="dark"
          groups={["celebridades", "profissionais", "parceiros", "empresas"]}
        />
      </div>
    </section>
  );
}
