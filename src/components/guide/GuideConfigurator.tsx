import { useEffect, useMemo, useState } from "react";
import { ArrowRight } from "lucide-react";
import { useCartStore } from "@/stores/cartStore";
import { complementosPorTipo, type ConjuntoLeaf, type GuideAnswers, type Tipo } from "@/data/guideMap";
import SectionConjunto from "./sections/SectionConjunto";
import SectionComplementos from "./sections/SectionComplementos";
import SectionAutorais from "./sections/SectionAutorais";
import FinalizarDrawer from "./FinalizarDrawer";

interface Props {
  conjunto: ConjuntoLeaf;
  answers: GuideAnswers;
  onAcabamentoChange: (a: string) => void;
  acabamento: string;
}

const SECTION_KEYS = ["conjunto", "complementos", "autorais"] as const;
type SectionKey = (typeof SECTION_KEYS)[number];

export default function GuideConfigurator({ conjunto, answers, acabamento, onAcabamentoChange }: Props) {
  const tipo = answers.tipo as Tipo | undefined;
  const hasComplementos = !!tipo && (complementosPorTipo[tipo]?.length ?? 0) > 0;
  const items = useCartStore((s) => s.items);
  const totalQty = items.reduce((acc, i) => acc + i.quantity, 0);
  const [finalOpen, setFinalOpen] = useState(false);
  const [active, setActive] = useState<SectionKey>("conjunto");

  // IntersectionObserver to highlight active section
  useEffect(() => {
    const sections = SECTION_KEYS.map((k) => document.getElementById(k)).filter(
      (el): el is HTMLElement => !!el
    );
    if (sections.length === 0) return;
    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]) setActive(visible[0].target.id as SectionKey);
      },
      { rootMargin: "-25% 0px -55% 0px", threshold: [0.1, 0.3, 0.6] }
    );
    sections.forEach((s) => obs.observe(s));
    return () => obs.disconnect();
  }, [hasComplementos]);

  const sectionList = useMemo(() => {
    const list: Array<{ key: SectionKey; label: string }> = [
      { key: "conjunto", label: "Conjunto" },
    ];
    if (hasComplementos) list.push({ key: "complementos", label: "Complementos" });
    list.push({ key: "autorais", label: "Itens autorais" });
    return list;
  }, [hasComplementos]);

  const goToSection = (key: SectionKey) => {
    const el = document.getElementById(key);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="space-y-12">
      {/* Mini-índice horizontal (mobile + desktop topo) */}
      <nav
        aria-label="Seções do configurador"
        className="sticky top-16 z-20 -mx-6 md:-mx-12 px-6 md:px-12 py-3 bg-western-cream/85 backdrop-blur-md border-b border-western-stone-warm/15"
      >
        <ul className="flex items-center gap-1 overflow-x-auto">
          {sectionList.map((s, idx) => (
            <li key={s.key} className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={() => goToSection(s.key)}
                aria-current={active === s.key ? "true" : undefined}
                className={`font-mono text-[10px] uppercase tracking-[0.2em] px-3 py-1.5 transition-colors ${
                  active === s.key
                    ? "bg-western-green-deep text-western-cream"
                    : "text-western-stone-warm hover:text-western-green-deep"
                }`}
              >
                <span className="text-western-gold/80 mr-1.5">{String(idx + 1).padStart(2, "0")}</span>
                {s.label}
              </button>
              {idx < sectionList.length - 1 && (
                <span className="text-western-stone-warm/40">·</span>
              )}
            </li>
          ))}
          <li className="ml-auto shrink-0">
            <button
              type="button"
              onClick={() => setFinalOpen(true)}
              disabled={items.length === 0}
              className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] px-3 py-1.5 bg-western-gold text-western-green-deep hover:bg-western-gold/90 transition-colors disabled:opacity-50"
            >
              Finalizar {totalQty > 0 && `(${totalQty})`} <ArrowRight className="h-3 w-3" />
            </button>
          </li>
        </ul>
      </nav>

      <SectionConjunto
        conjunto={conjunto}
        answers={answers}
        onAcabamentoChange={onAcabamentoChange}
      />

      {hasComplementos && tipo && <SectionComplementos tipo={tipo} />}

      <SectionAutorais />

      {/* CTA Final no fim da página */}
      <div className="border-t border-western-stone-warm/15 pt-10 text-center">
        <p className="text-eyebrow mb-3">Pronto para fechar</p>
        <h3 className="font-display text-2xl md:text-3xl text-western-green-deep leading-tight mb-4">
          Revise o orçamento e envie a proposta
        </h3>
        <p className="text-sm text-western-stone-warm mb-6 max-w-xl mx-auto">
          {totalQty > 0
            ? `${totalQty} ${totalQty === 1 ? "item curado" : "itens curados"} no projeto. Finalize para baixar a prancha técnica ou solicitar a proposta comercial.`
            : "Adicione ao menos o conjunto base para finalizar."}
        </p>
        <button
          type="button"
          onClick={() => setFinalOpen(true)}
          disabled={items.length === 0}
          className="btn-gold disabled:opacity-50"
        >
          Finalizar projeto <ArrowRight className="h-4 w-4" />
        </button>
      </div>

      <FinalizarDrawer
        open={finalOpen}
        onOpenChange={setFinalOpen}
        conjunto={conjunto}
        answers={answers}
        acabamento={acabamento}
      />
    </div>
  );
}
