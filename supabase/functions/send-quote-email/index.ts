import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { createClient } from 'npm:@supabase/supabase-js@2';
import { sendEmail, brandedEmailHtml, BRAND } from '../_shared/email.ts';


/**
 * Esta funcao roda com verify_jwt = false porque o fluxo B2C de orcamento e
 * anonimo — o visitante nao esta logado. Sem barreira nenhuma, porem, ela e
 * um relay aberto: a URL aparece na aba Network do proprio site, e qualquer
 * um poderia disparar e-mail com remetente Western <no-reply@westernstore.com.br>
 * e anexo arbitrario. Um unico abuso queima a reputacao do dominio e joga
 * TODOS os e-mails da loja no spam.
 *
 * As tres travas abaixo nao exigem login e nao quebram o fluxo legitimo:
 *   1. limite por IP (janela curta)
 *   2. teto diario global
 *   3. tamanho maximo do anexo
 */
const LIMITE_POR_IP = 5;          // envios por IP na janela
const JANELA_MIN = 15;            // minutos
const TETO_DIARIO = 200;          // envios/dia no total
const PDF_MAX_BYTES = 5 * 1024 * 1024;

function emailValido(e: string): boolean {
  return /^[^@\s]+@[^@\s.]+\.[^@\s]{2,}$/.test(e) && e.length <= 254;
}

async function dentroDoLimite(admin: ReturnType<typeof createClient>, ip: string | null) {
  const desde = new Date(Date.now() - JANELA_MIN * 60_000).toISOString();
  const chave = `sqe:${ip ?? 'sem-ip'}`;
  const { count } = await admin
    .from('credenciar_rate_buckets')
    .select('id', { count: 'exact', head: true })
    .eq('bucket_key', chave)
    .gte('created_at', desde);
  if ((count ?? 0) >= LIMITE_POR_IP) return false;
  await admin.from('credenciar_rate_buckets').insert({ bucket_key: chave });

  const hoje = new Date().toISOString().slice(0, 10);
  const { data: dia } = await admin
    .from('credenciar_daily_counters')
    .select('count')
    .eq('day', hoje).eq('counter_key', 'sqe:global')
    .maybeSingle();
  const atual = dia?.count ?? 0;
  if (atual >= TETO_DIARIO) return false;
  await admin.from('credenciar_daily_counters')
    .upsert({ day: hoje, counter_key: 'sqe:global', count: atual + 1 },
            { onConflict: 'day,counter_key' });
  return true;
}
function firstName(n?: string | null) {
  if (!n) return '';
  return String(n).trim().split(/\s+/)[0] ?? '';
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const body = await req.json().catch(() => null) as
      | { email?: string; nome?: string; numero?: string; pdfBase64?: string }
      | null;

    const email = body?.email?.trim();
    const pdfBase64 = body?.pdfBase64;
    const numero = (body?.numero || 'SN').toString();
    const nome = body?.nome ?? null;

    if (!email || !pdfBase64) {
      return new Response(JSON.stringify({ ok: false, error: 'missing email or pdfBase64' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const responde = (status: number, corpo: unknown) =>
      new Response(JSON.stringify(corpo), {
        status, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    if (!emailValido(email)) return responde(400, { ok: false, error: 'email_invalido' });

    // base64 cresce ~4/3 sobre o binario
    if (pdfBase64.length * 0.75 > PDF_MAX_BYTES) {
      return responde(413, { ok: false, error: 'anexo_grande_demais' });
    }

    const ip =
      req.headers.get('CF-Connecting-IP') ||
      (req.headers.get('x-forwarded-for') ?? '').split(',')[0].trim() ||
      null;
    const admin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
      { auth: { persistSession: false } },
    );
    if (!(await dentroDoLimite(admin, ip))) {
      console.warn('send-quote-email bloqueado por limite', { ip });
      return responde(429, { ok: false, error: 'rate_limited' });
    }

    const hi = firstName(nome);
    const bodyHtml = `
      <p style="margin:0 0 14px;">Olá${hi ? `, ${hi}` : ''},</p>
      <p style="margin:0 0 14px;">Recebemos seu orçamento. O PDF está anexo neste e-mail — e guardado na sua conta, para você voltar quando quiser.</p>
      <p style="margin:0;">Nosso time comercial entra em contato em breve para dar sequência ao atendimento e alinhar os próximos passos.</p>
    `;

    const html = brandedEmailHtml({
      eyebrow: `Orçamento Nº ${numero}`,
      heading: 'Seu orçamento chegou.',
      bodyHtml,
      ctaLabel: 'Acompanhar meus orçamentos',
      ctaUrl: `${BRAND.siteUrl}/minha-conta/orcamentos`,
    });

    const result = await sendEmail({
      to: email,
      subject: `Seu orçamento Western Nº ${numero}`,
      html,
      attachments: [{
        filename: `western-orcamento-${numero}.pdf`,
        content: pdfBase64,
      }],
    });

    if (!result.ok) {
      return new Response(JSON.stringify({ ok: false, error: result.error, status: result.status ?? 500 }), {
        status: result.status ?? 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ ok: true, id: result.id ?? null }), {
      status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    console.error('send-quote-email exception', e);
    return new Response(JSON.stringify({ ok: false, error: String((e as Error)?.message ?? e) }), {
      status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
