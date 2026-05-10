import { PRODUCT_IN_USE } from "@/data/productInUse";

interface Props {
  productHandle: string;
  productTitle: string;
}

export default function ProductInUse({ productHandle, productTitle }: Props) {
  const images = PRODUCT_IN_USE[productHandle];
  if (!images || images.length === 0) return null;

  const featured = images.find((i) => i.featured) ?? images[0];
  const rest = images.filter((i) => i !== featured).slice(0, 4);

  return (
    <section className="bg-western-paper py-20 md:py-28">
      <div className="container-western">
        <header className="max-w-2xl mb-10 md:mb-14">
          <p className="text-eyebrow mb-4">Esta peça em obra</p>
          <h2 className="font-display text-3xl md:text-4xl text-western-green-deep leading-tight">
            {productTitle} aplicada em projetos reais
          </h2>
          <p className="mt-3 text-spec italic text-western-stone-warm leading-relaxed">
            Fotos de obras executadas — sem render, sem styling de catálogo.
          </p>
        </header>

        {rest.length === 0 ? (
          <figure className="max-w-4xl">
            <div className="overflow-hidden bg-western-cream-muted">
              <img
                src={featured.src}
                alt={featured.caption ?? productTitle}
                loading="lazy"
                className="w-full h-auto object-cover"
              />
            </div>
            {(featured.caption || featured.credit) && (
              <figcaption className="mt-3 font-mono text-[10px] uppercase tracking-[0.22em] text-western-stone-warm">
                {featured.caption}
                {featured.caption && featured.credit && " · "}
                {featured.credit}
              </figcaption>
            )}
          </figure>
        ) : (
          <>
            {/* Desktop: hero + grid */}
            <div className="hidden md:grid grid-cols-12 gap-5">
              <figure className="col-span-7">
                <div className="overflow-hidden bg-western-cream-muted aspect-[4/5]">
                  <img
                    src={featured.src}
                    alt={featured.caption ?? productTitle}
                    loading="lazy"
                    className="w-full h-full object-cover"
                  />
                </div>
                {(featured.caption || featured.credit) && (
                  <figcaption className="mt-3 font-mono text-[10px] uppercase tracking-[0.22em] text-western-stone-warm">
                    {featured.caption}
                    {featured.caption && featured.credit && " · "}
                    {featured.credit}
                  </figcaption>
                )}
              </figure>
              <div className="col-span-5 grid grid-cols-2 gap-4 content-start">
                {rest.map((img, i) => (
                  <figure key={i}>
                    <div className="overflow-hidden bg-western-cream-muted aspect-square">
                      <img
                        src={img.src}
                        alt={img.caption ?? productTitle}
                        loading="lazy"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    {(img.caption || img.credit) && (
                      <figcaption className="mt-2 font-mono text-[9px] uppercase tracking-[0.22em] text-western-stone-warm leading-snug">
                        {img.caption}
                        {img.caption && img.credit && " · "}
                        {img.credit}
                      </figcaption>
                    )}
                  </figure>
                ))}
              </div>
            </div>

            {/* Mobile: snap carousel */}
            <div className="md:hidden -mx-4 px-4 flex gap-4 overflow-x-auto snap-x snap-mandatory pb-2">
              {[featured, ...rest].map((img, i) => (
                <figure key={i} className="flex-shrink-0 w-[78%] snap-start">
                  <div className="overflow-hidden bg-western-cream-muted aspect-[4/5]">
                    <img
                      src={img.src}
                      alt={img.caption ?? productTitle}
                      loading="lazy"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {(img.caption || img.credit) && (
                    <figcaption className="mt-2 font-mono text-[9px] uppercase tracking-[0.22em] text-western-stone-warm leading-snug">
                      {img.caption}
                      {img.caption && img.credit && " · "}
                      {img.credit}
                    </figcaption>
                  )}
                </figure>
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
