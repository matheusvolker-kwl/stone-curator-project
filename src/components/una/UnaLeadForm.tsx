import { useState } from "react";
import { Loader2, MessageCircle, Clock3, Check } from "lucide-react";
import { submitContactLead } from "@/lib/leads";
import TurnstileWidget from "@/components/security/TurnstileWidget";

/**
 * Formulário de lead do Una Spa (B2C). Registra via edge `lead-submit`
 * (origem "una" → aparece em /admin/leads) e, no sucesso, oferece as duas
 * saídas pedidas pelo dono: seguir agora no WhatsApp ou aguardar o retorno.
 */

const WHATS = "https://wa.me/5511993403487";

const LOCAIS = ["Varanda", "Deck / jardim", "Cobertura", "Área interna", "Ainda não sei"] as const;

type Etapa = "form" | "escolha" | "aguardando";

export default function UnaLeadForm() {
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [cidade, setCidade] = useState("");
  const [local, setLocal] = useState<(typeof LOCAIS)[number] | "">("");
  const [mensagem, setMensagem] = useState("");
  const [hp, setHp] = useState("");
  const [token, setToken] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [etapa, setEtapa] = useState<Etapa>("form");

  const zapUrl = `${WHATS}?text=${encodeURIComponent(
    `Olá! Sou ${nome || "cliente do site"} e acabei de pedir contato pelo site do UNA Spa.${local ? ` Pensando em: ${local.toLowerCase()}.` : ""}`,
  )}`;

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    if (enviando) return;
    setErro(null);
    setEnviando(true);
    const res = await submitContactLead(
      {
        nome,
        email: "",
        telefone,
        cidade,
        mensagem: mensagem || undefined,
        origem: "una",
        payload: { produto: "Una Spa", local: local || null, pagina: "/una" },
      },
      token,
      { honeypot: hp },
    );
    setEnviando(false);
    if (!res.ok) {
      setErro("Não conseguimos registrar agora. Tente de novo — ou chame direto no WhatsApp.");
      return;
    }
    setEtapa("escolha");
  }

  if (etapa === "aguardando") {
    return (
      <div className="flex flex-col items-start gap-4">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#B99F84]/25">
          <Check className="h-6 w-6 text-[#B99F84]" strokeWidth={2} />
        </span>
        <p className="font-display text-[22px] font-[650] leading-snug text-[#F5EFE2]">
          Recebido, {nome.split(" ")[0] || "obrigado"}.
        </p>
        <p className="text-base leading-relaxed text-[#E6DCC6]/80">
          O time responde no mesmo dia útil, no seu WhatsApp. Se preferir adiantar:
        </p>
        <a href={zapUrl} target="_blank" rel="noreferrer" className="text-base font-semibold text-[#B99F84] underline-offset-4 hover:underline">
          falar agora no WhatsApp →
        </a>
      </div>
    );
  }

  if (etapa === "escolha") {
    return (
      <div className="flex flex-col gap-4">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#B99F84]/25">
          <Check className="h-6 w-6 text-[#B99F84]" strokeWidth={2} />
        </span>
        <p className="font-display text-[22px] font-[650] leading-snug text-[#F5EFE2]">
          Pronto, {nome.split(" ")[0] || "recebido"}. Como prefere seguir?
        </p>
        <a
          href={zapUrl}
          target="_blank"
          rel="noreferrer"
          onClick={() => setEtapa("aguardando")}
          className="flex items-center justify-center gap-2.5 rounded-[10px] bg-[#B99F84] px-7 py-4 text-center text-[17px] font-bold text-[#14262B] shadow-[0_14px_30px_-16px_rgba(0,0,0,.55)] transition-colors hover:bg-[#C9B098]"
        >
          <MessageCircle className="h-5 w-5" strokeWidth={2} />
          Falar agora no WhatsApp
        </a>
        <button
          type="button"
          onClick={() => setEtapa("aguardando")}
          className="flex items-center justify-center gap-2.5 rounded-[10px] border-[1.5px] border-[#E6DCC6]/45 px-7 py-3.5 text-base font-semibold text-[#E6DCC6] transition-colors hover:bg-[#E6DCC6]/10"
        >
          <Clock3 className="h-5 w-5" strokeWidth={1.75} />
          Prefiro aguardar o retorno do time
        </button>
        <p className="text-sm leading-normal text-[#E6DCC6]/60">Retorno no mesmo dia útil, pelo WhatsApp informado.</p>
      </div>
    );
  }

  const inputCls =
    "w-full rounded-[10px] border-[1.5px] border-[#E6DCC6]/30 bg-[#14262B]/60 px-4 py-3.5 text-base text-[#F5EFE2] placeholder:text-[#E6DCC6]/45 outline-none transition-colors focus:border-[#B99F84]";

  return (
    <form onSubmit={enviar} className="flex flex-col gap-3.5">
      <label className="sr-only" htmlFor="una-nome">Seu nome</label>
      <input id="una-nome" required value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Seu nome" autoComplete="name" className={inputCls} />
      <label className="sr-only" htmlFor="una-zap">Seu WhatsApp</label>
      <input id="una-zap" required value={telefone} onChange={(e) => setTelefone(e.target.value)} placeholder="Seu WhatsApp (DDD + número)" inputMode="tel" autoComplete="tel" className={inputCls} />
      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
        <label className="sr-only" htmlFor="una-cidade">Cidade</label>
        <input id="una-cidade" value={cidade} onChange={(e) => setCidade(e.target.value)} placeholder="Cidade" autoComplete="address-level2" className={inputCls} />
        <label className="sr-only" htmlFor="una-local">Onde o Una vai viver</label>
        <select
          id="una-local"
          value={local}
          onChange={(e) => setLocal(e.target.value as (typeof LOCAIS)[number])}
          className={`${inputCls} ${local ? "" : "text-[#E6DCC6]/45"}`}
        >
          <option value="" disabled>Onde ele vai viver?</option>
          {LOCAIS.map((l) => (
            <option key={l} value={l} className="text-[#14262B]">{l}</option>
          ))}
        </select>
      </div>
      <label className="sr-only" htmlFor="una-msg">Mensagem (opcional)</label>
      <textarea id="una-msg" value={mensagem} onChange={(e) => setMensagem(e.target.value)} placeholder="Algo que a gente deva saber? (opcional)" rows={2} className={`${inputCls} resize-none`} />
      {/* honeypot — invisível para pessoas */}
      <input type="text" tabIndex={-1} autoComplete="off" value={hp} onChange={(e) => setHp(e.target.value)} className="hidden" aria-hidden="true" />
      {erro ? <p className="text-[15px] leading-normal text-[#E8B4A0]">{erro}</p> : null}
      <button
        type="submit"
        disabled={enviando}
        className="mt-1 flex items-center justify-center gap-2.5 rounded-[10px] bg-[#B99F84] px-7 py-4 text-center text-[17px] font-bold text-[#14262B] shadow-[0_14px_30px_-16px_rgba(0,0,0,.55)] transition-colors hover:bg-[#C9B098] disabled:opacity-60"
      >
        {enviando ? <Loader2 className="h-5 w-5 animate-spin" strokeWidth={2} /> : null}
        Quero um UNA
      </button>
      <TurnstileWidget onToken={setToken} onExpire={() => setToken(null)} />
      <p className="text-sm leading-normal text-[#E6DCC6]/60">
        Retorno no mesmo dia útil. Usamos seus dados só para este atendimento.
      </p>
    </form>
  );
}
