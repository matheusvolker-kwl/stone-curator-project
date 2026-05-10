import { Link } from "react-router-dom";
import { MessageCircle, Instagram, Mail, Box, MapPin, Clock, ArrowUpRight, Phone } from "lucide-react";
import { BUSINESS } from "@/config/business";

const waUrl = `https://wa.me/${BUSINESS.whatsappFabrica}?text=${encodeURIComponent(
  "Olá Western! Gostaria de conversar com a fábrica."
)}`;

const canais = [
  {
    eyebrow: "WhatsApp comercial",
    titulo: BUSINESS.whatsappLabel,
    descricao: "Resposta em até 1h útil. Canal preferido para projetos.",
    icon: MessageCircle,
    href: waUrl,
    cta: "Abrir conversa",
    destaque: true,
  },
  {
    eyebrow: "E-mail",
    titulo: BUSINESS.emailComercial,
    descricao: "Para briefings, propostas e documentação técnica.",
    icon: Mail,
    href: `mailto:${BUSINESS.emailComercial}`,
    cta: "Enviar e-mail",
  },
  {
    eyebrow: "Instagram",
    titulo: "@westernpools",
    descricao: "Bastidores do ateliê, peças novas e projetos entregues.",
    icon: Instagram,
    href: "https://instagram.com/westernpools",
    cta: "Seguir no Instagram",
  },
  {
    eyebrow: "Modelos 3D",
    titulo: "SketchUp 3D Warehouse",
    descricao: "Biblioteca completa para inserir as peças no seu projeto.",
    icon: Box,
    href: BUSINESS.sketchupWarehouse,
    cta: "Abrir biblioteca",
  },
];

