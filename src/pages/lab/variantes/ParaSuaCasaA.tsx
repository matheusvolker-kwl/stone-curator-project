/* VARIANTE A — "IMERSÃO".
 * Tese de desejo: o desejo nasce de ESTAR no lugar, não de ler sobre ele. A página
 * abre dentro da imagem e permanece lá: duas obras inteiras (Módulo 15 e Conrado)
 * antes de qualquer pedido. O texto entra como legenda de revista — uma linha por
 * cena, nunca bloco — e o primeiro CTA só aparece depois que o arco croqui→render→
 * obra fecha, porque é ali que a pessoa acabou de ver a prova de entrega.
 * Ordem: hero → Módulo 15 (4 bandas) → Conrado (arco + a casa) → 1º CTA + credenciais
 * → caminhos → como funciona → ateliê/prova → FAQ → captura.
 * Sacrifica: a barra de confiança sai da primeira dobra, o hero perde os dois botões
 * e os 4 caminhos perdem seus botões dourados individuais (viram cartão-link inteiro).
 * Quem chega decidido e com pressa rola mais para achar o primeiro botão.
 *
 * ⚠ LEGENDA SE ESCREVE OLHANDO A FOTO, NUNCA DE MEMÓRIA. Numa revisão as fotos
 * foram abertas uma a uma e 4 textos descreviam o que se ESPERAVA ver: a 02-ampla
 * ganhou "a casa" (não há casa nenhuma no quadro) e pôs o vidro à direita quando
 * ele está à esquerda; os alts das duas aéreas estavam trocados (as espreguiçadeiras
 * são da 07, e a 08 é um close do raso); a rede foi posta "na sombra" estando em
 * pleno sol. É o mesmo erro que já derrubou a legenda do Evandro na página-mãe.
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
import atelieVisita from "@/assets/visitar/atelie-hero.webp";

/* MÓDULO 15 — verticais 2:3 e duas aéreas 3:4. Cada banda agrupa fotos de MESMA
   proporção: é o que mantém legenda alinhada com legenda sem forçar corte. */
import m15Ampla from "@/assets/obras/modulo15/02-ampla.webp";
import m15CascataDetalhe from "@/assets/obras/modulo15/03-cascata-detalhe.webp";
import m15Cascata from "@/assets/obras/modulo15/01-cascata.webp";
import m15Praia from "@/assets/obras/modulo15/04-praia.webp";
import m15Borda from "@/assets/obras/modulo15/05-borda.webp";
import m15Rede from "@/assets/obras/modulo15/06-rede.webp";
import m15Aerea from "@/assets/obras/modulo15/07-aerea.webp";
import m15AereaDeck from "@/assets/obras/modulo15/08-aerea-deck.webp";

/* CONRADO — o arco completo da MESMA vista, nos três estágios. As três proporções
   são diferentes (2,24:1 / 16:9 / 4:3), por isso cada uma vai numa LINHA própria
   com a proporção nativa: nenhuma é cortada para caber ao lado da outra, e a
   legenda encosta na base da imagem (md:self-end) em todas as três. */
import conradoCroqui from "@/assets/obras/conrado/01-croqui.webp";
import conradoRender from "@/assets/obras/conrado/02-render.webp";
import conradoObra from "@/assets/obras/conrado/03-obra.webp";
import conradoCascata from "@/assets/obras/conrado/04-cascata.webp";
import conradoAmpla from "@/assets/obras/conrado/05-ampla.webp";
import conradoEstar from "@/assets/obras/conrado/06-estar.webp";

const waLink = (msg: string) =>
  `https://wa.me/${BUSINESS.whatsappFabrica}?text=${encodeURIComponent(msg)}`;

/* Uma legenda por cena. Curtas e de comprimento parecido de propósito: em grade
   de 4 colunas é o que faz as quatro legendas ocuparem a mesma altura. */
const M15_CENAS = [
  {
    img: m15Cascata,
    alt: "Cascata caindo sobre pedra artesanal direto na água turquesa da piscina, com vegetação tropical em volta.",
    legenda: "A cascata cai direto na água.",
  },
  {
    img: m15Praia,
    alt: "A borda de praia curva da piscina encontrando o gramado, com a areia clara entrando na água turquesa.",
    legenda: "A areia entra na água, sem degrau.",
  },
  {
    img: m15Borda,
    alt: "O raso da praia visto de perto: pedras dentro da água rasa e areia clara na borda.",
    legenda: "No raso dá pé, e a pedra fica dentro.",
  },
  {
    img: m15Rede,
    alt: "Rede verde-escura armada no gramado, em frente a um canteiro de folhagens tropicais.",
    legenda: "A rede fica no gramado, ao lado.",
  },
];

