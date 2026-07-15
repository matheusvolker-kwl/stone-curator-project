import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Loader2, ChevronLeft, ChevronRight, MessageCircle, CheckCircle2, AlertTriangle, XCircle, Check, ArrowRight } from "lucide-react";
import { BUSINESS } from "@/config/business";
import PhoneInput from "@/components/forms/PhoneInput";
import CnpjInput from "@/components/forms/CnpjInput";
import EmailInput from "@/components/forms/EmailInput";
import PasswordField from "@/components/forms/PasswordField";
import SegmentoSelect, { SEGMENTOS } from "@/components/forms/SegmentoSelect";
import FieldLabel from "@/components/forms/FieldLabel";
import CartaoCnpjUpload from "@/components/forms/CartaoCnpjUpload";
import SocialProof from "@/components/shared/SocialProof";
import {
  cnpjSchema, phoneBRSchema, emailSchema, passwordSchema,
  normalizeText, focusFirstInvalid, fetchCnpj, isValidCNPJ,
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

/* ——— DS V3 (apresentação) ———
 * Controles de 52px, cantos 10px, texto de UI 16px (nunca menos), borda visível
 * de 1.5px — o público 40+ precisa VER o campo. Erro em sans 14px semibold,
 * nunca mono/caixa-alta de 10px. CTA primário é VERDE e full-width no mobile. */
const CONTROL =
  "h-[52px] w-full rounded-[10px] border-[1.5px] bg-western-paper px-4 font-sans text-[16px] md:text-[16px] leading-normal text-western-green-deep placeholder:text-western-stone-warm/60 transition-colors focus:outline-none focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0";
const CONTROL_OK = "border-western-border-strong focus:border-western-green-deep";
const CONTROL_ERR = "border-[#B3372E] focus:border-[#B3372E]";

const control = (hasError?: boolean) => `${CONTROL} ${hasError ? CONTROL_ERR : CONTROL_OK}`;

function FieldError({ id, children }: { id?: string; children: React.ReactNode }) {
  return (
    <p id={id} role="alert" className="mt-2 font-sans text-[14px] font-semibold leading-snug text-[#B3372E]">
      {children}
    </p>
  );
}

/* Sinais de legitimidade perto da decisão (§12) — todos vindos de BUSINESS. */
const CONFIANCA = [
  "Cadastro gratuito, com aprovação automática para profissionais do ramo",
  `NF-e em todo pedido · garantia de ${BUSINESS.garantiaLabel}`,
  `Ateliê brasileiro desde ${BUSINESS.fundadaEm} · CNPJ ${BUSINESS.cnpj}`,
];

// Etapa 1 = o mínimo para criar a conta e liberar o preço. O credenciamento
// (função `credenciar`) só usa CNPJ + nome + e-mail; o endereço não entra na
// decisão e o Woo já o coleta no checkout — por isso saiu do caminho crítico
// (virou opcional na etapa 2, e a BrasilAPI ainda pré-preenche pelo CNPJ).
const empresaSchema = z.object({
  empresa: z.string().trim().min(2, "Informe a razão social").max(160),
  cnpj: cnpjSchema,
  segmento: z.string().min(1, "Selecione o segmento"),
  segmentoOutro: z.string().optional(),
  site: z.string().max(200).optional(),
  instagram: z.string().max(60).optional(),
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
  const { refresh } = useAuth();

  // Quando o credenciamento APROVA, recarrega o perfil (isApproved vira true).
  // Aí o AuthProvider invalida o catálogo cacheado e o preço de parceiro aparece
  // NA HORA — sem o cliente precisar recarregar a página (era o "delay").
  useEffect(() => {
    if (credResult?.decisao === "aprovado") void refresh();
  }, [credResult, refresh]);
  const navigate = useNavigate();
  const formRef = useRef<HTMLFormElement>(null);

  const set = <K extends keyof Form>(k: K, v: Form[K]) =>
    setF((p) => ({ ...p, [k]: v }));

  // Busca automática de CNPJ (BrasilAPI): preenche razão social + endereço, para
  // o parceiro não digitar. Só preenche campos ainda vazios (não sobrescreve).
  const [cnpjLoading, setCnpjLoading] = useState(false);
  const [cnpjFound, setCnpjFound] = useState(false);
  const lastCnpj = useRef("");

  const lookupCnpj = async (digits: string) => {
    if (digits.length !== 14 || !isValidCNPJ(digits) || lastCnpj.current === digits) return;
    lastCnpj.current = digits;
    setCnpjFound(false);
    setCnpjLoading(true);
    const res = await fetchCnpj(digits);
    setCnpjLoading(false);
    if (!res) return;
    setF((p) => ({
      ...p,
      empresa: p.empresa.trim() || res.razao_social,
      cep: p.cep || res.cep,
      endereco: p.endereco || res.logradouro,
      numero: p.numero || res.numero,
      complemento: p.complemento || res.complemento,
      bairro: p.bairro || res.bairro,
      cidade: p.cidade || res.municipio,
      estado: p.estado || res.uf,
    }));
    setCnpjFound(true);
  };

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
        endereco: f.endereco
          ? `${f.endereco}, ${f.numero}${f.complemento ? " - " + f.complemento : ""} - ${f.bairro}`
          : null,
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
        <div className="container-western py-16 md:py-24 max-w-2xl text-center">
          {d === "aprovado" && <CheckCircle2 className="h-12 w-12 text-[#2E7D4F] mx-auto mb-6" strokeWidth={1.75} aria-hidden="true" />}
          {d === "analise" && <AlertTriangle className="h-12 w-12 text-[#9C6812] mx-auto mb-6" strokeWidth={1.75} aria-hidden="true" />}
          {d === "reprovado" && <XCircle className="h-12 w-12 text-[#B3372E] mx-auto mb-6" strokeWidth={1.75} aria-hidden="true" />}
          {d === "solicitar_cartao" && <AlertTriangle className="h-12 w-12 text-[#9C6812] mx-auto mb-6" strokeWidth={1.75} aria-hidden="true" />}

          <p className="text-eyebrow mb-4">
            {d === "aprovado" && "Cadastro aprovado"}
            {d === "analise" && "Em análise"}
            {d === "reprovado" && "Cadastro recusado"}
            {d === "solicitar_cartao" && "Confirmação necessária"}
          </p>
          <div className="w-12 h-px bg-western-gold mx-auto mb-8" />

          {d === "aprovado" && (
            <>
              <h1 className="display-xl mb-6">Bem-vindo à Western Pro.</h1>
              <p className="text-body mb-10 mx-auto max-w-[46ch]">
                Sua condição B2B já está liberada — o preço de parceiro, os modelos 3D
                e as composições já aparecem pra você. Comece a montar seu pedido.
              </p>
              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-center">
                <Button asChild variant="outline" className="w-full sm:w-auto">
                  <Link to="/minha-conta">Ir para minha conta</Link>
                </Button>
                <Button asChild className="w-full sm:w-auto">
                  <Link to="/linhas">
                    Ver produtos <ArrowRight className="h-5 w-5" aria-hidden="true" />
                  </Link>
                </Button>
              </div>
              <p className="text-meta mt-6">
                Enviamos um e-mail de confirmação — use-o nos próximos acessos.
              </p>
            </>
          )}

          {d === "analise" && (
            <>
              <h1 className="display-lg mb-6">Recebemos sua solicitação.</h1>
              <p className="text-body mb-4 mx-auto max-w-[46ch]">
                Estamos concluindo a validação do seu cadastro e liberamos seu acesso por e-mail em breve.
              </p>
              {credResult.protocolo && (
                <p className="text-meta mb-10">
                  Protocolo:{" "}
                  <span className="font-semibold tabular-nums text-western-green-deep">{credResult.protocolo}</span>
                </p>
              )}
              <Button asChild variant="outline" className="w-full sm:w-auto">
                <Link to="/">Voltar ao catálogo</Link>
              </Button>
            </>
          )}

          {d === "reprovado" && (
            <>
              <h1 className="display-lg mb-6">Não foi possível aprovar agora.</h1>
              <p className="text-body mb-4 mx-auto max-w-[46ch]">
                {credResult.motivo ?? "Sua empresa não atende aos critérios B2B no momento."}
              </p>
              <p className="text-body mb-10 mx-auto max-w-[46ch]">
                Se acredita que houve engano, fale com o comercial pelo WhatsApp.
              </p>
              <Button asChild className="w-full sm:w-auto">
                <a
                  href={`https://wa.me/${BUSINESS.whatsappFabrica}?text=${encodeURIComponent("Olá, gostaria de revisar meu credenciamento B2B.")}`}
                  target="_blank" rel="noopener noreferrer"
                >
                  <MessageCircle aria-hidden="true" /> Falar com o comercial
                </a>
              </Button>
            </>
          )}

          {d === "solicitar_cartao" && (
            <>
              <h1 className="display-lg mb-6">Envie seu Cartão CNPJ.</h1>
              <p className="text-body mb-8 mx-auto max-w-[48ch]">
                As bases públicas não responderam agora. Envie o Cartão CNPJ ou siga para análise manual e concluímos a validação em seguida.
              </p>
              <div className="max-w-md mx-auto text-left space-y-4">
                {newUserId && (
                  <CartaoCnpjUpload
                    userId={newUserId}
                    disabled={cardLoading}
                    onUploaded={(p) => setCardPath(p)}
                  />
                )}
                <div className="flex flex-col-reverse sm:flex-row gap-3">
                  <Button
                    variant="outline"
                    onClick={() => reenviarComCartao(null, true)}
                    disabled={cardLoading}
                    className="w-full sm:w-auto"
                  >
                    Seguir sem enviar agora
                  </Button>
                  <Button
                    onClick={() => reenviarComCartao(cardPath, false)}
                    disabled={!cardPath || cardLoading}
                    className="w-full sm:flex-1"
                  >
                    {cardLoading ? (
                      <>
                        <Loader2 className="animate-spin" aria-hidden="true" /> Enviando…
                      </>
                    ) : (
                      "Enviar para análise"
                    )}
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
      <div className="container-western py-16 md:py-24 max-w-2xl">
        <p className="text-eyebrow mb-5">Cadastro B2B · Aprovação imediata</p>
        <div className="w-12 h-px bg-western-gold mb-8" />
        <h1 className="display-xl mb-6">Solicite acesso de parceiro comercial.</h1>
        <p className="text-body mb-3 max-w-[56ch]">
          A Western atende profissionais e empresas do paisagismo e da construção com CNPJ ativo — de arquitetos e paisagistas a laguistas, jardineiros, garden centers, lojas e construtoras. O acesso à tabela comercial, modelos 3D e composições é liberado automaticamente para profissionais do ramo, na hora do cadastro.
        </p>
        <p className="text-meta mb-8">Grátis · leva menos de 2 minutos · precisa de CNPJ</p>

        {/* Saída para cliente final — WhatsApp */}
        <a
          href={`https://wa.me/${BUSINESS.whatsappFabrica}?text=${encodeURIComponent(
            "Olá Western! Sou cliente final e gostaria de comprar / fazer um projeto com pedras Western."
          )}`}
          target="_blank"
          rel="noopener noreferrer"
          className="group tap-target flex items-center gap-4 rounded-[16px] border border-western-border-soft bg-western-paper p-5 md:p-6 mb-10 transition-colors duration-200 hover:border-western-border-strong hover:bg-western-cream/40"
        >
          <MessageCircle className="h-6 w-6 flex-shrink-0 text-western-bronze" strokeWidth={1.75} aria-hidden="true" />
          <span className="flex-1 min-w-0">
            <span className="block font-sans text-[14px] font-semibold uppercase tracking-[0.06em] text-western-bronze">
              Sou cliente final
            </span>
            <span className="mt-1 block font-sans text-[16px] leading-snug text-western-green-deep">
              Quero fazer um projeto residencial — atendimento direto pelo WhatsApp.
            </span>
          </span>
          <ChevronRight
            className="h-5 w-5 flex-shrink-0 text-western-stone-warm transition-transform group-hover:translate-x-1"
            aria-hidden="true"
          />
        </a>

        {/* Progresso — uma decisão por vez */}
        <div className="mb-10">
          <p className="text-eyebrow mb-3">
            Etapa {step} de 2 · {step === 1 ? "Empresa" : "Responsável e acesso"}
          </p>
          <div className="flex gap-2" aria-hidden="true">
            <span className="h-1.5 flex-1 rounded-[6px] bg-western-cta" />
            <span className={`h-1.5 flex-1 rounded-[6px] ${step >= 2 ? "bg-western-cta" : "bg-western-border-soft"}`} />
          </div>
        </div>

        <form ref={formRef} onSubmit={handleSubmit} className="space-y-6" noValidate>
          {step === 1 && (
            <>
              <div>
                <FieldLabel htmlFor="cnpj" hint="Digite o CNPJ — a gente busca a razão social pra você.">CNPJ</FieldLabel>
                <CnpjInput
                  id="cnpj"
                  value={f.cnpj}
                  onChange={(v) => { set("cnpj", v); setCnpjFound(false); if (v.length === 14) void lookupCnpj(v); }}
                  onBlur={() => void lookupCnpj(f.cnpj)}
                  required
                  error={errors.cnpj}
                />
                {cnpjLoading && (
                  <p className="mt-2 inline-flex items-center gap-2 text-meta">
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> Buscando dados do CNPJ…
                  </p>
                )}
                {cnpjFound && !cnpjLoading && (
                  <p className="mt-2 inline-flex items-center gap-2 text-meta text-western-bronze">
                    <Check className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
                    Razão social e endereço preenchidos pelo CNPJ.
                  </p>
                )}
              </div>

              <div>
                <FieldLabel htmlFor="empresa">Razão social</FieldLabel>
                <Input
                  id="empresa" value={f.empresa} onChange={(e) => set("empresa", e.target.value)} required
                  autoComplete="organization"
                  placeholder="Preenchemos pelo CNPJ — confira ou ajuste"
                  aria-invalid={!!errors.empresa}
                  aria-describedby={errors.empresa ? "empresa-error" : undefined}
                  className={control(!!errors.empresa)}
                />
                {errors.empresa && <FieldError id="empresa-error">{errors.empresa}</FieldError>}
              </div>

              <div>
                <FieldLabel htmlFor="segmento">Segmento de atuação</FieldLabel>
                <SegmentoSelect id="segmento" value={f.segmento} onChange={(v) => set("segmento", v)} required error={errors.segmento} />
                {f.segmento === "Outro" && (
                  <Input
                    id="segmentoOutro"
                    placeholder="Especifique seu segmento"
                    value={f.segmentoOutro}
                    onChange={(e) => set("segmentoOutro", e.target.value)}
                    aria-invalid={!!errors.segmentoOutro}
                    aria-describedby={errors.segmentoOutro ? "segmentoOutro-error" : undefined}
                    className={`mt-3 ${control(!!errors.segmentoOutro)}`}
                  />
                )}
                {errors.segmentoOutro && <FieldError id="segmentoOutro-error">{errors.segmentoOutro}</FieldError>}
              </div>

              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <FieldLabel htmlFor="site" optional>Site</FieldLabel>
                  <Input
                    id="site" placeholder="https://" value={f.site} onChange={(e) => set("site", e.target.value)}
                    inputMode="url" autoComplete="url"
                    className={control()}
                  />
                </div>
                <div>
                  <FieldLabel htmlFor="instagram" optional>Instagram</FieldLabel>
                  <div className="flex items-stretch h-[52px] overflow-hidden rounded-[10px] border-[1.5px] border-western-border-strong bg-western-paper transition-colors focus-within:border-western-green-deep">
                    <span className="px-4 flex items-center font-sans text-[16px] font-medium text-western-stone-warm border-r border-western-border-soft select-none">
                      @
                    </span>
                    <input
                      id="instagram"
                      value={f.instagram.replace(/^@/, "")}
                      onChange={(e) => set("instagram", e.target.value.replace(/^@/, ""))}
                      placeholder="seuestudio"
                      autoComplete="off"
                      className="flex-1 min-w-0 bg-transparent px-4 outline-none font-sans text-[16px] leading-normal text-western-green-deep placeholder:text-western-stone-warm/60"
                    />
                  </div>
                </div>
              </div>

              <p className="text-meta">
                O endereço não é pedido aqui — a gente puxa pelo CNPJ e você
                confirma na hora da entrega.
              </p>

              <Button type="button" onClick={goNext} size="lg" className="w-full mt-4">
                Avançar <ChevronRight aria-hidden="true" />
              </Button>
            </>
          )}

          {step === 2 && (
            <>
              <div>
                <FieldLabel htmlFor="nome">Nome do responsável</FieldLabel>
                <Input
                  id="nome" value={f.nome} onChange={(e) => set("nome", e.target.value)} required
                  autoComplete="name"
                  aria-invalid={!!errors.nome}
                  aria-describedby={errors.nome ? "nome-error" : undefined}
                  className={control(!!errors.nome)}
                />
                {errors.nome && <FieldError id="nome-error">{errors.nome}</FieldError>}
              </div>

              <div>
                <FieldLabel htmlFor="cargo">Cargo</FieldLabel>
                <select
                  id="cargo"
                  value={f.cargo}
                  onChange={(e) => set("cargo", e.target.value)}
                  required
                  aria-invalid={!!errors.cargo}
                  aria-describedby={errors.cargo || errors.cargoOutro ? "cargo-error" : undefined}
                  className={control(!!errors.cargo)}
                >
                  <option value="" disabled>Selecione…</option>
                  {CARGOS.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
                {f.cargo === "Outro" && (
                  <Input
                    id="cargoOutro"
                    placeholder="Especifique o cargo"
                    value={f.cargoOutro}
                    onChange={(e) => set("cargoOutro", e.target.value)}
                    aria-invalid={!!errors.cargoOutro}
                    className={`mt-3 ${control(!!errors.cargoOutro)}`}
                  />
                )}
                {(errors.cargo || errors.cargoOutro) && (
                  <FieldError id="cargo-error">{errors.cargo || errors.cargoOutro}</FieldError>
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

              <div>
                <label htmlFor="aceite" className="flex items-start gap-3 py-2 cursor-pointer">
                  <input
                    id="aceite"
                    type="checkbox"
                    checked={f.aceite}
                    onChange={(e) => set("aceite", e.target.checked)}
                    aria-invalid={!!errors.aceite}
                    aria-describedby={errors.aceite ? "aceite-error" : undefined}
                    className="mt-0.5 h-6 w-6 flex-shrink-0 rounded-[6px] accent-western-cta"
                  />
                  <span className="font-sans text-[16px] leading-relaxed text-western-stone-warm">
                    Li e concordo com a{" "}
                    <Link
                      to="/politica-comercial"
                      className="font-semibold text-western-green-deep underline underline-offset-4 decoration-western-bronze"
                    >
                      política comercial
                    </Link>{" "}
                    e a{" "}
                    <Link
                      to="/privacidade"
                      className="font-semibold text-western-green-deep underline underline-offset-4 decoration-western-bronze"
                    >
                      política de privacidade
                    </Link>.
                  </span>
                </label>
                {errors.aceite && <FieldError id="aceite-error">{errors.aceite}</FieldError>}
              </div>

              {/* CTA primário verde, full-width no mobile; "Voltar" fica abaixo no celular. */}
              <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2">
                <Button
                  type="button"
                  onClick={() => setStep(1)}
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto"
                >
                  <ChevronLeft aria-hidden="true" /> Voltar
                </Button>
                <Button type="submit" disabled={loading} size="lg" className="w-full sm:flex-1">
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin" aria-hidden="true" /> Enviando…
                    </>
                  ) : (
                    "Enviar solicitação"
                  )}
                </Button>
              </div>

              {/* Sinais de confiança perto da decisão */}
              <ul className="space-y-2 pt-2">
                {CONFIANCA.map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-meta leading-snug">
                    <Check className="h-5 w-5 flex-shrink-0 text-western-bronze" strokeWidth={1.75} aria-hidden="true" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </>
          )}

          <p className="font-sans text-[16px] text-western-stone-warm text-center pt-4">
            Já é parceiro?{" "}
            <Link
              to="/parceiro/login"
              className="font-semibold text-western-green-deep underline underline-offset-4 decoration-western-bronze"
            >
              Entrar
            </Link>
          </p>
        </form>

        {/* Prova social perto da conversão (auditoria): quem já especifica
            Western. Reforça a decisão de se cadastrar. */}
        <div className="mt-16 border-t border-western-border-soft pt-12 md:mt-20 md:pt-16">
          <SocialProof
            compact
            variant="light"
            groups={["profissionais", "marcas"]}
            eyebrow="Boa companhia"
            titulo="Arquitetos, paisagistas e marcas que já especificam Western."
          />
        </div>
      </div>
    </div>
  );
}
