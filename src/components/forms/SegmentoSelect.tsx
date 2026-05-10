export const SEGMENTOS = [
  "Arquitetura",
  "Paisagismo",
  "Construtora",
  "Garden Center",
  "Piscinas e Spas",
  "Hotelaria / Resort",
  "Loja de jardinagem",
  "Decoração",
  "Cliente final",
  "Outro",
] as const;

interface Props {
  value: string;
  onChange: (v: string) => void;
  id?: string;
  required?: boolean;
  error?: string;
}

export default function SegmentoSelect({ value, onChange, id, required, error }: Props) {
  return (
    <div>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className={`h-12 w-full bg-transparent border px-3 rounded-none text-western-green-deep focus:outline-none transition-colors ${
          error
            ? "border-red-700/60"
            : "border-western-stone-warm/30 focus:border-western-gold"
        }`}
      >
        <option value="" disabled>
          Selecione…
        </option>
        {SEGMENTOS.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>
      {error && (
        <p className="mt-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-red-700/80">
          {error}
        </p>
      )}
    </div>
  );
}
