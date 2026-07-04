import { useMemo } from "react";

interface Props {
  productTitle: string;
  /** SKU do produto (pode vir com sufixo de variante, ex.: "FC-NAT"). */
  sku?: string | null;
}

// Resolução automática das imagens aplicadas por SKU.
// Convenção: src/assets/produtos-aplicados/{SKU}_close.{ext} e {SKU}_ambiente[_sufixo].{ext}
// Ver README dentro da pasta.
const APLICADAS = import.meta.glob(
  "/src/assets/produtos-aplicados/*.{webp,jpg,jpeg,png}",
  { eager: true, query: "?url", import: "default" }
) as Record<string, string>;

function baseSku(sku?: string | null): string {
  if (!sku) return "";
  return sku.trim().split("-")[0].toUpperCase();
}

function findImage(sku: string, kind: "CLOSE" | "AMBIENTE"): string | null {
  if (!sku) return null;
  const prefix = `${sku}_${kind}`;
  for (const path in APLICADAS) {
    const file = path.split("/").pop() ?? "";
    const name = file.replace(/\.[^.]+$/, "").toUpperCase();
    if (kind === "CLOSE" && name === prefix) return APLICADAS[path];
    if (kind === "AMBIENTE" && (name === prefix || name.startsWith(`${prefix}_`)))
      return APLICADAS[path];
  }
  return null;
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
              <figcaption className="mt-3 font-mono text-[10px] uppercase tracking-[0.22em] text-western-stone-warm">
                {it.legenda}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
