import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';

const RESEND_URL = 'https://api.resend.com/emails';

const FROM = 'Western <no-reply@westernstore.com.br>';
const WHATSAPP_LABEL = '+55 11 95896-7088';
const WHATSAPP_LINK = 'https://wa.me/5511958967088';
const EMAIL_COMERCIAL = 'comercial@westernpools.com.br';

const GREEN = '#1d3025';
const GOLD = '#b7904f';
const CREAM = '#f5f0e6';

function firstName(n?: string | null) {
  if (!n) return '';
  return String(n).trim().split(/\s+/)[0] ?? '';
}

function buildHtml({ nome, numero }: { nome?: string | null; numero: string }) {
  const hi = firstName(nome);
  return `<!doctype html>
<html><head><meta charset="utf-8" /></head>
<body style="margin:0;padding:0;background:${CREAM};font-family:Georgia,'Times New Roman',serif;color:${GREEN};">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${CREAM};padding:32px 12px;">
    <tr><td align="center">
      <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border:1px solid rgba(29,48,37,0.08);">
        <tr><td style="background:${GREEN};padding:22px 28px;">
          <div style="font-family:Georgia,serif;color:${GOLD};letter-spacing:0.22em;font-size:11px;text-transform:uppercase;">Western</div>
          <div style="color:#f5f0e6;font-size:20px;margin-top:6px;letter-spacing:0.02em;">Seu orçamento Nº ${numero}</div>
        </td></tr>
        <tr><td style="padding:28px;">
          <p style="margin:0 0 14px;font-size:16px;line-height:1.55;">Olá${hi ? `, ${hi}` : ''},</p>
          <p style="margin:0 0 14px;font-size:15px;line-height:1.65;color:#2a3a30;">Recebemos sua composição. O PDF do orçamento está em anexo neste e-mail.</p>
          <p style="margin:0 0 14px;font-size:15px;line-height:1.65;color:#2a3a30;">Nosso time comercial entra em contato em breve para dar sequência ao atendimento e alinhar os próximos passos.</p>
          <div style="height:1px;background:${GOLD};opacity:0.35;margin:24px 0;"></div>
          <p style="margin:0 0 6px;font-size:13px;color:#3a4a40;">Se preferir falar agora:</p>
          <p style="margin:0;font-size:14px;line-height:1.7;">
            WhatsApp: <a href="${WHATSAPP_LINK}" style="color:${GOLD};text-decoration:none;">${WHATSAPP_LABEL}</a><br/>
            E-mail: <a href="mailto:${EMAIL_COMERCIAL}" style="color:${GOLD};text-decoration:none;">${EMAIL_COMERCIAL}</a>
          </p>
        </td></tr>
        <tr><td style="background:${GREEN};padding:14px 28px;text-align:center;color:#f5f0e6;font-size:11px;letter-spacing:0.18em;text-transform:uppercase;">
          Western · Pedras artesanais
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
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

    const RESEND_API_KEY = Deno.env.get('RESEND_DIRECT_API_KEY') || Deno.env.get('RESEND_API_KEY');
    if (!RESEND_API_KEY) {
      console.error('send-quote-email: missing RESEND_API_KEY');
      return new Response(JSON.stringify({ ok: false, error: 'RESEND_API_KEY not configured' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const resp = await fetch(RESEND_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: FROM,
        to: [email],
        subject: `Seu orçamento Western Nº ${numero}`,
        html: buildHtml({ nome, numero }),
        attachments: [{
          filename: `western-orcamento-${numero}.pdf`,
          content: pdfBase64,
        }],
      }),
    });

    if (!resp.ok) {
      const txt = await resp.text();
      console.error(`send-quote-email resend failed [${resp.status}]: ${txt}`);
      return new Response(JSON.stringify({ ok: false, error: txt, status: resp.status }), {
        status: resp.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const data = await resp.json().catch(() => ({}));
    return new Response(JSON.stringify({ ok: true, id: (data as any)?.id ?? null }), {
      status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    console.error('send-quote-email exception', e);
    return new Response(JSON.stringify({ ok: false, error: String((e as Error)?.message ?? e) }), {
      status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
