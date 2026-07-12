import { Clock, MapPin, ShieldCheck } from "lucide-react";
import { BUSINESS } from "@/config/business";

interface Props {
  /** "minimal" = só os dois sinais principais. "full" = adiciona garantia. */
  variant?: "minimal" | "full";
}

export default function DeliverySignals({ variant = "minimal" }: Props) {
  const base = [
    { Icon: Clock, label: `Pronto em ${BUSINESS.prazoProducaoDias} dias úteis` },
    {
      Icon: MapPin,
      label: `Retirada no ateliê · ${BUSINESS.cidadeAtelie}/${BUSINESS.ufAtelie}`,
    },
  ];
  const extra = [
    { Icon: ShieldCheck, label: `Garantia ${BUSINESS.garantiaLabel}` },
  ];
  const items = variant === "full" ? [...base, ...extra] : base;
  const gridCols =
    variant === "full"
      ? "grid-cols-1 sm:grid-cols-3"
      : "grid-cols-1 sm:grid-cols-2";
  return (
    <ul className={`grid ${gridCols} gap-x-4 gap-y-2`}>
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
  );
}
