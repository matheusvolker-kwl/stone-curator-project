// Edge function: credenciar
// Exige JWT do Supabase (verify_jwt = true).
// Body: { cnpj, nome?, email?, sem_cartao?, card_path?, mode?: "self" | "reavaliar", credenciamento_id? }
// Cascata: ReceitaWS (se token e cota diária) -> BrasilAPI -> CNPJá Open.
// Decide: aprovado | analise | reprovado | solicitar_cartao. Persiste em credenciamentos
// e, se aprovado em CNAE verde, marca partner_profiles como approved no tier "light".
import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { z } from "npm:zod@3.23.8";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const RECEITAWS_TOKEN = Deno.env.get("RECEITAWS_TOKEN") ?? "";

// Reforços de proteção
const RATE_WINDOW_MS = 60_000;     // 1 minuto
const RATE_MAX_PER_WINDOW = 5;     // 5 req/min por IP+CNPJ
const RECEITAWS_DAILY_CAP = 300;   // teto diário para proteger a cota paga

const BodySchema = z.object({
  cnpj: z.string().min(11).max(20),
  nome: z.string().max(160).optional(),
  email: z.string().max(320).optional(),
  sem_cartao: z.boolean().optional(),
  card_path: z.string().max(300).optional(),
  mode: z.enum(["self", "reavaliar"]).optional(),
  credenciamento_id: z.string().uuid().optional(),
});

type Normalized = {
  fonte: "receitaws" | "brasilapi" | "cnpja";
  razao: string;
  situacao: string;
  cnaePrincipal: string;
  cnaesSecundarios: string[];
  raw: unknown;
};

const onlyDigits = (s: string) => (s ?? "").replace(/\D/g, "");
const cleanCnae = (s: unknown) => onlyDigits(String(s ?? "")).slice(0, 7);

function validateCNPJ(raw: string): boolean {
  const c = onlyDigits(raw);
  if (c.length !== 14 || /^(\d)\1+$/.test(c)) return false;
  const calc = (base: string, w: number[]) => {
    const s = base.split("").reduce((a, n, i) => a + parseInt(n, 10) * w[i], 0);
    const r = s % 11;
    return r < 2 ? 0 : 11 - r;
  };
  const w1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const w2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const d1 = calc(c.slice(0, 12), w1);
  const d2 = calc(c.slice(0, 12) + d1, w2);
  return d1 === parseInt(c[12], 10) && d2 === parseInt(c[13], 10);
}

async function fetchWithTimeout(url: string, init: RequestInit = {}, ms = 6000) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), ms);
  try {
    return await fetch(url, { ...init, signal: ctrl.signal });
  } finally {
    clearTimeout(t);
  }
}

/* ---------- Rate limit & cotas ---------- */

type Admin = ReturnType<typeof createClient>;

async function checkRateLimit(admin: Admin, ip: string, cnpj: string): Promise<boolean> {
  const key = `${ip}|${cnpj}`;
  const since = new Date(Date.now() - RATE_WINDOW_MS).toISOString();
  const { count } = await admin
    .from("credenciar_rate_buckets")
    .select("id", { count: "exact", head: true })
    .eq("bucket_key", key)
    .gte("created_at", since);
  if ((count ?? 0) >= RATE_MAX_PER_WINDOW) return false;
  await admin.from("credenciar_rate_buckets").insert({ bucket_key: key });
  return true;
}

async function consumeDailyQuota(admin: Admin, key: string, cap: number): Promise<boolean> {
  const today = new Date().toISOString().slice(0, 10);
  const { data: existing } = await admin
    .from("credenciar_daily_counters")
    .select("count")
    .eq("day", today)
    .eq("counter_key", key)
    .maybeSingle();
  const current = existing?.count ?? 0;
  if (current >= cap) return false;
  await admin
    .from("credenciar_daily_counters")
    .upsert({ day: today, counter_key: key, count: current + 1 }, { onConflict: "day,counter_key" });
  return true;
}

/* ---------- Fontes ---------- */

