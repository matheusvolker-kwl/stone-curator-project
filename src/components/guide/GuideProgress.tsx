import { motion } from "framer-motion";

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
  const pct = total > 0 ? Math.round(((current - 0.5) / total) * 100) : 0;

  return (
    <div className="mb-10">
      {/* Mobile: contador + barra fina */}
      <div className="md:hidden mb-3">
        <div className="flex items-center justify-between mb-2">
          <p className="text-eyebrow">
            Etapa {current} de {total}
            {steps[currentIdx] && (
              <span className="ml-2 text-western-stone-warm/60 normal-case tracking-normal">
                · {steps[currentIdx].label}
              </span>
            )}
          </p>
          <span className="font-mono text-[10px] text-western-stone-warm/60">
            {Math.max(0, pct)}%
          </span>
        </div>
        <div className="h-[2px] w-full bg-western-stone-warm/15 overflow-hidden">
          <motion.div
            className="h-full bg-western-gold"
            initial={false}
            animate={{ width: `${Math.max(4, pct)}%` }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          />
        </div>
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
                aria-current={s.current ? "step" : undefined}
                className={`group flex items-center gap-3 ${s.onClick ? "cursor-pointer" : "cursor-default"}`}
              >
                <motion.span
                  key={s.current ? "active" : s.done ? "done" : "pending"}
                  initial={s.current ? { scale: 0.7 } : false}
                  animate={s.current ? { scale: [0.7, 1.25, 1] } : { scale: 1 }}
                  transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  className={`flex items-center justify-center h-7 w-7 rounded-full font-mono text-[11px] transition-colors ${
                    s.current
                      ? "bg-western-gold text-western-green-deep ring-4 ring-western-gold/20 shadow-[0_0_0_4px_rgba(184,146,79,0.12)]"
                      : s.done
                        ? "bg-western-green-deep text-western-cream"
                        : "border border-western-stone-warm/30 text-western-stone-warm/60"
                  }`}
                >
                  {i + 1}
                </motion.span>
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
                <div className="flex-1 h-px bg-western-stone-warm/20 relative overflow-hidden">
                  <motion.span
                    initial={false}
                    animate={{ width: s.done ? "100%" : "0%" }}
                    transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                    className="absolute inset-y-0 left-0 bg-western-gold"
                  />
                </div>
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
