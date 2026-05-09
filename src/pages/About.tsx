import { Link } from "react-router-dom";
import MarcasInstitucionais from "@/components/shared/MarcasInstitucionais";
import ArquitetosStrip from "@/components/shared/ArquitetosStrip";
import { ArrowRight, Layers, Mountain, Recycle, Hammer } from "lucide-react";
import retrato from "@/assets/ricardo-luiz-carlos.webp";
import { BUSINESS } from "@/config/business";

const PILARES = [
  {
    Icon: Mountain,
    eyebrow: "Origem",
    titulo: "Pedra real, sem extração",
    texto:
      "Cada matriz nasce de uma pedra natural moldada no próprio ambiente — Mata Atlântica, Cerrado, Caatinga e formações brasileiras. Tiramos o molde sem mover a pedra. A natureza permanece intacta; o que vai para o projeto é a réplica autoral.",
  },
  {
    Icon: Layers,
    eyebrow: "Pintura",
    titulo: "6 camadas, 5 cores em cada",
    texto:
      "Toda peça recebe seis fases de pintura manual com cinco pigmentos sobrepostos por camada — simulando a sedimentação geológica natural. Resiste a cloro, sol, chuva e variação térmica. Não desbota, não escama, não exige manutenção.",
  },
  {
    Icon: Hammer,
    eyebrow: "Estrutura",
    titulo: "Composto mineral com PET reciclado",
    texto:
      "Cimento estrutural reforçado com fibra de fios de PET reciclado, formando uma teia tridimensional interna. Pedras ocas, leves, pisáveis, perfuráveis. Pesam até 10× menos que pedra natural equivalente — e escondem fiação e tubulação por dentro.",
  },
  {
    Icon: Recycle,
    eyebrow: "ESG",
    titulo: "Biofilia industrializada",
    texto:
      "Zero extração ambiental, plástico recuperado como armadura, logística leve. Um caminhão comum entrega o que pedra natural exigiria guindaste, alvará municipal e fechamento de via. Em qualquer matriz ESG séria, Western pontua melhor.",
  },
];

