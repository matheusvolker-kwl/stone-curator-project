/* VERSÃO B — "AS DUAS OBRAS".
   TESE DE DESEJO: o desejo aqui não nasce de adjetivo, nasce de PROVA. Duas obras
   entregues, contadas como capítulos — Conrado (Vinhedo/SP) e Módulo 15 — do ponto
   de vista de quem vai MORAR ali, não de quem construiu.
   ORDEM: hero (sem botão sólido) → capítulo 01 com o arco croqui→3D→obra → 1º CTA →
   capítulo 02 em imersão → 2º CTA → confiança → outras linguagens → como funciona →
   ateliê → prova social → FAQ → captura.
   O ARCO é um DISPOSITIVO, não três fotos soltas: painel escuro dentro da seção
   clara, três estágios rotulados e uma legenda que diz o que conferir a olho.
   SACRIFÍCIO: o hero perde os dois botões (a página só pede depois de mostrar), a
   vitrine de 3 obras-celebridade sai (a prova social textual segura esse papel) e
   o convite de visita perde a foto própria — vira uma linha dentro do ateliê. */
import { useState } from "react";
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
import atelieImg from "@/assets/irmaos-botelho-gruta.webp";

/* OBRA 01 — Conrado (Vinhedo/SP). O arco completo do mesmo enquadramento. */
import conradoCroqui from "@/assets/obras/conrado/01-croqui.webp";
import conradoRender from "@/assets/obras/conrado/02-render.webp";
import conradoObra from "@/assets/obras/conrado/03-obra.webp";
import conradoCascata from "@/assets/obras/conrado/04-cascata.webp";
import conradoAmpla from "@/assets/obras/conrado/05-ampla.webp";
import conradoEstar from "@/assets/obras/conrado/06-estar.webp";

/* OBRA 02 — Módulo 15. Retratos 2:3 e duas aéreas 3:4. */
import m15Cascata from "@/assets/obras/modulo15/01-cascata.webp";
import m15Ampla from "@/assets/obras/modulo15/02-ampla.webp";
import m15CascataDetalhe from "@/assets/obras/modulo15/03-cascata-detalhe.webp";
import m15Praia from "@/assets/obras/modulo15/04-praia.webp";
import m15Borda from "@/assets/obras/modulo15/05-borda.webp";
import m15Rede from "@/assets/obras/modulo15/06-rede.webp";
import m15Aerea from "@/assets/obras/modulo15/07-aerea.webp";
import m15AereaDeck from "@/assets/obras/modulo15/08-aerea-deck.webp";

const waLink = (msg: string) =>
  `https://wa.me/${BUSINESS.whatsappFabrica}?text=${encodeURIComponent(msg)}`;

/* O ARCO. Três estágios, três rótulos — render nunca se apresenta como foto.
   As proporções nativas são diferentes (croqui 2,24:1 · render 16:9 · obra 4:3).
   Todos entram num box 16:9 para que o MESMO enquadramento fique comparável lado
   a lado; o croqui usa `contain` sobre papel (é um desenho numa folha, e cortá-lo
   comeria o traço das pontas), os outros dois usam `cover` — a obra perde só céu
   em cima e água embaixo, que é o corte consciente. */
const ARCO = [
  {
    img: conradoCroqui,
    n: "1",
    label: "Croqui à mão",
    d: "O primeiro traço, a lápis, no ateliê.",
    fit: "contain" as const,
    alt: "Croqui a lápis: uma parede de pedras com uma queda d'água larga à esquerda, uma cortina de quedas menores à direita, folhagem desenhada no alto e a curva da piscina em primeiro plano.",
  },
  {
    img: conradoRender,
    n: "2",
    label: "Projeto 3D",
    d: "É render, não foto — serve para você ajustar antes da obra.",
    fit: "cover" as const,
    alt: "Projeto em 3D da mesma parede: a queda larga à esquerda, a fileira de quedas menores à direita, água esverdeada em primeiro plano e uma pessoa em pé na borda, à direita.",
  },
  {
    img: conradoObra,
    n: "3",
    label: "Obra entregue",
    d: "Executada pela nossa equipe, em Vinhedo/SP.",
    fit: "cover" as const,
    alt: "A obra pronta em dia de sol: parede de pedra cor de areia com a queda à esquerda e as quedas menores ao longo da borda, água turquesa e, ao fundo, a casa térrea de telhado reto.",
  },
];

