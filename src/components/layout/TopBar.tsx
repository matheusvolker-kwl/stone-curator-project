import { ShieldCheck, Truck, Box, X } from "lucide-react";
import { useEffect, useState } from "react";

/**
 * DS V3: faixa institucional (verde escuro é permitido aqui — é faixa pontual,
 * não tela de compra). Texto 14px sentence case: o mono 10px caixa-alta com
 * tracking largo era ilegível para o público 40+ e é proibido pelo sistema.
 *
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
    <div className="surface-forest border-b border-western-gold/15">
      {/* pr-12 reserva a faixa do botão ✕ — nenhum texto passa por baixo dele */}
      <div className="container-western relative flex items-center min-h-[46px] py-2 pr-12 overflow-hidden">
        {/* Desktop: 3 avisos (o 3º só quando há largura de sobra) */}
        <ul className="hidden md:flex items-center justify-center gap-8 lg:gap-10 mx-auto min-w-0">
          {items.map(({ Icon, text }, i) => (
            <li
              key={i}
              className={`flex items-center gap-2 text-[14px] text-western-cream-muted whitespace-nowrap ${
                i === 2 ? "hidden lg:flex" : ""
              }`}
            >
              <Icon className="h-[18px] w-[18px] text-western-gold-soft shrink-0" strokeWidth={1.75} />
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
                className="inline-flex items-center gap-2 text-[14px] text-western-cream-muted"
              >
                <Icon className="h-[18px] w-[18px] text-western-gold-soft shrink-0" strokeWidth={1.75} />
                {text}
              </span>
            ))}
          </div>
          <div className="pointer-events-none absolute top-0 right-0 h-full w-10 bg-gradient-to-l from-western-green-deep to-transparent" />
        </div>

        {/* Mobile + movimento reduzido: 1 aviso curto, inteiro (sem marquee, sem corte) */}
        <div className="hidden motion-reduce:flex md:motion-reduce:hidden w-full min-w-0 items-center gap-2 text-[14px] text-western-cream-muted">
          <ShieldCheck className="h-[18px] w-[18px] text-western-gold-soft shrink-0" strokeWidth={1.75} />
          <span className="truncate">{items[0].curto}</span>
        </div>

        {/* Ícone mudo é permitido só em fechar/setas (DS) — alvo de 48px mesmo
            com a faixa mais baixa: o botão transborda a barra sem ocupar layout. */}
        <button
          onClick={dismiss}
          aria-label="Fechar barra de avisos"
          className="absolute right-0 top-1/2 -translate-y-1/2 inline-flex items-center justify-center h-12 w-12 rounded-[6px] text-western-cream-muted hover:text-western-gold-soft transition-colors"
        >
          <X className="h-[18px] w-[18px]" strokeWidth={1.75} />
        </button>
      </div>
    </div>
  );
}
