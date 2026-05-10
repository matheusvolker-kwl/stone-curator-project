import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import GuideHeader from "@/components/guide-v2/GuideHeader";

export default function GuiaFinalizar() {
  return (
    <div className="min-h-screen bg-western-cream">
      <GuideHeader breadcrumb={{ label: "Voltar · Refinar", to: -1 as unknown as string }} />
      <main className="mx-auto max-w-[760px] px-6 md:px-8 pt-20 pb-32 text-center">
        <p className="text-eyebrow mb-4">Revisão final</p>
        <h1 className="font-display text-3xl md:text-[44px] text-western-green-deep leading-[1.1] mb-5">
          Pronto para enviar a proposta.
        </h1>
        <p className="font-display italic text-lg text-western-stone-warm leading-relaxed max-w-[520px] mx-auto">
          Esta etapa de checkout completo será conectada ao fluxo comercial. Por enquanto, você pode voltar e
          ajustar o projeto.
        </p>
        <Link to="/guia-de-composicao" className="btn-dark mt-10 inline-flex">
          <ArrowLeft className="h-4 w-4" /> Voltar ao guia
        </Link>
      </main>
    </div>
  );
}
