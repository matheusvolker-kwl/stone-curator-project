import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ArrowRight, ArrowLeft, Check, Loader2 } from "lucide-react";
import { z } from "zod";
import { toast } from "sonner";
import Seo from "@/components/seo/Seo";
import PhoneInput from "@/components/forms/PhoneInput";
import FieldLabel from "@/components/forms/FieldLabel";
import { supabase } from "@/integrations/supabase/client";
import { phoneBRSchema, normalizeText, formatPhoneBR } from "@/lib/forms/br";
import { BUSINESS } from "@/config/business";
import logo from "@/assets/logo-vertical-bege.png";
import proImage from "@/assets/projetos-western/05_cascata-escalonada.webp.asset.json";
import residencialImage from "@/assets/projetos-western/08_piscina-paisagismo.webp.asset.json";

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
      className="group relative flex h-[420px] md:h-[520px] flex-col justify-end overflow-hidden rounded-[2px] border border-western-gold/25 text-left transition-all duration-300 ease-out hover:-translate-y-1 hover:border-western-gold hover:shadow-[0_24px_50px_-24px_rgba(0,0,0,0.7)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-western-gold focus-visible:ring-offset-2 focus-visible:ring-offset-western-green-deep motion-reduce:transition-none motion-reduce:hover:translate-y-0"
    >
      <img
        src={imageUrl}
        alt=""
        aria-hidden="true"
        loading="lazy"
        decoding="async"
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.06] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-t from-western-green-deep via-western-green-deep/70 to-western-green-deep/10"
      />
      <div className="relative z-10 p-7 md:p-9">
        <p className="font-mono text-[10px] font-medium uppercase tracking-[0.24em] text-western-gold-soft">
          {eyebrow}
        </p>
        <h2 className="mt-3 font-display text-2xl md:text-[26px] leading-[1.15] text-western-cream">
          {title}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-western-cream-muted max-w-[36ch]">
          {description}
        </p>
        <span className="mt-5 inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.24em] text-western-gold transition-all duration-300 group-hover:gap-3">
          Continuar
          <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
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

      <section className="relative min-h-[calc(100vh-4rem)] overflow-hidden bg-western-green-deep">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.35] mix-blend-overlay"
          style={{
            backgroundImage:
              "radial-gradient(1200px 600px at 50% -10%, rgba(212,175,110,0.18), transparent 60%), radial-gradient(900px 500px at 50% 110%, rgba(0,0,0,0.55), transparent 60%)",
          }}
        />

        <div className="container-western relative z-10 flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center py-14 md:py-20">
          <img src={logo} alt="Western" className="h-12 md:h-14 w-auto opacity-95" decoding="async" />

          {view === "choose" && (
            <div className="w-full flex flex-col items-center animate-in fade-in duration-500">
              <div className="mt-8 max-w-2xl text-center">
                <p className="font-mono text-[11px] font-medium uppercase tracking-[0.28em] text-western-gold-soft">
                  Bem-vindo à Western
                </p>
                <div className="mx-auto mt-4 h-px w-10 bg-western-gold" />
                <h1 className="mt-5 font-display text-2xl md:text-4xl lg:text-[42px] leading-[1.1] text-western-cream text-balance">
                  Por onde você prefere começar?
                </h1>
              </div>

              <div className="mt-10 md:mt-14 grid w-full max-w-4xl grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
                <OptionCard
                  eyebrow="Opção 01"
                  title="Sou profissional do ramo"
                  description="Arquiteto, paisagista, laguista ou revenda."
                  ariaLabel="Sou profissional do ramo — ir para a loja"
                  imageUrl={proImage.url}
                  onActivate={() => navigate("/")}
                />
                <OptionCard
                  eyebrow="Opção 02"
                  title="É para um projeto meu"
                  description="Cascata, lago ou área de lazer na sua casa."
                  ariaLabel="É para um projeto meu — solicitar orçamento"
                  imageUrl={residencialImage.url}
                  onActivate={() => setView("form")}
                />
              </div>

              <Link
                to="/linhas"
                className="mt-10 inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.24em] text-western-cream-muted transition-colors hover:text-western-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-western-gold focus-visible:ring-offset-2 focus-visible:ring-offset-western-green-deep"
              >
                Só quero ver o catálogo
                <ArrowRight className="h-3 w-3" aria-hidden="true" />
              </Link>
            </div>
          )}

          {view === "form" && (
            <div className="w-full max-w-lg mt-10 animate-in fade-in slide-in-from-bottom-3 duration-500">
              <button
                type="button"
                onClick={() => setView("choose")}
                className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.24em] text-western-cream-muted hover:text-western-gold transition-colors"
              >
                <ArrowLeft className="h-3 w-3" aria-hidden="true" /> Voltar
              </button>

              <div className="mt-6 text-center">
                <p className="font-mono text-[11px] font-medium uppercase tracking-[0.28em] text-western-gold-soft">
                  Solicitar orçamento
                </p>
                <div className="mx-auto mt-4 h-px w-10 bg-western-gold" />
                <h1 className="mt-5 font-display text-2xl md:text-3xl leading-[1.15] text-western-cream text-balance">
                  Conta pra gente sobre seu projeto
                </h1>
                <p className="mt-3 text-sm text-western-cream-muted">
                  Três campos rápidos. Nosso time retorna pelo WhatsApp.
                </p>
              </div>

              <form onSubmit={onSubmit} noValidate className="mt-8 space-y-5">
                <div>
                  <FieldLabel htmlFor="nome">Nome</FieldLabel>
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
                    className={`h-12 w-full border bg-transparent px-3 outline-none transition-colors text-western-cream placeholder:text-western-cream-muted/40 ${
                      errors.nome
                        ? "border-red-500/60"
                        : "border-western-gold/25 focus:border-western-gold"
                    }`}
                    placeholder="Seu nome"
                  />
                  {errors.nome && (
                    <p id="nome-error" className="mt-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-red-400/90">
                      {errors.nome}
                    </p>
                  )}
                </div>

                <div>
                  <FieldLabel htmlFor="telefone">WhatsApp</FieldLabel>
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
                  <FieldLabel htmlFor="tipo_projeto">Tipo de projeto</FieldLabel>
                  <select
                    id="tipo_projeto"
                    name="tipo_projeto"
                    value={tipo}
                    onChange={(e) => setTipo(e.target.value as TipoProjeto)}
                    aria-invalid={!!errors.tipo_projeto}
                    aria-describedby={errors.tipo_projeto ? "tipo-error" : undefined}
                    className={`h-12 w-full border bg-transparent px-3 outline-none transition-colors text-western-cream ${
                      errors.tipo_projeto
                        ? "border-red-500/60"
                        : "border-western-gold/25 focus:border-western-gold"
                    }`}
                  >
                    <option value="" className="bg-western-green-deep">Selecione…</option>
                    <option value="Cascata" className="bg-western-green-deep">Cascata</option>
                    <option value="Lago / piscina natural" className="bg-western-green-deep">Lago / piscina natural</option>
                    <option value="Área de lazer completa" className="bg-western-green-deep">Área de lazer completa</option>
                    <option value="Outro" className="bg-western-green-deep">Outro</option>
                  </select>
                  {errors.tipo_projeto && (
                    <p id="tipo-error" className="mt-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-red-400/90">
                      {errors.tipo_projeto}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="mt-2 inline-flex w-full h-12 items-center justify-center gap-2 border border-western-gold bg-western-gold/10 font-mono text-[11px] uppercase tracking-[0.24em] text-western-cream hover:bg-western-gold/20 transition-colors disabled:opacity-60 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-western-gold focus-visible:ring-offset-2 focus-visible:ring-offset-western-green-deep"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> Enviando…
                    </>
                  ) : (
                    <>
                      Solicitar orçamento
                      <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                    </>
                  )}
                </button>
              </form>

              <div className="mt-8 pt-6 border-t border-western-gold/15 text-center">
                <a
                  href={waHrefDirect}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.24em] text-western-cream-muted hover:text-western-gold transition-colors"
                >
                  Prefere falar agora? Chamar no WhatsApp
                  <ArrowRight className="h-3 w-3" aria-hidden="true" />
                </a>
              </div>
            </div>
          )}

          {view === "done" && (
            <div className="w-full max-w-lg mt-10 text-center animate-in fade-in zoom-in-95 duration-500">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-western-gold text-western-gold">
                <Check className="h-7 w-7" aria-hidden="true" />
              </div>
              <p className="mt-6 font-mono text-[11px] font-medium uppercase tracking-[0.28em] text-western-gold-soft">
                Pedido recebido
              </p>
              <div className="mx-auto mt-4 h-px w-10 bg-western-gold" />
              <h1 className="mt-5 font-display text-2xl md:text-3xl leading-[1.15] text-western-cream text-balance">
                Obrigado, {nome.split(" ")[0] || "tudo certo"}.
              </h1>
              <p className="mt-3 text-sm text-western-cream-muted">
                Nosso time entra em contato no WhatsApp {telefone ? formatPhoneBR(telefone) : ""} em breve.
              </p>

              <a
                href={waHrefAfter}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-8 inline-flex w-full h-12 items-center justify-center gap-2 border border-western-gold bg-western-gold/10 font-mono text-[11px] uppercase tracking-[0.24em] text-western-cream hover:bg-western-gold/20 transition-colors"
              >
                Falar agora no WhatsApp
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </a>

              <Link
                to="/linhas"
                className="mt-6 inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.24em] text-western-cream-muted hover:text-western-gold transition-colors"
              >
                Enquanto isso, veja o catálogo
                <ArrowRight className="h-3 w-3" aria-hidden="true" />
              </Link>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
