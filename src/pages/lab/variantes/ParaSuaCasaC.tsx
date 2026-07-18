/* VERSÃO C — "O SEU QUINTAL".
 * Tese: desejo nasce de PROJEÇÃO. A página trabalha para o leitor trocar
 * "que bonito" por "isso cabe na minha casa" — as obras entram como ESPELHO,
 * não como vitrine. Por isso a aérea do Módulo 15 vem cedo (dá noção de terreno
 * e de escala, que foto de perto esconde) e o arco do Conrado (croqui → 3D →
 * obra) entra como promessa de processo: "o seu também começa a lápis".
 * Ordem: sonho → escala → escolha do caminho → como isso vira obra → prova →
 * pedido. O primeiro CTA só aparece na seção "Qual desses é o seu?", depois de
 * a pessoa já ter escolhido um caminho — antes disso a página não pede nada.
 * Sacrifica: o CTA de contato no hero (a primeira dobra só convida a descer) e
 * a vitrine antiga de três obras (Tato/Evandro/Riviera), que sai em favor das
 * duas entregas novas — a prova de nomes fica na faixa de prova social.
 */
import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  MessageCircle,
  Send,
  Loader2,
  Check,
  MapPin,
  ShieldCheck,
  Eye,
  ArrowDown,
  ArrowRight,
} from "lucide-react";
import { toast } from "sonner";
import Seo from "@/components/seo/Seo";
import Reveal from "@/components/shared/Reveal";
import SocialProof from "@/components/shared/SocialProof";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import TurnstileWidget from "@/components/security/TurnstileWidget";
import FieldLabel from "@/components/forms/FieldLabel";
import PhoneInput from "@/components/forms/PhoneInput";
import EmailInput from "@/components/forms/EmailInput";
import { formatPhoneBR } from "@/lib/forms/br";
import { submitSecureLead } from "@/lib/leads";
import { BUSINESS } from "@/config/business";

import heroImg from "@/assets/para-sua-casa/hero.webp";
import imgPiscina from "@/assets/linguagens/piscina-praia.webp";
import imgLago from "@/assets/segmentos/lagos/02.webp";
import imgCascata from "@/assets/segmentos/cascatas/01.webp";
import imgJardim from "@/assets/segmentos/jardins/01.webp";

/* MÓDULO 15 — piscina natural de praia. As seis verticais são 2:3 nativas
   (1400×2100) e as duas aéreas 3:4 (1400×1867). Nenhuma delas é reenquadrada
   fora da própria proporção nesta página. */
import m15Cascata from "@/assets/obras/modulo15/01-cascata.webp";
import m15Ampla from "@/assets/obras/modulo15/02-ampla.webp";
import m15Praia from "@/assets/obras/modulo15/04-praia.webp";
import m15Rede from "@/assets/obras/modulo15/06-rede.webp";
import m15Aerea from "@/assets/obras/modulo15/07-aerea.webp";
import m15AereaDeck from "@/assets/obras/modulo15/08-aerea-deck.webp";

/* CONRADO · Vinhedo/SP — o arco completo da MESMA parede de cascatas.
   Croqui é croqui, render é render, obra é obra: cada um é rotulado, e nenhum
   render aparece como fotografia. É a rotulagem que faz o arco valer. */
import conradoCroqui from "@/assets/obras/conrado/01-croqui.webp";
import conradoRender from "@/assets/obras/conrado/02-render.webp";
import conradoObra from "@/assets/obras/conrado/03-obra.webp";
import conradoCascata from "@/assets/obras/conrado/04-cascata.webp";
import conradoAmpla from "@/assets/obras/conrado/05-ampla.webp";
import conradoEstar from "@/assets/obras/conrado/06-estar.webp";

import atelieImg from "@/assets/irmaos-botelho-gruta.webp";
import atelieVisita from "@/assets/visitar/atelie-hero.webp";

const waLink = (msg: string) =>
  `https://wa.me/${BUSINESS.whatsappFabrica}?text=${encodeURIComponent(msg)}`;

/* As quatro verticais do Módulo 15. A legenda descreve o que se vê na foto —
   não o conceito. min-h fixo no <figcaption> garante que as quatro linhas de
   base coincidam mesmo quando uma legenda quebra em duas linhas. */
const M15_FOTOS = [
  {
    img: m15Cascata,
    alt: "Cascata caindo sobre pedra artesanal direto na água turquesa da piscina, com vegetação tropical em volta.",
    legenda: "A cascata cai direto na água.",
  },
  {
    img: m15Praia,
    alt: "Borda de praia curva: a faixa de areia clara encontra o gramado e entra na água sem degrau.",
    legenda: "A areia entra na água. Não tem degrau.",
  },
  {
    img: m15Ampla,
    alt: "Vista ampla da piscina com o deck de madeira e a parede de vidro da casa do outro lado da água.",
    legenda: "Do outro lado da água, o deck e o vidro.",
  },
  {
    img: m15Rede,
    alt: "Rede verde armada entre a vegetação densa, na sombra, ao lado da piscina.",
    legenda: "Uma rede na sombra, ao lado da água.",
  },
];

