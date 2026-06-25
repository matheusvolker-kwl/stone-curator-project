import { formatBRL } from "@/lib/catalog/client";
import { Check } from "lucide-react";

interface Props {
  subtotal: number;
  minimum: number;
}

export default function FreeShippingProgress({ subtotal, minimum }: Props) {
  const meets = subtotal >= minimum;
  const progress = Math.min(100, (subtotal / minimum) * 100);
  const remaining = Math.max(0, minimum - subtotal);

  return (
    <div>
      <div className="flex justify-between items-center text-spec mb-2 gap-3">
        <span
          className={`text-xs ${
            meets ? "text-western-gold-soft" : "text-western-cream-muted"
          }`}
        >
          {meets ? (
            <span className="inline-flex items-center gap-1.5">
              <Check className="h-3 w-3" /> Pronto para fechar pedido
            </span>
          ) : (
            <>
              Faltam <span className="text-western-cream">{formatBRL(remaining)}</span> para o pedido mínimo
            </>
          )}
        </span>
        <span className="text-western-cream-muted text-xs tabular-nums">
          {Math.round(progress)}%
        </span>
      </div>
      <div className="h-1 bg-western-gold/15 relative overflow-hidden rounded-sm">
        <div
          className={`h-full transition-all duration-700 ${
            meets ? "bg-western-gold-soft" : "bg-western-gold"
          }`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
