import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { submitSecureLead } from "@/lib/leads";
import TurnstileWidget from "@/components/security/TurnstileWidget";
import { BUSINESS } from "@/config/business";
import { Loader2, MapPin, Trash2, Plus, ArrowRight } from "lucide-react";
import {
  Popover, PopoverContent, PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import PhoneInput from "@/components/forms/PhoneInput";
import EmailInput from "@/components/forms/EmailInput";
import FieldLabel from "@/components/forms/FieldLabel";
import { phoneBRSchema, emailSchema, UF_LIST, normalizeText, focusFirstInvalid } from "@/lib/forms/br";
import { z } from "zod";

const PERFIS = ["Arquiteto", "Paisagista", "Cliente final", "Lojista", "Construtora", "Outro"];
const HORARIOS = ["09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00"];

/* DS V3 — pele dos campos.
 * 52px de altura (--control-h), cantos 10px, texto 16px (mínimo de UI), borda
 * visível de 1.5px (o público 40+ precisa VER o campo) e fundo claro e quente.
 * Erros em sans 14px semibold — nunca mono, nunca 10px caixa-alta. */
const CONTROL =
  "h-[52px] rounded-[10px] border-[1.5px] border-western-border-strong bg-western-paper px-4 text-[16px] md:text-[16px] text-western-green-deep placeholder:text-western-stone-warm/60 focus:border-western-green-deep";
const CONTROL_ERR = "border-[1.5px] border-[#B3372E]";
const SELECT =
  "h-[52px] w-full rounded-[10px] border-[1.5px] border-western-border-strong bg-western-paper px-4 font-sans text-[16px] text-western-green-deep outline-none transition-colors focus:border-western-green-deep";

/* Os campos compartilhados (EmailInput/PhoneInput) já nascem V3; estas classes
 * só reforçam a borda de erro/normal quando este formulário controla o estado. */
const PHONE_FX = "[&_p]:!font-sans [&_p]:!text-[14px] [&_p]:!normal-case [&_p]:!tracking-normal";

function FieldError({ children }: { children: React.ReactNode }) {
  return (
    <p className="mt-2 font-sans text-[14px] font-semibold leading-snug text-[#B3372E]">
      {children}
    </p>
  );
}

interface Slot { date: Date | null; hora: string }

interface Form {
  nome: string; email: string; telefone: string; perfil: string;
  empresa: string; cidade: string; estado: string;
  pessoas: number;
  slots: Slot[];
  projeto: string;
  aceite: boolean;
}

const INITIAL: Form = {
  nome: "", email: "", telefone: "", perfil: "Arquiteto",
  empresa: "", cidade: "", estado: "",
  pessoas: 2,
  slots: [{ date: null, hora: "" }, { date: null, hora: "" }, { date: null, hora: "" }],
  projeto: "",
  aceite: false,
};

const schema = z.object({
  nome: z.string().trim().min(2, "Informe seu nome").max(120),
  email: emailSchema,
  telefone: phoneBRSchema,
  perfil: z.string(),
  cidade: z.string().trim().min(2, "Cidade").max(80),
  estado: z.enum(UF_LIST as unknown as [string, ...string[]], { message: "UF" }),
  pessoas: z.number().min(1).max(10),
  aceite: z.literal(true, { message: "Aceite os termos" }),
});

export default function AgendarVisita() {
  const [f, setF] = useState<Form>(INITIAL);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const set = <K extends keyof Form>(k: K, v: Form[K]) => setF((p) => ({ ...p, [k]: v }));

  const updateSlot = (i: number, patch: Partial<Slot>) =>
    setF((p) => ({ ...p, slots: p.slots.map((s, idx) => (idx === i ? { ...s, ...patch } : s)) }));

  const isWeekend = (d: Date) => d.getDay() === 0 || d.getDay() === 6;
  const isPast = (d: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return d < today;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const normalized = { ...f, nome: normalizeText(f.nome) };
    const r = schema.safeParse(normalized);
    if (!r.success) {
      const errs: Record<string, string> = {};
      r.error.issues.forEach((i) => (errs[i.path.join(".")] = i.message));
      setErrors(errs);
      toast.error("Confira os campos.");
      focusFirstInvalid(formRef.current, errs);
      return;
    }
    const validSlots = f.slots.filter((s) => s.date && s.hora);
    if (validSlots.length < 1) {
      toast.error("Sugira ao menos uma data e horário.");
      return;
    }
    setF(normalized);
    setErrors({});
    if (!captchaToken) {
      toast.error("Confirme que você não é um robô.");
      return;
    }
    setLoading(true);
    const datasFmt = validSlots
      .map((s) => `${format(s.date!, "dd/MM/yyyy", { locale: ptBR })} às ${s.hora}`)
      .join(" · ");

    const res = await submitSecureLead({
      type: "visita",
      nome: f.nome,
      email: f.email,
      telefone: f.telefone,
      cidade: f.cidade,
      uf: f.estado,
      empresa: f.empresa || null,
      mensagem: f.projeto || null,
      payload: {
        perfil: f.perfil,
        pessoas: f.pessoas,
        datas_preferidas: datasFmt,
        slots: validSlots.map((s) => ({ date: s.date!.toISOString(), hora: s.hora })),
      },
      origem: "site/visitar",
    }, captchaToken);
    setLoading(false);
    setCaptchaToken(null);
    if (!res.ok) {
      toast.error("Não foi possível enviar agora.", { description: res.error });
      return;
    }
    setDone(true);
  };

  if (done) {
    return (
      <div className="surface-ivory">
        <div className="container-western py-24 md:py-32">
          <div className="mx-auto max-w-2xl text-center">
          <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-western-paper">
            <MapPin className="h-7 w-7 text-western-bronze" strokeWidth={1.75} aria-hidden />
          </div>
          <p className="text-eyebrow mb-6">Visita solicitada</p>
          <div className="mx-auto mb-8 h-px w-12 bg-western-gold" />
          <h1 className="display-xl mb-6 text-western-green-deep">
            Recebemos sua solicitação.
          </h1>
          <p className="mx-auto mb-10 max-w-[54ch] text-[17px] leading-[1.6] text-western-stone-warm">
            Em até 1 dia útil retornamos pelo WhatsApp confirmando a melhor data
            entre as que você sugeriu.
          </p>
          <Link to="/" className="btn-primary w-full sm:w-auto">
            Voltar ao catálogo
            <ArrowRight className="h-5 w-5" aria-hidden />
          </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="surface-ivory">
      <div className="container-western py-16 md:py-24">
        <div className="mx-auto max-w-2xl">
        <p className="text-eyebrow mb-5">Visita ao ateliê</p>
        <div className="mb-8 h-px w-12 bg-western-gold" />
        <h1 className="display-xl mb-6 text-western-green-deep">
          Conheça onde a pedra nasce.
        </h1>
        <p className="mb-4 text-[17px] leading-[1.6] text-western-stone-warm md:text-[18px]">
          Recebemos arquitetos, paisagistas e clientes finais com hora marcada — para você
          tocar nos quatro acabamentos, ver as composições montadas em escala e
          conversar com quem produz.
        </p>
        <p className="mb-12 text-[16px] leading-[1.6] text-western-stone-warm">
          {BUSINESS.cidadeAtelie}/{BUSINESS.ufAtelie} · {BUSINESS.horarioAtelie} · Retirada gratuita
        </p>

        <form
          ref={formRef}
          onSubmit={handleSubmit}
          className="space-y-6 rounded-[16px] border border-western-border-soft bg-white p-6 shadow-[0_24px_60px_-32px_rgba(30,40,25,0.28)] md:p-9"
          noValidate
        >
          <div>
            <FieldLabel htmlFor="nome" required>Nome</FieldLabel>
            <Input
              id="nome"
              value={f.nome}
              onChange={(e) => set("nome", e.target.value)}
              required
              aria-invalid={!!errors.nome}
              className={cn(CONTROL, errors.nome && CONTROL_ERR)}
            />
            {errors.nome && <FieldError>{errors.nome}</FieldError>}
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <FieldLabel htmlFor="email" required>E-mail</FieldLabel>
              <EmailInput id="email" value={f.email} onChange={(v) => set("email", v)} required error={errors.email} />
            </div>
            <div className={PHONE_FX}>
              <FieldLabel htmlFor="telefone" required>Telefone (WhatsApp)</FieldLabel>
              <PhoneInput id="telefone" value={f.telefone} onChange={(v) => set("telefone", v)} required error={errors.telefone} />
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <FieldLabel htmlFor="perfil">Perfil</FieldLabel>
              <select
                id="perfil"
                value={f.perfil}
                onChange={(e) => set("perfil", e.target.value)}
                className={SELECT}
              >
                {PERFIS.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <FieldLabel htmlFor="empresa" optional>Empresa / estúdio</FieldLabel>
              <Input
                id="empresa"
                value={f.empresa}
                onChange={(e) => set("empresa", e.target.value)}
                className={CONTROL}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 md:gap-5">
            <div className="col-span-2">
              <FieldLabel htmlFor="cidade" required>Cidade de origem</FieldLabel>
              <Input
                id="cidade"
                value={f.cidade}
                onChange={(e) => set("cidade", e.target.value)}
                required
                aria-invalid={!!errors.cidade}
                className={cn(CONTROL, errors.cidade && CONTROL_ERR)}
              />
              {errors.cidade && <FieldError>{errors.cidade}</FieldError>}
            </div>
            <div>
              <FieldLabel htmlFor="estado" required>UF</FieldLabel>
              <select
                id="estado"
                value={f.estado}
                onChange={(e) => set("estado", e.target.value)}
                required
                aria-invalid={!!errors.estado}
                className={cn(SELECT, "px-3", errors.estado && "border-[#B3372E]")}
              >
                <option value="" disabled>—</option>
                {UF_LIST.map((uf) => <option key={uf} value={uf}>{uf}</option>)}
              </select>
              {errors.estado && <FieldError>{errors.estado}</FieldError>}
            </div>
          </div>

          <div>
            <FieldLabel htmlFor="pessoas" required>Quantas pessoas vêm?</FieldLabel>
            <Input
              id="pessoas"
              type="number"
              min={1}
              max={10}
              value={f.pessoas}
              onChange={(e) => set("pessoas", parseInt(e.target.value || "1", 10))}
              required
              className={cn(CONTROL, "w-32")}
            />
          </div>

          <div className="border-t border-western-border-soft pt-6">
            <FieldLabel hint="Sugira até 3 opções de data e horário (Seg–Sex). Confirmamos a melhor por WhatsApp.">
              Datas preferidas
            </FieldLabel>
            <div className="space-y-3">
              {f.slots.map((slot, i) => (
                <div key={i} className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        className={cn(
                          "h-[52px] w-full justify-start rounded-[10px] border-[1.5px] border-western-border-strong bg-western-paper px-4 text-[16px] font-normal text-western-green-deep hover:border-western-green-deep hover:bg-western-paper sm:flex-1",
                          !slot.date && "text-western-stone-warm",
                        )}
                      >
                        <CalendarIcon className="mr-2 h-5 w-5" strokeWidth={1.75} aria-hidden />
                        {slot.date ? format(slot.date, "EEE, dd 'de' MMM", { locale: ptBR }) : "Escolher data"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto rounded-[10px] p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={slot.date ?? undefined}
                        onSelect={(d) => updateSlot(i, { date: d ?? null })}
                        disabled={(d) => isPast(d) || isWeekend(d)}
                        locale={ptBR}
                        initialFocus
                        className={cn("p-3 pointer-events-auto")}
                      />
                    </PopoverContent>
                  </Popover>

                  <div className="flex items-center gap-3">
                    <select
                      value={slot.hora}
                      onChange={(e) => updateSlot(i, { hora: e.target.value })}
                      aria-label={`Horário da opção ${i + 1}`}
                      className={cn(SELECT, "flex-1 sm:w-[140px] sm:flex-none")}
                    >
                      <option value="">Horário</option>
                      {HORARIOS.map((h) => <option key={h} value={h}>{h}</option>)}
                    </select>
                    {f.slots.length > 1 && (
                      <button
                        type="button"
                        onClick={() => set("slots", f.slots.filter((_, idx) => idx !== i))}
                        className="tap-target flex h-[52px] w-[52px] flex-shrink-0 items-center justify-center rounded-[10px] border border-western-border-soft text-western-stone-warm transition-colors hover:border-[#B3372E] hover:text-[#B3372E]"
                        aria-label={`Remover opção ${i + 1}`}
                      >
                        <Trash2 className="h-5 w-5" strokeWidth={1.75} aria-hidden />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
            {f.slots.length < 3 && (
              <button
                type="button"
                onClick={() => set("slots", [...f.slots, { date: null, hora: "" }])}
                className="tap-target mt-3 inline-flex items-center gap-2 font-sans text-[16px] font-semibold text-western-green-deep transition-colors hover:text-western-cta"
              >
                <Plus className="h-5 w-5" strokeWidth={1.75} aria-hidden />
                Adicionar outra opção
              </button>
            )}
          </div>

          <div>
            <FieldLabel htmlFor="projeto" optional>Tipo de projeto</FieldLabel>
            <Textarea
              id="projeto"
              value={f.projeto}
              onChange={(e) => set("projeto", e.target.value)}
              placeholder="Residencial, hotelaria, comercial — conte um pouco do escopo."
              rows={3}
              className="min-h-[120px] rounded-[10px] border-[1.5px] border-western-border-strong bg-western-paper px-4 py-3 text-[17px] leading-[1.6] text-western-green-deep placeholder:text-western-stone-warm/60 focus-visible:border-western-green-deep focus-visible:ring-0"
            />
          </div>

          <label className="flex cursor-pointer items-start gap-3">
            <input
              type="checkbox"
              checked={f.aceite}
              onChange={(e) => set("aceite", e.target.checked)}
              className="mt-1 h-5 w-5 flex-shrink-0 accent-western-cta"
            />
            <span className="text-[16px] leading-[1.6] text-western-stone-warm">
              Concordo com a{" "}
              <Link
                to="/privacidade"
                className="font-semibold text-western-green-deep underline decoration-western-gold underline-offset-2"
              >
                política de privacidade
              </Link>
              .
            </span>
          </label>
          {errors.aceite && <FieldError>{errors.aceite}</FieldError>}

          <TurnstileWidget
            onToken={setCaptchaToken}
            onExpire={() => setCaptchaToken(null)}
            className="mt-4"
          />

          {/* CTA primário = verde, full-width no mobile. */}
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
                Enviando…
              </>
            ) : (
              "Solicitar visita"
            )}
          </Button>
        </form>
        </div>
      </div>
    </div>
  );
}
