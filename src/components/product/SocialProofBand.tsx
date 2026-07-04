import SocialProof from "@/components/shared/SocialProof";

/** Faixa de prova social (PDP e afins) — bloco único, modo compacto. */
export default function SocialProofBand() {
  return (
    <section className="surface-forest py-14 md:py-20 border-y border-western-gold/15">
      <div className="container-western max-w-5xl">
        <SocialProof
          variant="dark"
          compact
          eyebrow="Quem confia na Western"
          groups={["celebridades", "profissionais", "marcas"]}
        />
      </div>
    </section>
  );
}
