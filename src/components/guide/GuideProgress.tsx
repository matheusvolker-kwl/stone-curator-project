interface ProgressStep {
  key: string;
  label: string;
  value?: string;
  done: boolean;
  current: boolean;
  onClick?: () => void;
}

interface Props {
  steps: ProgressStep[];
}

export default function GuideProgress({ steps }: Props) {
  const currentIdx = steps.findIndex((s) => s.current);
  const total = steps.length;
  const current = currentIdx >= 0 ? currentIdx + 1 : steps.filter((s) => s.done).length;

  return (
    <div className="mb-10">
      {/* Mobile: contador simples */}
      <div className="flex items-center justify-between md:hidden mb-3">
        <p className="text-eyebrow">
          Etapa {current} de {total}
        </p>
      </div>

      {/* Desktop: trilha visual */}
      <ol className="hidden md:flex items-center gap-3 mb-4">
        {steps.map((s, i) => {
          const isLast = i === steps.length - 1;
          return (
            <li key={s.key} className="flex items-center gap-3 flex-1">
              <button
                type="button"
                onClick={s.onClick}
                disabled={!s.onClick}
                className={`group flex items-center gap-3 ${s.onClick ? "cursor-pointer" : "cursor-default"}`}
              >
                <span
                  className={`flex items-center justify-center h-7 w-7 rounded-full font-mono text-[11px] transition-all ${
                    s.current
                      ? "bg-western-gold text-western-green-deep ring-4 ring-western-gold/20"
                      : s.done
                        ? "bg-western-green-deep text-western-cream"
                        : "border border-western-stone-warm/30 text-western-stone-warm/60"
                  }`}
                >
                  {i + 1}
                </span>
                <span
                  className={`font-mono text-[10px] uppercase tracking-[0.2em] transition-colors ${
                    s.current
                      ? "text-western-green-deep"
                      : s.done
                        ? "text-western-stone-warm group-hover:text-western-gold"
                        : "text-western-stone-warm/50"
                  }`}
                >
                  {s.label}
                </span>
              </button>
              {!isLast && (
                <span
                  className={`flex-1 h-px ${
                    s.done ? "bg-western-gold" : "bg-western-stone-warm/20"
                  }`}
                />
              )}
            </li>
          );
        })}
      </ol>

      {/* Breadcrumb das respostas (todas as plataformas) */}
      {steps.some((s) => s.value) && (
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-western-stone-warm">
          {steps
            .filter((s) => s.value)
            .map((s, i, arr) => (
              <span key={s.key} className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={s.onClick}
                  disabled={!s.onClick}
                  className={`${s.onClick ? "hover:text-western-gold transition-colors" : ""}`}
                >
                  {s.value}
                </button>
                {i < arr.length - 1 && <span className="text-western-stone-warm/40">·</span>}
              </span>
            ))}
        </div>
      )}
    </div>
  );
}
