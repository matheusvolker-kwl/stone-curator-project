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
 *
 * DS V3: controle de 52px, cantos 10px, texto 16px, prefixo em sans (nunca mono)
 * e erro em sans 14px. Fundo claro e quente (paper), borda visível.
 */
const PhoneInput = forwardRef<HTMLInputElement, Props>(function PhoneInput(
  { value, onChange, onBlur, id, name, placeholder, required, error, className, readOnly },
  _ref
) {
  const describedBy = error && id ? `${id}-error` : undefined;
  return (
    <div>
      <div
        className={`flex items-stretch h-control overflow-hidden rounded-lg border-[1.5px] bg-western-paper transition-colors ${
          error
            ? "border-status-error"
            : "border-western-border-strong focus-within:border-western-green-deep"
        } ${className ?? ""}`}
      >
        <span className="px-4 flex items-center font-sans text-[15px] font-medium text-western-stone-warm border-r border-western-border-soft select-none">
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
          placeholder={placeholder ?? "(11) 91234-5678"}
          required={required}
          readOnly={readOnly}
          aria-invalid={!!error}
          aria-describedby={describedBy}
          className={`flex-1 min-w-0 bg-transparent px-4 outline-none font-sans text-[15px] leading-normal text-western-green-deep placeholder:text-western-stone-warm/60 ${readOnly ? "opacity-70 cursor-not-allowed" : ""}`}
        />
      </div>
      {error && (
        <p
          id={describedBy}
          className="mt-2 font-sans text-[14px] font-semibold normal-case tracking-normal leading-snug text-status-error"
        >
          {error}
        </p>
      )}
    </div>
  );
});

export default PhoneInput;
