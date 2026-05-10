import { useEffect, useMemo, useState } from "react";
import { ArrowRight } from "lucide-react";
import { useCartStore } from "@/stores/cartStore";
import { complementosPorTipo, type ConjuntoLeaf, type GuideAnswers, type Tipo } from "@/data/guideMap";
import ConjuntoHero from "./sections/ConjuntoHero";
import ConjuntoUpgrade from "./sections/ConjuntoUpgrade";
import SectionComplementos from "./sections/SectionComplementos";
import SectionAutorais from "./sections/SectionAutorais";
import FinalizarDrawer from "./FinalizarDrawer";

interface Props {
  conjunto: ConjuntoLeaf;
  answers: GuideAnswers;
  onAcabamentoChange: (a: string) => void;
  acabamento: string;
}

const ALL_KEYS = ["upgrade", "complementos", "autorais"] as const;
type SectionKey = (typeof ALL_KEYS)[number];

export default function GuideConfigurator({ conjunto, answers, acabamento, onAcabamentoChange }: Props) {
  const tipo = answers.tipo as Tipo | undefined;
  const hasComplementos = !!tipo && (complementosPorTipo[tipo]?.length ?? 0) > 0;
  const items = useCartStore((s) => s.items);
  const totalQty = items.reduce((acc, i) => acc + i.quantity, 0);
  const [finalOpen, setFinalOpen] = useState(false);
  const [active, setActive] = useState<SectionKey>("upgrade");

  const sectionList = useMemo(() => {
    const list: Array<{ key: SectionKey; label: string }> = [
      { key: "upgrade", label: "Patamar acima" },
    ];
    if (hasComplementos) list.push({ key: "complementos", label: "Complementos" });
    list.push({ key: "autorais", label: "Itens autorais" });
    return list;
  }, [hasComplementos]);

  useEffect(() => {
    const sections = sectionList
      .map((s) => document.getElementById(s.key))
      .filter((el): el is HTMLElement => !!el);
    if (sections.length === 0) return;
    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]) setActive(visible[0].target.id as SectionKey);
      },
      { rootMargin: "-30% 0px -55% 0px", threshold: [0.1, 0.3, 0.6] }
    );
    sections.forEach((s) => obs.observe(s));
    return () => obs.disconnect();
  }, [sectionList]);

  const goToSection = (key: SectionKey) => {
    const el = document.getElementById(key);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="space-y-6">
      {/* Mini-índice horizontal sticky */}
      <nav
        aria-label="Seções do configurador"
        className="sticky top-16 z-20 -mx-6 md:-mx-8 px-6 md:px-8 py-3 bg-western-cream/85 backdrop-blur-md border-b border-western-stone-warm/15"
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

      {/* Cockpit: hero sticky + add-ons rolando */}
      <div className="grid lg:grid-cols-[minmax(0,340px)_1fr] gap-8 items-start">
        <ConjuntoHero
          conjunto={conjunto}
          answers={answers}
          onAcabamentoChange={onAcabamentoChange}
        />

        <div className="space-y-12 min-w-0">
          <ConjuntoUpgrade conjunto={conjunto} answers={answers} acabamento={acabamento} />

          {hasComplementos && tipo && <SectionComplementos tipo={tipo} />}

          <SectionAutorais />

          {/* CTA final */}
          <div className="border-t border-western-stone-warm/15 pt-8 text-center">
            <p className="text-eyebrow mb-3">Pronto para fechar</p>
            <h3 className="font-display text-xl md:text-2xl text-western-green-deep leading-tight mb-3">
              Revise o orçamento e envie a proposta
            </h3>
            <p className="text-sm text-western-stone-warm mb-5 max-w-xl mx-auto">
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
        </div>
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