async function fromReceitaWS(cnpj: string, admin: Admin): Promise<Normalized | null> {
  if (!RECEITAWS_TOKEN) return null;
  const allowed = await consumeDailyQuota(admin, "receitaws", RECEITAWS_DAILY_CAP);
  if (!allowed) {
    console.warn("[credenciar] receitaws daily cap atingido, pulando para próxima fonte");
    return null;
  }
  try {
    const r = await fetchWithTimeout(`https://receitaws.com.br/v1/cnpj/${cnpj}`, {
      headers: { Authorization: `Bearer ${RECEITAWS_TOKEN}` },
    });
    if (!r.ok) return null;
    const j = await r.json();
    if (j?.status === "ERROR") return null;
    const principal = cleanCnae(j?.atividade_principal?.[0]?.code);
    if (!principal) return null;
    const sec = Array.isArray(j?.atividades_secundarias)
      ? j.atividades_secundarias.map((a: { code?: string }) => cleanCnae(a?.code)).filter(Boolean)
      : [];
    return {
      fonte: "receitaws",
      razao: String(j?.nome ?? ""),
      situacao: String(j?.situacao ?? "").toUpperCase().trim(),
      cnaePrincipal: principal,
      cnaesSecundarios: sec,
      raw: j,
    };
  } catch {
    return null;
  }
}

async function fromBrasilAPI(cnpj: string): Promise<Normalized | null> {
  try {
    const r = await fetchWithTimeout(`https://brasilapi.com.br/api/cnpj/v1/${cnpj}`);
    if (!r.ok) return null;
    const j = await r.json();
    const principal = cleanCnae(j?.cnae_fiscal);
    if (!principal) return null;
    const sec = Array.isArray(j?.cnaes_secundarios)
      ? j.cnaes_secundarios.map((a: { codigo?: number | string }) => cleanCnae(a?.codigo)).filter(Boolean)
      : [];
    return {
      fonte: "brasilapi",
      razao: String(j?.razao_social ?? ""),
      situacao: String(j?.descricao_situacao_cadastral ?? "").toUpperCase().trim(),
      cnaePrincipal: principal,
      cnaesSecundarios: sec,
      raw: j,
    };
  } catch {
    return null;
  }
}

async function fromCNPJa(cnpj: string): Promise<Normalized | null> {
  try {
    const r = await fetchWithTimeout(`https://open.cnpja.com/office/${cnpj}`);
    if (!r.ok) return null;
    const j = await r.json();
    const principal = cleanCnae(j?.mainActivity?.id);
    if (!principal) return null;
    const sec = Array.isArray(j?.sideActivities)
      ? j.sideActivities.map((a: { id?: number | string }) => cleanCnae(a?.id)).filter(Boolean)
      : [];
    return {
      fonte: "cnpja",
      razao: String(j?.company?.name ?? j?.alias ?? ""),
      situacao: String(j?.status?.text ?? "").toUpperCase().trim(),
      cnaePrincipal: principal,
      cnaesSecundarios: sec,
      raw: j,
    };
  } catch {
    return null;
  }
}

/* ---------- Decisão ---------- */

type Decisao = "aprovado" | "analise" | "reprovado" | "solicitar_cartao";
type WhitelistTier = "verde" | "amarela" | "laranja";

function isSituacaoAtiva(s: string): boolean {
  const up = s.toUpperCase();
  return up === "ATIVA" || up === "ACTIVE";
}

type Decision = {
  decisao: Decisao;
  motivo: string;
  cnae_match: string | null;
  cnae_match_tier: WhitelistTier | null;
  tier: "light" | null;
};

