import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  MessageCircle,
  ArrowDown,
  Sparkles,
  PencilRuler,
  HardHat,
  LifeBuoy,
  Send,
  Factory,
  Feather,
  Eye,
  Leaf,
  Loader2,
  Check,
  MapPin,
  ShieldCheck,
  FileText,
  Lock,
  ArrowRight,
} from "lucide-react";
import Seo from "@/components/seo/Seo";
import Reveal from "@/components/shared/Reveal";
import SocialProof from "@/components/shared/SocialProof";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { BUSINESS } from "@/config/business";
import { submitSecureLead } from "@/lib/leads";
import TurnstileWidget from "@/components/security/TurnstileWidget";
import { toast } from "sonner";
import PhoneInput from "@/components/forms/PhoneInput";
import EmailInput from "@/components/forms/EmailInput";
import FieldLabel from "@/components/forms/FieldLabel";
import { onlyDigits, formatPhoneBR } from "@/lib/forms/br";

// Imagens reais reaproveitadas do projeto (webp otimizadas)
/* Hero novo (escolha do dono, 18/07): "instalação em andamento" — a equipe
   carregando a PP3 na mão com a Santa Bárbara já posicionada, golden hour,
   sem céu estourado. Pipeline: cena produto-travada → 4K ByteDance → grão σ7. */
import heroImg from "@/assets/contrate/hero-instalacao.webp";
import heroImgMob from "@/assets/contrate/hero-instalacao-mob.webp";
import serraImg from "@/assets/projetos-western/06_piscina-cascata-serra.webp";

const WHATSAPP_MSG_DEFAULT =
  "Olá, Western! Quero agendar a consultoria gratuita para o meu projeto.";

const WHATSAPP_MSG_CONSULTOR =
  "Olá, vim pelo site da Western e gostaria de falar com um consultor.";

const waLink = (msg: string) =>
  `https://wa.me/${BUSINESS.whatsappFabrica}?text=${encodeURIComponent(msg)}`;

const PERFIS = [
  { value: "", label: "Selecione (opcional)" },
  { value: "arquiteto", label: "Arquiteto/Paisagista" },
  { value: "construtora", label: "Construtora" },
  { value: "parceiro", label: "Parceiro revendedor" },
  { value: "cliente-final", label: "Cliente final" },
];

const DIFERENCIAIS = [
  {
    icon: Factory,
    titulo: "Quem fabrica, executa",
    desc: "Do molde à instalação — ninguém conhece a peça como a fábrica que a inventou.",
  },
  {
    icon: Feather,
    titulo: "Viabiliza o inviável",
    desc: "Pedra até 10× mais leve permite cascatas e piscinas onde a pedra natural não aguenta: declives, lajes, estruturas críticas.",
  },
  {
    icon: Eye,
    titulo: "Render antes da obra",
    desc: "Você e seu cliente aprovam o resultado em 3D antes de a primeira peça sair da fábrica.",
  },
  {
    icon: Leaf,
    titulo: "Equipe própria + baixo impacto",
    desc: "Instalação por profissionais com 20+ anos de casa. Molde tirado da pedra real, com PET reciclado — zero extração.",
  },
];

const SERVICOS = [
  {
    icon: Sparkles,
    titulo: "Consultoria",
    desc: "Especificação, viabilidade técnica e orientação sobre acabamentos, quantidades e integração ao projeto.",
  },
  {
    icon: PencilRuler,
    titulo: "Projeto & Render",
    desc: "Visualização 3D fotorrealista antes da obra — decida com segurança e alinhe expectativas com o cliente.",
  },
  {
    icon: HardHat,
    titulo: "Instalação",
    desc: "Execução pela equipe Western, com técnica apurada, fixação correta e acabamento integrado ao paisagismo.",
  },
  {
    icon: LifeBuoy,
    titulo: "Acompanhamento",
    desc: "Suporte contínuo do conceito à entrega — logística, cronograma e ajustes finos no local da obra.",
  },
];

