import { Truck, Clock, MapPin } from "lucide-react";
import { BUSINESS } from "@/config/business";

export default function DeliverySignals() {
  const items = [
    { Icon: Truck, label: "Frete cotado por região" },
    { Icon: Clock, label: `Pronto em ${BUSINESS.prazoProducaoDias} dias úteis` },
    { Icon: MapPin, label: `Retira grátis em ${BUSINESS.cidadeAtelie}/${BUSINESS.ufAtelie}` },
  ];
  return (
    <ul className="grid grid-cols-1 sm:grid-cols-3 gap-x-4 gap-y-2">
      {items.map(({ Icon, label }) => (
        <li
          key={label}
          className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-western-stone-warm"
        >
          <Icon className="h-3.5 w-3.5 text-western-gold flex-shrink-0" />
          <span className="leading-tight">{label}</span>
        </li>
      ))}
    </ul>
  );
}