function decide(
  situacao: string,
  principal: string,
  secundarios: string[],
  whitelist: Map<string, WhitelistTier>,
): Decision {
  if (!isSituacaoAtiva(situacao)) {
    return {
      decisao: "reprovado",
      motivo: `Situação cadastral ${situacao || "desconhecida"}`,
      cnae_match: null,
      cnae_match_tier: null,
      tier: null,
    };
  }
  const todos = [principal, ...secundarios].filter(Boolean);
  // CNAE verde → aprova no tier de entrada (light). Upgrade é manual pelo comercial.
  for (const c of todos) {
    if (whitelist.get(c) === "verde") {
      return {
        decisao: "aprovado",
        motivo: `CNAE ${c} em faixa verde`,
        cnae_match: c,
        cnae_match_tier: "verde",
        tier: "light",
      };
    }
  }
  for (const c of todos) {
    const t = whitelist.get(c);
    if (t === "amarela" || t === "laranja") {
      return {
        decisao: "analise",
        motivo: `CNAE ${c} em faixa ${t} (análise manual)`,
        cnae_match: c,
        cnae_match_tier: t,
        tier: null,
      };
    }
  }
  return {
    decisao: "analise",
    motivo: "Nenhum CNAE da empresa consta na whitelist",
    cnae_match: null,
    cnae_match_tier: null,
    tier: null,
  };
}

function genProtocolo(): string {
  const d = new Date();
  const ymd = `${d.getUTCFullYear()}${String(d.getUTCMonth() + 1).padStart(2, "0")}${String(d.getUTCDate()).padStart(2, "0")}`;
  const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `CRD-${ymd}-${rand}`;
}

