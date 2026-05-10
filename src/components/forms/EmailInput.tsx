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

export default function EmailInput({
  value, onChange, onBlur, id, name, placeholder, required, error, autoComplete, readOnly,
}: Props) {
  const [suggestion, setSuggestion] = useState<string | null>(null);

  const handleBlur = () => {
    setSuggestion(suggestEmailFix(value));
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
        className={`h-12 w-full bg-transparent border px-3 rounded-none text-western-green-deep placeholder:text-western-stone-warm/50 focus:outline-none transition-colors ${
          readOnly ? "opacity-70 cursor-not-allowed " : ""
        }${
          error
            ? "border-red-700/60"
            : "border-western-stone-warm/30 focus:border-western-gold"
        }`}
      />
      {suggestion && (
        <button
          type="button"
          onClick={() => {
            onChange(suggestion);
            setSuggestion(null);
          }}
          className="mt-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-western-gold hover:text-western-green-deep transition-colors"
        >
          Você quis dizer <span className="underline">{suggestion}</span>?
        </button>
      )}
      {error && (
        <p className="mt-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-red-700/80">
          {error}
        </p>
      )}
    </div>
  );
}
