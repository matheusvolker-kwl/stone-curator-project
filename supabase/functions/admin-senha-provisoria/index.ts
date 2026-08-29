// admin-senha-provisoria — o dono resolve senha com o cliente na linha.
//
// O cliente liga sem conseguir entrar. Ate hoje o dono nao tinha acao nenhuma:
// o unico caminho era o "esqueci a senha", que depende de o e-mail chegar — e a
// entrega de e-mail da loja e problema aberto. Aqui o dono gera uma senha facil
// de ditar por telefone, e o parceiro e obrigado a troca-la no primeiro acesso.
//
// SO ADMIN CHAMA. A verificacao e dupla: o JWT precisa ser valido (verify_jwt)
// e o usuario precisa ter o papel admin em user_roles. Nao basta estar logado —
// qualquer parceiro poderia trocar a senha de qualquer outro.
//
// A senha NUNCA e gravada em lugar nenhum. Ela e devolvida uma unica vez, na
// resposta desta chamada, para o dono ler em voz alta. O que fica registrado em
// senha_provisoria_log e apenas QUEM gerou para QUEM e QUANDO.
import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

/**
 * Palavras escolhidas para serem ditadas por telefone sem soletrar:
 * curtas, sem acento, sem letras ambiguas na fala (nada de "sessao"/"secao"),
 * e todas do vocabulario comum. O numero no fim afasta o palpite sem atrapalhar.
 */
const PALAVRAS = [
  "pedra", "lago", "agua", "folha", "areia", "barro", "campo", "cedro",
  "chuva", "duna", "flor", "fonte", "gruta", "ilha", "jardim", "lapis",
  "leste", "lousa", "mar", "mata", "morro", "musgo", "neve", "norte",
  "onda", "palma", "pinho", "planta", "praia", "raiz", "rocha", "rio",
  "sal", "seiva", "selva", "serra", "sol", "sul", "terra", "trilha",
  "tronco", "vale", "vento", "verde", "vidro", "zinco", "bambu", "brisa",
  "cacto", "calha", "cinza", "coral", "cristal", "dourado", "espuma", "granito",
  "junco", "lasca", "limo", "marmore", "nuvem", "orvalho", "quartzo", "telha",
];

/** Ex.: "pedra-lago-4721". Facil de ditar, dificil de adivinhar. */
function gerarSenha(): string {
  const n = PALAVRAS.length;
  const bytes = new Uint32Array(3);
  crypto.getRandomValues(bytes);
  const a = PALAVRAS[bytes[0] % n];
  let b = PALAVRAS[bytes[1] % n];
  // duas palavras iguais confundem quem anota do outro lado da linha
  if (b === a) b = PALAVRAS[(bytes[1] + 1) % n];
  const digitos = String(bytes[2] % 10000).padStart(4, "0");
  return `${a}-${b}-${digitos}`;
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) return json({ error: "unauthorized" }, 401);

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // 1) Quem esta chamando
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData, error: userErr } = await userClient.auth.getUser(
      authHeader.replace("Bearer ", ""),
    );
    const callerId = userData?.user?.id;
    if (userErr || !callerId) return json({ error: "unauthorized" }, 401);

    const admin = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });

    // 2) Quem chama e admin? Estar logado nao basta.
    const { data: ehAdmin } = await admin.rpc("has_role", {
      _user_id: callerId,
      _role: "admin",
    });
    if (!ehAdmin) {
      console.warn("admin-senha-provisoria: nao-admin tentou gerar senha", { callerId });
      return json({ error: "forbidden" }, 403);
    }

    // 3) Para quem
    let body: { user_id?: string };
    try {
      body = await req.json();
    } catch {
      return json({ error: "invalid_json" }, 400);
    }
    const alvo = typeof body?.user_id === "string" ? body.user_id.trim() : "";
    if (!/^[0-9a-f-]{36}$/i.test(alvo)) return json({ error: "user_id_invalido" }, 400);

    // O alvo precisa ser um parceiro conhecido. Sem esta checagem, um admin
    // poderia trocar a senha de outro admin por engano de digitacao.
    const { data: perfil } = await admin
      .from("partner_profiles")
      .select("user_id, empresa, nome")
      .eq("user_id", alvo)
      .maybeSingle();
    if (!perfil) return json({ error: "parceiro_nao_encontrado" }, 404);

    /* ── A ORDEM AQUI E O CORACAO DESTA FUNCAO ───────────────────────────
     * Trocar a senha e IRREVERSIVEL: no instante em que updateUserById roda, a
     * senha antiga do parceiro morre. Se qualquer coisa falhar depois disso e a
     * senha nova nao chegar aos olhos do dono, o parceiro fica trancado fora da
     * conta para sempre — e o "esqueci a senha" nao salva, porque a entrega de
     * e-mail desta loja e justamente o problema que motivou esta funcao.
     *
     * Por isso: TUDO que pode falhar acontece ANTES da troca. E depois dela,
     * nenhuma resposta pode sair com status de erro — o supabase-js descarta o
     * corpo em qualquer resposta nao-2xx, e a senha iria junto.
     * ──────────────────────────────────────────────────────────────────── */

    // 4) Marca PRIMEIRO. Se falhar aqui, nada foi tocado: o parceiro continua
    // com a senha dele e o dono ve um erro honesto.
    const { error: marcaErr } = await admin
      .from("partner_profiles")
      .update({ senha_provisoria_em: new Date().toISOString() })
      .eq("user_id", alvo);
    if (marcaErr) {
      console.error("admin-senha-provisoria: marca falhou", { message: marcaErr.message });
      return json({ error: "falha_ao_preparar", detalhe: marcaErr.message }, 500);
    }

    // 5) So agora a troca, que e o ponto sem volta.
    const senha = gerarSenha();
    const { error: updErr } = await admin.auth.admin.updateUserById(alvo, { password: senha });
    if (updErr) {
      // A senha NAO mudou. Desfaz a marca para o parceiro nao ser obrigado a
      // trocar uma senha que continua sendo dele.
      console.error("admin-senha-provisoria: updateUserById falhou", { message: updErr.message });
      await admin
        .from("partner_profiles")
        .update({ senha_provisoria_em: null })
        .eq("user_id", alvo);
      return json({ error: "falha_ao_definir_senha", detalhe: updErr.message }, 500);
    }

    // ── DAQUI PARA BAIXO A SENHA JA MUDOU: sempre status 200 ──────────────
    // Qualquer erro vira aviso no corpo, nunca status de erro. Perder a trilha
    // de auditoria e ruim; trancar o parceiro fora da conta e pior.

    const { error: logErr } = await admin
      .from("senha_provisoria_log")
      .insert({ user_id: alvo, gerada_por: callerId });
    if (logErr) console.error("admin-senha-provisoria: log falhou", { message: logErr.message });

    return json({
      ok: true,
      senha,
      parceiro: perfil.empresa || perfil.nome || "",
      aviso: "Leia a senha para o cliente. Ela nao sera exibida de novo, e ele tera de troca-la ao entrar.",
      aviso_tecnico: logErr ? "A senha foi trocada, mas o registro de auditoria falhou." : undefined,
    });
  } catch (e) {
    console.error("admin-senha-provisoria: erro inesperado", e);
    return json({ error: "erro_interno" }, 500);
  }
});
