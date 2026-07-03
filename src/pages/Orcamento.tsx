import { useState, useRef, FormEvent } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { z } from "zod";
import { CheckCircle2, Loader2, MessageCircle, ShieldCheck } from "lucide-react";
import Seo from "@/components/seo/Seo";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import PhoneInput from "@/components/forms/PhoneInput";
import EmailInput from "@/components/forms/EmailInput";
import FieldLabel from "@/components/forms/FieldLabel";
import { supabase } from "@/integrations/supabase/client";
import { BUSINESS } from "@/config/business";
import {
  emailSchema,
  phoneBRSchema,
  normalizeText,
  focusFirstInvalid,
  UF_LIST,
} from "@/lib/forms/br";
import heroImage from "@/assets/projetos-western/04_piscina-mirante.webp.asset.json";

const TIPO_OPTIONS = [
  "Piscina natural / lago",
  "Cascata",
  "Área de lazer completa",
  "Ainda não sei / outro",
] as const;

const schema = z.object({
  nome: z.string().trim().min(2, "Informe seu nome").max(120),
  telefone: phoneBRSchema,
  email: emailSchema,
  cidade: z.string().trim().min(2, "Informe a cidade").max(80),
  uf: z.string().refine((v) => (UF_LIST as readonly string[]).includes(v), { message: "Selecione a UF" }),
  tipo: z.string().refine((v) => (TIPO_OPTIONS as readonly string[]).includes(v), { message: "Selecione o tipo" }),
  mensagem: z.string().max(1000).optional(),
});

type Form = {
  nome: string;
  telefone: string;
  email: string;
  cidade: string;
  uf: string;
  tipo: string;
  mensagem: string;
};

const INITIAL: Form = {
  nome: "", telefone: "", email: "", cidade: "", uf: "", tipo: "", mensagem: "",
};

const WHATSAPP_MSG = encodeURIComponent(
  "Olá Western! Acabei de solicitar meu orçamento pelo site e gostaria de falar com o time.",
);
const WHATSAPP_URL = `https://wa.me/${BUSINESS.whatsappFabrica}?text=${WHATSAPP_MSG}`;

