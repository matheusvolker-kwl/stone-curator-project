import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import proImage from "@/assets/projetos-western/05_cascata-escalonada.webp.asset.json";
import residencialImage from "@/assets/projetos-western/08_piscina-paisagismo.webp";

const STORAGE_KEY = "western:entry-choice-v1";
type Choice = "pro" | "b2c" | "browse";

function readChoice(): Choice | null {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    if (v === "pro" || v === "b2c" || v === "browse") return v;
    return null;
  } catch {
    return null;
  }
}

function writeChoice(v: Choice) {
  try {
    localStorage.setItem(STORAGE_KEY, v);
  } catch {
    /* ignore */
  }
}

interface CardProps {
  eyebrow: string;
  title: string;
  description: string;
  ariaLabel: string;
  imageUrl: string;
  onActivate: () => void;
}

function OptionCard({ eyebrow, title, description, ariaLabel, imageUrl, onActivate }: CardProps) {
  return (
    <button
      type="button"
      onClick={onActivate}
      aria-label={ariaLabel}
      className="group relative flex h-[38dvh] min-h-[180px] max-h-[300px] sm:h-[320px] flex-col justify-end overflow-hidden rounded-[2px] border border-western-gold/25 text-left transition-all duration-300 ease-out hover:-translate-y-1 hover:border-western-gold hover:shadow-[0_24px_50px_-24px_rgba(0,0,0,0.7)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-western-gold focus-visible:ring-offset-2 focus-visible:ring-offset-western-green-deep motion-reduce:transition-none motion-reduce:hover:translate-y-0"
    >
      <img
        src={imageUrl}
        alt=""
        aria-hidden="true"
        loading="lazy"
        decoding="async"
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.06] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-t from-western-green-deep via-western-green-deep/40 to-transparent"
      />
      <div className="relative z-10 p-6">
        <p className="font-mono text-[10px] font-medium uppercase tracking-[0.24em] text-western-gold-soft">
          {eyebrow}
        </p>
        <h3 className="mt-2 font-display text-xl md:text-[22px] leading-[1.15] text-western-cream">
          {title}
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-western-cream-muted max-w-[36ch]">
          {description}
        </p>
        <span className="mt-4 inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.24em] text-western-gold transition-all duration-300 group-hover:gap-3">
          Continuar
          <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
        </span>
      </div>
    </button>
  );
}

export default function AudienceOverlay() {
  const location = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (location.pathname !== "/") return;
    if (readChoice()) return;
    const t = window.setTimeout(() => setOpen(true), 600);
    return () => window.clearTimeout(t);
  }, [location.pathname]);

  useEffect(() => {
    const onReopen = () => setOpen(true);
    window.addEventListener("western:open-audience", onReopen);
    return () => window.removeEventListener("western:open-audience", onReopen);
  }, []);

  const choosePro = () => {
    writeChoice("pro");
    setOpen(false);
  };
  const chooseB2c = () => {
    writeChoice("b2c");
    setOpen(false);
    navigate("/contrate-a-western");
  };
  const chooseBrowse = () => {
    writeChoice("browse");
    setOpen(false);
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      // X ou ESC ou click-outside → considera "só quero ver"
      writeChoice("browse");
    }
    setOpen(next);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl border-western-gold/30 bg-western-green-deep text-western-cream rounded-[2px] p-8 md:p-10 gap-6">
        <DialogHeader className="text-left space-y-3">
          <p className="font-mono text-[10px] font-medium uppercase tracking-[0.28em] text-western-gold-soft">
            Bem-vindo à Western
          </p>
          <div className="h-px w-10 bg-western-gold" />
          <DialogTitle className="font-display text-2xl md:text-[28px] leading-[1.1] text-western-cream font-normal tracking-tight">
            Por onde você prefere começar?
          </DialogTitle>
          <DialogDescription className="text-western-cream-muted text-sm leading-relaxed">
            Ateliê de pedra artesanal desde 1993. Escolha o caminho mais rápido pro seu momento.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <OptionCard
            eyebrow="Opção 01"
            title="Sou profissional do ramo"
            description="Arquiteto, paisagista, laguista ou revenda."
            ariaLabel="Sou profissional — continuar na loja"
            imageUrl={proImage.url}
            onActivate={choosePro}
          />
          <OptionCard
            eyebrow="Opção 02"
            title="É para o meu projeto"
            description="Cliente final: cascata, lago ou área de lazer em casa."
            ariaLabel="É para o meu projeto — solicitar orçamento"
            imageUrl={residencialImage}
            onActivate={chooseB2c}
          />
        </div>

        <button
          type="button"
          onClick={chooseBrowse}
          className="mx-auto inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.24em] text-western-cream-muted transition-colors hover:text-western-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-western-gold focus-visible:ring-offset-2 focus-visible:ring-offset-western-green-deep"
        >
          Só quero ver o catálogo
          <ArrowRight className="h-3 w-3" aria-hidden="true" />
        </button>
      </DialogContent>
    </Dialog>
  );
}