function jsonResp(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

/* ---------- Handler ---------- */

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    // 1) Autenticação obrigatória (Supabase JWT)
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return jsonResp({ error: "unauthorized" }, 401);
    }
    const userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsErr } = await userClient.auth.getClaims(token);
    if (claimsErr || !claimsData?.claims?.sub) {
      return jsonResp({ error: "unauthorized" }, 401);
    }
    const callerUserId = claimsData.claims.sub as string;

    // 2) Validação do body
    const body = await req.json().catch(() => ({}));
    const parsed = BodySchema.safeParse(body);
    if (!parsed.success) {
      return jsonResp({ error: parsed.error.flatten().fieldErrors }, 400);
    }
    const { nome, email, sem_cartao, card_path, mode, credenciamento_id } = parsed.data;
    const cnpj = onlyDigits(parsed.data.cnpj);
    if (!validateCNPJ(cnpj)) return jsonResp({ error: "cnpj_invalido" }, 400);

    const admin = createClient(SUPABASE_URL, SERVICE_ROLE, { auth: { persistSession: false } });

    // 3) Resolve sujeito: self (o próprio caller) ou reavaliar (admin re-trigger)
    let subjectUserId: string | null = callerUserId;
    if (mode === "reavaliar") {
      const { data: isAdmin } = await admin.rpc("has_role", {
        _user_id: callerUserId, _role: "admin",
      });
      if (!isAdmin) return jsonResp({ error: "forbidden" }, 403);
      if (credenciamento_id) {
        const { data: prev } = await admin
          .from("credenciamentos")
          .select("user_id")
          .eq("id", credenciamento_id)
          .maybeSingle();
        subjectUserId = prev?.user_id ?? null;
      } else {
        subjectUserId = null;
      }
    }

    // 4) Rate-limit por IP+CNPJ
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
      || req.headers.get("cf-connecting-ip")
      || "unknown";
    const allowed = await checkRateLimit(admin, ip, cnpj);
    if (!allowed) {
      return jsonResp({ error: "rate_limited", motivo: "Muitas tentativas — aguarde 1 minuto." }, 429);
    }

    // 5) Carrega whitelist
    const { data: wlRows } = await admin.from("cnae_whitelist").select("codigo, tier");
    const whitelist = new Map<string, WhitelistTier>(
      (wlRows ?? []).map((r) => [String(r.codigo), r.tier as WhitelistTier]),
    );

    // 6) Cascata de fontes
    let norm: Normalized | null = await fromReceitaWS(cnpj, admin);
    if (!norm) norm = await fromBrasilAPI(cnpj);
    if (!norm) norm = await fromCNPJa(cnpj);

    const protocolo = genProtocolo();

    // 7) Sem fonte
    if (!norm) {
      if (sem_cartao || card_path) {
        const fonteFila = card_path ? "cartao" : "nenhuma";
        const { data: ins } = await admin
          .from("credenciamentos")
          .insert({
            user_id: subjectUserId, cnpj, nome, email,
            decisao: "analise",
            motivo: card_path
              ? "Fontes públicas indisponíveis; Cartão CNPJ enviado para conferência manual"
              : "Fontes públicas indisponíveis; cliente seguiu sem enviar o Cartão CNPJ",
            fonte: fonteFila,
            protocolo,
            card_path: card_path ?? null,
            status_manual: "pendente",
          })
          .select("id")
          .single();

        await admin.from("leads").insert({
          type: "credenciamento",
          nome, email,
          empresa: nome ?? null,
          origem: "credenciar_fontes_falharam",
          mensagem: `Novo credenciamento (CNPJ ${cnpj}) sem confirmação automática. Protocolo ${protocolo}.`,
          payload: { credenciamento_id: ins?.id, protocolo, cnpj, card_path: card_path ?? null },
          user_id: subjectUserId ?? null,
        });

        return jsonResp({
          decisao: "analise",
          motivo: "Fontes públicas indisponíveis — análise manual em até 2 dias úteis",
          fonte: fonteFila, cnae_match: null, tier: null,
          empresa: null, situacao: null, protocolo,
        });
      }
      return jsonResp({
        decisao: "solicitar_cartao",
        motivo: "Não conseguimos confirmar seu CNPJ nas bases públicas. Envie o Cartão CNPJ.",
        fonte: null, cnae_match: null, tier: null,
        empresa: null, situacao: null, protocolo: null,
      });
    }

    const d = decide(norm.situacao, norm.cnaePrincipal, norm.cnaesSecundarios, whitelist);

    const { data: ins } = await admin
      .from("credenciamentos")
      .insert({
        user_id: subjectUserId, cnpj, nome, email,
        empresa: norm.razao,
        decisao: d.decisao, motivo: d.motivo, fonte: norm.fonte,
        cnae_principal: norm.cnaePrincipal,
        cnaes_secundarios: norm.cnaesSecundarios,
        cnae_match: d.cnae_match,
        cnae_match_tier: d.cnae_match_tier,
        situacao: norm.situacao,
        tier: d.tier,
        protocolo,
        card_path: card_path ?? null,
        status_manual: d.decisao === "analise" ? "pendente" : "na",
        raw_response: norm.raw as Record<string, unknown>,
      })
      .select("id")
      .single();

    // Aprovação imediata → tier de entrada (light)
    if (d.decisao === "aprovado" && subjectUserId && d.tier) {
      await admin
        .from("partner_profiles")
        .update({
          status: "approved",
          tier: d.tier,
          credenciamento_id: ins?.id ?? null,
          credenciado_em: new Date().toISOString(),
          credenciado_fonte: norm.fonte,
          approved_at: new Date().toISOString(),
        })
        .eq("user_id", subjectUserId);
    }

    // Reprovação → mantém conta, marca rejected (permite reaplicação)
    if (d.decisao === "reprovado" && subjectUserId) {
      await admin
        .from("partner_profiles")
        .update({ status: "rejected" })
        .eq("user_id", subjectUserId);
    }

    if (d.decisao === "analise") {
      await admin.from("leads").insert({
        type: "credenciamento",
        nome, email,
        empresa: norm.razao,
        cnpj,
        origem: mode === "reavaliar" ? "credenciar_reavaliacao" : "credenciar_analise_manual",
        mensagem: `Credenciamento em análise. ${d.motivo}. Protocolo ${protocolo}.`,
        payload: {
          credenciamento_id: ins?.id, protocolo,
          cnae_principal: norm.cnaePrincipal,
          cnae_match: d.cnae_match,
          cnae_match_tier: d.cnae_match_tier,
          fonte: norm.fonte,
        },
        user_id: subjectUserId ?? null,
      });
    }

    return jsonResp({
      decisao: d.decisao, motivo: d.motivo, fonte: norm.fonte,
      cnae_match: d.cnae_match, cnae_match_tier: d.cnae_match_tier,
      tier: d.tier, empresa: norm.razao, situacao: norm.situacao, protocolo,
    });
  } catch (e) {
    console.error("[credenciar] erro", e);
    return jsonResp({ error: "internal_error" }, 500);
  }
});
