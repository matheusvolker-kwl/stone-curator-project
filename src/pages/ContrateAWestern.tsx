import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  MessageCircle,
  ArrowDown,
  Sparkles,
  PencilRuler,
  HardHat,
  LifeBuoy,
  Users,
  Home as HomeIcon,
  Send,
} from "lucide-react";
import Seo from "@/components/seo/Seo";
import Reveal from "@/components/shared/Reveal";
import ProjetosWesternBand from "@/components/shared/ProjetosWesternBand";
import { BUSINESS } from "@/config/business";

const WHATSAPP_MSG_DEFAULT =
  "Olá, Western! Quero levar a expertise Western para o meu projeto — gostaria de falar sobre consultoria, projeto/render ou instalação.";

const waLink = (msg: string) =>
  `https://wa.me/${BUSINESS.whatsappFabrica}?text=${encodeURIComponent(msg)}`;

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
  { n: "1", titulo: "Contato", desc: "Fale conosco por WhatsApp ou pelo formulário abaixo." },
  { n: "2", titulo: "Consultoria & diagnóstico", desc: "Entendemos o projeto, o local e o resultado desejado." },
  { n: "3", titulo: "Projeto & render", desc: "Você recebe a proposta com visualização 3D e escopo detalhado." },
  { n: "4", titulo: "Execução & instalação", desc: "A equipe Western executa e entrega chave-na-mão." },
];

const PERFIS = [
  { value: "arquiteto", label: "Arquiteto/Paisagista" },
  { value: "construtora", label: "Construtora" },
  { value: "parceiro", label: "Parceiro revendedor" },
  { value: "cliente-final", label: "Cliente final" },
];

