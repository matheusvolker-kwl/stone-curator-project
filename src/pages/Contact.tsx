import { Link } from "react-router-dom";
import { useRef, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { z } from "zod";
import {
  MessageCircle,
  Instagram,
  Mail,
  Box,
  MapPin,
  Clock,
  ArrowUpRight,
  Phone,
  CheckCircle2,
  Loader2,
  ShieldCheck,
} from "lucide-react";
import { BUSINESS } from "@/config/business";
import Seo from "@/components/seo/Seo";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import PhoneInput from "@/components/forms/PhoneInput";
import EmailInput from "@/components/forms/EmailInput";
import FieldLabel from "@/components/forms/FieldLabel";
import {
  emailSchema,
  phoneBRSchema,
  normalizeText,
  focusFirstInvalid,
} from "@/lib/forms/br";
import { submitContactLead } from "@/lib/leads";
import InvisibleTurnstile, { type InvisibleTurnstileHandle } from "@/components/security/InvisibleTurnstile";

const waUrl = `https://wa.me/${BUSINESS.whatsappFabrica}?text=${encodeURIComponent(
  "Olá Western! Gostaria de conversar com a fábrica."
)}`;

const waUrlAfter = `https://wa.me/${BUSINESS.whatsappFabrica}?text=${encodeURIComponent(
  "Olá Western! Acabei de enviar uma mensagem pelo formulário do site."
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

// email OU telefone obrigatório — RLS exige ao menos um.
const contactSchema = z
  .object({
    nome: z.string().transform(normalizeText).pipe(z.string().min(2, "Informe seu nome").max(120)),
    email: z.union([z.literal(""), emailSchema]).optional(),
    telefone: z.union([z.literal(""), phoneBRSchema]).optional(),
    cidade: z.string().transform(normalizeText).pipe(z.string().max(80)).optional(),
    mensagem: z.string().transform(normalizeText).pipe(z.string().min(4, "Escreva sua mensagem").max(1000)),
    assunto: z.string().max(120).optional(),
  })
  .refine((v) => (v.email && v.email.length > 0) || (v.telefone && v.telefone.length > 0), {
    message: "Informe e-mail ou telefone",
    path: ["email"],
  });

type ContactForm = {
  nome: string;
  email: string;
  telefone: string;
  cidade: string;
  mensagem: string;
  assunto: string;
};

const INITIAL: ContactForm = {
  nome: "",
  email: "",
  telefone: "",
  cidade: "",
  mensagem: "",
  assunto: "",
};

export default function Contact() {
  const [f, setF] = useState<ContactForm>(INITIAL);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [f, setF] = useState<ContactForm>(INITIAL);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [honeypot, setHoneypot] = useState("");
  const formRef = useRef<HTMLFormElement>(null);
  const captchaRef = useRef<InvisibleTurnstileHandle>(null);


  const setField = <K extends keyof ContactForm>(k: K, v: ContactForm[K]) =>
    setF((p) => ({ ...p, [k]: v }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const parsed = contactSchema.safeParse(f);
    if (!parsed.success) {
      const errs: Record<string, string> = {};
      parsed.error.issues.forEach((i) => {
        const k = (i.path[0] as string) ?? "form";
        if (!errs[k]) errs[k] = i.message;
      });
      setErrors(errs);
      toast.error("Confira os campos destacados.");
      focusFirstInvalid(formRef.current, errs);
      return;
    }
    setErrors({});
    if (!captchaToken) {
      toast.error("Confirme que você não é um robô.");
      return;
    }
    setLoading(true);
    const res = await submitContactLead({
      nome: parsed.data.nome,
      email: parsed.data.email ?? "",
      telefone: parsed.data.telefone ?? "",
      cidade: parsed.data.cidade || undefined,
      mensagem: parsed.data.mensagem,
      origem: "site/contato",
      payload: parsed.data.assunto ? { assunto: parsed.data.assunto } : {},
    }, captchaToken);
    setLoading(false);
    setCaptchaToken(null);
    if (!res.ok) {
      toast.error("Não foi possível enviar sua mensagem.", { description: res.error });
      return;
    }
    setSuccess(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="surface-ivory">
      <Seo
        title="Contato — Western"
        description="Fale direto com o ateliê Western. WhatsApp, e-mail comercial ou envie uma mensagem pelo formulário — atendimento por quem desenha e fabrica."
        path="/contato"
      />

      {/* Hero */}
      <section className="container-western pt-20 md:pt-28 pb-12 md:pb-16 max-w-6xl">
        <div className="grid md:grid-cols-12 gap-10 md:gap-16 items-end">
          <div className="md:col-span-8">
            <p className="text-eyebrow mb-5">Contato</p>
            <div className="w-12 h-px bg-western-gold mb-8" />
            <h1 className="font-display text-4xl md:text-6xl lg:text-7xl text-western-green-deep leading-[1.02] tracking-tight">
              Fale com a Western.
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

      {/* Canais + Formulário */}
      <section className="container-western pb-20 md:pb-28 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.05fr] gap-10 lg:gap-14 items-start">
          {/* Canais rápidos */}
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-western-stone-warm/15 border border-western-stone-warm/15">
            {canais.map((c) => {
              const Icon = c.icon;
              return (
                <li key={c.eyebrow} className="bg-western-paper">
                  <a
                    href={c.href}
                    target={c.href.startsWith("http") ? "_blank" : undefined}
                    rel="noopener noreferrer"
                    className={`group relative block h-full p-7 md:p-8 transition-colors duration-500 ${
                      c.destaque
                        ? "bg-western-green-deep text-western-cream hover:bg-western-green-mid"
                        : "hover:bg-western-cream/60"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4 mb-8">
                      <Icon
                        className={`h-5 w-5 ${
                          c.destaque ? "text-western-gold-soft" : "text-western-gold"
                        }`}
                        strokeWidth={1.4}
                      />
                      <ArrowUpRight
                        className={`h-4 w-4 transition-transform duration-500 group-hover:translate-x-1 group-hover:-translate-y-1 ${
                          c.destaque ? "text-western-cream-muted" : "text-western-stone-warm/60"
                        }`}
                        strokeWidth={1.4}
                      />
                    </div>

                    <p
                      className={`font-mono text-[10px] uppercase tracking-[0.28em] mb-2 ${
                        c.destaque ? "text-western-gold-soft" : "text-western-gold"
                      }`}
                    >
                      {c.eyebrow}
                    </p>
                    <p
                      className={`font-display text-lg md:text-xl leading-tight mb-2 ${
                        c.destaque ? "text-western-cream" : "text-western-green-deep"
                      }`}
                    >
                      {c.titulo}
                    </p>
                    <p
                      className={`text-[13px] leading-relaxed ${
                        c.destaque ? "text-western-cream-muted" : "text-western-stone-warm"
                      }`}
                    >
                      {c.descricao}
                    </p>

                    <span
                      className={`mt-6 inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.24em] ${
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

          {/* Formulário */}
          <div className="lg:sticky lg:top-24">
            {success ? (
              <div className="bg-western-cream border border-western-gold/30 rounded-[2px] p-8 md:p-10 shadow-[0_10px_40px_-20px_rgba(0,0,0,0.25)]">
                <div className="w-12 h-12 rounded-full bg-western-gold/15 flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-western-gold" aria-hidden="true" />
                </div>
                <h2 className="mt-6 font-display text-2xl md:text-3xl text-western-green-deep leading-tight">
                  Recebemos sua mensagem.
                </h2>
                <p className="mt-4 text-base leading-relaxed text-western-stone-warm">
                  Nosso time responde em até 1 dia útil. Se preferir agilizar, chame no WhatsApp.
                </p>
                <div className="mt-8 flex flex-col sm:flex-row gap-3">
                  <a
                    href={waUrlAfter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 h-12 px-6 border border-western-green-deep text-western-green-deep font-mono text-[11px] uppercase tracking-[0.22em] hover:bg-western-green-deep hover:text-western-cream transition-colors"
                  >
                    <MessageCircle className="w-4 h-4" aria-hidden="true" />
                    Falar agora no WhatsApp
                  </a>
                  <Link
                    to="/linhas"
                    className="inline-flex items-center justify-center h-12 px-6 font-mono text-[11px] uppercase tracking-[0.22em] text-western-stone-warm hover:text-western-green-deep transition-colors"
                  >
                    Ver o catálogo
                  </Link>
                </div>
              </div>
            ) : (
              <form
                ref={formRef}
                onSubmit={handleSubmit}
                noValidate
                className="bg-western-cream border border-western-stone-warm/20 rounded-[2px] p-7 md:p-9 shadow-[0_10px_40px_-20px_rgba(0,0,0,0.2)]"
              >
                <p className="font-mono text-[10px] font-medium uppercase tracking-[0.24em] text-western-gold">
                  Enviar mensagem
                </p>
                <h2 className="mt-3 font-display text-2xl md:text-[28px] leading-tight text-western-green-deep">
                  Escreva pra gente
                </h2>
                <p className="mt-2 text-sm text-western-stone-warm">
                  Retorno em até 1 dia útil. Preencha e-mail ou telefone — o que preferir.
                </p>

                <div className="mt-7 space-y-5">
                  <div>
                    <FieldLabel htmlFor="nome">Nome</FieldLabel>
                    <Input
                      id="nome"
                      name="nome"
                      value={f.nome}
                      onChange={(e) => setField("nome", e.target.value)}
                      maxLength={120}
                      autoComplete="name"
                      aria-invalid={!!errors.nome}
                      className="h-12 rounded-none bg-transparent"
                    />
                    {errors.nome && (
                      <p className="mt-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-red-700/80">
                        {errors.nome}
                      </p>
                    )}
                  </div>

                  <div>
                    <FieldLabel htmlFor="email">E-mail</FieldLabel>
                    <EmailInput
                      id="email"
                      name="email"
                      value={f.email}
                      onChange={(v) => setField("email", v)}
                      error={errors.email}
                    />
                  </div>

                  <div>
                    <FieldLabel htmlFor="telefone">WhatsApp / Telefone</FieldLabel>
                    <PhoneInput
                      id="telefone"
                      name="telefone"
                      value={f.telefone}
                      onChange={(v) => setField("telefone", v)}
                      error={errors.telefone}
                    />
                  </div>

                  <div>
                    <FieldLabel htmlFor="cidade" optional>
                      Cidade
                    </FieldLabel>
                    <Input
                      id="cidade"
                      name="cidade"
                      value={f.cidade}
                      onChange={(e) => setField("cidade", e.target.value)}
                      maxLength={80}
                      autoComplete="address-level2"
                      className="h-12 rounded-none bg-transparent"
                    />
                  </div>

                  <div>
                    <FieldLabel htmlFor="assunto" optional>
                      Assunto
                    </FieldLabel>
                    <Input
                      id="assunto"
                      name="assunto"
                      value={f.assunto}
                      onChange={(e) => setField("assunto", e.target.value)}
                      maxLength={120}
                      placeholder="Ex.: proposta técnica, visita, imprensa…"
                      className="h-12 rounded-none bg-transparent"
                    />
                  </div>

                  <div>
                    <FieldLabel htmlFor="mensagem">Mensagem</FieldLabel>
                    <Textarea
                      id="mensagem"
                      name="mensagem"
                      value={f.mensagem}
                      onChange={(e) => setField("mensagem", e.target.value)}
                      maxLength={1000}
                      rows={4}
                      aria-invalid={!!errors.mensagem}
                      placeholder="Conte brevemente como podemos ajudar."
                      className="rounded-none bg-transparent border-western-stone-warm/30 focus-visible:ring-0 focus-visible:border-western-gold text-western-green-deep placeholder:text-western-stone-warm/50"
                    />
                    {errors.mensagem && (
                      <p className="mt-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-red-700/80">
                        {errors.mensagem}
                      </p>
                    )}
                  </div>
                </div>

                <TurnstileWidget
                  onToken={setCaptchaToken}
                  onExpire={() => setCaptchaToken(null)}
                  className="mt-6"
                />

                <Button
                  type="submit"
                  disabled={loading}
                  className="mt-7 h-14 w-full rounded-none bg-western-gold hover:bg-western-gold/90 text-western-green-deep font-mono text-[12px] uppercase tracking-[0.24em]"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Enviando…
                    </>
                  ) : (
                    "Enviar mensagem"
                  )}
                </Button>

                <p className="mt-4 flex items-start gap-2 font-mono text-[10px] leading-relaxed uppercase tracking-[0.16em] text-western-stone-warm/70">
                  <ShieldCheck className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" aria-hidden="true" />
                  <span>
                    Ao enviar, você concorda em receber contato da Western. Seus dados ficam
                    seguros e nunca são usados para spam.
                  </span>
                </p>
              </form>
            )}
          </div>
        </div>
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
