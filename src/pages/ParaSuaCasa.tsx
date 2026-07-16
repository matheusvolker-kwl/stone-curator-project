// /para-sua-casa — porta B2C (turnkey). Vende SONHO: mostra, não afirma.
// Regra de cor travada nesta página: TODO CTA é dourado (relacionamento/WhatsApp).
// O verde fica reservado à ação B2B "ver preço/cadastrar", que não existe aqui.
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
import { submitSecureLead } from "@/lib/leads";
import { BUSINESS } from "@/config/business";

import heroImg from "@/assets/para-sua-casa/hero.webp";
import imgPiscina from "@/assets/linguagens/piscina-praia.webp";
import imgLago from "@/assets/segmentos/lagos/02.webp";
import imgCascata from "@/assets/segmentos/cascatas/01.webp";
import imgJardim from "@/assets/segmentos/jardins/01.webp";
import obraTato from "@/assets/obras/tato.webp";
import obraTatoAntes from "@/assets/obras/tato-antes.webp";
import obraEvandro from "@/assets/obras/evandro-leveza.webp";
import obraShowroom from "@/assets/obras/showroom-2.webp";
import render3d from "@/assets/obras/tapirai-render.webp";
import real3d from "@/assets/obras/tapirai-real.webp";
import atelieImg from "@/assets/irmaos-botelho-gruta.webp";

const waLink = (msg: string) =>
  `https://wa.me/${BUSINESS.whatsappFabrica}?text=${encodeURIComponent(msg)}`;

const CAMINHOS = [
  {
    img: imgPiscina,
    titulo: "Piscina natural ou de praia",
    desc: "Entra caminhando pela areia, água por sal — sem cloro, sem olho ardendo. A gente projeta e executa por inteiro.",
    cta: "Quero a minha piscina",
    msg: "Olá! Quero uma piscina natural para a minha casa.",
  },
  {
    img: imgLago,
    titulo: "Lago com carpas",
    desc: "Um espelho d'água vivo no seu jardim, com peixe e planta na mesma água — sem obra pesada.",
    cta: "Quero um lago",
    msg: "Olá! Quero um lago ornamental no meu jardim.",
  },
  {
    img: imgCascata,
    titulo: "Cascata no quintal",
    desc: "O som de água que transforma o fim de tarde. Tão leve que sobe até a laje ou a cobertura, sem guindaste.",
    cta: "Quero uma cascata",
    msg: "Olá! Quero uma cascata na minha casa.",
  },
  {
    img: imgJardim,
    titulo: "Jardim de pedra",
    desc: "Matacões que parecem ter nascido ali, com ou sem água. Do quintal ao terraço.",
    cta: "Quero um jardim assim",
    msg: "Olá! Quero um jardim com pedras Western.",
  },
];

const OBRAS_SONHO = [
  {
    img: obraTato,
    antes: obraTatoAntes,
    credito: "Tato (Falamansa)",
    titulo: "De piscina de pastilha a praia particular",
    linha: "Uma piscina retangular azul virou um oásis: areia, matacão, fogo de chão e lago com carpas.",
  },
  {
    img: obraEvandro,
    credito: "Evandro Mesquita",
    titulo: "Ele levanta a pedra com as mãos",
    linha: "É a prova de leveza: a mesma rocha que parece maciça pesa cerca de 10× menos — e por isso cabe em qualquer casa.",
  },
  {
    img: obraShowroom,
    credito: "ShowRoom Riviera",
    titulo: "Você pode visitar e sentir",
    linha: "Cascata, prainha, blower, ofurô e som num só lugar — para você tocar antes de decidir.",
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
    a: "A água é tratada por salinização: o sal vira o agente que limpa a água, sem cloro, sem cheiro, sem olho ardendo. O sistema se auto-regula — por isso peixe e planta vivem no lago, e a piscina fica macia e transparente.",
  },
  {
    q: "Não tenho empresa nem CNPJ. Consigo mesmo assim?",
    a: "Consegue, sim. A pedra avulsa vendemos só para profissionais, mas para a sua casa fazemos a obra completa: a pedra vai instalada, com garantia de 1 ano, sem você precisar de empresa nem se preocupar com nada.",
  },
];

function maskPhone(v: string): string {
  const d = v.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 2) return d;
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

const FIELD_LABEL =
  "block font-sans font-semibold text-[14px] uppercase tracking-[0.06em] text-western-bronze mb-2";
