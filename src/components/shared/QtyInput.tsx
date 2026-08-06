import { useEffect, useState } from "react";

interface Props {
  value: number;
  onCommit: (n: number) => void;
  disabled?: boolean;
  ariaLabel: string;
  className?: string;
}

/**
 * Campo digitável que vive ENTRE os botões −/+ dos steppers (pedido do dono,
 * item 4 da lista de 05/08: quantificar 28 peças no "+" era tortura).
 * Commit a cada dígito válido (≥1); vazio/zero não commita — no blur o campo
 * volta ao valor real do carrinho, então apagar tudo nunca remove o item.
 */
export default function QtyInput({ value, onCommit, disabled, ariaLabel, className }: Props) {
  const [draft, setDraft] = useState(String(value));
  useEffect(() => setDraft(String(value)), [value]);
  return (
    <input
      type="text"
      inputMode="numeric"
      pattern="[0-9]*"
      value={draft}
      disabled={disabled}
      aria-label={ariaLabel}
      className={className}
      onFocus={(e) => e.currentTarget.select()}
      onChange={(e) => {
        const s = e.target.value.replace(/\D/g, "").slice(0, 4);
        setDraft(s);
        const n = parseInt(s, 10);
        if (!Number.isNaN(n) && n >= 1) onCommit(n);
      }}
      onBlur={() => {
        const n = parseInt(draft, 10);
        if (Number.isNaN(n) || n < 1) setDraft(String(value));
      }}
    />
  );
}
