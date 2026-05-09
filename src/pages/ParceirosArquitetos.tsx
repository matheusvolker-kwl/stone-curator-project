import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import faisalFoto from "@/assets/arquitetos/marcelo-faisal.png";
import hayasakiFoto from "@/assets/arquitetos/fabiano-hayasaki.jpeg";
import luidiFoto from "@/assets/arquitetos/ronaldo-luidi.webp";

interface Arquiteto {
  nome: string;
  cidade: string;
  foto: string;
  paragrafo: string;
  tags: string[];
  citacao?: string; // TODO citação validada pelo arquiteto / Western
}

const ARQUITETOS: Arquiteto[] = [
  {
    nome: "Marcelo Faisal",
    cidade: "São Paulo · SP",
    foto: faisalFoto,
    tags: ["Residencial alto padrão", "Cascatas", "Jardins contemporâneos"],
    paragrafo:
      "Arquiteto e paisagista de referência nacional. Especifica Western em projetos residenciais de alto padrão há mais de uma década, com presença frequente em revistas e premiações. A combinação de leveza logística e fidelidade estética da pedra é central no método dele de compor jardins contemporâneos.",
  },
  {
    nome: "Fabiano Hayasaki",
    cidade: "São José do Rio Preto · SP",
    foto: hayasakiFoto,
    tags: ["Residências de luxo", "Piscinas", "Integração mineral"],
    paragrafo:
      "Arquiteto premiado, conhecido pela integração de elementos minerais e vegetais em residências de luxo. Western é parte recorrente do repertório dele, especialmente em piscinas e cascatas onde o peso e a logística da pedra natural inviabilizariam o projeto.",
  },
  {
    nome: "Ronaldo Luidi",
    cidade: "São Paulo · SP",
    foto: luidiFoto,
    tags: ["Paisagismo autoral", "Modelagem 3D", "Acabamento manual"],
    paragrafo:
      "Sócio do instituto Paisagística e referência no ensino de SketchUp aplicado ao paisagismo. Trabalha com Western pela previsibilidade da composição em 3D e pela qualidade do acabamento manual — a peça que vai ao canteiro é a peça que foi especificada.",
  },
];

export default function ParceirosArquitetos() {
  return (
    <div className="surface-ivory">
      <div className="container-western py-20 md:py-28 max-w-5xl">
        <p className="text-eyebrow mb-5">Especificada por</p>
        <div className="w-12 h-px bg-western-gold mb-8" />
        <h1 className="font-display text-4xl md:text-6xl text-western-green-deep leading-[1.05] mb-8">
          Arquitetos que confiam<br />na Western.
        </h1>
        <p className="text-lg text-western-stone-warm leading-relaxed max-w-2xl mb-20">
          Estes são alguns dos estúdios que tornam Western parte recorrente do repertório
          em residências de alto padrão, hospitalidade de luxo e projetos públicos
          contemplativos. Cada um pelo seu motivo — leveza, logística, previsibilidade,
          textura. Todos pelo mesmo padrão.
        </p>

        <div className="space-y-12 md:space-y-16">
          {ARQUITETOS.map((a, i) => {
            const numero = String(i + 1).padStart(2, "0");
            const reverso = i % 2 === 1;
            return (
              <article
                key={a.nome}
                className="group bg-western-cream border border-western-stone-warm/15 hover:border-western-gold/40 shadow-[0_18px_50px_-30px_rgba(20,40,30,0.35)] hover:shadow-[0_28px_70px_-30px_rgba(20,40,30,0.45)] transition-all duration-500"
              >
                <div className={`grid md:grid-cols-12 gap-8 md:gap-12 items-center p-6 md:p-10 ${reverso ? "md:[&>*:first-child]:order-2" : ""}`}>
                  {/* Foto */}
                  <div className="md:col-span-5">
                    <div className="relative">
                      <div className="aspect-[4/5] overflow-hidden bg-western-green-deep ring-1 ring-western-gold/30 ring-offset-4 ring-offset-western-cream shadow-xl">
                        <img
                          src={a.foto}
                          alt={`Retrato de ${a.nome}`}
                          loading="lazy"
                          className="w-full h-full object-cover grayscale-[15%] group-hover:grayscale-0 transition-all duration-700 scale-100 group-hover:scale-[1.02]"
                        />
                      </div>
                      {/* Tag flutuante de cidade */}
                      <span className="absolute top-3 left-3 bg-western-green-deep/90 backdrop-blur-sm border border-western-gold/30 text-western-gold-soft font-mono text-[10px] uppercase tracking-[0.22em] px-3 py-1.5">
                        {a.cidade}
                      </span>
                      {/* Numeração editorial */}
                      <span className="absolute -bottom-3 -right-2 bg-western-gold text-western-green-deep font-mono text-[11px] uppercase tracking-[0.22em] px-3 py-1.5 shadow-md">
                        {numero}
                      </span>
                    </div>
                  </div>

                  {/* Texto */}
                  <div className="md:col-span-7">
                    <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-western-gold mb-3">
                      Arquiteto parceiro · {numero}
                    </p>
                    <h2 className="font-display text-3xl md:text-5xl text-western-green-deep leading-[1.05] mb-5">
                      {a.nome}
                    </h2>
                    <div className="w-10 h-px bg-western-gold mb-6" />
                    <p className="text-western-stone-warm leading-relaxed text-base md:text-lg">
                      {a.paragrafo}
                    </p>

                    {/* Chips técnicas */}
                    <div className="mt-6 pt-5 border-t border-western-stone-warm/15 flex flex-wrap gap-x-4 gap-y-2">
                      {a.tags.map((t) => (
                        <span
                          key={t}
                          className="font-mono text-[10px] uppercase tracking-[0.22em] text-western-stone-warm"
                        >
                          {t}
                        </span>
                      ))}
                    </div>

                    {a.citacao && (
                      <blockquote className="mt-6 pl-5 border-l-2 border-western-gold italic text-western-green-deep/85 leading-relaxed">
                        "{a.citacao}"
                      </blockquote>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        {/* CTA final */}
        <div className="mt-24 md:mt-32 surface-forest p-10 md:p-14 border border-western-gold/15">
          <p className="text-eyebrow mb-4">Seu estúdio também</p>
          <h3 className="font-display text-2xl md:text-4xl text-western-cream leading-[1.1] mb-6 max-w-2xl">
            Tabela de preços, condições comerciais e modelos 3D liberados após credenciamento.
          </h3>
          <Link
            to="/parceiro/cadastro"
            className="inline-flex items-center gap-2 h-12 px-7 bg-western-gold text-western-green-deep hover:bg-western-gold-soft font-mono text-xs uppercase tracking-[0.22em] transition-colors"
          >
            Solicitar acesso B2B <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
