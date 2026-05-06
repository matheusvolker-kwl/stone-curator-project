import { ShieldCheck, Truck, CreditCard, Box } from "lucide-react";

const items = [
  { Icon: ShieldCheck, text: "Pedido mínimo R$ 2.000 — exclusivo B2B" },
  { Icon: Truck, text: "Produção em 15 dias úteis após confirmação" },
  { Icon: CreditCard, text: "Pagamento 100% antecipado · PIX, TED, boleto" },
  { Icon: Box, text: "Modelos 3D em SketchUp para todos os produtos" },
];

export default function TopBar() {
  return (
    <div className="bg-western-green-deep text-western-cream-muted border-b border-western-gold/15">
      <div className="container-western flex items-center justify-between py-2 gap-6 overflow-hidden">
        <ul className="hidden md:flex items-center gap-8 lg:gap-12 mx-auto">
          {items.map(({ Icon, text }, i) => (
            <li
              key={i}
              className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] whitespace-nowrap"
            >
              <Icon className="h-3.5 w-3.5 text-western-gold-soft" strokeWidth={1.4} />
              <span>{text}</span>
            </li>
          ))}
        </ul>
        {/* Mobile — rotação simples via marquee leve */}
        <div className="md:hidden w-full overflow-hidden">
          <div className="flex animate-[shimmer_18s_linear_infinite] gap-10 whitespace-nowrap">
            {[...items, ...items].map(({ Icon, text }, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em]"
              >
                <Icon className="h-3.5 w-3.5 text-western-gold-soft" strokeWidth={1.4} />
                {text}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
