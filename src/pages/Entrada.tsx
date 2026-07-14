import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ArrowRight, ArrowLeft, Check, Loader2, MessageCircle } from "lucide-react";
import { z } from "zod";
import { toast } from "sonner";
import Seo from "@/components/seo/Seo";
import PhoneInput from "@/components/forms/PhoneInput";
import FieldLabel from "@/components/forms/FieldLabel";
import { supabase } from "@/integrations/supabase/client";
import { phoneBRSchema, normalizeText, formatPhoneBR } from "@/lib/forms/br";
import { BUSINESS } from "@/config/business";
import logo from "@/assets/logo-vertical-verde.png";
import proImage from "@/assets/projetos-western/05_cascata-escalonada.webp";
import residencialImage from "@/assets/projetos-western/08_piscina-paisagismo.webp";

/* DS V3 — bifurcação de público.
 * A tela é de decisão, não de compra: fundo claro e quente (ivory), uma pergunta,
 * dois cards grandes de toque. O verde/foto só aparece DENTRO dos cards (overlay
 * de foto é o único escuro permitido aqui), e é lá — e só lá — que o dourado é
 * usado como acento. Nos fundos claros o CTA primário é verde (.btn-primary).
 * Nada de mono, nada abaixo de 14px, nada de cantos vivos. */

type TipoProjeto = "Cascata" | "Lago / piscina natural" | "Área de lazer completa" | "Outro";

const formSchema = z.object({
  nome: z.string().transform(normalizeText).pipe(z.string().min(2, "Informe seu nome")),
  telefone: phoneBRSchema,
  tipo_projeto: z.enum([
    "Cascata",
    "Lago / piscina natural",
    "Área de lazer completa",
    "Outro",
  ]),
});

/* Eyebrow sobre foto: bronze não teria contraste — usa-se gold-soft, mantendo
 * a regra tipográfica (sans semibold 14px, tracking 0.06em). */
const EYEBROW_ON_PHOTO =
  "font-sans text-[14px] font-semibold uppercase tracking-[0.06em] text-western-gold-soft";

/* Campo de 52px, cantos 10px, texto 16px, borda visível (público 40+). */
const CONTROL =
  "h-[52px] w-full rounded-[10px] border-[1.5px] bg-western-paper px-4 font-sans text-[16px] leading-normal text-western-green-deep placeholder:text-western-stone-warm/60 outline-none transition-colors";
const CONTROL_OK = "border-western-border-strong focus:border-western-green-deep";
const CONTROL_ERR = "border-[#B3372E]";

function FieldError({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <p id={id} className="mt-2 font-sans text-[14px] font-semibold leading-snug text-[#B3372E]">
      {children}
    </p>
  );
}

type OptionCardProps = {
  eyebrow: string;
  title: string;
  description: string;
  ariaLabel: string;
  imageUrl: string;
  onActivate: () => void;
};

function OptionCard({ eyebrow, title, description, ariaLabel, imageUrl, onActivate }: OptionCardProps) {
  return (
    <button
      type="button"
      onClick={onActivate}
      aria-label={ariaLabel}
      className="group tap-target relative flex min-h-[340px] md:min-h-[440px] flex-col justify-end overflow-hidden rounded-[16px] border border-western-border-soft text-left shadow-[0_24px_60px_-32px_rgba(30,40,25,0.28)] transition-shadow duration-200 hover:shadow-[0_30px_70px_-30px_rgba(30,40,25,0.42)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-western-bronze focus-visible:ring-offset-2 focus-visible:ring-offset-western-ivory"
    >
      <img
        src={imageUrl}
        alt=""
        aria-hidden="true"
        loading="lazy"
        decoding="async"
        className="absolute inset-0 h-full w-full object-cover"
      />
      {/* Overlay verde de proteção — texto sobre foto nunca sem overlay. */}
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, hsl(var(--western-green-deep) / 0.20) 0%, hsl(var(--western-green-deep) / 0.72) 55%, hsl(var(--western-green-deep) / 0.94) 100%)",
        }}
      />
      <div className="relative z-10 p-6 md:p-8">
        <p className={EYEBROW_ON_PHOTO}>{eyebrow}</p>
        <h2 className="display-md mt-3 text-western-cream">{title}</h2>
        <p className="mt-2 max-w-[36ch] text-[17px] leading-[1.6] text-western-cream-muted">
          {description}
        </p>
        <span className="mt-6 inline-flex items-center gap-2 font-sans text-[16px] font-semibold text-western-gold-soft transition-colors group-hover:text-western-gold">
          Continuar
          <ArrowRight className="h-5 w-5" aria-hidden="true" />
        </span>
      </div>
    </button>
  );
}

type View = "choose" | "form" | "done";

