import { IMaskInput } from "react-imask";
import { forwardRef } from "react";

interface Props {
  value: string;
  onChange: (digits: string) => void;
  onBlur?: () => void;
  id?: string;
  name?: string;
  placeholder?: string;
  required?: boolean;
  error?: string;
  className?: string;
  readOnly?: boolean;
}

/**
 * Telefone BR com prefixo +55. Máscara alterna automaticamente entre fixo
 * `(00) 0000-0000` (10 dígitos) e celular `(00) 00000-0000` (11 dígitos).
 * Retorna apenas os dígitos do DDD+número.
 */
const PhoneInput = forwardRef<HTMLInputElement, Props>(function PhoneInput(
  { value, onChange, onBlur, id, name, placeholder, required, error, className, readOnly },
  _ref
) {
  const describedBy = error && id ? `${id}-error` : undefined;
  return (
    <div>
      <div
        className={`flex items-stretch h-12 border bg-transparent transition-colors ${
          error
            ? "border-red-700/60"
            : "border-western-stone-warm/30 focus-within:border-western-gold"
        } ${className ?? ""}`}
      >
        <span className="px-3 flex items-center font-mono text-sm text-western-stone-warm border-r border-western-stone-warm/20 select-none">
          +55
        </span>
        <IMaskInput
          mask={[
            { mask: "(00) 0000-0000" },
            { mask: "(00) 00000-0000" },
          ]}
          dispatch={(appended, dynamicMasked) => {
            const number = (dynamicMasked.value + appended).replace(/\D/g, "");
            return dynamicMasked.compiledMasks[number.length > 10 ? 1 : 0];
          }}
          definitions={{ "0": /\d/ }}
          unmask={true}
          value={value}
          onAccept={(v: string) => onChange(v)}
          onBlur={onBlur}
          id={id}
          name={name}
          inputMode="tel"
          autoComplete="tel-national"
          placeholder={placeholder ?? "(11) 95896-7088"}
          required={required}
          readOnly={readOnly}
          aria-invalid={!!error}
          aria-describedby={describedBy}
          className={`flex-1 bg-transparent px-3 outline-none text-western-green-deep placeholder:text-western-stone-warm/50 ${readOnly ? "opacity-70 cursor-not-allowed" : ""}`}
        />
      </div>
      {error && (
        <p id={describedBy} className="mt-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-red-700/80">
          {error}
        </p>
      )}
    </div>
  );
});

export default PhoneInput;