export default function Orcamento() {
  const [f, setF] = useState<Form>(INITIAL);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const setField = <K extends keyof Form>(k: K, v: Form[K]) => setF((p) => ({ ...p, [k]: v }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const normalized: Form = {
      ...f,
      nome: normalizeText(f.nome),
      cidade: normalizeText(f.cidade),
      mensagem: f.mensagem ? normalizeText(f.mensagem) : "",
    };
    const parsed = schema.safeParse(normalized);
    if (!parsed.success) {
      const errs: Record<string, string> = {};
      parsed.error.issues.forEach((i) => {
        const k = i.path[0] as string;
        if (!errs[k]) errs[k] = i.message;
      });
      setErrors(errs);
      toast.error("Confira os campos destacados.");
      focusFirstInvalid(formRef.current, errs);
      return;
    }
    setF(normalized);
    setErrors({});
    setLoading(true);
    try {
      const { error } = await supabase.from("leads").insert({
        type: "b2c_orcamento",
        nome: parsed.data.nome,
        email: parsed.data.email,
        telefone: parsed.data.telefone,
        cidade: parsed.data.cidade,
        uf: parsed.data.uf,
        mensagem: parsed.data.mensagem || null,
        payload: {
          tipo_projeto: parsed.data.tipo,
        },
        origem: "site/orcamento",
      });
      if (error) throw error;
      setSuccess(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erro desconhecido";
      toast.error("Não foi possível enviar seu pedido.", { description: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Seo
        title="Western — Solicite seu orçamento"
        description="Cascatas, lagos e áreas de lazer sob medida. Fale com o time da Western e receba uma proposta para o seu projeto residencial."
        path="/orcamento"
      />

      <section className="relative bg-western-ivory">
        <div className="container-western py-14 md:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_1fr] gap-10 lg:gap-16 items-start">
            {/* Coluna visual/emocional */}
            <div>
              <div className="relative overflow-hidden rounded-[2px] border border-western-stone-warm/20">
                <img
                  src={heroImage.url}
                  alt="Projeto residencial Western"
                  className="h-[320px] md:h-[440px] w-full object-cover"
                  decoding="async"
                />
                <div
                  aria-hidden="true"
                  className="absolute inset-0 bg-gradient-to-t from-western-green-deep/60 via-transparent to-transparent"
                />
              </div>

              <div className="mt-8">
                <p className="font-mono text-[10px] font-medium uppercase tracking-[0.28em] text-western-gold">
                  Projeto residencial
                </p>
                <h1 className="mt-4 font-display text-3xl md:text-4xl lg:text-5xl leading-[1.08] text-western-green-deep text-balance">
                  Vamos tirar seu projeto do papel.
                </h1>
                <p className="mt-5 text-base md:text-lg leading-relaxed text-western-stone-warm max-w-xl">
                  A Western cria ambientes sob medida com pedra natural — do projeto ao acabamento.
                  Conte um pouco do que você imagina e nosso time retorna com uma proposta.
                </p>

                <ul className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-xl">
                  {[
                    { n: `${BUSINESS.anosOperacao} anos`, l: "de ateliê" },
                    { n: "De Neymar", l: "a resorts" },
                    { n: "Projeto", l: "à execução" },
                  ].map((it) => (
                    <li
                      key={it.n}
                      className="border-l-2 border-western-gold/60 pl-3"
                    >
                      <p className="font-display text-lg text-western-green-deep leading-tight">{it.n}</p>
                      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-western-stone-warm mt-1">
                        {it.l}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Coluna formulário */}
            <div className="lg:sticky lg:top-24">
              {success ? (
                <div className="bg-western-cream border border-western-gold/30 rounded-[2px] p-8 md:p-10 shadow-[0_10px_40px_-20px_rgba(0,0,0,0.25)]">
                  <div className="w-12 h-12 rounded-full bg-western-gold/15 flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6 text-western-gold" aria-hidden="true" />
                  </div>
                  <h2 className="mt-6 font-display text-2xl md:text-3xl text-western-green-deep leading-tight">
                    Recebemos seu projeto.
                  </h2>
                  <p className="mt-4 text-base leading-relaxed text-western-stone-warm">
                    Nosso time comercial entra em contato em breve — normalmente no mesmo dia útil —
                    com uma primeira conversa sobre o seu projeto.
                  </p>
                  <div className="mt-8 flex flex-col sm:flex-row gap-3">
                    <a
                      href={WHATSAPP_URL}
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
                    Solicitar orçamento
                  </p>
                  <h2 className="mt-3 font-display text-2xl md:text-[28px] leading-tight text-western-green-deep">
                    Fale com nosso time
                  </h2>
                  <p className="mt-2 text-sm text-western-stone-warm">
                    Retorno em até 1 dia útil. Sem compromisso.
                  </p>

                  <div className="mt-7 space-y-5">
                    <div>
                      <FieldLabel htmlFor="nome">Nome</FieldLabel>
                      <Input
                        id="nome" name="nome" value={f.nome}
                        onChange={(e) => setField("nome", e.target.value)}
                        maxLength={120} autoComplete="name"
                        aria-invalid={!!errors.nome}
                        className="h-12 rounded-none bg-transparent"
                      />
                      {errors.nome && (
                        <p className="mt-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-red-700/80">{errors.nome}</p>
                      )}
                    </div>

                    <div>
                      <FieldLabel htmlFor="telefone">WhatsApp</FieldLabel>
                      <PhoneInput
                        id="telefone" name="telefone" value={f.telefone}
                        onChange={(v) => setField("telefone", v)}
                        error={errors.telefone}
                        required
                      />
                    </div>

                    <div>
                      <FieldLabel htmlFor="email">E-mail</FieldLabel>
                      <EmailInput
                        id="email" name="email" value={f.email}
                        onChange={(v) => setField("email", v)}
                        error={errors.email}
                        required
                      />
                    </div>

                    <div className="grid grid-cols-[1fr_100px] gap-3">
                      <div>
                        <FieldLabel htmlFor="cidade">Cidade</FieldLabel>
                        <Input
                          id="cidade" name="cidade" value={f.cidade}
                          onChange={(e) => setField("cidade", e.target.value)}
                          maxLength={80} autoComplete="address-level2"
                          aria-invalid={!!errors.cidade}
                          className="h-12 rounded-none bg-transparent"
                        />
                        {errors.cidade && (
                          <p className="mt-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-red-700/80">{errors.cidade}</p>
                        )}
                      </div>
                      <div>
                        <FieldLabel htmlFor="uf">UF</FieldLabel>
                        <select
                          id="uf" name="uf" value={f.uf}
                          onChange={(e) => setField("uf", e.target.value)}
                          aria-invalid={!!errors.uf}
                          className="h-12 w-full bg-transparent border border-western-stone-warm/30 px-3 text-western-green-deep focus:outline-none focus:border-western-gold"
                        >
                          <option value="">—</option>
                          {UF_LIST.map((uf) => (
                            <option key={uf} value={uf}>{uf}</option>
                          ))}
                        </select>
                        {errors.uf && (
                          <p className="mt-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-red-700/80">{errors.uf}</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <FieldLabel htmlFor="tipo">Tipo de projeto</FieldLabel>
                      <select
                        id="tipo" name="tipo" value={f.tipo}
                        onChange={(e) => setField("tipo", e.target.value)}
                        aria-invalid={!!errors.tipo}
                        className="h-12 w-full bg-transparent border border-western-stone-warm/30 px-3 text-western-green-deep focus:outline-none focus:border-western-gold"
                      >
                        <option value="">Selecione…</option>
                        {TIPO_OPTIONS.map((t) => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                      {errors.tipo && (
                        <p className="mt-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-red-700/80">{errors.tipo}</p>
                      )}
                    </div>

                    <div>
                      <FieldLabel htmlFor="mensagem">Mensagem</FieldLabel>
                      <Textarea
                        id="mensagem" name="mensagem" value={f.mensagem}
                        onChange={(e) => setField("mensagem", e.target.value)}
                        maxLength={1000} rows={3}
                        placeholder="Conte um pouco do que você imagina"
                        className="rounded-none bg-transparent border-western-stone-warm/30 focus-visible:ring-0 focus-visible:border-western-gold text-western-green-deep placeholder:text-western-stone-warm/50"
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={loading}
                    className="mt-7 h-14 w-full rounded-none bg-western-gold hover:bg-western-gold/90 text-western-green-deep font-mono text-[12px] uppercase tracking-[0.24em]"
                  >
                    {loading ? (
                      <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Enviando…</>
                    ) : (
                      "Solicitar meu orçamento"
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
        </div>
      </section>
    </>
  );
}
