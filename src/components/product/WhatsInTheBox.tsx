import { Package, Paintbrush, FileText } from "lucide-react";

export default function WhatsInTheBox() {
  const items = [
    {
      Icon: Package,
      title: "Peça pronta para instalar",
      desc: "Acabamento finalizado, embalada com proteção para transporte.",
    },
    {
      Icon: Paintbrush,
      title: "Kit de retoque incluso",
      desc: "Pintura mineral na mesma cor da peça, para eventuais reparos.",
    },
    {
      Icon: FileText,
      title: "Manual de fixação",
      desc: "Instruções passo a passo. Fixação com argamassa C3 (encontrada em qualquer loja de material de construção).",
    },
  ];

  return (
    <div className="mt-8 bg-western-cream/60 border border-western-stone-warm/15 px-5 py-6 md:px-7 md:py-7">
      <p className="text-eyebrow mb-5">O que vem na caixa</p>
      <div className="grid gap-5 md:grid-cols-3">
        {items.map(({ Icon, title, desc }) => (
          <div key={title} className="flex md:flex-col gap-3">
            <Icon
              className="h-5 w-5 flex-shrink-0 text-western-green-deep mt-0.5"
              strokeWidth={1.5}
              aria-hidden="true"
            />
            <div>
              <p className="font-sans font-medium text-[14px] text-western-green-deep leading-snug">
                {title}
              </p>
              <p className="font-sans text-[13px] text-western-stone-warm leading-relaxed mt-1">
                {desc}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