/* Imersão do Módulo 15 — duas fileiras de três, todas 2:3 nativas, calhas iguais.
   Legendas de UMA linha: a foto é o argumento, o texto só aponta onde olhar. */
const M15_GALERIA = [
  {
    img: m15Cascata,
    legenda: "A queda cai direto na parte funda.",
    alt: "Uma queda d'água larga escorrendo de uma pedra chata para dentro da água turquesa, com folhagens tropicais grandes logo atrás.",
  },
  {
    img: m15Borda,
    legenda: "No raso, a água mal cobre o pé.",
    alt: "O raso da praia visto de perto: uma pedra arredondada dentro da água baixa, borbulhas subindo do fundo e, atrás, o gramado com uma rede armada entre as árvores.",
  },
  {
    img: m15Praia,
    legenda: "A borda de praia encontra o gramado.",
    alt: "A borda curva de praia: a faixa de areia clara separando a água turquesa do gramado, com folhagem tropical densa ao fundo.",
  },
  {
    img: m15CascataDetalhe,
    legenda: "Perto, a pedra mostra o veio moldado à mão.",
    alt: "A queda d'água em longa exposição, um véu contínuo caindo da pedra moldada para a água clara, entre bananeiras e um tronco de palmeira.",
  },
  {
    img: m15Ampla,
    legenda: "Da beira do deck, com a mata em volta.",
    alt: "A piscina vista da beira: água turquesa, deck de madeira com guarda-corpo de vidro à esquerda, a cascata de pedra ao fundo e coqueiros altos acima.",
  },
  {
    img: m15Rede,
    legenda: "A rede, à sombra, no gramado ao lado da água.",
    alt: "Uma rede verde armada entre a vegetação, sobre a grama, com bananeiras e helicônias floridas atrás e um muro escuro ao fundo.",
  },
];

