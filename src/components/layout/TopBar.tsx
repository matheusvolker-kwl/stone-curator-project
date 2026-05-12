import { ShieldCheck, Truck, Box, X } from "lucide-react";
import { useEffect, useState } from "react";
import { BUSINESS } from "@/config/business";

const items = [
  { Icon: ShieldCheck, text: `Pedido mínimo ${BUSINESS.pedidoMinimoLabel} — exclusivo B2B` },
  { Icon: Truck, text: "Produção em 15 dias úteis após confirmação" },
  { Icon: Box, text: "Modelos 3D · +300 mil downloads no SketchUp Warehouse" },
];

const STORAGE_KEY = "western:topbar-dismissed-v1";

export default function TopBar() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    try {
      if (localStorage.getItem(STORAGE_KEY) === "1") setVisible(false);
    } catch {
      /* ignore */
    }
  }, []);

  const dismiss = () => {
    setVisible(false);
    try {
      localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      /* ignore */
    }
  };

  if (!visible) return null;

  return (
    <div className="bg-western-green-deep text-western-cream-muted border-b border-western-gold/15">
      <div className="container-western relative flex items-center justify-between py-2 gap-6 overflow-hidden">
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
        {/* Mobile — marquee horizontal */}
        <div className="md:hidden w-full overflow-hidden pr-7">
          <div className="flex w-max animate-marquee-x gap-10 whitespace-nowrap motion-reduce:animate-none">
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
        <button
          onClick={dismiss}
          aria-label="Fechar barra de avisos"
          className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-western-cream-muted hover:text-western-gold-soft transition-colors"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
