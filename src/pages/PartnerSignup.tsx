import { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, ChevronLeft, ChevronRight, MessageCircle, ArrowRight, CheckCircle2, AlertTriangle, XCircle } from "lucide-react";
import { BUSINESS } from "@/config/business";
import PhoneInput from "@/components/forms/PhoneInput";
import CnpjInput from "@/components/forms/CnpjInput";
import CepInput from "@/components/forms/CepInput";
import EmailInput from "@/components/forms/EmailInput";
import PasswordField from "@/components/forms/PasswordField";
import SegmentoSelect, { SEGMENTOS } from "@/components/forms/SegmentoSelect";
import FieldLabel from "@/components/forms/FieldLabel";
import CartaoCnpjUpload from "@/components/forms/CartaoCnpjUpload";
import {
  cnpjSchema, phoneBRSchema, cepSchema, emailSchema, passwordSchema, UF_LIST,
  normalizeText, focusFirstInvalid,
} from "@/lib/forms/br";
import { z } from "zod";

type CredDecisao = "aprovado" | "analise" | "reprovado" | "solicitar_cartao";
interface CredResult {
  decisao: CredDecisao;
  motivo?: string;
  protocolo?: string | null;
  empresa?: string | null;
  situacao?: string | null;
}


const CARGOS = ["Sócio / Diretor", "Arquiteto responsável", "Comprador", "Gerente comercial", "Outro"];

interface Form {
  // empresa
  empresa: string; cnpj: string; segmento: string; segmentoOutro: string;
  site: string; instagram: string;
  cep: string; endereco: string; numero: string; complemento: string; bairro: string;
  cidade: string; estado: string;
  // responsável
  nome: string; cargo: string; cargoOutro: string;
  telefone: string; email: string; senha: string; senha2: string; aceite: boolean;
}

const INITIAL: Form = {
  empresa: "", cnpj: "", segmento: "", segmentoOutro: "",
  site: "", instagram: "",
  cep: "", endereco: "", numero: "", complemento: "", bairro: "",
  cidade: "", estado: "",
  nome: "", cargo: "", cargoOutro: "",
  telefone: "", email: "", senha: "", senha2: "", aceite: false,
};

const empresaSchema = z.object({
  empresa: z.string().trim().min(2, "Informe a razão social").max(160),
  cnpj: cnpjSchema,
  segmento: z.string().min(1, "Selecione o segmento"),
  segmentoOutro: z.string().optional(),
  site: z.string().max(200).optional(),
  instagram: z.string().max(60).optional(),
  cep: cepSchema,
  endereco: z.string().trim().min(2, "Informe o endereço").max(200),
  numero: z.string().trim().min(1, "Número").max(20),
  complemento: z.string().max(80).optional(),
  bairro: z.string().trim().min(2, "Bairro").max(80),
  cidade: z.string().trim().min(2, "Cidade").max(80),
  estado: z.enum(UF_LIST as unknown as [string, ...string[]], { message: "UF" }),
}).refine((v) => v.segmento !== "Outro" || (v.segmentoOutro && v.segmentoOutro.trim().length >= 2), {
  message: "Especifique o segmento",
  path: ["segmentoOutro"],
});

const respSchema = z.object({
  nome: z.string().trim().min(2, "Informe o nome").max(120),
  cargo: z.string().min(1, "Selecione o cargo"),
  cargoOutro: z.string().optional(),
  telefone: phoneBRSchema,
  email: emailSchema,
  senha: passwordSchema,
  senha2: z.string(),
  aceite: z.literal(true, { message: "Aceite os termos" }),
}).refine((v) => v.senha === v.senha2, { message: "As senhas não conferem", path: ["senha2"] })
  .refine((v) => v.cargo !== "Outro" || (v.cargoOutro && v.cargoOutro.trim().length >= 2), {
    message: "Especifique o cargo", path: ["cargoOutro"],
  });

