import { useState } from "react";
import { Eye, EyeOff, Check, X } from "lucide-react";
import { passwordStrength } from "@/lib/forms/br";

interface Props {
  value: string;
  onChange: (v: string) => void;
  id?: string;
  name?: string;
  placeholder?: string;
  required?: boolean;
  error?: string;
  showStrength?: boolean;
  autoComplete?: string;
}

export default function PasswordField({
  value, onChange, id, name, placeholder, required, error, showStrength = true, autoComplete = "new-password",
}: Props) {
  const [visible, setVisible] = useState(false);
  const s = passwordStrength(value);
  const colors = [
    "bg-western-stone-warm/20",
    "bg-red-600/70",
    "bg-yellow-600/70",
    "bg-western-gold",
    "bg-green-700",
  ];

  return (
    <div>
      <div className="relative">
        <input
          type={visible ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          id={id}
          name={name}
          placeholder={placeholder}
          required={required}
          autoComplete={autoComplete}
          className={`h-control w-full bg-transparent border px-3.5 pr-11 rounded-sm text-[16px] text-western-green-deep placeholder:text-western-stone-warm/50 focus:outline-none transition-colors ${
            error
              ? "border-red-700/60"
              : "border-western-stone-warm/30 focus:border-western-gold"
          }`}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Ocultar senha" : "Mostrar senha"}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-western-stone-warm hover:text-western-gold transition-colors"
        >
          {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>

      {showStrength && value.length > 0 && (
        <div className="mt-2.5 space-y-2">
          <div className="flex gap-1">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className={`h-1 flex-1 transition-colors ${
                  i <= s.score ? colors[s.score] : "bg-western-stone-warm/15"
                }`}
              />
            ))}
          </div>
          <div className="flex flex-wrap gap-x-3 gap-y-1 text-[14px] font-semibold uppercase tracking-[0.06em]">
            <Rule ok={s.rules.has8} label="8+ caracteres" />
            <Rule ok={s.rules.hasNumber} label="número" />
            <Rule ok={s.rules.hasUpper} label="maiúscula" />
            <Rule ok={s.rules.hasSymbol} label="símbolo" />
          </div>
        </div>
      )}

      {error && (
        <p className="mt-1.5 text-[14px] font-semibold text-status-error">
          {error}
        </p>
      )}
    </div>
  );
}

function Rule({ ok, label }: { ok: boolean; label: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1 ${
        ok ? "text-green-700" : "text-western-stone-warm/70"
      }`}
    >
      {ok ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />} {label}
    </span>
  );
}
