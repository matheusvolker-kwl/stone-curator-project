import { useMemo } from "react";

interface Props {
  productTitle: string;
  /** SKU do produto (pode vir com sufixo de variante, ex.: "FC-NAT"). */
  sku?: string | null;
}

// Resolução automática das imagens aplicadas por SKU.
// Convenção: src/assets/produtos-aplicados/{SKU}_close.{ext} e {SKU}_ambiente[_sufixo].{ext}
// Aceita arquivos de imagem crus (?url) e assets do Lovable (.asset.json). Ver README na pasta.
const RAW = import.meta.glob(
  "/src/assets/produtos-aplicados/*.{webp,jpg,jpeg,png}",
  { eager: true, query: "?url", import: "default" }
) as Record<string, string>;

const ASSETS = import.meta.glob(
  "/src/assets/produtos-aplicados/*.{webp,jpg,jpeg,png}.asset.json",
  { eager: true }
) as Record<string, { url?: string; default?: { url?: string } }>;

// Mapa: NOME_BASE (maiúsculo, sem extensão) -> url
const APLICADAS: Record<string, string> = {};
for (const path in RAW) {
  const file = path.split("/").pop() ?? "";
  const name = file.replace(/\.[^.]+$/, "").toUpperCase();
  APLICADAS[name] = RAW[path];
}
for (const path in ASSETS) {
  const file = path.split("/").pop() ?? "";
  const name = file.replace(/\.asset\.json$/i, "").replace(/\.[^.]+$/, "").toUpperCase();
  const mod = ASSETS[path];
  const url = mod?.url ?? mod?.default?.url;
  if (url && !(name in APLICADAS)) APLICADAS[name] = url;
}

function baseSku(sku?: string | null): string {
  if (!sku) return "";
  // SKUs reais vêm com prefixo de marca, ex.: "WEST-CSB-A", "WEST-PP1", "WESTERN-BOX-01".
  // Remove o prefixo e pega o código base (antes do próximo hífen de variante).
  const s = sku.trim().toUpperCase().replace(/^WEST(ERN)?-/, "");
  return s.split("-")[0];
}

function findImage(sku: string, kind: "CLOSE" | "AMBIENTE"): string | null {
  if (!sku) return null;
  const prefix = `${sku}_${kind}`;
  for (const name in APLICADAS) {
    if (kind === "CLOSE" && name === prefix) return APLICADAS[name];
    if (kind === "AMBIENTE" && (name === prefix || name.startsWith(`${prefix}_`)))
      return APLICADAS[name];
  }
  return null;
}

/**
 * Resolve as fotos aplicadas de um SKU (galeria canônica da PDP:
 * estúdio → ambiente → detalhe). Aceita SKU com sufixo de variante.
 */
export function getAplicadas(sku?: string | null): {
  ambiente: string | null;
  close: string | null;
} {
  const s = baseSku(sku);
  return { ambiente: findImage(s, "AMBIENTE"), close: findImage(s, "CLOSE") };
}

export default function ProductInUse({ productTitle, sku }: Props) {
  const { close, ambiente } = useMemo(() => {
    const s = baseSku(sku);
    return {
      close: findImage(s, "CLOSE"),
      ambiente: findImage(s, "AMBIENTE"),
    };
  }, [sku]);

  if (!close && !ambiente) return null;

  const items = [
    close && { src: close, legenda: "Detalhe" },
    ambiente && { src: ambiente, legenda: "No ambiente" },
  ].filter(Boolean) as { src: string; legenda: string }[];

  const cols = items.length === 1 ? "md:grid-cols-1" : "md:grid-cols-2";

  return (
    <section className="bg-western-paper py-14 md:py-20">
      <div className="container-western">
        <header className="max-w-2xl mb-8 md:mb-12">
          <p className="text-eyebrow mb-3">Este produto aplicado</p>
          <h2 className="font-display text-3xl md:text-4xl text-western-green-deep leading-tight">
            Veja em uso
          </h2>
        </header>

        <div className={`grid grid-cols-1 ${cols} gap-5 md:gap-6`}>
          {items.map((it) => (
            <figure key={it.legenda}>
              <div className="overflow-hidden bg-western-cream-muted aspect-[4/3]">
                <img
                  src={it.src}
                  alt={`${productTitle} — ${it.legenda.toLowerCase()}`}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover"
                />
              </div>
              <figcaption className="mt-3 text-[14px] font-semibold uppercase tracking-[0.06em] text-western-stone-warm">
                {it.legenda}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