const PASSOS = [
  {
    n: "1",
    titulo: "Contato e apresentação",
    desc: "Você fala com a gente por WhatsApp ou pelo formulário. Rápido, direto, sem burocracia.",
    gratis: true,
  },
  {
    n: "2",
    titulo: "Consultoria inicial gratuita",
    desc: "Nosso time entende o projeto e a compatibilidade com nossos produtos e serviços. Sem custo, sem compromisso.",
    gratis: true,
  },
  {
    n: "3",
    titulo: "Visita ao local (se necessário)",
    desc: "Contratados os serviços, agendamos visita técnica para leitura precisa do terreno e das condições da obra.",
    gratis: false,
  },
  {
    n: "4",
    titulo: "Projeto e render 3D",
    desc: "Montamos a composição, apresentamos o render fotorrealista e ajustamos até a aprovação final.",
    gratis: false,
  },
  {
    n: "5",
    titulo: "Execução e instalação",
    desc: "Nossa equipe executa e entrega — do transporte à peça posicionada, integrada ao paisagismo.",
    gratis: false,
  },
];

const FAQ_ITEMS = [
  {
    q: "Vocês atendem em todo o Brasil?",
    a: "Sim, atendemos todo o Brasil.",
  },
  {
    q: "Como funciona o orçamento?",
    a: "Marcamos uma consultoria inicial gratuita com nosso time para entender as necessidades do projeto e a compatibilidade com nossos produtos e serviços — e a partir daí montamos o orçamento.",
  },
  {
    q: "Preciso já ter o projeto pronto?",
    a: "Não. Na consultoria inicial entendemos o que você quer e ajudamos a viabilizar; se for o caso, fazemos o projeto e o render 3D.",
  },
  {
    q: "Vocês instalam ou só fornecem?",
    a: "Os dois. Podemos apenas fornecer os produtos com manuais e instruções de instalação, ou executar a instalação com nossa equipe — profissionais que trabalham na Western há mais de 20 anos.",
  },
];

const CONFIANCA = [
  { icon: MapPin, label: "Atendemos todo o Brasil" },
  { icon: MessageCircle, label: "Consultoria gratuita" },
  { icon: ShieldCheck, label: `Ateliê desde ${BUSINESS.fundadaEm}` },
  { icon: Check, label: `Garantia de ${BUSINESS.garantiaLabel}` },
];

const BENEFICIOS_CONSULTORIA = [
  "Diagnóstico técnico do seu projeto",
  "Compatibilidade com pedras e cascatas Western",
  "Estimativa de escopo, prazo e viabilidade",
];

// Classes compartilhadas — DS V3 (cantos suaves, 16px mínimo em UI, alvo 52px)
const CARD =
  "h-full bg-white border border-western-border-soft rounded-lg p-6 md:p-7 shadow-[0_10px_30px_-24px_hsl(var(--western-stone-dark)/0.5)] hover:border-western-gold/50 transition-colors";
const CARD_ICON =
  "inline-flex h-12 w-12 items-center justify-center rounded-lg bg-western-paper border border-western-border-soft text-western-bronze mb-5";
const CARD_TITLE =
  "font-sans font-semibold text-[18px] leading-snug text-western-green-deep mb-2";
const CARD_DESC = "text-spec leading-relaxed";
// Nome / perfil / mensagem: pele V3 local (52px, cantos 10px, tipo 16px, fundo
// paper sobre a carta branca). WhatsApp e e-mail usam PhoneInput/EmailInput
// compartilhados, que já trazem esta mesma pele — nada de máscara própria aqui.
const CONTROL =
  "w-full rounded-lg bg-western-paper border-[1.5px] border-western-border-strong px-4 text-[15px] text-western-green-deep placeholder:text-western-stone-warm/60 focus:border-western-green-deep focus:outline-none transition-colors";
const FIELD_H = "h-control";

