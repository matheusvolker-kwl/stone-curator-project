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
  ArrowRight,
} from "lucide-react";
import { toast } from "sonner";
import Seo from "@/components/seo/Seo";
import Reveal from "@/components/shared/Reveal";
import SocialProof from "@/components/shared/SocialProof";
import ObraCard from "@/components/shared/ObraCard";
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
import obraTato from "@/assets/obras/tato.webp";
import obraEvandro from "@/assets/obras/evandro-leveza.webp";
import obraShowroom from "@/assets/obras/showroom-2.webp";
/* Sequência Conrado: desenho → 3D → obra entregue. Substitui o par
   tapirai-render/tapirai-real, que a /a-pedra já tinha recusado por escrito —
   o render era uma casa de tijolo de dois andares e a "real" um deck com
   guarda-sóis: rotulados "projeto/entregue", o olho lia contradição bem na
   promessa que a seção sustenta.
   ⚠ O desenho e o 3D NÃO TÊM CASA — são só a parede de pedra e a água. Por isso
   nenhuma legenda aqui diz "a mesma casa": diz "o mesmo projeto", que é o que dá
   pra conferir a olho (a escada de lajes chatas à esquerda e a fileira de quedas
   ao fundo se repetem nos três). */
import conradoDesenho from "@/assets/obras/conrado-desenho.webp";
import conrado3d from "@/assets/obras/conrado-3d.webp";
import conradoObra from "@/assets/obras/conrado-obra.webp";
import atelieImg from "@/assets/irmaos-botelho-gruta.webp";
import atelieVisita from "@/assets/visitar/atelie-hero.webp";

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
    desc: "Pedras que parecem ter nascido ali, com ou sem água. Do quintal ao terraço.",
    cta: "Quero um jardim assim",
    msg: "Olá! Quero um jardim com pedras Western.",
  },
];

