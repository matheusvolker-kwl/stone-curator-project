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
import PhoneInput from "@/components/forms/PhoneInput";
import EmailInput from "@/components/forms/EmailInput";
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

// Canais secundários — o WhatsApp tem cartão próprio (destaque) acima da lista.
const canais = [
  {
    eyebrow: "E-mail",
    titulo: BUSINESS.emailComercial,
    descricao: "Para briefings, propostas e documentação técnica.",
    icon: Mail,
    href: `mailto:${BUSINESS.emailComercial}`,
    cta: "Enviar e-mail",
    internal: false,
  },
  {
    eyebrow: "Instagram",
    titulo: "@westernpools",
    descricao: "Bastidores do ateliê, peças novas e projetos entregues.",
    icon: Instagram,
    href: "https://instagram.com/westernpools",
    cta: "Seguir no Instagram",
    internal: false,
  },
  {
    eyebrow: "Modelos 3D",
    titulo: "SketchUp 3D Warehouse",
    descricao: "Biblioteca completa para inserir as peças no seu projeto.",
    icon: Box,
    href: BUSINESS.sketchupWarehouse,
    cta: "Abrir biblioteca",
    internal: false,
  },
  {
    eyebrow: "Ateliê",
    titulo: "Visite o ateliê",
    descricao: `${BUSINESS.cidadeAtelie}/${BUSINESS.ufAtelie} · Seg–Sex 9h–17h · Retirada até 16h`,
    icon: MapPin,
    href: "/visitar",
    cta: "Agendar visita",
    internal: true,
  },
];

/* Pele V3 dos campos. EmailInput e PhoneInput são compartilhados (não são deste
 * arquivo), então normalizamos aqui: 52px de altura, cantos 10px, tipo 16px,
 * borda visível e mensagens em sans 14px — nunca mono, nunca abaixo de 14px. */
const CONTROL =
  "h-[52px] rounded-[10px] border-[1.5px] border-western-border-strong bg-western-paper px-4 text-[16px] md:text-[16px] text-western-green-deep placeholder:text-western-stone-warm/60 focus:border-western-green-deep";
const CONTROL_ERR = "border-[1.5px] border-[#B3372E]";

const EMAIL_FX =
  "[&_input]:!h-[52px] [&_input]:!rounded-[10px] [&_input]:!border-[1.5px] [&_input]:!bg-western-paper [&_input]:!px-4 [&_input]:!text-[16px] [&_p]:!font-sans [&_p]:!text-[14px] [&_p]:!normal-case [&_p]:!tracking-normal [&_p]:!text-[#B3372E] [&_button]:!font-sans [&_button]:!text-[14px] [&_button]:!normal-case [&_button]:!tracking-normal";
