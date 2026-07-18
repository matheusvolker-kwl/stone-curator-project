import { useState } from "react";
import { suggestEmailFix } from "@/lib/forms/br";

interface Props {
  value: string;
  onChange: (v: string) => void;
  onBlur?: () => void;
  id?: string;
  name?: string;
  placeholder?: string;
  required?: boolean;
  error?: string;
  autoComplete?: string;
  readOnly?: boolean;
}

/* DS V3: campo de 52px, cantos 10px, texto 16px (mínimo de UI), fundo claro e
 * quente. Mensagens de erro e sugestão em sans 14px — nunca mono, nunca 10px. */

export default function EmailInput({
  value, onChange, onBlur, id, name, placeholder, required, error, autoComplete, readOnly,
}: Props) {
  const [suggestion, setSuggestion] = useState<string | null>(null);
  const describedBy = error && id ? `${id}-error` : undefined;

  const handleBlur = () => {
    // normaliza: trim + lowercase
    const normalized = value.trim().toLowerCase();
    if (normalized !== value) onChange(normalized);
    setSuggestion(suggestEmailFix(normalized));
    onBlur?.();
  };

  return (
    <div>
      <input
        type="email"
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          if (suggestion) setSuggestion(null);
        }}
        onBlur={handleBlur}
        id={id}
        name={name}
        placeholder={placeholder ?? "voce@empresa.com.br"}
        required={required}
        readOnly={readOnly}
        autoComplete={autoComplete ?? "email"}
        spellCheck={false}
        aria-invalid={!!error}
        aria-describedby={describedBy}
        className={`h-control w-full rounded-lg border-[1.5px] bg-western-paper px-4 font-sans text-[15px] leading-normal text-western-green-deep placeholder:text-western-stone-warm/60 focus:outline-none transition-colors ${
          readOnly ? "opacity-70 cursor-not-allowed " : ""
        }${
          error
            ? "border-status-error"
            : "border-western-border-strong focus:border-western-green-deep"
        }`}
      />
      {suggestion && (
        <button
          type="button"
          onClick={() => {
            onChange(suggestion);
            setSuggestion(null);
          }}
          className="mt-2 inline-flex min-h-tap items-center font-sans text-[14px] font-semibold normal-case tracking-normal text-western-green-deep hover:text-western-cta transition-colors"
        >
          Você quis dizer&nbsp;
          <span className="underline underline-offset-4 decoration-western-bronze">{suggestion}</span>?
        </button>
      )}
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
}