const M15_AEREAS = [
  {
    img: m15Aerea,
    alt: "Vista aérea da piscina natural: o contorno inteiro da água, a faixa de areia da praia e a vegetação tropical em volta.",
    legenda: "O desenho inteiro, visto de cima.",
  },
  {
    img: m15AereaDeck,
    alt: "Vista aérea da mesma piscina, com o deck de madeira e as espreguiçadeiras à beira da água.",
    legenda: "O deck e as espreguiçadeiras na borda.",
  },
];

/* Os caminhos deixam de ser catálogo e viram PERGUNTA: cada cartão é uma
   resposta possível a "qual desses é o seu?". Os textos são os da página atual. */
const CAMINHOS = [
  {
    img: imgPiscina,
    titulo: "Piscina natural ou de praia",
    desc: "Entra caminhando pela areia, água por sal — sem cloro, sem olho ardendo. A gente projeta e executa por inteiro.",
    cta: "Esse é o meu",
    msg: "Olá! Quero uma piscina natural para a minha casa.",
    alt: "Piscina de praia com borda de areia e pedra artesanal, cercada de vegetação.",
  },
  {
    img: imgLago,
    titulo: "Lago com carpas",
    desc: "Um espelho d'água vivo no seu jardim, com peixe e planta na mesma água — sem obra pesada.",
    cta: "Esse é o meu",
    msg: "Olá! Quero um lago ornamental no meu jardim.",
    alt: "Lago ornamental com pedras na borda e plantas aquáticas.",
  },
  {
    img: imgCascata,
    titulo: "Cascata no quintal",
    desc: "O som de água que transforma o fim de tarde. Tão leve que sobe até a laje ou a cobertura, sem guindaste.",
    cta: "Esse é o meu",
    msg: "Olá! Quero uma cascata na minha casa.",
    alt: "Cascata de pedra artesanal caindo entre plantas em um jardim.",
  },
  {
    img: imgJardim,
    titulo: "Jardim de pedra",
    desc: "Pedras que parecem ter nascido ali, com ou sem água. Do quintal ao terraço.",
    cta: "Esse é o meu",
    msg: "Olá! Quero um jardim com pedras Western.",
    alt: "Jardim com blocos de pedra artesanal integrados ao paisagismo.",
  },
];

/* Arco do Conrado. Rótulo explícito em cada estágio.
   Proporções nativas diferentes (croqui 2,24:1, render 16:9, obra 4:3). O
   trilho é 16/9 — a mesma régua que a /para-sua-casa já usa nesta sequência:
     · croqui: object-contain sobre paper (cover cortaria ~40% do desenho).
       Em 16/9 sobra ~20% de papel em cima e embaixo, que lê como margem da
       folha; num container 4/3 sobrava 58% e o cartão lia como slab vazio ao
       lado dos outros dois.
     · render: 1400×788 é 16/9 exato — entra sem corte nenhum.
     · obra: 4:3 com cover, corte consciente de topo/base numa foto horizontal. */
const ARCO = [
  {
    n: "1",
    label: "Croqui à mão",
    img: conradoCroqui,
    contain: true,
    d: "O primeiro traço do projeto, a lápis.",
    alt: "Croqui a lápis de uma parede de pedra: a queda d'água maior à esquerda, a fileira de quedas menores em cortina à direita e a água curvando em primeiro plano.",
  },
  {
    n: "2",
    label: "Render 3D",
    img: conradoRender,
    contain: false,
    d: "A mesma vista em 3D, para você ajustar.",
    alt: "Render 3D da mesma parede de pedra: a queda maior à esquerda, a fileira de quedas em cortina à direita e a água turquesa na frente.",
  },
  {
    n: "3",
    label: "A obra construída",
    img: conradoObra,
    contain: false,
    d: "Executada pela nossa equipe.",
    alt: "Foto da obra pronta em dia de sol: a parede de pedra com a queda maior à esquerda, as quedas menores ao longo da borda e a piscina de água turquesa com entrada de areia.",
  },
];

const PASSOS = [
  { n: "1", t: "Você conta o seu sonho", d: "Manda uma mensagem no WhatsApp ou preenche o formulário. Sem burocracia.", gratis: true },
  { n: "2", t: "A gente escuta e mostra o caminho", d: "Entendemos a sua área, a viabilidade e damos uma estimativa real. Sem compromisso.", gratis: true },
  { n: "3", t: "Seu projeto em 3D", d: "Você vê a sua área pronta na tela e ajusta até ficar do seu jeito.", gratis: false },
  { n: "4", t: "A obra completa", d: "Equipe própria executa e entrega pronta para usar, com garantia.", gratis: false },
];

const CONFIANCA = [
  { icon: MapPin, label: "Atendemos todo o Brasil" },
  { icon: Eye, label: "Projeto 3D antes da obra" },
  { icon: ShieldCheck, label: `Ateliê desde ${BUSINESS.fundadaEm}` },
  { icon: Check, label: `Garantia de ${BUSINESS.garantiaLabel}` },
];

