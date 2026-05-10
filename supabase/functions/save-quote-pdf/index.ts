import { createClient } from "npm:@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface SaveQuotePdfBody {
  leadId?: string;
  pdfBase64?: string;
  subtotal?: number;
  itemsCount?: number;
}

function jsonResponse(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function decodeBase64Pdf(value: string): Uint8Array {
  const clean = value.includes(",") ? value.split(",").pop() ?? "" : value;
  const binary = atob(clean);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

interface AlertCtx {
  source: string;
  message: string;
  userId?: string | null;
  userEmail?: string | null;
  context?: Record<string, unknown>;
}

async function notify({ source, message, userId, userEmail, context }: AlertCtx, admin: ReturnType<typeof createClient>) {
  // Log estruturado
  console.error(JSON.stringify({ level: "error", source, message, userId, context }));

  // Persiste em client_errors (best-effort)
  admin
    .from("client_errors")
    .insert({
      source,
      severity: "error",
      message,
      user_id: userId ?? null,
      user_email: userEmail ?? null,
      context: context ?? {},
    })
    .then(({ error }) => {
      if (error) console.error("notify insert failed", error);
    });

  // Webhook opcional (Slack/Discord)
  const webhook = Deno.env.get("ALERT_WEBHOOK_URL");
  if (!webhook) return;
  try {
    const text =
      `:rotating_light: *${source}*\n${message}` +
      (userEmail ? `\n_user_: ${userEmail}` : "") +
      (context ? `\n\`\`\`${JSON.stringify(context).slice(0, 1500)}\`\`\`` : "");
    await fetch(webhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
  } catch (err) {
    console.error("alert webhook failed", err);
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return jsonResponse({ error: "Method not allowed" }, 405);

  const authHeader = req.headers.get("Authorization") ?? "";
  if (!authHeader.startsWith("Bearer ")) return jsonResponse({ error: "Authentication required" }, 401);

  const url = Deno.env.get("SUPABASE_URL")!;
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? Deno.env.get("SUPABASE_PUBLISHABLE_KEY")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

  const userClient = createClient(url, anonKey, {
    global: { headers: { Authorization: authHeader } },
    auth: { persistSession: false },
  });
  const { data: userData, error: userError } = await userClient.auth.getUser();
  const user = userData?.user;
  if (userError || !user) return jsonResponse({ error: "Invalid session" }, 401);

  let body: SaveQuotePdfBody;
  try {
    body = (await req.json()) as SaveQuotePdfBody;
  } catch {
    return jsonResponse({ error: "Invalid JSON" }, 400);
  }

  const leadId = body.leadId?.trim();
  if (!leadId || !body.pdfBase64) return jsonResponse({ error: "Missing PDF data" }, 400);

  let pdfBytes: Uint8Array;
  try {
    pdfBytes = decodeBase64Pdf(body.pdfBase64);
  } catch {
    return jsonResponse({ error: "Invalid PDF data" }, 400);
  }

  if (pdfBytes.length < 10 || pdfBytes.length > 8 * 1024 * 1024) {
    return jsonResponse({ error: "Invalid PDF size" }, 400);
  }

  const admin = createClient(url, serviceKey, { auth: { persistSession: false } });
  const storagePath = `${user.id}/${leadId}.pdf`;

  const { error: uploadError } = await admin.storage
    .from("orcamentos")
    .upload(storagePath, pdfBytes, {
      contentType: "application/pdf",
      upsert: true,
    });

  if (uploadError) {
    console.error("save-quote-pdf upload", uploadError);
    return jsonResponse({ error: "Could not save PDF" }, 500);
  }

  const { error: rowError } = await admin.from("quote_pdfs").upsert(
    {
      user_id: user.id,
      lead_id: leadId,
      storage_path: storagePath,
      subtotal: Number(body.subtotal ?? 0),
      items_count: Number(body.itemsCount ?? 0),
    },
    { onConflict: "user_id,storage_path" },
  );

  if (rowError) {
    console.error("save-quote-pdf row", rowError);
    return jsonResponse({ error: "Could not register PDF" }, 500);
  }

  return jsonResponse({ ok: true, storagePath });
});
