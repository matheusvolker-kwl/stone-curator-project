import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import PhoneInput from "@/components/forms/PhoneInput";
import CnpjInput from "@/components/forms/CnpjInput";
import CepInput from "@/components/forms/CepInput";
import EmailInput from "@/components/forms/EmailInput";
import {
  cnpjSchema, phoneBRSchema, cepSchema, emailSchema, UF_LIST,
  normalizeText, focusFirstInvalid,
} from "@/lib/forms/br";
import { EstadoCarregando, EstadoErro, EstadoVazio, PageHeader } from "@/components/backoffice";
import { z } from "zod";

/**
 * DADOS DA EMPRESA — a ficha cadastral do parceiro.
 *
 * OS 4 ESTADOS: carregando · vazio · ERRO · sucesso.
 *
 * BUG QUE ESTAVA AQUI (corrigido): o load era `.then(({ data }) => …)` — o erro
 * era ENGOLIDO. Se a leitura falhasse (RLS, rede), o formulário ficava em branco,
 * o parceiro clicava "Salvar" e o UPDATE sobrescrevia o cadastro inteiro com
 * strings vazias. Uma tela de erro virava perda de dados.
 * Agora: se a leitura falha, o formulário NÃO é renderizado — só o erro + "Tentar
 * de novo". Não há como salvar por cima do que não foi lido.
 */

interface Form {
  nome: string; empresa: string; cnpj: string; segmento: string; telefone: string;
  email: string;
  cidade: string; estado: string; site: string; instagram: string; cargo: string;
  cep: string; endereco: string; numero: string; complemento: string; bairro: string;
}

const EMPTY: Form = {
  nome: "", empresa: "", cnpj: "", segmento: "", telefone: "", email: "",
  cidade: "", estado: "", site: "", instagram: "", cargo: "",
  cep: "", endereco: "", numero: "", complemento: "", bairro: "",
};

const schema = z.object({
  empresa: z.string().transform(normalizeText).pipe(z.string().min(2, "Informe a razão social").max(160)),
  cnpj: cnpjSchema,
  segmento: z.string().max(80).optional().or(z.literal("")),
  nome: z.string().transform(normalizeText).pipe(z.string().min(2, "Informe o responsável").max(120)),
  cargo: z.string().max(60).optional().or(z.literal("")),
  telefone: phoneBRSchema,
  email: emailSchema.optional().or(z.literal("")),
  site: z.string().max(200).optional().or(z.literal("")),
  instagram: z.string().max(60).optional().or(z.literal("")),
  cep: cepSchema.optional().or(z.literal("")),
  endereco: z.string().max(200).optional().or(z.literal("")),
  numero: z.string().max(20).optional().or(z.literal("")),
  complemento: z.string().max(80).optional().or(z.literal("")),
  bairro: z.string().max(80).optional().or(z.literal("")),
  cidade: z.string().max(80).optional().or(z.literal("")),
  estado: z.union([z.enum(UF_LIST as unknown as [string, ...string[]]), z.literal("")]).optional(),
});

