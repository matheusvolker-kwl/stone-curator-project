import { Check, ArrowRight, AlertTriangle } from "lucide-react";
import { Link } from "react-router-dom";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";
import ManualDownload from "@/components/product/ManualDownload";
import type { InstallationConfig } from "@/data/installation";

const ANCHOR_ID = "instalacao";

/**
 * Rolagem suave até a seção de instalação da PDP.
 * Usada tanto pelo strip (acima) quanto por eventuais links externos.
 */
function scrollToInstallation(e: React.MouseEvent) {
  e.preventDefault();
  const el = document.getElementById(ANCHOR_ID);
  if (!el) return;
  el.scrollIntoView({ behavior: "smooth", block: "start" });
}

// ─────────────────────────────────────────────────────────────────────────────
// 1) TIRA DE CONFIANÇA — compacta, para logo abaixo do CTA
// ─────────────────────────────────────────────────────────────────────────────
export function InstallationTrustStrip({
  config,
  className,
}: {
  config: InstallationConfig;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-x-3 gap-y-1 rounded-lg border border-western-border-soft bg-western-paper/60 px-4 py-2",
        className,
      )}
    >
      {/* Selo bronze: o dourado não bate contraste sobre fundo claro (DS V3). */}
      <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-western-bronze/10 text-western-bronze">
        <Check className="h-4 w-4" strokeWidth={2.5} aria-hidden="true" />
      </span>
      <span className="font-sans text-[16px] font-semibold text-western-green-deep">
        Guia de instalação
      </span>
      <span className="font-sans text-[14px] text-western-stone-warm">
        Nível {config.level} de 4 · {config.levelLabel}
      </span>
      <a
        href={`#${ANCHOR_ID}`}
        onClick={scrollToInstallation}
        className="ml-auto inline-flex min-h-tap items-center gap-1.5 font-sans text-[16px] font-semibold text-western-green-deep underline-offset-4 transition-colors hover:underline"
      >
        Ver como
        <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </a>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Barrinhas de nível (4 barras, preenchidas conforme o nível)
