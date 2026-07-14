import { MessageCircle, Waves, Droplets, Box, HardHat } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Seo from "@/components/seo/Seo";
import Reveal from "@/components/shared/Reveal";
import { BUSINESS } from "@/config/business";

// Foto real de obra entregue — o herói de uma página que vende sonho não pode
// ser um retângulo de cor chapada.
import heroImg from "@/assets/projetos-western/01_hero-tapirai.webp";
// Foto real do ateliê — prova de "mão na massa", não render.
import atelieImg from "@/assets/irmaos-botelho-gruta.webp";

/** Toda rampa desta página vai direto pro WhatsApp do ateliê — sem formulário. */
const waLink = (msg: string) =>
  `https://wa.me/${BUSINESS.whatsappFabrica}?text=${encodeURIComponent(msg)}`;

const WA_HERO = "Olá! Quero um projeto para a minha casa.";
const WA_FECHAMENTO =
  "Olá! Ainda estou na dúvida, queria conversar sobre um projeto para a minha casa.";

type Caminho = {
  icon: LucideIcon;
  titulo: string;
  desc: string;
  cta: string;
  msg: string;
  /**
   * Card em destaque — a maior objeção de quem chega sem CNPJ.
   * Destaque é de REALCE (borda dourada), nunca de LARGURA: o card ocupava duas
   * colunas e dominava os três caminhos principais (piscina / lago / 3D).
   */
  destaque?: boolean;
};

const CAMINHOS: Caminho[] = [
  {
    icon: Waves,
    titulo: "Piscina natural ou de praia",
    desc: "Água que parece nascida ali, com borda de pedra e prainha para entrar caminhando. A gente projeta e executa por inteiro — você só escolhe onde vai relaxar.",
    cta: "Quero a minha piscina",
    msg: "Olá! Quero uma piscina natural para a minha casa.",
  },
  {
    icon: Droplets,
    titulo: "Lago ornamental no jardim",
    desc: "Um espelho d'água vivo, com pedras que reproduzem a rocha natural e cabem no seu jardim sem obra pesada. Do desenho à última pedra, é o ateliê quem faz.",
    cta: "Quero um lago",
    msg: "Olá! Quero um lago ornamental no meu jardim.",
  },
  {
    icon: Box,
    titulo: "Projeto 3D sob medida",
    desc: "Ainda está imaginando? A gente desenha em 3D antes de qualquer obra — você vê a sua área pronta na tela e decide com calma, sem surpresa.",
    cta: "Quero ver em 3D",
    msg: "Olá! Quero ver o meu projeto em 3D.",
  },
  {
    icon: HardHat,
    titulo: "Quer a pedra, mas não tem CNPJ?",
    desc: "A nossa pedra artesanal é vendida no atacado só para profissionais. Sem empresa? Sem problema: a gente faz a obra completa para você — a pedra vai instalada, com garantia e sem dor de cabeça.",
    // Rótulo explícito, no padrão em 1ª pessoa dos vizinhos ("Quero a minha
    // piscina", "Quero um lago"). "Fazer pela Western" não dizia o que acontece.
    cta: "Quero a obra completa",
    msg: "Olá! Vi a pedra de vocês e queria para a minha casa.",
    destaque: true,
  },
  {
    icon: MessageCircle,
    titulo: "Falar com o ateliê",
    desc: "Tem uma ideia diferente — uma cascata, um muro de pedra, uma dúvida? Fale direto com quem faz. Atendimento humano, sem robô, no seu ritmo.",
    cta: "Conversar agora",
    msg: "Olá! Tenho uma ideia para a minha casa e queria conversar.",
  },
];

// DS V3 — cantos 10px, título de card 20px, corpo 17px, alvo 52px.
const CARD_ICON =
  "inline-flex h-12 w-12 items-center justify-center rounded-[10px] bg-western-paper border border-western-border-soft text-western-bronze mb-5";
const CARD_TITLE =
  "font-sans font-semibold text-[20px] leading-snug text-western-green-deep mb-2";