export default function AccountProfile() {
  const { user, partnerStatus, refresh } = useAuth();

  const [form, setForm] = useState<Form>(EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<unknown>(null);
  const [temCadastro, setTemCadastro] = useState(false);
  const [saving, setSaving] = useState(false);
  const [confirmarOpen, setConfirmarOpen] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const set = <K extends keyof Form>(k: K, v: Form[K]) => setForm((p) => ({ ...p, [k]: v }));

  const carregar = useCallback(async () => {
    if (!user) return;
    setCarregando(true);
    setErro(null);

    const { data, error } = await supabase
      .from("partner_profiles")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (error) {
      // Nunca engolir. Sem isto o formulário abriria em branco e o "Salvar"
      // apagaria o cadastro.
      setErro(error);
      setTemCadastro(false);
      setCarregando(false);
      return;
    }

    if (!data) {
      setTemCadastro(false);
      setCarregando(false);
      return;
    }

    const next = { ...EMPTY };
    for (const k of Object.keys(EMPTY) as (keyof Form)[]) {
      next[k] = ((data as Record<string, unknown>)[k] as string) ?? "";
    }
    setForm(next);
    setTemCadastro(true);
    setCarregando(false);
  }, [user]);

  useEffect(() => {
    void carregar();
  }, [carregar]);

  /** Valida e, se estiver tudo certo, pede confirmação — porque salvar tem preço. */
  const submeter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !temCadastro) return;

    const r = schema.safeParse(form);
    if (!r.success) {
      const errs: Record<string, string> = {};
      r.error.issues.forEach((i) => (errs[i.path.join(".")] = i.message));
      setErrors(errs);
      toast.error("Confira os campos destacados.");
      focusFirstInvalid(formRef.current, errs);
      return;
    }
    setErrors({});
    setConfirmarOpen(true);
  };

  const salvar = async () => {
    if (!user) return;
    setConfirmarOpen(false);
    setSaving(true);

    const { email: _omit, ...persist } = form;
    void _omit;

    // REGRA DE NEGÓCIO (preservada): editar dados cadastrais dispara reanálise.
    // O credenciamento e o tier ficam intactos no banco; só o status volta a
    // "pending" até a revisão humana.
    const { data, error } = await supabase
      .from("partner_profiles")
      .update({
        ...persist,
        empresa: normalizeText(form.empresa),
        nome: normalizeText(form.nome),
        status: "pending",
        pending_reason: "Cadastro editado pelo parceiro — aguardando reanálise.",
      })
      .eq("user_id", user.id)
      .select("id");

    setSaving(false);

    if (error) {
      toast.error("Não consegui salvar", { description: error.message });
      return;
    }

    // Um UPDATE que não acerta nenhuma linha volta SEM erro e com lista vazia.
    // Sem esta checagem, a tela cantava "Perfil atualizado" e nada tinha sido gravado.
    if (!data || data.length === 0) {
      toast.error("Nada foi salvo", {
        description: "Não localizamos o seu cadastro para atualizar. Fale com a nossa equipe.",
      });
      return;
    }

    toast.success("Dados atualizados.", {
      description: "Enviamos o cadastro para reanálise da nossa equipe.",
    });
    await refresh();
    await carregar();
  };

  /* ── Os 4 estados ─────────────────────────────────────────────── */

  if (carregando) {
    return (
      <div>
        <PageHeader eyebrow="Minha conta" titulo="Dados da empresa" />
        <div className="rounded-2xl border border-western-border-soft bg-white">
          <EstadoCarregando linhas={8} />
        </div>
      </div>
    );
  }

  if (erro) {
    return (
      <div>
        <PageHeader eyebrow="Minha conta" titulo="Dados da empresa" />
        <EstadoErro
          erro={erro}
          onRetry={carregar}
          titulo="Não consegui carregar o seu cadastro"
        />
        <p className="text-meta mt-4">
          Não mostramos o formulário em branco de propósito: salvar por cima de um cadastro que não
          conseguimos ler apagaria os seus dados.
        </p>
      </div>
    );
  }

  if (!temCadastro) {
    return (
      <div>
        <PageHeader eyebrow="Minha conta" titulo="Dados da empresa" />
        <EstadoVazio
          titulo="Não localizamos o cadastro da sua empresa"
          mensagem="Sua conta existe, mas a ficha da empresa não veio. Isso costuma ser um tropeço nosso — a equipe resolve rápido."
          acao={
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link to="/contato" className="btn-primary">
                Falar com a equipe
              </Link>
              <button type="button" onClick={carregar} className="btn-outline-forest">
                Tentar de novo
              </button>
            </div>
          }
        />
      </div>
    );
  }

  /* ── Sucesso ──────────────────────────────────────────────────── */

  const eraAprovado = partnerStatus === "approved";

  return (
    <div>
      <PageHeader
        eyebrow="Meu perfil"
        titulo="Dados da empresa"
        subtitulo="É com estes dados que emitimos nota, calculamos o frete e liberamos o seu preço de parceiro."
        /* Preferências saiu do menu (arquitetura 2026-07-18) e mora aqui dentro. */
        acao={
          <Link to="/minha-conta/preferencias" className="btn-outline-forest tap-target">
            Preferências
          </Link>
        }
      />

      {eraAprovado && (
        <p className="text-body mb-8 max-w-3xl rounded-lg border border-status-warning/30 bg-status-warning/[0.06] px-4 py-3 text-western-stone-dark">
          <strong className="font-semibold text-western-green-deep">Atenção:</strong> alterar a ficha
          cadastral envia a sua empresa para reanálise. O preço de parceiro fica suspenso até a
          equipe revisar — normalmente 1 dia útil.
        </p>
      )}

      {/*
        Os campos com máscara (CNPJ, telefone, CEP, e-mail) trazem a própria
        altura e o próprio raio embutidos, e não aceitam className. Harmonizamos
        daqui, pelo seletor descendente — sem tocar em arquivo alheio e sem mexer
        na borda, para não atropelar o vermelho do estado de erro deles.
      */}
      <form
        ref={formRef}
        onSubmit={submeter}
        noValidate
        className="grid max-w-3xl grid-cols-1 gap-5 md:grid-cols-2 [&_input]:h-control [&_input]:rounded-sm"
      >
        <Field full label="Razão social" id="empresa" error={errors.empresa}>
          <Input id="empresa" value={form.empresa} onChange={(e) => set("empresa", e.target.value)} className={INPUT_CLS} />
        </Field>

        <Field label="CNPJ" id="cnpj" error={errors.cnpj}>
          <CnpjInput id="cnpj" value={form.cnpj} onChange={(v) => set("cnpj", v)} error={errors.cnpj} />
        </Field>

        <Field label="Segmento" id="segmento" error={errors.segmento}>
          <Input id="segmento" value={form.segmento} onChange={(e) => set("segmento", e.target.value)} className={INPUT_CLS} />
        </Field>

        <Field full label="Responsável" id="nome" error={errors.nome}>
          <Input id="nome" value={form.nome} onChange={(e) => set("nome", e.target.value)} className={INPUT_CLS} />
        </Field>

        <Field label="Cargo" id="cargo" error={errors.cargo}>
          <Input id="cargo" value={form.cargo} onChange={(e) => set("cargo", e.target.value)} className={INPUT_CLS} />
        </Field>

        <Field label="Telefone" id="telefone" error={errors.telefone}>
          <PhoneInput id="telefone" value={form.telefone} onChange={(v) => set("telefone", v)} error={errors.telefone} />
        </Field>

        <Field label="E-mail de contato" id="email" error={errors.email}>
          <EmailInput id="email" value={form.email} onChange={(v) => set("email", v)} error={errors.email} />
        </Field>

        <Field label="Site" id="site" error={errors.site}>
          <Input id="site" placeholder="https://" value={form.site} onChange={(e) => set("site", e.target.value)} className={INPUT_CLS} />
        </Field>

        <Field label="Instagram" id="instagram" error={errors.instagram}>
          <Input id="instagram" value={form.instagram} onChange={(e) => set("instagram", e.target.value.replace(/^@/, ""))} className={INPUT_CLS} />
        </Field>

        <Field label="CEP" id="cep" error={errors.cep}>
          <CepInput
            id="cep"
            value={form.cep}
            onChange={(v) => set("cep", v)}
            onResolved={(d) => setForm((p) => ({
              ...p,
              endereco: d.logradouro || p.endereco,
              bairro: d.bairro || p.bairro,
              cidade: d.localidade || p.cidade,
              estado: d.uf || p.estado,
            }))}
            focusNextId="numero"
            error={errors.cep}
          />
        </Field>

        <Field full label="Endereço" id="endereco" error={errors.endereco}>
          <Input id="endereco" value={form.endereco} onChange={(e) => set("endereco", e.target.value)} className={INPUT_CLS} />
        </Field>

        <Field label="Número" id="numero" error={errors.numero}>
          <Input id="numero" value={form.numero} onChange={(e) => set("numero", e.target.value)} className={INPUT_CLS} />
        </Field>

        <Field label="Complemento" id="complemento" error={errors.complemento}>
          <Input id="complemento" value={form.complemento} onChange={(e) => set("complemento", e.target.value)} className={INPUT_CLS} />
        </Field>

        <Field label="Bairro" id="bairro" error={errors.bairro}>
          <Input id="bairro" value={form.bairro} onChange={(e) => set("bairro", e.target.value)} className={INPUT_CLS} />
        </Field>

        <Field label="Cidade" id="cidade" error={errors.cidade}>
          <Input id="cidade" value={form.cidade} onChange={(e) => set("cidade", e.target.value)} className={INPUT_CLS} />
        </Field>

        <Field label="UF" id="estado" error={errors.estado}>
          <select
            id="estado"
            value={form.estado}
            onChange={(e) => set("estado", e.target.value)}
            aria-invalid={!!errors.estado}
            className="h-control w-full rounded-sm border border-western-border-strong bg-white px-3 text-[16px] text-western-green-deep transition-colors focus:border-western-green-deep focus:outline-none"
          >
            <option value="">—</option>
            {UF_LIST.map((uf) => <option key={uf} value={uf}>{uf}</option>)}
          </select>
        </Field>

        {/* A ÚNICA ação primária da tela. Verde. */}
        <div className="md:col-span-2">
          <button type="submit" disabled={saving} className="btn-primary w-full sm:w-auto">
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                Salvando…
              </>
            ) : (
              "Salvar alterações"
            )}
          </button>
        </div>
      </form>

      {/* Confirmação: salvar aqui tem consequência comercial. Nunca por acidente. */}
      <AlertDialog open={confirmarOpen} onOpenChange={setConfirmarOpen}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="display-md text-western-green-deep">
              {eraAprovado ? "Isto envia a sua empresa para reanálise" : "Confirmar alterações"}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-[17px] leading-[1.6] text-western-stone-warm">
              {eraAprovado ? (
                <>
                  Ao salvar, o seu credenciamento volta para a fila de análise e o{" "}
                  <strong className="font-semibold text-western-green-deep">
                    preço de parceiro fica suspenso
                  </strong>{" "}
                  até a equipe revisar — normalmente 1 dia útil. Seu nível e o seu desconto não são
                  perdidos.
                </>
              ) : (
                <>
                  Vamos gravar os novos dados e mandar o seu cadastro para a análise da equipe.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          {/*
            Sem .btn-* aqui de propósito: AlertDialogAction/Cancel já aplicam
            buttonVariants(), cujas UTILITIES vencem as classes de @layer
            components na cascata. No V3 o variant default já é verde e o outline
            já é o btn-outline-forest — então o certo é confiar neles.
          */}
          <AlertDialogFooter>
            <AlertDialogCancel className="mt-0">Voltar e revisar</AlertDialogCancel>
            <AlertDialogAction onClick={salvar}>Salvar e enviar para análise</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

const INPUT_CLS =
  "h-control rounded-sm border-western-border-strong bg-white px-3 text-[16px] text-western-green-deep placeholder:text-western-stone-warm/50 focus-visible:border-western-green-deep focus-visible:ring-0 focus-visible:ring-offset-0";

function Field({
  label, id, error, full, children,
}: {
  label: string; id: string; error?: string; full?: boolean; children: React.ReactNode;
}) {
  return (
    <div className={full ? "md:col-span-2" : ""}>
      <Label htmlFor={id} className="mb-2 block text-[14px] font-semibold text-western-stone-dark">
        {label}
      </Label>
      {children}
      {error && (
        <p id={`${id}-error`} className="mt-1.5 text-[14px] font-semibold text-status-error">
          {error}
        </p>
      )}
    </div>
  );
}
