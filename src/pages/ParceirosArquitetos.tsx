import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

// TODO substituir os monogramas tipográficos por retratos profissionais
// quando a Western enviar as fotos autorizadas dos arquitetos.

interface Arquiteto {
  nome: string;
  iniciais: string;
  cidade: string;
  paragrafo: string;
  citacao?: string; // TODO citação validada pelo arquiteto / Western
}

// Observação: o briefing original cita "Eduardo Faisal", mas a referência pública
// e notória do paisagismo brasileiro é Marcelo Faisal. Mantemos o nome correto
// e aguardamos confirmação da Western caso seja realmente outro profissional.
const ARQUITETOS: Arquiteto[] = [
  {
    nome: "Marcelo Faisal",
    iniciais: "MF",
    cidade: "São Paulo · SP",
    paragrafo:
      "Arquiteto e paisagista de referência nacional. Especifica Western em projetos residenciais de alto padrão há mais de uma década, com presença frequente em revistas e premiações. A combinação de leveza logística e fidelidade estética da pedra é central no método dele de compor jardins contemporâneos.",
  },
  {
    nome: "Fabiano Hayasaki",
    iniciais: "FH",
    cidade: "São José do Rio Preto · SP",
    paragrafo:
      "Arquiteto premiado, conhecido pela integração de elementos minerais e vegetais em residências de luxo. Western é parte recorrente do repertório dele, especialmente em piscinas e cascatas onde o peso e a logística da pedra natural inviabilizariam o projeto.",
  },
  {
    nome: "Ronaldo Luidi",
    iniciais: "RL",
    cidade: "São Paulo · SP",
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

        <div className="space-y-20 md:space-y-28">
          {ARQUITETOS.map((a, i) => (
            <article
              key={a.nome}
              className={`grid md:grid-cols-12 gap-8 md:gap-14 items-start ${
                i % 2 === 1 ? "md:[&>*:first-child]:order-2" : ""
              }`}
            >
              {/* Monograma — placeholder até receber foto */}
              <div className="md:col-span-5">
                <div className="aspect-[4/5] surface-forest border border-western-gold/20 flex flex-col items-center justify-center">
                  <span className="font-display text-7xl md:text-8xl text-western-gold-soft tracking-wide">
                    {a.iniciais}
                  </span>
                  <span className="mt-6 font-mono text-[10px] uppercase tracking-[0.25em] text-western-cream-muted">
                    Retrato em breve
                  </span>
                </div>
              </div>

              <div className="md:col-span-7">
                <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-western-stone-warm mb-3">
                  {a.cidade}
                </p>
                <h2 className="font-display text-3xl md:text-5xl text-western-green-deep leading-[1.05] mb-6">
                  {a.nome}
                </h2>
                <div className="w-10 h-px bg-western-gold mb-6" />
                <p className="text-western-stone-warm leading-relaxed text-lg">
                  {a.paragrafo}
                </p>
                {a.citacao && (
                  <blockquote className="mt-8 pl-5 border-l-2 border-western-gold italic text-western-green-deep/85 leading-relaxed">
                    “{a.citacao}”
                  </blockquote>
                )}
              </div>
            </article>
          ))}
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
