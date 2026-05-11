interface Props {
  pesoKg?: string | null;       // ex.: "74"
  dimensoes?: string | null;    // ex.: "108 × 76 × 52 cm"
  variacao?: string;            // ex.: "±3 cm"
  /** "card" (vertical hero) ou "strip" (faixa horizontal compacta) */
  variant?: "card" | "strip";
}

export default function HardFactsCard({
  pesoKg,
  dimensoes,
  variacao = "±3 cm",
  variant = "card",
}: Props) {
  if (!pesoKg && !dimensoes) return null;

  if (variant === "strip") {
    const equivalente = pesoKg ? Math.round(Number(pesoKg) * 10) : null;
    return (
      <div className="mt-6 border-y border-western-stone-warm/20 py-5 grid grid-cols-3 gap-x-6">
        {pesoKg && (
          <div>
            <p className="text-meta mb-1">Peso</p>
            <p className="font-sans font-semibold text-2xl text-western-green-deep tabular-nums leading-none">
              {pesoKg}
              <span className="text-sm font-normal text-western-stone-warm/70 ml-1">kg</span>
            </p>
            {equivalente && (
              <p className="text-meta mt-1.5 normal-case tracking-normal text-[11px]">
                vs. ≈ {equivalente} kg em pedra natural
              </p>
            )}
          </div>
        )}
        {dimensoes && (
          <div>
            <p className="text-meta mb-1">Dimensões</p>
            <p className="font-sans font-semibold text-base text-western-green-deep tabular-nums leading-tight">
              {dimensoes}
            </p>
            <p className="text-meta mt-1.5 normal-case tracking-normal text-[11px]">
              C × L × A
            </p>
          </div>
        )}
        <div>
          <p className="text-meta mb-1">Variação</p>
          <p className="font-sans font-semibold text-base text-western-green-deep tabular-nums leading-tight">
            {variacao}
          </p>
          <p className="text-meta mt-1.5 normal-case tracking-normal text-[11px]">
            por peça (artesanal)
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-8 border border-western-stone-warm/20 bg-western-paper px-6 py-7">
      {pesoKg && (
        <>
          <p className="font-sans font-semibold text-4xl md:text-5xl text-western-green-deep leading-none tabular-nums">
            {pesoKg}
            <span className="text-2xl font-normal text-western-stone-warm/80 ml-1">kg</span>
          </p>
          <div className="w-8 h-px bg-western-stone-warm/30 my-4" />
          <p className="text-spec text-western-stone-warm leading-relaxed max-w-[42ch]">
            Uma pedra natural com volume equivalente passaria de{" "}
            <span className="text-western-green-deep">{Math.round(Number(pesoKg) * 10)} kg</span>.
          </p>
        </>
      )}

      {dimensoes && (
        <>
          {pesoKg && <div className="w-full h-px bg-western-stone-warm/15 my-5" />}
          <p className="font-sans font-semibold text-xl text-western-green-deep tabular-nums">{dimensoes}</p>
          <p className="text-meta mt-2">C × L × A</p>
        </>
      )}

      <p className="text-meta mt-4">Variação artesanal {variacao}</p>
    </div>
  );
}
