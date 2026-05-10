interface Props {
  pesoKg?: string | null;       // ex.: "74"
  dimensoes?: string | null;    // ex.: "108 × 76 × 52 cm"
  baseHint?: string;            // ex.: "Base plana · argamassa C3"
  variacao?: string;            // ex.: "Variação artesanal de até ±3 cm"
}

export default function HardFactsCard({
  pesoKg,
  dimensoes,
  baseHint = "Base plana · argamassa C3",
  variacao = "Variação artesanal de até ±3 cm",
}: Props) {
  if (!pesoKg && !dimensoes) return null;

  return (
    <div className="mt-8 border border-western-stone-warm/20 bg-western-paper px-6 py-7">
      {pesoKg && (
        <>
          <p className="font-display text-4xl md:text-5xl text-western-green-deep leading-none">
            {pesoKg} <span className="text-2xl text-western-stone-warm/80">kg</span>
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
          <p className="font-display text-xl text-western-green-deep tabular-nums">{dimensoes}</p>
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-western-stone-warm/70 mt-2">
            {baseHint}
          </p>
        </>
      )}

      <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-western-stone-warm/60 mt-4">
        {variacao}
      </p>
    </div>
  );
}
