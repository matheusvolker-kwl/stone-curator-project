import { cn } from "@/lib/utils";

/**
 * Abas-segmento com contagem: "Pendentes 7 · Aprovados 42".
 *
 *   const [aba, setAba] = useState<"pendentes" | "decididos">("pendentes");
 *
 *   <Tabs
 *     abas={[
 *       { key: "pendentes", label: "Pendentes", count: 7 },
 *       { key: "decididos", label: "Decididos", count: 42 },
 *     ]}
 *     ativa={aba}
 *     onChange={setAba}
 *   />
 *
 * A contagem é o ponto: uma aba "Pendentes" sem número não diz ao dono se ele
 * precisa agir. `count` opcional — omita quando ainda estiver carregando (não
 * mostre 0; 0 e "não sei ainda" são coisas diferentes).
 */

export interface Aba<K extends string = string> {
  key: K;
  label: string;
  /** Omita enquanto carrega. Não passe 0 para significar "desconhecido". */
  count?: number;
}

interface Props<K extends string> {
  abas: ReadonlyArray<Aba<K>>;
  ativa: K;
  onChange: (key: K) => void;
  className?: string;
}

export function Tabs<K extends string>({ abas, ativa, onChange, className }: Props<K>) {
  return (
    <div
      role="tablist"
      aria-orientation="horizontal"
      className={cn(
        "inline-flex items-center gap-1 rounded-[10px] border border-western-border-soft bg-western-paper p-1",
        "max-w-full overflow-x-auto scrollbar-hide",
        className,
      )}
    >
      {abas.map((aba) => {
        const selecionada = aba.key === ativa;
        return (
          <button
            key={aba.key}
            type="button"
            role="tab"
            aria-selected={selecionada}
            onClick={() => onChange(aba.key)}
            className={cn(
              "tap-target inline-flex flex-shrink-0 items-center gap-2 rounded-[6px] px-4",
              "text-[16px] font-semibold transition-colors",
              selecionada
                ? "bg-white text-western-green-deep shadow-[0_1px_2px_rgba(0,0,0,0.06)]"
                : "text-western-stone-warm hover:text-western-green-deep",
            )}
          >
            <span>{aba.label}</span>
            {aba.count !== undefined && (
              <span
                className={cn(
                  "inline-flex min-w-[22px] items-center justify-center rounded-[6px] px-1.5 py-0.5",
                  "text-[14px] font-semibold tabular-nums leading-none",
                  selecionada
                    ? "bg-western-cta text-western-cream"
                    : "bg-western-border-soft text-western-stone-warm",
                )}
              >
                {aba.count > 999 ? "999+" : aba.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
