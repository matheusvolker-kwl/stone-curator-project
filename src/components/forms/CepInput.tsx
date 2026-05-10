import { IMaskInput } from "react-imask";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { fetchCep, type ViaCepResult } from "@/lib/forms/br";

interface Props {
  value: string;
  onChange: (digits: string) => void;
  onResolved?: (data: ViaCepResult) => void;
  required?: boolean;
  error?: string;
  id?: string;
}

export default function CepInput({ value, onChange, onResolved, required, error, id }: Props) {
  const [loading, setLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);

  const handleBlur = async () => {
    if (value.length !== 8) return;
    setLoading(true);
    setNotFound(false);
    const res = await fetchCep(value);
    setLoading(false);
    if (!res) {
      setNotFound(true);
      return;
    }
    onResolved?.(res);
  };

  const finalError = error ?? (notFound ? "CEP não encontrado" : undefined);

  return (
    <div>
      <div className="relative">
        <IMaskInput
          mask="00000-000"
          definitions={{ "0": /\d/ }}
          unmask={true}
          value={value}
          onAccept={(v: string) => onChange(v)}
          onBlur={handleBlur}
          id={id}
          inputMode="numeric"
          placeholder="00000-000"
          required={required}
          className={`h-12 w-full bg-transparent border px-3 rounded-none text-western-green-deep placeholder:text-western-stone-warm/50 focus:outline-none transition-colors ${
            finalError
              ? "border-red-700/60"
              : "border-western-stone-warm/30 focus:border-western-gold"
          }`}
        />
        {loading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-western-gold" />
        )}
      </div>
      {finalError && (
        <p className="mt-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-red-700/80">
          {finalError}
        </p>
      )}
    </div>
  );
}