const PHONE_FX =
  "[&_input]:!px-4 [&_input]:!text-[16px] [&_span]:!font-sans [&_span]:!text-[16px] [&_p]:!font-sans [&_p]:!text-[14px] [&_p]:!normal-case [&_p]:!tracking-normal [&_p]:!text-[#B3372E]";

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
    setLoading(true);
    // Fire-and-forget captcha: never block on it. Race against a short delay so
    // slow/blocked Turnstile scripts can't hang the form. Honeypot + server
    // validation are the real spam gates.
    const tokenPromise = captchaRef.current?.getToken(700).catch(() => null) ?? Promise.resolve(null);
    const token = await Promise.race<string | null>([
      tokenPromise,
      new Promise<null>((resolve) => window.setTimeout(() => resolve(null), 800)),
    ]).catch(() => null);
    try {
      const res = await submitContactLead({
        nome: parsed.data.nome,
        email: parsed.data.email ?? "",
        telefone: parsed.data.telefone ?? "",
        cidade: parsed.data.cidade || undefined,
        mensagem: parsed.data.mensagem,
        origem: "site/contato",
        payload: parsed.data.assunto ? { assunto: parsed.data.assunto } : {},
      }, token, { honeypot });
      if (!res.ok) {
        toast.error("Não foi possível enviar sua mensagem.", { description: res.error });
        return;
      }
      setSuccess(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      console.error("contact submit failed", err);
      toast.error("Não foi possível enviar sua mensagem.", {
        description: "Verifique sua conexão e tente novamente.",
      });
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="surface-ivory">
      <Seo
        title="Contato — Western"
        description="Fale direto com o ateliê Western. WhatsApp, e-mail comercial ou envie uma mensagem pelo formulário — atendimento por quem desenha e fabrica."
        path="/contato"
      />

      {/* Hero */}
      <section className="container-western pt-12 md:pt-20 pb-10 md:pb-14 max-w-6xl">
        <p className="text-eyebrow mb-4">Contato</p>
        <h1 className="display-xl text-western-green-deep max-w-[18ch]">
          Fale com a Western.
        </h1>
        <p className="text-body mt-5 max-w-[56ch]">
          Atendimento direto com quem desenha e fabrica. Sem call center, sem formulário
          labiríntico — uma equipe pequena, focada em projetos de arquitetura e paisagismo.
        </p>
      </section>

      {/* Canais + formulário */}
      <section className="container-western pb-16 md:pb-24 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.05fr] gap-8 lg:gap-14 items-start">
          {/* Coluna de canais */}
          <div className="space-y-4">
            {/* WhatsApp — canal preferido do ateliê */}
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="surface-forest block rounded-2xl p-6 md:p-8 transition-colors hover:bg-western-green-mid"
            >
              <p className="text-[14px] font-semibold uppercase tracking-[0.06em] text-western-gold-soft">
                WhatsApp comercial
              </p>
              <p className="display-md mt-3 text-western-cream">{BUSINESS.whatsappLabel}</p>
              <p className="mt-3 text-[17px] leading-[1.6] text-western-cream-muted">
                Resposta em até 1h útil. É o canal preferido do ateliê para projetos.
              </p>
              <span className="btn-gold mt-6 w-full">
                <MessageCircle className="h-5 w-5" strokeWidth={1.75} aria-hidden="true" />
                Abrir conversa
              </span>
            </a>

            {/* Demais canais */}
            <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-1">
              {canais.map((c) => {
                const Icon = c.icon;
                const cardClass =
                  "tap-target block h-full rounded-[10px] border border-western-border-soft bg-white p-5 md:p-6 transition-colors hover:border-western-border-strong hover:bg-western-paper";
                const inner = (
                  <div className="flex items-start gap-4">
                    <Icon
                      className="mt-1 h-6 w-6 flex-shrink-0 text-western-bronze"
                      strokeWidth={1.75}
                      aria-hidden="true"
                    />
                    <div className="min-w-0">
                      <p className="text-eyebrow">{c.eyebrow}</p>
                      <p className="mt-1.5 break-words text-[20px] font-semibold leading-snug text-western-green-deep">
                        {c.titulo}
                      </p>
                      <p className="mt-2 text-[16px] leading-relaxed text-western-stone-warm">
                        {c.descricao}
                      </p>
                      <span className="mt-3 inline-flex items-center gap-1.5 text-[16px] font-semibold text-western-cta">
                        {c.cta}
                        <ArrowUpRight className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
                      </span>
                    </div>
                  </div>
                );
                return (
                  <li key={c.eyebrow}>
                    {c.internal ? (
                      <Link to={c.href} className={cardClass}>
                        {inner}
                      </Link>
                    ) : (
                      <a
                        href={c.href}
                        target={c.href.startsWith("http") ? "_blank" : undefined}
                        rel="noopener noreferrer"
                        className={cardClass}
                      >
                        {inner}
                      </a>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Formulário */}
          <div className="lg:sticky lg:top-24">
            {success ? (
              <div className="rounded-2xl border border-western-border-soft bg-white p-6 md:p-9 shadow-[0_24px_60px_-32px_rgba(30,40,25,0.28)]">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#2E7D4F]/10">
                  <CheckCircle2 className="h-6 w-6 text-[#2E7D4F]" strokeWidth={1.75} aria-hidden="true" />
                </div>
                <h2 className="display-md mt-6 text-western-green-deep">Recebemos sua mensagem.</h2>
                <p className="text-body mt-4">
                  Nosso time responde em até 1 dia útil. Se preferir agilizar, chame no WhatsApp.
                </p>
                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <a
                    href={waUrlAfter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary w-full sm:w-auto"
                  >
                    <MessageCircle className="h-5 w-5" strokeWidth={1.75} aria-hidden="true" />
                    Falar agora no WhatsApp
                  </a>
                  <Link to="/linhas" className="btn-outline-forest w-full sm:w-auto">
                    Ver o catálogo
                  </Link>
                </div>
              </div>
            ) : (
              <form
                ref={formRef}
                onSubmit={handleSubmit}
                noValidate
                className="rounded-2xl border border-western-border-soft bg-white p-6 md:p-9 shadow-[0_24px_60px_-32px_rgba(30,40,25,0.28)]"
              >
                <p className="text-eyebrow">Enviar mensagem</p>
                <h2 className="display-md mt-3 text-western-green-deep">Escreva pra gente</h2>
                <p className="mt-2 text-[16px] leading-relaxed text-western-stone-warm">
                  Retorno em até 1 dia útil. Pelo WhatsApp, em até 1h útil.
                </p>

                <div className="mt-8 space-y-6">
                  <div>
                    <FieldLabel htmlFor="nome" required>Nome</FieldLabel>
                    <Input
                      id="nome"
                      name="nome"
                      value={f.nome}
                      onChange={(e) => setField("nome", e.target.value)}
                      maxLength={120}
                      autoComplete="name"
                      placeholder="Como podemos te chamar"
                      aria-invalid={!!errors.nome}
                      className={`${CONTROL} ${errors.nome ? CONTROL_ERR : ""}`}
                    />
                    {errors.nome && <FieldError id="nome-error">{errors.nome}</FieldError>}
                  </div>

                  <div className={EMAIL_FX}>
                    <FieldLabel htmlFor="email" hint="Informe pelo menos um: e-mail ou WhatsApp/telefone.">
                      E-mail
                    </FieldLabel>
                    <div
                      className={
                        errors.email
                          ? ""
                          : "[&_input]:!border-western-border-strong [&_input:focus]:!border-western-green-deep"
                      }
                    >
                      <EmailInput
                        id="email"
                        name="email"
                        value={f.email}
                        onChange={(v) => setField("email", v)}
                        error={errors.email}
                      />
                    </div>
                  </div>

                  <div className={PHONE_FX}>
                    <FieldLabel htmlFor="telefone" hint="Ou informe o e-mail acima — basta um dos dois.">
                      WhatsApp / Telefone
                    </FieldLabel>
                    <PhoneInput
                      id="telefone"
                      name="telefone"
                      value={f.telefone}
                      onChange={(v) => setField("telefone", v)}
                      error={errors.telefone}
                      className={`!h-[52px] overflow-hidden rounded-[10px] !bg-western-paper ${
                        errors.telefone ? "" : "!border-[1.5px] !border-western-border-strong"
                      }`}
                    />
                  </div>

                  <div>
                    <FieldLabel htmlFor="cidade" optional>Cidade</FieldLabel>
                    <Input
                      id="cidade"
                      name="cidade"
                      value={f.cidade}
                      onChange={(e) => setField("cidade", e.target.value)}
                      maxLength={80}
                      autoComplete="address-level2"
                      placeholder="Onde fica o projeto"
                      className={CONTROL}
                    />
                  </div>

                  <div>
                    <FieldLabel htmlFor="assunto" optional>Assunto</FieldLabel>
                    <Input
                      id="assunto"
                      name="assunto"
                      value={f.assunto}
                      onChange={(e) => setField("assunto", e.target.value)}
                      maxLength={120}
                      placeholder="Ex.: proposta técnica, visita, imprensa…"
                      className={CONTROL}
                    />
                  </div>

                  <div>
                    <FieldLabel htmlFor="mensagem" required>Mensagem</FieldLabel>
                    <Textarea
                      id="mensagem"
                      name="mensagem"
                      value={f.mensagem}
                      onChange={(e) => setField("mensagem", e.target.value)}
                      maxLength={1000}
                      rows={5}
                      aria-invalid={!!errors.mensagem}
                      placeholder="Conte brevemente sobre o projeto: tipo (piscina, lago, jardim), tamanho aproximado e cidade."
                      className={`min-h-[140px] rounded-[10px] border-[1.5px] bg-western-paper px-4 py-3 text-[17px] leading-[1.6] text-western-green-deep placeholder:text-western-stone-warm/60 focus-visible:ring-0 ${
                        errors.mensagem
                          ? "border-[#B3372E]"
                          : "border-western-border-strong focus-visible:border-western-green-deep"
                      }`}
                    />
                    {errors.mensagem && <FieldError id="mensagem-error">{errors.mensagem}</FieldError>}
                  </div>
                </div>

                {/* Honeypot — invisível ao usuário, atrai bots. */}
                <div aria-hidden="true" className="absolute -left-[9999px] top-auto h-px w-px overflow-hidden">
                  <label>
                    Não preencha este campo
                    <input
                      type="text"
                      tabIndex={-1}
                      autoComplete="off"
                      value={honeypot}
                      onChange={(e) => setHoneypot(e.target.value)}
                      name="website"
                    />
                  </label>
                </div>

                <InvisibleTurnstile ref={captchaRef} />

                <button type="submit" disabled={loading} className="btn-primary mt-8 w-full">
                  {loading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
                      Enviando…
                    </>
                  ) : (
                    "Enviar mensagem"
                  )}
                </button>

                <p className="mt-5 flex items-start gap-2.5 text-[14px] leading-relaxed text-western-stone-warm">
                  <ShieldCheck
                    className="mt-0.5 h-5 w-5 flex-shrink-0 text-western-bronze"
                    strokeWidth={1.75}
                    aria-hidden="true"
                  />
                  <span>
                    Empresa brasileira · CNPJ {BUSINESS.cnpj} · Ateliê desde {BUSINESS.fundadaEm}. Ao enviar,
                    você concorda em receber contato da Western e com a nossa{" "}
                    <Link
                      to="/privacidade"
                      className="font-semibold text-western-green-deep underline decoration-western-gold underline-offset-2"
                    >
                      política de privacidade
                    </Link>
                    . Seus dados ficam seguros e nunca são usados para spam.
                  </span>
                </p>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* Ateliê */}
      <section className="surface-forest">
        <div className="container-western max-w-6xl py-16 md:py-24">
          <div className="grid gap-12 md:grid-cols-12 md:gap-16">
            <div className="md:col-span-5">
              <p className="text-[14px] font-semibold uppercase tracking-[0.06em] text-western-gold-soft">
                Conheça o ateliê
              </p>
              <div className="mb-7 mt-5 h-px w-12 bg-western-gold" />
              <h2 className="display-lg text-western-cream">Onde cada peça nasce.</h2>
              <p className="mt-5 max-w-md text-[17px] leading-[1.6] text-western-cream-muted">
                Estamos em {BUSINESS.cidadeAtelie}/{BUSINESS.ufAtelie}, na Grande São Paulo.
                Receba arquitetos, paisagistas e clientes finais para conhecer os acabamentos
                ao vivo e ver as peças em produção.
              </p>
              <Link to="/visitar" className="btn-gold mt-8 w-full sm:w-auto">
                Agendar visita
                <ArrowUpRight className="h-5 w-5" strokeWidth={1.75} aria-hidden="true" />
              </Link>
            </div>

            <div className="md:col-span-7 md:border-l md:border-western-gold/20 md:pl-16">
              <dl className="grid gap-x-10 gap-y-9 sm:grid-cols-2">
                <InfoBlock icon={MapPin} label="Endereço">
                  {BUSINESS.enderecoAtelieRua}<br />
                  {BUSINESS.cidadeAtelie}/{BUSINESS.ufAtelie} · {BUSINESS.enderecoAtelieCep}
                </InfoBlock>
                <InfoBlock icon={Clock} label="Horário">
                  {BUSINESS.horarioAtelie}<br />
                  Visitas mediante agendamento.
                </InfoBlock>
                <InfoBlock icon={Phone} label="Telefone do ateliê">
                  <a
                    href={`tel:+${BUSINESS.whatsappFabrica}`}
                    className="underline decoration-western-gold/60 underline-offset-4 transition-colors hover:text-western-gold-soft"
                  >
                    {BUSINESS.whatsappLabel}
                  </a>
                </InfoBlock>
                <InfoBlock icon={Mail} label="Suporte e pós-venda">
                  <a
                    href={`mailto:${BUSINESS.emailSuporte}`}
                    className="break-all underline decoration-western-gold/60 underline-offset-4 transition-colors hover:text-western-gold-soft"
                  >
                    {BUSINESS.emailSuporte}
                  </a>
                </InfoBlock>
              </dl>

              <p className="mt-12 border-t border-western-gold/20 pt-8 text-[14px] leading-relaxed text-western-cream-muted">
                Fundada em {BUSINESS.fundadaEm} · {BUSINESS.anosOperacao}+ anos de coautoria com arquitetos ·
                NF-e em todo pedido · Garantia de {BUSINESS.garantiaLabel}
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

/* Label de campo — sans 16px (o mínimo de UI no V3), sentence case.
 * Local a esta tela: o FieldLabel compartilhado ainda usa a escala antiga. */
function FieldLabel({
  htmlFor,
  children,
  required,
  optional,
  hint,
}: {
  htmlFor: string;
  children: React.ReactNode;
  required?: boolean;
  optional?: boolean;
  hint?: string;
}) {
  return (
    <div className="mb-2">
      <label
        htmlFor={htmlFor}
        className="block text-[16px] font-semibold leading-snug text-western-green-deep"
      >
        {children}
        {required && (
          <span aria-hidden="true" className="ml-1 text-western-bronze">
            *
          </span>
        )}
        {optional && (
          <span className="ml-2 font-normal text-western-stone-warm">(opcional)</span>
        )}
      </label>
      {hint && (
        <p className="mt-1 text-[14px] leading-snug text-western-stone-warm">{hint}</p>
      )}
    </div>
  );
}

function FieldError({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <p id={id} className="mt-2 text-[14px] font-semibold text-[#B3372E]">
      {children}
    </p>
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
      <div className="mb-2.5 flex items-center gap-3">
        <Icon className="h-5 w-5 text-western-gold-soft" strokeWidth={1.75} aria-hidden="true" />
        <dt className="text-[16px] font-semibold text-western-gold-soft">{label}</dt>
      </div>
      <dd className="text-[17px] leading-[1.6] text-western-cream">{children}</dd>
    </div>
  );
}
