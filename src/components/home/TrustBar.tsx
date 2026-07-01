import { Truck, Lock, ShieldCheck, Headset } from "lucide-react";

const ITEMS = [
  { Icon: Truck, t: "Envio pra todo o Brasil", d: "Transportadora ou retirada em Cajamar/SP." },
  { Icon: Lock, t: "Pagamento seguro", d: "Pix, boleto e cartão em até 6× sem juros." },
  { Icon: ShieldCheck, t: "Ambiente 100% seguro", d: "Site B2B com credenciamento por CNPJ." },
  { Icon: Headset, t: "Atendimento especializado", d: "Suporte técnico direto do ateliê." },
];

export default function TrustBar() {
  return (
    <section className="bg-western-ivory border-t border-western-stone-warm/15">
      <div className="container-western grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 py-8 md:py-10">
        {ITEMS.map(({ Icon, t, d }) => (
          <div key={t} className="flex items-start gap-3">
            <Icon className="h-5 w-5 text-western-gold mt-0.5 flex-shrink-0" strokeWidth={1.4} />
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-western-green-deep">
                {t}
              </p>
              <p className="text-xs text-western-stone-warm mt-1 leading-relaxed">{d}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
