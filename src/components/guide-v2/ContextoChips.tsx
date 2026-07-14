import { Link } from "react-router-dom";
import { Pencil } from "lucide-react";
import { acabamentoMeta, tipoVisualMap, type Acabamento, type TipoVisual } from "./types";
import { buildContextQuery } from "./useGuideQuery";

interface Props {
  tipo: TipoVisual;
  area: number;
  acabamento: Acabamento;
}

/**
 * Barra de contexto do guia — DS V3.
 *
 * BUG CORRIGIDO (375px): os chips viviam num `overflow-x-auto` que encolhia
 * livremente ao lado de um link "Editar contexto" largo (mono + tracking
 * 0.22em). O último chip era cortado no meio da palavra — "Moledo" virava "M".
 * Agora: cada chip é `whitespace-nowrap` (nunca quebra/corta palavra), o link
 * de edição encolhe para "Editar" no mobile e a fila rola por inteiro quando
 * um rótulo longo ("Jardim com Fonte") não couber.
 *
 * ALTURA: 52px. A pilha sticky do wizard (GuideHeader 80px + esta barra) tem
 * que caber no `scroll-mt-[140px]` que Refinar.tsx usa — 80 + 52 = 132px.
 */
export default function ContextoChips({ tipo, area, acabamento }: Props) {
  const editHref = `/guia-de-composicao?${buildContextQuery({ tipoVisual: tipo, area, acabamento })}`;
  const items = [
    tipoVisualMap[tipo].label,
    `${area} m²`,
    acabamentoMeta[acabamento].label,
  ];

  return (
    <div className="sticky top-20 z-20 bg-western-paper/95 backdrop-blur-sm border-b border-western-border-soft">
      <div className="container-western h-[52px] flex items-center gap-3">
        <ol className="flex-1 min-w-0 flex items-center gap-2 overflow-x-auto scrollbar-hide">
          {items.map((label) => (
            <li key={label} className="flex-shrink-0">
              <span className="inline-flex items-center whitespace-nowrap rounded-full border border-western-border-soft bg-white px-3 py-1 font-sans text-[14px] font-semibold text-western-green-deep">
                {label}
              </span>
            </li>
          ))}
        </ol>

        <Link
          to={editHref}
          aria-label="Editar contexto do projeto"
          className="tap-target flex-shrink-0 inline-flex items-center gap-2 rounded-[10px] px-2 font-sans text-[14px] font-semibold text-western-bronze hover:text-western-green-deep hover:bg-western-ivory transition-colors"
        >
          <Pencil className="h-4 w-4 flex-shrink-0" aria-hidden />
          <span className="whitespace-nowrap">
            Editar<span className="hidden sm:inline"> contexto</span>
          </span>
        </Link>
      </div>
    </div>
  );
}
