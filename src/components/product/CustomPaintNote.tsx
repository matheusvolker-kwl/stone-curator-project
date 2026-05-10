import { ChevronRight } from "lucide-react";

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
        className="mt-2 inline-flex items-center gap-1 text-sm text-western-green-deep hover:text-western-gold underline-offset-4 hover:underline transition-colors"
      >
        Falar com consultor <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}