export default function ParaSuaCasa() {
  return (
    <>
      <Seo
        title="Para sua casa — Piscinas naturais, lagos e paisagens em pedra artesanal"
        description={`Piscinas naturais, lagos e paisagens em pedra artesanal, do projeto 3D à obra pronta. Ateliê próprio desde ${BUSINESS.fundadaEm}. Fale direto com o nosso time no WhatsApp.`}
        path="/para-sua-casa"
      />

      {/* 1) HERO — foto real de obra + scrim. Sobre foto/verde, o CTA é dourado.
       * O scrim é direcional: no desktop a tinta cheia cobre a coluna do texto
       * (AA garantido) e abre para a foto à direita; no mobile a foto é fundo
       * inteiro sob uma tinta uniforme. Nunca depender do brilho da foto. */}
      <section className="relative isolate overflow-hidden flex items-center bg-western-green-deep min-h-[520px] md:min-h-[600px]">
        <img
          src={heroImg}
          alt="Piscina natural com borda de pedra artesanal Western em residência"
          width={1600}
          height={1000}
          loading="eager"
          fetchPriority="high"
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover"
        />
        {/* Mobile: tinta uniforme sobre a foto inteira. */}
        <div
          className="absolute inset-0 md:hidden"
          style={{
            background:
              "linear-gradient(to bottom, hsl(var(--western-green-deep) / 0.92), hsl(var(--western-green-deep) / 0.82) 45%, hsl(var(--western-green-deep) / 0.94))",
          }}
          aria-hidden="true"
        />
        {/* Desktop: tinta cheia até ~46% (onde vive o texto), abrindo para a foto. */}
        <div
          className="absolute inset-0 hidden md:block"
          style={{
            background:
              "linear-gradient(to right, hsl(var(--western-green-deep)) 0%, hsl(var(--western-green-deep) / 0.94) 46%, hsl(var(--western-green-deep) / 0.60) 66%, hsl(var(--western-green-deep) / 0.15) 100%)",
          }}
          aria-hidden="true"
        />

        <div className="relative container-western py-16 md:py-24">
          <Reveal variant="fade-up" duration={700}>
            <div className="max-w-2xl">
              <p className="font-sans font-semibold text-[14px] uppercase tracking-[0.06em] text-western-gold-soft mb-4">
                Ateliê Western · desde {BUSINESS.fundadaEm} · Para a sua casa
              </p>
              <h1 className="display-xl text-western-cream">
                A sua casa merece a natureza{" "}
                <span className="text-western-gold-soft">feita à mão.</span>
              </h1>
              <p className="mt-5 text-[17px] md:text-[18px] leading-[1.6] text-western-cream/90">
                Piscinas naturais, lagos e paisagens em pedra artesanal — do sonho ao
                mergulho, com o ateliê ao seu lado do começo ao fim. Você conta o que
                imagina; a gente cuida do resto.
              </p>

              <a
                href={waLink(WA_HERO)}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-gold mt-8 w-full sm:w-auto"
              >
                <MessageCircle className="h-5 w-5" />
                Falar com o ateliê no WhatsApp
              </a>
            </div>
          </Reveal>
        </div>
      </section>

      {/* 2) OS CAMINHOS — cada card é uma rampa direta pro WhatsApp, sem formulário. */}
      <section className="surface-ivory py-16 md:py-24">
        <div className="container-western max-w-6xl">
          <Reveal variant="fade-up" duration={700}>
            <header className="max-w-2xl mb-10 md:mb-12">
              <p className="text-eyebrow">Por onde começar</p>
              <h2 className="display-lg text-western-green-deep mt-3">
                Por onde você quer começar?
              </h2>
              <p className="mt-4 text-body">
                Escolha o que mais parece com o seu sonho — cada caminho leva direto ao
                nosso time, sem formulário.
              </p>
            </header>
          </Reveal>

          {/* Todos os 5 cards com a MESMA largura (1 coluna). O destaque do card
           * do CNPJ é de borda, não de área. */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5 items-stretch">
            {CAMINHOS.map((c, i) => (
              <Reveal key={c.titulo} variant="fade-up" delay={i * 70} duration={650}>
                <article
                  className={`flex h-full flex-col bg-white rounded-[16px] p-6 md:p-7 border shadow-[0_10px_30px_-24px_hsl(var(--western-stone-dark)/0.5)] transition-colors ${
                    c.destaque
                      ? "border-western-gold ring-1 ring-western-gold/25 hover:border-western-gold"
                      : "border-western-border-soft hover:border-western-gold/50"
                  }`}
                >
                  <span className={CARD_ICON}>
                    <c.icon className="h-6 w-6" aria-hidden="true" />
                  </span>
                  <h3 className={CARD_TITLE}>{c.titulo}</h3>
                  <p className="text-body flex-1">{c.desc}</p>

                  {/* Fundo claro → CTA primário VERDE, full-width. */}
                  <a
                    href={waLink(c.msg)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary mt-6 w-full"
                  >
                    <MessageCircle className="h-5 w-5" />
                    {c.cta}
                  </a>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* 3) O ATELIÊ — a prova de que tem gente de verdade do outro lado. */}
      <section className="surface-paper py-16 md:py-24 border-y border-western-border-soft">
        <div className="container-western max-w-6xl">
          <div className="grid md:grid-cols-12 gap-10 md:gap-14 items-center">
            <Reveal variant="fade-up" duration={700} className="md:col-span-6">
              <div className="aspect-[4/3] overflow-hidden rounded-[16px]">
                <img
                  src={atelieImg}
                  alt="Equipe do ateliê Western trabalhando em uma gruta de pedra artesanal"
                  width={900}
                  height={675}
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover"
                />
              </div>
            </Reveal>

            <Reveal
              variant="fade-up"
              delay={90}
              duration={700}
              className="md:col-span-6"
            >
              <div>
                <p className="text-eyebrow">Quem faz</p>
                <h2 className="display-lg text-western-green-deep mt-3">
                  Um ateliê de verdade, de mão na massa desde {BUSINESS.fundadaEm}.
                </h2>
                <p className="mt-5 text-body">
                  Mais de {BUSINESS.anosOperacao} anos reproduzindo rocha natural pedra a
                  pedra — obras reais em casas, sítios e pousadas Brasil afora, entregues
                  por equipe própria, com garantia de {BUSINESS.garantiaLabel}. Aqui não é
                  catálogo distante: é gente que atende, projeta e executa. Você acompanha
                  cada etapa e recebe a sua paisagem pronta para usar.
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* 4) FECHAMENTO — última rampa. Sobre verde, CTA dourado. */}
      <section className="surface-forest">
        <div className="container-western max-w-3xl py-16 md:py-20 text-center">
          <Reveal variant="fade-up" duration={700}>
            <h2 className="display-md text-western-cream">
              Ainda na dúvida de por onde começar?
            </h2>
            <p className="mt-4 text-[17px] leading-[1.6] text-western-cream/85">
              Manda uma mensagem — a gente escuta a sua ideia e mostra o caminho. Sem
              compromisso.
            </p>

            <a
              href={waLink(WA_FECHAMENTO)}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-gold mt-8 w-full sm:w-auto"
            >
              <MessageCircle className="h-5 w-5" />
              Conversar no WhatsApp
            </a>

            <p className="mt-5 font-sans text-[16px] tabular-nums text-western-cream/70">
              {BUSINESS.whatsappLabel}
            </p>
          </Reveal>
        </div>
      </section>
    </>
  );
}