export default function PartnerSignup() {
  const [step, setStep] = useState<1 | 2>(1);
  const [f, setF] = useState<Form>(INITIAL);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [credResult, setCredResult] = useState<CredResult | null>(null);
  const [newUserId, setNewUserId] = useState<string | null>(null);
  const [cardPath, setCardPath] = useState<string | null>(null);
  const [cardLoading, setCardLoading] = useState(false);
  const navigate = useNavigate();
  const formRef = useRef<HTMLFormElement>(null);

  const set = <K extends keyof Form>(k: K, v: Form[K]) =>
    setF((p) => ({ ...p, [k]: v }));

  const goNext = () => {
    const normalized = { ...f, empresa: normalizeText(f.empresa) };
    const r = empresaSchema.safeParse(normalized);
    if (!r.success) {
      const errs: Record<string, string> = {};
      r.error.issues.forEach((i) => (errs[i.path.join(".")] = i.message));
      setErrors(errs);
      toast.error("Confira os campos da empresa.");
      focusFirstInvalid(formRef.current, errs);
      return;
    }
    setF(normalized);
    setErrors({});
    setStep(2);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const callCredenciar = async (userId: string | null, opts: { sem_cartao?: boolean; card_path?: string | null } = {}) => {
    // verify_jwt=true: a função usa o sub do JWT como user_id. Garantimos que há sessão ativa.
    const { data: sess } = await supabase.auth.getSession();
    if (!sess.session) {
      throw new Error(
        "Sua conta foi criada, mas é necessário confirmar o e-mail antes de concluir o credenciamento. " +
        "Acesse o link enviado e faça login para finalizar.",
      );
    }
    const { data, error } = await supabase.functions.invoke<CredResult>("credenciar", {
      body: {
        cnpj: f.cnpj,
        nome: f.nome,
        email: f.email,
        sem_cartao: opts.sem_cartao ?? false,
        card_path: opts.card_path ?? undefined,
      },
    });
    if (error) throw error;
    void userId;
    return data!;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const normalized = { ...f, nome: normalizeText(f.nome) };
    const r = respSchema.safeParse(normalized);
    if (!r.success) {
      const errs: Record<string, string> = {};
      r.error.issues.forEach((i) => (errs[i.path.join(".")] = i.message));
      setErrors(errs);
      toast.error("Confira os dados de acesso.");
      focusFirstInvalid(formRef.current, errs);
      return;
    }
    setF(normalized);
    setErrors({});
    setLoading(true);
    try {
      const segmentoFinal = f.segmento === "Outro" ? `Outro: ${f.segmentoOutro}` : f.segmento;
      const cargoFinal = f.cargo === "Outro" ? `Outro: ${f.cargoOutro}` : f.cargo;

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: f.email,
        password: f.senha,
        options: {
          emailRedirectTo: `${window.location.origin}/parceiro/login`,
          data: {
            nome: f.nome, empresa: f.empresa, cnpj: f.cnpj, segmento: segmentoFinal,
            telefone: f.telefone, cidade: f.cidade, site: f.site,
            cep: f.cep, endereco: f.endereco, numero: f.numero, complemento: f.complemento,
            bairro: f.bairro, estado: f.estado, cargo: cargoFinal, instagram: f.instagram,
          },
        },
      });
      if (authError) throw authError;

      const uid = authData?.user?.id ?? null;
      setNewUserId(uid);

      await supabase.from("leads").insert({
        type: "partner_signup",
        nome: f.nome, email: f.email, telefone: f.telefone, empresa: f.empresa,
        cnpj: f.cnpj, segmento: segmentoFinal, cidade: f.cidade, uf: f.estado,
        endereco: `${f.endereco}, ${f.numero}${f.complemento ? " - " + f.complemento : ""} - ${f.bairro}`,
        cep: f.cep,
        payload: { site: f.site, instagram: f.instagram, cargo: cargoFinal },
        origem: "site/parceiro/cadastro",
      });

      // Credenciamento automático
      const result = await callCredenciar(uid);
      setCredResult(result);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro desconhecido";
      if (msg.toLowerCase().includes("already") || msg.toLowerCase().includes("registered")) {
        toast.error("Este e-mail já está cadastrado.", {
          description: "Use o login ou recupere a senha.",
          action: { label: "Entrar", onClick: () => navigate("/parceiro/login") },
        });
      } else {
        toast.error("Não foi possível concluir o cadastro.", { description: msg });
      }
    } finally {
      setLoading(false);
    }
  };

  const reenviarComCartao = async (path: string | null, semCartao: boolean) => {
    setCardLoading(true);
    try {
      const result = await callCredenciar(newUserId, { card_path: path ?? undefined, sem_cartao: semCartao });
      setCredResult(result);
    } catch (err) {
      toast.error("Falha ao reenviar credenciamento.", { description: err instanceof Error ? err.message : "" });
    } finally {
      setCardLoading(false);
    }
  };

  if (credResult) {
    const d = credResult.decisao;
    return (
      <div className="surface-ivory">
        <div className="container-western py-24 max-w-2xl text-center">
          {d === "aprovado" && <CheckCircle2 className="h-12 w-12 text-western-gold mx-auto mb-6" strokeWidth={1.4} />}
          {(d === "analise") && <AlertTriangle className="h-12 w-12 text-amber-600 mx-auto mb-6" strokeWidth={1.4} />}
          {d === "reprovado" && <XCircle className="h-12 w-12 text-red-700/80 mx-auto mb-6" strokeWidth={1.4} />}
          {d === "solicitar_cartao" && <AlertTriangle className="h-12 w-12 text-amber-600 mx-auto mb-6" strokeWidth={1.4} />}

          <p className="text-eyebrow mb-4">
            {d === "aprovado" && "Cadastro aprovado"}
            {d === "analise" && "Em análise"}
            {d === "reprovado" && "Cadastro recusado"}
            {d === "solicitar_cartao" && "Confirmação necessária"}
          </p>
          <div className="w-12 h-px bg-western-gold mx-auto mb-8" />

          {d === "aprovado" && (
            <>
              <h1 className="font-display text-4xl md:text-5xl text-western-green-deep leading-tight mb-6">
                Bem-vindo à Western Pro.
              </h1>
              <p className="text-western-stone-warm leading-relaxed mb-10">
                Sua condição B2B já está liberada. Confirme seu e-mail e faça login para ver tabela, modelos 3D e composições.
              </p>
              <Link to="/parceiro/login" className="inline-block h-12 px-6 leading-[3rem] bg-western-gold text-western-green-deep font-mono text-xs uppercase tracking-[0.25em]">Acessar minha conta</Link>
            </>
          )}

          {d === "analise" && (
            <>
              <h1 className="font-display text-3xl md:text-4xl text-western-green-deep leading-tight mb-6">
                Recebemos sua solicitação.
              </h1>
              <p className="text-western-stone-warm leading-relaxed mb-4">
                Estamos concluindo a validação do seu cadastro e liberamos seu acesso por e-mail em breve.
              </p>
              {credResult.protocolo && (
                <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-western-stone-warm mb-10">
                  Protocolo: <span className="text-western-green-deep">{credResult.protocolo}</span>
                </p>
              )}
              <Link to="/" className="link-underline text-western-gold font-mono text-xs uppercase tracking-[0.22em]">Voltar ao catálogo</Link>
            </>
          )}

          {d === "reprovado" && (
            <>
              <h1 className="font-display text-3xl md:text-4xl text-western-green-deep leading-tight mb-6">
                Não foi possível aprovar agora.
              </h1>
              <p className="text-western-stone-warm leading-relaxed mb-4">
                {credResult.motivo ?? "Sua empresa não atende aos critérios B2B no momento."}
              </p>
              <p className="text-western-stone-warm leading-relaxed mb-10">
                Se acredita que houve engano, fale com o comercial pelo WhatsApp.
              </p>
              <a
                href={`https://wa.me/${BUSINESS.whatsappFabrica}?text=${encodeURIComponent("Olá, gostaria de revisar meu credenciamento B2B.")}`}
                target="_blank" rel="noopener noreferrer"
                className="inline-block h-12 px-6 leading-[3rem] bg-western-green-deep text-western-cream font-mono text-xs uppercase tracking-[0.25em]"
              >Falar com o comercial</a>
            </>
          )}

          {d === "solicitar_cartao" && (
            <>
              <h1 className="font-display text-3xl md:text-4xl text-western-green-deep leading-tight mb-6">
                Envie seu Cartão CNPJ.
              </h1>
              <p className="text-western-stone-warm leading-relaxed mb-8">
                As bases públicas não responderam agora. Envie o Cartão CNPJ ou siga para análise manual em até 2 dias úteis.
              </p>
              <div className="max-w-md mx-auto text-left space-y-4">
                {newUserId && (
                  <CartaoCnpjUpload
                    userId={newUserId}
                    disabled={cardLoading}
                    onUploaded={(p) => setCardPath(p)}
                  />
                )}
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    onClick={() => reenviarComCartao(cardPath, false)}
                    disabled={!cardPath || cardLoading}
                    className="flex-1 h-12 bg-western-gold text-western-green-deep hover:bg-western-gold/90 font-mono text-xs uppercase tracking-[0.22em] rounded-none disabled:opacity-50"
                  >
                    {cardLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Enviar para análise"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => reenviarComCartao(null, true)}
                    disabled={cardLoading}
                    className="h-12 border-western-stone-warm/30 text-western-green-deep hover:border-western-gold rounded-none font-mono text-xs uppercase tracking-[0.22em]"
                  >
                    Seguir sem enviar agora
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }



  return (
    <div className="surface-ivory">
      <div className="container-western py-20 md:py-28 max-w-2xl">
        <p className="text-eyebrow mb-5">Cadastro B2B</p>
        <div className="w-12 h-px bg-western-gold mb-8" />
        <h1 className="font-display text-4xl md:text-6xl text-western-green-deep leading-[1.05] mb-6">
          Solicite acesso de parceiro.
        </h1>
        <p className="text-western-stone-warm text-lg leading-relaxed mb-8">
          Este site da Western atende exclusivamente arquitetos, paisagistas, construtoras
          e garden centers com CNPJ ativo. O acesso à tabela comercial, modelos 3D e
          composições é liberado automaticamente para profissionais do ramo, na hora do cadastro.
        </p>

        {/* Saída para cliente final — WhatsApp */}
        <a
          href={`https://wa.me/${BUSINESS.whatsappFabrica}?text=${encodeURIComponent(
            "Olá Western! Sou cliente final e gostaria de comprar / fazer um projeto com pedras Western."
          )}`}
          target="_blank"
          rel="noopener noreferrer"
          className="group flex items-center gap-4 border border-western-stone-warm/25 bg-western-paper/60 p-5 md:p-6 mb-10 transition-colors duration-500 hover:border-western-gold/60 hover:bg-western-paper"
        >
          <MessageCircle className="h-5 w-5 text-western-gold flex-shrink-0" strokeWidth={1.4} />
          <div className="flex-1 min-w-0">
            <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-western-gold mb-1">
              Sou cliente final
            </p>
            <p className="text-[14px] md:text-[15px] text-western-green-deep leading-snug">
              Quero fazer um projeto residencial — atendimento direto pelo WhatsApp.
            </p>
          </div>
          <span className="hidden sm:inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.22em] text-western-green-deep link-underline flex-shrink-0">
            Falar no WhatsApp <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
          </span>
          <ArrowRight className="sm:hidden h-4 w-4 text-western-green-deep flex-shrink-0 transition-transform group-hover:translate-x-1" />
        </a>

        {/* Stepper */}
        <div className="flex items-center gap-3 mb-10">
          {[1, 2].map((n) => (
            <div key={n} className="flex items-center gap-3 flex-1">
              <span
                className={`w-8 h-8 flex items-center justify-center font-mono text-xs border ${
                  step >= n
                    ? "bg-western-gold text-western-green-deep border-western-gold"
                    : "border-western-stone-warm/30 text-western-stone-warm"
                }`}
              >
                {n}
              </span>
              <span className={`font-mono text-[11px] uppercase tracking-[0.2em] ${step >= n ? "text-western-green-deep" : "text-western-stone-warm/70"}`}>
                {n === 1 ? "Empresa" : "Responsável & acesso"}
              </span>
              {n === 1 && <div className="flex-1 h-px bg-western-stone-warm/20" />}
            </div>
          ))}
        </div>

        <form ref={formRef} onSubmit={handleSubmit} className="space-y-6" noValidate>
          {step === 1 && (
            <>
              <div>
                <FieldLabel htmlFor="empresa">Razão social</FieldLabel>
                <Input id="empresa" value={f.empresa} onChange={(e) => set("empresa", e.target.value)} required
                  className="h-12 bg-transparent border-western-stone-warm/30 rounded-none focus-visible:border-western-gold" />
                {errors.empresa && <p className="mt-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-red-700/80">{errors.empresa}</p>}
              </div>

              <div>
                <FieldLabel htmlFor="cnpj">CNPJ</FieldLabel>
                <CnpjInput id="cnpj" value={f.cnpj} onChange={(v) => set("cnpj", v)} required error={errors.cnpj} />
              </div>

              <div>
                <FieldLabel htmlFor="segmento">Segmento de atuação</FieldLabel>
                <SegmentoSelect id="segmento" value={f.segmento} onChange={(v) => set("segmento", v)} required error={errors.segmento} />
                {f.segmento === "Outro" && (
                  <Input
                    placeholder="Especifique seu segmento"
                    value={f.segmentoOutro}
                    onChange={(e) => set("segmentoOutro", e.target.value)}
                    className="mt-3 h-12 bg-transparent border-western-stone-warm/30 rounded-none focus-visible:border-western-gold"
                  />
                )}
                {errors.segmentoOutro && <p className="mt-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-red-700/80">{errors.segmentoOutro}</p>}
              </div>

              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <FieldLabel htmlFor="site" optional>Site</FieldLabel>
                  <Input id="site" placeholder="https://" value={f.site} onChange={(e) => set("site", e.target.value)}
                    className="h-12 bg-transparent border-western-stone-warm/30 rounded-none focus-visible:border-western-gold" />
                </div>
                <div>
                  <FieldLabel htmlFor="instagram" optional>Instagram</FieldLabel>
                  <div className="flex items-stretch h-12 border border-western-stone-warm/30 focus-within:border-western-gold transition-colors">
                    <span className="px-3 flex items-center font-mono text-sm text-western-stone-warm border-r border-western-stone-warm/20">@</span>
                    <input
                      id="instagram"
                      value={f.instagram.replace(/^@/, "")}
                      onChange={(e) => set("instagram", e.target.value.replace(/^@/, ""))}
                      placeholder="seuestudio"
                      className="flex-1 bg-transparent px-3 outline-none text-western-green-deep placeholder:text-western-stone-warm/50"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-western-stone-warm/15">
                <p className="text-eyebrow mb-4">Endereço comercial</p>

                <div className="grid sm:grid-cols-3 gap-5">
                  <div className="sm:col-span-1">
                    <FieldLabel htmlFor="cep">CEP</FieldLabel>
                    <CepInput
                      id="cep"
                      value={f.cep}
                      onChange={(v) => set("cep", v)}
                      onResolved={(d) => {
                        setF((p) => ({
                          ...p,
                          endereco: d.logradouro || p.endereco,
                          bairro: d.bairro || p.bairro,
                          cidade: d.localidade || p.cidade,
                          estado: d.uf || p.estado,
                        }));
                      }}
                      focusNextId="numero"
                      required
                      error={errors.cep}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <FieldLabel htmlFor="endereco">Logradouro</FieldLabel>
                    <Input id="endereco" value={f.endereco} onChange={(e) => set("endereco", e.target.value)} required
                      className="h-12 bg-transparent border-western-stone-warm/30 rounded-none focus-visible:border-western-gold" />
                    {errors.endereco && <p className="mt-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-red-700/80">{errors.endereco}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mt-5">
                  <div>
                    <FieldLabel htmlFor="numero">Número</FieldLabel>
                    <Input id="numero" value={f.numero} onChange={(e) => set("numero", e.target.value)} required
                      className="h-12 bg-transparent border-western-stone-warm/30 rounded-none focus-visible:border-western-gold" />
                    {errors.numero && <p className="mt-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-red-700/80">{errors.numero}</p>}
                  </div>
                  <div className="sm:col-span-2">
                    <FieldLabel htmlFor="complemento" optional>Complemento</FieldLabel>
                    <Input id="complemento" value={f.complemento} onChange={(e) => set("complemento", e.target.value)}
                      className="h-12 bg-transparent border-western-stone-warm/30 rounded-none focus-visible:border-western-gold" />
                  </div>
                </div>

                <div className="grid sm:grid-cols-3 gap-5 mt-5">
                  <div>
                    <FieldLabel htmlFor="bairro">Bairro</FieldLabel>
                    <Input id="bairro" value={f.bairro} onChange={(e) => set("bairro", e.target.value)} required
                      className="h-12 bg-transparent border-western-stone-warm/30 rounded-none focus-visible:border-western-gold" />
                    {errors.bairro && <p className="mt-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-red-700/80">{errors.bairro}</p>}
                  </div>
                  <div>
                    <FieldLabel htmlFor="cidade">Cidade</FieldLabel>
                    <Input id="cidade" value={f.cidade} onChange={(e) => set("cidade", e.target.value)} required
                      className="h-12 bg-transparent border-western-stone-warm/30 rounded-none focus-visible:border-western-gold" />
                    {errors.cidade && <p className="mt-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-red-700/80">{errors.cidade}</p>}
                  </div>
                  <div>
                    <FieldLabel htmlFor="estado">UF</FieldLabel>
                    <select
                      id="estado"
                      value={f.estado}
                      onChange={(e) => set("estado", e.target.value)}
                      required
                      className="h-12 w-full bg-transparent border border-western-stone-warm/30 px-3 rounded-none text-western-green-deep focus:outline-none focus:border-western-gold"
                    >
                      <option value="" disabled>—</option>
                      {UF_LIST.map((uf) => <option key={uf} value={uf}>{uf}</option>)}
                    </select>
                    {errors.estado && <p className="mt-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-red-700/80">{errors.estado}</p>}
                  </div>
                </div>
              </div>

              <Button
                type="button"
                onClick={goNext}
                className="w-full h-12 bg-western-green-deep text-western-cream hover:bg-western-green-mid font-mono text-xs uppercase tracking-[0.25em] rounded-none mt-4"
              >
                Avançar <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </>
          )}

          {step === 2 && (
            <>
              <div>
                <FieldLabel htmlFor="nome">Nome do responsável</FieldLabel>
                <Input id="nome" value={f.nome} onChange={(e) => set("nome", e.target.value)} required
                  className="h-12 bg-transparent border-western-stone-warm/30 rounded-none focus-visible:border-western-gold" />
                {errors.nome && <p className="mt-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-red-700/80">{errors.nome}</p>}
              </div>

              <div>
                <FieldLabel htmlFor="cargo">Cargo</FieldLabel>
                <select
                  id="cargo"
                  value={f.cargo}
                  onChange={(e) => set("cargo", e.target.value)}
                  required
                  className="h-12 w-full bg-transparent border border-western-stone-warm/30 px-3 rounded-none text-western-green-deep focus:outline-none focus:border-western-gold"
                >
                  <option value="" disabled>Selecione…</option>
                  {CARGOS.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
                {f.cargo === "Outro" && (
                  <Input placeholder="Especifique o cargo" value={f.cargoOutro} onChange={(e) => set("cargoOutro", e.target.value)}
                    className="mt-3 h-12 bg-transparent border-western-stone-warm/30 rounded-none focus-visible:border-western-gold" />
                )}
                {(errors.cargo || errors.cargoOutro) && (
                  <p className="mt-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-red-700/80">{errors.cargo || errors.cargoOutro}</p>
                )}
              </div>

              <div>
                <FieldLabel htmlFor="telefone" hint="Usaremos para falar com você no WhatsApp.">Telefone celular</FieldLabel>
                <PhoneInput id="telefone" value={f.telefone} onChange={(v) => set("telefone", v)} required error={errors.telefone} />
              </div>

              <div>
                <FieldLabel htmlFor="email">E-mail corporativo</FieldLabel>
                <EmailInput id="email" value={f.email} onChange={(v) => set("email", v)} required error={errors.email} />
              </div>

              <div>
                <FieldLabel htmlFor="senha">Senha</FieldLabel>
                <PasswordField id="senha" value={f.senha} onChange={(v) => set("senha", v)} required error={errors.senha} />
              </div>

              <div>
                <FieldLabel htmlFor="senha2">Confirmar senha</FieldLabel>
                <PasswordField id="senha2" value={f.senha2} onChange={(v) => set("senha2", v)} required error={errors.senha2} showStrength={false} />
              </div>

              <label className="flex items-start gap-3 pt-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={f.aceite}
                  onChange={(e) => set("aceite", e.target.checked)}
                  className="mt-1 h-4 w-4 accent-western-gold flex-shrink-0"
                />
                <span className="text-spec text-western-stone-warm leading-relaxed">
                  Li e concordo com a{" "}
                  <Link to="/politica-comercial" className="link-underline text-western-gold">política comercial</Link>{" "}
                  e a{" "}
                  <Link to="/privacidade" className="link-underline text-western-gold">política de privacidade</Link>.
                </span>
              </label>
              {errors.aceite && <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-red-700/80">{errors.aceite}</p>}

              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  onClick={() => setStep(1)}
                  variant="outline"
                  className="h-12 px-5 border-western-stone-warm/30 text-western-green-deep hover:border-western-gold rounded-none font-mono text-xs uppercase tracking-[0.22em]"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" /> Voltar
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex-1 h-12 bg-western-gold text-western-green-deep hover:bg-western-gold/90 font-mono text-xs uppercase tracking-[0.25em] rounded-none disabled:opacity-60"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Enviar solicitação"}
                </Button>
              </div>
            </>
          )}

          <p className="text-spec text-western-stone-warm text-center pt-4">
            Já é parceiro?{" "}
            <Link to="/parceiro/login" className="link-underline text-western-gold">
              Entrar
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
