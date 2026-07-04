import { useRef, useState } from "react";
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
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Imagens reais reaproveitadas do projeto (webp otimizadas)
import heroImg from "@/assets/projetos-western/03_piscina-cascata.webp.asset.json";
import serraImg from "@/assets/projetos-western/06_piscina-cascata-serra.webp.asset.json";

const WHATSAPP_MSG_DEFAULT =
  "Olá, Western! Quero agendar a consultoria gratuita para o meu projeto.";

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
  },
  {
    n: "2",
    titulo: "Consultoria inicial gratuita",
    desc: "Nosso time entende o projeto e a compatibilidade com nossos produtos e serviços. Sem custo, sem compromisso.",
  },
  {
    n: "3",
    titulo: "Visita ao local (se necessário)",
    desc: "Contratados os serviços, agendamos visita técnica para leitura precisa do terreno e das condições da obra.",
  },
  {
    n: "4",
    titulo: "Projeto e render 3D",
    desc: "Montamos a composição, apresentamos o render fotorrealista e ajustamos até a aprovação final.",
  },
  {
    n: "5",
    titulo: "Execução e instalação",
    desc: "Nossa equipe executa e entrega — do transporte à peça posicionada, integrada ao paisagismo.",
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

function maskPhone(v: string): string {
  const d = v.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 2) return d;
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

export default function ContrateAWestern() {
  const formRef = useRef<HTMLDivElement>(null);
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [perfil, setPerfil] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [enviando, setEnviando] = useState(false);

  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const buildWhatsMsg = () => {
    const perfilLabel = PERFIS.find((p) => p.value === perfil)?.label;
    return [
      "Olá, Western! Vim pelo site e quero agendar a consultoria inicial gratuita.",
      "",
      `Nome: ${nome || "—"}`,
      `WhatsApp: ${telefone || "—"}`,
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

    if (!nome.trim() || telefone.replace(/\D/g, "").length < 10) {
      toast.error("Preencha nome e WhatsApp (mínimo 10 dígitos).");
      return;
    }

    setEnviando(true);

    // 1) grava lead — não bloqueia o fluxo se falhar
    try {
      const { error } = await supabase.from("leads").insert({
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
      });
      if (error) throw error;
    } catch (err) {
      console.warn("[contrate-a-western] falha ao gravar lead:", err);
      // silencioso — não bloqueia o WhatsApp
    }

    // 2) abre WhatsApp com mensagem pronta
    window.open(waLink(buildWhatsMsg()), "_blank", "noopener,noreferrer");
    toast.success("Abrimos o WhatsApp com sua mensagem pronta.");
    setEnviando(false);
  };

  return (
    <>
      <Seo
        title="Contrate a Western — Consultoria, Projeto 3D e Instalação"
        description="Do projeto à obra, a Western executa com você. Consultoria gratuita, render 3D e instalação por quem fabrica a pedra. Cascatas, piscinas e paisagens em todo o Brasil."
        path="/contrate-a-western"
      />

      {/* 1) HERO CINEMATOGRÁFICO */}
      <section className="relative isolate overflow-hidden min-h-[80vh] flex items-center">
        <img
          src={heroImg.url}
          alt="Piscina com cascata Western em projeto residencial"
          width={1600}
          height={1000}
          loading="eager"
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-western-green-deep/85 via-western-green-deep/70 to-western-green-deep/90" />
        <div className="absolute inset-0 bg-black/25" />

        <div className="relative container-western py-24 md:py-36 text-center max-w-3xl mx-auto">
          <Reveal variant="fade-up" duration={700}>
            <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-western-gold-soft/90 mb-5">
              Serviços Western
            </p>
            <div className="w-10 h-px bg-western-gold/70 mx-auto mb-7" />
            <h1 className="font-display text-4xl md:text-6xl lg:text-7xl text-western-cream leading-[1.02]">
              Do projeto à obra,<br className="hidden md:block" />{" "}
              <span className="text-western-gold-soft">a Western executa com você.</span>
            </h1>
            <p className="mt-7 text-western-cream-muted text-lg md:text-xl leading-relaxed max-w-2xl mx-auto">
              Consultoria, projeto, render 3D e instalação com quem fabrica a pedra.
              Viabilizamos cascatas, piscinas e paisagens que a pedra natural não permite
              — mais leves, mais rápidas, com menos impacto.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={scrollToForm}
                className="inline-flex items-center gap-2 px-7 py-4 bg-western-gold text-western-green-deep font-mono text-xs uppercase tracking-[0.24em] font-semibold hover:bg-western-gold-soft transition-colors shadow-lg shadow-black/20"
              >
                <ArrowDown className="h-4 w-4" /> Agendar consultoria gratuita
              </button>
              <a
                href={waLink(WHATSAPP_MSG_DEFAULT)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-7 py-4 border border-western-cream/30 text-western-cream font-mono text-xs uppercase tracking-[0.24em] hover:border-western-gold-soft hover:text-western-gold-soft transition-colors backdrop-blur-sm"
              >
                <MessageCircle className="h-4 w-4" /> Falar no WhatsApp
              </a>
            </div>

            <p className="mt-12 text-[11px] md:text-xs font-mono uppercase tracking-[0.22em] text-western-cream/70">
              Especificada nas obras de Neymar Jr. · Alex Hanazaki · Rosewood · Unique Garden
            </p>
          </Reveal>
        </div>
      </section>

      {/* 2) POR QUE A WESTERN */}
      <section className="bg-western-ivory py-20 md:py-28">
        <div className="container-western max-w-6xl">
          <div className="grid md:grid-cols-12 gap-10 md:gap-14 items-start">
            <Reveal variant="fade-up" duration={700} className="md:col-span-5">
              <div>
                <p className="text-eyebrow">Por que a Western</p>
                <div className="w-12 h-px bg-western-gold my-5" />
                <h2 className="font-display text-3xl md:text-4xl text-western-green-deep leading-[1.15]">
                  Um único parceiro que já resolveu o que ninguém tinha resolvido.
                </h2>
                <p className="mt-5 text-western-stone-warm leading-relaxed">
                  A Western é a fábrica e a executora. Isso significa custo, prazo,
                  técnica e responsabilidade concentrados em um só time —
                  do render 3D à peça posicionada em obra.
                </p>
                <div className="mt-8 aspect-[4/3] overflow-hidden">
                  <img
                    src={serraImg.url}
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
                  <div className="h-full bg-western-cream border border-western-stone-warm/15 p-6 md:p-7 hover:border-western-gold/40 transition-colors">
                    <span className="inline-flex h-11 w-11 items-center justify-center border border-western-gold/40 text-western-gold mb-5">
                      <d.icon className="h-5 w-5" />
                    </span>
                    <h3 className="font-display text-lg text-western-green-deep mb-2.5 leading-tight">
                      {d.titulo}
                    </h3>
                    <p className="text-sm text-western-stone-warm leading-relaxed">
                      {d.desc}
                    </p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 3) SERVIÇOS */}
      <section className="bg-western-cream-muted py-20 md:py-28 border-y border-western-stone-warm/15">
        <div className="container-western max-w-6xl">
          <Reveal variant="fade-up" duration={700}>
            <header className="text-center max-w-2xl mx-auto mb-14">
              <p className="text-eyebrow">O que fazemos por você</p>
              <div className="w-12 h-px bg-western-gold mx-auto my-5" />
              <h2 className="font-display text-3xl md:text-4xl text-western-green-deep">
                Um único parceiro do conceito à entrega
              </h2>
            </header>
          </Reveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6">
            {SERVICOS.map((s, i) => (
              <Reveal key={s.titulo} variant="fade-up" delay={i * 80} duration={650}>
                <div className="h-full bg-western-cream border border-western-stone-warm/15 hover:border-western-gold/40 transition-colors p-7 md:p-8 flex flex-col">
                  <span className="inline-flex h-12 w-12 items-center justify-center border border-western-gold/40 text-western-gold mb-6">
                    <s.icon className="h-5 w-5" />
                  </span>
                  <h3 className="font-display text-xl text-western-green-deep mb-3 leading-tight">
                    {s.titulo}
                  </h3>
                  <p className="text-sm text-western-stone-warm leading-relaxed">
                    {s.desc}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* 4) COMO FUNCIONA */}
      <section className="bg-western-ivory py-20 md:py-28">
        <div className="container-western max-w-6xl">
          <Reveal variant="fade-up" duration={700}>
            <header className="text-center max-w-2xl mx-auto mb-14">
              <p className="text-eyebrow">Como funciona</p>
              <div className="w-12 h-px bg-western-gold mx-auto my-5" />
              <h2 className="font-display text-3xl md:text-4xl text-western-green-deep">
                Cinco passos até a sua obra pronta
              </h2>
              <p className="mt-5 text-western-stone-warm leading-relaxed max-w-xl mx-auto">
                Os dois primeiros passos são{" "}
                <span className="text-western-green-deep font-medium">rápidos, gratuitos e sem compromisso</span>. Você só decide seguir depois de conhecer.
              </p>
            </header>
          </Reveal>

          <ol className="grid grid-cols-1 md:grid-cols-5 gap-4 md:gap-5">
            {PASSOS.map((p, i) => (
              <Reveal key={p.n} variant="fade-up" delay={i * 70} duration={650}>
                <li
                  className={`relative bg-western-cream border p-6 h-full ${
                    i < 2
                      ? "border-western-gold/40 shadow-sm"
                      : "border-western-stone-warm/15"
                  }`}
                >
                  {i < 2 && (
                    <span className="absolute -top-2 left-6 bg-western-gold text-western-green-deep font-mono text-[9px] uppercase tracking-[0.2em] font-semibold px-2 py-0.5">
                      Grátis
                    </span>
                  )}
                  <span className="font-display text-4xl text-western-gold leading-none block mb-3">
                    {p.n}
                  </span>
                  <h3 className="font-display text-lg text-western-green-deep mb-2 leading-tight">
                    {p.titulo}
                  </h3>
                  <p className="text-sm text-western-stone-warm leading-relaxed">
                    {p.desc}
                  </p>
                </li>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {/* 5) PROVA SOCIAL — rostos + mural de logos */}
      <section className="surface-ivory py-16 md:py-24 border-t border-western-stone-warm/10">
        <div className="container-western max-w-5xl">
          <Reveal variant="fade-up" duration={750}>
            <SocialProof
              eyebrow="Quem confia na Western"
              titulo={<>Especificada por quem define o paisagismo brasileiro.</>}
              groups={["celebridades", "profissionais", "marcas"]}
            />
          </Reveal>
        </div>
      </section>

      {/* 6) FAQ */}
      <section className="bg-western-cream-muted py-20 md:py-28 border-b border-western-stone-warm/15">
        <div className="container-western max-w-3xl">
          <Reveal variant="fade-up" duration={700}>
            <header className="text-center mb-12">
              <p className="text-eyebrow">Perguntas frequentes</p>
              <div className="w-12 h-px bg-western-gold mx-auto my-5" />
              <h2 className="font-display text-3xl md:text-4xl text-western-green-deep">
                Tirando as dúvidas antes da consultoria
              </h2>
            </header>
          </Reveal>

          <Reveal variant="fade-up" delay={80} duration={700}>
            <Accordion
              type="single"
              collapsible
              className="bg-western-cream border border-western-stone-warm/15"
            >
              {FAQ_ITEMS.map((item, i) => (
                <AccordionItem
                  key={item.q}
                  value={`item-${i}`}
                  className="border-b border-western-stone-warm/15 last:border-b-0 px-5 md:px-7"
                >
                  <AccordionTrigger className="text-left font-display text-base md:text-lg text-western-green-deep hover:no-underline py-5">
                    {item.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-western-stone-warm text-[15px] leading-relaxed pb-5">
                    {item.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </Reveal>
        </div>
      </section>

      {/* 7) FORMULÁRIO / OFERTA */}
      <section
        ref={formRef}
        id="contato"
        className="surface-forest border-t border-western-gold/15"
      >
        <div className="container-western max-w-5xl py-20 md:py-28">
          <div className="grid md:grid-cols-12 gap-10 md:gap-14 items-start">
            <Reveal variant="fade-up" duration={700} className="md:col-span-5">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-western-gold-soft/90 mb-5">
                  Consultoria inicial gratuita
                </p>
                <div className="w-10 h-px bg-western-gold/70 mb-7" />
                <h2 className="font-display text-3xl md:text-4xl text-western-cream leading-[1.1]">
                  Comece com uma conversa{" "}
                  <span className="text-western-gold-soft">grátis e sem compromisso.</span>
                </h2>
                <p className="mt-5 text-western-cream-muted leading-relaxed">
                  Preencha o essencial — <strong className="text-western-cream">só nome e WhatsApp</strong> são obrigatórios.
                  Ao enviar, gravamos seu contato e abrimos o WhatsApp com sua mensagem pronta.
                </p>
                <ul className="mt-8 space-y-3 text-western-cream-muted text-sm">
                  {[
                    "Diagnóstico técnico do seu projeto",
                    "Compatibilidade com pedras e cascatas Western",
                    "Estimativa de escopo, prazo e viabilidade",
                  ].map((b) => (
                    <li key={b} className="flex gap-3">
                      <span className="mt-1.5 h-1.5 w-1.5 bg-western-gold shrink-0" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>

            <Reveal variant="fade-up" delay={100} duration={700} className="md:col-span-7">
              <form
                onSubmit={handleSubmit}
                className="bg-western-cream border border-western-gold/20 p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-5"
                noValidate
              >
                <label className="block md:col-span-1">
                  <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-western-stone-warm">
                    Nome <span className="text-western-gold">*</span>
                  </span>
                  <input
                    required
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    autoComplete="name"
                    className="mt-1.5 w-full px-3 py-2.5 bg-white border border-western-stone-warm/25 focus:border-western-gold focus:ring-2 focus:ring-western-gold/20 outline-none text-western-green-deep transition-all"
                  />
                </label>
                <label className="block md:col-span-1">
                  <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-western-stone-warm">
                    WhatsApp <span className="text-western-gold">*</span>
                  </span>
                  <input
                    required
                    type="tel"
                    inputMode="tel"
                    value={telefone}
                    onChange={(e) => setTelefone(maskPhone(e.target.value))}
                    autoComplete="tel"
                    placeholder="(11) 90000-0000"
                    className="mt-1.5 w-full px-3 py-2.5 bg-white border border-western-stone-warm/25 focus:border-western-gold focus:ring-2 focus:ring-western-gold/20 outline-none text-western-green-deep transition-all tabular-nums"
                  />
                </label>
                <label className="block md:col-span-1">
                  <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-western-stone-warm">
                    E-mail <span className="text-western-stone-warm/50">(opcional)</span>
                  </span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    className="mt-1.5 w-full px-3 py-2.5 bg-white border border-western-stone-warm/25 focus:border-western-gold focus:ring-2 focus:ring-western-gold/20 outline-none text-western-green-deep transition-all"
                  />
                </label>
                <label className="block md:col-span-1">
                  <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-western-stone-warm">
                    Perfil <span className="text-western-stone-warm/50">(opcional)</span>
                  </span>
                  <select
                    value={perfil}
                    onChange={(e) => setPerfil(e.target.value)}
                    className="mt-1.5 w-full px-3 py-2.5 bg-white border border-western-stone-warm/25 focus:border-western-gold focus:ring-2 focus:ring-western-gold/20 outline-none text-western-green-deep transition-all"
                  >
                    {PERFIS.map((p) => (
                      <option key={p.value} value={p.value}>
                        {p.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block md:col-span-2">
                  <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-western-stone-warm">
                    Sobre o projeto <span className="text-western-stone-warm/50">(opcional)</span>
                  </span>
                  <textarea
                    rows={4}
                    value={mensagem}
                    onChange={(e) => setMensagem(e.target.value)}
                    placeholder="Local, escopo, prazo — o que quiser adiantar."
                    className="mt-1.5 w-full px-3 py-2.5 bg-white border border-western-stone-warm/25 focus:border-western-gold focus:ring-2 focus:ring-western-gold/20 outline-none text-western-green-deep resize-none transition-all"
                  />
                </label>

                <div className="md:col-span-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={enviando}
                    className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-western-green-deep text-western-cream font-mono text-xs uppercase tracking-[0.24em] font-semibold hover:bg-western-green-deep/90 transition-colors w-full sm:w-auto disabled:opacity-70"
                  >
                    {enviando ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" /> Enviando…
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" /> Agendar consultoria grátis
                      </>
                    )}
                  </button>
                  <span className="text-[11px] font-mono uppercase tracking-[0.18em] text-western-stone-warm/70">
                    Sem compromisso · Resposta rápida
                  </span>
                </div>
              </form>
            </Reveal>
          </div>
        </div>
      </section>
    </>
  );
}
