import { ArrowRight } from "lucide-react";

interface Props {
  onConsultor: () => void;
}

export default function CustomPaintNote({ onConsultor }: Props) {
  return (
    <div className="mt-5 border border-dashed border-western-stone-warm/40 px-4 py-4">
      <p className="text-spec text-western-stone-warm leading-relaxed">
        Não encontra a tonalidade ideal? Fazemos pintura personalizada sob demanda,
        adaptada à biologia e à geologia do seu projeto.
      </p>
      <button
        onClick={onConsultor}
        className="mt-2 inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.22em] text-western-green-deep hover:text-western-gold transition-colors"
      >
        Falar com consultor <ArrowRight className="h-3 w-3" />
      </button>
    </div>
  );
}