export default function About() {
  return (
    <>
      {/* HERO */}
      <section className="surface-forest relative overflow-hidden">
        <div className="container-western py-20 md:py-28 max-w-4xl relative">
          <p className="text-eyebrow text-western-gold-soft mb-5">A Western · 1993 — 2026</p>
          <div className="w-12 h-px bg-western-gold mb-8" />
          <h1 className="font-display text-4xl md:text-6xl text-western-cream leading-[1.05] mb-8">
            33 anos moldando<br />
            pedra sem extrair pedra.
          </h1>
          <p className="text-lg md:text-xl text-western-cream-muted leading-relaxed max-w-2xl">
            Fundada em São Paulo em 1993, a Western é a única fábrica brasileira que opera
            ininterruptamente — há três décadas — a tecnologia de pedra artesanal em composto
            mineral trazida do Arizona. Da Disney às piscinas do Neymar; de Cobasi ao Unique
            Garden: o repertório que sustenta a marca é a prova mais difícil de imitar.
          </p>
        </div>
      </section>

      {/* NÚMEROS — escala da operação */}
      <section className="surface-cream py-12 md:py-14 border-y border-western-stone-warm/10">
        <div className="container-western max-w-5xl">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-px bg-western-stone-warm/15">
            {[
              { n: "33", l: "anos de operação ininterrupta" },
              { n: "50", l: "modelos catalogados" },
              { n: "11", l: "coleções" },
              { n: "200", l: "SKUs com 4 acabamentos" },
              { n: "5", l: "anos de garantia formal" },
            ].map((s) => (
              <div key={s.l} className="bg-western-cream p-5 md:p-6 text-center">
                <p className="font-display text-3xl md:text-4xl text-western-green-deep tabular-nums">{s.n}</p>
                <p className="text-spec text-western-stone-warm/80 mt-2 leading-snug">{s.l}</p>
              </div>
            ))}
          </div>
        </div>
      </section>


      <section className="surface-ivory py-20 md:py-24">
        <div className="container-western max-w-5xl grid md:grid-cols-12 gap-10 md:gap-14 items-start">
          <div className="md:col-span-4">
            <div className="aspect-[4/5] overflow-hidden border border-western-gold/30 max-w-[340px]">
              <img
                src={retrato}
                alt="Ricardo Botelho, segunda geração da família fundadora da Western"
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover"
              />
            </div>
            <p className="text-spec text-western-stone-warm/80 mt-3 max-w-[340px]">
              Ricardo Botelho — desenhista, escultor e diretor da Western desde 1996, ao lado do
              irmão Luiz Carlos Botelho.
            </p>
          </div>

          <div className="md:col-span-8 space-y-8 text-base md:text-lg text-western-stone-warm leading-relaxed">
            <div>
              <p className="text-eyebrow mb-3">A família Botelho</p>
              <h2 className="font-display text-3xl md:text-4xl text-western-green-deep leading-[1.1] mb-6">
                Uma empresa familiar que sobreviveu a três décadas num segmento que praticamente
                todas as concorrentes abandonaram.
              </h2>
            </div>
            <p>
              Em 1993, <strong className="text-western-green-deep font-semibold">Luiz Duarte
              Botelho</strong> e um sócio identificaram a tecnologia desenvolvida por um artista
              plástico americano sediado no Arizona — autor de obras icônicas em Las Vegas e nos
              parques da Disney. Trouxeram para o Brasil os primeiros moldes, tintas e
              formulações, e fundaram a Western em São Paulo.
            </p>
            <p>
              Em 1996, <strong className="text-western-green-deep font-semibold">Ricardo
              Botelho</strong> e <strong className="text-western-green-deep font-semibold">Luiz
              Carlos Botelho</strong>, filhos do fundador, retornaram do Japão trazendo a
              metodologia de produção que organizou a fábrica. Sob a segunda geração, a Western
              reduziu o tempo de uma matriz de 40 dias para cerca de 1 dia, ampliou o catálogo
              para 50 modelos rastreáveis e tornou-se referência nacional do paisagismo de alto
              padrão.
            </p>
            <p>
              Em 2026, a empresa completa <strong className="text-western-green-deep font-semibold">
              33 anos de operação ininterrupta</strong> no ateliê de {BUSINESS.cidadeAtelie}/
              {BUSINESS.ufAtelie} — uma das poucas no Brasil que sobrevive desde os anos 1990
              num segmento que praticamente todas as concorrentes descontinuaram.
            </p>
          </div>
        </div>
      </section>

      {/* 4 PILARES */}
      <section className="surface-paper py-20 md:py-24 border-t border-western-stone-warm/10">
        <div className="container-western max-w-6xl">
          <div className="max-w-2xl mb-14">
            <p className="text-eyebrow mb-3">O método Western</p>
            <h2 className="font-display text-3xl md:text-5xl text-western-green-deep leading-[1.05]">
              Quatro pilares que diferenciam o que sai do ateliê.
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-px bg-western-stone-warm/15">
            {PILARES.map(({ Icon, eyebrow, titulo, texto }) => (
              <div key={titulo} className="bg-western-cream p-8 md:p-10">
                <Icon className="h-7 w-7 text-western-gold mb-5" strokeWidth={1.3} />
                <p className="text-eyebrow mb-3">{eyebrow}</p>
                <h3 className="font-display text-2xl text-western-green-deep leading-tight mb-4">
                  {titulo}
                </h3>
                <p className="text-sm md:text-base text-western-stone-warm leading-relaxed">
                  {texto}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* MANIFESTO — vocabulário & filosofia */}
      <section className="surface-forest py-20 md:py-24">
        <div className="container-western max-w-4xl text-center">
          <p className="text-eyebrow text-western-gold-soft mb-5">Filosofia de marca</p>
          <div className="w-12 h-px bg-western-gold mx-auto mb-8" />
          <p className="font-display text-2xl md:text-4xl text-western-cream leading-[1.2] mb-10">
            Não vendemos pedra. Oferecemos elemento autoral para o projeto.
          </p>
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-px bg-western-gold/15 text-left">
            {[
              { de: "Cliente", para: "Parceiro" },
              { de: "Kit", para: "Conjunto" },
              { de: "Cor", para: "Acabamento" },
              { de: "Arranjo", para: "Composição" },
            ].map((p) => (
              <div key={p.de} className="bg-western-green-deep p-6">
                <p className="text-spec text-western-cream-muted/70 line-through">{p.de}</p>
                <p className="font-display text-xl text-western-gold-soft mt-1">{p.para}</p>
              </div>
            ))}
          </div>
          <p className="text-western-cream-muted leading-relaxed mt-10 max-w-2xl mx-auto">
            A Western adota um vocabulário próprio porque o relacionamento é de coprojeto, e o
            que se entrega é uma obra integrada — não um item de varejo. Esse cuidado de
            linguagem eleva a categoria.
          </p>
        </div>
      </section>

      {/* ARQUITETOS + MARCAS — prova social */}
      <section className="surface-ivory py-16 md:py-20">
        <div className="container-western max-w-5xl">
          <ArquitetosStrip
            eyebrow="Especificada por"
            titulo={<>Arquitetos que assinam<br />com a Western.</>}
            descricao={
              <>
                Estúdios de referência nacional que tornam Western parte recorrente do
                repertório em residências de alto padrão e hospitalidade de luxo.
              </>
            }
          />

          <MarcasInstitucionais
            eyebrow="Atendemos há mais de uma década"
            titulo={<>Marcas que escolheram<br />repetir a Western.</>}
            descricao={
              <>
                Cobasi não fica anos com fornecedor que falha. Unique Garden não revende ao seu
                hóspede algo que não passe no padrão de hospitalidade de luxo. Estes são parceiros
                institucionais que voltam a comprar há décadas — e essa é a métrica de qualidade
                que mais respeitamos.
              </>
            }
          />
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="surface-forest py-16 md:py-20 border-t border-western-gold/15">
        <div className="container-western max-w-3xl text-center">
          <p className="text-eyebrow text-western-gold-soft mb-4">Próximo passo</p>
          <h2 className="font-display text-3xl md:text-4xl text-western-cream leading-[1.1] mb-6">
            Conheça o ateliê em {BUSINESS.cidadeAtelie}/{BUSINESS.ufAtelie}.
          </h2>
          <p className="text-western-cream-muted leading-relaxed mb-8 max-w-xl mx-auto">
            Visita guiada com Ricardo ou Luiz Carlos, repertório completo de acabamentos na mão e
            apresentação técnica para o seu próximo projeto.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link to="/visitar" className="inline-flex items-center gap-2 h-12 px-7 bg-western-gold text-western-green-deep hover:bg-western-gold-soft font-mono text-xs uppercase tracking-[0.22em] transition-colors">
              Agendar visita ao ateliê <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to="/parceiro/cadastro" className="inline-flex items-center gap-2 h-12 px-7 border border-western-cream/50 text-western-cream hover:border-western-gold hover:text-western-gold-soft font-mono text-xs uppercase tracking-[0.22em] transition-colors">
              Solicitar credenciamento B2B
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