export default function ContrateAWestern() {
  const formRef = useRef<HTMLDivElement>(null);
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [perfil, setPerfil] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);

  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const buildWhatsMsg = () => {
    const perfilLabel = PERFIS.find((p) => p.value === perfil)?.label;
    return [
      "Olá, Western! Vim pelo site e quero agendar a consultoria inicial gratuita.",
      "",
      `Nome: ${nome || "—"}`,
      `WhatsApp: ${telefone ? formatPhoneBR(telefone) : "—"}`,
      email ? `E-mail: ${email}` : null,
      perfil ? `Perfil: ${perfilLabel}` : null,
      mensagem ? "" : null,
      mensagem ? "Sobre o projeto:" : null,
      mensagem || null,
    ]
      .filter((x) => x !== null)
      .join("\n");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (enviando) return;

    if (!nome.trim() || onlyDigits(telefone).length < 10) {
      toast.error("Preencha nome e WhatsApp (mínimo 10 dígitos).");
      return;
    }
    if (!captchaToken) {
      toast.error("Confirme que você não é um robô.");
      return;
    }

    setEnviando(true);

    // 1) grava lead — não bloqueia o fluxo se falhar
    try {
      const res = await submitSecureLead({
        type: "contato",
        nome: nome.trim(),
        email: email.trim() || null,
        telefone: telefone.trim(),
        mensagem: mensagem.trim() || null,
        origem: "contrate-a-western",
        payload: {
          perfil: perfil || null,
          pagina: "/contrate-a-western",
        },
      }, captchaToken);
      if (!res.ok) throw new Error(res.error ?? "erro");
    } catch (err) {
      console.warn("[contrate-a-western] falha ao gravar lead:", err);
      // silencioso — não bloqueia o WhatsApp
    }

    // 2) abre WhatsApp com mensagem pronta
    window.open(waLink(buildWhatsMsg()), "_blank", "noopener,noreferrer");
    toast.success("Abrimos o WhatsApp com sua mensagem pronta.");
    setEnviando(false);
    setCaptchaToken(null);
  };

  return (
    <>
      <Seo
        title="Contrate a Western — Consultoria, Projeto 3D e Instalação"
        description="Do projeto à obra, a Western executa com você. Consultoria gratuita, render 3D e instalação por quem fabrica a pedra. Cascatas, piscinas e paisagens em todo o Brasil."
        path="/contrate-a-western"
      />

      {/* 1) HERO — foto real legível + texto no trilho esquerdo (padrão do site).
          Antes: texto centrado + cobertor verde 84–95% — a foto morria e esta era
          a única dobra centralizada do site. Agora: scrim DIRECIONAL (forte na
          esquerda, onde o texto vive; limpo na direita, onde a cascata é o
          assunto) + véu na base para a régua de confiança, que subiu para DENTRO
          da dobra — o "por que confiar" aparece sem rolar. */}
      <section className="relative isolate overflow-hidden flex flex-col min-h-[560px] md:min-h-[640px]">
        <picture>
          <source media="(min-width: 768px)" srcSet={heroImg} width={2400} height={1350} />
          <img
            src={heroImgMob}
            alt="Equipe Western instalando pedras na borda de uma piscina de praia em obra, ao entardecer"
            width={1080}
            height={1550}
            loading="eager"
            decoding="async"
            className="absolute inset-0 h-full w-full object-cover"
          />
        </picture>
        <div
          className="absolute inset-0 pointer-events-none hidden md:block"
          aria-hidden
          style={{
            background:
              "linear-gradient(180deg, transparent 45%, hsl(var(--western-green-deep) / 0.62) 100%), linear-gradient(100deg, hsl(var(--western-green-deep) / 0.92) 0%, hsl(var(--western-green-deep) / 0.62) 42%, hsl(var(--western-green-deep) / 0.22) 68%, hsl(var(--western-green-deep) / 0.06) 100%)",
          }}
        />
        <div
          className="absolute inset-0 pointer-events-none md:hidden"
          aria-hidden
          style={{
            background:
              "linear-gradient(180deg, hsl(var(--western-green-deep) / 0.94) 0%, hsl(var(--western-green-deep) / 0.82) 55%, hsl(var(--western-green-deep) / 0.60) 82%, hsl(var(--western-green-deep) / 0.78) 100%)",
          }}
        />

        <div className="relative container-western flex-1 flex flex-col justify-center py-14 md:py-16">
          <Reveal variant="fade-up" duration={700}>
            <div className="max-w-2xl">
              <p className="font-sans font-semibold text-[14px] uppercase tracking-[0.06em] text-western-gold-soft mb-4">
                Serviços Western
              </p>
              <h1 className="display-xl text-western-cream">
                Do projeto à obra,{" "}
                <span className="text-western-gold-soft">a Western executa com você.</span>
              </h1>
              <p className="mt-5 text-[16px] md:text-[17px] leading-[1.6] text-western-cream/90 max-w-xl">
                Consultoria, projeto, render 3D e instalação com quem fabrica a pedra. Os dois
                primeiros passos são gratuitos — você só decide depois de conhecer.
              </p>

              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={scrollToForm}
                  className="btn-gold w-full sm:w-auto"
                >
                  <ArrowDown className="h-5 w-5" />
                  Agendar consultoria gratuita
                </button>
                <a
                  href={waLink(WHATSAPP_MSG_DEFAULT)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-outline-cream w-full sm:w-auto"
                >
                  <MessageCircle className="h-5 w-5" />
                  Falar no WhatsApp
                </a>
              </div>

              <p className="mt-8 text-[15px] leading-relaxed text-western-cream/90 max-w-lg [text-shadow:0_1px_12px_hsl(var(--western-green-deep)/0.85)]">
                Especificada nas obras de Neymar Jr. · Alex Hanazaki · Rosewood · Unique Garden
              </p>
              {/* Os quatro nomes acima TÊM lastro clicável (o Hanazaki ganhou
                  obra em 2026-07); a linha nunca cita prova que o site não
                  consegue mostrar. */}
              <Link
                to="/obras"
                className="tap-target mt-4 inline-flex items-center gap-1.5 font-sans text-base font-semibold text-western-gold-soft hover:text-western-cream transition-colors"
              >
                Ver as obras
                <ArrowRight className="h-5 w-5" strokeWidth={1.75} aria-hidden />
              </Link>
            </div>
          </Reveal>
        </div>

        {/* Régua de confiança dentro da dobra, sobre a foto — mesma gramática da
            régua de provas do hero da home (2×2 no celular, 4 col no desktop). */}
        <div className="relative container-western pb-8 md:pb-10">
          <ul className="grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-4 border-t border-western-cream/25 pt-6">
            {CONFIANCA.map((c) => (
              <li key={c.label} className="flex items-center gap-3">
                <c.icon className="h-5 w-5 shrink-0 text-western-gold-soft" aria-hidden="true" />
                <span className="font-sans text-[15px] md:text-[15px] font-medium text-western-cream">
                  {c.label}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* 3) POR QUE A WESTERN */}
      <section className="surface-ivory section">
        <div className="container-western">
          <div className="max-w-6xl">
          <div className="grid md:grid-cols-12 gap-10 md:gap-14 items-start">
            <Reveal variant="fade-up" duration={700} className="md:col-span-5">
              <div>
                <p className="text-eyebrow">Por que a Western</p>
                <h2 className="display-lg text-western-green-deep mt-3">
                  Um único parceiro que já resolveu o que ninguém tinha resolvido.
                </h2>
                <p className="mt-5 text-body">
                  A Western é a fábrica e a executora. Isso significa custo, prazo,
                  técnica e responsabilidade concentrados em um só time —
                  do render 3D à peça posicionada em obra.
                </p>
                <div className="mt-8 aspect-[4/3] overflow-hidden rounded-xl">
                  <img
                    src={serraImg}
                    alt="Piscina com cascata Western em meio à serra"
                    width={800}
                    height={600}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </Reveal>

            <div className="md:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-5">
              {DIFERENCIAIS.map((d, i) => (
                <Reveal key={d.titulo} variant="fade-up" delay={i * 70} duration={650}>
                  <div className={CARD}>
                    <span className={CARD_ICON}>
                      <d.icon className="h-6 w-6" />
                    </span>
                    <h3 className={CARD_TITLE}>{d.titulo}</h3>
                    <p className={CARD_DESC}>{d.desc}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>

          {/* Esta página tinha 2 entradas e ZERO saídas internas: só wa.me. Quem
              não clica no WhatsApp ficava preso — e os dois pontos onde ela mais
              afirma sem provar (o card "Viabiliza o inviável" e a linha de obras
              logo abaixo) são exatamente os que pedem a saída. */}
          <Reveal variant="fade-up" delay={80} duration={650}>
            {/* Era text-western-cream DENTRO de surface-ivory — texto claro
                sobre fundo claro, link invisível (auditoria 2026-07-17).
                Primeiro consumidor da classe nova .link-cta. */}
            <Link
              to="/a-pedra"
              className="link-cta mt-10"
            >
              Por que a pedra pesa 10× menos
              <ArrowRight className="h-5 w-5" strokeWidth={1.75} aria-hidden />
            </Link>
          </Reveal>
          </div>
        </div>
      </section>

      {/* 4) SERVIÇOS */}
      <section className="surface-paper section border-y border-western-border-soft">
        <div className="container-western">
          <div className="max-w-6xl">
          <Reveal variant="fade-up" duration={700}>
            <header className="text-center max-w-2xl mx-auto mb-12">
              <p className="text-eyebrow">O que fazemos por você</p>
              <h2 className="display-lg text-western-green-deep mt-3">
                Um único parceiro do conceito à entrega
              </h2>
            </header>
          </Reveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
            {SERVICOS.map((s, i) => (
              <Reveal key={s.titulo} variant="fade-up" delay={i * 80} duration={650}>
                <div className={CARD}>
                  <span className={CARD_ICON}>
                    <s.icon className="h-6 w-6" />
                  </span>
                  <h3 className={CARD_TITLE}>{s.titulo}</h3>
                  <p className={CARD_DESC}>{s.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
          </div>
        </div>
      </section>

      {/* 5) COMO FUNCIONA */}
      <section className="surface-ivory section">
        <div className="container-western">
          <div className="max-w-6xl">
          <Reveal variant="fade-up" duration={700}>
            <header className="text-center max-w-2xl mx-auto mb-12">
              <p className="text-eyebrow">Como funciona</p>
              <h2 className="display-lg text-western-green-deep mt-3">
                Cinco passos até a sua obra pronta
              </h2>
              <p className="mt-4 text-body max-w-xl mx-auto">
                Os dois primeiros passos são{" "}
                <span className="font-semibold text-western-green-deep">
                  rápidos, gratuitos e sem compromisso
                </span>
                . Você só decide seguir depois de conhecer.
              </p>
            </header>
          </Reveal>

          <ol className="grid grid-cols-1 md:grid-cols-5 gap-4 md:gap-5">
            {PASSOS.map((p, i) => (
              <Reveal key={p.n} variant="fade-up" delay={i * 70} duration={650}>
                <li
                  className={`relative h-full bg-white rounded-lg p-6 border shadow-[0_10px_30px_-24px_hsl(var(--western-stone-dark)/0.5)] ${
                    p.gratis
                      ? "border-western-gold/50"
                      : "border-western-border-soft"
                  }`}
                >
                  {/* Todo passo carrega um sinal de preço: 1–2 grátis (dourado),
                      3–5 "Sob consulta" (bronze neutro). Antes 3–5 ficavam em
                      branco e liam como preço escondido — decisão do dono. */}
                  <span
                    className={`absolute -top-3 left-6 rounded-sm px-2.5 py-1 font-sans text-[14px] font-semibold leading-none ${
                      p.gratis
                        ? "bg-western-gold text-western-green-deep"
                        : "bg-western-paper border border-western-border-strong text-western-bronze"
                    }`}
                  >
                    {p.gratis ? "Grátis" : "Sob consulta"}
                  </span>
                  <span className="font-display text-[32px] leading-none text-western-bronze block mb-3">
                    {p.n}
                  </span>
                  <h3 className={CARD_TITLE}>{p.titulo}</h3>
                  <p className={CARD_DESC}>{p.desc}</p>
                </li>
              </Reveal>
            ))}
          </ol>
          </div>
        </div>
      </section>

      {/* 6) PROVA SOCIAL — rostos + mural de marcas */}
      <section className="surface-paper section border-t border-western-border-soft">
        <div className="container-western">
          <Reveal variant="fade-up" duration={750}>
            <SocialProof
              interactive
              layout="row"
              align="left"
              eyebrow="Quem confia na Western"
              titulo={<>Especificada por quem define o paisagismo brasileiro.</>}
              groups={["celebridades", "profissionais", "marcas"]}
            />
          </Reveal>
        </div>
      </section>

      {/* 7) FAQ */}
      <section className="surface-ivory section border-y border-western-border-soft">
        <div className="container-western">
          <div className="mx-auto max-w-3xl">
          <Reveal variant="fade-up" duration={700}>
            <header className="text-center mb-10">
              <p className="text-eyebrow">Perguntas frequentes</p>
              <h2 className="display-lg text-western-green-deep mt-3">
                Tirando as dúvidas antes da consultoria
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
                  <AccordionTrigger className="text-left font-sans font-semibold text-[16px] md:text-[17px] text-western-green-deep hover:no-underline py-5 min-h-[var(--tap-min)]">
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

      {/* 8) FORMULÁRIO / RAMPA — faixa verde institucional, formulário em carta clara */}
      <section ref={formRef} id="contato" className="surface-forest">
        <div className="container-western section">
          <div className="max-w-5xl">
          <div className="grid md:grid-cols-12 gap-10 md:gap-14 items-start">
            <Reveal variant="fade-up" duration={700} className="md:col-span-5">
              <div>
                <p className="font-sans font-semibold text-[14px] uppercase tracking-[0.06em] text-western-gold-soft mb-3">
                  Consultoria inicial gratuita
                </p>
                <h2 className="display-lg text-western-cream">
                  Comece com uma conversa{" "}
                  <span className="text-western-gold-soft">grátis e sem compromisso.</span>
                </h2>
                <p className="mt-5 text-[16px] leading-[1.6] text-western-cream/85">
                  Preencha o essencial —{" "}
                  <strong className="font-semibold text-western-cream">
                    só nome e WhatsApp
                  </strong>{" "}
                  são obrigatórios. Ao enviar, gravamos seu contato e abrimos o WhatsApp
                  com a sua mensagem já pronta.
                </p>

                <ul className="mt-7 space-y-3">
                  {BENEFICIOS_CONSULTORIA.map((b) => (
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
                  href={waLink(WHATSAPP_MSG_CONSULTOR)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="tap-target mt-7 inline-flex items-center gap-2 text-[15px] font-semibold text-western-gold-soft underline underline-offset-4 decoration-western-gold/50 hover:decoration-western-gold-soft"
                >
                  <MessageCircle className="h-5 w-5" />
                  Prefere WhatsApp? Falar com consultor
                </a>
              </div>
            </Reveal>

            <Reveal variant="fade-up" delay={100} duration={700} className="md:col-span-7">
              <form
                onSubmit={handleSubmit}
                className="bg-white border border-western-border-soft rounded-xl p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-5"
                noValidate
              >
                <div className="md:col-span-1">
                  <FieldLabel htmlFor="ct-nome" required>Nome</FieldLabel>
                  <input
                    id="ct-nome"
                    required
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    autoComplete="name"
                    placeholder="Como podemos te chamar"
                    className={`${CONTROL} ${FIELD_H}`}
                  />
                </div>

                <div className="md:col-span-1">
                  <FieldLabel htmlFor="ct-tel" required>WhatsApp</FieldLabel>
                  <PhoneInput
                    id="ct-tel"
                    value={telefone}
                    onChange={setTelefone}
                  />
                </div>

                <div className="md:col-span-1">
                  <FieldLabel htmlFor="ct-email" optional>E-mail</FieldLabel>
                  <EmailInput
                    id="ct-email"
                    value={email}
                    onChange={setEmail}
                  />
                </div>

                <div className="md:col-span-1">
                  <FieldLabel htmlFor="ct-perfil" optional>Perfil</FieldLabel>
                  <select
                    id="ct-perfil"
                    value={perfil}
                    onChange={(e) => setPerfil(e.target.value)}
                    className={`${CONTROL} ${FIELD_H}`}
                  >
                    {PERFIS.map((p) => (
                      <option key={p.value} value={p.value}>
                        {p.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <FieldLabel htmlFor="ct-msg" optional>Sobre o projeto</FieldLabel>
                  <textarea
                    id="ct-msg"
                    rows={4}
                    value={mensagem}
                    onChange={(e) => setMensagem(e.target.value)}
                    placeholder="Local, escopo, prazo — o que quiser adiantar."
                    className={`${CONTROL} py-3 resize-none`}
                  />
                </div>

                <div className="md:col-span-2">
                  <TurnstileWidget
                    onToken={setCaptchaToken}
                    onExpire={() => setCaptchaToken(null)}
                  />
                </div>

                <div className="md:col-span-2 flex flex-col sm:flex-row sm:items-center gap-3">
                  <button
                    type="submit"
                    disabled={enviando}
                    className="btn-primary w-full sm:w-auto"
                  >
                    {enviando ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Enviando…
                      </>
                    ) : (
                      <>
                        <Send className="h-5 w-5" />
                        Agendar consultoria grátis
                      </>
                    )}
                  </button>
                  <span className="text-meta text-center sm:text-left">
                    Sem compromisso · Resposta rápida
                  </span>
                </div>

                <div className="md:col-span-2 pt-5 border-t border-western-border-soft grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { icon: FileText, label: "Compra segura" },
                    { icon: ShieldCheck, label: `Garantia de ${BUSINESS.garantiaLabel}` },
                    { icon: Check, label: `Ateliê brasileiro desde ${BUSINESS.fundadaEm}` },
                    { icon: Lock, label: `CNPJ ${BUSINESS.cnpj}` },
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
          </div>
        </div>
      </section>
    </>
  );
}
