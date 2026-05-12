import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Package, Info, Lock, UserCircle2 } from "lucide-react";
import PhoneInput from "@/components/forms/PhoneInput";
import EmailInput from "@/components/forms/EmailInput";
import CepInput from "@/components/forms/CepInput";
import FieldLabel from "@/components/forms/FieldLabel";
import { emailSchema, phoneBRSchema, cepSchema, UF_LIST } from "@/lib/forms/br";
import { z } from "zod";
import { useAuth } from "@/hooks/useAuth";

const PERFIS = ["Arquiteto", "Paisagista", "Lojista", "Construtora", "Cliente final"];

interface Form {
  nome: string; email: string; telefone: string; perfil: string;
  empresa: string;
  cep: string; endereco: string; numero: string; complemento: string;
  bairro: string; cidade: string; estado: string;
  projeto: string;
  aceite: boolean;
}

const INITIAL: Form = {
  nome: "", email: "", telefone: "", perfil: "Arquiteto",
  empresa: "",
  cep: "", endereco: "", numero: "", complemento: "",
  bairro: "", cidade: "", estado: "",
  projeto: "",
  aceite: false,
};

const schema = z.object({
  nome: z.string().trim().min(2, "Informe seu nome").max(120),
  email: emailSchema,
  telefone: phoneBRSchema,
  cep: cepSchema,
  endereco: z.string().trim().min(2, "Endereço").max(200),
  numero: z.string().trim().min(1, "Número").max(20),
  bairro: z.string().trim().min(2, "Bairro").max(80),
  cidade: z.string().trim().min(2, "Cidade").max(80),
  estado: z.enum(UF_LIST as unknown as [string, ...string[]], { message: "UF" }),
  aceite: z.literal(true, { message: "Aceite os termos" }),
});

