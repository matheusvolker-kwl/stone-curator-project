import { ArrowRight } from "lucide-react";
import StepShell from "./StepShell";
import { useGuideStore } from "@/stores/guideStore";
import { MoodLago, MoodPiscina, MoodJardim, MoodEspecial } from "./svg/MoodSvg";

interface CardProps {
  title: string;
  desc: string;
  magnitude?: string;
  ctaLabel?: string;
  illustration: React.ReactNode;
  onClick: () => void;
}

function MoodCard({ title, desc, magnitude, ctaLabel, illustration, onClick }: CardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={title}
      className="group relative text-left flex flex-col bg-white border border-western-stone-warm/20 hover:border-western-gold transition-all duration-300 overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-western-gold focus-visible:ring-offset-2 focus-visible:ring-offset-western-ivory hover:-translate-y-1 hover:shadow-[0_18px_40px_-20px_rgba(15,40,24,0.35)]"
    >
      <div className="relative aspect-[4/5] sm:aspect-[3/4] w-full overflow-hidden">
        <div className="absolute inset-0 transition-transform duration-700 group-hover:scale-105">
          {illustration}
        </div>
        <div className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-western-green-deep/80 to-transparent" />
      </div>
      <div className="p-5 md:p-6 flex-1 flex flex-col gap-2">
        <h3 className="font-display text-2xl md:text-3xl text-western-green-deep leading-tight">
          {title}
        </h3>
        <p className="text-sm text-western-stone-warm leading-relaxed">{desc}</p>
        {magnitude && (
          <p className="mt-auto pt-3 text-xs font-mono uppercase tracking-[0.18em] text-western-stone-warm/80">
            {magnitude}
          </p>
        )}
        {ctaLabel && (
          <span className="mt-3 inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.22em] text-western-gold">
            {ctaLabel} <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
          </span>
        )}
      </div>
    </button>
  );
}

export default function StepOnde() {
  const setTipo = useGuideStore((s) => s.setTipo);
  const reset = useGuideStore((s) => s.reset);

  return (
    <StepShell
      stepKey="tipo"
      pergunta="Para qual ambiente você está compondo?"
      subtitulo="Cada ambiente tem curadoria própria de peças, escala e acabamento. Escolha por proximidade — você poderá refinar nas próximas etapas."
      onReset={reset}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MoodCard
          title="Lago"
          desc="Espelhos d'água, lagos com peixes, jardins aquáticos."
          magnitude="Geralmente 4–12 peças · R$ 2–27 mil"
          illustration={<MoodLago />}
          onClick={() => setTipo("lago")}
        />
        <MoodCard
          title="Piscina"
          desc="Borda, cascata e ambientação ao redor da piscina."
          magnitude="Geralmente 5–14 peças · R$ 3–28 mil"
          illustration={<MoodPiscina />}
          onClick={() => setTipo("piscina")}
        />
        <MoodCard
          title="Jardim"
          desc="Canteiros, paisagismo, fontes e composições secas."
          magnitude="Geralmente 3–10 peças · R$ 2–24 mil"
          illustration={<MoodJardim />}
          onClick={() => setTipo("jardim")}
        />
        <MoodCard
          title="Projeto especial"
          desc="Fachada, parede, balcão, hall, instalação cenográfica."
          ctaLabel="Atendimento dedicado"
          illustration={<MoodEspecial />}
          onClick={() => setTipo("especial")}
        />
      </div>
    </StepShell>
  );
}