export default function Contact() {
  return (
    <div className="surface-ivory">
      {/* Hero */}
      <section className="container-western pt-20 md:pt-28 pb-12 md:pb-16 max-w-6xl">
        <div className="grid md:grid-cols-12 gap-10 md:gap-16 items-end">
          <div className="md:col-span-8">
            <p className="text-eyebrow mb-5">Contato</p>
            <div className="w-12 h-px bg-western-gold mb-8" />
            <h1 className="font-display text-4xl md:text-6xl lg:text-7xl text-western-green-deep leading-[1.02] tracking-tight">
              Para falar<br />com a fábrica.
            </h1>
          </div>
          <div className="md:col-span-4">
            <p className="text-western-stone-warm leading-relaxed text-base md:text-[17px] border-l border-western-gold/40 pl-5">
              Atendimento direto com quem desenha e fabrica.
              Sem call center, sem formulário labiríntico —
              uma equipe pequena, focada em projetos de arquitetura e paisagismo.
            </p>
          </div>
        </div>
      </section>

      {/* Canais */}
      <section className="container-western pb-20 md:pb-28 max-w-6xl">
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-px bg-western-stone-warm/15 border border-western-stone-warm/15">
          {canais.map((c) => {
            const Icon = c.icon;
            return (
              <li key={c.eyebrow} className="bg-western-paper">
                <a
                  href={c.href}
                  target={c.href.startsWith("http") ? "_blank" : undefined}
                  rel="noopener noreferrer"
                  className={`group relative block h-full p-8 md:p-10 transition-colors duration-500 ${
                    c.destaque
                      ? "bg-western-green-deep text-western-cream hover:bg-western-green-mid"
                      : "hover:bg-western-cream/60"
                  }`}
                >
                  <div className="flex items-start justify-between gap-6 mb-10">
                    <Icon
                      className={`h-6 w-6 ${
                        c.destaque ? "text-western-gold-soft" : "text-western-gold"
                      }`}
                      strokeWidth={1.4}
                    />
                    <ArrowUpRight
                      className={`h-5 w-5 transition-transform duration-500 group-hover:translate-x-1 group-hover:-translate-y-1 ${
                        c.destaque ? "text-western-cream-muted" : "text-western-stone-warm/60"
                      }`}
                      strokeWidth={1.4}
                    />
                  </div>

                  <p
                    className={`font-mono text-[10px] uppercase tracking-[0.28em] mb-3 ${
                      c.destaque ? "text-western-gold-soft" : "text-western-gold"
                    }`}
                  >
                    {c.eyebrow}
                  </p>
                  <p
                    className={`font-display text-2xl md:text-[28px] leading-tight mb-3 ${
                      c.destaque ? "text-western-cream" : "text-western-green-deep"
                    }`}
                  >
                    {c.titulo}
                  </p>
                  <p
                    className={`text-[14px] leading-relaxed max-w-sm ${
                      c.destaque ? "text-western-cream-muted" : "text-western-stone-warm"
                    }`}
                  >
                    {c.descricao}
                  </p>

                  <span
                    className={`mt-8 inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.24em] ${
                      c.destaque ? "text-western-cream" : "text-western-green-deep"
                    }`}
                  >
                    <span className="link-underline">{c.cta}</span>
                  </span>
                </a>
              </li>
            );
          })}
        </ul>
      </section>

      {/* Ateliê */}
      <section className="bg-western-green-deep text-western-cream">
        <div className="container-western py-20 md:py-28 max-w-6xl">
          <div className="grid md:grid-cols-12 gap-10 md:gap-16">
            <div className="md:col-span-5">
              <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-western-gold-soft mb-4">
                Conheça o ateliê
              </p>
              <div className="w-12 h-px bg-western-gold mb-7" />
              <h2 className="font-display text-3xl md:text-5xl leading-[1.05] mb-6">
                Onde cada peça nasce.
              </h2>
              <p className="text-western-cream-muted leading-relaxed text-[15px] md:text-base mb-10 max-w-md">
                Estamos em {BUSINESS.cidadeAtelie}/{BUSINESS.ufAtelie}, na Grande São Paulo.
                Receba arquitetos, paisagistas e clientes finais para conhecer os acabamentos
                ao vivo e ver as peças em produção.
              </p>
              <Link
                to="/visitar"
                className="inline-flex items-center gap-2 h-12 px-7 bg-western-gold text-western-green-deep hover:bg-western-gold-soft font-mono text-[11px] uppercase tracking-[0.24em] transition-colors"
              >
                Agendar visita <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="md:col-span-7 md:border-l md:border-western-gold/20 md:pl-16">
              <dl className="grid sm:grid-cols-2 gap-x-10 gap-y-10">
                <InfoBlock icon={MapPin} label="Endereço">
                  {BUSINESS.enderecoAtelieRua}<br />
                  {BUSINESS.cidadeAtelie}/{BUSINESS.ufAtelie} · {BUSINESS.enderecoAtelieCep}
                </InfoBlock>
                <InfoBlock icon={Clock} label="Horário">
                  {BUSINESS.horarioAtelie}<br />
                  Visitas mediante agendamento.
                </InfoBlock>
                <InfoBlock icon={Phone} label="Telefone do ateliê">
                  <a href={`tel:+${BUSINESS.whatsappFabrica}`} className="hover:text-western-gold-soft transition-colors">
                    {BUSINESS.whatsappLabel}
                  </a>
                </InfoBlock>
                <InfoBlock icon={Mail} label="Suporte / pós-venda">
                  <a href={`mailto:${BUSINESS.emailSuporte}`} className="hover:text-western-gold-soft transition-colors break-all">
                    {BUSINESS.emailSuporte}
                  </a>
                </InfoBlock>
              </dl>

              <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-western-cream-muted/70 mt-14 pt-8 border-t border-western-gold/15">
                Fundada em {BUSINESS.fundadaEm} · {BUSINESS.anosOperacao}+ anos de coautoria com arquitetos
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function InfoBlock({
  icon: Icon,
  label,
  children,
}: {
  icon: React.ElementType;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center gap-3 mb-3">
        <Icon className="h-4 w-4 text-western-gold" strokeWidth={1.4} />
        <dt className="font-mono text-[10px] uppercase tracking-[0.24em] text-western-gold-soft">
          {label}
        </dt>
      </div>
      <dd className="text-western-cream leading-relaxed text-[15px]">{children}</dd>
    </div>
  );
}
