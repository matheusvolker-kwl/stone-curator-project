// One-shot edge function to create the very first admin user.
// Self-disables after a successful run via system_flags.admin_bootstrap_done.
import { createClient } from "npm:@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface BootstrapBody {
  email?: string;
  password?: string;
  nome?: string;
  empresa?: string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const url = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const admin = createClient(url, serviceKey, { auth: { persistSession: false } });

  // 1. Check the one-shot flag
  const { data: flag } = await admin
    .from("system_flags")
    .select("value")
    .eq("key", "admin_bootstrap_done")
    .maybeSingle();
  if (flag && (flag.value as { done?: boolean })?.done) {
    return new Response(JSON.stringify({ error: "Bootstrap already used. Disabled." }), {
      status: 403,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // 2. Validate body
  let body: BootstrapBody;
  try {
    body = (await req.json()) as BootstrapBody;
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  const email = body.email?.trim().toLowerCase();
  const password = body.password;
  if (!email || !password || password.length < 8) {
    return new Response(
      JSON.stringify({ error: "email e password (>=8) obrigatórios" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  // 3. Create or update auth user (auto-confirmed)
  let uid: string | null = null;
  const { data: created, error: createErr } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      nome: body.nome ?? "Master Admin",
      empresa: body.empresa ?? "Western Pools",
    },
  });
  if (createErr) {
    // Already exists → find and update password
    const { data: list } = await admin.auth.admin.listUsers();
    const existingUser = list?.users?.find((u) => u.email?.toLowerCase() === email);
    if (!existingUser) {
      return new Response(JSON.stringify({ error: createErr.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    uid = existingUser.id;
    await admin.auth.admin.updateUserById(uid, { password, email_confirm: true });
  } else {
    uid = created.user!.id;
  }

  // 4. Insert admin role
  await admin.from("user_roles").insert({ user_id: uid, role: "admin" });

  // 5. Ensure profile exists, mark approved + partner tier
  const { data: existing } = await admin
    .from("partner_profiles")
    .select("id")
    .eq("user_id", uid)
    .maybeSingle();
  if (existing) {
    await admin
      .from("partner_profiles")
      .update({
        status: "approved",
        approved_at: new Date().toISOString(),
        tier: "partner",
        empresa: body.empresa ?? "Western Pools",
        nome: body.nome ?? "Master Admin",
      })
      .eq("user_id", uid);
  } else {
    await admin.from("partner_profiles").insert({
      user_id: uid,
      empresa: body.empresa ?? "Western Pools",
      nome: body.nome ?? "Master Admin",
      status: "approved",
      approved_at: new Date().toISOString(),
      tier: "partner",
    });
  }

  // 6. Lock the bootstrap
  await admin
    .from("system_flags")
    .upsert({ key: "admin_bootstrap_done", value: { done: true, at: new Date().toISOString(), email } });

  return new Response(
    JSON.stringify({
      ok: true,
      user_id: uid,
      email,
      message: "Admin master criado. Faça login em /parceiro/login.",
    }),
    { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
  );
});
