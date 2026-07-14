import { ShieldCheck, Truck, Box, X } from "lucide-react";
import { useEffect, useState } from "react";

/**
 * `curto` é o que aparece quando não há espaço (mobile com movimento reduzido,
 * onde o marquee não roda e a mensagem ficaria parada e cortada).
 */
const items = [
  {
    Icon: ShieldCheck,
    text: "Canal B2B — exclusivo para profissionais com CNPJ",
    curto: "Canal B2B · só com CNPJ",
  },
  {
    Icon: Truck,
    text: "Produção em 15 dias úteis após confirmação",
    curto: "Produção em 15 dias úteis",
  },
  {
    Icon: Box,
    // Sem "Warehouse": os 3 itens não cabiam em 1280px e o 3º corria por baixo do ✕.
    text: "Modelos 3D · +300 mil downloads no SketchUp",
    curto: "Modelos 3D no SketchUp",
  },
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
      {/* pr-11 reserva a faixa do botão ✕ — nenhum texto passa por baixo dele */}
      <div className="container-western relative flex items-center py-2 pr-11 overflow-hidden">
        {/* Desktop: 3 avisos (o 3º só quando há largura de sobra) */}
        <ul className="hidden md:flex items-center justify-center gap-8 lg:gap-10 mx-auto min-w-0">
          {items.map(({ Icon, text }, i) => (
            <li
              key={i}
              className={`flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] whitespace-nowrap ${
                i === 2 ? "hidden lg:flex" : ""
              }`}
            >
              <Icon className="h-3.5 w-3.5 text-western-gold-soft shrink-0" strokeWidth={1.4} />
              <span>{text}</span>
            </li>
          ))}
        </ul>

        {/* Mobile: marquee (só quando o movimento é permitido) */}
        <div className="md:hidden motion-reduce:hidden w-full overflow-hidden relative">
          <div className="flex w-max animate-marquee-x gap-10 whitespace-nowrap hover:[animation-play-state:paused] focus-within:[animation-play-state:paused]">
            {[...items, ...items].map(({ Icon, text }, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em]"
              >
                <Icon className="h-3.5 w-3.5 text-western-gold-soft shrink-0" strokeWidth={1.4} />
                {text}
              </span>
            ))}
          </div>
          <div className="pointer-events-none absolute top-0 right-0 h-full w-10 bg-gradient-to-l from-western-green-deep to-transparent" />
        </div>

        {/* Mobile + movimento reduzido: 1 aviso curto, inteiro (sem marquee, sem corte) */}
        <div className="hidden motion-reduce:flex md:motion-reduce:hidden w-full min-w-0 items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em]">
          <ShieldCheck className="h-3.5 w-3.5 text-western-gold-soft shrink-0" strokeWidth={1.4} />
          <span className="truncate">{items[0].curto}</span>
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
