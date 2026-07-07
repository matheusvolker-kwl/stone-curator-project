import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { sendEmail, brandedEmailHtml } from '../_shared/email.ts';

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

    const hi = firstName(nome);
    const bodyHtml = `
      <p style="margin:0 0 14px;">Olá${hi ? `, ${hi}` : ''},</p>
      <p style="margin:0 0 14px;">Recebemos sua composição. O PDF do orçamento está em anexo neste e-mail.</p>
      <p style="margin:0;">Nosso time comercial entra em contato em breve para dar sequência ao atendimento e alinhar os próximos passos.</p>
    `;

    const html = brandedEmailHtml({
      eyebrow: `Orçamento Nº ${numero}`,
      heading: 'Sua composição foi recebida',
      bodyHtml,
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