const OBRAS_SONHO = [
  {
    img: obraTato,
    credito: "Tato (Falamansa)",
    titulo: "De piscina de pastilha a praia particular",
    linha: "Uma piscina retangular azul virou um oásis: areia, pedras, fogo de chão e lago com carpas.",
  },
  {
    img: obraEvandro,
    credito: "Evandro Mesquita",
    /* A legenda anterior dizia "Ele levanta a pedra com as mãos · a prova de
       leveza". ERA FALSO: na foto o Evandro está pulando numa boia-almofada da
       piscina — não há pedra nenhuma nas mãos dele. Um agente olhou a imagem e
       descreveu o que esperava ver. Numa página cujo trabalho é ser confiável,
       inventar o que a foto mostra é o pior erro possível. Agora a legenda diz
       só o que a foto prova: a cascata Western costurada ao riacho da casa. */
    titulo: "A cascata que parece que sempre esteve ali",
    linha: "Costurada a um riacho que já existia na casa — na casa do Evandro Mesquita, no Rio.",
  },
  {
    img: obraShowroom,
    credito: "Riviera de São Lourenço",
    /* Dizia "Você pode visitar e sentir · para você tocar antes de decidir".
       FALSO desde que a obra foi entregue: a Riviera foi um projeto NOSSO, já
       entregue — não é showroom aberto a visita. Convidar alguém a visitar um
       lugar onde ele não pode entrar é o pior tipo de promessa. O showroom que
       se visita hoje é o ateliê, em Cajamar (ver a seção do ateliê abaixo). */
    titulo: "Uma praia inteira, do zero",
    linha: "Cascata, prainha, blower, ofurô e som num só lugar — projetado e executado por nós.",
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

/* Telefone e e-mail agora vêm de @/components/forms (PhoneInput/EmailInput) —
   máscara e normalização vivem lá, não mais nesta página. CONTROL só veste os
   campos de texto simples (nome, cidade, textarea), na mesma pele V3 que a
   /agendar-visita e o /contato usam: fundo paper dentro do cartão branco. */
const CONTROL =
  "h-control w-full rounded-lg border-[1.5px] border-western-border-strong bg-western-paper px-4 font-sans text-[15px] text-western-green-deep placeholder:text-western-stone-warm/60 outline-none transition-colors focus:border-western-green-deep";

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

      {/* 1 — HERO */}
      <section className="relative isolate overflow-hidden flex items-center bg-western-green-deep min-h-[540px] md:min-h-[620px]">
        <img
          src={heroImg}
          alt="Piscina de praia com borda de pedra artesanal Western, jardim tropical e prainha"
          width={2200}
          height={1356}
          loading="eager"
          fetchPriority="high"
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover"
        />
        {/* Scrims DIRECIONAIS (mesmo tratamento aprovado no /contrate): fortes
            onde o texto vive, limpos onde a foto é o assunto — a piscina-praia
            volta a aparecer. Antes o desktop ia de 100% a 93% até quase metade
            da tela: a página que vende sonho abria como verde chapado. */}
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
              <p className="font-sans font-semibold text-[14px] uppercase tracking-[0.06em] text-western-gold-soft mb-4">
                Ateliê Western · para a sua casa · desde {BUSINESS.fundadaEm}
              </p>
              <h1 className="display-xl text-western-cream">
                A sua casa pode ter a{" "}
                <span className="text-western-gold-soft">sua praia.</span>
              </h1>
              <p className="mt-5 text-[16px] md:text-[17px] leading-[1.6] text-western-cream/90 max-w-xl">
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
        {/* Exceção de ritmo declarada: faixa de credencial usa py-6, não .section. */}
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

      {/* 3 — AS LINGUAGENS DO SONHO (com foto) */}
      <section className="surface-ivory section">
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
                <article className="flex h-full flex-col bg-white rounded-xl overflow-hidden border border-western-border-soft shadow-[0_10px_30px_-24px_hsl(var(--western-stone-dark)/0.5)]">
                  <div className="aspect-[4/3] overflow-hidden bg-western-cream-muted">
                    {/* eager + dimensões: esta é a seção "o que você quer" — as
                        4 fotos SÃO o conteúdo, e lazy deixava 3 caixas cinza
                        (parecia quebrado). width/height reservam o espaço. */}
                    <img
                      src={c.img}
                      alt={c.titulo}
                      width={1100}
                      height={825}
                      loading="eager"
                      decoding="async"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex flex-1 flex-col p-5 md:p-6">
                    <h3 className="font-sans font-semibold text-[18px] leading-snug text-western-green-deep mb-2">
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
      <section className="surface-paper section border-y border-western-border-soft">
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
            {/* Card unificado (ObraCard, variant editorial). A miniatura "ANTES"
                  saiu numa passada anterior: selo de UI a 96px não provava nada. */}
              {OBRAS_SONHO.map((o, i) => (
                <ObraCard
                  key={o.titulo}
                  variant="editorial"
                  index={i}
                  image={o.img}
                  alt={o.titulo}
                  eyebrow={o.credito}
                  title={o.titulo}
                  desc={o.linha}
                />
              ))}
          </div>

          {/* Primária dourada (WhatsApp) + saída interna para quem ainda quer
              VER mais antes de falar: /obras é a galeria completa. Secundária
              em .link-cta (verde, sobre paper) — nunca um segundo sólido. */}
          <div className="mt-12 flex flex-col items-center gap-5">
            <a
              href={waLink("Olá! Vi as obras no site e quero uma assim na minha casa.")}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-gold w-full sm:w-auto"
            >
              <MessageCircle className="h-5 w-5" />
              Quero uma obra assim na minha casa
            </a>
            <Link to="/obras" className="link-cta">
              Ver todas as obras
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      {/* 5 — COMO FUNCIONA */}
      <section className="surface-ivory section">
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

          {/* MARKUP + LINHA DE BASE.
              O <Reveal> estava entre o <ol> e o <li>, renderizando uma <div> ali
              no meio — <ol> só admite <li> como filho. Além de inválido, o
              wrapper quebrava a grade: cada cartão virava filho de um div, e os
              títulos de 1 e 2 linhas faziam o corpo começar em alturas
              diferentes (o mesmo defeito que o dono apontou no /contrate).
              Agora o <li> é filho direto e os quatro dividem as MESMAS faixas
              via grid-rows-subgrid: número, título e corpo alinhados. Onde não
              há suporte a subgrid, degrada sem quebrar. */}
          <ol className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 lg:grid-rows-[auto_auto_1fr]">
            {PASSOS.map((p) => (
              <li
                key={p.n}
                className={`relative flex h-full flex-col gap-2 rounded-lg border bg-white p-6 shadow-[0_10px_30px_-24px_hsl(var(--western-stone-dark)/0.5)] lg:row-span-3 lg:grid lg:grid-rows-subgrid lg:gap-0 ${
                  p.gratis ? "border-western-gold/50" : "border-western-border-soft"
                }`}
              >
                {p.gratis && (
                  <span className="absolute -top-3 left-6 rounded-sm bg-western-gold px-2.5 py-1 font-sans text-[14px] font-semibold leading-none text-western-green-deep">
                    Grátis
                  </span>
                )}
                <span className="block font-display text-[32px] leading-none text-western-bronze">
                  {p.n}
                </span>
                <h3 className="font-sans font-semibold text-[17px] leading-snug text-western-green-deep lg:pt-3">
                  {p.t}
                </h3>
                <p className="text-[15px] leading-relaxed text-western-stone-warm lg:pt-2">
                  {p.d}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* 6 — DO DESENHO À OBRA (desenho do Ricardo → 3D → obra entregue) */}
      <section className="surface-forest section">
        <div className="container-western">
          <Reveal variant="fade-up" duration={700}>
            <div className="max-w-[62ch]">
              <p className="font-sans font-semibold text-[14px] uppercase tracking-[0.06em] text-western-gold-soft mb-4">
                Do desenho à obra
              </p>
              <h2 className="display-lg text-western-cream">
                Você não aprova{" "}
                <span className="text-western-gold-soft">no escuro.</span>
              </h2>
              <p className="mt-5 text-[16px] leading-[1.6] text-western-cream/85">
                Começa a lápis, na mão do nosso projetista. Vira 3D para você ajustar até ficar do seu
                jeito. E só então a obra começa. De 10 a 25 dias para o projeto, e atendemos todo o Brasil.
              </p>
            </div>
          </Reveal>

          <Reveal variant="fade-up" delay={90} duration={700}>
            <ol className="mt-10 md:mt-12 grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6 list-none p-0">
              {[
                { img: conradoDesenho, n: "1", label: "O desenho à mão", d: "O primeiro traço do projeto, a lápis.",
                  alt: "Desenho a lápis de uma parede de pedra com uma queda d'água grande à esquerda, uma fileira de quedas menores em cortina à direita e um lago curvando em primeiro plano." },
                { img: conrado3d, n: "2", label: "O projeto 3D", d: "O mesmo desenho, para você aprovar.",
                  alt: "Projeto em 3D da mesma parede de pedra: a queda maior à esquerda, a fileira de quedas em cortina à direita e a água turquesa na frente." },
                { img: conradoObra, n: "3", label: "A obra entregue", d: "Executada pela nossa equipe.",
                  alt: "Foto da obra pronta em dia de sol: a parede de pedra cor de ocre com a queda maior à esquerda, as quedas menores ao longo da borda e a piscina de água turquesa com patamar de areia." },
              ].map((x) => (
                <li key={x.n}>
                  <figure className="m-0">
                    <div className="aspect-[16/9] overflow-hidden rounded-[12px] bg-western-green-mid/30 ring-1 ring-western-gold/20">
                      <img
                        src={x.img}
                        alt={x.alt}
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <figcaption className="mt-3">
                      <span className="font-sans text-[14px] font-semibold text-western-gold-soft tabular-nums">
                        {x.n} · {x.label}
                      </span>
                      <span className="mt-1 block text-[15px] leading-[1.5] text-western-cream/75">
                        {x.d}
                      </span>
                    </figcaption>
                  </figure>
                </li>
              ))}
            </ol>
          </Reveal>

          <Reveal variant="fade-up" delay={140} duration={700}>
            {/* Diz ao leitor exatamente o que conferir — e só o que as três imagens
                sustentam de verdade. O desenho e o 3D não têm casa nenhuma, então
                "o mesmo projeto" é o limite do que dá pra afirmar aqui. */}
            <p className="mt-8 max-w-[68ch] text-[15px] leading-[1.6] text-western-cream/70">
              As três são o mesmo projeto: repare na escada de pedras chatas descendo até a água, à
              esquerda, e na fileira de quedas ao fundo.
            </p>
            {/* Primária dourada (WhatsApp) + saída interna para entender a
                tecnologia antes de decidir: /a-pedra conta como a pedra é
                feita. Sobre verde → .link-cta-dark (creme), não um 2º sólido. */}
            <div className="mt-8 flex flex-col sm:flex-row sm:items-center gap-x-6 gap-y-4">
              <a
                href={waLink("Olá! Quero ver o meu projeto em 3D.")}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-gold w-full sm:w-auto"
              >
                <MessageCircle className="h-5 w-5" />
                Quero ver o meu em 3D
              </a>
              <Link to="/a-pedra" className="link-cta-dark">
                Como a pedra é feita
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* 7 — PROVA SOCIAL ASPIRACIONAL — 1 grupo: o componente rende o SPLIT
          editorial (cabeçalho à esquerda, rostos à direita), largura cheia do
          trilho. Sem `compact`/wrapper estreito (o "left compact" deixava um
          cluster pequeno flutuando à esquerda — o dono reprovou). */}
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
        </div>
      </section>

      {/* 8 — O ATELIÊ */}
      <section className="surface-paper section border-b border-western-border-soft">
        <div className="container-western">
          {/* SEQUÊNCIA DE DOIS BLOCOS — regrade (dono, 2026-07-18: "continuidade
              esquisita e diagramação estranha").
              O que estava errado era a GRADE, não o gosto:
                · o primeiro bloco dividia 6/6 e o segundo 7/5, então as duas
                  fotos terminavam em colunas diferentes e nada se alinhava;
                · o primeiro tinha foto nua e o segundo foto em cartão — dois
                  tratamentos do mesmo elemento, um embaixo do outro;
                · os dois liam da mesma forma (foto à esquerda, texto à direita),
                  então o olho percorria a mesma figura duas vezes;
                · o painel de texto do segundo tinha pt-0 no celular (o eyebrow
                  encostava na foto) e pl-0 no desktop.
              Agora: MESMA régua 6/6 nos dois, lado da foto ALTERNADO (a leitura
              muda sem a geometria mudar), e o cartão fica só no segundo — porque
              ali ele significa algo: o primeiro é narrativa, o segundo é oferta. */}
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
                  garantia de {BUSINESS.garantiaLabel}. Aqui não é catálogo distante: é gente que atende,
                  projeta e executa.
                </p>
              </div>
            </Reveal>
          </div>

          {/* O CONVITE VERDADEIRO.
              O convite anterior mandava a pessoa visitar a Riviera de São Lourenço —
              e a Riviera é uma obra NOSSA já entregue, que não recebe visita. Já saiu.
              O showroom que existe e recebe gente com hora marcada é o ateliê, e é
              esse que o convite oferece agora. A cidade vem do cadastro (BUSINESS),
              não da foto: nenhuma imagem prova onde o lugar fica. */}
          <Reveal variant="fade-up" delay={120} duration={700}>
            {/* MESMA régua 6/6 do bloco de cima, com a foto do OUTRO lado.
                No celular a ordem volta ao natural (foto e depois texto) via
                order-*: a imagem apresenta o lugar antes do convite. */}
            {/* A calha é a MESMA do bloco de cima (gap-10 md:gap-14). Com calhas
                diferentes as duas fotos saíam com larguras diferentes (525 × 532
                medidos) e a segunda parava 15px antes do trilho — o desencontro
                que se via sem saber nomear. */}
            <div className="mt-12 md:mt-16 grid md:grid-cols-12 gap-10 md:gap-14 items-center overflow-hidden rounded-xl border border-western-border-soft bg-white">
              <div className="order-2 p-6 pt-0 md:order-1 md:col-span-6 md:p-8">
                <p className="text-eyebrow">Visita ao ateliê</p>
                <h3 className="display-md text-western-green-deep mt-3">
                  Venha conhecer o ateliê.
                </h3>
                <p className="mt-4 text-[16px] leading-[1.6] text-western-stone-warm">
                  O ateliê recebe com hora marcada. Dá pra pôr a mão na pedra, ver as peças montadas
                  em escala e conversar com quem produz — antes de decidir qualquer coisa.
                </p>
                <p className="mt-4 text-[15px] leading-[1.6] text-western-stone-warm">
                  {BUSINESS.cidadeAtelie}/{BUSINESS.ufAtelie} · {BUSINESS.horarioAtelie}
                </p>
                <Link to="/visitar" className="btn-gold mt-7 w-full sm:w-auto">
                  <MapPin className="h-5 w-5" aria-hidden />
                  Agendar uma visita
                </Link>
              </div>
              {/* A foto vai à borda do cartão (sem padding do lado de fora) e
                  mantém o mesmo 4/3 do bloco de cima: mesma régua, mesma altura
                  de imagem, leitura invertida. */}
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
      <section className="surface-ivory section">
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

      {/* 10 — FECHAMENTO + CAPTURA */}
      <section ref={formRef} id="contato" className="surface-forest section">
        <div className="container-western">
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
                  <p className="mt-5 text-[16px] leading-[1.6] text-western-cream/85">
                    Só <strong className="font-semibold text-western-cream">nome e WhatsApp</strong> são
                    obrigatórios. Ao enviar, abrimos o WhatsApp com a sua mensagem já pronta.
                  </p>
                  <ul className="mt-7 space-y-3">
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
                    <FieldLabel htmlFor="pc-nome" required>Nome</FieldLabel>
                    <input id="pc-nome" required value={nome} onChange={(e) => setNome(e.target.value)} autoComplete="name" className={CONTROL} />
                  </div>
                  <div>
                    <FieldLabel htmlFor="pc-tel" required>WhatsApp</FieldLabel>
                    <PhoneInput id="pc-tel" name="telefone" value={telefone} onChange={setTelefone} required />
                  </div>
                  <div>
                    <FieldLabel htmlFor="pc-email" optional>E-mail</FieldLabel>
                    <EmailInput id="pc-email" value={email} onChange={setEmail} />
                  </div>
                  <div>
                    <FieldLabel htmlFor="pc-cidade" optional>Cidade</FieldLabel>
                    <input id="pc-cidade" value={cidade} onChange={(e) => setCidade(e.target.value)} autoComplete="address-level2" placeholder="Cidade / UF" className={CONTROL} />
                  </div>
                  <div className="md:col-span-2">
                    <FieldLabel htmlFor="pc-msg" optional>Conte o seu sonho</FieldLabel>
                    <textarea id="pc-msg" rows={4} value={mensagem} onChange={(e) => setMensagem(e.target.value)} placeholder="Uma piscina de praia no quintal? Um lago com carpas? Conta pra gente." className="w-full rounded-lg border-[1.5px] border-western-border-strong bg-western-paper px-4 py-3 font-sans text-[15px] leading-[1.6] text-western-green-deep placeholder:text-western-stone-warm/60 outline-none transition-colors focus:border-western-green-deep resize-none" />
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
