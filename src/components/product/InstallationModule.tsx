import { Check, ArrowRight, BookOpen, FileDown, PlayCircle } from "lucide-react";
import { Link } from "react-router-dom";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";
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
        "flex flex-wrap items-center gap-x-3 gap-y-1 rounded-[10px] border border-western-border-soft bg-western-paper/60 px-4 py-2",
        className,
      )}
    >
      {/* Selo bronze: o dourado não bate contraste sobre fundo claro (DS V3). */}
      <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-western-bronze/10 text-western-bronze">
        <Check className="h-4 w-4" strokeWidth={2.5} aria-hidden="true" />
      </span>
      <span className="font-sans text-[16px] font-semibold text-western-green-deep">
        Instalação assistida
      </span>
      <span className="font-sans text-[14px] text-western-stone-warm">
        Nível {config.level} de 4 · {config.levelLabel}
      </span>
      <a
        href={`#${ANCHOR_ID}`}
        onClick={scrollToInstallation}
        className="ml-auto inline-flex min-h-[48px] items-center gap-1.5 font-sans text-[16px] font-semibold text-western-green-deep underline-offset-4 transition-colors hover:underline"
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
// ─────────────────────────────────────────────────────────────────────────────
export function InstallationSection({ config }: { config: InstallationConfig }) {
  const { level, levelLabel, subtitle, facts, reassure, steps, guideUrl, manualUrl, videoUrl } =
    config;

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
              <div className="rounded-[10px] border border-western-border-soft bg-western-cream p-5">
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
              <ul className="grid grid-cols-3 gap-px overflow-hidden rounded-[10px] border border-western-border-soft bg-western-border-soft">
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
            </div>

            {/* Coluna direita — Passos + CTAs */}
            <div className="space-y-8 md:col-span-7">
              <div>
                <p className="text-section-label mb-4">Passo a passo resumido</p>
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
                  Este é um resumo. O passo a passo completo está no guia e no manual.
                </p>
              </div>

              {/* CTAs — DS V3: primário verde, secundários outline-forest.
                  Mobile: empilhados full-width, 52px. */}
              <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <Link to={guideUrl || "/como-instalar"} className="btn-primary w-full sm:w-auto">
                  <BookOpen className="h-5 w-5" aria-hidden="true" />
                  Guia completo de instalação
                </Link>
                <InstallCta
                  href={manualUrl}
                  icon={<FileDown className="h-5 w-5" aria-hidden="true" />}
                  label="Baixar manual (PDF)"
                />
                <InstallCta
                  href={videoUrl}
                  icon={<PlayCircle className="h-5 w-5" aria-hidden="true" />}
                  label="Assistir ao vídeo"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * CTA secundário da seção de instalação.
 * Sem href (manual/vídeo ainda não publicados) → estado "Em breve" explícito:
 * o motivo fica escrito, e não codificado num texto lavado que reprova AA.
 */
function InstallCta({
  href,
  icon,
  label,
}: {
  href?: string;
  icon: React.ReactNode;
  label: string;
}) {
  if (!href) {
    return (
      <span
        aria-disabled="true"
        className="inline-flex min-h-[52px] w-full cursor-not-allowed items-center justify-center gap-2 rounded-[10px] border border-western-border-soft bg-transparent px-7 font-sans text-[16px] font-semibold text-western-stone-warm sm:w-auto"
      >
        {icon}
        {label}
        <span className="font-sans text-[14px] font-normal text-western-stone-warm">
          · Em breve
        </span>
      </span>
    );
  }

  const external = href.startsWith("http");
  return (
    <a
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      className="btn-outline-forest w-full sm:w-auto"
    >
      {icon}
      {label}
    </a>
  );
}
