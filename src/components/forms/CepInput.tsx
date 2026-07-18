import { IMaskInput } from "react-imask";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { fetchCep, type ViaCepResult } from "@/lib/forms/br";

interface Props {
  value: string;
  onChange: (digits: string) => void;
  /** Chamado quando ViaCEP/BrasilAPI retorna dados. */
  onResolved?: (data: ViaCepResult) => void;
  /** Id do próximo campo (ex.: "numero") para mover o foco após o autopreencher. */
  focusNextId?: string;
  required?: boolean;
  error?: string;
  id?: string;
}

export default function CepInput({
  value, onChange, onResolved, focusNextId, required, error, id,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);

  const lookup = async (cep: string) => {
    if (cep.length !== 8) return;
    setLoading(true);
    setNotFound(false);
    const res = await fetchCep(cep);
    setLoading(false);
    if (!res) {
      setNotFound(true);
      return;
    }
    onResolved?.(res);
    if (focusNextId) {
      // pequeno delay para garantir que o state foi aplicado
      window.setTimeout(() => {
        document.getElementById(focusNextId)?.focus();
      }, 50);
    }
  };

  const handleAccept = (v: string) => {
    onChange(v);
    if (v.length === 8) void lookup(v); // dispara assim que completar — UX padrão BR
  };

  const finalError = error ?? (notFound ? "CEP não encontrado" : undefined);
  const describedBy = finalError && id ? `${id}-error` : undefined;

  return (
    <div>
      <div className="relative">
        <IMaskInput
          mask="00000-000"
          definitions={{ "0": /\d/ }}
          unmask={true}
          value={value}
          onAccept={handleAccept}
          onBlur={() => void lookup(value)}
          id={id}
          inputMode="numeric"
          autoComplete="postal-code"
          placeholder="00000-000"
          required={required}
          aria-invalid={!!finalError}
          aria-describedby={describedBy}
          className={`h-control w-full bg-transparent border px-3.5 rounded-sm text-[15px] text-western-green-deep placeholder:text-western-stone-warm/50 focus:outline-none transition-colors ${
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
        <p id={describedBy} className="mt-1.5 text-[14px] font-semibold text-status-error">
          {finalError}
        </p>
      )}
    </div>
  );
}
