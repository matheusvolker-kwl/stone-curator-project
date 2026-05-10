import { Link } from "react-router-dom";
import { ArrowLeft, X } from "lucide-react";

interface Props {
  breadcrumb?: { label: string; to: string };
}

export default function GuideHeader({ breadcrumb }: Props) {
  return (
    <header className="border-b border-western-stone-warm/15 bg-western-cream/95 backdrop-blur-sm sticky top-0 z-30">
      <div className="mx-auto max-w-[1280px] px-6 md:px-16 h-16 flex items-center justify-between">
        <Link
          to="/"
          className="font-display text-lg tracking-wide text-western-green-deep hover:text-western-gold transition-colors"
        >
          Western Pools
        </Link>
        <div className="flex items-center gap-6">
          {breadcrumb && (
            <Link
              to={breadcrumb.to}
              className="hidden md:inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-western-stone-warm hover:text-western-green-deep transition-colors"
            >
              <ArrowLeft className="h-3 w-3" /> {breadcrumb.label}
            </Link>
          )}
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-western-stone-warm hover:text-western-green-deep transition-colors"
          >
            Sair do guia <X className="h-3 w-3" />
          </Link>
        </div>
      </div>
      {breadcrumb && (
        <div className="md:hidden mx-auto max-w-[1280px] px-6 pb-3">
          <Link
            to={breadcrumb.to}
            className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-western-stone-warm"
          >
            <ArrowLeft className="h-3 w-3" /> {breadcrumb.label}
          </Link>
        </div>
      )}
    </header>
  );
}