export default function PedirAmostras() {
  const { user } = useAuth();
  const [f, setF] = useState<Form>(INITIAL);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [profileLoaded, setProfileLoaded] = useState(false);

  const set = <K extends keyof Form>(k: K, v: Form[K]) => setF((p) => ({ ...p, [k]: v }));

  // Pré-preencher com dados do perfil quando logado
  useEffect(() => {
    if (!user) { setProfileLoaded(false); return; }
    (async () => {
      const { data } = await supabase
        .from("partner_profiles")
        .select("nome, telefone, empresa, cep, endereco, numero, complemento, bairro, cidade, estado, segmento")
        .eq("user_id", user.id)
        .maybeSingle();
      setF((p) => ({
        ...p,
        nome: data?.nome || p.nome,
        email: user.email || p.email,
        telefone: data?.telefone || p.telefone,
        empresa: data?.empresa || p.empresa,
        cep: data?.cep || p.cep,
        endereco: data?.endereco || p.endereco,
        numero: data?.numero || p.numero,
        complemento: data?.complemento || p.complemento,
        bairro: data?.bairro || p.bairro,
        cidade: data?.cidade || p.cidade,
        estado: data?.estado || p.estado,
      }));
      setProfileLoaded(true);
    })();
  }, [user]);

  const isLocked = !!user && profileLoaded;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const r = schema.safeParse(f);
    if (!r.success) {
      const errs: Record<string, string> = {};
      r.error.issues.forEach((i) => (errs[i.path.join(".")] = i.message));
      setErrors(errs);
      toast.error("Confira os campos.");
      return;
    }
    setErrors({});
    setLoading(true);
    const { error } = await supabase.from("leads").insert({
      type: "amostras",
      nome: f.nome,
      email: f.email,
      telefone: f.telefone,
      cep: f.cep,
      endereco: `${f.endereco}, ${f.numero}${f.complemento ? " - " + f.complemento : ""} - ${f.bairro}`,
      cidade: f.cidade,
      uf: f.estado,
      empresa: f.empresa || null,
      mensagem: f.projeto || null,
      user_id: user?.id ?? null,
      payload: { perfil: f.perfil, aprovacao_status: "pending", logged_in: !!user },
      origem: user ? "site/pedir-amostras (logado)" : "site/pedir-amostras",
    });
    setLoading(false);
    if (error) {
      toast.error("Não foi possível enviar agora.", { description: error.message });
      return;
    }
    setDone(true);
  };

  if (done) {
    return (
      <div className="surface-ivory">
        <div className="container-western py-32 max-w-2xl text-center">
          <Package className="h-10 w-10 text-western-gold mx-auto mb-6" />
          <p className="text-eyebrow mb-6">Solicitação recebida</p>
          <div className="w-12 h-px bg-western-gold mx-auto mb-8" />
          <h1 className="font-display text-4xl md:text-5xl text-western-green-deep leading-tight mb-6">
            Em até 2 dias úteis confirmamos<br />o envio do seu kit.
          </h1>
          <p className="text-western-stone-warm leading-relaxed mb-10">
            Nosso time comercial avalia cada solicitação e, após aprovação, despacha
            o kit dos quatro acabamentos — Quartzo, Arenito, Moledo e Granito —
            para qualquer endereço no Brasil.
          </p>
          <Link to="/linhas" className="btn-outline-forest">
            Explorar o catálogo
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="surface-ivory">
      <div className="container-western py-20 md:py-28 max-w-2xl">
        <p className="text-eyebrow mb-5">Kit de amostras</p>
        <div className="w-12 h-px bg-western-gold mb-8" />
        <h1 className="font-display text-4xl md:text-6xl text-western-green-deep leading-[1.05] mb-6">
          Receba os 4 acabamentos<br />na sua mesa.
        </h1>
        <p className="text-western-stone-warm text-lg leading-relaxed mb-4">
          Especificar pedra por foto é apostar — textura e variação cromática só se
          decidem no toque. Enviamos amostras físicas dos quatro acabamentos —
          <span className="text-western-green-deep"> Quartzo, Arenito, Moledo e Granito</span>.
        </p>

        <div className="my-8 flex items-start gap-3 px-4 py-4 border border-western-gold/40 bg-western-gold/10">
          <Info className="h-4 w-4 text-western-gold mt-0.5 flex-shrink-0" />
          <div className="text-spec text-western-green-deep leading-relaxed">
            Solicitações são <strong>aprovadas pelo nosso time comercial em até 2 dias úteis</strong>.
            Após aprovação, o kit é enviado em 5–7 dias úteis para todo o Brasil.
          </div>
        </div>

        {isLocked && (
          <div className="my-6 flex items-start gap-3 px-4 py-4 border border-western-green-deep/20 bg-western-green-deep/5">
            <UserCircle2 className="h-4 w-4 text-western-green-deep mt-0.5 flex-shrink-0" />
            <div className="text-spec text-western-green-deep leading-relaxed">
              Pedido vinculado ao seu cadastro <strong>{f.empresa || f.nome}</strong>. Dados pessoais travados —
              ajuste em <Link to="/conta/perfil" className="link-underline text-western-gold">Meu perfil</Link>.
              Endereço pode ser alterado caso queira receber em outro lugar.
            </div>
          </div>
        )}
        {!user && (
          <div className="my-6 text-spec text-western-stone-warm">
            Já tem cadastro? <Link to="/parceiro/login" className="link-underline text-western-gold">Entre</Link> para acompanhar o status do seu pedido.
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
          <div>
            <FieldLabel htmlFor="nome">
              Nome {isLocked && <Lock className="h-3 w-3 inline ml-1 text-western-stone-warm/60" />}
            </FieldLabel>
            <Input id="nome" value={f.nome} onChange={(e) => set("nome", e.target.value)} required
              readOnly={isLocked}
              className={`h-12 bg-transparent border-western-stone-warm/30 rounded-none focus-visible:border-western-gold ${isLocked ? "opacity-70 cursor-not-allowed" : ""}`} />
            {errors.nome && <p className="mt-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-red-700/80">{errors.nome}</p>}
          </div>

          <div className="grid sm:grid-cols-2 gap-5">
            <div>
              <FieldLabel htmlFor="email">
                E-mail {isLocked && <Lock className="h-3 w-3 inline ml-1 text-western-stone-warm/60" />}
              </FieldLabel>
              <EmailInput id="email" value={f.email} onChange={(v) => set("email", v)} required error={errors.email} readOnly={isLocked} />
            </div>
            <div>
              <FieldLabel htmlFor="telefone">
                Telefone (WhatsApp) {isLocked && <Lock className="h-3 w-3 inline ml-1 text-western-stone-warm/60" />}
              </FieldLabel>
              <PhoneInput id="telefone" value={f.telefone} onChange={(v) => set("telefone", v)} required error={errors.telefone} readOnly={isLocked} />
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
              <FieldLabel htmlFor="empresa" optional>
                Empresa / estúdio {isLocked && <Lock className="h-3 w-3 inline ml-1 text-western-stone-warm/60" />}
              </FieldLabel>
              <Input id="empresa" value={f.empresa} onChange={(e) => set("empresa", e.target.value)}
                readOnly={isLocked}
                className={`h-12 bg-transparent border-western-stone-warm/30 rounded-none focus-visible:border-western-gold ${isLocked ? "opacity-70 cursor-not-allowed" : ""}`} />
            </div>
          </div>

          <div className="pt-4 border-t border-western-stone-warm/15">
            <p className="text-eyebrow mb-4">Endereço de entrega</p>

            <div className="grid sm:grid-cols-3 gap-5">
              <div>
                <FieldLabel htmlFor="cep">CEP</FieldLabel>
                <CepInput id="cep" value={f.cep} onChange={(v) => set("cep", v)}
                  onResolved={(d) => setF((p) => ({
                    ...p,
                    endereco: d.logradouro || p.endereco,
                    bairro: d.bairro || p.bairro,
                    cidade: d.localidade || p.cidade,
                    estado: d.uf || p.estado,
                  }))}
                  required error={errors.cep} />
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
                <select id="estado" value={f.estado} onChange={(e) => set("estado", e.target.value)} required
                  className="h-12 w-full bg-transparent border border-western-stone-warm/30 px-3 rounded-none text-western-green-deep focus:outline-none focus:border-western-gold">
                  <option value="" disabled>—</option>
                  {UF_LIST.map((uf) => <option key={uf} value={uf}>{uf}</option>)}
                </select>
                {errors.estado && <p className="mt-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-red-700/80">{errors.estado}</p>}
              </div>
            </div>
          </div>

          <div>
            <FieldLabel htmlFor="projeto" optional>Sobre o projeto</FieldLabel>
            <Textarea id="projeto" value={f.projeto} onChange={(e) => set("projeto", e.target.value)}
              placeholder="Conte rapidamente o que está pensando — ajuda nosso time a sugerir composições."
              rows={4}
              className="bg-transparent border-western-stone-warm/30 rounded-none text-western-green-deep focus-visible:border-western-gold" />
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
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Solicitar kit"}
          </Button>
        </form>
      </div>
    </div>
  );
}
