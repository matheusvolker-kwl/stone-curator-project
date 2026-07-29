import { IMaskInput } from "react-imask";
import { isValidCPF } from "@/lib/forms/br";

interface Props {
  value: string;
  onChange: (digits: string) => void;
  onBlur?: () => void;
  id?: string;
  name?: string;
  required?: boolean;
  error?: string;
}

export default function CpfInput({ value, onChange, onBlur, id, name, required, error }: Props) {
  const showInvalid = !error && value.length === 11 && !isValidCPF(value);
  const finalError = error ?? (showInvalid ? "CPF inválido" : undefined);
  const describedBy = finalError && id ? `${id}-error` : undefined;
  return (
    <div>
      <IMaskInput
        mask="000.000.000-00"
        definitions={{ "0": /\d/ }}
        unmask={true}
        value={value}
        onAccept={(v: string) => onChange(v)}
        onBlur={onBlur}
        id={id}
        name={name}
        inputMode="numeric"
        placeholder="000.000.000-00"
        required={required}
        aria-invalid={!!finalError}
        aria-describedby={describedBy}
        className={`h-control w-full bg-transparent border px-3.5 rounded-sm text-[15px] text-western-green-deep placeholder:text-western-stone-warm/50 focus:outline-none transition-colors ${
          finalError
            ? "border-red-700/60"
            : "border-western-stone-warm/30 focus:border-western-gold"
        }`}
      />
      {finalError && (
        <p id={describedBy} className="mt-1.5 text-[14px] font-semibold text-status-error">
          {finalError}
        </p>
      )}
    </div>
  );
}
