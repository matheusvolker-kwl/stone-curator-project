import { Link } from "react-router-dom";
import { ArrowRight, Hotel, UtensilsCrossed, Building2, Trees, Sparkles } from "lucide-react";

const SEGMENTOS = [
  {
    Icon: Hotel,
    eyebrow: "Hospitalidade",
    titulo: "Hotéis, resorts e spas premium",
    descricao:
      "Cascatas de boas-vindas em lobby, paredes texturizadas em áreas de spa, lagos ornamentais coletivos em piscinas de resort. Western é fornecedora recorrente de empreendimentos de luxo como o Unique Garden — onde o padrão de hospitalidade não admite peça que envelheça mal.",
    aplicacoes: [
      "Cascatas em piscinas e lagos coletivos",
      "Revestimento de paredes em áreas comuns",
      "Composições de jardim de inverno",
      "Praias artificiais com bordas Western",
    ],
  },
  {
    Icon: UtensilsCrossed,
    eyebrow: "Food & beverage",
    titulo: "Restaurantes, bares e cafés autorais",
    descricao:
      "Balcões de atendimento revestidos com textura mineral, bar molhado decorativo, paredes de destaque em ambientes de alta gastronomia. Caso emblemático: balcão de restaurante japonês de alto padrão em São Paulo — Western reveste o que normalmente seria pedra natural cara e pesada.",
    aplicacoes: [
      "Revestimento de balcões e bar",
      "Paredes de destaque em salão",
      "Painéis mediterrâneos PBS, PBM, PBA, PRR",
      "Composições cenográficas de marca",
    ],
  },
  {
    Icon: Building2,
    eyebrow: "Corporativo",
    titulo: "Lobbies, eventos e cenografia comercial",
    descricao:
      "Vitrines, ambientações temporárias, cenários para eventos corporativos, lobbies de edifícios comerciais e sedes empresariais. O peso reduzido viabiliza instalações em pavimentos altos e reposicionamentos sazonais que pedra natural simplesmente não permitiria.",
    aplicacoes: [
      "Lobbies e recepções",
      "Vitrines comerciais sazonais",
      "Cenografia para eventos e feiras",
      "Composições para sede corporativa",
    ],
  },
  {
    Icon: Trees,
    eyebrow: "Parques e zoológicos",
    titulo: "Hábitats, cavernas e cenários para fauna",
    descricao:
      "Cavernas artificiais em zoológicos, aquários e parques temáticos. Hábitats projetados para fauna nativa brasileira — incluindo viveiros para espécies como a arara-azul, símbolo do bioma Cerrado-Caatinga. Diferencial pouquíssimo explorado, altamente vendável para projetos com narrativa de biofilia.",
    aplicacoes: [
      "Cavernas e formações em escala",
      "Hábitats temáticos por bioma",
      "Cenários de parques aquáticos",
      "Aquários e viveiros institucionais",
    ],
  },
  {
    Icon: Sparkles,
    eyebrow: "Residencial de alto padrão",
    titulo: "Apartamentos, lajes e projetos de assinatura",
    descricao:
      "Coberturas, varandas com piscina, jardins suspensos e mezaninos onde pedra natural é tecnicamente inviável. Composições em projetos assinados por Eduardo Faisal, Fabiano Hayasaki, Ronaldo Luidi e em obras de clientes como Neymar, Thiago Nigro e Diogo Nogueira.",
    aplicacoes: [
      "Cascatas em coberturas e lajes",
      "Jardins de inverno e lavabos",
      "Praias artificiais residenciais",
      "Composições assinadas por arquitetos",
    ],
  },
];

export default function AplicacoesComerciais() {
  return (
    <>
      <section className="surface-forest">
        <div className="container-western py-20 md:py-28 max-w-4xl">
          <p className="text-eyebrow text-western-gold-soft mb-5">Aplicações comerciais</p>
          <div className="w-12 h-px bg-western-gold mb-8" />
          <h1 className="font-display text-4xl md:text-6xl text-western-cream leading-[1.05] mb-6">
            Onde Western entra<br />além da piscina.
          </h1>
          <p className="text-lg text-western-cream-muted leading-relaxed max-w-2xl">
            A marca leva "Pools" no nome, mas o universo de aplicação vai muito além. Cinco
            segmentos onde o composto mineral leve, perfurável e resistente a intempéries muda o
            que é viável especificar.
          </p>
        </div>
      </section>

      <section className="surface-ivory py-16 md:py-24">
        <div className="container-western max-w-5xl space-y-16 md:space-y-24">
          {SEGMENTOS.map(({ Icon, eyebrow, titulo, descricao, aplicacoes }, i) => (
            <article key={titulo} className="grid md:grid-cols-12 gap-8 md:gap-12 items-start">
              <div className="md:col-span-4">
                <div className="aspect-square bg-western-green-deep border border-western-gold/20 flex flex-col items-center justify-center p-8">
                  <Icon className="h-14 w-14 text-western-gold mb-5" strokeWidth={1.2} />
                  <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-western-gold-soft text-center">
                    Segmento {String(i + 1).padStart(2, "0")} / 05
                  </p>
                </div>
              </div>

              <div className="md:col-span-8">
                <p className="text-eyebrow mb-3">{eyebrow}</p>
                <h2 className="font-display text-2xl md:text-4xl text-western-green-deep leading-[1.1] mb-5">
                  {titulo}
                </h2>
                <p className="text-western-stone-warm leading-relaxed mb-6">{descricao}</p>
                <ul className="grid sm:grid-cols-2 gap-2 border-t border-western-stone-warm/15 pt-5">
                  {aplicacoes.map((a) => (
                    <li key={a} className="flex items-start gap-2 text-sm text-western-stone-warm">
                      <span className="text-western-gold mt-1">·</span>
                      <span>{a}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="surface-forest py-16 md:py-20">
        <div className="container-western max-w-3xl text-center">
          <p className="text-eyebrow text-western-gold-soft mb-4">Tem um projeto comercial?</p>
          <h2 className="font-display text-3xl md:text-4xl text-western-cream leading-[1.1] mb-6">
            Atendimento dedicado para construtoras e incorporadoras.
          </h2>
          <p className="text-western-cream-muted leading-relaxed mb-8">
            Volume, prazo, tonalidade personalizada e condição comercial específica para
            empreendimentos de hospitalidade, F&B e corporativo.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link to="/parceiro/cadastro" className="inline-flex items-center gap-2 h-12 px-7 bg-western-gold text-western-green-deep hover:bg-western-gold-soft font-mono text-xs uppercase tracking-[0.22em] transition-colors">
              Solicitar atendimento <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to="/visitar" className="inline-flex items-center gap-2 h-12 px-7 border border-western-cream/50 text-western-cream hover:border-western-gold hover:text-western-gold-soft font-mono text-xs uppercase tracking-[0.22em] transition-colors">
              Visitar o ateliê
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
