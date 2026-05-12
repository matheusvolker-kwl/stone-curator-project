import { Link } from "react-router-dom";
import MarcasInstitucionais from "@/components/shared/MarcasInstitucionais";
import ArquitetosStrip from "@/components/shared/ArquitetosStrip";
import Reveal from "@/components/shared/Reveal";
import { useScrollY } from "@/hooks/useScrollY";
import { ArrowRight, Layers, Mountain, Recycle, Hammer, Quote } from "lucide-react";
import retrato from "@/assets/ricardo-luiz-carlos.webp";
import irmaosGruta from "@/assets/irmaos-botelho-gruta.webp";
import heroCascata from "@/assets/hero-cascata.webp";
import respiroPedra from "@/assets/respiro-pedra.webp";
import projetoCascata from "@/assets/projetos/cover-cascata.webp";
import obraCascataTropical from "@/assets/about-projetos/cascata-tropical.webp";
import obraCascataMirante from "@/assets/about-projetos/cascata-mirante.webp";
import obraPiscinaPraia from "@/assets/about-projetos/piscina-praia.webp";
import obraDetalheMatriz from "@/assets/about-projetos/detalhe-matriz.jpg";
import obraBordaPedra from "@/assets/about-projetos/borda-pedra.webp";
import obraCascataEscalonada from "@/assets/about-projetos/cascata-escalonada.jpg";
import iconePedraBranco from "@/assets/icone-pedra-branco.png";
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
  const scrollY = useScrollY();

  return (
    <>
      {/* HERO — atmosférico com foto de fundo e símbolo flutuante */}
      <section className="relative overflow-hidden bg-western-green-deep min-h-[62vh] flex items-center">
        <img
          src={heroCascata}
          alt=""
          aria-hidden
          className="absolute inset-0 w-full h-full object-cover opacity-40 will-change-transform"
          style={{ transform: `translate3d(0, ${scrollY * 0.18}px, 0) scale(${1 + scrollY * 0.0003})` }}
        />
        <div
          className="absolute inset-0 pointer-events-none"
          aria-hidden
          style={{
            background:
              "linear-gradient(180deg, hsl(var(--western-green-deep) / 0.55) 0%, hsl(var(--western-green-deep) / 0.85) 70%, hsl(var(--western-green-deep)) 100%)",
          }}
        />
        <img
          src={iconePedraBranco}
          alt=""
          aria-hidden
          className="absolute right-[4%] top-1/2 w-[44vw] max-w-[640px] opacity-[0.08] pointer-events-none select-none mix-blend-screen will-change-transform"
          style={{ transform: `translate3d(0, calc(-50% + ${scrollY * -0.06}px), 0)` }}
        />

        <div className="container-western py-16 md:py-20 max-w-4xl relative">
          <Reveal variant="fade-up" duration={800}>
            <p className="text-eyebrow text-western-gold-soft mb-5">A Western · 1993 — 2026</p>
            <div className="w-12 h-px bg-western-gold mb-6" />
          </Reveal>
          <Reveal variant="fade-up" delay={120} duration={900}>
            <h1 className="font-display text-4xl md:text-6xl lg:text-7xl text-western-cream leading-[1.02] mb-6">
              33 anos moldando<br />
              <span className="italic text-western-gold-soft font-light">pedra sem extrair pedra.</span>
            </h1>
          </Reveal>
          <Reveal variant="fade-up" delay={240} duration={900}>
            <p className="text-lg md:text-xl text-western-cream-muted leading-relaxed max-w-2xl">
              Fundada em São Paulo em 1993, a Western é a única fábrica brasileira que opera
              ininterruptamente — há três décadas — a tecnologia de pedra artesanal em composto
              mineral trazida do Arizona. Da Disney às piscinas do Neymar; de Cobasi ao Unique
              Garden: o repertório que sustenta a marca é a prova mais difícil de imitar.
            </p>
          </Reveal>
        </div>
      </section>

      {/* NÚMEROS — escala da operação */}
      <section className="surface-cream py-14 md:py-16 border-y border-western-stone-warm/10">
        <div className="container-western max-w-5xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-western-stone-warm/15">
            {[
              { n: "33", l: "anos de operação ininterrupta" },
              { n: "+400", l: "modelos fabricados em ateliê" },
              { n: "50", l: "selecionados no catálogo atual" },
              { n: "+300", l: "projetos entregues pelo Brasil" },
            ].map((s, i) => (
              <Reveal key={s.l} variant="fade-up" delay={i * 80} duration={650} distance={20}>
                <div className="bg-western-cream p-5 md:p-7 text-center h-full">
                  <p className="font-display text-3xl md:text-5xl text-western-green-deep tabular-nums">{s.n}</p>
                  <p className="text-spec text-western-stone-warm/80 mt-2 leading-snug">{s.l}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* IRMÃOS BOTELHO — seção única editorial: título + foto widescreen + narrativa */}
      <section className="surface-ivory py-20 md:py-24">
        <div className="container-western max-w-[1600px]">
          <Reveal variant="fade-up" duration={800}>
            <div className="max-w-3xl mb-10 md:mb-14">
              <p className="text-eyebrow mb-3">Os irmãos Botelho · 2ª geração</p>
              <h2 className="font-display text-3xl md:text-5xl text-western-green-deep leading-[1.05]">
                Ricardo no desenho, Luiz Carlos na engenharia.
                <span className="italic text-western-gold-soft font-light"> Trinta anos do mesmo ateliê, da mesma família.</span>
              </h2>
            </div>
          </Reveal>

          <Reveal variant="fade-up" delay={120} duration={900}>
            <figure className="relative overflow-hidden shadow-2xl shadow-western-green-deep/25">
              <div className="aspect-[21/9] w-full">
                <img
                  src={irmaosGruta}
                  alt="Ricardo e Luiz Carlos Botelho entre formações de pedra Western, com cascata ao fundo"
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover"
                />
              </div>
              <div
                className="absolute inset-x-0 bottom-0 h-1/3 pointer-events-none"
                aria-hidden
                style={{
                  background:
                    "linear-gradient(180deg, transparent 0%, hsl(var(--western-green-deep) / 0.65) 100%)",
                }}
              />
              <figcaption className="absolute bottom-5 left-5 md:bottom-8 md:left-8 bg-western-green-deep/85 backdrop-blur-sm px-4 py-3 md:px-5 md:py-4 max-w-[320px]">
                <p className="text-eyebrow text-western-gold-soft mb-1">Cajamar/SP · Desde 1996</p>
                <p className="font-display text-base md:text-lg text-western-cream leading-tight">
                  Ricardo &amp; Luiz Carlos Botelho
                </p>
              </figcaption>
            </figure>
          </Reveal>

          {/* Narrativa em coluna controlada abaixo da foto */}
          <div className="max-w-3xl mx-auto mt-14 md:mt-20 space-y-6 text-base md:text-lg text-western-stone-warm leading-relaxed">
            <Reveal variant="fade-up" delay={80} duration={750}>
              <p>
                Em 1993, <strong className="text-western-green-deep font-semibold">Luiz Duarte
                Botelho</strong> identificou nos Estados Unidos uma técnica de pedra artesanal
                desenvolvida pelo artista plástico responsável por obras de Las Vegas e dos
                parques da Disney. Trouxe os primeiros moldes, tintas e formulações para o
                Brasil e fundou a Western em São Paulo.
              </p>
            </Reveal>
            <Reveal variant="fade-up" delay={140} duration={750}>
              <p>
                Em 1996, <strong className="text-western-green-deep font-semibold">Ricardo
                Botelho</strong> e <strong className="text-western-green-deep font-semibold">Luiz
                Carlos Botelho</strong>, filhos do fundador, voltaram do Japão e assumiram o
                ateliê em duas frentes complementares. Ricardo conduz o desenho, a escultura e
                a direção criativa — é dele a leitura estética de cada peça, do gesto da matriz
                à composição do conjunto. Luiz Carlos responde pela engenharia do produto: foi
                sob a coordenação dele que a Western desenvolveu o composto de cimento
                estrutural com fibra de PET reciclado, reduziu o tempo de uma matriz de 40 dias
                para cerca de 1 dia, e refinou o método que torna a peça leve, resistente e
                simples de instalar.
              </p>
            </Reveal>
            <Reveal variant="fade-up" delay={200} duration={750}>
              <p>
                Em 2026, são <strong className="text-western-green-deep font-semibold">33 anos
                de ateliê ininterrupto</strong> em {BUSINESS.cidadeAtelie}/{BUSINESS.ufAtelie},
                com 50 modelos catalogados e um lugar firmado no paisagismo brasileiro de alto
                padrão — uma operação familiar que atravessou três décadas sem trocar de mão,
                de método ou de assinatura.
              </p>
            </Reveal>

            {/* Assinatura final */}
            <Reveal variant="fade-up" delay={260} duration={700}>
              <div className="pt-6 mt-2 border-t border-western-stone-warm/20 flex items-baseline gap-4">
                <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-western-gold">
                  2ª geração
                </span>
                <span className="text-western-stone-warm/40">·</span>
                <span className="text-spec text-western-green-deep font-semibold">
                  Ricardo &amp; Luiz Carlos Botelho
                </span>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* CITAÇÃO — quebra editorial em surface-paper com imagem larga */}
      <section className="relative overflow-hidden">
        <div className="relative h-[55vh] min-h-[420px] w-full">
          <img
            src={respiroPedra}
            alt=""
            aria-hidden
            className="absolute left-0 top-[-12%] w-full h-[124%] object-cover will-change-transform"
            style={{ transform: `translate3d(0, ${(scrollY - 800) * 0.05}px, 0)` }}
          />
          <div
            className="absolute inset-0"
            aria-hidden
            style={{
              background:
                "linear-gradient(180deg, hsl(var(--western-green-deep) / 0.65) 0%, hsl(var(--western-green-deep) / 0.5) 50%, hsl(var(--western-green-deep) / 0.75) 100%)",
            }}
          />
          <div className="absolute inset-0 flex items-center">
            <div className="container-western max-w-4xl">
              <Reveal variant="fade-up" duration={900}>
                <Quote className="h-10 w-10 text-western-gold-soft mb-6" strokeWidth={1.2} />
                <blockquote className="font-display text-2xl md:text-4xl lg:text-5xl text-western-cream leading-[1.15] italic font-light">
                  "Não vendemos pedra. Oferecemos elemento autoral para o projeto —
                  pintado à mão, peça por peça, no nosso ateliê."
                </blockquote>
                <p className="mt-8 text-eyebrow text-western-gold-soft">
                  Ricardo Botelho · Diretor de criação
                </p>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* 4 PILARES */}
      <section className="surface-paper py-20 md:py-24 border-t border-western-stone-warm/10">
        <div className="container-western max-w-6xl">
          <Reveal variant="fade-up" duration={750}>
            <div className="max-w-2xl mb-14">
              <p className="text-eyebrow mb-3">O método Western</p>
              <h2 className="font-display text-3xl md:text-5xl text-western-green-deep leading-[1.05]">
                Quatro pilares que diferenciam<br />o que sai do ateliê.
              </h2>
            </div>
          </Reveal>

          <div className="grid md:grid-cols-2 gap-px bg-western-stone-warm/15">
            {PILARES.map(({ Icon, eyebrow, titulo, texto }, i) => (
              <Reveal key={titulo} variant="fade-up" delay={i * 100} duration={700} distance={24}>
                <div className="group bg-western-cream p-8 md:p-12 h-full transition-colors duration-500 hover:bg-western-paper">
                  <Icon className="h-8 w-8 text-western-gold mb-6 transition-transform duration-500 group-hover:-translate-y-1 group-hover:rotate-[-4deg]" strokeWidth={1.3} />
                  <p className="text-eyebrow mb-3">{eyebrow}</p>
                  <h3 className="font-display text-2xl md:text-3xl text-western-green-deep leading-tight mb-4">
                    {titulo}
                  </h3>
                  <p className="text-sm md:text-base text-western-stone-warm leading-relaxed">
                    {texto}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* GALERIA — Mural editorial de obras */}
      <section className="surface-ivory py-20 md:py-24 border-t border-western-stone-warm/10">
        <div className="container-western max-w-6xl">
          <Reveal variant="fade-up" duration={750}>
            <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-end mb-12 md:mb-16">
              <div>
                <p className="text-eyebrow mb-3">Repertório</p>
                <h2 className="font-display text-3xl md:text-5xl text-western-green-deep leading-[1.05]">
                  Obras que assinamos<br />nas últimas décadas.
                </h2>
              </div>
              <p className="text-western-stone-warm leading-relaxed text-sm md:text-base max-w-md md:justify-self-end">
                Cascatas, prainhas, lagos ornamentais e bordas integradas em residências de alto padrão, hospitalidade de luxo e paisagismo autoral pelo Brasil.
              </p>
            </div>
          </Reveal>

          {(() => {
            const hero = {
              src: obraBordaPedra,
              alt: "Borda de pedra integrada à piscina em projeto Western",
              tipologia: "Borda Integrada",
              local: "Pool · Acabamento natural",
            };
            const obras = [
              { src: obraCascataTropical, alt: "Cascata em pedra Western em piscina tropical", tipologia: "Cascata Tropical", local: "Residencial" },
              { src: obraCascataMirante, alt: "Cascata Western escalonada com vista de serra", tipologia: "Cascata Mirante", local: "Vista de serra" },
              { src: obraPiscinaPraia, alt: "Piscina-praia com pedra sonora aplicada", tipologia: "Piscina-Praia", local: "Pedra sonora" },
            ];

            const Caption = ({ index, tipologia, local }: { index: number; tipologia: string; local: string }) => (
              <figcaption className="pt-3 flex items-baseline justify-between gap-3 border-t border-western-stone-warm/20">
                <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-western-green-deep">
                  <span className="text-western-gold/70 mr-2">{String(index).padStart(2, "0")}</span>
                  {tipologia}
                </p>
                <p className="text-[10px] text-western-stone-warm font-mono uppercase tracking-[0.16em] text-right">
                  {local}
                </p>
              </figcaption>
            );

            return (
              <div className="space-y-6 md:space-y-8">
                {/* Hero panorâmica */}
                <Reveal variant="fade-up" duration={800}>
                  <figure className="group">
                    <div className="relative aspect-[16/9] md:aspect-[21/9] overflow-hidden">
                      <img
                        src={hero.src}
                        alt={hero.alt}
                        loading="lazy"
                        decoding="async"
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1600ms] ease-out group-hover:scale-[1.03]"
                      />
                    </div>
                    <Caption index={1} tipologia={hero.tipologia} local={hero.local} />
                  </figure>
                </Reveal>

                {/* Trio vertical */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 md:gap-8">
                  {obras.map((o, i) => (
                    <Reveal key={i} variant="fade-up" delay={i * 110} duration={750}>
                      <figure className="group">
                        <div className="relative aspect-[4/5] overflow-hidden">
                          <img
                            src={o.src}
                            alt={o.alt}
                            loading="lazy"
                            decoding="async"
                            className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1400ms] ease-out group-hover:scale-[1.04]"
                          />
                        </div>
                        <Caption index={i + 2} tipologia={o.tipologia} local={o.local} />
                      </figure>
                    </Reveal>
                  ))}
                </div>
              </div>
            );
          })()}
        </div>
      </section>

      {/* MANIFESTO — vocabulário & filosofia */}
      <section className="surface-forest py-20 md:py-24 relative overflow-hidden">
        <img
          src={iconePedraBranco}
          alt=""
          aria-hidden
          className="absolute -left-12 bottom-0 w-[40vw] max-w-[520px] opacity-[0.05] pointer-events-none mix-blend-screen"
        />
        <div className="container-western max-w-4xl text-center relative">
          <Reveal variant="fade-up" duration={750}>
            <p className="text-eyebrow text-western-gold-soft mb-5">Filosofia de marca</p>
            <div className="w-12 h-px bg-western-gold mx-auto mb-8" />
            <p className="font-display text-2xl md:text-4xl text-western-cream leading-[1.2] mb-12">
              Não vendemos pedra.<br />
              <span className="italic text-western-gold-soft font-light">
                Oferecemos elemento autoral para o projeto.
              </span>
            </p>
          </Reveal>
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-px bg-western-gold/15 text-left">
            {[
              { de: "Cliente", para: "Parceiro" },
              { de: "Kit", para: "Conjunto" },
              { de: "Cor", para: "Acabamento" },
              { de: "Arranjo", para: "Composição" },
            ].map((p, i) => (
              <Reveal key={p.de} variant="fade-up" delay={i * 90} duration={650} distance={18}>
                <div className="bg-western-green-deep p-6 md:p-7 h-full transition-colors hover:bg-western-green-deep/80">
                  <p className="text-spec text-western-cream-muted/70 line-through">{p.de}</p>
                  <p className="font-display text-xl md:text-2xl text-western-gold-soft mt-1">{p.para}</p>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal variant="fade-up" delay={200} duration={750}>
            <p className="text-western-cream-muted leading-relaxed mt-12 max-w-2xl mx-auto">
              A Western adota um vocabulário próprio porque o relacionamento é de coprojeto, e o
              que se entrega é uma obra integrada — não um item de varejo. Esse cuidado de
              linguagem eleva a categoria.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ARQUITETOS + MARCAS — prova social */}
      <section className="surface-ivory py-20 md:py-24">
        <div className="container-western max-w-5xl">
          <Reveal variant="fade-up" duration={800}>
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
          </Reveal>

          <Reveal variant="fade-up" delay={120} duration={800}>
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
          </Reveal>
        </div>
      </section>

      {/* CTA FINAL — atmosférico */}
      <section className="relative overflow-hidden">
        <div className="relative min-h-[58vh] flex items-center surface-forest py-20">
          <img
            src={projetoCascata}
            alt=""
            aria-hidden
            className="absolute left-0 top-[-12%] w-full h-[124%] object-cover opacity-25 will-change-transform"
            style={{ transform: `translate3d(0, ${(scrollY - 2500) * 0.04}px, 0)` }}
          />
          <div
            className="absolute inset-0 pointer-events-none"
            aria-hidden
            style={{
              background:
                "linear-gradient(180deg, hsl(var(--western-green-deep) / 0.85) 0%, hsl(var(--western-green-deep) / 0.95) 100%)",
            }}
          />
          <div className="container-western max-w-3xl text-center relative">
            <Reveal variant="fade-up" duration={800}>
              <p className="text-eyebrow text-western-gold-soft mb-4">Próximo passo</p>
              <div className="w-12 h-px bg-western-gold mx-auto mb-8" />
              <h2 className="font-display text-3xl md:text-5xl text-western-cream leading-[1.05] mb-6">
                Conheça o ateliê em<br />
                <span className="italic text-western-gold-soft font-light">
                  {BUSINESS.cidadeAtelie}/{BUSINESS.ufAtelie}.
                </span>
              </h2>
              <p className="text-western-cream-muted leading-relaxed mb-10 max-w-xl mx-auto text-base md:text-lg">
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
            </Reveal>
          </div>
        </div>
      </section>
    </>
  );
}
