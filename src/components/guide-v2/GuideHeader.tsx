import { Link } from "react-router-dom";
import { ArrowLeft, X } from "lucide-react";
import iconePedra from "@/assets/icone-pedra-bege.png";

interface Props {
  breadcrumb?: { label: string; to: string };
}

export default function GuideHeader({ breadcrumb }: Props) {
  return (
    <header className="border-b border-western-stone-warm/15 bg-western-ivory/95 backdrop-blur-sm sticky top-0 z-30 relative overflow-hidden">
      {/* watermark icone-pedra à direita */}
      <img
        src={iconePedra}
        alt=""
        aria-hidden
        className="absolute -right-6 top-1/2 -translate-y-1/2 h-24 opacity-[0.06] pointer-events-none select-none"
      />
      <div className="container-western h-16 flex items-center justify-between relative">
        <Link
          to="/"
          className="font-display text-lg tracking-wide text-western-green-deep hover:text-western-gold transition-colors"
        >
          Western Pools
        </Link>
        <div className="flex items-center gap-8">
          {breadcrumb && (
            <Link
              to={breadcrumb.to}
              className="hidden md:inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.22em] text-western-stone-warm hover:text-western-green-deep transition-colors"
            >
              <ArrowLeft className="h-3 w-3" /> {breadcrumb.label}
            </Link>
          )}
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.22em] text-western-stone-warm hover:text-western-green-deep transition-colors"
          >
            Sair do guia <X className="h-3 w-3" />
          </Link>
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-western-gold/40 to-transparent" />
      {breadcrumb && (
        <div className="md:hidden container-western pb-3 relative">
          <Link
            to={breadcrumb.to}
            className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.22em] text-western-stone-warm"
          >
            <ArrowLeft className="h-3 w-3" /> {breadcrumb.label}
          </Link>
        </div>
      )}
    </header>
  );
}
