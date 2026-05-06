import { useEffect, useRef, useState } from "react";

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

  return (
    <div ref={sectionRef}>
      {/* Mobile progress indicator */}
      <div className="md:hidden flex gap-2 mb-5">
        {values.map((v) => (
          <span
            key={v}
            className={`h-px flex-1 transition-colors ${
              selected === v ? "bg-western-gold" : "bg-western-stone-warm/25"
            }`}
          />
        ))}
      </div>

      <div
        className="
          flex md:grid md:grid-cols-4 gap-4 md:gap-5
          overflow-x-auto md:overflow-visible
          snap-x snap-mandatory md:snap-none
          -mx-4 md:mx-0 px-4 md:px-0
          scrollbar-hide
        "
      >
        {values.map((val, idx) => {
          const meta = metaFor(val, idx);
          const isSelected = selected === val;
          return (
            <button
              key={val}
              onClick={() => onSelect(val)}
              className={`
                group relative text-left flex flex-col
                min-w-[78%] md:min-w-0 snap-start
                p-6 md:p-7
                border bg-western-cream/60
                transition-all duration-300
                hover:scale-[1.02] hover:shadow-sm
                ${
                  isSelected
                    ? "border-western-gold bg-western-gold/5 shadow-sm"
                    : "border-western-stone-warm/20 hover:border-western-gold/50"
                }
              `}
            >
              <div className="flex items-start justify-between mb-10 md:mb-14">
                <span
                  className={`font-mono text-xs tracking-[0.25em] transition-opacity ${
                    isSelected ? "opacity-100 text-western-gold" : "opacity-50 group-hover:opacity-100 text-western-stone-warm"
                  }`}
                >
                  {meta.num}
                </span>
                <span
                  key={isSelected ? `sel-${val}` : `idle-${val}`}
                  className={`
                    block w-10 h-10 rounded-full
                    ${visible ? "animate-swatch-fill" : "opacity-0"}
                    ${isSelected ? "animate-swatch-splash ring-2 ring-western-gold/40 ring-offset-2 ring-offset-western-cream" : "group-hover:animate-swatch-breathe"}
                  `}
                  style={{
                    backgroundColor: `hsl(${meta.swatch})`,
                    animationDelay: visible && !isSelected ? `${idx * 80}ms` : undefined,
                    boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.06)",
                  }}
                  aria-hidden
                />
              </div>
              <h4
                className={`font-display text-2xl md:text-3xl mb-3 transition-colors ${
                  isSelected ? "text-western-gold" : "text-western-green-deep"
                }`}
              >
                {val}
              </h4>
              {meta.hint && (
                <p className="text-sm leading-relaxed text-western-stone-warm">
                  {meta.hint}
                </p>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