const CAMINHOS = [
  {
    img: imgPiscina,
    titulo: "Piscina natural ou de praia",
    desc: "Entra caminhando pela areia, água por sal — sem cloro, sem olho ardendo. A gente projeta e executa por inteiro.",
    cta: "Quero a minha piscina",
    msg: "Olá! Quero uma piscina natural para a minha casa.",
    alt: "Piscina de praia com faixa de areia entrando na água e pedras artesanais na borda.",
  },
  {
    img: imgLago,
    titulo: "Lago com carpas",
    desc: "Um espelho d'água vivo no seu jardim, com peixe e planta na mesma água — sem obra pesada.",
    cta: "Quero um lago",
    msg: "Olá! Quero um lago ornamental no meu jardim.",
    alt: "Lago ornamental cercado de pedras e vegetação, com a água parada refletindo o jardim.",
  },
  {
    img: imgCascata,
    titulo: "Cascata no quintal",
    desc: "O som de água que transforma o fim de tarde. Tão leve que sobe até a laje ou a cobertura, sem guindaste.",
    cta: "Quero uma cascata",
    msg: "Olá! Quero uma cascata na minha casa.",
    alt: "Cascata de pedra artesanal despejando água em degraus dentro de um jardim.",
  },
  {
    img: imgJardim,
    titulo: "Jardim de pedra",
    desc: "Pedras que parecem ter nascido ali, com ou sem água. Do quintal ao terraço.",
    cta: "Quero um jardim assim",
    msg: "Olá! Quero um jardim com pedras Western.",
    alt: "Jardim com pedras artesanais assentadas entre folhagens, sem água.",
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

export default function ParaSuaCasaB() {
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
          payload: { cidade: cidade.trim() || null, pagina: "/para-sua-casa" },
        },
        captchaToken,
      );
      if (!res.ok) throw new Error(res.error ?? "erro");
    } catch (err) {
      console.warn("[para-sua-casa-b] falha ao gravar lead:", err);
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
        description={`Duas obras entregues, do croqui à água: piscinas de praia, cascatas e lagos em pedra artesanal. Ateliê próprio desde ${BUSINESS.fundadaEm}.`}
        path="/para-sua-casa"
      />

      {/* 1 — HERO. Sem botão sólido: nesta versão a página só PEDE depois de
          mostrar a primeira obra inteira. O único convite aqui é descer. */}
      <section className="relative isolate overflow-hidden flex items-center bg-western-green-deep min-h-[520px] md:min-h-[600px]">
        <img
          src={heroImg}
          alt="Piscina de praia com borda de pedra artesanal Western, jardim tropical e faixa de areia entrando na água"
          width={2200}
          height={1356}
          loading="eager"
          fetchPriority="high"
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover"
        />
        {/* Scrims direcionais: fortes onde o texto vive, limpos onde a foto é o
            assunto. No celular o gradiente é vertical; no desktop, diagonal. */}
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
                A sua casa pode ter a{" "}
                <span className="text-western-gold-soft">sua praia.</span>
              </h1>
              <p className="mt-5 text-[16px] md:text-[17px] leading-[1.6] text-western-cream/90 max-w-xl">
                Duas obras entregues, contadas inteiras — da primeira folha de papel até a
                água. Veja antes de falar com a gente.
              </p>

              <a href="#obra-conrado" className="link-cta-dark mt-8">
                Ver as duas obras
                <ArrowDown className="h-4 w-4" aria-hidden="true" />
              </a>

              <p className="mt-8 text-[15px] leading-relaxed text-western-cream/80">
                Nas casas de Neymar Jr. · Tato (Falamansa) · Caito Maia
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* 2 — CAPÍTULO 01 · CONRADO (Vinhedo/SP).
          Abre com a foto de morar ali, depois o ARCO, depois dois retratos. */}
      <section id="obra-conrado" className="surface-ivory section scroll-mt-24">
        <div className="container-western">
          <Reveal variant="fade-up" duration={700}>
            {/* Cabeçalho em duas colunas: título à esquerda, ficha à direita, na
                mesma linha de base. Nada centralizado. */}
            <header className="grid md:grid-cols-12 gap-6 md:gap-14 items-end">
              <div className="md:col-span-7">
                <p className="text-eyebrow">Obra 01 · entregue</p>
                <h2 className="display-lg text-western-green-deep mt-3">
                  Conrado · Vinhedo/SP
                </h2>
              </div>
              <p className="md:col-span-5 text-body">
                Da varanda até a água, o piso de pedra vira areia e a areia entra na piscina.
                A parede de cascatas fica de frente para quem está dentro d'água.
              </p>
            </header>
          </Reveal>

          <Reveal variant="fade-up" delay={80} duration={700}>
            <figure className="mt-8 md:mt-10 m-0">
              <div className="aspect-[4/3] overflow-hidden rounded-xl bg-western-cream-muted">
                <img
                  src={conradoAmpla}
                  alt="A piscina vista do caminho de pedra: um puf vermelho boiando na água esverdeada, faixa de areia contornando a borda, as cascatas de pedra à esquerda e a casa térrea com pergolado ao fundo."
                  width={1400}
                  height={1050}
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover"
                />
              </div>
              <figcaption className="mt-4 text-meta">
                Piscina com parede de cascatas · entrada de praia · piso e paisagismo em pedra ·
                projeto 3D e execução por equipe própria.
              </figcaption>
            </figure>
          </Reveal>

          {/* O ARCO — dispositivo próprio. Painel escuro dentro da seção clara:
              muda o material da página para dizer "isto aqui é outra coisa". */}
          <Reveal variant="fade-up" delay={120} duration={700}>
            <div className="mt-12 md:mt-16 surface-forest rounded-xl p-6 md:p-10">
              <div className="max-w-[62ch]">
                <p className="text-eyebrow-dark">O mesmo enquadramento, três vezes</p>
                <h3 className="display-md text-western-cream mt-3">
                  O que foi desenhado é{" "}
                  <span className="text-western-gold-soft">o que foi entregue.</span>
                </h3>
              </div>

              <ol className="mt-8 md:mt-10 grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 list-none p-0">
                {ARCO.map((x, i) => (
                  <Reveal key={x.n} as="li" variant="fade-up" delay={i * 80} duration={650}>
                    <figure className="m-0">
                      {/* Box 16:9 comum aos três — é o que torna a comparação
                          possível. O croqui entra em `contain` sobre papel. */}
                      <div
                        className={`aspect-[16/9] overflow-hidden rounded-lg ring-1 ring-western-gold/25 ${
                          x.fit === "contain" ? "bg-western-paper" : "bg-western-green-mid/40"
                        }`}
                      >
                        <img
                          src={x.img}
                          alt={x.alt}
                          loading="lazy"
                          decoding="async"
                          className={`h-full w-full ${
                            x.fit === "contain" ? "object-contain" : "object-cover"
                          }`}
                        />
                      </div>
                      <figcaption className="mt-4">
                        <span className="text-eyebrow-dark tabular-nums">
                          {x.n} · {x.label}
                        </span>
                        {/* min-h reserva duas linhas para que as três legendas
                            terminem na mesma altura em qualquer largura. */}
                        <span className="mt-1.5 block min-h-[3rem] text-[15px] leading-[1.5] text-western-cream/75">
                          {x.d}
                        </span>
                      </figcaption>
                    </figure>
                  </Reveal>
                ))}
              </ol>

              {/* A legenda diz exatamente o que conferir — e só o que as três
                  imagens sustentam. Croqui e render não têm casa nenhuma; ela
                  aparece apenas na foto da obra. Afirmar "a mesma casa" seria
                  falso, e é justamente a honestidade que faz o arco funcionar. */}
              <p className="mt-6 max-w-[68ch] text-[15px] leading-[1.6] text-western-cream/70">
                Repare na queda larga à esquerda e na fileira de quedas menores à direita: as
                três imagens são o mesmo projeto. O croqui e o 3D mostram só a pedra e a água —
                a casa aparece na foto da obra.
              </p>
            </div>
          </Reveal>

          {/* Dois retratos 3:4 nativos, mesma régua, calha igual. */}
          <div className="mt-12 md:mt-16 grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8">
            {[
              {
                img: conradoCascata,
                legenda: "As quedas vistas de dentro da água, na altura de quem nada.",
                alt: "Detalhe das quedas caindo em degraus de pedra sobre a água esverdeada; atrás, a varanda da casa com brises escuros, uma rede listrada armada sob a cobertura e um canteiro de folhagem baixa.",
              },
              {
                img: conradoEstar,
                legenda: "A chegada, pelo caminho de lajes entre a folhagem.",
                alt: "A mesma piscina vista entre as folhagens do jardim, com o caminho de lajes de pedra em primeiro plano, palmeiras altas e a casa ao fundo em dia de céu azul.",
              },
            ].map((f, i) => (
              <Reveal key={f.legenda} variant="fade-up" delay={i * 80} duration={650}>
                <figure className="m-0">
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
                  <figcaption className="mt-4 text-meta">{f.legenda}</figcaption>
                </figure>
              </Reveal>
            ))}
          </div>

          {/* PRIMEIRO CTA DA PÁGINA. Só aqui: o leitor já viu uma obra inteira,
              o croqui, o 3D e a entrega. Antes disto a página não pede nada. */}
          <Reveal variant="fade-up" delay={80} duration={700}>
            <div className="mt-10 md:mt-12 flex flex-col sm:flex-row sm:items-center gap-x-6 gap-y-4">
              <a
                href={waLink("Olá! Vi a obra de Vinhedo no site e quero um projeto assim para a minha casa.")}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-gold w-full sm:w-auto"
              >
                <MessageCircle className="h-5 w-5" />
                Quero um projeto assim
              </a>
              <Link to="/obras" className="link-cta">
                Ver todas as obras
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* 3 — CAPÍTULO 02 · MÓDULO 15. Superfície escura: a água turquesa e a
          mata ganham a página inteira. Imersão, não catálogo. */}
      <section id="obra-modulo15" className="surface-forest section scroll-mt-24">
        <div className="container-western">
          <Reveal variant="fade-up" duration={700}>
            <header className="grid md:grid-cols-12 gap-6 md:gap-14 items-end">
              <div className="md:col-span-7">
                <p className="text-eyebrow-dark">Obra 02 · entregue</p>
                <h2 className="display-lg text-western-cream mt-3">Módulo 15</h2>
              </div>
              <p className="md:col-span-5 text-[16px] leading-[1.6] text-western-cream/85">
                Aqui não tem escada nem borda para pular: você entra caminhando pela areia e a
                água vai subindo. De um lado o deck e as espreguiçadeiras, do outro o gramado —
                e a rede, à sombra, entre as árvores.
              </p>
            </header>
          </Reveal>

          {/* As duas aéreas, 3:4 nativas, lado a lado — é a aérea que faz o
              leitor entender o DESENHO da piscina antes de ver os detalhes. */}
          <div className="mt-8 md:mt-10 grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8">
            {[
              {
                img: m15Aerea,
                legenda: "De cima: o deck de um lado, o raso de areia do outro.",
                alt: "Vista aérea da piscina inteira: deck de madeira com quatro espreguiçadeiras à esquerda, um recinto de vidro com banco de madeira, a água azul ao fundo e a rampa de areia clara na frente.",
              },
              {
                img: m15AereaDeck,
                legenda: "O raso, onde a areia entra na água.",
                alt: "Vista aérea do raso: a rampa de areia clara com duas pedras arredondadas dentro da água baixa, borbulhas subindo do fundo e a borda do deck de madeira à esquerda.",
              },
            ].map((f, i) => (
              <Reveal key={f.legenda} variant="fade-up" delay={i * 80} duration={680}>
                <figure className="m-0">
                  <div className="aspect-[3/4] overflow-hidden rounded-xl bg-western-green-mid/40">
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
                  <figcaption className="mt-4 text-[15px] leading-[1.5] text-western-cream/75">
                    {f.legenda}
                  </figcaption>
                </figure>
              </Reveal>
            ))}
          </div>

          {/* Seis retratos 2:3 nativos em duas fileiras de três. Mesma régua da
              grade de cima, mesma calha — nada se desalinha entre os blocos. */}
          <div className="mt-6 md:mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {M15_GALERIA.map((f, i) => (
              <Reveal key={f.legenda} variant="fade-up" delay={(i % 3) * 70} duration={650}>
                <figure className="m-0">
                  <div className="aspect-[2/3] overflow-hidden rounded-xl bg-western-green-mid/40">
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
                  {/* min-h de duas linhas: as legendas variam de tamanho e não
                      podem fazer a fileira terminar em alturas diferentes. */}
                  <figcaption className="mt-4 min-h-[3rem] text-[15px] leading-[1.5] text-western-cream/75">
                    {f.legenda}
                  </figcaption>
                </figure>
              </Reveal>
            ))}
          </div>

          <Reveal variant="fade-up" delay={80} duration={700}>
            <p className="mt-6 max-w-[68ch] text-[15px] leading-[1.6] text-western-cream/70">
              Piscina de praia · cascatas em pedra artesanal · deck e espreguiçadeiras ·
              paisagismo tropical. Projeto e obra da Western.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row sm:items-center gap-x-6 gap-y-4">
              <a
                href={waLink("Olá! Vi o Módulo 15 no site e quero uma piscina de praia na minha casa.")}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-gold w-full sm:w-auto"
              >
                <MessageCircle className="h-5 w-5" />
                Quero uma piscina de praia
              </a>
              <Link to="/a-pedra" className="link-cta-dark">
                Como a pedra é feita
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* 4 — BARRA DE CONFIANÇA. Exceção de ritmo declarada: py-6, não .section. */}
      <section className="surface-paper border-y border-western-border-soft">
        <div className="container-western py-6">
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
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

      {/* 5 — SE O SEU SONHO FOR OUTRO. Depois das duas obras, não antes. */}
      <section className="surface-ivory section">
        <div className="container-western">
          <Reveal variant="fade-up" duration={700}>
            <header className="max-w-2xl mb-10 md:mb-12">
              <p className="text-eyebrow">Se o seu for outro</p>
              <h2 className="display-lg text-western-green-deep mt-3">
                Nem todo sonho é uma piscina.
              </h2>
              <p className="mt-4 text-body">
                Cada caminho leva direto ao nosso time — sem formulário.
              </p>
            </header>
          </Reveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {CAMINHOS.map((c, i) => (
              <Reveal key={c.titulo} variant="fade-up" delay={i * 70} duration={650}>
                <article className="flex h-full flex-col bg-white rounded-xl overflow-hidden border border-western-border-soft shadow-card">
                  <div className="aspect-[4/3] overflow-hidden bg-western-cream-muted">
                    {/* Aqui a seção está longe da primeira dobra: lazy é correto,
                        e width/height reservam o espaço para não pular layout. */}
                    <img
                      src={c.img}
                      alt={c.alt}
                      width={1100}
                      height={825}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex flex-1 flex-col p-5 md:p-6">
                    {/* min-h de duas linhas: sem isto, um título de uma linha faz
                        o corpo do cartão começar 25px acima dos vizinhos. */}
                    <h3 className="font-sans font-semibold text-[18px] leading-snug text-western-green-deep mb-2 sm:min-h-[3.1rem]">
                      {c.titulo}
                    </h3>
                    <p className="text-body flex-1">{c.desc}</p>
                    <a
                      href={waLink(c.msg)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-gold mt-5 w-full"
                    >
                      <MessageCircle className="h-5 w-5" />
                      {c.cta}
                    </a>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* 6 — COMO FUNCIONA */}
      <section className="surface-paper section border-y border-western-border-soft">
        <div className="container-western">
          <Reveal variant="fade-up" duration={700}>
            <header className="max-w-2xl mb-10 md:mb-12">
              <p className="text-eyebrow">Como funciona</p>
              <h2 className="display-lg text-western-green-deep mt-3">
                Quatro passos até o mergulho
              </h2>
              <p className="mt-4 text-body">
                Os dois primeiros são{" "}
                <span className="font-semibold text-western-green-deep">
                  grátis e sem compromisso
                </span>
                . Você só decide seguir depois de conhecer.
              </p>
            </header>
          </Reveal>

          {/* Reveal vira o próprio <li>: nada de div entre <ol> e <li>. */}
          <ol className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {PASSOS.map((p, i) => (
              <Reveal
                key={p.n}
                as="li"
                variant="fade-up"
                delay={i * 70}
                duration={650}
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
                <h3 className="font-sans font-semibold text-[17px] leading-snug text-western-green-deep mb-2 sm:min-h-[2.9rem]">
                  {p.t}
                </h3>
                <p className="text-[15px] leading-relaxed text-western-stone-warm">{p.d}</p>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {/* 7 — QUEM FAZ + VISITA. Um bloco só, régua 6/6, foto à esquerda. */}
      <section className="surface-ivory section">
        <div className="container-western">
          <div className="grid md:grid-cols-12 gap-10 md:gap-14 items-center">
            <Reveal variant="fade-up" duration={700} className="md:col-span-6">
              <div className="aspect-[4/3] overflow-hidden rounded-xl bg-western-cream-muted">
                <img
                  src={atelieImg}
                  alt="Dois profissionais do ateliê Western trabalhando na montagem de uma gruta de pedra artesanal"
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
                  As duas obras saíram daqui.
                </h2>
                <p className="mt-5 text-body">
                  Mais de {BUSINESS.anosOperacao} anos reproduzindo rocha natural pedra a pedra,
                  no ateliê de {BUSINESS.cidadeAtelie}/{BUSINESS.ufAtelie}. Quem atende, projeta
                  e executa é a mesma casa — com garantia de {BUSINESS.garantiaLabel}.
                </p>
                <p className="mt-4 text-body">
                  O ateliê recebe com hora marcada: dá para pôr a mão na pedra e ver as peças
                  montadas em escala antes de decidir qualquer coisa.
                </p>
                <p className="mt-4 text-meta">
                  {BUSINESS.cidadeAtelie}/{BUSINESS.ufAtelie} · {BUSINESS.horarioAtelie}
                </p>
                <Link to="/visitar" className="btn-gold mt-7 w-full sm:w-auto">
                  <MapPin className="h-5 w-5" aria-hidden="true" />
                  Agendar uma visita
                </Link>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* 8 — PROVA SOCIAL */}
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

      {/* 9 — FAQ */}
      <section className="surface-ivory section">
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

      {/* 10 — FECHAMENTO + CAPTURA */}
      <section id="contato" className="surface-forest section scroll-mt-24">
        <div className="container-western">
          <div className="max-w-5xl mx-auto">
            <div className="grid md:grid-cols-12 gap-10 md:gap-14 items-start">
              <Reveal variant="fade-up" duration={700} className="md:col-span-5">
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
                  <ul className="mt-7 space-y-3">
                    {[
                      "A gente escuta a sua ideia",
                      "Vê a viabilidade na sua área",
                      "Passa uma estimativa real",
                    ].map((b) => (
                      <li
                        key={b}
                        className="flex gap-3 text-[15px] leading-relaxed text-western-cream/85"
                      >
                        <Check
                          className="h-5 w-5 shrink-0 mt-0.5 text-western-gold-soft"
                          aria-hidden="true"
                        />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                  <a
                    href={waLink("Olá! Ainda estou na dúvida, queria conversar sobre um projeto para a minha casa.")}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="tap-target mt-7 inline-flex items-center gap-2 text-[15px] font-semibold text-western-gold-soft underline underline-offset-4 decoration-western-gold/50 hover:decoration-western-gold-soft"
                  >
                    <MessageCircle className="h-5 w-5" />
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
                    <FieldLabel htmlFor="pcb-nome" required>
                      Nome
                    </FieldLabel>
                    <input
                      id="pcb-nome"
                      required
                      value={nome}
                      onChange={(e) => setNome(e.target.value)}
                      autoComplete="name"
                      className={CONTROL}
                    />
                  </div>
                  <div>
                    <FieldLabel htmlFor="pcb-tel" required>
                      WhatsApp
                    </FieldLabel>
                    <PhoneInput
                      id="pcb-tel"
                      name="telefone"
                      value={telefone}
                      onChange={setTelefone}
                      required
                    />
                  </div>
                  <div>
                    <FieldLabel htmlFor="pcb-email" optional>
                      E-mail
                    </FieldLabel>
                    <EmailInput id="pcb-email" value={email} onChange={setEmail} />
                  </div>
                  <div>
                    <FieldLabel htmlFor="pcb-cidade" optional>
                      Cidade
                    </FieldLabel>
                    <input
                      id="pcb-cidade"
                      value={cidade}
                      onChange={(e) => setCidade(e.target.value)}
                      autoComplete="address-level2"
                      placeholder="Cidade / UF"
                      className={CONTROL}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <FieldLabel htmlFor="pcb-msg" optional>
                      Conte o seu sonho
                    </FieldLabel>
                    <textarea
                      id="pcb-msg"
                      rows={4}
                      value={mensagem}
                      onChange={(e) => setMensagem(e.target.value)}
                      placeholder="Uma piscina de praia no quintal? Um lago com carpas? Conta pra gente."
                      className="w-full rounded-lg border-[1.5px] border-western-border-strong bg-western-paper px-4 py-3 font-sans text-[15px] leading-[1.6] text-western-green-deep placeholder:text-western-stone-warm/60 outline-none transition-colors focus:border-western-green-deep resize-none"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <TurnstileWidget
                      onToken={setCaptchaToken}
                      onExpire={() => setCaptchaToken(null)}
                    />
                  </div>
                  <div className="md:col-span-2 flex flex-col sm:flex-row sm:items-center gap-3">
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

            <p className="mt-10 text-[15px] text-western-cream/70">
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
