import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { KeyRound, Loader2 } from "lucide-react";

/**
 * Cobre a tela quando a senha do parceiro foi definida pelo admin.
 *
 * O dono gera uma senha provisória e passa por telefone. Enquanto o parceiro
 * não trocar, o admin sabe a senha dele — então a troca não pode ser um
 * lembrete que dá para ignorar. Daqui não se sai sem trocar, nem clicando fora,
 * nem apertando Esc, nem navegando: a sobreposição fica por cima de qualquer
 * rota, porque mora acima das rotas na árvore.
 *
 * Sair da conta continua possível, de propósito — senão alguém que recebeu a
 * senha por engano ficaria preso.
 */
export default function TrocaSenhaObrigatoria() {
  const { user, senhaProvisoria, refresh, signOut } = useAuth();
  const [senha, setSenha] = useState("");
  const [confirma, setConfirma] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  if (!user || !senhaProvisoria) return null;

  const curta = senha.length > 0 && senha.length < 8;
  const diferentes = confirma.length > 0 && senha !== confirma;
  const podeSalvar = senha.length >= 8 && senha === confirma && !salvando;

  async function trocar(e: React.FormEvent) {
    e.preventDefault();
    if (!podeSalvar || !user) return;
    setSalvando(true);
    setErro(null);

    const { error } = await supabase.auth.updateUser({ password: senha });
    if (error) {
      // Sem isto o parceiro tentaria de novo achando que salvou, e continuaria
      // com a senha que passou por telefone.
      setErro(
        error.message?.includes("different from the old")
          ? "Escolha uma senha diferente da que você recebeu por telefone."
          : "Não consegui salvar a senha. Tente de novo em alguns segundos.",
      );
      setSalvando(false);
      return;
    }

    // Limpa a marca. Se esta escrita falhar, a senha JÁ mudou — então não
    // travamos o parceiro: ele segue, e no máximo vê a tela outra vez.
    await supabase
      .from("partner_profiles")
      .update({ senha_provisoria_em: null })
      .eq("user_id", user.id);

    await refresh();
    setSalvando(false);
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-western-green-deep/95 px-6 py-10 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="troca-senha-titulo"
    >
      <div className="w-full max-w-md rounded-lg border border-western-gold/25 bg-western-green-mid p-7 shadow-2xl">
        <div className="mb-5 flex items-center gap-3">
          <KeyRound className="h-5 w-5 shrink-0 text-western-gold" aria-hidden="true" />
          <h1 id="troca-senha-titulo" className="font-display text-xl tracking-wide text-western-cream">
            Crie sua senha
          </h1>
        </div>

        <p className="mb-6 text-sm leading-relaxed text-western-cream-muted">
          A senha que você usou para entrar foi gerada pela Western e passada por telefone.
          Escolha agora uma senha só sua — ninguém mais vai conhecê-la.
        </p>

        <form onSubmit={trocar} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="nova-senha" className="text-western-cream">Nova senha</Label>
            <Input
              id="nova-senha"
              type="password"
              autoComplete="new-password"
              autoFocus
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              className="bg-western-green-deep text-western-cream"
              aria-describedby="dica-senha"
            />
            <p id="dica-senha" className="text-xs text-western-cream-muted">
              Pelo menos 8 caracteres.
            </p>
            {curta && (
              <p className="text-xs text-western-gold-soft">Faltam {8 - senha.length} caractere(s).</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="confirma-senha" className="text-western-cream">Repita a senha</Label>
            <Input
              id="confirma-senha"
              type="password"
              autoComplete="new-password"
              value={confirma}
              onChange={(e) => setConfirma(e.target.value)}
              className="bg-western-green-deep text-western-cream"
            />
            {diferentes && (
              <p className="text-xs text-western-gold-soft">As duas senhas não são iguais.</p>
            )}
          </div>

          {erro && (
            <p className="rounded border border-western-gold/40 bg-western-green-deep px-3 py-2 text-sm text-western-cream">
              {erro}
            </p>
          )}

          <Button type="submit" disabled={!podeSalvar} className="w-full">
            {salvando ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                Salvando
              </>
            ) : (
              "Salvar e continuar"
            )}
          </Button>
        </form>

        <button
          type="button"
          onClick={() => void signOut()}
          className="mt-5 w-full text-center text-xs text-western-cream-muted underline underline-offset-4 hover:text-western-cream"
        >
          Sair da conta
        </button>
      </div>
    </div>
  );
}