export default function ContrateAWestern() {
  const formRef = useRef<HTMLDivElement>(null);
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [perfil, setPerfil] = useState("arquiteto");
  const [mensagem, setMensagem] = useState("");

  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const perfilLabel = PERFIS.find((p) => p.value === perfil)?.label ?? perfil;
    const msg = [
      "Olá, Western! Quero contratar os serviços da Western.",
      "",
      `Nome: ${nome || "—"}`,
      `E-mail: ${email || "—"}`,
      `Telefone/WhatsApp: ${telefone || "—"}`,
      `Perfil: ${perfilLabel}`,
      "",
      "Mensagem:",
      mensagem || "—",
    ].join("\n");
    window.open(waLink(msg), "_blank", "noopener,noreferrer");
  };

  return (
    <>
      <Seo
        title="Contrate a Western — Consultoria, Projeto, Render e Instalação"
        description="Leve a expertise Western para o seu projeto: consultoria técnica, projeto 3D com render, instalação pela nossa equipe e acompanhamento do conceito à entrega."
        path="/contrate-a-western"
      />

      {/* HERO */}
      <section className="surface-forest border-b border-western-gold/15">
        <div className="container-western py-20 md:py-28 text-center max-w-3xl mx-auto">
          <Reveal variant="fade-up" duration={700}>
            <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-western-gold-soft/85 mb-5">
              Serviços Western
            </p>
            <div className="w-10 h-px bg-western-gold/60 mx-auto mb-7" />
            <h1 className="font-display text-4xl md:text-6xl text-western-cream leading-[1.05]">
              Leve a Western para o seu projeto.
            </h1>
            <p className="mt-6 text-western-cream-muted text-lg md:text-xl leading-relaxed max-w-2xl mx-auto">
              Do conceito à obra: consultoria, projeto, render e instalação com a expertise Western — para arquitetos, paisagistas, construtoras e para você que quer o resultado Western na sua casa.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
              <a
                href={waLink(WHATSAPP_MSG_DEFAULT)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3.5 bg-western-gold text-western-green-deep font-mono text-xs uppercase tracking-[0.24em] hover:bg-western-gold-soft transition-colors"
              >
                <MessageCircle className="h-4 w-4" /> Falar no WhatsApp
              </a>
              <button
                type="button"
                onClick={scrollToForm}
                className="inline-flex items-center gap-2 px-6 py-3.5 border border-western-cream/25 text-western-cream font-mono text-xs uppercase tracking-[0.24em] hover:border-western-gold-soft hover:text-western-gold-soft transition-colors"
              >
                <ArrowDown className="h-4 w-4" /> Solicitar contato
              </button>
            </div>
          </Reveal>
        </div>
      </section>

      {/* SERVIÇOS */}
      <section className="bg-western-ivory py-16 md:py-24">
        <div className="container-western max-w-6xl">
          <Reveal variant="fade-up" duration={700}>
            <header className="text-center max-w-2xl mx-auto mb-12 md:mb-16">
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
                <div className="h-full bg-western-cream border border-western-stone-warm/15 p-6 md:p-7 hover:border-western-gold/40 transition-colors">
                  <span className="inline-flex h-11 w-11 items-center justify-center border border-western-gold/40 text-western-gold mb-5">
                    <s.icon className="h-5 w-5" />
                  </span>
                  <h3 className="font-display text-xl text-western-green-deep mb-2.5">
                    {s.titulo}
                  </h3>
                  <p className="text-sm text-western-stone-warm leading-relaxed">{s.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* PARA QUEM */}
      <section className="bg-western-cream-muted py-16 md:py-24 border-y border-western-stone-warm/15">
        <div className="container-western max-w-5xl">
          <Reveal variant="fade-up" duration={700}>
            <header className="text-center max-w-2xl mx-auto mb-12">
              <p className="text-eyebrow">Para quem</p>
              <div className="w-12 h-px bg-western-gold mx-auto my-5" />
              <h2 className="font-display text-3xl md:text-4xl text-western-green-deep">
                Dois públicos, uma expertise
              </h2>
            </header>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
            <Reveal variant="fade-up" duration={700}>
              <div className="h-full bg-western-cream border border-western-stone-warm/20 p-7 md:p-9">
                <span className="inline-flex h-11 w-11 items-center justify-center border border-western-gold/40 text-western-gold mb-5">
                  <Users className="h-5 w-5" />
                </span>
                <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-western-gold mb-2">
                  Para profissionais
                </p>
                <h3 className="font-display text-2xl text-western-green-deep mb-3">
                  Arquitetos, paisagistas, construtoras e parceiros
                </h3>
                <p className="text-western-stone-warm leading-relaxed">
                  Ganhe tempo com especificação assertiva, apresente ao cliente um render fotorrealista e entregue a obra com uma equipe Western em campo — sem terceirizar risco.
                </p>
              </div>
            </Reveal>

            <Reveal variant="fade-up" delay={80} duration={700}>
              <div className="h-full bg-western-cream border border-western-stone-warm/20 p-7 md:p-9">
                <span className="inline-flex h-11 w-11 items-center justify-center border border-western-gold/40 text-western-gold mb-5">
                  <HomeIcon className="h-5 w-5" />
                </span>
                <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-western-gold mb-2">
                  Para você
                </p>
                <h3 className="font-display text-2xl text-western-green-deep mb-3">
                  Cliente final que quer o resultado Western em casa
                </h3>
                <p className="text-western-stone-warm leading-relaxed">
                  Cascatas, piscinas naturais, jardins e revestimentos executados pela própria Western — do estudo do local à instalação, com o mesmo cuidado que damos aos maiores projetos do país.
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* COMO FUNCIONA */}
      <section className="bg-western-ivory py-16 md:py-24">
        <div className="container-western max-w-5xl">
          <Reveal variant="fade-up" duration={700}>
            <header className="text-center max-w-2xl mx-auto mb-12 md:mb-16">
              <p className="text-eyebrow">Como funciona</p>
              <div className="w-12 h-px bg-western-gold mx-auto my-5" />
              <h2 className="font-display text-3xl md:text-4xl text-western-green-deep">
                Quatro passos até a sua obra pronta
              </h2>
            </header>
          </Reveal>

          <ol className="grid grid-cols-1 md:grid-cols-4 gap-5 md:gap-6">
            {PASSOS.map((p, i) => (
              <Reveal key={p.n} variant="fade-up" delay={i * 80} duration={650}>
                <li className="relative bg-western-cream border border-western-stone-warm/15 p-6 md:p-7 h-full">
                  <span className="font-display text-4xl text-western-gold leading-none block mb-3">
                    {p.n}
                  </span>
                  <h3 className="font-display text-lg text-western-green-deep mb-2">{p.titulo}</h3>
                  <p className="text-sm text-western-stone-warm leading-relaxed">{p.desc}</p>
                </li>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {/* PROVA SOCIAL — reaproveita casos */}
      <Reveal variant="fade-up" duration={700}>
        <ProjetosWesternBand />
      </Reveal>

      {/* FORMULÁRIO */}
      <section ref={formRef} id="contato" className="surface-forest py-16 md:py-24 border-t border-western-gold/15">
        <div className="container-western max-w-3xl">
          <Reveal variant="fade-up" duration={700}>
            <header className="text-center mb-10 md:mb-12">
              <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-western-gold-soft/85 mb-5">
                Entre em contato
              </p>
              <div className="w-10 h-px bg-western-gold/60 mx-auto mb-7" />
              <h2 className="font-display text-3xl md:text-4xl text-western-cream">
                Vamos falar sobre o seu projeto
              </h2>
              <p className="mt-4 text-western-cream-muted leading-relaxed">
                Preencha os dados abaixo — vamos abrir o WhatsApp com sua mensagem pronta para envio.
              </p>
            </header>
          </Reveal>

          <Reveal variant="fade-up" delay={100} duration={700}>
            <form
              onSubmit={handleSubmit}
              className="bg-western-cream border border-western-gold/20 p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-5"
            >
              <label className="block md:col-span-1">
                <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-western-stone-warm">Nome *</span>
                <input
                  required
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  className="mt-1.5 w-full px-3 py-2.5 bg-white border border-western-stone-warm/25 focus:border-western-gold outline-none text-western-green-deep"
                />
              </label>
              <label className="block md:col-span-1">
                <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-western-stone-warm">E-mail *</span>
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1.5 w-full px-3 py-2.5 bg-white border border-western-stone-warm/25 focus:border-western-gold outline-none text-western-green-deep"
                />
              </label>
              <label className="block md:col-span-1">
                <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-western-stone-warm">Telefone / WhatsApp *</span>
                <input
                  required
                  type="tel"
                  value={telefone}
                  onChange={(e) => setTelefone(e.target.value)}
                  placeholder="(11) 90000-0000"
                  className="mt-1.5 w-full px-3 py-2.5 bg-white border border-western-stone-warm/25 focus:border-western-gold outline-none text-western-green-deep"
                />
              </label>
              <label className="block md:col-span-1">
                <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-western-stone-warm">Perfil</span>
                <select
                  value={perfil}
                  onChange={(e) => setPerfil(e.target.value)}
                  className="mt-1.5 w-full px-3 py-2.5 bg-white border border-western-stone-warm/25 focus:border-western-gold outline-none text-western-green-deep"
                >
                  {PERFIS.map((p) => (
                    <option key={p.value} value={p.value}>{p.label}</option>
                  ))}
                </select>
              </label>
              <label className="block md:col-span-2">
                <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-western-stone-warm">Mensagem</span>
                <textarea
                  rows={5}
                  value={mensagem}
                  onChange={(e) => setMensagem(e.target.value)}
                  placeholder="Conte um pouco do seu projeto: local, escopo, prazo…"
                  className="mt-1.5 w-full px-3 py-2.5 bg-white border border-western-stone-warm/25 focus:border-western-gold outline-none text-western-green-deep resize-none"
                />
              </label>

              <div className="md:col-span-2 flex flex-col sm:flex-row items-center gap-3 pt-2">
                <button
                  type="submit"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-western-green-deep text-western-cream font-mono text-xs uppercase tracking-[0.24em] hover:bg-western-green-deep/90 transition-colors w-full sm:w-auto"
                >
                  <Send className="h-4 w-4" /> Enviar via WhatsApp
                </button>
                <a
                  href={waLink(WHATSAPP_MSG_DEFAULT)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-western-green-deep/25 text-western-green-deep font-mono text-xs uppercase tracking-[0.24em] hover:border-western-gold hover:text-western-gold transition-colors w-full sm:w-auto"
                >
                  <MessageCircle className="h-4 w-4" /> Falar no WhatsApp
                </a>
              </div>

              <p className="md:col-span-2 text-[11px] font-mono uppercase tracking-[0.18em] text-western-stone-warm/70">
                Ao enviar, você será direcionado ao WhatsApp com a mensagem pronta.
              </p>
            </form>
          </Reveal>

          <p className="text-center mt-10 text-western-cream-muted">
            Prefere conhecer a marca antes?{" "}
            <Link to="/sobre" className="text-western-gold-soft hover:text-western-gold underline underline-offset-4">
              Saiba mais sobre a Western
            </Link>
            .
          </p>
        </div>
      </section>
    </>
  );
}
