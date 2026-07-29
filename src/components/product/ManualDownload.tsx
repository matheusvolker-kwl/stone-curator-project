// Download do Manual de Instalação Western, com captura de lead.
//
// REGRA (dono):
//   • Parceiro aprovado  → baixa direto, sem fricção.
//   • Visitante/pendente → um modal curto (nome, e-mail, telefone) grava o lead
//     e o download começa em seguida.
//   • Quem já deu o e-mail uma vez não é perguntado de novo (localStorage).
//
// AVISO: o PDF é servido numa URL pública (/manuais/...). O gate é de
// FORMULÁRIO — padrão de mercado para captura de lead — e não criptográfico:
// quem souber a URL baixa direto. É uma decisão consciente.

import { useRef, useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { FileDown, ExternalLink, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import InvisibleTurnstile, {
  type InvisibleTurnstileHandle,
} from "@/components/security/InvisibleTurnstile";
import { useAuth } from "@/hooks/useAuth";
import { submitContactLead } from "@/lib/leads";
import { MANUAL_PDF_URL, manualPageUrl } from "@/data/installation";
import { cn } from "@/lib/utils";

const LEAD_KEY = "western:manual-lead:v1";

/** Já capturamos o e-mail desta pessoa antes? Não torture quem já deu. */
function hasCapturedLead(): boolean {
  try {
    return localStorage.getItem(LEAD_KEY) !== null;
  } catch {
    return false;
  }
}

function rememberLead(email: string) {
  try {
    localStorage.setItem(LEAD_KEY, JSON.stringify({ email, ts: Date.now() }));
  } catch {
    /* modo privativo / storage bloqueado — segue sem lembrar */
  }
}

/** Dispara o download do PDF completo (sem âncora — o arquivo inteiro). */
function startDownload() {
  const a = document.createElement("a");
  a.href = MANUAL_PDF_URL;
  a.download = "manual-instalacao-western.pdf";
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  a.remove();
}

const schema = z.object({
  nome: z.string().trim().min(2, "Informe seu nome").max(120),
  email: z.string().trim().toLowerCase().email("E-mail inválido").max(320),
  telefone: z.string().trim().max(40).optional(),
});

const CONTROL =
  "h-control rounded-lg border-[1.5px] border-western-border-strong bg-western-paper px-4 text-[15px] text-western-green-deep placeholder:text-western-stone-warm/60 focus:border-western-green-deep";
const CONTROL_ERR = "border-status-error";

export interface ManualDownloadProps {
  /** Capítulo do manual (1–6). */
  chapter: number;
  /** Título do capítulo, como está no manual. */
  chapterTitle: string;
  /** Página do PDF onde o capítulo começa. */
  page: number;
  /** Nome da peça/conjunto de onde o download partiu (vai no lead). */
  pieceName?: string;
  /** Handle da linha/coleção (vai no lead). */
  lineHandle?: string;
  /** Onde o botão está (compõe a origem do lead). */
  origem?: string;
  /** Aparência do botão. */
  variant?: "primary" | "outline";
  className?: string;
}

export default function ManualDownload({
  chapter,
  chapterTitle,
  page,
  pieceName,
  lineHandle,
  origem = "site/pdp/manual-instalacao",
  variant = "primary",
  className,
}: ManualDownloadProps) {
  const { isApproved } = useAuth();
  const [open, setOpen] = useState(false);
  const [unlocked, setUnlocked] = useState(() => hasCapturedLead());
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState({ nome: "", email: "", telefone: "" });
  const [honeypot, setHoneypot] = useState("");
  const captchaRef = useRef<InvisibleTurnstileHandle>(null);

  // Parceiro aprovado não passa pelo gate. Quem já deu o e-mail, também não.
  const free = isApproved || unlocked;

  function setField(k: keyof typeof form, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((e) => (e[k] ? { ...e, [k]: "" } : e));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      const next: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const k = issue.path[0];
        if (typeof k === "string" && !next[k]) next[k] = issue.message;
      }
      setErrors(next);
      return;
    }

    setLoading(true);
    try {
      const token = (await captchaRef.current?.getToken()) ?? null;
      const res = await submitContactLead(
        {
          nome: parsed.data.nome,
          email: parsed.data.email,
          telefone: parsed.data.telefone ?? "",
          mensagem: `Baixou o manual de instalação — Cap. ${chapter} · ${chapterTitle}${
            pieceName ? ` · ${pieceName}` : ""
          }`,
          origem,
          payload: {
            intencao: "download_manual_instalacao",
            capitulo: chapter,
            capitulo_titulo: chapterTitle,
            pagina_pdf: page,
            peca: pieceName ?? null,
            linha: lineHandle ?? null,
          },
        },
        token,
        { honeypot },
      );

      if (!res.ok) {
        // O backend falhou — não é culpa de quem está esperando o manual.
        // Entrega o download mesmo assim, mas não marca como capturado:
        // na próxima vez tentamos registrar de novo.
        toast.error("Não conseguimos registrar seu contato, mas o manual já vai baixar.");
        startDownload();
        setOpen(false);
        return;
      }

      rememberLead(parsed.data.email);
      setUnlocked(true);
      setOpen(false);
      startDownload();
      toast.success("Manual liberado. O download começou.");
    } finally {
      setLoading(false);
    }
  }

  const btnClass =
    variant === "primary" ? "btn-primary" : "btn-outline-forest";

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {free ? (
        <a
          href={MANUAL_PDF_URL}
          download="manual-instalacao-western.pdf"
          className={cn(btnClass, "w-full sm:w-auto")}
        >
          <FileDown className="h-5 w-5" aria-hidden="true" />
          Baixar o manual de instalação
        </a>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className={cn(btnClass, "w-full sm:w-auto")}
        >
          <FileDown className="h-5 w-5" aria-hidden="true" />
          Baixar o manual de instalação
        </button>
      )}

      {/* Bônus para quem já está liberado: abrir direto no capítulo certo. */}
      {free && (
        <a
          href={manualPageUrl(page)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-tap items-center gap-1.5 font-sans text-[15px] font-semibold text-western-green-deep underline-offset-4 hover:underline"
        >
          Abrir no Capítulo {chapter} · {chapterTitle}
          <ExternalLink className="h-4 w-4" aria-hidden="true" />
        </a>
      )}

      <Dialog open={open} onOpenChange={(o) => !loading && setOpen(o)}>
        <DialogContent className="max-w-md border-western-border-soft bg-western-cream">
          <DialogHeader>
            <p className="text-eyebrow">Manual de instalação</p>
            <DialogTitle className="display-md mt-2 text-western-green-deep">
              Baixar o manual de instalação
            </DialogTitle>
            <DialogDescription className="text-body mt-2">
              PDF completo, 28 páginas, com o passo a passo de todas as linhas. Diga pra
              quem estamos enviando e o download começa.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} noValidate className="mt-2 space-y-5">
            <div>
              <label
                htmlFor="manual-nome"
                className="mb-2 block font-sans text-[14px] font-semibold text-western-green-deep"
              >
                Nome
              </label>
              <Input
                id="manual-nome"
                value={form.nome}
                onChange={(e) => setField("nome", e.target.value)}
                maxLength={120}
                autoComplete="name"
                placeholder="Como podemos te chamar"
                aria-invalid={!!errors.nome}
                className={cn(CONTROL, errors.nome && CONTROL_ERR)}
              />
              {errors.nome && (
                <p className="mt-1.5 font-sans text-[14px] text-status-error">{errors.nome}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="manual-email"
                className="mb-2 block font-sans text-[14px] font-semibold text-western-green-deep"
              >
                E-mail
              </label>
              <Input
                id="manual-email"
                type="email"
                inputMode="email"
                value={form.email}
                onChange={(e) => setField("email", e.target.value)}
                maxLength={320}
                autoComplete="email"
                placeholder="voce@email.com.br"
                aria-invalid={!!errors.email}
                className={cn(CONTROL, errors.email && CONTROL_ERR)}
              />
              {errors.email && (
                <p className="mt-1.5 font-sans text-[14px] text-status-error">{errors.email}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="manual-telefone"
                className="mb-2 block font-sans text-[14px] font-semibold text-western-green-deep"
              >
                Telefone{" "}
                <span className="font-normal text-western-stone-warm">(opcional)</span>
              </label>
              <Input
                id="manual-telefone"
                type="tel"
                inputMode="tel"
                value={form.telefone}
                onChange={(e) => setField("telefone", e.target.value)}
                maxLength={40}
                autoComplete="tel"
                placeholder="(11) 90000-0000"
                className={CONTROL}
              />
            </div>

            {/* honeypot — invisível para gente, irresistível para robô */}
            <div className="absolute left-[-9999px] top-auto h-px w-px overflow-hidden">
              <label>
                Não preencha
                <input
                  type="text"
                  tabIndex={-1}
                  autoComplete="off"
                  name="website"
                  value={honeypot}
                  onChange={(e) => setHoneypot(e.target.value)}
                />
              </label>
            </div>

            <InvisibleTurnstile ref={captchaRef} />

            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
              ) : (
                <FileDown className="h-5 w-5" aria-hidden="true" />
              )}
              {loading ? "Liberando…" : "Baixar o manual"}
            </button>

            <p className="text-meta">
              Usamos seu contato só para falar sobre o seu projeto. Sem spam.
            </p>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
