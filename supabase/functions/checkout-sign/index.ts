// checkout-sign — assina o bloco de identidade PJ do parceiro aprovado para
// o hand-off de checkout no Woo. NUNCA confia em dados vindos do cliente:
// lê do banco (partner_profiles) usando o JWT do usuário autenticado.
//
// Retorno: { payload_b64, signature, timestamp }
//   - payload_b64: string base64 (url-safe padrão base64, padding "=") do JSON UTF-8
//     do payload. É essa string CRUA que entra no HMAC.
//   - signature:   HMAC-SHA256(secret = CHECKOUT_HANDOFF_SECRET, msg = payload_b64), hex minúsculo.
//   - timestamp:   epoch em segundos (número), TAMBÉM já dentro do payload assinado
//                  (campo `ts`) para prevenir replay no lado Woo (janela sugerida: 5 min).
import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return json({ error: "unauthorized" }, 401);
    }

    const secret = Deno.env.get("CHECKOUT_HANDOFF_SECRET");
    if (!secret) return json({ error: "server_misconfigured" }, 500);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claims, error: cErr } = await supabase.auth.getClaims(token);
    if (cErr || !claims?.claims?.sub) return json({ error: "unauthorized" }, 401);
    const userId = claims.claims.sub as string;
    const email = (claims.claims.email as string | undefined) ?? null;

    // RLS: "Partners see own profile" garante escopo por user_id.
    const { data: profile, error: pErr } = await supabase
      .from("partner_profiles")
      .select(
        "user_id,status,nome,empresa,cnpj,telefone,cep,endereco,numero,complemento,bairro,cidade,estado",
      )
      .eq("user_id", userId)
      .maybeSingle();

    if (pErr) return json({ error: "profile_read_failed" }, 500);
    if (!profile) return json({ error: "profile_not_found" }, 404);
    if (profile.status !== "approved") return json({ error: "not_approved" }, 403);

    const ts = Math.floor(Date.now() / 1000);
    const payload = {
      v: 1 as const,
      ts,
      user_id: userId,
      email,
      billing: {
        first_name: profile.nome ?? "",
        company: profile.empresa ?? "",
        cnpj: onlyDigits(profile.cnpj),
        phone: onlyDigits(profile.telefone),
        email: email ?? "",
        address_1: [profile.endereco ?? "", profile.numero ?? ""].filter(Boolean).join(", "),
        address_2: profile.complemento ?? "",
        neighborhood: profile.bairro ?? "",
        city: profile.cidade ?? "",
        state: (profile.estado ?? "").toUpperCase().slice(0, 2),
        postcode: onlyDigits(profile.cep),
        country: "BR",
        persontype: 2, // 1 = PF, 2 = PJ (Brazilian Market on WooCommerce)
      },
    };

    const payloadJson = JSON.stringify(payload);
    const payloadB64 = base64Encode(new TextEncoder().encode(payloadJson));
    const signature = await hmacSha256Hex(secret, payloadB64);

    return json({ payload_b64: payloadB64, signature, timestamp: ts });
  } catch (e) {
    console.error("[checkout-sign]", e);
    return json({ error: "internal_error" }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function onlyDigits(v: string | null | undefined): string {
  return (v ?? "").replace(/\D+/g, "");
}

function base64Encode(bytes: Uint8Array): string {
  let bin = "";
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin);
}

async function hmacSha256Hex(secret: string, msg: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(msg));
  const bytes = new Uint8Array(sig);
  let hex = "";
  for (let i = 0; i < bytes.length; i++) hex += bytes[i].toString(16).padStart(2, "0");
  return hex;
}
