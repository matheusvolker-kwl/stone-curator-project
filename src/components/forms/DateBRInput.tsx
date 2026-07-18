import { IMaskInput } from "react-imask";
import { isValidDateBR } from "@/lib/forms/br";

interface Props {
  value: string;
  onChange: (v: string) => void;
  onBlur?: () => void;
  id?: string;
  name?: string;
  required?: boolean;
  error?: string;
  placeholder?: string;
}

/** Entrada de data dd/mm/aaaa com validação de data real. */
export default function DateBRInput({
  value, onChange, onBlur, id, name, required, error, placeholder,
}: Props) {
  const showInvalid = !error && value.length === 10 && !isValidDateBR(value);
  const finalError = error ?? (showInvalid ? "Data inválida" : undefined);
  const describedBy = finalError && id ? `${id}-error` : undefined;
  return (
    <div>
      <IMaskInput
        mask="00/00/0000"
        definitions={{ "0": /\d/ }}
        value={value}
        onAccept={(v: string) => onChange(v)}
        onBlur={onBlur}
        id={id}
        name={name}
        inputMode="numeric"
        autoComplete="bday"
        placeholder={placeholder ?? "dd/mm/aaaa"}
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