const FAQ_ITEMS = [
  {
    q: "Quanto custa uma piscina natural?",
    a: "Depende do tamanho e do que você sonha. Como referência, em São Paulo uma piscina de praia fica na faixa de R$ 7 a 10 mil por m². Na primeira conversa — que é grátis — a gente entende seu projeto e te passa uma estimativa real.",
  },
  {
    q: "Quanto tempo demora?",
    a: "O projeto em 3D fica pronto em 10 a 25 dias úteis. A obra, no caso de uma piscina, roda na ordem de 45 dias úteis. Combinamos o cronograma com você antes de começar.",
  },
  {
    q: "Vocês atendem no meu estado?",
    a: "Sim, atendemos o Brasil inteiro. O ateliê fica em Cajamar, na Grande São Paulo, e fora da nossa área ideal executamos remotamente — o projeto 3D existe justamente para isso.",
  },
  {
    q: "Preciso já ter um projeto pronto?",
    a: "Não. Você chega com a ideia (ou só com a vontade) e a gente desenha tudo em 3D fotorrealista. Você vê a sua área pronta na tela e ajusta antes de qualquer obra.",
  },
  {
    q: "É sem cloro? Dá muito trabalho manter?",
    a: "A água é tratada por salinização: o sal vira o agente que limpa a água, sem cloro, sem cheiro, sem olho ardendo. O sistema se autorregula — por isso peixe e planta vivem no lago, e a piscina fica macia e transparente.",
  },
  {
    q: "Não tenho empresa nem CNPJ. Consigo mesmo assim?",
    a: "Consegue, sim. A pedra avulsa vendemos só para profissionais, mas para a sua casa fazemos a obra completa: a pedra vai instalada, com garantia de 1 ano, sem você precisar de empresa nem se preocupar com nada.",
  },
];

const CONTROL =
  "h-control w-full rounded-lg border-[1.5px] border-western-border-strong bg-western-paper px-4 font-sans text-[15px] text-western-green-deep placeholder:text-western-stone-warm/60 outline-none transition-colors focus:border-western-green-deep";

