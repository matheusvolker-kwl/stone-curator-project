import { Star, ShieldCheck } from "lucide-react";

/**
 * Micro-prova social compacta — vive logo abaixo do CTA na PDP.
 * Reforça confiança no momento da decisão sem competir visualmente com o botão.
 */
export default function PurchaseProof() {
  return (
    <div className="border border-western-stone-warm/15 bg-western-paper/60 px-4 py-3.5 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-5">
      <div className="flex items-center gap-2.5">
        <div className="flex gap-0.5" aria-hidden="true">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} className="h-3.5 w-3.5 fill-western-gold text-western-gold" />
          ))}
        </div>
        <p className="font-sans text-[12.5px] text-western-green-deep leading-tight">
          Especificada por{" "}
          <span className="font-medium">Faisal</span>,{" "}
          <span className="font-medium">Hayasaki</span> e{" "}
          <span className="font-medium">Luidi</span>
        </p>
      </div>
      <div className="hidden sm:block w-px h-7 bg-western-stone-warm/20" />
      <div className="flex items-center gap-2 text-western-stone-warm">
        <ShieldCheck className="h-4 w-4 text-western-gold shrink-0" strokeWidth={1.6} />
        <p className="font-sans text-[12px] leading-tight">
          5 anos de garantia · troca sem custo em caso de avaria no transporte
        </p>
      </div>
    </div>
  );
}
