interface Coluna {
  eyebrow: string;
  nomes: string[];
}

const COLUNAS: Coluna[] = [
  {
    eyebrow: "Especificada por arquitetos",
    nomes: ["Marcelo Faisal", "Fabiano Hayasaki", "Ronaldo Luidi"],
  },
  {
    eyebrow: "Em projetos institucionais",
    nomes: [
      "Cristal Pool",
      "Genesis Ecossistemas",
      "Biopet Lagos",
      "Cobasi",
      "Unique Garden",
    ],
  },
  {
    eyebrow: "Em casas de celebridades",
    nomes: [
      "Neymar Jr.",
      "Diogo Nogueira",
      "Thiago Nigro",
      "Tato (Falamansa)",
      "Evandro Mesquita",
      "Caito Maia",
    ],
  },
];

export default function SocialProofBand() {
  return (
    <section className="surface-forest py-14 md:py-20 border-y border-western-gold/15">
      <div className="container-western">
        <ul className="grid md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-western-gold/15">
          {COLUNAS.map((c) => (
            <li
              key={c.eyebrow}
              className="px-6 md:px-10 py-8 md:py-2 text-center"
            >
              <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-western-gold-soft/85 mb-4">
                {c.eyebrow}
              </p>
              <div className="w-8 h-px bg-western-gold/40 mx-auto mb-5" />
              <ul className="space-y-1.5">
                {c.nomes.map((n) => (
                  <li
                    key={n}
                    className="font-sans text-[15px] font-medium text-western-cream leading-snug"
                  >
                    {n}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
