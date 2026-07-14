import { IMaskInput } from "react-imask";
import { isValidCNPJ } from "@/lib/forms/br";

interface Props {
  value: string;
  onChange: (digits: string) => void;
  onBlur?: () => void;
  id?: string;
  name?: string;
  required?: boolean;
  error?: string;
}

export default function CnpjInput({ value, onChange, onBlur, id, name, required, error }: Props) {
  const showInvalid = !error && value.length === 14 && !isValidCNPJ(value);
  const finalError = error ?? (showInvalid ? "CNPJ inválido" : undefined);
  const describedBy = finalError && id ? `${id}-error` : undefined;
  return (
    <div>
      <IMaskInput
        mask="00.000.000/0000-00"
        definitions={{ "0": /\d/ }}
        unmask={true}
        value={value}
        onAccept={(v: string) => onChange(v)}
        onBlur={onBlur}
        id={id}
        name={name}
        inputMode="numeric"
        placeholder="00.000.000/0000-00"
        required={required}
        aria-invalid={!!finalError}
        aria-describedby={describedBy}
        className={`h-[52px] w-full bg-transparent border px-3.5 rounded-[6px] text-[16px] text-western-green-deep placeholder:text-western-stone-warm/50 focus:outline-none transition-colors ${
          finalError
            ? "border-red-700/60"
            : "border-western-stone-warm/30 focus:border-western-gold"
        }`}
      />
      {finalError && (
        <p id={describedBy} className="mt-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-red-700/80">
          {finalError}
        </p>
      )}
    </div>
  );
}
