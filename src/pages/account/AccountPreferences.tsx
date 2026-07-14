import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
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
import { toast } from "sonner";
import { AlertTriangle, Check, Loader2 } from "lucide-react";
import { passwordSchema, passwordStrength } from "@/lib/forms/br";
import { EstadoCarregando, EstadoErro, PageHeader } from "@/components/backoffice";

/**
 * CONFIGURAÇÕES DA CONTA — o que é sensível mora aqui, separado do dia a dia.
 *
 * REGRA: toda ação sensível pede confirmação explícita.
 *   · senha  → exige a nova senha DIGITADA DUAS VEZES (um typo aqui tranca o
 *              parceiro para fora da conta) e mostra a força enquanto ele digita.
 *   · cancelar conta → motivo + digitar "CANCELAR" + diálogo final. Três portas,
 *              porque é irreversível pela interface.
 *
 * OS 4 ESTADOS na leitura das preferências: carregando · vazio · ERRO · sucesso.
 * O load antigo era `.then(({ data }) => …)`: engolia o erro e mostrava o switch
 * de newsletter em "ligado" por padrão, mesmo sem saber a verdade.
 */

export default function AccountPreferences() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const [newsletter, setNewsletter] = useState(false);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<unknown>(null);
  const [salvandoNewsletter, setSalvandoNewsletter] = useState(false);

  const [novaSenha, setNovaSenha] = useState("");
  const [repetirSenha, setRepetirSenha] = useState("");
  const [pwLoading, setPwLoading] = useState(false);

  const [cancelOpen, setCancelOpen] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [motivo, setMotivo] = useState("");
  const [confirmText, setConfirmText] = useState("");
  const [cancelando, setCancelando] = useState(false);

  const carregar = useCallback(async () => {
    if (!user) return;
    setCarregando(true);
    setErro(null);

    const { data, error } = await supabase
      .from("partner_profiles")
      .select("newsletter_opt_in")
      .eq("user_id", user.id)
      .maybeSingle();

    if (error) {
      setErro(error);
      setCarregando(false);
      return;
    }

    setNewsletter(data?.newsletter_opt_in ?? true);
    setCarregando(false);
  }, [user]);

  useEffect(() => {
    void carregar();
  }, [carregar]);

  const alternarNewsletter = async (v: boolean) => {
    if (!user) return;
    const anterior = newsletter;
    setNewsletter(v); // otimista
    setSalvandoNewsletter(true);

    const { data, error } = await supabase
      .from("partner_profiles")
      .update({ newsletter_opt_in: v })
      .eq("user_id", user.id)
      .select("user_id");

    setSalvandoNewsletter(false);

    if (error) {
      setNewsletter(anterior);
      toast.error("Não consegui salvar", { description: error.message });
      return;
    }

    // UPDATE sem linhas afetadas volta sem erro. Antes, a tela dizia "salvo".
    if (!data || data.length === 0) {
      setNewsletter(anterior);
      toast.error("Nada foi salvo", {
        description: "Não localizamos o seu cadastro. Fale com a nossa equipe.",
      });
      return;
    }

    toast.success(v ? "Você passa a receber a newsletter." : "Você não receberá mais e-mails.");
  };

  const forca = passwordStrength(novaSenha);
  const senhasBatem = novaSenha.length > 0 && novaSenha === repetirSenha;
  const podeTrocarSenha = passwordSchema.safeParse(novaSenha).success && senhasBatem;

  const trocarSenha = async (e: React.FormEvent) => {
    e.preventDefault();

    const r = passwordSchema.safeParse(novaSenha);
    if (!r.success) return toast.error(r.error.issues[0]?.message ?? "Senha inválida.");
    if (!senhasBatem) return toast.error("As duas senhas não são iguais.");

    setPwLoading(true);
    const { error } = await supabase.auth.updateUser({ password: novaSenha });
    setPwLoading(false);

    if (error) return toast.error("Não consegui trocar a senha", { description: error.message });

    setNovaSenha("");
    setRepetirSenha("");
    toast.success("Senha atualizada.");
  };

  const podeCancelar = motivo.trim().length >= 10 && confirmText.trim().toUpperCase() === "CANCELAR";

  const cancelarConta = async () => {
    if (!user || !podeCancelar) return;
    setConfirmDialogOpen(false);
    setCancelando(true);

    const { data, error } = await supabase
      .from("partner_profiles")
      .update({
        status: "cancelled",
        cancellation_reason: motivo.trim(),
        cancelled_at: new Date().toISOString(),
      })
      .eq("user_id", user.id)
      .select("user_id");

    if (error) {
      setCancelando(false);
      return toast.error("Não consegui cancelar", { description: error.message });
    }

    // Sem esta checagem, um UPDATE que não pegou nenhuma linha derrubaria a
    // sessão do parceiro e diria "conta cancelada" — com a conta intacta.
    if (!data || data.length === 0) {
      setCancelando(false);
      return toast.error("Nada foi alterado", {
        description: "Não localizamos o seu cadastro. Fale com a nossa equipe.",
      });
    }

    await signOut();
    toast.success("Conta cancelada.");
    navigate("/", { replace: true });
  };

  /* ── Os 4 estados ─────────────────────────────────────────────── */

  if (carregando) {
    return (
      <div>
        <PageHeader eyebrow="Minha conta" titulo="Configurações" />
        <div className="rounded-[16px] border border-western-border-soft bg-white">
          <EstadoCarregando linhas={4} />
        </div>
      </div>
    );
  }

  if (erro) {
    return (
      <div>
        <PageHeader eyebrow="Minha conta" titulo="Configurações" />
        <EstadoErro erro={erro} onRetry={carregar} titulo="Não consegui carregar as suas preferências" />
      </div>
    );
  }

  /* ── Sucesso ──────────────────────────────────────────────────── */

  return (
    <div>
      <PageHeader
        eyebrow="Minha conta"
        titulo="Configurações"
        subtitulo="Comunicação, acesso e encerramento. As alterações aqui pedem confirmação."
      />

      <div className="max-w-3xl space-y-6">
        {/* ── Identificação (leitura) ───────────────────────────── */}
        <section className="rounded-[16px] border border-western-border-soft bg-white p-6">
          <h2 className="text-[20px] font-semibold text-western-green-deep">Acesso</h2>
          <p className="text-meta mt-1">É com este e-mail que você entra na conta.</p>
          <p className="mt-4 rounded-[6px] bg-western-paper px-3 py-2.5 text-[16px] text-western-green-deep">
            {user?.email ?? "—"}
          </p>
        </section>

        {/* ── Newsletter ────────────────────────────────────────── */}
        <section className="rounded-[16px] border border-western-border-soft bg-white p-6">
          <div className="flex items-center justify-between gap-6">
            <div className="min-w-0">
              <Label htmlFor="newsletter" className="text-[20px] font-semibold text-western-green-deep">
                Novidades por e-mail
              </Label>
              <p className="text-meta mt-1 leading-[1.45]">
                Peças novas, projetos e oportunidades para parceiros. Sem spam — e você desliga aqui
                quando quiser.
              </p>
            </div>

            <div className="flex flex-shrink-0 items-center gap-2">
              {salvandoNewsletter && (
                <Loader2 className="h-4 w-4 animate-spin text-western-stone-warm" aria-hidden="true" />
              )}
              <Switch
                id="newsletter"
                checked={newsletter}
                onCheckedChange={alternarNewsletter}
                disabled={salvandoNewsletter}
              />
            </div>
          </div>
        </section>

        {/* ── Senha ─────────────────────────────────────────────── */}
        <section className="rounded-[16px] border border-western-border-soft bg-white p-6">
          <h2 className="text-[20px] font-semibold text-western-green-deep">Trocar a senha</h2>
          <p className="text-meta mt-1">
            Digite a nova senha duas vezes. Só confirmamos a troca quando as duas forem iguais.
          </p>

          <form onSubmit={trocarSenha} className="mt-5 space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="nova-senha" className="mb-2 block text-[14px] font-semibold text-western-stone-dark">
                  Nova senha
                </Label>
                <Input
                  id="nova-senha"
                  type="password"
                  autoComplete="new-password"
                  placeholder="Mínimo 8 caracteres e um número"
                  value={novaSenha}
                  onChange={(e) => setNovaSenha(e.target.value)}
                  className={SENHA_CLS}
                />
              </div>

              <div>
                <Label htmlFor="repetir-senha" className="mb-2 block text-[14px] font-semibold text-western-stone-dark">
                  Repetir a nova senha
                </Label>
                <Input
                  id="repetir-senha"
                  type="password"
                  autoComplete="new-password"
                  placeholder="A mesma senha"
                  value={repetirSenha}
                  onChange={(e) => setRepetirSenha(e.target.value)}
                  aria-invalid={repetirSenha.length > 0 && !senhasBatem}
                  className={SENHA_CLS}
                />
                {repetirSenha.length > 0 && !senhasBatem && (
                  <p className="mt-1.5 text-[14px] font-semibold text-[#B3372E]">
                    As duas senhas não são iguais.
                  </p>
                )}
                {senhasBatem && (
                  <p className="mt-1.5 inline-flex items-center gap-1.5 text-[14px] font-semibold text-[#2E7D4F]">
                    <Check className="h-4 w-4" aria-hidden="true" />
                    As senhas conferem.
                  </p>
                )}
              </div>
            </div>

            {novaSenha.length > 0 && <MedidorDeForca score={forca.score} label={forca.label} />}

            <button type="submit" disabled={pwLoading || !podeTrocarSenha} className="btn-primary w-full sm:w-auto">
              {pwLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                  Atualizando…
                </>
              ) : (
                "Atualizar senha"
              )}
            </button>
          </form>
        </section>

        {/* ── Zona sensível: cancelamento ───────────────────────── */}
        <section className="rounded-[16px] border border-[#B3372E]/35 bg-[#B3372E]/[0.06] p-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#B3372E]" aria-hidden="true" />
            <div className="min-w-0">
              <h2 className="text-[20px] font-semibold text-[#B3372E]">Cancelar a minha conta</h2>
              <p className="mt-1 text-[16px] leading-[1.5] text-western-stone-dark/90">
                Sua conta é desativada e o preço de parceiro é suspenso. O histórico de pedidos fica
                guardado por obrigação legal (LGPD), mas você perde o acesso ao painel. Não dá para
                desfazer por aqui.
              </p>
            </div>
          </div>

          {!cancelOpen ? (
            <button
              type="button"
              onClick={() => setCancelOpen(true)}
              className="tap-target mt-5 inline-flex items-center justify-center rounded-[10px] border border-[#B3372E]/50 px-5 text-[16px] font-semibold text-[#B3372E] transition-colors hover:bg-[#B3372E]/10"
            >
              Quero cancelar
            </button>
          ) : (
            <div className="mt-6 space-y-4">
              <div>
                <Label htmlFor="motivo" className="mb-2 block text-[14px] font-semibold text-western-stone-dark">
                  Por que está saindo? (obrigatório)
                </Label>
                <Textarea
                  id="motivo"
                  value={motivo}
                  onChange={(e) => setMotivo(e.target.value)}
                  rows={3}
                  placeholder="Conte rapidamente o motivo — a gente lê tudo."
                  className="rounded-[6px] border-western-border-strong bg-white text-[16px] text-western-green-deep"
                />
                {motivo.length > 0 && motivo.trim().length < 10 && (
                  <p className="mt-1.5 text-[14px] font-semibold text-[#B3372E]">
                    Escreva pelo menos 10 caracteres.
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="confirmar" className="mb-2 block text-[14px] font-semibold text-western-stone-dark">
                  Digite CANCELAR para confirmar
                </Label>
                <Input
                  id="confirmar"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  autoComplete="off"
                  placeholder="CANCELAR"
                  className="h-[52px] max-w-xs rounded-[6px] border-western-border-strong bg-white px-3 text-[16px] text-western-green-deep"
                />
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => setConfirmDialogOpen(true)}
                  disabled={!podeCancelar || cancelando}
                  className="tap-target inline-flex items-center justify-center gap-2 rounded-[10px] bg-[#B3372E] px-5 text-[16px] font-semibold text-white transition-colors hover:bg-[#932C25] disabled:cursor-not-allowed disabled:opacity-45"
                >
                  {cancelando ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                      Cancelando…
                    </>
                  ) : (
                    "Cancelar minha conta"
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setCancelOpen(false);
                    setMotivo("");
                    setConfirmText("");
                  }}
                  disabled={cancelando}
                  className="btn-outline-forest"
                >
                  Voltar
                </button>
              </div>
            </div>
          )}
        </section>
      </div>

      {/* Última porta antes do irreversível. */}
      <AlertDialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <AlertDialogContent className="rounded-[16px]">
          <AlertDialogHeader>
            <AlertDialogTitle className="display-md text-[#B3372E]">
              Cancelar a conta de {user?.email}?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-[17px] leading-[1.6] text-western-stone-warm">
              Você sai do painel agora e perde o preço de parceiro. Reativar depois só falando com a
              nossa equipe. Tem certeza?
            </AlertDialogDescription>
          </AlertDialogHeader>
          {/*
            AlertDialogAction já vem com buttonVariants() (verde, 52px, raio 10px).
            Aqui só trocamos a COR por utilities — utility vence utility no
            twMerge. Uma classe .btn-* de @layer components perderia em silêncio.
          */}
          <AlertDialogFooter>
            <AlertDialogCancel className="mt-0">Não, quero ficar</AlertDialogCancel>
            <AlertDialogAction
              onClick={cancelarConta}
              className="bg-[#B3372E] text-white hover:bg-[#932C25]"
            >
              Sim, cancelar a conta
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

const SENHA_CLS =
  "h-[52px] rounded-[6px] border-western-border-strong bg-white px-3 text-[16px] text-western-green-deep placeholder:text-western-stone-warm/50 focus-visible:border-western-green-deep focus-visible:ring-0 focus-visible:ring-offset-0";

/** Força da senha — 4 barras. Verde só quando é forte de verdade. */
function MedidorDeForca({ score, label }: { score: 0 | 1 | 2 | 3 | 4; label: string }) {
  const cor =
    score <= 1 ? "bg-[#B3372E]" : score === 2 ? "bg-[#9C6812]" : score === 3 ? "bg-[#9C6812]" : "bg-[#2E7D4F]";

  return (
    <div>
      <div className="flex gap-1.5" aria-hidden="true">
        {[1, 2, 3, 4].map((i) => (
          <span
            key={i}
            className={`h-1.5 flex-1 rounded-[6px] transition-colors ${
              i <= score ? cor : "bg-western-border-soft"
            }`}
          />
        ))}
      </div>
      <p className="text-meta mt-1.5" role="status">
        Força da senha: <span className="font-semibold text-western-stone-dark">{label}</span>
      </p>
    </div>
  );
}
