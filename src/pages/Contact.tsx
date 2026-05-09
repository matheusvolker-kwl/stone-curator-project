import { BUSINESS } from "@/config/business";

export default function Contact() {
  return (
    <div className="surface-ivory">
      <div className="container-western py-20 md:py-28 max-w-4xl">
        <p className="text-eyebrow mb-5">Contato</p>
        <div className="w-12 h-px bg-western-gold mb-8" />
        <h1 className="font-display text-4xl md:text-6xl text-western-green-deep leading-[1.05] mb-12">
          Para falar com a fábrica.
        </h1>

        <div className="grid sm:grid-cols-2 gap-10 mt-16">
          {[
            { eyebrow: "WhatsApp", value: BUSINESS.whatsappLabel, href: `https://wa.me/${BUSINESS.whatsappFabrica}` },
            { eyebrow: "Instagram", value: "@westernpools", href: "https://instagram.com/westernpools" },
            { eyebrow: "E-mail", value: BUSINESS.emailComercial, href: `mailto:${BUSINESS.emailComercial}` },
            { eyebrow: "Modelos 3D", value: "SketchUp 3D Warehouse →", href: BUSINESS.sketchupWarehouse },
          ].map((c) => (
            <div key={c.eyebrow} className="border-t border-western-stone-warm/20 pt-8">
              <p className="text-eyebrow mb-3">{c.eyebrow}</p>
              <a
                href={c.href}
                target="_blank"
                rel="noopener noreferrer"
                className="font-display text-2xl md:text-3xl text-western-green-deep hover:text-western-gold transition-colors link-underline"
              >
                {c.value}
              </a>
            </div>
          ))}
          <div className="border-t border-western-stone-warm/20 pt-8 sm:col-span-2">
            <p className="text-eyebrow mb-3">Ateliê</p>
            <p className="text-western-green-deep text-lg leading-relaxed">
              {BUSINESS.enderecoAtelieCompleto} · Brasil <br />
              {BUSINESS.horarioAtelie} · Retirada gratuita mediante agendamento.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
