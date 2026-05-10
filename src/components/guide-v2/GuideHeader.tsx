import { Link } from "react-router-dom";
import { ArrowLeft, X } from "lucide-react";
import logoWestern from "@/assets/logos/western-verde.png";

interface Props {
  breadcrumb?: { label: string; to: string };
}

export default function GuideHeader({ breadcrumb }: Props) {
  return (
    <header className="border-b border-western-gold/30 bg-western-ivory/95 backdrop-blur-sm sticky top-0 z-30 relative">
      <div className="container-western h-16 flex items-center justify-between relative">
        <div className="flex items-center gap-5 min-w-0">
          <Link to="/" className="flex-shrink-0" aria-label="Western Pools">
            <img
              src={logoWestern}
              alt="Western Pools"
              className="h-7 md:h-8 w-auto object-contain"
            />
          </Link>
          <span aria-hidden className="hidden md:block w-px h-7 bg-western-gold/40" />
          <span className="hidden md:inline-block font-display italic text-[18px] text-western-green-deep leading-none truncate">
            Guia de Composição
          </span>
        </div>
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