// ─────────────────────────────────────────────────────────────────────────────
function LevelBars({ level }: { level: number }) {
  return (
    <div className="flex items-center gap-1" aria-hidden="true">
      {[1, 2, 3, 4].map((i) => (
        <span
          key={i}
          className={cn(
            "h-2.5 w-7 rounded-sm transition-colors",
            i <= level ? "bg-western-bronze" : "bg-western-border-soft",
          )}
        />
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 2) SEÇÃO INSTALAÇÃO — completa, com âncora #instalacao
//    Todo o conteúdo vem do capítulo correspondente do Manual de Instalação.
// ─────────────────────────────────────────────────────────────────────────────
export function InstallationSection({
  config,
  pieceName,
  lineHandle,
  origem,
}: {
  config: InstallationConfig;
  /** Nome da peça/conjunto — acompanha o lead do download do manual. */
  pieceName?: string;
  /** Handle da linha/coleção — acompanha o lead do download do manual. */
  lineHandle?: string;
  /** Origem do lead (default: PDP). */
  origem?: string;
}) {
  const {
    level,
    levelLabel,
    subtitle,
    facts,
    reassure,
    stepsLabel,
    steps,
    warnings,
    chapter,
    chapterTitle,
    manualPage,
  } = config;

  return (
    <section
      id={ANCHOR_ID}
      className="surface-paper scroll-mt-24 border-t border-western-border-soft py-12 md:py-16"
      aria-labelledby="instalacao-title"
    >
      <div className="container-western">
        <div className="max-w-5xl">
          {/* Header */}
          <p className="text-section-label mb-3">Instalação</p>
          <h2 id="instalacao-title" className="display-lg text-western-green-deep">
            Instalação assistida
          </h2>
          <p className="text-body mt-3 max-w-[62ch]">{subtitle}</p>

          <div className="mt-10 grid gap-10 md:grid-cols-12 md:gap-12">
            {/* Coluna esquerda — Selo nível + fatos + reassurance */}
            <div className="space-y-8 md:col-span-5">
              {/* Selo de nível */}
              <div className="rounded-lg border border-western-border-soft bg-western-cream p-5">
                <p className="text-sublabel mb-3">Nível de instalação</p>
                <div className="flex items-center justify-between gap-4">
                  <LevelBars level={level} />
                  <span className="font-sans text-[14px] font-semibold tabular-nums text-western-stone-warm">
                    {level} de 4
                  </span>
                </div>
                <p className="mt-3 font-sans text-[17px] font-semibold text-western-green-deep">
                  {levelLabel}
                </p>
              </div>

              {/* 3 fatos rápidos */}
              <ul className="grid grid-cols-3 gap-px overflow-hidden rounded-lg border border-western-border-soft bg-western-border-soft">
                {facts.map((f) => (
                  <li key={f.label} className="bg-western-cream px-3 py-4 text-center">
                    <p className="text-sublabel mb-2">{f.label}</p>
                    <p className="font-sans text-[16px] leading-snug text-western-green-deep">
                      {f.value}
                    </p>
                  </li>
                ))}
              </ul>

              {/* Reassurance */}
              <p className="text-body border-l-2 border-western-gold pl-4">{reassure}</p>

              {/* Avisos que valem ouro — impermeabilização, cura, elétrica, bomba */}
              {warnings.length > 0 && (
                <div className="rounded-2xl border border-western-border-strong bg-western-ivory p-5">
                  <p className="text-sublabel mb-4">Antes de começar</p>
                  <ul className="space-y-5">
                    {warnings.map((w) => (
                      <li key={w.title} className="flex gap-3">
                        <AlertTriangle
                          className="mt-0.5 h-5 w-5 shrink-0 text-western-bronze"
                          strokeWidth={2}
                          aria-hidden="true"
                        />
                        <div>
                          <p className="font-sans text-[17px] font-semibold text-western-green-deep">
                            {w.title}
                          </p>
                          <p className="mt-1 font-sans text-[16px] leading-relaxed text-western-stone-warm">
                            {w.text}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Coluna direita — Passos + CTAs */}
            <div className="space-y-8 md:col-span-7">
              <div>
                <p className="text-section-label mb-4">{stepsLabel}</p>
                <Accordion
                  type="single"
                  collapsible
                  defaultValue="step-0"
                  className="border-t border-western-border-soft"
                >
                  {steps.map((s, i) => (
                    <AccordionItem
                      key={s.title}
                      value={`step-${i}`}
                      className="border-b border-western-border-soft"
                    >
                      <AccordionTrigger className="gap-4 py-4 text-left hover:no-underline">
                        <span className="flex min-w-0 items-baseline gap-3">
                          <span className="font-sans text-[16px] font-semibold tabular-nums text-western-bronze">
                            {String(i + 1).padStart(2, "0")}
                          </span>
                          <span className="font-sans text-[17px] font-semibold text-western-green-deep">
                            {s.title}
                          </span>
                        </span>
                      </AccordionTrigger>
                      <AccordionContent className="pb-5 pl-10 pr-2 font-sans text-[17px] leading-relaxed text-western-stone-warm">
                        {s.text}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
                <p className="text-meta mt-4">
                  Resumo do Capítulo {chapter} · {chapterTitle}. O passo a passo completo,
                  a ficha técnica com o peso de cada peça e os cuidados de manutenção estão
                  no manual.
                </p>
              </div>

              {/* CTAs — DS V3: primário verde, secundário outline-forest.
                  Mobile: empilhados full-width, 52px. */}
              <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-start">
                <ManualDownload
                  chapter={chapter}
                  chapterTitle={chapterTitle}
                  page={manualPage}
                  pieceName={pieceName}
                  lineHandle={lineHandle}
                  origem={origem}
                  variant="primary"
                  className="w-full sm:w-auto"
                />
                {/* Havia aqui um terceiro botão, "Guia completo de instalação",
                    que apontava para a rota /como-instalar — inexistente no
                    App.tsx, ou seja, 404 em toda PDP. Ele foi REMOVIDO, não
                    consertado: o <ManualDownload> acima já entrega as duas ações
                    reais (baixar para a obra · abrir no capítulo da peça), e um
                    terceiro botão para o mesmo PDF só empata a decisão.
                    Consertar o destino dele teria sido pior que o 404: como era
                    um <a> cru, ele entregava o manual POR FORA do portão de
                    lead do ManualDownload (free = isApproved || unlocked). */}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
