import { ArrowLeft, RotateCcw } from "lucide-react";

interface StepShellProps {
  current: number;
  total: number;
  pergunta: string;
  onBack?: () => void;
  onReset: () => void;
  children: React.ReactNode;
}

export default function StepShell({
  current,
  total,
  pergunta,
  onBack,
  onReset,
  children,
}: StepShellProps) {
  return (
    <div key={current} className="animate-in fade-in duration-300">
      <div className="flex items-center justify-between mb-8">
        <p className="text-eyebrow">
          Etapa {current} de {total}
        </p>
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-western-stone-warm hover:text-western-green-deep transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Voltar
          </button>
        )}
      </div>

      <h2 className="font-display text-3xl md:text-4xl text-western-green-deep leading-tight mb-10 max-w-2xl">
        {pergunta}
      </h2>

      {children}

      <div className="mt-12 pt-6 border-t border-western-stone-warm/15">
        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-western-stone-warm hover:text-western-green-deep transition-colors"
        >
          <RotateCcw className="h-3.5 w-3.5" /> Reiniciar guia
        </button>
      </div>
    </div>
  );
}