/* O arco. Rótulo honesto em cada estágio: croqui é croqui, render é render,
   obra é obra. É a rotulagem que faz a sequência valer alguma coisa. */
const CONRADO_ARCO = [
  {
    img: conradoCroqui,
    n: "1",
    rotulo: "Croqui à mão",
    legenda: "O primeiro traço da parede de cascatas, à mão.",
    alt: "Croqui à mão em traço preto sobre papel branco: a parede de cascatas, com a queda maior e a fileira de quedas menores ao longo da borda.",
    ratio: "aspect-[1400/626]",
  },
  {
    img: conradoRender,
    n: "2",
    rotulo: "Render 3D",
    legenda: "A mesma vista em 3D, para aprovar antes da obra.",
    alt: "Render em 3D da mesma parede de cascatas: as quedas sobre a pedra e a água da piscina em primeiro plano.",
    ratio: "aspect-[1400/788]",
  },
  {
    img: conradoObra,
    n: "3",
    rotulo: "A obra construída",
    legenda: "A mesma vista, depois de executada pela nossa equipe.",
    alt: "A obra construída, na mesma vista do croqui e do render: a parede de cascatas em pedra artesanal despejando na piscina, com a casa ao fundo.",
    ratio: "aspect-[4/3]",
  },
];

const CAMINHOS = [
  {
    img: imgPiscina,
    titulo: "Piscina natural ou de praia",
    desc: "Entra caminhando pela areia, água por sal — sem cloro, sem olho ardendo.",
    msg: "Olá! Quero uma piscina natural para a minha casa.",
  },
  {
    img: imgLago,
    titulo: "Lago com carpas",
    desc: "Um espelho d'água vivo no jardim, com peixe e planta na mesma água.",
    msg: "Olá! Quero um lago ornamental no meu jardim.",
  },
  {
    img: imgCascata,
    titulo: "Cascata no quintal",
    desc: "O som de água no fim de tarde. Tão leve que sobe até a laje, sem guindaste.",
    msg: "Olá! Quero uma cascata na minha casa.",
  },
  {
    img: imgJardim,
    titulo: "Jardim de pedra",
    desc: "Pedras que parecem ter nascido ali, com ou sem água. Do quintal ao terraço.",
    msg: "Olá! Quero um jardim com pedras Western.",
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
    a: "Consegue, sim. A pedra avulsa vendemos só para profissionais, mas para a sua casa fazemos a obra completa: a pedra vai instalada, com garantia de 5 anos na peça, sem você precisar de empresa nem se preocupar com nada.",
  },
];

const CONTROL =
  "h-control w-full rounded-lg border-[1.5px] border-western-border-strong bg-western-paper px-4 font-sans text-[15px] text-western-green-deep placeholder:text-western-stone-warm/60 outline-none transition-colors focus:border-western-green-deep";

/* Legenda de foto em grade: altura mínima igual em todas as colunas, para que
   quatro legendas de comprimentos diferentes não deixem a base da banda serrilhada. */
const LEGENDA = "mt-3 min-h-[3rem] text-[15px] leading-[1.5]";