const FIELD_INPUT =
  "w-full rounded-[10px] bg-white border-[1.5px] border-western-border-strong px-4 text-[16px] text-western-green-deep placeholder:text-western-stone-warm/60 focus:border-western-gold focus:ring-2 focus:ring-western-gold/20 outline-none transition-colors";
const FIELD_H = "h-[52px]";

export default function ParaSuaCasa() {
  const formRef = useRef<HTMLDivElement>(null);
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [email, setEmail] = useState("");
  const [cidade, setCidade] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);

  const scrollToForm = () => formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });

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
      console.warn("[para-sua-casa] falha ao gravar lead:", err);
    }
    const msg = [
      "Olá, Western! Vim pelo site e quero um projeto para a minha casa.",
      "",
      `Nome: ${nome || "—"}`,
      `WhatsApp: ${telefone || "—"}`,
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

      {/* 1 — HERO */}
      <section className="relative isolate overflow-hidden flex items-center bg-western-green-deep min-h-[540px] md:min-h-[620px]">
        <img
          src={heroImg}
          alt="Piscina de praia com borda de pedra artesanal Western"
          width={1800}
          height={1200}
          loading="eager"
          fetchPriority="high"
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div
          className="absolute inset-0 md:hidden"
          style={{
            background:
              "linear-gradient(to bottom, hsl(var(--western-green-deep) / 0.92), hsl(var(--western-green-deep) / 0.8) 45%, hsl(var(--western-green-deep) / 0.94))",
          }}
          aria-hidden="true"
        />
        <div
          className="absolute inset-0 hidden md:block"
          style={{
            background:
              "linear-gradient(to right, hsl(var(--western-green-deep)) 0%, hsl(var(--western-green-deep) / 0.93) 46%, hsl(var(--western-green-deep) / 0.55) 68%, hsl(var(--western-green-deep) / 0.12) 100%)",
          }}
          aria-hidden="true"
        />

        <div className="relative container-western py-16 md:py-24">
          <Reveal variant="fade-up" duration={700}>
            <div className="max-w-2xl">
              <p className="font-sans font-semibold text-[14px] uppercase tracking-[0.06em] text-western-gold-soft mb-4">
                Ateliê Western · para a sua casa · desde {BUSINESS.fundadaEm}
              </p>
              <h1 className="display-xl text-western-cream">
                A sua casa pode ter a{" "}
                <span className="text-western-gold-soft">sua praia.</span>
              </h1>
              <p className="mt-5 text-[17px] md:text-[19px] leading-[1.6] text-western-cream/90 max-w-xl">
                Piscinas de praia, lagos e cascatas em pedra artesanal. A gente desenha em 3D, você
                aprova, e o ateliê entrega pronto — do sonho ao primeiro mergulho.
              </p>

              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <a
                  href={waLink("Olá! Quero um projeto para a minha casa.")}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-gold w-full sm:w-auto"
                >
                  <MessageCircle className="h-5 w-5" />
                  Falar com o ateliê
                </a>
                <button type="button" onClick={scrollToForm} className="btn-outline-cream w-full sm:w-auto">
                  <ArrowDown className="h-5 w-5" />
                  Contar meu sonho
                </button>
              </div>

              <p className="mt-8 text-[15px] leading-relaxed text-western-cream/80">
                Nas casas de Neymar Jr. · Tato (Falamansa) · Caito Maia
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* 2 — BARRA DE CONFIANÇA */}
      <section className="surface-paper border-b border-western-border-soft">
        <div className="container-western py-6">
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {CONFIANCA.map((c) => (
              <li key={c.label} className="flex items-center gap-3">
                <c.icon className="h-5 w-5 shrink-0 text-western-bronze" aria-hidden="true" />
                <span className="font-sans text-[16px] font-medium text-western-green-deep">
                  {c.label}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* 3 — AS LINGUAGENS DO SONHO (com foto) */}
      <section className="surface-ivory py-16 md:py-24">
        <div className="container-western">
          <Reveal variant="fade-up" duration={700}>
            <header className="max-w-2xl mb-10 md:mb-12">
              <p className="text-eyebrow">Por onde começar</p>
              <h2 className="display-lg text-western-green-deep mt-3">
                Escolha o que mais parece com o seu sonho.
              </h2>
              <p className="mt-4 text-body">Cada caminho leva direto ao nosso time — sem formulário.</p>
            </header>
          </Reveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {CAMINHOS.map((c, i) => (
              <Reveal key={c.titulo} variant="fade-up" delay={i * 70} duration={650}>
                <article className="flex h-full flex-col bg-white rounded-[16px] overflow-hidden border border-western-border-soft shadow-[0_10px_30px_-24px_hsl(var(--western-stone-dark)/0.5)]">
                  <div className="aspect-[4/3] overflow-hidden bg-western-cream-muted">
                    <img
                      src={c.img}
                      alt={c.titulo}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex flex-1 flex-col p-5 md:p-6">
                    <h3 className="font-sans font-semibold text-[20px] leading-snug text-western-green-deep mb-2">
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

      {/* 4 — VITRINE DE OBRAS REAIS */}
      <section className="surface-paper py-16 md:py-24 border-y border-western-border-soft">
        <div className="container-western">
          <Reveal variant="fade-up" duration={700}>
            <header className="max-w-2xl mb-10 md:mb-12">
              <p className="text-eyebrow">Veja o que já é real</p>
              <h2 className="display-lg text-western-green-deep mt-3">
                Isso existe. Foi entregue. Pode ser a sua casa.
              </h2>
            </header>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {OBRAS_SONHO.map((o, i) => (
              <Reveal key={o.titulo} variant="fade-up" delay={i * 80} duration={650}>
                <figure className="h-full flex flex-col">
                  <div className="relative overflow-hidden rounded-[16px] aspect-[4/5] bg-western-cream-muted">
                    <img
                      src={o.img}
                      alt={o.titulo}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover"
                    />
                    {o.antes && (
                      <div className="absolute bottom-3 left-3 w-24 rounded-[8px] overflow-hidden border-2 border-western-cream shadow-lg">
                        <img src={o.antes} alt="Antes da obra" loading="lazy" className="w-full h-full object-cover" />
                        <span className="absolute inset-x-0 bottom-0 bg-western-green-deep/85 text-western-cream text-[11px] font-semibold text-center py-0.5">
                          ANTES
                        </span>
                      </div>
                    )}
                  </div>
                  <figcaption className="mt-4">
                    <p className="text-eyebrow">{o.credito}</p>
                    <h3 className="font-sans text-[19px] font-semibold text-western-green-deep leading-snug mt-1.5">
                      {o.titulo}
                    </h3>
                    <p className="text-[15px] leading-relaxed text-western-stone-warm mt-2">{o.linha}</p>
                  </figcaption>
                </figure>
              </Reveal>
            ))}
          </div>

          <div className="mt-12 text-center">
            <a
              href={waLink("Olá! Vi as obras no site e quero uma assim na minha casa.")}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-gold w-full sm:w-auto"
            >
              <MessageCircle className="h-5 w-5" />
              Quero uma obra assim na minha casa
            </a>
          </div>
        </div>
      </section>

      {/* 5 — COMO FUNCIONA */}
      <section className="surface-ivory py-16 md:py-24">
        <div className="container-western">
          <Reveal variant="fade-up" duration={700}>
            <header className="text-center max-w-2xl mx-auto mb-12">
              <p className="text-eyebrow">Como funciona</p>
              <h2 className="display-lg text-western-green-deep mt-3">Quatro passos até o mergulho</h2>
              <p className="mt-4 text-body max-w-xl mx-auto">
                Os dois primeiros são{" "}
                <span className="font-semibold text-western-green-deep">grátis e sem compromisso</span>. Você
                só decide seguir depois de conhecer.
              </p>
            </header>
          </Reveal>

          <ol className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {PASSOS.map((p, i) => (
              <Reveal key={p.n} variant="fade-up" delay={i * 70} duration={650}>
                <li
                  className={`relative h-full bg-white rounded-[10px] p-6 border shadow-[0_10px_30px_-24px_hsl(var(--western-stone-dark)/0.5)] ${
                    p.gratis ? "border-western-gold/50" : "border-western-border-soft"
                  }`}
                >
                  {p.gratis && (
                    <span className="absolute -top-3 left-6 rounded-[6px] bg-western-gold px-2.5 py-1 font-sans text-[14px] font-semibold leading-none text-western-green-deep">
                      Grátis
                    </span>
                  )}
                  <span className="font-display text-[32px] leading-none text-western-bronze block mb-3">
                    {p.n}
                  </span>
                  <h3 className="font-sans font-semibold text-[19px] leading-snug text-western-green-deep mb-2">
                    {p.t}
                  </h3>
                  <p className="text-[16px] leading-relaxed text-western-stone-warm">{p.d}</p>
                </li>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {/* 6 — PROJETO 3D (render → realidade) */}
      <section className="surface-forest py-16 md:py-24">
        <div className="container-western">
          <div className="grid md:grid-cols-12 gap-10 md:gap-14 items-center">
            <Reveal variant="fade-up" duration={700} className="md:col-span-5">
              <div>
                <p className="font-sans font-semibold text-[14px] uppercase tracking-[0.06em] text-western-gold-soft mb-4">
                  Projeto 3D
                </p>
                <h2 className="display-lg text-western-cream">
                  Você não aprova{" "}
                  <span className="text-western-gold-soft">no escuro.</span>
                </h2>
                <p className="mt-5 text-[17px] leading-[1.6] text-western-cream/85">
                  A gente desenha a sua área em 3D fotorrealista, você ajusta até ficar do seu jeito —
                  e só então a obra começa. De 10 a 25 dias para o projeto, e atendemos todo o Brasil.
                </p>
                <a
                  href={waLink("Olá! Quero ver o meu projeto em 3D.")}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-gold mt-8 w-full sm:w-auto"
                >
                  <MessageCircle className="h-5 w-5" />
                  Quero ver o meu em 3D
                </a>
              </div>
            </Reveal>

            <Reveal variant="fade-up" delay={90} duration={700} className="md:col-span-7">
              <div className="grid grid-cols-2 gap-3">
                {[
                  { img: render3d, label: "O projeto 3D" },
                  { img: real3d, label: "A obra pronta" },
                ].map((x) => (
                  <figure key={x.label} className="m-0">
                    <div className="aspect-[4/5] overflow-hidden rounded-[12px] bg-western-green-mid/30 ring-1 ring-western-gold/20">
                      <img
                        src={x.img}
                        alt={x.label}
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <figcaption className="mt-2.5 text-center font-sans text-[14px] font-semibold text-western-gold-soft">
                      {x.label}
                    </figcaption>
                  </figure>
                ))}
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* 7 — PROVA SOCIAL ASPIRACIONAL */}
      <section className="surface-ivory py-16 md:py-24 border-b border-western-border-soft">
        <div className="container-western">
          <div className="mx-auto max-w-4xl">
            <Reveal variant="fade-up" duration={750}>
              <SocialProof
                eyebrow="Quem já tem uma"
                titulo={<>Nas casas de quem podia ter qualquer coisa.</>}
                groups={["celebridades"]}
              />
            </Reveal>
          </div>
        </div>
      </section>

      {/* 8 — O ATELIÊ */}
      <section className="surface-paper py-16 md:py-24 border-b border-western-border-soft">
        <div className="container-western">
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
            <Reveal variant="fade-up" delay={90} duration={700} className="md:col-span-6">
              <div>
                <p className="text-eyebrow">Quem faz</p>
                <h2 className="display-lg text-western-green-deep mt-3">
                  Um ateliê de verdade, de mão na massa desde {BUSINESS.fundadaEm}.
                </h2>
                <p className="mt-5 text-body">
                  Mais de {BUSINESS.anosOperacao} anos reproduzindo rocha natural pedra a pedra — obras
                  reais em casas, sítios e pousadas Brasil afora, entregues por equipe própria, com
                  garantia de {BUSINESS.garantiaLabel}. Aqui não é catálogo distante: é gente que atende,
                  projeta e executa.
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* 9 — FAQ */}
      <section className="surface-ivory py-16 md:py-24">
        <div className="container-western">
          <div className="mx-auto max-w-3xl">
            <Reveal variant="fade-up" duration={700}>
              <header className="text-center mb-10">
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
                className="bg-white border border-western-border-soft rounded-[16px] overflow-hidden"
              >
                {FAQ_ITEMS.map((item, i) => (
                  <AccordionItem
                    key={item.q}
                    value={`item-${i}`}
                    className="border-b border-western-border-soft last:border-b-0 px-5 md:px-7"
                  >
                    <AccordionTrigger className="text-left font-sans font-semibold text-[17px] md:text-[18px] text-western-green-deep hover:no-underline py-5 min-h-[var(--tap-min)]">
                      {item.q}
                    </AccordionTrigger>
                    <AccordionContent className="text-western-stone-warm text-[17px] leading-[1.6] pb-6">
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
      <section ref={formRef} id="contato" className="surface-forest">
        <div className="container-western py-16 md:py-24">
          <div className="max-w-5xl mx-auto">
            <div className="grid md:grid-cols-12 gap-10 md:gap-14 items-start">
              <Reveal variant="fade-up" duration={700} className="md:col-span-5">
                <div>
                  <p className="font-sans font-semibold text-[14px] uppercase tracking-[0.06em] text-western-gold-soft mb-3">
                    Sem compromisso
                  </p>
                  <h2 className="display-lg text-western-cream">
                    Conte o seu sonho.{" "}
                    <span className="text-western-gold-soft">A gente mostra o caminho.</span>
                  </h2>
                  <p className="mt-5 text-[17px] leading-[1.6] text-western-cream/85">
                    Só <strong className="font-semibold text-western-cream">nome e WhatsApp</strong> são
                    obrigatórios. Ao enviar, abrimos o WhatsApp com a sua mensagem já pronta.
                  </p>
                  <ul className="mt-7 space-y-3">
                    {["A gente escuta a sua ideia", "Vê a viabilidade na sua área", "Passa uma estimativa real"].map(
                      (b) => (
                        <li key={b} className="flex gap-3 text-[16px] leading-relaxed text-western-cream/85">
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
                    className="tap-target mt-7 inline-flex items-center gap-2 text-[16px] font-semibold text-western-gold-soft underline underline-offset-4 decoration-western-gold/50 hover:decoration-western-gold-soft"
                  >
                    <MessageCircle className="h-5 w-5" />
                    Prefere só conversar? Chama no WhatsApp
                  </a>
                </div>
              </Reveal>

              <Reveal variant="fade-up" delay={100} duration={700} className="md:col-span-7">
                <form
                  onSubmit={handleSubmit}
                  className="bg-western-paper border border-western-border-soft rounded-[16px] p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-5"
                  noValidate
                >
                  <div>
                    <label htmlFor="pc-nome" className={FIELD_LABEL}>
                      Nome <span className="text-western-gold">*</span>
                    </label>
                    <input id="pc-nome" required value={nome} onChange={(e) => setNome(e.target.value)} autoComplete="name" className={`${FIELD_INPUT} ${FIELD_H}`} />
                  </div>
                  <div>
                    <label htmlFor="pc-tel" className={FIELD_LABEL}>
                      WhatsApp <span className="text-western-gold">*</span>
                    </label>
                    <input id="pc-tel" required type="tel" inputMode="tel" value={telefone} onChange={(e) => setTelefone(maskPhone(e.target.value))} autoComplete="tel" placeholder="(11) 90000-0000" className={`${FIELD_INPUT} ${FIELD_H} tabular-nums`} />
                  </div>
                  <div>
                    <label htmlFor="pc-email" className={FIELD_LABEL}>
                      E-mail{" "}
                      <span className="font-normal normal-case tracking-normal text-western-stone-warm">(opcional)</span>
                    </label>
                    <input id="pc-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" className={`${FIELD_INPUT} ${FIELD_H}`} />
                  </div>
                  <div>
                    <label htmlFor="pc-cidade" className={FIELD_LABEL}>
                      Cidade{" "}
                      <span className="font-normal normal-case tracking-normal text-western-stone-warm">(opcional)</span>
                    </label>
                    <input id="pc-cidade" value={cidade} onChange={(e) => setCidade(e.target.value)} autoComplete="address-level2" placeholder="Cidade / UF" className={`${FIELD_INPUT} ${FIELD_H}`} />
                  </div>
                  <div className="md:col-span-2">
                    <label htmlFor="pc-msg" className={FIELD_LABEL}>
                      Conte o seu sonho{" "}
                      <span className="font-normal normal-case tracking-normal text-western-stone-warm">(opcional)</span>
                    </label>
                    <textarea id="pc-msg" rows={4} value={mensagem} onChange={(e) => setMensagem(e.target.value)} placeholder="Uma piscina de praia no quintal? Um lago com carpas? Conta pra gente." className={`${FIELD_INPUT} py-3 resize-none`} />
                  </div>
                  <div className="md:col-span-2">
                    <TurnstileWidget onToken={setCaptchaToken} onExpire={() => setCaptchaToken(null)} />
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
