import retrato from "@/assets/ricardo-botelho.webp";

export default function ArtistaSection() {
  return (
    <section className="surface-ivory py-20 md:py-32">
      <div className="container-western grid md:grid-cols-12 gap-10 md:gap-16 items-center">
        <div className="md:col-span-5">
          <div className="frame-gallery aspect-[4/5] border-western-gold/30 overflow-hidden">
            <img
              src={retrato}
              alt="Ricardo Botelho, desenhista e escultor — autor dos projetos das peças Western"
              loading="lazy"
              className="w-full h-full object-cover"
            />
          </div>
          <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.22em] text-western-stone-warm">
            Ricardo Botelho · Desenhista e escultor
          </p>
        </div>

        <div className="md:col-span-6 md:col-start-7">
          <p className="text-eyebrow mb-5">Autoria · Ricardo Botelho</p>
          <div className="w-12 h-px bg-western-gold mb-8" />
          <h2 className="font-display text-4xl md:text-5xl text-western-green-deep leading-[1.1] mb-8 md:mb-10">
            O artista por trás da{" "}
            <span className="italic font-light text-western-gold">Western.</span>
          </h2>
          <div className="space-y-6 text-western-stone-warm leading-relaxed max-w-xl">
            <p>
              A Western começa antes da fábrica. Começa no traço de Ricardo
              Botelho — desenhista, escultor e o autor dos projetos de cada peça
              do nosso catálogo. É dele a observação paciente da pedra natural
              que se traduz em forma, em proporção, em textura. É dele a decisão
              sobre como uma cascata vai escorrer, como um fóssil vai se
              revelar, como uma pedra de borda vai conversar com a água.
            </p>
            <p>
              Cada peça que sai da Western nasce de um desenho seu, passa por um
              modelo e curadoria, e só depois entra em produção em um composto
              mineral de alta resistência. Esse é o motivo de o nosso catálogo
              ter coerência visual com a natureza: existe um olhar único
              organizando o conjunto.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
