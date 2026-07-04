import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { texturaPara } from "@/lib/acabamentoTexturas";


interface FinishMeta {
  num: string;
  swatch: string; // HSL triplet
  hint: string;
}

const FINISH_MAP: Record<string, FinishMeta> = {
  quartzo: {
    num: "01",
    swatch: "38 35% 86%",
    hint: "Para composições que pedem luz e contraste com folhagem densa.",
  },
  arenito: {
    num: "02",
    swatch: "32 36% 65%",
    hint: "Conversa com madeiras claras, palhas e paisagismo tropical.",
  },
  moledo: {
    num: "03",
    swatch: "20 30% 45%",
    hint: "Acabamento rústico nobre — referência direta à pedra brasileira.",
  },
  granito: {
    num: "04",
    swatch: "140 8% 22%",
    hint: "Profundidade e ancoragem para projetos contemporâneos e minerais.",
  },
};

function metaFor(value: string, idx: number): FinishMeta {
  const key = value.toLowerCase().trim().split(/\s+/)[0];
  const found = FINISH_MAP[key];
  if (found) return found;
  return {
    num: String(idx + 1).padStart(2, "0"),
    swatch: "30 12% 55%",
    hint: "",
  };
}

interface Props {
  values: string[];
  selected: string | null;
  onSelect: (val: string) => void;
}

export default function FinishSelector({ values, selected, onSelect }: Props) {
  const sectionRef = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setVisible(true);
            obs.disconnect();
          }
        });
      },
      { threshold: 0.2 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const selectedMeta =
    selected != null
      ? metaFor(selected, values.findIndex((v) => v === selected))
      : null;

  const handleKey = (e: KeyboardEvent<HTMLButtonElement>, idx: number) => {
    if (values.length === 0) return;
    let next = idx;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      next = (idx + 1) % values.length;
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      next = (idx - 1 + values.length) % values.length;
    } else if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      onSelect(values[idx]);
      return;
    } else {
      return;
    }
    e.preventDefault();
    onSelect(values[next]);
    const group = e.currentTarget.parentElement;
    const radios = group?.querySelectorAll<HTMLButtonElement>('[role="radio"]');
    radios?.[next]?.focus();
  };

  return (
    <div ref={sectionRef}>
      <div className="grid grid-cols-2 gap-2.5" role="radiogroup" aria-label="Acabamento">
        {values.map((val, idx) => {
          const meta = metaFor(val, idx);
          const isSelected = selected === val;
          const isBestseller = /moledo/i.test(val);
          return (
            <button
              key={val}
              type="button"
              role="radio"
              aria-checked={isSelected}
              tabIndex={isSelected ? 0 : selected == null && idx === 0 ? 0 : -1}
              onKeyDown={(e) => handleKey(e, idx)}
              onClick={() => onSelect(val)}
              className={`
                group relative text-left flex items-center gap-3
                px-3.5 py-3
                border bg-western-cream/40
                transition-all duration-300
                ${
                  isSelected
                    ? "border-western-gold bg-western-gold/5"
                    : "border-western-stone-warm/25 hover:border-western-gold/60"
                }
              `}
            >

              {isBestseller && (
                <span className="absolute -top-2 -right-2 px-1.5 py-0.5 bg-western-gold text-western-green-deep font-mono text-[8px] uppercase tracking-[0.18em] leading-none rounded-sm shadow-sm">
                  + vendido
                </span>
              )}
              <span
                key={isSelected ? `sel-${val}` : `idle-${val}`}
                className={`
                  flex-shrink-0 block w-7 h-7 rounded-full bg-cover bg-center
                  ${visible ? "animate-swatch-fill" : "opacity-0"}
                  ${isSelected ? "animate-swatch-splash ring-2 ring-western-gold/50 ring-offset-2 ring-offset-western-cream" : "group-hover:animate-swatch-breathe"}
                `}
                style={{
                  backgroundColor: `hsl(${meta.swatch})`,
                  backgroundImage: texturaPara(val) ? `url(${texturaPara(val)})` : undefined,
                  animationDelay: visible && !isSelected ? `${idx * 80}ms` : undefined,
                  boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.08)",
                }}
                aria-hidden
              />

              <div className="flex flex-col min-w-0">
                <span
                  className={`font-mono text-[9px] tracking-[0.22em] transition-opacity ${
                    isSelected ? "opacity-100 text-western-gold" : "opacity-50 group-hover:opacity-100 text-western-stone-warm"
                  }`}
                >
                  {meta.num}
                </span>
                <span
                  className={`font-display text-base leading-tight transition-colors ${
                    isSelected ? "text-western-gold" : "text-western-green-deep"
                  }`}
                >
                  {val}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {selectedMeta?.hint && (
        <p
          key={selected}
          className="mt-3 text-xs leading-relaxed text-western-stone-warm italic animate-fade-in"
        >
          {selectedMeta.hint}
        </p>
      )}
    </div>
  );
}
