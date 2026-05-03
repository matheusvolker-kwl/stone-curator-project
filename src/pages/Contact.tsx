export default function Contact() {
  return (
    <div className="container-western py-20 md:py-28 max-w-4xl">
      <p className="text-eyebrow mb-5">Contato</p>
      <h1 className="font-display text-5xl md:text-6xl text-western-cream leading-[1.05] mb-12">
        Para falar com a fábrica.
      </h1>

      <div className="grid sm:grid-cols-2 gap-10 mt-16">
        <div className="border-t border-western-gold/20 pt-8">
          <p className="text-eyebrow mb-3">WhatsApp</p>
          <a
            href="https://wa.me/5511993403485"
            target="_blank"
            rel="noopener noreferrer"
            className="font-display text-3xl text-western-cream hover:text-western-gold-soft transition-colors link-underline"
          >
            +55 11 99340.3485
          </a>
        </div>
        <div className="border-t border-western-gold/20 pt-8">
          <p className="text-eyebrow mb-3">Instagram</p>
          <a
            href="https://instagram.com/westernpools"
            target="_blank"
            rel="noopener noreferrer"
            className="font-display text-3xl text-western-cream hover:text-western-gold-soft transition-colors link-underline"
          >
            @westernpools
          </a>
        </div>
        <div className="border-t border-western-gold/20 pt-8">
          <p className="text-eyebrow mb-3">Fábrica</p>
          <p className="text-western-cream text-lg leading-relaxed">
            São Paulo · Brasil <br />
            Retirada gratuita mediante agendamento.
          </p>
        </div>
        <div className="border-t border-western-gold/20 pt-8">
          <p className="text-eyebrow mb-3">Modelos 3D</p>
          <a
            href="https://3dwarehouse.sketchup.com/by/WesternPools"
            target="_blank"
            rel="noopener noreferrer"
            className="font-display text-2xl text-western-cream hover:text-western-gold-soft transition-colors link-underline"
          >
            SketchUp 3D Warehouse →
          </a>
        </div>
      </div>
    </div>
  );
}
