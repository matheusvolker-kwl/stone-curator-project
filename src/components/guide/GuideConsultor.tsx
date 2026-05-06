import { MessageCircle, RotateCcw } from "lucide-react";
import { tamanhoLabels, tipoLabels, whatsappConsultor, type Tipo } from "@/data/guideMap";

interface Props {
  tipo: Tipo;
  tamanho: string;
  onReset: () => void;
}

export default function GuideConsultor({ tipo, tamanho, onReset }: Props) {
  const faixa = tamanhoLabels[tamanho] ?? "";
  return (
    <div className="animate-in fade-in duration-300">
      <p className="text-eyebrow mb-5">Atendimento consultivo</p>
      <div className="w-12 h-px bg-western-gold mb-8" />
      <h2 className="font-display text-3xl md:text-5xl text-western-green-deep leading-tight mb-6">
        Seu projeto merece<br />atendimento personalizado
      </h2>
      <p className="text-western-stone-warm leading-relaxed text-lg max-w-2xl mb-10">
        Para projetos desta dimensão, nossa equipe monta uma composição autoral
        conforme o briefing, com curadoria de peças e proporções específicas.
        Fale diretamente com um consultor especificador.
      </p>

      <div className="text-sm text-western-stone-warm mb-10 space-y-1">
        <p>
          <span className="font-mono uppercase tracking-[0.15em] text-xs text-western-green-deep mr-2">Projeto</span>
          {tipoLabels[tipo]}
        </p>
        <p>
          <span className="font-mono uppercase tracking-[0.15em] text-xs text-western-green-deep mr-2">Área</span>
          {faixa}
        </p>
      </div>

      <div className="flex flex-wrap gap-4 items-center">
        <a
          href={whatsappConsultor(tipo, faixa)}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-gold"
        >
          <MessageCircle className="h-4 w-4" /> Falar com consultor
        </a>
        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-western-stone-warm hover:text-western-green-deep transition-colors"
        >
          <RotateCcw className="h-3.5 w-3.5" /> Refazer guia
        </button>
      </div>
    </div>
  );
}
