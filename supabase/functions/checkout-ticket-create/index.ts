// checkout-ticket-create — issues an opaque one-shot ticket for the Woo
// checkout hand-off. Requires an authenticated request (JWT). Reads the
// partner billing block SERVER-SIDE from public.partner_profiles — never
// trusts data coming from the client. Persists the payload in
// public.checkout_tickets with a 90s TTL and returns only the ticket string.
//
// The payload is later exchanged (one-shot) by the Woo mu-plugin via
// checkout-ticket-redeem using a shared bearer secret.
import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const TICKET_TTL_SECONDS = 300;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) return json({ error: "unauthorized" }, 401);

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Client with the user's JWT — used only to validate the identity.
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const token = authHeader.replace("Bearer ", "");
    const { data: claims, error: cErr } = await userClient.auth.getClaims(token);
    if (cErr || !claims?.claims?.sub) return json({ error: "unauthorized" }, 401);
    const userId = claims.claims.sub as string;
    const email = (claims.claims.email as string | undefined) ?? null;

    // Service-role client — reads profile and writes ticket bypassing RLS.
    const admin = createClient(supabaseUrl, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const { data: profile, error: pErr } = await admin
      .from("partner_profiles")
      .select(
        "user_id,status,tier,discount_override,nome,empresa,cnpj,telefone,cep,endereco,numero,complemento,bairro,cidade,estado",
      )
      .eq("user_id", userId)
      .maybeSingle();

    if (pErr) return json({ error: "profile_read_failed" }, 500);
    if (!profile) return json({ error: "profile_not_found" }, 404);
    if (profile.status !== "approved") return json({ error: "not_approved" }, 403);

    const nomeCompleto = (profile.nome ?? "").trim();
    const [firstName, ...rest] = nomeCompleto.split(/\s+/);
    const lastName = rest.join(" ");

    // ── Nivel comercial do parceiro ────────────────────────────────────
    // O desconto vai NO TICKET, nao no formulario do hand-off: o ticket e'
    // criado aqui a partir da sessao autenticada e resgatado servidor-a-
    // servidor pelo Woo. Se fosse pelo formulario, o cliente trocaria o
    // cupom de 5% pelo de 10% no inspetor do navegador.
    const tier = (profile.tier as string | null) ?? "padrao";
    let discountPct = 0;
    const { data: tierDef } = await admin
      .from("tier_defaults")
      .select("discount_pct")
      .eq("tier", tier)
      .maybeSingle();
    if (tierDef?.discount_pct != null) discountPct = Number(tierDef.discount_pct);
    // override individual manda mais que o padrao do nivel
    if (profile.discount_override != null) discountPct = Number(profile.discount_override);
    // trava de sanidade: nada fora de 0-100 chega ao Woo
    if (!Number.isFinite(discountPct) || discountPct < 0 || discountPct > 100) discountPct = 0;

    const payload = {
      v: 1 as const,
      user_id: userId,
      email,
      // consumidos pelo snippet de hand-off no Woo para aplicar o cupom
      tier,
      discount_pct: discountPct,
      billing: {
        first_name: firstName || (profile.empresa ?? ""),
        last_name: lastName || "",
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
        persontype: 2, // Brazilian Market on WooCommerce: 1 = PF, 2 = PJ
      },
    };

    const ticket = randomTicket(32);
    const now = new Date();
    const expiresAt = new Date(now.getTime() + TICKET_TTL_SECONDS * 1000);

    const { error: insErr } = await admin.from("checkout_tickets").insert({
      ticket,
      user_id: userId,
      payload,
      created_at: now.toISOString(),
      expires_at: expiresAt.toISOString(),
    });
    if (insErr) {
      console.error("[checkout-ticket-create] insert failed", insErr);
      return json({ error: "ticket_persist_failed" }, 500);
    }

    return json({
      ticket,
      expires_at: expiresAt.toISOString(),
      ttl_seconds: TICKET_TTL_SECONDS,
    });
  } catch (e) {
    console.error("[checkout-ticket-create]", e);
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

// >=32 bytes of entropy encoded as base64url (no padding).
function randomTicket(bytes: number): string {
  const buf = new Uint8Array(bytes);
  crypto.getRandomValues(buf);
  let bin = "";
  for (let i = 0; i < buf.length; i++) bin += String.fromCharCode(buf[i]);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
