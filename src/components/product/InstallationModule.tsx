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
        "flex flex-wrap items-center gap-x-3 gap-y-2 border border-western-stone-warm/20 bg-western-paper/60 px-4 py-3",
        className,
      )}
    >
      <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-western-gold/15 text-western-gold shrink-0">
        <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
      </span>
      <span className="font-sans text-[13.5px] font-medium text-western-green-deep">
        Fácil de instalar
      </span>
      <span className="font-mono text-[10.5px] uppercase tracking-[0.2em] text-western-stone-warm">
        Nível {config.level} · {config.levelLabel}
      </span>
      <a
        href={`#${ANCHOR_ID}`}
        onClick={scrollToInstallation}
        className="ml-auto inline-flex items-center gap-1 font-mono text-[10.5px] uppercase tracking-[0.22em] text-western-gold hover:text-western-green-deep transition-colors"
      >
        Ver como
        <ArrowRight className="h-3 w-3" />
      </a>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Barrinhas de nível (4 barras, preenchidas conforme o nível)
// ─────────────────────────────────────────────────────────────────────────────
function LevelBars({ level }: { level: number }) {
  return (
    <div className="flex items-center gap-1" aria-label={`Nível ${level} de 4`}>
      {[1, 2, 3, 4].map((i) => (
        <span
          key={i}
          className={cn(
            "h-2 w-6 rounded-sm transition-colors",
            i <= level ? "bg-western-gold" : "bg-western-stone-warm/20",
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
      className="surface-paper border-t border-western-stone-warm/15 py-12 md:py-16 scroll-mt-24"
      aria-labelledby="instalacao-title"
    >
      <div className="container-western">
        <div className="max-w-5xl">
          {/* Header */}
          <p className="text-section-label mb-3">Instalação</p>
          <h2
            id="instalacao-title"
            className="font-display text-3xl md:text-4xl leading-tight text-western-green-deep"
          >
            Instalação
          </h2>
          <p className="mt-3 font-sans text-[15px] leading-relaxed text-western-stone-warm max-w-[62ch]">
            {subtitle}
          </p>

          <div className="mt-10 grid gap-10 md:grid-cols-12 md:gap-12">
            {/* Coluna esquerda — Selo nível + fatos + reassurance */}
            <div className="md:col-span-5 space-y-8">
              {/* Selo de nível */}
              <div className="border border-western-stone-warm/20 bg-western-cream p-5">
                <p className="text-sublabel mb-3">Nível de instalação</p>
                <div className="flex items-center justify-between gap-4">
                  <LevelBars level={level} />
                  <span className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-western-stone-warm">
                    {level}/4
                  </span>
                </div>
                <p className="mt-3 font-sans text-[14px] font-medium text-western-green-deep">
                  {levelLabel}
                </p>
              </div>

              {/* 3 fatos rápidos */}
              <ul className="grid grid-cols-3 gap-px bg-western-stone-warm/15 border border-western-stone-warm/15">
                {facts.map((f) => (
                  <li key={f.label} className="bg-western-cream p-4 text-center">
                    <p className="text-sublabel mb-2">{f.label}</p>
                    <p className="font-sans text-[13px] leading-snug text-western-green-deep">
                      {f.value}
                    </p>
                  </li>
                ))}
              </ul>

              {/* Reassurance */}
              <p className="border-l-2 border-western-gold pl-4 font-sans text-[14.5px] leading-relaxed text-western-stone-warm">
                {reassure}
              </p>
            </div>

            {/* Coluna direita — Passos + CTAs */}
            <div className="md:col-span-7 space-y-8">
              <div>
                <p className="text-section-label mb-4">Passo a passo resumido</p>
                <Accordion
                  type="single"
                  collapsible
                  defaultValue="step-0"
                  className="border-t border-western-stone-warm/15"
                >
                  {steps.map((s, i) => (
                    <AccordionItem
                      key={s.title}
                      value={`step-${i}`}
                      className="border-b border-western-stone-warm/15"
                    >
                      <AccordionTrigger className="hover:no-underline py-4 gap-4 text-left">
                        <span className="flex items-baseline gap-3 min-w-0">
                          <span className="font-mono text-[11px] tracking-[0.18em] text-western-gold tabular-nums">
                            {String(i + 1).padStart(2, "0")}
                          </span>
                          <span className="font-sans text-[15px] font-medium text-western-green-deep">
                            {s.title}
                          </span>
                        </span>
                      </AccordionTrigger>
                      <AccordionContent className="pl-9 pr-2 pb-5 font-sans text-[14px] leading-relaxed text-western-stone-warm">
                        {s.text}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
                <p className="mt-4 text-meta text-western-stone-warm">
                  Este é um resumo. O passo a passo completo está no guia e no manual.
                </p>
              </div>

              {/* CTAs */}
              <div className="flex flex-wrap gap-3">
                <Link
                  to={guideUrl || "/como-instalar"}
                  className="inline-flex items-center gap-2 h-11 px-5 bg-western-green-deep text-western-gold hover:bg-western-green-deep/90 font-mono text-[11px] uppercase tracking-[0.22em] font-semibold transition-colors border border-western-gold/30"
                >
                  <BookOpen className="h-4 w-4" />
                  Guia completo Como Instalar
                </Link>
                <CtaLink
                  href={manualUrl}
                  icon={<FileDown className="h-4 w-4" />}
                  label="Baixar manual (PDF)"
                />
                <CtaLink
                  href={videoUrl}
                  icon={<PlayCircle className="h-4 w-4" />}
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

function CtaLink({
  href,
  icon,
  label,
}: {
  href?: string;
  icon: React.ReactNode;
  label: string;
}) {
  const disabled = !href;
  const base =
    "inline-flex items-center gap-2 h-11 px-5 border font-mono text-[11px] uppercase tracking-[0.22em] transition-colors";
  if (disabled) {
    return (
      <span
        aria-disabled="true"
        className={cn(
          base,
          "border-western-stone-warm/20 text-western-stone-warm/60 cursor-not-allowed",
        )}
        title="Em breve"
      >
        {icon}
        {label}
      </span>
    );
  }
  return (
    <a
      href={href}
      target={href.startsWith("http") ? "_blank" : undefined}
      rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
      className={cn(
        base,
        "border-western-stone-warm/30 text-western-green-deep hover:border-western-gold hover:text-western-gold",
      )}
    >
      {icon}
      {label}
    </a>
  );
}