export default function ParaSuaCasaC() {
  const formRef = useRef<HTMLDivElement>(null);
  const obrasRef = useRef<HTMLElement>(null);
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [email, setEmail] = useState("");
  const [cidade, setCidade] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);

  /* Só existe o scroll para as obras: nesta versão o hero não oferece caminho
     para o formulário (o pedido vem depois das obras). O scrollToForm que
     morava aqui não era chamado por ninguém. */
  const scrollToObras = () => obrasRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (enviando) return;
    if (!nome.trim() || telefone.replace(/\D/g, "").length < 10) {
      toast.error("Preencha nome e WhatsApp (mínimo 10 dígitos).");
      return;
    }
    if (!captchaToken) {
      toast.error("Confirme que você não é um robô.");
      return;
    }
    setEnviando(true);
    try {
      const res = await submitSecureLead(
        {
          type: "contato",
          nome: nome.trim(),
          email: email.trim() || null,
          telefone: telefone.trim(),
          mensagem: mensagem.trim() || null,
          origem: "para-sua-casa",
          payload: { cidade: cidade.trim() || null, pagina: "/para-sua-casa" },
        },
        captchaToken,
      );
      if (!res.ok) throw new Error(res.error ?? "erro");
    } catch (err) {
      console.warn("[para-sua-casa-c] falha ao gravar lead:", err);
    }
    const msg = [
      "Olá, Western! Vim pelo site e quero um projeto para a minha casa.",
      "",
      `Nome: ${nome || "—"}`,
      `WhatsApp: ${telefone ? formatPhoneBR(telefone) : "—"}`,
      email ? `E-mail: ${email}` : null,
      cidade ? `Cidade: ${cidade}` : null,
      mensagem ? "" : null,
      mensagem ? "Meu sonho:" : null,
      mensagem || null,
    ]
      .filter((x) => x !== null)
      .join("\n");
    window.open(waLink(msg), "_blank", "noopener,noreferrer");
    toast.success("Abrimos o WhatsApp com a sua mensagem pronta.");
    setEnviando(false);
    setCaptchaToken(null);
  };

  return (
    <>
      <Seo
        title="Para sua casa — Piscinas naturais, lagos e paisagens em pedra artesanal"
        description={`Piscinas de praia, lagos e cascatas em pedra artesanal, do projeto 3D à obra pronta. Ateliê próprio desde ${BUSINESS.fundadaEm}. Fale direto com o nosso time.`}
        path="/para-sua-casa"
      />

      {/* 1 — HERO: PERGUNTA, NÃO PEDIDO.
          A primeira dobra não tem CTA de contato de propósito: nesta versão o
          pedido só aparece depois de o leitor ter escolhido um caminho. O único
          controle aqui desce para as obras. */}
      <section className="relative isolate overflow-hidden flex items-center bg-western-green-deep min-h-[540px] md:min-h-[620px]">
        <img
          src={heroImg}
          alt="Piscina de praia com borda de pedra artesanal, faixa de areia entrando na água e jardim tropical em volta"
          width={2200}
          height={1356}
          loading="eager"
          fetchPriority="high"
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div
          className="absolute inset-0 md:hidden"
          style={{
            background:
              "linear-gradient(to bottom, hsl(var(--western-green-deep) / 0.94) 0%, hsl(var(--western-green-deep) / 0.84) 48%, hsl(var(--western-green-deep) / 0.55) 78%, hsl(var(--western-green-deep) / 0.72) 100%)",
          }}
          aria-hidden="true"
        />
        <div
          className="absolute inset-0 hidden md:block"
          style={{
            background:
              "linear-gradient(180deg, transparent 55%, hsl(var(--western-green-deep) / 0.50) 100%), linear-gradient(100deg, hsl(var(--western-green-deep) / 0.92) 0%, hsl(var(--western-green-deep) / 0.62) 42%, hsl(var(--western-green-deep) / 0.20) 68%, hsl(var(--western-green-deep) / 0.05) 100%)",
          }}
          aria-hidden="true"
        />

        <div className="relative container-western py-16 md:py-24">
          <Reveal variant="fade-up" duration={700}>
            <div className="max-w-2xl">
              <p className="text-eyebrow-dark mb-4">
                Ateliê Western · para a sua casa · desde {BUSINESS.fundadaEm}
              </p>
              <h1 className="display-xl text-western-cream">
                O que cabe no{" "}
                <span className="text-western-gold-soft">seu quintal?</span>
              </h1>
              <p className="mt-5 text-[16px] md:text-[17px] leading-[1.6] text-western-cream/90 max-w-prose">
                Duas entregas recentes, do primeiro traço à água. Olhe com calma: é assim que a gente
                vai olhar para a sua área.
              </p>

              <div className="mt-8">
                <button type="button" onClick={scrollToObras} className="btn-outline-cream w-full sm:w-auto">
                  <ArrowDown className="h-5 w-5" aria-hidden="true" />
                  Ver as duas obras
                </button>
              </div>

              <p className="mt-8 text-[15px] leading-relaxed text-western-cream/80">
                Nas casas de Neymar Jr. · Tato (Falamansa) · Caito Maia
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* 2 — MÓDULO 15: O QUINTAL INTEIRO.
          Verticais 2:3 nativas em fileira (2 colunas no celular, 4 no desktop) e,
          logo abaixo, as duas aéreas 3:4 — é a aérea que dá a noção de terreno
          que a foto de perto esconde. Nenhuma foto sai da própria proporção. */}
      <section ref={obrasRef} className="surface-ivory section">
        <div className="container-western">
          <Reveal variant="fade-up" duration={700}>
            <header className="max-w-prose-lg mb-10 md:mb-12">
              <p className="text-eyebrow">Entrega recente · Módulo 15</p>
              <h2 className="display-lg text-western-green-deep mt-3">
                Isto aqui é um quintal.
              </h2>
              <p className="mt-4 text-body">
                Areia entrando na água, cascata sobre pedra artesanal, rede na sombra. A água é
                tratada por sal — sem cloro, sem olho ardendo.
              </p>
            </header>
          </Reveal>

          <ul className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 list-none p-0 m-0">
            {M15_FOTOS.map((f) => (
              <li key={f.legenda}>
                <figure className="m-0">
                  <div className="aspect-[2/3] overflow-hidden rounded-xl bg-western-cream-muted">
                    <img
                      src={f.img}
                      alt={f.alt}
                      width={1400}
                      height={2100}
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-cover"
                    />
                  </div>
                  {/* min-h iguala a linha de base das quatro legendas mesmo
                      quando uma delas quebra em duas linhas no celular. */}
                  <figcaption className="mt-3 min-h-[3rem] text-[15px] leading-[1.5] text-western-stone-warm">
                    {f.legenda}
                  </figcaption>
                </figure>
              </li>
            ))}
          </ul>

          {/* A ESCALA. É aqui que o leitor troca "que bonito" por "quanto de
              terreno isso pede" — a pergunta que ele faria sozinho, respondida
              por imagem antes de virar texto. */}
          <Reveal variant="fade-up" delay={80} duration={700}>
            <div className="mt-14 md:mt-16 grid md:grid-cols-12 gap-8 md:gap-12 items-start">
              <div className="md:col-span-4">
                <p className="text-eyebrow">De cima</p>
                <h3 className="display-md text-western-green-deep mt-3">
                  O desenho inteiro, dentro do terreno.
                </h3>
                <p className="mt-4 text-body">
                  É esta vista que a gente desenha primeiro: onde a água começa, por onde se entra
                  caminhando, quanto de gramado sobra em volta. A sua área também vai ser lida assim,
                  antes de qualquer obra.
                </p>
              </div>
              <ul className="md:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 list-none p-0 m-0">
                {M15_AEREAS.map((a) => (
                  <li key={a.legenda}>
                    <figure className="m-0">
                      <div className="aspect-[3/4] overflow-hidden rounded-xl bg-western-cream-muted">
                        <img
                          src={a.img}
                          alt={a.alt}
                          width={1400}
                          height={1867}
                          loading="lazy"
                          decoding="async"
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <figcaption className="mt-3 min-h-[3rem] text-[15px] leading-[1.5] text-western-stone-warm">
                        {a.legenda}
                      </figcaption>
                    </figure>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
      </section>

      {/* 3 — QUAL DESSES É O SEU?
          PRIMEIRO CTA DA PÁGINA. Vem aqui e não antes: o leitor acabou de ver
          uma obra inteira e uma noção de terreno; agora ele se declara. O botão
          fala pela pessoa ("Esse é o meu"), não pela empresa. */}
      <section className="surface-paper section border-y border-western-border-soft">
        <div className="container-western">
          <Reveal variant="fade-up" duration={700}>
            <header className="max-w-prose-lg mb-10 md:mb-12">
              <p className="text-eyebrow">O seu caminho</p>
              <h2 className="display-lg text-western-green-deep mt-3">
                Qual desses é o seu?
              </h2>
              <p className="mt-4 text-body">
                Quatro formas de ter água em casa. Escolha a que mais parece com o que você imagina —
                a conversa começa por ela, direto com o nosso time.
              </p>
            </header>
          </Reveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {CAMINHOS.map((c, i) => (
              <Reveal key={c.titulo} variant="fade-up" delay={i * 70} duration={650} className="h-full">
                <article className="flex h-full flex-col bg-white rounded-xl overflow-hidden border border-western-border-soft shadow-card">
                  <div className="aspect-[4/3] overflow-hidden bg-western-cream-muted">
                    {/* eager: estas 4 fotos SÃO o conteúdo da seção de escolha;
                        lazy deixava caixas cinza no meio da decisão. */}
                    <img
                      src={c.img}
                      alt={c.alt}
                      width={1100}
                      height={825}
                      loading="eager"
                      decoding="async"
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="flex flex-1 flex-col p-5 md:p-6">
                    {/* min-h de duas linhas: sem isso o corpo dos quatro cartões
                        começa em alturas diferentes (título de 1 × 2 linhas).
                        48px = 2 × (18px × 1,3) do .text-title-sm — o mesmo
                        número dos passos, que estava 50 aqui e 48 lá. */}
                    <h3 className="text-title-sm min-h-[48px] mb-2">{c.titulo}</h3>
                    <p className="text-body flex-1">{c.desc}</p>
                    <a
                      href={waLink(c.msg)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-gold mt-5 w-full"
                    >
                      <MessageCircle className="h-5 w-5" aria-hidden="true" />
                      {c.cta}
                    </a>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* 4 — O ARCO DO CONRADO: A PROMESSA DE PROCESSO.
          Depois de escolher um caminho, a pergunta natural é "e como isso vira
          real na minha casa?". O arco responde com a mesma vista em três
          estágios, cada um rotulado pelo que é. */}
      <section className="surface-forest section">
        <div className="container-western">
          <Reveal variant="fade-up" duration={700}>
            <div className="max-w-prose-lg">
              <p className="text-eyebrow-dark mb-4">Conrado · Vinhedo/SP</p>
              <h2 className="display-lg text-western-cream">
                O seu também{" "}
                <span className="text-western-gold-soft">começa a lápis.</span>
              </h2>
              <p className="mt-5 text-[16px] leading-[1.6] text-western-cream/85">
                A parede de cascatas do Conrado, nos três estágios: o croqui à mão, o render 3D e a
                obra construída — o mesmo enquadramento nas três. O projeto 3D fica pronto em 10 a 25
                dias úteis, e você ajusta antes de a obra começar.
              </p>
            </div>
          </Reveal>

          <Reveal variant="fade-up" delay={90} duration={700}>
            <ol className="mt-10 md:mt-12 grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6 list-none p-0">
              {ARCO.map((x) => (
                <li key={x.n}>
                  <figure className="m-0">
                    <div className="aspect-[16/9] overflow-hidden rounded-xl ring-1 ring-western-gold/20 bg-western-paper">
                      <img
                        src={x.img}
                        alt={x.alt}
                        loading="lazy"
                        decoding="async"
                        className={`h-full w-full ${x.contain ? "object-contain" : "object-cover"}`}
                      />
                    </div>
                    <figcaption className="mt-3">
                      <span className="font-sans text-[14px] font-semibold text-western-gold-soft tabular-nums">
                        {x.n} · {x.label}
                      </span>
                      <span className="mt-1 block min-h-[3rem] text-[15px] leading-[1.5] text-western-cream/75">
                        {x.d}
                      </span>
                    </figcaption>
                  </figure>
                </li>
              ))}
            </ol>
          </Reveal>

          <Reveal variant="fade-up" delay={140} duration={700}>
            <p className="mt-6 max-w-prose-lg text-[15px] leading-[1.6] text-western-cream/70">
              Repare na queda maior à esquerda e na fileira de quedas menores ao lado: é a mesma
              composição no papel, na tela e na obra.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row sm:items-center gap-x-6 gap-y-4">
              <a
                href={waLink("Olá! Quero ver a minha área em 3D antes da obra.")}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-gold w-full sm:w-auto"
              >
                <MessageCircle className="h-5 w-5" aria-hidden="true" />
                Quero ver a minha em 3D
              </a>
              <Link to="/a-pedra" className="link-cta-dark">
                Como a pedra é feita
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* 5 — CONRADO ENTREGUE: O DESFECHO DO ARCO.
          A ampla 4:3 ocupa o trilho inteiro (é o pagamento da promessa da seção
          anterior) e as duas verticais 3:4 vêm abaixo, na mesma régua. */}
      <section className="surface-paper section border-b border-western-border-soft">
        <div className="container-western">
          <Reveal variant="fade-up" duration={700}>
            <header className="max-w-prose-lg mb-8 md:mb-10">
              <p className="text-eyebrow">Depois da obra</p>
              <h2 className="display-lg text-western-green-deep mt-3">
                E, no fim, é isto que fica.
              </h2>
            </header>
          </Reveal>

          <Reveal variant="fade-up" delay={60} duration={700}>
            <figure className="m-0">
              <div className="aspect-[4/3] overflow-hidden rounded-xl bg-western-cream-muted">
                <img
                  src={conradoAmpla}
                  alt="Vista ampla da piscina do Conrado: a parede de cascatas ao fundo, palmeiras, puffs na borda e piso de pedra em volta da água."
                  width={1400}
                  height={1050}
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover"
                />
              </div>
              {/* A legenda descreve a foto e para no que a página sustenta.
                  Dizia "a piscina, o piso de pedra e o paisagismo — tudo
                  projetado e executado por nós": o escopo do paisagismo (as
                  palmeiras, o plantio) não está em lugar nenhum do material —
                  era autoria assumida por dedução a partir da imagem. */}
              <figcaption className="mt-3 text-[15px] leading-[1.5] text-western-stone-warm">
                A parede de cascatas, a água e o piso de pedra em volta — a mesma vista do croqui,
                agora em uso.
              </figcaption>
            </figure>
          </Reveal>

          <Reveal variant="fade-up" delay={110} duration={700}>
            <ul className="mt-6 md:mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 list-none p-0 m-0">
              {[
                {
                  img: conradoCascata,
                  alt: "A cascata do Conrado em detalhe, caindo pela parede de pedra artesanal, com a casa moderna ao fundo.",
                  legenda: "A cascata de perto, com a casa atrás.",
                },
                {
                  img: conradoEstar,
                  alt: "Área de estar ao lado da piscina, com palmeiras, paisagismo e pedra artesanal em volta.",
                  legenda: "A área de estar, do lado de fora da água.",
                },
              ].map((f) => (
                <li key={f.legenda}>
                  <figure className="m-0">
                    {/* 3/4, não 2/3: as duas verticais do Conrado são 1400×1867
                        (0,75), enquanto as do Módulo 15 são 1400×2100 (0,667).
                        Estavam num container 2/3 declarando height={2100} — a
                        proporção errada cortava faixa da foto e o width/height
                        mentia a intrínseca para o browser. */}
                    <div className="aspect-[3/4] overflow-hidden rounded-xl bg-western-cream-muted">
                      <img
                        src={f.img}
                        alt={f.alt}
                        width={1400}
                        height={1867}
                        loading="lazy"
                        decoding="async"
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <figcaption className="mt-3 min-h-[3rem] text-[15px] leading-[1.5] text-western-stone-warm">
                      {f.legenda}
                    </figcaption>
                  </figure>
                </li>
              ))}
            </ul>
          </Reveal>

          <div className="mt-10 flex flex-col sm:flex-row sm:items-center gap-x-6 gap-y-4">
            <a
              href={waLink("Olá! Vi as obras no site e quero uma assim na minha casa.")}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-gold w-full sm:w-auto"
            >
              <MessageCircle className="h-5 w-5" aria-hidden="true" />
              Quero uma assim na minha casa
            </a>
            <Link to="/obras" className="link-cta">
              Ver todas as obras
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      {/* 6 — COMO FUNCIONA */}
      <section className="surface-ivory section">
        <div className="container-western">
          <Reveal variant="fade-up" duration={700}>
            <header className="max-w-prose-lg mb-10 md:mb-12">
              <p className="text-eyebrow">Como funciona</p>
              <h2 className="display-lg text-western-green-deep mt-3">
                Do primeiro "oi" ao primeiro mergulho
              </h2>
              <p className="mt-4 text-body">
                Os dois primeiros passos são{" "}
                <span className="font-semibold text-western-green-deep">grátis e sem compromisso</span>.
                Você só decide seguir depois de conhecer.
              </p>
            </header>
          </Reveal>

          {/* Reveal fica FORA do <ol>: wrapper entre lista e item é markup
              inválido e desalinha a grade. */}
          <Reveal variant="fade-up" delay={80} duration={700}>
            <ol className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 list-none p-0 m-0">
              {PASSOS.map((p) => (
                <li
                  key={p.n}
                  className={`relative h-full bg-white rounded-lg p-6 border shadow-card ${
                    p.gratis ? "border-western-gold/50" : "border-western-border-soft"
                  }`}
                >
                  {p.gratis && (
                    <span className="absolute -top-3 left-6 rounded-sm bg-western-gold px-2.5 py-1 font-sans text-[14px] font-semibold leading-none text-western-green-deep">
                      Grátis
                    </span>
                  )}
                  <span className="font-display text-[32px] leading-none text-western-bronze block mb-3">
                    {p.n}
                  </span>
                  {/* min-h de 2 linhas: alinha o início do corpo nos 4 cartões. */}
                  <h3 className="text-title-sm min-h-[48px] mb-2">{p.t}</h3>
                  <p className="text-[15px] leading-relaxed text-western-stone-warm">{p.d}</p>
                </li>
              ))}
            </ol>
          </Reveal>
        </div>
      </section>

      {/* 7 — PROVA SOCIAL */}
      <section className="surface-paper section border-y border-western-border-soft">
        <div className="container-western">
          <Reveal variant="fade-up" duration={750}>
            <SocialProof
              interactive
              eyebrow="Quem já tem uma"
              titulo={<>Quem já tem uma na própria casa.</>}
              groups={["celebridades"]}
            />
          </Reveal>
        </div>
      </section>

      {/* 8 — O ATELIÊ + O CONVITE.
          Mesma régua 6/6 nos dois blocos, com o lado da foto alternado: a
          leitura muda sem a geometria mudar. */}
      <section className="surface-ivory section">
        <div className="container-western">
          <div className="grid md:grid-cols-12 gap-10 md:gap-14 items-center">
            <Reveal variant="fade-up" duration={700} className="md:col-span-6">
              <div className="aspect-[4/3] overflow-hidden rounded-xl">
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
            <Reveal variant="fade-up" delay={90} duration={700} className="md:col-span-6">
              <div>
                <p className="text-eyebrow">Quem faz</p>
                <h2 className="display-lg text-western-green-deep mt-3">
                  Um ateliê de verdade, de mão na massa desde {BUSINESS.fundadaEm}.
                </h2>
                <p className="mt-5 text-body">
                  Mais de {BUSINESS.anosOperacao} anos reproduzindo rocha natural pedra a pedra — obras
                  reais em casas, sítios e pousadas Brasil afora, entregues por equipe própria, com
                  garantia de {BUSINESS.garantiaLabel}. Aqui não é catálogo distante: é gente que
                  atende, projeta e executa.
                </p>
              </div>
            </Reveal>
          </div>

          <Reveal variant="fade-up" delay={120} duration={700}>
            <div className="mt-12 md:mt-16 grid md:grid-cols-12 gap-10 md:gap-14 items-center overflow-hidden rounded-xl border border-western-border-soft bg-white">
              <div className="order-2 p-6 pt-0 md:order-1 md:col-span-6 md:p-8">
                <p className="text-eyebrow">Visita ao ateliê</p>
                <h3 className="display-md text-western-green-deep mt-3">
                  Antes de decidir, venha pôr a mão na pedra.
                </h3>
                <p className="mt-4 text-[16px] leading-[1.6] text-western-stone-warm">
                  O ateliê recebe com hora marcada. Dá pra ver as peças montadas em escala e
                  conversar com quem produz.
                </p>
                <p className="mt-4 text-[15px] leading-[1.6] text-western-stone-warm">
                  {BUSINESS.cidadeAtelie}/{BUSINESS.ufAtelie} · {BUSINESS.horarioAtelie}
                </p>
                <Link to="/visitar" className="btn-gold mt-7 w-full sm:w-auto">
                  <MapPin className="h-5 w-5" aria-hidden="true" />
                  Agendar uma visita
                </Link>
              </div>
              <div className="order-1 md:order-2 md:col-span-6">
                <div className="aspect-[4/3] overflow-hidden">
                  <img
                    src={atelieVisita}
                    alt="Deck de madeira do ateliê à beira de uma piscina de borda de praia com água turquesa. Um homem sentado na beira do deck, com os pés dentro da água, toca violão. Atrás, um pavilhão com pergolado de varas e a porta de vidro aberta; à direita, uma palmeira e pedra Western."
                    width={1200}
                    height={900}
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-cover"
                  />
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* 9 — FAQ */}
      <section className="surface-paper section border-t border-western-border-soft">
        <div className="container-western">
          <div className="mx-auto max-w-3xl">
            <Reveal variant="fade-up" duration={700}>
              <header className="mb-10">
                <p className="text-eyebrow">Perguntas frequentes</p>
                <h2 className="display-lg text-western-green-deep mt-3">
                  As dúvidas de quem está começando
                </h2>
              </header>
            </Reveal>
            <Reveal variant="fade-up" delay={80} duration={700}>
              <Accordion
                type="single"
                collapsible
                className="bg-white border border-western-border-soft rounded-xl overflow-hidden"
              >
                {FAQ_ITEMS.map((item, i) => (
                  <AccordionItem
                    key={item.q}
                    value={`item-${i}`}
                    className="border-b border-western-border-soft last:border-b-0 px-5 md:px-7"
                  >
                    <AccordionTrigger className="text-left font-sans font-semibold text-[16px] md:text-[17px] text-western-green-deep hover:no-underline py-5 min-h-tap">
                      {item.q}
                    </AccordionTrigger>
                    <AccordionContent className="text-western-stone-warm text-[16px] leading-[1.6] pb-6">
                      {item.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </Reveal>
          </div>
        </div>
      </section>

      {/* 10 — FAIXA DE CREDENCIAL.
          Desceu do topo para cá de propósito: nesta versão a credencial não
          disputa com a primeira dobra, ela sustenta o pedido que vem logo
          abaixo. Exceção de ritmo declarada: py-6, não .section. */}
      <section className="surface-ivory border-y border-western-border-soft">
        <div className="container-western py-6">
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 list-none p-0 m-0">
            {CONFIANCA.map((c) => (
              <li key={c.label} className="flex items-center gap-3">
                <c.icon className="h-5 w-5 shrink-0 text-western-bronze" aria-hidden="true" />
                <span className="font-sans text-[15px] font-medium text-western-green-deep">
                  {c.label}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* 11 — FECHAMENTO + CAPTURA */}
      <section ref={formRef} id="contato" className="surface-forest section">
        <div className="container-western">
          <div className="max-w-5xl mx-auto">
            <div className="grid md:grid-cols-12 gap-10 md:gap-14 items-start">
              <Reveal variant="fade-up" duration={700} className="md:col-span-5">
                <div>
                  <p className="text-eyebrow-dark mb-3">Sem compromisso</p>
                  <h2 className="display-lg text-western-cream">
                    Agora conte da sua área.{" "}
                    <span className="text-western-gold-soft">A gente mostra o caminho.</span>
                  </h2>
                  <p className="mt-5 text-[16px] leading-[1.6] text-western-cream/85">
                    Só <strong className="font-semibold text-western-cream">nome e WhatsApp</strong> são
                    obrigatórios. Ao enviar, abrimos o WhatsApp com a sua mensagem já pronta.
                  </p>
                  <ul className="mt-7 space-y-3 list-none p-0">
                    {["A gente escuta a sua ideia", "Vê a viabilidade na sua área", "Passa uma estimativa real"].map(
                      (b) => (
                        <li key={b} className="flex gap-3 text-[15px] leading-relaxed text-western-cream/85">
                          <Check className="h-5 w-5 shrink-0 mt-0.5 text-western-gold-soft" aria-hidden="true" />
                          <span>{b}</span>
                        </li>
                      ),
                    )}
                  </ul>
                  <a
                    href={waLink("Olá! Ainda estou na dúvida, queria conversar sobre um projeto para a minha casa.")}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="tap-target mt-7 inline-flex items-center gap-2 text-[15px] font-semibold text-western-gold-soft underline underline-offset-4 decoration-western-gold/50 hover:decoration-western-gold-soft"
                  >
                    <MessageCircle className="h-5 w-5" aria-hidden="true" />
                    Prefere só conversar? Chama no WhatsApp
                  </a>
                </div>
              </Reveal>

              <Reveal variant="fade-up" delay={100} duration={700} className="md:col-span-7">
                <form
                  onSubmit={handleSubmit}
                  className="bg-white border border-western-border-soft rounded-xl p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-5"
                  noValidate
                >
                  <div>
                    <FieldLabel htmlFor="pcc-nome" required>Nome</FieldLabel>
                    <input id="pcc-nome" required value={nome} onChange={(e) => setNome(e.target.value)} autoComplete="name" className={CONTROL} />
                  </div>
                  <div>
                    <FieldLabel htmlFor="pcc-tel" required>WhatsApp</FieldLabel>
                    <PhoneInput id="pcc-tel" name="telefone" value={telefone} onChange={setTelefone} required />
                  </div>
                  <div>
                    <FieldLabel htmlFor="pcc-email" optional>E-mail</FieldLabel>
                    <EmailInput id="pcc-email" value={email} onChange={setEmail} />
                  </div>
                  <div>
                    <FieldLabel htmlFor="pcc-cidade" optional>Cidade</FieldLabel>
                    <input id="pcc-cidade" value={cidade} onChange={(e) => setCidade(e.target.value)} autoComplete="address-level2" placeholder="Cidade / UF" className={CONTROL} />
                  </div>
                  <div className="md:col-span-2">
                    <FieldLabel htmlFor="pcc-msg" optional>Conte da sua área</FieldLabel>
                    <textarea
                      id="pcc-msg"
                      rows={4}
                      value={mensagem}
                      onChange={(e) => setMensagem(e.target.value)}
                      placeholder="Quintal, terraço, sítio? Tem gramado, deck, desnível? Conta pra gente."
                      className="w-full rounded-lg border-[1.5px] border-western-border-strong bg-western-paper px-4 py-3 font-sans text-[15px] leading-[1.6] text-western-green-deep placeholder:text-western-stone-warm/60 outline-none transition-colors focus:border-western-green-deep resize-none"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <TurnstileWidget onToken={setCaptchaToken} onExpire={() => setCaptchaToken(null)} />
                  </div>
                  <div className="md:col-span-2 flex flex-col sm:flex-row sm:items-center gap-3">
                    <button type="submit" disabled={enviando} className="btn-gold w-full sm:w-auto">
                      {enviando ? (
                        <>
                          <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
                          Enviando…
                        </>
                      ) : (
                        <>
                          <Send className="h-5 w-5" aria-hidden="true" />
                          Falar sobre a minha área
                        </>
                      )}
                    </button>
                    <span className="text-meta text-center sm:text-left">Sem compromisso · Resposta rápida</span>
                  </div>
                  <div className="md:col-span-2 pt-5 border-t border-western-border-soft grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      { icon: ShieldCheck, label: `Garantia de ${BUSINESS.garantiaLabel}` },
                      { icon: Check, label: `Ateliê brasileiro desde ${BUSINESS.fundadaEm}` },
                      { icon: MapPin, label: "Atendemos todo o Brasil" },
                      { icon: MessageCircle, label: "Sem compromisso" },
                    ].map((t) => (
                      <span key={t.label} className="flex items-center gap-2 text-meta">
                        <t.icon className="h-4 w-4 shrink-0 text-western-bronze" aria-hidden="true" />
                        {t.label}
                      </span>
                    ))}
                  </div>
                </form>
              </Reveal>
            </div>

            <p className="mt-10 text-center text-[15px] text-western-cream/70">
              É profissional com CNPJ?{" "}
              <Link to="/parceiro/cadastro" className="font-semibold text-western-gold-soft underline underline-offset-4">
                Compre a pedra no atacado
              </Link>
              .
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
