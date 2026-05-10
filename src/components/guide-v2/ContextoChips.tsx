import { Link } from "react-router-dom";
import { Pencil } from "lucide-react";
import { acabamentoMeta, tipoVisualMap, type Acabamento, type TipoVisual } from "./types";
import { buildContextQuery } from "./useGuideQuery";

interface Props {
  tipo: TipoVisual;
  area: number;
  acabamento: Acabamento;
}

export default function ContextoChips({ tipo, area, acabamento }: Props) {
  const editHref = `/guia-de-composicao?${buildContextQuery({ tipoVisual: tipo, area, acabamento })}`;
  const items = [
    tipoVisualMap[tipo].label,
    `${area} m²`,
    acabamentoMeta[acabamento].label,
  ];

  return (
    <div className="sticky top-16 z-20 bg-western-paper/95 backdrop-blur-sm border-b border-western-stone-warm/15 relative">
      <div className="container-western h-11 flex items-center justify-between gap-6">
        <ol className="flex items-center gap-1 overflow-x-auto scrollbar-hide">
          {items.map((label, i) => (
            <li key={label} className="flex items-center gap-1 flex-shrink-0">
              {i > 0 && (
                <span aria-hidden className="text-western-gold/60 font-mono text-[10px]">
                  ◇
                </span>
              )}
              <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-western-green-deep px-2.5 py-1">
                {label}
              </span>
            </li>
          ))}
        </ol>
        <Link
          to={editHref}
          className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.22em] text-western-stone-warm hover:text-western-green-deep transition-colors flex-shrink-0"
        >
          <Pencil className="h-3 w-3" /> Editar contexto
        </Link>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-western-gold/30 to-transparent" />
    </div>
  );
}
