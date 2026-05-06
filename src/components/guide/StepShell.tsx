import { ArrowLeft, RotateCcw } from "lucide-react";

interface StepShellProps {
  pergunta: string;
  subtitulo?: string;
  onBack?: () => void;
  onReset: () => void;
  children: React.ReactNode;
  stepKey: string | number;
}

export default function StepShell({
  pergunta,
  subtitulo,
  onBack,
  onReset,
  children,
  stepKey,
}: StepShellProps) {
  return (
    <div key={stepKey} className="animate-in fade-in slide-in-from-bottom-2 duration-400">
      <div className="flex items-start justify-between gap-6 mb-8">
        <div className="max-w-2xl">
          <h2 className="font-display text-3xl md:text-4xl text-western-green-deep leading-tight mb-3">
            {pergunta}
          </h2>
          {subtitulo && (
            <p className="text-western-stone-warm leading-relaxed">{subtitulo}</p>
          )}
        </div>
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="hidden md:inline-flex shrink-0 items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-western-stone-warm hover:text-western-green-deep transition-colors mt-2"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Voltar
          </button>
        )}
      </div>

      {children}

      <div className="mt-12 pt-6 border-t border-western-stone-warm/15 flex flex-wrap items-center justify-between gap-4">
        {onBack ? (
          <button
            type="button"
            onClick={onBack}
            className="md:hidden inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-western-stone-warm hover:text-western-green-deep transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Voltar
          </button>
        ) : <span />}
        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-western-stone-warm hover:text-western-green-deep transition-colors ml-auto"
        >
          <RotateCcw className="h-3.5 w-3.5" /> Reiniciar guia
        </button>
      </div>
    </div>
  );
}
