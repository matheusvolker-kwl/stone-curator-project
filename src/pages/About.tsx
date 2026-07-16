import { Link } from "react-router-dom";

import SocialProof from "@/components/shared/SocialProof";
import Reveal from "@/components/shared/Reveal";
import { ArrowRight, Layers, Mountain, Recycle, Hammer } from "lucide-react";
import irmaosGruta from "@/assets/irmaos-botelho-gruta.webp";
import heroObra from "@/assets/linguagens/piscina.webp";
import projetoCascata from "@/assets/projetos/cover-cascata.webp";
import { BUSINESS } from "@/config/business";

const NUMEROS = [
  { n: "33", l: "anos de operação ininterrupta" },
  { n: "50", l: "modelos fabricados em ateliê" },
  { n: "50", l: "selecionados no catálogo atual" },
  { n: "+300", l: "projetos entregues pelo Brasil" },
];

const PILARES = [
  {
    Icon: Mountain,
    eyebrow: "Origem",
    titulo: "Da pedra real, sem extrair pedra",
    texto:
      "Cada matriz nasce de uma pedra natural moldada no próprio ambiente — Mata Atlântica, Cerrado, Caatinga e formações brasileiras. Tiramos o molde sem mover a pedra. A natureza permanece intacta; o que vai para o projeto é a réplica autoral.",
  },
  {
    Icon: Layers,
    eyebrow: "Pintura",
    titulo: "6 camadas, 5 cores em cada",
    texto:
      "Toda peça recebe seis fases de pintura manual com cinco pigmentos sobrepostos por camada — simulando a sedimentação geológica natural. Projetada para resistir a cloro, sol, chuva e variação térmica por décadas, com manutenção mínima. Garantia contratual de 1 ano contra defeito de fabricação.",
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

const VOCABULARIO = [
  { de: "Cliente", para: "Parceiro" },
  { de: "Kit", para: "Conjunto" },
  { de: "Cor", para: "Acabamento" },
  { de: "Arranjo", para: "Composição" },
];

export default function About() {
  return (
    <>
      {/* HERO — abertura editorial em superfície clara: texto + foto */}
      <section className="surface-paper py-12 md:py-20">
        <div className="container-western">
          <div className="grid gap-9 lg:grid-cols-[1.05fr_1fr] lg:gap-14 lg:items-center">
            <Reveal variant="fade-up" duration={800}>
              <p className="text-eyebrow mb-3">A Western · 1993 — 2026</p>
              <h1 className="display-xl text-western-green-deep mb-5">
                33 anos moldando<br />
                <span className="text-western-bronze">pedra sem extrair pedra.</span>
              </h1>
              <p className="text-body md:text-[19px] max-w-[46ch]">
                Fundada em São Paulo em 1993, a Western é a única fábrica brasileira que opera
                ininterruptamente — há três décadas — a tecnologia de pedra artesanal em composto
                mineral trazida do Arizona. Da Disney às piscinas do Neymar; de Cobasi ao Unique
                Garden: o repertório que sustenta a marca é a prova mais difícil de imitar.
              </p>
            </Reveal>

            <Reveal variant="fade-up" delay={140} duration={900}>
              <img
                src={heroObra}
                alt="Projeto Western — piscina com cascata de pedra artesanal"
                loading="eager"
                decoding="async"
                className="w-full aspect-[16/10] lg:aspect-[4/5] object-cover rounded-2xl shadow-[0_30px_60px_-40px_hsl(var(--western-stone-dark)/0.45)]"
              />
            </Reveal>
          </div>
        </div>
      </section>

      {/* NÚMEROS — escala da operação */}
      <section className="surface-ivory py-14 md:py-20 border-y border-western-border-soft">
        <div className="container-western">
          <div className="mx-auto max-w-5xl">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-western-border-soft border border-western-border-soft rounded-2xl overflow-hidden">
              {NUMEROS.map((s, i) => (
              <Reveal key={s.l} variant="fade-up" delay={i * 80} duration={650} distance={20}>
                <div className="bg-white h-full p-6 md:p-8 text-center">
                  <p className="font-display text-[34px] md:text-[46px] leading-none tracking-[-0.02em] text-western-green-deep tabular-nums">
                    {s.n}
                  </p>
                  <p className="text-meta mt-2 leading-snug">{s.l}</p>
                </div>
              </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* IRMÃOS BOTELHO — 2ª geração: título + foto + narrativa */}
      <section className="surface-paper py-14 md:py-20">
        <div className="container-western">
          <Reveal variant="fade-up" duration={800}>
            <div className="max-w-3xl mb-8 md:mb-10">
              <p className="text-eyebrow mb-3">Os irmãos Botelho · 2ª geração</p>
              <h2 className="display-lg text-western-green-deep">
                Ricardo no desenho, Luiz Carlos na engenharia.{" "}
                <span className="text-western-bronze">
                  Trinta anos do mesmo ateliê, da mesma família.
                </span>
              </h2>
            </div>
          </Reveal>

          <Reveal variant="fade-up" delay={120} duration={900}>
            <figure className="relative overflow-hidden rounded-2xl">
              <img
                src={irmaosGruta}
                alt="Ricardo e Luiz Carlos Botelho entre formações de pedra Western, com cascata ao fundo"
                loading="lazy"
                decoding="async"
                className="w-full aspect-[16/10] md:aspect-[21/9] object-cover"
              />
              <figcaption className="absolute bottom-4 left-4 md:bottom-6 md:left-6 max-w-[80%] rounded-lg bg-western-green-deep/90 px-4 py-3 md:px-5 md:py-4">
                <p className="text-eyebrow text-western-gold-soft mb-1">
                  {BUSINESS.cidadeAtelie}/{BUSINESS.ufAtelie} · Desde 1996
                </p>
                <p className="font-sans font-semibold text-[17px] md:text-[19px] text-western-cream leading-tight">
                  Ricardo &amp; Luiz Carlos Botelho
                </p>
              </figcaption>
            </figure>
          </Reveal>

          {/* Narrativa em coluna de leitura controlada */}
          <div className="max-w-[680px] mx-auto mt-10 md:mt-14 space-y-5">
            <Reveal variant="fade-up" delay={80} duration={750}>
              <p className="text-body">
                Em 1993, <strong className="text-western-green-deep font-semibold">Luiz Duarte
                Botelho</strong> identificou nos Estados Unidos uma técnica de pedra artesanal
                desenvolvida pelo artista plástico responsável por obras de Las Vegas e dos
                parques da Disney. Trouxe os primeiros moldes, tintas e formulações para o
                Brasil e fundou a Western em São Paulo.
              </p>
            </Reveal>
            <Reveal variant="fade-up" delay={140} duration={750}>
              <p className="text-body">
                Em 1996, <strong className="text-western-green-deep font-semibold">Ricardo
                Botelho</strong> e <strong className="text-western-green-deep font-semibold">Luiz
                Carlos Botelho</strong>, filhos do fundador, voltaram do Japão e assumiram o
                ateliê em duas frentes complementares. Ricardo conduz o desenho, a escultura e
                a direção criativa — é dele a leitura estética de cada peça, do gesto da matriz
                à composição do conjunto. Luiz Carlos responde pela engenharia: foi sob a
                coordenação dele que a Western desenvolveu o composto de cimento estrutural com
                fibra de PET reciclado, reduziu o tempo de uma matriz de 40 dias para cerca de
                1 dia, e refinou o método que torna a peça leve, resistente e simples de
                instalar.
              </p>
            </Reveal>
            <Reveal variant="fade-up" delay={200} duration={750}>
              <p className="text-body">
                Em 2026, são <strong className="text-western-green-deep font-semibold">33 anos
                de ateliê ininterrupto</strong> em {BUSINESS.cidadeAtelie}/{BUSINESS.ufAtelie},
                com 50 modelos catalogados e um lugar firmado no paisagismo brasileiro de alto
                padrão — uma operação familiar que atravessou três décadas sem trocar de mão,
                de método ou de assinatura.
              </p>
            </Reveal>

            {/* Assinatura — autoria da família Botelho */}
            <Reveal variant="fade-up" delay={260} duration={700}>
              <div className="pt-5 border-t border-western-border-soft flex items-center flex-wrap gap-3">
                <span className="text-eyebrow">2ª geração</span>
                <span className="text-western-border-strong" aria-hidden>·</span>
                <span className="text-[16px] font-semibold text-western-green-deep">
                  Ricardo &amp; Luiz Carlos Botelho
                </span>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* CITAÇÃO — Ricardo Botelho */}
      <section className="surface-ivory py-14 md:py-20 border-t border-western-border-soft">
        <div className="container-western">
          <Reveal variant="fade-up" duration={800}>
            <div className="max-w-[760px] mx-auto text-center">
              <div className="w-[34px] h-[2px] bg-western-gold mx-auto mb-6" aria-hidden />
              <blockquote className="display-md text-western-green-deep leading-[1.32]">
                "Não vendemos pedra. Oferecemos elemento autoral para o projeto — pintado à mão,
                peça por peça, no nosso ateliê."
              </blockquote>
              <p className="text-eyebrow mt-6">Ricardo Botelho · Diretor de criação</p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* MÉTODO — 4 pilares */}
      <section className="surface-paper py-14 md:py-20 border-t border-western-border-soft">
        <div className="container-western">
          <Reveal variant="fade-up" duration={750}>
            <div className="max-w-2xl mb-9 md:mb-12">
              <p className="text-eyebrow mb-3">O método Western</p>
              <h2 className="display-lg text-western-green-deep">
                Quatro pilares que diferenciam o que sai do ateliê.
              </h2>
            </div>
          </Reveal>

          <div className="grid md:grid-cols-2 gap-4 md:gap-5">
            {PILARES.map(({ Icon, eyebrow, titulo, texto }, i) => (
              <Reveal key={titulo} variant="fade-up" delay={i * 100} duration={700} distance={24}>
                <article className="h-full bg-white border border-western-border-soft rounded-2xl p-6 md:p-8">
                  <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-western-paper mb-5">
                    <Icon className="h-6 w-6 text-western-bronze" strokeWidth={1.75} />
                  </span>
                  <p className="text-eyebrow mb-2">{eyebrow}</p>
                  <h3 className="display-md text-western-green-deep mb-3">{titulo}</h3>
                  <p className="text-body">{texto}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* OBRAS — a vitrine vive em /inspiracoes (por segmento). Aqui é só a
          ponte: nada de repetir a galeria numa segunda superfície. */}
      <section className="surface-forest py-14 md:py-20 border-y border-western-gold/15">
        <div className="container-western">
          <Reveal variant="fade-up" duration={700}>
            <div className="text-center max-w-2xl mx-auto">
              <p className="font-sans text-[14px] font-semibold uppercase tracking-[0.06em] text-western-gold-soft mb-4">
                Obras entregues
              </p>
              <div className="w-12 h-px bg-western-gold mx-auto mb-5" />
              <h2 className="display-lg text-western-cream">
                De piscinas de celebridades a endereços icônicos.
              </h2>
              <p className="font-sans text-[17px] leading-[1.6] text-western-cream/85 mt-4 mb-8">
                A ideia por trás de cada obra, as fotos do que já foi entregue e as peças que
                compõem cada cena.
              </p>
              <Link to="/inspiracoes" className="btn-gold w-full sm:w-auto">
                Ver as obras <ArrowRight className="h-5 w-5" strokeWidth={1.75} />
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* PROVA SOCIAL — rostos + marcas */}
      <section className="surface-ivory py-14 md:py-20">
        <div className="container-western">
          <div className="mx-auto max-w-5xl">
          <Reveal variant="fade-up" duration={800}>
            <div className="text-center max-w-2xl mx-auto mb-9 md:mb-12">
              <p className="text-eyebrow mb-3">Especificada por</p>
              <h2 className="display-lg text-western-green-deep">
                Profissionais e marcas que assinam com a Western.
              </h2>
            </div>
            <SocialProof interactive groups={["celebridades", "profissionais", "marcas"]} />
          </Reveal>
          </div>
        </div>
      </section>

      {/* VOCABULÁRIO DO ATELIÊ */}
      <section className="surface-paper py-14 md:py-20 border-t border-western-border-soft">
        <div className="container-western">
          <Reveal variant="fade-up" duration={750}>
            <div className="max-w-2xl mb-8 md:mb-10">
              <p className="text-eyebrow mb-3">Filosofia de marca</p>
              <h2 className="display-lg text-western-green-deep">O vocabulário do ateliê.</h2>
            </div>
          </Reveal>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-western-border-soft border border-western-border-soft rounded-2xl overflow-hidden">
            {VOCABULARIO.map((p, i) => (
              <Reveal key={p.de} variant="fade-up" delay={i * 90} duration={650} distance={18}>
                <div className="bg-white h-full p-5 md:p-6">
                  <p className="text-meta line-through">{p.de}</p>
                  <p className="display-md text-western-bronze mt-1 flex items-center gap-1.5">
                    <ArrowRight className="h-4 w-4 text-western-gold shrink-0" strokeWidth={1.75} aria-hidden />
                    {p.para}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal variant="fade-up" delay={200} duration={750}>
            <p className="text-body max-w-[640px] mt-6">
              A Western adota um vocabulário próprio porque o relacionamento é de coprojeto, e o
              que se entrega é uma obra integrada — não um item de varejo. Esse cuidado de
              linguagem eleva a categoria.
            </p>
          </Reveal>
        </div>
      </section>

      {/* CTA FINAL — faixa institucional escura */}
      <section className="relative overflow-hidden surface-forest py-16 md:py-24">
        <img
          src={projetoCascata}
          alt=""
          aria-hidden
          loading="lazy"
          decoding="async"
          className="absolute inset-0 w-full h-full object-cover opacity-25"
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
            <p className="text-eyebrow text-western-gold-soft mb-3">Próximo passo</p>
            <h2 className="display-lg text-western-cream mb-5">
              Conheça o ateliê em {BUSINESS.cidadeAtelie}/{BUSINESS.ufAtelie}.
            </h2>
            <p className="text-[17px] md:text-[19px] leading-[1.6] text-western-cream-muted max-w-xl mx-auto mb-8">
              Visita guiada com Ricardo ou Luiz Carlos, repertório completo de acabamentos na mão e
              apresentação técnica para o seu próximo projeto.
            </p>

            <div className="flex flex-col sm:flex-row sm:justify-center gap-3">
              <Link to="/visitar" className="btn-gold w-full sm:w-auto">
                Agendar visita ao ateliê
                <ArrowRight className="h-5 w-5" strokeWidth={1.75} aria-hidden />
              </Link>
              <Link to="/parceiro/cadastro" className="btn-outline-cream w-full sm:w-auto">
                Solicitar credenciamento B2B
              </Link>
            </div>

            <p className="text-[14px] text-western-cream-muted mt-7">
              Ateliê desde {BUSINESS.fundadaEm} · Compra segura · Garantia de{" "}
              {BUSINESS.garantiaLabel} · CNPJ {BUSINESS.cnpj}
            </p>
          </Reveal>
        </div>
      </section>
    </>
  );
}
