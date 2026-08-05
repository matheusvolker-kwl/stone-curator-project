import { useEffect, useState } from "react";

/**
 * Quantidade DIGITÁVEL entre os botões −/+ (carrinho, drawer e PDP).
 * Visual idêntico ao <span> que substituiu: só dígitos enquanto digita,
 * commit no blur/Enter com clamp 1–999, vazio volta ao valor anterior.
 */
export default function QtyInput({
  value,
  onCommit,
  ariaLabel,
  className = "",
  disabled = false,
}: {
  value: number;
  onCommit: (n: number) => void;
  ariaLabel: string;
  className?: string;
  disabled?: boolean;
}) {
  const [draft, setDraft] = useState(String(value));

  useEffect(() => {
    setDraft(String(value));
  }, [value]);

  const commit = () => {
    if (draft.trim() === "") {
      setDraft(String(value));
      return;
    }
    const n = Math.min(999, Math.max(1, parseInt(draft, 10) || 1));
    setDraft(String(n));
    if (n !== value) onCommit(n);
  };

  return (
    <input
      type="text"
      inputMode="numeric"
      pattern="[0-9]*"
      value={draft}
      disabled={disabled}
      aria-label={ariaLabel}
      onFocus={(e) => e.currentTarget.select()}
      onChange={(e) => setDraft(e.target.value.replace(/\D/g, "").slice(0, 3))}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          e.currentTarget.blur();
        }
      }}
      className={`bg-transparent border-0 outline-none focus:outline-none focus-visible:ring-1 focus-visible:ring-western-gold rounded-sm ${className}`}
    />
  );
}
