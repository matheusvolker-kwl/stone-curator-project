import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ChevronDown, ArrowRight } from "lucide-react";
import { fetchCollections } from "@/lib/datasource";
import {
  CATALOG_SCENES,
  PEDRAS_VIRTUAL,
  PEDRAS_VIRTUAL_HANDLE,
} from "@/lib/catalogScenes";

/**
 * Mega-menu por CENA — só desktop (≥lg). Dropdown no gatilho "Catálogo" que
 * surface a taxonomia de catalogScenes.ts (Água/Superfícies/Volumes/Detalhes)
 * com as categorias-filhas. No mobile NÃO existe (a fileira 2 é hidden lg:block);
 * lá o drawer "Menu" já é a resposta — e não há hover no toque.
 *
 * Abre por HOVER e por FOCO (teclado); fecha em mouseleave, Escape, blur para
 * fora e troca de rota. O gatilho continua sendo um <Link to="/linhas">, então
 * clicar/tocar leva ao índice completo mesmo sem o dropdown.
 */

// Rótulo de reserva enquanto as coleções não chegam do datasource.
const FALLBACK_TITLES: Record<string, string> = {
  cascatas: "Cascatas",
  "fontes-para-jardim": "Fontes de jardim",
  "pedras-de-borda": "Pedras de borda",
  revestimentos: "Revestimentos",
  pisadas: "Pisadas",
  acessorios: "Acessórios",
  "pedra-led": "Pedra com LED",
  "fosseis-decorativos": "Fósseis decorativos",
};

export default function CatalogMegaMenu({
  navLinkCls,
}: {
  navLinkCls: (p: { isActive: boolean }) => string;
}) {
  const { pathname } = useLocation();
  const active =
    pathname === "/linhas" ||
    pathname.startsWith("/linhas/") ||
    pathname === "/produtos";

  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<number | undefined>(undefined);

  const { data: collections = [] } = useQuery({
    queryKey: ["collections"],
    queryFn: () => fetchCollections(50),
    staleTime: 5 * 60_000,
  });

  const titleFor = (h: string) =>
    h === PEDRAS_VIRTUAL_HANDLE
      ? PEDRAS_VIRTUAL.title
      : collections.find((c) => c.handle === h)?.title ??
        FALLBACK_TITLES[h] ??
        h;
  const toFor = (h: string) => `/linhas/${h}`;

  const openNow = () => {
    if (closeTimer.current) window.clearTimeout(closeTimer.current);
    setOpen(true);
  };
  const closeSoon = () => {
    closeTimer.current = window.setTimeout(() => setOpen(false), 120);
  };

  // Fecha ao trocar de rota.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Fecha no Escape.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div
      ref={wrapRef}
      className="relative"
      onMouseEnter={openNow}
      onMouseLeave={closeSoon}
      onFocus={openNow}
      onBlur={(e) => {
        if (!wrapRef.current?.contains(e.relatedTarget as Node)) setOpen(false);
      }}
    >
      <Link
        to="/linhas"
        className={`${navLinkCls({ isActive: active })} gap-1`}
        aria-haspopup="true"
        aria-expanded={open}
        onClick={() => setOpen(false)}
      >
        Catálogo
        <ChevronDown
          className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`}
          strokeWidth={2}
          aria-hidden="true"
        />
      </Link>

      {open && (
        <div className="absolute left-0 top-full z-50 pt-3">
          <div className="w-[720px] max-w-[calc(100vw-2rem)] overflow-hidden rounded-xl border border-western-border-soft bg-white shadow-[0_20px_50px_-12px_rgba(23,32,24,0.28)]">
            <div className="grid grid-cols-4 gap-x-6 gap-y-2 p-6">
              {CATALOG_SCENES.map((scene) => (
                <div key={scene.key}>
                  <p className="text-eyebrow mb-3">{scene.titulo}</p>
                  <ul className="space-y-0.5">
                    {scene.handles.map((h) => (
                      <li key={h}>
                        <Link
                          to={toFor(h)}
                          className="-mx-2 block rounded-[8px] px-2 py-2 font-sans text-[15px] text-western-green-deep transition-colors hover:bg-western-paper hover:text-western-bronze"
                        >
                          {titleFor(h)}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between gap-4 border-t border-western-border-soft bg-western-ivory px-6 py-3.5">
              <Link
                to="/produtos"
                className="inline-flex items-center gap-1.5 font-sans text-[15px] font-semibold text-western-green-deep transition-colors hover:text-western-bronze"
              >
                Ver o catálogo inteiro
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <Link
                to="/guia-de-composicao"
                className="font-sans text-[15px] font-semibold text-western-cta transition-colors hover:text-western-green-deep"
              >
                Montar no guia
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
