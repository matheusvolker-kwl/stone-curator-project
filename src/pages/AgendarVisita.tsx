import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { submitSecureLead } from "@/lib/leads";
import TurnstileWidget from "@/components/security/TurnstileWidget";
import { BUSINESS } from "@/config/business";
import { Loader2, MapPin, Trash2, Plus } from "lucide-react";
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
import { useRef } from "react";

const PERFIS = ["Arquiteto", "Paisagista", "Cliente final", "Lojista", "Construtora", "Outro"];
const HORARIOS = ["09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00"];

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
        <div className="container-western py-32 max-w-2xl text-center">
          <MapPin className="h-10 w-10 text-western-gold mx-auto mb-6" />
          <p className="text-eyebrow mb-6">Visita solicitada</p>
          <div className="w-12 h-px bg-western-gold mx-auto mb-8" />
          <h1 className="font-display text-4xl md:text-5xl text-western-green-deep leading-tight mb-6">
            Recebemos sua solicitação.
          </h1>
          <p className="text-western-stone-warm leading-relaxed mb-10">
            Em até 1 dia útil retornamos pelo WhatsApp confirmando a melhor data
            entre as que você sugeriu.
          </p>
          <Link to="/" className="link-underline text-western-gold font-mono text-xs uppercase tracking-[0.22em]">
            Voltar ao catálogo
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="surface-ivory">
      <div className="container-western py-20 md:py-28 max-w-2xl">
        <p className="text-eyebrow mb-5">Visita ao ateliê</p>
        <div className="w-12 h-px bg-western-gold mb-8" />
        <h1 className="font-display text-4xl md:text-6xl text-western-green-deep leading-[1.05] mb-6">
          Conheça onde<br />a pedra nasce.
        </h1>
        <p className="text-western-stone-warm text-lg leading-relaxed mb-4">
          Recebemos arquitetos, paisagistas e clientes finais com hora marcada — para você
          tocar nos quatro acabamentos, ver as composições montadas em escala e
          conversar com quem produz.
        </p>
        <p className="text-spec text-western-stone-warm mb-12 uppercase tracking-[0.18em]">
          {BUSINESS.cidadeAtelie}/{BUSINESS.ufAtelie} · {BUSINESS.horarioAtelie} · Retirada gratuita
        </p>

        <form ref={formRef} onSubmit={handleSubmit} className="space-y-6" noValidate>
          <div>
            <FieldLabel htmlFor="nome">Nome</FieldLabel>
            <Input id="nome" value={f.nome} onChange={(e) => set("nome", e.target.value)} required
              className="h-12 bg-transparent border-western-stone-warm/30 rounded-none focus-visible:border-western-gold" />
            {errors.nome && <p className="mt-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-red-700/80">{errors.nome}</p>}
          </div>

          <div className="grid sm:grid-cols-2 gap-5">
            <div>
              <FieldLabel htmlFor="email">E-mail</FieldLabel>
              <EmailInput id="email" value={f.email} onChange={(v) => set("email", v)} required error={errors.email} />
            </div>
            <div>
              <FieldLabel htmlFor="telefone">Telefone (WhatsApp)</FieldLabel>
              <PhoneInput id="telefone" value={f.telefone} onChange={(v) => set("telefone", v)} required error={errors.telefone} />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-5">
            <div>
              <FieldLabel htmlFor="perfil">Perfil</FieldLabel>
              <select id="perfil" value={f.perfil} onChange={(e) => set("perfil", e.target.value)}
                className="h-12 w-full bg-transparent border border-western-stone-warm/30 px-3 rounded-none text-western-green-deep focus:outline-none focus:border-western-gold">
                {PERFIS.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <FieldLabel htmlFor="empresa" optional>Empresa / estúdio</FieldLabel>
              <Input id="empresa" value={f.empresa} onChange={(e) => set("empresa", e.target.value)}
                className="h-12 bg-transparent border-western-stone-warm/30 rounded-none focus-visible:border-western-gold" />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-5">
            <div className="col-span-2">
              <FieldLabel htmlFor="cidade">Cidade de origem</FieldLabel>
              <Input id="cidade" value={f.cidade} onChange={(e) => set("cidade", e.target.value)} required
                className="h-12 bg-transparent border-western-stone-warm/30 rounded-none focus-visible:border-western-gold" />
              {errors.cidade && <p className="mt-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-red-700/80">{errors.cidade}</p>}
            </div>
            <div>
              <FieldLabel htmlFor="estado">UF</FieldLabel>
              <select id="estado" value={f.estado} onChange={(e) => set("estado", e.target.value)} required
                className="h-12 w-full bg-transparent border border-western-stone-warm/30 px-3 rounded-none text-western-green-deep focus:outline-none focus:border-western-gold">
                <option value="" disabled>—</option>
                {UF_LIST.map((uf) => <option key={uf} value={uf}>{uf}</option>)}
              </select>
              {errors.estado && <p className="mt-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-red-700/80">{errors.estado}</p>}
            </div>
          </div>

          <div>
            <FieldLabel htmlFor="pessoas">Quantas pessoas vêm?</FieldLabel>
            <Input id="pessoas" type="number" min={1} max={10} value={f.pessoas} onChange={(e) => set("pessoas", parseInt(e.target.value || "1", 10))} required
              className="h-12 bg-transparent border-western-stone-warm/30 rounded-none focus-visible:border-western-gold w-32" />
          </div>

          <div className="pt-4 border-t border-western-stone-warm/15">
            <FieldLabel hint="Sugira até 3 opções de data e horário (Seg–Sex). Confirmamos a melhor por WhatsApp.">
              Datas preferidas
            </FieldLabel>
            <div className="space-y-3">
              {f.slots.map((slot, i) => (
                <div key={i} className="grid grid-cols-[1fr_auto_auto] gap-3 items-center">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        className={cn(
                          "h-11 justify-start text-left font-normal border-western-stone-warm/30 rounded-none bg-transparent text-western-green-deep hover:border-western-gold hover:bg-transparent",
                          !slot.date && "text-western-stone-warm/60"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {slot.date ? format(slot.date, "EEE, dd 'de' MMM", { locale: ptBR }) : "Escolher data"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
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
                  <select
                    value={slot.hora}
                    onChange={(e) => updateSlot(i, { hora: e.target.value })}
                    className="h-11 bg-transparent border border-western-stone-warm/30 px-3 rounded-none text-western-green-deep focus:outline-none focus:border-western-gold"
                  >
                    <option value="">Horário</option>
                    {HORARIOS.map((h) => <option key={h} value={h}>{h}</option>)}
                  </select>
                  {f.slots.length > 1 && (
                    <button
                      type="button"
                      onClick={() => set("slots", f.slots.filter((_, idx) => idx !== i))}
                      className="h-11 w-11 flex items-center justify-center text-western-stone-warm hover:text-red-700"
                      aria-label="Remover"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            {f.slots.length < 3 && (
              <button
                type="button"
                onClick={() => set("slots", [...f.slots, { date: null, hora: "" }])}
                className="mt-3 inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.22em] text-western-gold hover:text-western-green-deep"
              >
                <Plus className="h-3 w-3" /> Adicionar outra opção
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
              className="bg-transparent border-western-stone-warm/30 rounded-none text-western-green-deep focus-visible:border-western-gold"
            />
          </div>

          <label className="flex items-start gap-3 cursor-pointer">
            <input type="checkbox" checked={f.aceite} onChange={(e) => set("aceite", e.target.checked)}
              className="mt-1 h-4 w-4 accent-western-gold flex-shrink-0" />
            <span className="text-spec text-western-stone-warm leading-relaxed">
              Concordo com a <Link to="/privacidade" className="link-underline text-western-gold">política de privacidade</Link>.
            </span>
          </label>
          {errors.aceite && <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-red-700/80">{errors.aceite}</p>}

          <Button
            type="submit"
            disabled={loading}
            className="w-full h-12 bg-western-gold text-western-green-deep hover:bg-western-gold/90 font-mono text-xs uppercase tracking-[0.25em] rounded-none disabled:opacity-60"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Solicitar visita"}
          </Button>
        </form>
      </div>
    </div>
  );
}
