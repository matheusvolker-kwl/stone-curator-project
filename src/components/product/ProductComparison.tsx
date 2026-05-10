import { BUSINESS } from "@/config/business";

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
  const onConsultor = () => {
    const msg = `Olá! Gostaria de um comparativo orçamentário Western × pedra natural para um projeto com ${productTitle}.`;
    window.open(`https://wa.me/${BUSINESS.whatsappFabrica}?text=${encodeURIComponent(msg)}`, "_blank");
  };

  return (
    <section className="bg-western-ivory py-20 md:py-28">
      <div className="max-w-4xl mx-auto px-6 md:px-8">
        <header className="mb-10 max-w-2xl">
          <p className="text-eyebrow mb-4">Comparativo</p>
          <div className="w-12 h-px bg-western-gold mb-6" />
          <h2 className="font-display text-3xl md:text-4xl text-western-green-deep leading-tight">
            Por que pedra Western e não pedra natural
          </h2>
          <p className="mt-4 text-spec italic text-western-stone-warm leading-relaxed">
            A peça em si é apenas parte do projeto. O que viabiliza Western é o que vem junto.
          </p>
          {dimensoes && (
            <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.2em] text-western-stone-warm/70">
              Referência: {productTitle} · {dimensoes}
            </p>
          )}
        </header>

        {/* Header da tabela */}
        <div className="hidden md:grid grid-cols-[1fr_auto_1fr] gap-0 border-b border-western-stone-warm/25 pb-3 mb-1">
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-western-green-deep text-right pr-6">
            {productTitle} · Western
          </p>
          <span className="w-px bg-western-stone-warm/15" />
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-western-stone-warm pl-6">
            Pedra natural equivalente
          </p>
        </div>

        <ul>
          {ROWS(pesoKg).map((r, i) => (
            <li
              key={r.label}
              className={`grid md:grid-cols-[1fr_auto_1fr] grid-cols-1 items-center gap-y-1 border-b border-western-stone-warm/15 py-4 ${
                i % 2 === 0 ? "md:bg-western-paper/40" : ""
              }`}
            >
              <span className="md:text-right md:pr-6 text-western-green-deep text-sm leading-snug">
                <span className="md:hidden font-mono text-[9px] uppercase tracking-[0.22em] text-western-gold mr-2">
                  Western
                </span>
                {r.western}
              </span>
              <span className="hidden md:flex w-[180px] justify-center items-center">
                <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-western-stone-warm/80 text-center px-3">
                  {r.label}
                </span>
              </span>
              <span className="md:hidden font-mono text-[10px] uppercase tracking-[0.22em] text-western-stone-warm/70 my-1">
                {r.label}
              </span>
              <span className="md:pl-6 text-western-stone-warm text-sm leading-snug">
                <span className="md:hidden font-mono text-[9px] uppercase tracking-[0.22em] text-western-stone-warm/60 mr-2">
                  Pedra natural
                </span>
                {r.natural}
              </span>
            </li>
          ))}
        </ul>

        <div className="text-center mt-12">
          <button
            onClick={onConsultor}
            className="inline-flex items-center justify-center px-8 py-4 border border-western-green-deep text-western-green-deep hover:bg-western-green-deep hover:text-western-cream transition-colors font-mono text-[11px] uppercase tracking-[0.25em]"
          >
            Solicitar comparativo orçamentário
          </button>
        </div>
      </div>
    </section>
  );
}
