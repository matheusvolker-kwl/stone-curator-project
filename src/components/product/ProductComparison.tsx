interface Props {
  productTitle: string;
  pesoKg?: string | null;        // ex.: "74"
  dimensoes?: string | null;     // ex.: "108 × 76 × 52 cm"
}

const ROWS = (pesoKg?: string | null) => [
  {
    label: "Peso",
    western: pesoKg ? `${pesoKg} kg` : "até 10× mais leve",
    natural: pesoKg ? `~${Math.round(Number(pesoKg) * 10)} kg` : "centenas de kg",
  },
  { label: "Transporte", western: "caminhão comum", natural: "caminhão pesado" },
  { label: "Descarga", western: "manual, 1 a 2 pessoas", natural: "guindaste + equipe especializada" },
  { label: "Logística extra", western: "nenhuma", natural: "fechamento de via, alvará municipal" },
  { label: "Tempo de instalação", western: "algumas horas", natural: "dias" },
  { label: "Base", western: "plana, assentamento direto", natural: "preparação de berço, calços, ajustes" },
  { label: "Previsibilidade", western: "modelo 3D antes da compra", natural: "só na obra" },
  { label: "Custo total", western: "referência", natural: "30% a 50% mais alto" },
];

export default function ProductComparison({ productTitle, pesoKg, dimensoes }: Props) {
  const rows = ROWS(pesoKg);

  return (
    <section className="bg-western-ivory py-20 md:py-28">
      <div className="max-w-5xl mx-auto px-6 md:px-8">
        <header className="mb-12 max-w-2xl">
          <p className="text-section-label mb-5">Comparativo</p>
          <h2 className="font-display text-3xl md:text-4xl text-western-green-deep leading-tight">
            Por que pedra Western e não pedra natural
          </h2>
          <p className="mt-4 text-spec italic text-western-stone-warm leading-relaxed">
            A peça em si é apenas parte do projeto. O que viabiliza Western é o que vem junto.
          </p>
          {dimensoes && (
            <p className="text-sublabel mt-3">
              Referência: {productTitle} · {dimensoes}
            </p>
          )}
        </header>

        {/* Header row (desktop) */}
        <div className="hidden md:grid grid-cols-[200px_1fr_1fr] border-b border-western-stone-warm/25">
          <div />
          <div className="px-6 py-3 bg-western-paper/60 border-l-2 border-western-gold">
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-western-green-deep font-semibold">
              {productTitle} · Western
            </p>
          </div>
          <div className="px-6 py-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-western-stone-warm/80">
              Pedra natural equivalente
            </p>
          </div>
        </div>

        <ul className="divide-y divide-western-stone-warm/15">
          {rows.map((r) => (
            <li
              key={r.label}
              className="md:grid md:grid-cols-[200px_1fr_1fr] md:items-stretch py-4 md:py-0"
            >
              {/* Label */}
              <div className="md:flex md:items-center md:py-5 md:pr-4">
                <span className="font-sans font-medium text-[14px] text-western-green-deep">
                  {r.label}
                </span>
              </div>

              {/* Western column */}
              <div className="md:py-5 md:px-6 md:bg-western-paper/60 md:border-l-2 md:border-western-gold mt-2 md:mt-0">
                <span className="md:hidden text-sublabel mr-2 text-western-gold">Western</span>
                <span className="font-sans font-medium text-[14.5px] text-western-green-deep leading-snug">
                  {r.western}
                </span>
              </div>

              {/* Natural column */}
              <div className="md:py-5 md:px-6 mt-1 md:mt-0">
                <span className="md:hidden text-sublabel mr-2">Pedra natural</span>
                <span className="font-sans text-[14px] text-western-stone-warm/85 leading-snug">
                  {r.natural}
                </span>
              </div>
            </li>
          ))}
        </ul>

        <p className="mt-10 italic text-sm text-western-stone-warm/85 max-w-xl">
          Resultado: projeto previsível, sem surpresa de obra — você decide a peça, a logística e o custo antes de qualquer caminhão sair da fábrica.
        </p>
      </div>
    </section>
  );
}
