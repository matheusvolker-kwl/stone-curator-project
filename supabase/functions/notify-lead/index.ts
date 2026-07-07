import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { sendEmail, brandedEmailHtml } from '../_shared/email.ts';

// Fácil de trocar depois — pode virar array futuramente
const TEAM_EMAIL = 'atendimento@westernstore.com.br';

interface LeadNotifyBody {
  tipo?: string;
  nome?: string | null;
  email?: string | null;
  telefone?: string | null;
  empresa?: string | null;
  cidade?: string | null;
  mensagem?: string | null;
  origem?: string | null;
  resumo?: string | null;
}

function esc(v: unknown): string {
  return String(v ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function row(label: string, value?: string | null): string {
  const v = (value ?? '').toString().trim();
  if (!v) return '';
  return `<tr>
    <td style="padding:6px 12px 6px 0;color:#6b7a70;font-family:Arial,Helvetica,sans-serif;font-size:13px;vertical-align:top;white-space:nowrap;">${esc(label)}</td>
    <td style="padding:6px 0;color:#1d3025;font-family:Arial,Helvetica,sans-serif;font-size:14px;vertical-align:top;">${esc(v).replace(/\n/g, '<br/>')}</td>
  </tr>`;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const body = (await req.json().catch(() => ({}))) as LeadNotifyBody;
    const tipo = (body.tipo || 'lead').toString();
    const nome = body.nome ?? null;
    const email = body.email ?? null;

    const rows = [
      row('Nome', nome),
      row('E-mail', email),
      row('Telefone', body.telefone),
      row('Empresa', body.empresa),
      row('Cidade', body.cidade),
      row('Origem', body.origem),
      row('Mensagem', body.mensagem),
      row('Resumo', body.resumo),
    ].filter(Boolean).join('');

    const bodyHtml = `
      <p style="margin:0 0 14px;">Um novo lead entrou no site.</p>
      <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;border-top:1px solid rgba(29,48,37,0.10);margin-top:6px;">
        ${rows || '<tr><td style="padding:10px 0;font-family:Arial,sans-serif;font-size:13px;color:#6b7a70;">Sem dados adicionais.</td></tr>'}
      </table>
    `;

    const ctaUrl = tipo === 'orcamento'
      ? 'https://westernstore.com.br/admin/orcamentos'
      : 'https://westernstore.com.br/admin/leads';

    const html = brandedEmailHtml({
      eyebrow: 'Painel Western',
      heading: `Novo lead: ${tipo}`,
      bodyHtml,
      ctaLabel: 'Ver no painel',
      ctaUrl,
    });

    const subject = `Novo lead Western · ${tipo} · ${nome || email || 'sem nome'}`;

    const result = await sendEmail({ to: TEAM_EMAIL, subject, html });
    return new Response(JSON.stringify({ ok: result.ok, id: result.id ?? null }), {
      status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    console.error('notify-lead exception', e);
    return new Response(JSON.stringify({ ok: false, error: String((e as Error)?.message ?? e) }), {
      status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