export default function Entrada() {
  const navigate = useNavigate();
  const [view, setView] = useState<View>("choose");
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [tipo, setTipo] = useState<TipoProjeto | "">("");
  const [errors, setErrors] = useState<{ nome?: string; telefone?: string; tipo_projeto?: string }>({});
  const [submitting, setSubmitting] = useState(false);
  const nameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (view === "form") {
      // small delay so the transition doesn't fight the focus
      const t = setTimeout(() => nameRef.current?.focus(), 120);
      return () => clearTimeout(t);
    }
  }, [view]);

  const waHrefDirect = `https://wa.me/${BUSINESS.whatsappFabrica}?text=${encodeURIComponent(
    "Olá! Gostaria de conversar sobre um projeto próprio (cascata, lago ou área de lazer).",
  )}`;

  const waHrefAfter = (() => {
    const msg = `Olá! Sou ${nome || ""}. Acabei de solicitar um orçamento no site${
      tipo ? ` — projeto: ${tipo}` : ""
    }.`;
    return `https://wa.me/${BUSINESS.whatsappFabrica}?text=${encodeURIComponent(msg)}`;
  })();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});
    const parsed = formSchema.safeParse({ nome, telefone, tipo_projeto: tipo });
    if (!parsed.success) {
      const eMap: typeof errors = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as keyof typeof errors;
        if (!eMap[key]) eMap[key] = issue.message;
      }
      setErrors(eMap);
      return;
    }
    setSubmitting(true);
    try {
      const { error } = await supabase.from("leads").insert({
        type: "b2c_orcamento",
        nome: parsed.data.nome,
        telefone: parsed.data.telefone,
        payload: { tipo_projeto: parsed.data.tipo_projeto },
        origem: "site/entrada/b2c",
      });
      if (error) throw error;
      toast.success("Recebemos seu pedido! Nosso time entra em contato pelo WhatsApp.");
      setView("done");
    } catch (err) {
      console.error(err);
      toast.error("Não conseguimos enviar agora. Tente novamente ou fale pelo WhatsApp.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <Seo
        title="Western — Bem-vindo"
        description="Escolha por onde começar: profissional do ramo (preço de parceiro) ou projeto próprio (solicitar orçamento)."
        path="/entrada"
      />
      <Helmet>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <section className="surface-ivory relative min-h-[calc(100vh-4rem)] overflow-hidden">
        <div className="container-western relative flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center py-14 md:py-20">
          <img
            src={logo}
            alt="Western"
            className="h-12 w-auto md:h-14"
            decoding="async"
          />

          {view === "choose" && (
            <div className="flex w-full flex-col items-center animate-in fade-in duration-500">
              <div className="mt-8 max-w-2xl text-center">
                <p className="text-eyebrow">Bem-vindo à Western</p>
                <div className="mx-auto mt-4 h-px w-12 bg-western-gold" />
                <h1 className="display-xl mt-5 text-western-green-deep">
                  Por onde você prefere começar?
                </h1>
              </div>

              <div className="mt-10 grid w-full max-w-4xl grid-cols-1 gap-5 md:mt-14 md:grid-cols-2 md:gap-6">
                <OptionCard
                  eyebrow="Opção 01"
                  title="Sou profissional do ramo"
                  description="Arquiteto, paisagista, laguista ou revenda."
                  ariaLabel="Sou profissional do ramo — ir para a loja"
                  imageUrl={proImage}
                  onActivate={() => navigate("/")}
                />
                <OptionCard
                  eyebrow="Opção 02"
                  title="É para um projeto meu"
                  description="Cascata, lago ou área de lazer na sua casa."
                  ariaLabel="É para um projeto meu — solicitar orçamento"
                  imageUrl={residencialImage}
                  onActivate={() => setView("form")}
                />
              </div>

              <Link
                to="/linhas"
                className="tap-target mt-10 inline-flex items-center gap-2 font-sans text-[16px] font-semibold text-western-green-deep underline decoration-western-gold underline-offset-4 transition-colors hover:text-western-cta"
              >
                Só quero ver o catálogo
                <ArrowRight className="h-5 w-5" aria-hidden="true" />
              </Link>
            </div>
          )}

          {view === "form" && (
            <div className="mt-10 w-full max-w-lg animate-in fade-in slide-in-from-bottom-3 duration-500">
              <button
                type="button"
                onClick={() => setView("choose")}
                className="tap-target inline-flex items-center gap-2 font-sans text-[16px] font-semibold text-western-green-deep transition-colors hover:text-western-cta"
              >
                <ArrowLeft className="h-5 w-5" aria-hidden="true" />
                Voltar
              </button>

              <div className="mt-4 rounded-[16px] border border-western-border-soft bg-white p-6 shadow-[0_24px_60px_-32px_rgba(30,40,25,0.28)] md:p-9">
                <div className="text-center">
                  <p className="text-eyebrow">Solicitar orçamento</p>
                  <div className="mx-auto mt-4 h-px w-12 bg-western-gold" />
                  <h1 className="display-lg mt-5 text-western-green-deep">
                    Conta pra gente sobre seu projeto
                  </h1>
                  <p className="mt-3 text-[17px] leading-[1.6] text-western-stone-warm">
                    Três campos rápidos. Nosso time retorna pelo WhatsApp.
                  </p>
                </div>

                <form onSubmit={onSubmit} noValidate className="mt-8 space-y-6">
                  <div>
                    <FieldLabel htmlFor="nome" required>Nome</FieldLabel>
                    <input
                      ref={nameRef}
                      id="nome"
                      name="nome"
                      type="text"
                      autoComplete="name"
                      value={nome}
                      onChange={(e) => setNome(e.target.value)}
                      aria-invalid={!!errors.nome}
                      aria-describedby={errors.nome ? "nome-error" : undefined}
                      className={`${CONTROL} ${errors.nome ? CONTROL_ERR : CONTROL_OK}`}
                      placeholder="Seu nome"
                    />
                    {errors.nome && <FieldError id="nome-error">{errors.nome}</FieldError>}
                  </div>

                  <div>
                    <FieldLabel htmlFor="telefone" required>WhatsApp</FieldLabel>
                    <PhoneInput
                      id="telefone"
                      name="telefone"
                      value={telefone}
                      onChange={setTelefone}
                      error={errors.telefone}
                      required
                    />
                  </div>

                  <div>
                    <FieldLabel htmlFor="tipo_projeto" required>Tipo de projeto</FieldLabel>
                    <select
                      id="tipo_projeto"
                      name="tipo_projeto"
                      value={tipo}
                      onChange={(e) => setTipo(e.target.value as TipoProjeto)}
                      aria-invalid={!!errors.tipo_projeto}
                      aria-describedby={errors.tipo_projeto ? "tipo-error" : undefined}
                      className={`${CONTROL} ${errors.tipo_projeto ? CONTROL_ERR : CONTROL_OK}`}
                    >
                      <option value="">Selecione…</option>
                      <option value="Cascata">Cascata</option>
                      <option value="Lago / piscina natural">Lago / piscina natural</option>
                      <option value="Área de lazer completa">Área de lazer completa</option>
                      <option value="Outro">Outro</option>
                    </select>
                    {errors.tipo_projeto && <FieldError id="tipo-error">{errors.tipo_projeto}</FieldError>}
                  </div>

                  {/* CTA primário = verde, full-width no mobile. */}
                  <button type="submit" disabled={submitting} className="btn-primary w-full">
                    {submitting ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
                        Enviando…
                      </>
                    ) : (
                      <>
                        Solicitar orçamento
                        <ArrowRight className="h-5 w-5" aria-hidden="true" />
                      </>
                    )}
                  </button>
                </form>

                <div className="mt-8 border-t border-western-border-soft pt-6 text-center">
                  <a
                    href={waHrefDirect}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-outline-forest w-full"
                  >
                    <MessageCircle className="h-5 w-5" strokeWidth={1.75} aria-hidden="true" />
                    Prefere falar agora? Chamar no WhatsApp
                  </a>
                </div>
              </div>
            </div>
          )}

          {view === "done" && (
            <div className="mt-10 w-full max-w-lg animate-in fade-in zoom-in-95 duration-500">
              <div className="rounded-[16px] border border-western-border-soft bg-white p-6 text-center shadow-[0_24px_60px_-32px_rgba(30,40,25,0.28)] md:p-9">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#2E7D4F]/10">
                  <Check className="h-7 w-7 text-[#2E7D4F]" strokeWidth={1.75} aria-hidden="true" />
                </div>
                <p className="text-eyebrow mt-6">Pedido recebido</p>
                <div className="mx-auto mt-4 h-px w-12 bg-western-gold" />
                <h1 className="display-lg mt-5 text-western-green-deep">
                  Obrigado, {nome.split(" ")[0] || "tudo certo"}.
                </h1>
                <p className="mt-3 text-[17px] leading-[1.6] text-western-stone-warm">
                  Nosso time entra em contato no WhatsApp {telefone ? formatPhoneBR(telefone) : ""} em breve.
                </p>

                <div className="mt-8 flex flex-col gap-3">
                  <a
                    href={waHrefAfter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary w-full"
                  >
                    <MessageCircle className="h-5 w-5" strokeWidth={1.75} aria-hidden="true" />
                    Falar agora no WhatsApp
                  </a>
                  <Link to="/linhas" className="btn-outline-forest w-full">
                    Enquanto isso, veja o catálogo
                    <ArrowRight className="h-5 w-5" aria-hidden="true" />
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