export default function ParaSuaCasaA() {
  const formRef = useRef<HTMLDivElement>(null);
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [email, setEmail] = useState("");
  const [cidade, setCidade] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);

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
          payload: { cidade: cidade.trim() || null, pagina: "/lab/para-sua-casa-a" },
        },
        captchaToken,
      );
      if (!res.ok) throw new Error(res.error ?? "erro");
    } catch (err) {
      console.warn("[para-sua-casa-a] falha ao gravar lead:", err);
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

      {/* 1 — HERO IMERSIVO.
          Sem botão, de propósito: a variante A só pede depois de mostrar. O scrim
          é só na base (a foto fica limpa em cima) e o texto se apoia no rodapé da
          imagem, alinhado ao mesmo trilho de todas as seções abaixo. */}
      <section className="relative isolate flex min-h-[620px] items-end overflow-hidden bg-western-green-deep md:min-h-[88vh]">
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
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to top, hsl(var(--western-green-deep) / 0.92) 0%, hsl(var(--western-green-deep) / 0.62) 30%, hsl(var(--western-green-deep) / 0.12) 62%, transparent 100%)",
          }}
          aria-hidden="true"
        />

        <div className="relative container-western pb-14 pt-24 md:pb-20 md:pt-32">
          <Reveal variant="fade-up" duration={800}>
            <div className="max-w-3xl">
              <p className="text-eyebrow-dark mb-4">
                Ateliê Western · Cajamar/SP · desde {BUSINESS.fundadaEm}
              </p>
              <h1 className="display-xl text-western-cream">
                A sua casa pode ter a{" "}
                <span className="text-western-gold-soft">sua praia.</span>
              </h1>
              {/* A única frase informativa da primeira dobra. Ela existe para que,
                  mesmo em silêncio, ninguém saia sem saber o que a Western faz. */}
              <p className="mt-5 max-w-prose text-[16px] leading-[1.6] text-western-cream/85 md:text-[17px]">
                Duas obras entregues, do primeiro traço ao primeiro mergulho. Nós projetamos e
                executamos.
              </p>
              <p className="mt-10 inline-flex items-center gap-2 text-[15px] text-western-cream/70">
                <ArrowDown className="h-4 w-4" aria-hidden="true" />
                Role e entre nelas
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* 2 — OBRA I · MÓDULO 15.
          Quatro bandas de escala decrescente e depois crescente (grande → detalhe
          → aérea): é o ritmo que substitui o texto que a variante A não escreve. */}
      <section className="surface-forest section">
        <div className="container-western">
          <Reveal variant="fade-up" duration={750}>
            <header className="max-w-prose-lg">
              <p className="text-eyebrow-dark">Obra entregue · Módulo 15</p>
              <h2 className="display-lg mt-3 text-western-cream">
                Uma praia que começa no gramado e{" "}
                <span className="text-western-gold-soft">termina na água.</span>
              </h2>
            </header>
          </Reveal>

          {/* 2A — o par grande. Mesma proporção 2:3 nas duas: legendas na mesma linha. */}
          <Reveal variant="fade-up" delay={80} duration={750}>
            <div className="mt-10 grid grid-cols-1 gap-6 md:mt-14 md:grid-cols-2 md:gap-8">
              <figure className="m-0">
                <div className="aspect-[2/3] overflow-hidden rounded-xl bg-western-green-mid/40">
                  <img
                    src={m15Ampla}
                    alt="Vista ampla da piscina natural: água turquesa, uma queda d'água sobre pedra à direita, folhagem tropical densa em volta e, à esquerda, o deck de madeira com guarda-corpo de vidro."
                    width={1400}
                    height={2100}
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-cover"
                  />
                </div>
                <figcaption className={`${LEGENDA} text-western-cream/75`}>
                  O deck, o vidro e a queda na mesma linha de visão.
                </figcaption>
              </figure>
              <figure className="m-0">
                <div className="aspect-[2/3] overflow-hidden rounded-xl bg-western-green-mid/40">
                  <img
                    src={m15CascataDetalhe}
                    alt="Detalhe da cascata em longa exposição: a água desce em véu branco sobre a pedra artesanal escura."
                    width={1400}
                    height={2100}
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-cover"
                  />
                </div>
                <figcaption className={`${LEGENDA} text-western-cream/75`}>
                  A queda de perto — pedra artesanal, feita no ateliê.
                </figcaption>
              </figure>
            </div>
          </Reveal>

          {/* 2B — as cenas. Quatro colunas de 2:3, mesma régua, mesma calha. */}
          <Reveal variant="fade-up" delay={120} duration={750}>
            <ul className="mt-10 grid grid-cols-2 gap-5 p-0 md:mt-14 md:grid-cols-4 md:gap-6">
              {M15_CENAS.map((c) => (
                <li key={c.legenda} className="list-none">
                  <figure className="m-0">
                    <div className="aspect-[2/3] overflow-hidden rounded-lg bg-western-green-mid/40">
                      <img
                        src={c.img}
                        alt={c.alt}
                        width={1400}
                        height={2100}
                        loading="lazy"
                        decoding="async"
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <figcaption className={`${LEGENDA} text-western-cream/70`}>
                      {c.legenda}
                    </figcaption>
                  </figure>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>

        {/* 2C — AS AÉREAS, de borda a borda.
            Exceção de trilho DECLARADA: este é o único bloco da página que sai do
            container-western. A aérea só cumpre o seu papel — mostrar o DESENHO
            inteiro da piscina — quando ocupa a tela inteira. A legenda volta para
            o trilho logo abaixo, então a régua da página não se perde. */}
        <Reveal variant="fade-up" delay={60} duration={800}>
          <div className="mt-12 grid grid-cols-1 md:mt-16 md:grid-cols-2">
            <div className="aspect-[3/4] overflow-hidden bg-western-green-mid/40">
              <img
                src={m15Aerea}
                alt="Vista aérea da piscina inteira: o contorno curvo, a faixa larga de areia clara no raso, a água turquesa na parte funda e, à esquerda, o deck de madeira com espreguiçadeiras."
                width={1400}
                height={1867}
                loading="lazy"
                decoding="async"
                className="h-full w-full object-cover"
              />
            </div>
            <div className="aspect-[3/4] overflow-hidden bg-western-green-mid/40">
              <img
                src={m15AereaDeck}
                alt="Vista aérea aproximada do raso da mesma piscina: a rampa de areia clara entrando na água, duas pedras dentro da água rasa e a faixa do deck de madeira na borda esquerda."
                width={1400}
                height={1867}
                loading="lazy"
                decoding="async"
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        </Reveal>

        <div className="container-western">
          <Reveal variant="fade-up" delay={80} duration={750}>
            <p className="mt-8 max-w-prose-lg text-[16px] leading-[1.6] text-western-cream/80 md:mt-10">
              Visto de cima, aparece o desenho. Nenhuma dessas curvas é acidente: cada uma foi
              desenhada antes de virar obra — e construída pela nossa equipe.
            </p>
          </Reveal>
        </div>
      </section>

      {/* 3 — OBRA II · CONRADO, O ARCO.
          O tesouro da página. Fundo claro depois de duas telas de verde: a troca de
          superfície já avisa que o assunto mudou, sem precisar de título gritado. */}
      <section className="surface-ivory section">
        <div className="container-western">
          <Reveal variant="fade-up" duration={750}>
            <header className="max-w-prose-lg">
              <p className="text-eyebrow">Obra entregue · Conrado · Vinhedo/SP</p>
              <h2 className="display-lg mt-3 text-western-green-deep">
                O mesmo enquadramento, três vezes.
              </h2>
              <p className="mt-4 text-body">
                Croqui, render e obra. A mesma parede de cascatas, do papel ao dia de sol.
              </p>
            </header>
          </Reveal>

          {/* Uma linha por estágio, cada imagem na proporção nativa — croqui é
              panorâmico, render é 16:9, obra é 4:3. Nenhuma é cortada para caber
              ao lado da outra. A legenda encosta na base da imagem em todas. */}
          <ol className="mt-10 space-y-10 p-0 md:mt-14 md:space-y-14">
            {CONRADO_ARCO.map((x, i) => (
              <Reveal key={x.n} as="li" variant="fade-up" delay={i * 60} duration={750}>
                <figure className="m-0 grid grid-cols-1 items-end gap-5 md:grid-cols-12 md:gap-10">
                  <div className="md:col-span-8">
                    <div
                      className={`${x.ratio} overflow-hidden rounded-xl border border-western-border-soft bg-white`}
                    >
                      <img
                        src={x.img}
                        alt={x.alt}
                        loading="lazy"
                        decoding="async"
                        className="h-full w-full object-cover"
                      />
                    </div>
                  </div>
                  <figcaption className="md:col-span-3 md:col-start-10 md:self-end md:pb-1">
                    <span className="font-sans text-[14px] font-semibold uppercase tracking-[0.06em] tabular-nums text-western-bronze">
                      {x.n} · {x.rotulo}
                    </span>
                    <span className="mt-2 block text-[16px] leading-[1.55] text-western-stone-warm">
                      {x.legenda}
                    </span>
                  </figcaption>
                </figure>
              </Reveal>
            ))}
          </ol>

          <Reveal variant="fade-up" delay={100} duration={750}>
            <p className="mt-10 max-w-prose-lg text-[16px] leading-[1.6] text-western-stone-warm">
              Repare na escada de lajes chatas descendo até a água, à esquerda, e na fileira de
              quedas ao fundo: elas se repetem nas três imagens.
            </p>
          </Reveal>
        </div>
      </section>

      {/* 4 — CONRADO, A CASA INTEIRA. Fecha a obra II com o entorno: primeiro a
          vista ampla no trilho cheio, depois o par de retratos 3:4 alinhado. */}
      <section className="surface-paper section-tight border-y border-western-border-soft">
        <div className="container-western">
          <Reveal variant="fade-up" duration={750}>
            <figure className="m-0">
              {/* 4/3 NATIVO também no desktop. Com md:aspect-[16/9] o
                  object-cover descartava ~25% da altura de uma foto cuja
                  legenda promete justamente ver MAIS do quintal. */}
              <div className="aspect-[4/3] overflow-hidden rounded-xl bg-western-cream-muted/40">
                <img
                  src={conradoAmpla}
                  alt="Vista ampla da piscina: palmeiras, puffs à beira d'água e piso de pedra em volta, com a casa moderna ao fundo."
                  width={1400}
                  height={1050}
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover"
                />
              </div>
              <figcaption className="mt-3 text-[15px] leading-[1.5] text-western-stone-warm">
                O mesmo quintal, um pouco mais para trás.
              </figcaption>
            </figure>
          </Reveal>

          <Reveal variant="fade-up" delay={80} duration={750}>
            <div className="mt-8 grid grid-cols-1 gap-6 md:mt-10 md:grid-cols-2 md:gap-8">
              <figure className="m-0">
                <div className="aspect-[3/4] overflow-hidden rounded-xl bg-western-cream-muted/40">
                  <img
                    src={conradoCascata}
                    alt="Cascata em pedra artesanal vista de perto, com a casa moderna ao fundo."
                    width={1400}
                    height={1867}
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-cover"
                  />
                </div>
                <figcaption className={`${LEGENDA} text-western-stone-warm`}>
                  A cascata de perto, encostada na casa.
                </figcaption>
              </figure>
              <figure className="m-0">
                <div className="aspect-[3/4] overflow-hidden rounded-xl bg-western-cream-muted/40">
                  <img
                    src={conradoEstar}
                    alt="Área de estar ao lado da piscina, com palmeiras, paisagismo e piso de pedra."
                    width={1400}
                    height={1867}
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-cover"
                  />
                </div>
                <figcaption className={`${LEGENDA} text-western-stone-warm`}>
                  A área de estar, do outro lado da água.
                </figcaption>
              </figure>
            </div>
          </Reveal>
        </div>
      </section>

      {/* 5 — O PRIMEIRO PEDIDO.
          Aqui, e não antes: a pessoa acabou de ver duas obras inteiras e a prova de
          que o que foi desenhado foi entregue. As credenciais entram JUNTO do botão
          — é neste segundo que elas respondem uma dúvida, e não na primeira dobra,
          onde só atrapalhavam a foto. */}
      <section className="surface-forest section">
        <div className="container-western">
          <div className="grid grid-cols-1 items-start gap-10 md:grid-cols-12 md:gap-14">
            <Reveal variant="fade-up" duration={750} className="md:col-span-7">
              <div>
                <p className="text-eyebrow-dark">As duas são obras nossas</p>
                <h2 className="display-lg mt-3 text-western-cream">
                  A próxima pode ser{" "}
                  <span className="text-western-gold-soft">o seu quintal.</span>
                </h2>
                <p className="mt-5 max-w-prose text-[16px] leading-[1.6] text-western-cream/85">
                  A Western projeta em 3D e executa com equipe própria, do croqui à entrega.
                  A primeira conversa é grátis e sem compromisso.
                </p>
                <div className="mt-8 flex flex-col gap-x-6 gap-y-4 sm:flex-row sm:items-center">
                  <a
                    href={waLink("Olá! Vi as obras no site (Módulo 15 e Conrado) e quero uma assim na minha casa.")}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-gold w-full sm:w-auto"
                  >
                    <MessageCircle className="h-5 w-5" />
                    Quero uma assim na minha casa
                  </a>
                  <Link to="/obras" className="link-cta-dark">
                    Ver todas as obras
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                </div>
              </div>
            </Reveal>

            <Reveal variant="fade-up" delay={90} duration={750} className="md:col-span-4 md:col-start-9">
              <ul className="grid grid-cols-1 gap-4 p-0 sm:grid-cols-2 md:grid-cols-1">
                {CONFIANCA.map((c) => (
                  <li key={c.label} className="flex items-center gap-3">
                    <c.icon className="h-5 w-5 shrink-0 text-western-gold-soft" aria-hidden="true" />
                    <span className="font-sans text-[15px] font-medium text-western-cream/90">
                      {c.label}
                    </span>
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
        </div>
      </section>

      {/* 6 — OS CAMINHOS. Cartão-link inteiro: a foto continua sendo o argumento e
          a página não ganha mais quatro botões dourados depois do pedido principal. */}
      <section className="surface-ivory section">
        <div className="container-western">
          <Reveal variant="fade-up" duration={750}>
            <header className="max-w-prose-lg">
              <p className="text-eyebrow">Por onde começar</p>
              <h2 className="display-lg mt-3 text-western-green-deep">
                Escolha o que mais parece com o seu sonho.
              </h2>
              <p className="mt-4 text-body">Cada caminho abre uma conversa direta com o ateliê.</p>
            </header>
          </Reveal>

          <ul className="mt-10 grid grid-cols-1 gap-5 p-0 sm:grid-cols-2 md:mt-12 lg:grid-cols-4 lg:gap-6">
            {CAMINHOS.map((c, i) => (
              <Reveal key={c.titulo} as="li" variant="fade-up" delay={i * 70} duration={700} className="list-none">
                <a
                  href={waLink(c.msg)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex h-full flex-col overflow-hidden rounded-xl border border-western-border-soft bg-white shadow-card transition-shadow hover:shadow-lift"
                >
                  <div className="aspect-[4/3] overflow-hidden bg-western-cream-muted/40">
                    <img
                      src={c.img}
                      alt={c.titulo}
                      width={1100}
                      height={825}
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="flex flex-1 flex-col p-5 md:p-6">
                    {/* min-h só em lg, que é onde a grade vira 4 colunas e
                        "Piscina natural ou de praia" quebra em 2 linhas
                        enquanto "Lago com carpas" fica em 1 — sem isto os
                        quatro corpos começam em alturas diferentes. */}
                    <h3 className="text-title-sm mb-2 lg:min-h-[2.95rem]">{c.titulo}</h3>
                    <p className="text-body flex-1">{c.desc}</p>
                    <span className="mt-5 inline-flex items-center gap-2 font-sans text-[15px] font-semibold text-western-green-deep">
                      <MessageCircle className="h-4 w-4 text-western-bronze" aria-hidden="true" />
                      Falar sobre isto
                      <ArrowRight
                        className="h-4 w-4 transition-transform group-hover:translate-x-1"
                        aria-hidden="true"
                      />
                    </span>
                  </div>
                </a>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      {/* 7 — COMO FUNCIONA. Quatro cartões, mesma altura, corpo na mesma linha. */}
      <section className="surface-paper section border-y border-western-border-soft">
        <div className="container-western">
          <Reveal variant="fade-up" duration={750}>
            <header className="max-w-prose-lg">
              <p className="text-eyebrow">Como funciona</p>
              <h2 className="display-lg mt-3 text-western-green-deep">Quatro passos até o mergulho</h2>
              <p className="mt-4 text-body">
                Os dois primeiros são{" "}
                <span className="font-semibold text-western-green-deep">grátis e sem compromisso</span>.
                Você só decide seguir depois de conhecer.
              </p>
            </header>
          </Reveal>

          <ol className="mt-10 grid grid-cols-1 gap-5 p-0 sm:grid-cols-2 md:mt-12 lg:grid-cols-4 lg:gap-6">
            {PASSOS.map((p, i) => (
              <Reveal key={p.n} as="li" variant="fade-up" delay={i * 70} duration={700} className="h-full list-none">
                <div
                  className={`relative flex h-full flex-col rounded-lg border bg-white p-6 shadow-card ${
                    p.gratis ? "border-western-gold/50" : "border-western-border-soft"
                  }`}
                >
                  {p.gratis && (
                    <span className="absolute -top-3 left-6 rounded-sm bg-western-gold px-2.5 py-1 font-sans text-[14px] font-semibold leading-none text-western-green-deep">
                      Grátis
                    </span>
                  )}
                  <span className="mb-3 block font-display text-[32px] leading-none text-western-bronze">
                    {p.n}
                  </span>
                  {/* min-h no título: sem isso, "Você conta o seu sonho" (1 linha) e
                      "A gente escuta e mostra o caminho" (2 linhas) fariam os corpos
                      começarem em alturas diferentes na mesma fileira. */}
                  <h3 className="mb-2 min-h-[2.6rem] font-sans text-[17px] font-semibold leading-snug text-western-green-deep">
                    {p.t}
                  </h3>
                  <p className="text-[15px] leading-relaxed text-western-stone-warm">{p.d}</p>
                </div>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {/* 8 — QUEM FAZ: prova social + o convite ao ateliê, no mesmo bloco. */}
      <section className="surface-ivory section border-b border-western-border-soft">
        <div className="container-western">
          <Reveal variant="fade-up" duration={750}>
            <SocialProof
              interactive
              eyebrow="Quem já tem uma"
              titulo={<>Quem já tem uma na própria casa.</>}
              groups={["celebridades"]}
            />
          </Reveal>

          <Reveal variant="fade-up" delay={100} duration={750}>
            <div className="mt-12 grid grid-cols-1 items-center gap-10 overflow-hidden rounded-xl border border-western-border-soft bg-white md:mt-16 md:grid-cols-12 md:gap-14">
              <div className="order-2 p-6 pt-0 md:order-1 md:col-span-6 md:p-8">
                <p className="text-eyebrow">Visita ao ateliê</p>
                <h3 className="display-md mt-3 text-western-green-deep">
                  Venha pôr a mão na pedra.
                </h3>
                <p className="mt-4 text-[16px] leading-[1.6] text-western-stone-warm">
                  O ateliê recebe com hora marcada. Dá para ver as peças montadas em escala e
                  conversar com quem produz — são {BUSINESS.anosOperacao} anos reproduzindo rocha
                  natural pedra a pedra, com equipe própria e garantia de {BUSINESS.garantiaLabel}.
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
      <section className="surface-paper section">
        <div className="container-western">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-12 md:gap-14">
            <Reveal variant="fade-up" duration={750} className="md:col-span-4">
              <header>
                <p className="text-eyebrow">Perguntas frequentes</p>
                <h2 className="display-lg mt-3 text-western-green-deep">
                  As dúvidas de quem está começando
                </h2>
              </header>
            </Reveal>
            <Reveal variant="fade-up" delay={80} duration={750} className="md:col-span-8">
              <Accordion
                type="single"
                collapsible
                className="overflow-hidden rounded-xl border border-western-border-soft bg-white"
              >
                {FAQ_ITEMS.map((item, i) => (
                  <AccordionItem
                    key={item.q}
                    value={`item-${i}`}
                    className="border-b border-western-border-soft px-5 last:border-b-0 md:px-7"
                  >
                    <AccordionTrigger className="min-h-tap py-5 text-left font-sans text-[16px] font-semibold text-western-green-deep hover:no-underline md:text-[17px]">
                      {item.q}
                    </AccordionTrigger>
                    <AccordionContent className="pb-6 text-[16px] leading-[1.6] text-western-stone-warm">
                      {item.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </Reveal>
          </div>
        </div>
      </section>

      {/* 10 — FECHAMENTO + CAPTURA */}
      <section ref={formRef} id="contato" className="surface-forest section">
        <div className="container-western">
          <div className="mx-auto max-w-5xl">
            <div className="grid grid-cols-1 items-start gap-10 md:grid-cols-12 md:gap-14">
              <Reveal variant="fade-up" duration={750} className="md:col-span-5">
                <div>
                  <p className="text-eyebrow-dark mb-3">Sem compromisso</p>
                  <h2 className="display-lg text-western-cream">
                    Conte o seu sonho.{" "}
                    <span className="text-western-gold-soft">A gente mostra o caminho.</span>
                  </h2>
                  <p className="mt-5 text-[16px] leading-[1.6] text-western-cream/85">
                    Só <strong className="font-semibold text-western-cream">nome e WhatsApp</strong>{" "}
                    são obrigatórios. Ao enviar, abrimos o WhatsApp com a sua mensagem já pronta.
                  </p>
                  <ul className="mt-7 space-y-3 p-0">
                    {[
                      "A gente escuta a sua ideia",
                      "Vê a viabilidade na sua área",
                      "Passa uma estimativa real",
                    ].map((b) => (
                      <li key={b} className="flex list-none gap-3 text-[15px] leading-relaxed text-western-cream/85">
                        <Check className="mt-0.5 h-5 w-5 shrink-0 text-western-gold-soft" aria-hidden="true" />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                  <a
                    href={waLink("Olá! Ainda estou na dúvida, queria conversar sobre um projeto para a minha casa.")}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="tap-target mt-7 inline-flex items-center gap-2 text-[15px] font-semibold text-western-gold-soft underline decoration-western-gold/50 underline-offset-4 hover:decoration-western-gold-soft"
                  >
                    <MessageCircle className="h-5 w-5" />
                    Prefere só conversar? Chama no WhatsApp
                  </a>
                </div>
              </Reveal>

              <Reveal variant="fade-up" delay={100} duration={750} className="md:col-span-7">
                <form
                  onSubmit={handleSubmit}
                  className="grid grid-cols-1 gap-5 rounded-xl border border-western-border-soft bg-white p-6 md:grid-cols-2 md:p-8"
                  noValidate
                >
                  <div>
                    <FieldLabel htmlFor="pca-nome" required>Nome</FieldLabel>
                    <input
                      id="pca-nome"
                      required
                      value={nome}
                      onChange={(e) => setNome(e.target.value)}
                      autoComplete="name"
                      className={CONTROL}
                    />
                  </div>
                  <div>
                    <FieldLabel htmlFor="pca-tel" required>WhatsApp</FieldLabel>
                    <PhoneInput id="pca-tel" name="telefone" value={telefone} onChange={setTelefone} required />
                  </div>
                  <div>
                    <FieldLabel htmlFor="pca-email" optional>E-mail</FieldLabel>
                    <EmailInput id="pca-email" value={email} onChange={setEmail} />
                  </div>
                  <div>
                    <FieldLabel htmlFor="pca-cidade" optional>Cidade</FieldLabel>
                    <input
                      id="pca-cidade"
                      value={cidade}
                      onChange={(e) => setCidade(e.target.value)}
                      autoComplete="address-level2"
                      placeholder="Cidade / UF"
                      className={CONTROL}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <FieldLabel htmlFor="pca-msg" optional>Conte o seu sonho</FieldLabel>
                    <textarea
                      id="pca-msg"
                      rows={4}
                      value={mensagem}
                      onChange={(e) => setMensagem(e.target.value)}
                      placeholder="Uma piscina de praia no quintal? Um lago com carpas? Conta pra gente."
                      className="w-full resize-none rounded-lg border-[1.5px] border-western-border-strong bg-western-paper px-4 py-3 font-sans text-[15px] leading-[1.6] text-western-green-deep outline-none transition-colors placeholder:text-western-stone-warm/60 focus:border-western-green-deep"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <TurnstileWidget onToken={setCaptchaToken} onExpire={() => setCaptchaToken(null)} />
                  </div>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center md:col-span-2">
                    <button type="submit" disabled={enviando} className="btn-gold w-full sm:w-auto">
                      {enviando ? (
                        <>
                          <Loader2 className="h-5 w-5 animate-spin" />
                          Enviando…
                        </>
                      ) : (
                        <>
                          <Send className="h-5 w-5" />
                          Contar meu sonho
                        </>
                      )}
                    </button>
                    <span className="text-meta text-center sm:text-left">
                      Sem compromisso · Resposta rápida
                    </span>
                  </div>
                  <div className="grid grid-cols-1 gap-3 border-t border-western-border-soft pt-5 sm:grid-cols-2 md:col-span-2">
                    {[
                      { icon: ShieldCheck, label: `Garantia de ${BUSINESS.garantiaLabel}` },
                      { icon: Check, label: `Ateliê brasileiro desde ${BUSINESS.fundadaEm}` },
                      { icon: MapPin, label: "Atendemos todo o Brasil" },
                      { icon: MessageCircle, label: "Sem compromisso" },
                    ].map((t) => (
                      <span key={t.label} className="text-meta flex items-center gap-2">
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
              <Link
                to="/parceiro/cadastro"
                className="font-semibold text-western-gold-soft underline underline-offset-4"
              >
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
