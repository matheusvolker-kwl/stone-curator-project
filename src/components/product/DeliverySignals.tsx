import { Truck, Clock, MapPin, ShieldCheck, Package } from "lucide-react";
import { BUSINESS } from "@/config/business";

interface Props {
  /** "minimal" = 3 ícones (default). "full" = adiciona linha com pedido mínimo + garantia. */
  variant?: "minimal" | "full";
}

export default function DeliverySignals({ variant = "minimal" }: Props) {
  const items = [
    { Icon: Truck, label: "Frete cotado por região" },
    { Icon: Clock, label: `Pronto em ${BUSINESS.prazoProducaoDias} dias úteis` },
    { Icon: MapPin, label: `Retira grátis em ${BUSINESS.cidadeAtelie}/${BUSINESS.ufAtelie}` },
  ];
  return (
    <div className="space-y-3">
      <ul className="grid grid-cols-1 sm:grid-cols-3 gap-x-4 gap-y-2">
        {items.map(({ Icon, label }) => (
          <li
            key={label}
            className="flex items-center gap-2 font-sans text-[12px] text-western-stone-warm/85"
          >
            <Icon className="h-3.5 w-3.5 text-western-stone-warm/60 flex-shrink-0" />
            <span className="leading-tight">{label}</span>
          </li>
        ))}
      </ul>
      {variant === "full" && (
        <ul className="flex flex-wrap items-center gap-x-5 gap-y-2 pt-3 border-t border-western-stone-warm/15">
          <li className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-western-stone-warm/85">
            <Package className="h-3 w-3 text-western-stone-warm/60 flex-shrink-0" />
            Pedido mínimo {BUSINESS.pedidoMinimoLabel}
          </li>
          <li className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-western-stone-warm/85">
            <ShieldCheck className="h-3 w-3 text-western-stone-warm/60 flex-shrink-0" />
            Garantia {BUSINESS.garantiaAnos} anos
          </li>
        </ul>
      )}
    </div>
  );
}
