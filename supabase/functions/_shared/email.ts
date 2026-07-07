// Shared email helpers for Western transactional emails.
// Sends via Resend directly. Do NOT import from src/ — edge functions are isolated.

const RESEND_URL = 'https://api.resend.com/emails';
const FROM = 'Western <no-reply@westernstore.com.br>';

// Espelha src/config/business.ts (edge functions não podem importar de src/)
export const BRAND = {
  green: '#1d3025',
  gold: '#b7904f',
  cream: '#f5f0e6',
  atelieEndereco: 'Rua Colina, 38 — Jardim Paraíso · Cajamar/SP · 07794-075',
  whatsappLabel: '+55 11 95896-7088',
  whatsappLink: 'https://wa.me/5511958967088',
  atendimentoEmail: 'atendimento@westernstore.com.br',
  razaoSocial: 'Western Pools - Cascatas e Pedras Artesanais LTDA',
  cnpj: '10.465.584/0001-24',
  siteUrl: 'https://westernstore.com.br',
  horarioAtendimento: 'Seg–Sex · 9h às 17h',
  // instagram: (não configurado em business.ts)
} as const;

export interface SendEmailInput {
  to: string | string[];
  subject: string;
  html: string;
  attachments?: Array<{ filename: string; content: string }>;
}

export async function sendEmail(input: SendEmailInput): Promise<{ ok: boolean; id?: string; error?: string; status?: number }> {
  const directKey = Deno.env.get('RESEND_DIRECT_API_KEY');
  const legacyKey = Deno.env.get('RESEND_API_KEY');
  const key = directKey || (legacyKey?.startsWith('re_') ? legacyKey : undefined);
  if (!key) {
    console.error('sendEmail: RESEND_DIRECT_API_KEY not configured');
    return { ok: false, error: 'RESEND_DIRECT_API_KEY not configured' };
  }
  try {
    const resp = await fetch(RESEND_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        from: FROM,
        to: Array.isArray(input.to) ? input.to : [input.to],
        subject: input.subject,
        html: input.html,
        attachments: input.attachments,
      }),
    });
    if (!resp.ok) {
      const txt = await resp.text();
      console.error(`sendEmail resend failed [${resp.status}]: ${txt}`);
      return { ok: false, error: txt, status: resp.status };
    }
    const data = await resp.json().catch(() => ({}));
    return { ok: true, id: (data as { id?: string })?.id ?? undefined };
  } catch (e) {
    console.error('sendEmail exception', e);
    return { ok: false, error: String((e as Error)?.message ?? e) };
  }
}

export interface BrandedEmailInput {
  heading: string;
  eyebrow?: string;
  bodyHtml: string;
  ctaLabel?: string;
  ctaUrl?: string;
}

export function brandedEmailHtml({ heading, eyebrow, bodyHtml, ctaLabel, ctaUrl }: BrandedEmailInput): string {
  const { green, gold, cream, atelieEndereco, whatsappLabel, whatsappLink, atendimentoEmail, razaoSocial, cnpj, siteUrl, horarioAtendimento } = BRAND;
  const year = new Date().getFullYear();

  const eyebrowHtml = eyebrow
    ? `<div style="font-family:Georgia,'Times New Roman',serif;color:${gold};letter-spacing:0.22em;font-size:11px;text-transform:uppercase;margin-bottom:10px;">${eyebrow}</div>`
    : '';

  const ctaHtml = ctaLabel && ctaUrl
    ? `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:26px 0 6px;"><tr><td style="background:${gold};border-radius:2px;">
         <a href="${ctaUrl}" style="display:inline-block;padding:13px 26px;color:#ffffff;font-family:Georgia,serif;font-size:14px;letter-spacing:0.12em;text-transform:uppercase;text-decoration:none;">${ctaLabel}</a>
       </td></tr></table>`
    : '';

  return `<!doctype html>
<html><head><meta charset="utf-8" /><meta name="viewport" content="width=device-width,initial-scale=1" /></head>
<body style="margin:0;padding:0;background:${cream};font-family:Georgia,'Times New Roman',serif;color:${green};-webkit-font-smoothing:antialiased;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${cream};padding:32px 12px;">
    <tr><td align="center">
      <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:#ffffff;border:1px solid rgba(29,48,37,0.10);">

        <!-- Header: creme com wordmark verde (igual ao site) -->
        <tr><td style="background:${cream};padding:26px 28px;text-align:center;border-bottom:1px solid rgba(29,48,37,0.08);">
          <div style="font-family:Georgia,'Times New Roman',serif;color:${green};font-size:28px;letter-spacing:0.42em;font-weight:normal;">WESTERN</div>
          <div style="font-family:Georgia,serif;color:${gold};letter-spacing:0.28em;font-size:10px;text-transform:uppercase;margin-top:6px;">Pedras Artesanais</div>
        </td></tr>

        <!-- Body -->
        <tr><td style="padding:32px 30px 28px;">
          ${eyebrowHtml}
          <h1 style="margin:0 0 18px;font-family:Georgia,'Times New Roman',serif;color:${green};font-size:22px;line-height:1.3;font-weight:normal;letter-spacing:0.01em;">${heading}</h1>
          <div style="font-family:Georgia,serif;color:#2a3a30;font-size:15px;line-height:1.7;">${bodyHtml}</div>
          ${ctaHtml}
        </td></tr>

        <!-- Divider dourado -->
        <tr><td style="padding:0 30px;"><div style="height:1px;background:${gold};opacity:0.35;"></div></td></tr>

        <!-- Rodapé: link para a loja -->
        <tr><td style="padding:20px 30px 6px;text-align:center;font-family:Georgia,'Times New Roman',serif;">
          <a href="${siteUrl}" style="color:${green};font-size:13px;letter-spacing:0.18em;text-transform:uppercase;text-decoration:none;border-bottom:1px solid ${gold};padding-bottom:2px;">Visitar a loja →</a>
        </td></tr>

        <!-- Rodapé: aviso -->
        <tr><td style="padding:16px 30px 0;text-align:center;">
          <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.6;color:#6b7a70;font-style:italic;">
            Este é um e-mail automático e não recebe respostas.<br/>Para falar com a gente, escreva para <a href="mailto:${atendimentoEmail}" style="color:${gold};text-decoration:none;font-style:normal;">${atendimentoEmail}</a>.
          </p>
        </td></tr>

        <!-- Rodapé: contato -->
        <tr><td style="padding:18px 30px 10px;text-align:center;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:1.7;color:#2a3a30;">
          <a href="${whatsappLink}" style="color:${green};text-decoration:none;">WhatsApp <span style="color:${gold};">${whatsappLabel}</span></a>
          <span style="color:${gold};padding:0 10px;">·</span>
          <a href="mailto:${atendimentoEmail}" style="color:${green};text-decoration:none;">${atendimentoEmail}</a>
        </td></tr>

        <!-- Rodapé: institucional -->
        <tr><td style="padding:14px 30px 24px;text-align:center;">
          <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:11px;line-height:1.7;color:#6b7a70;letter-spacing:0.01em;">
            ${razaoSocial}<br/>
            CNPJ ${cnpj}<br/>
            ${atelieEndereco}<br/>
            ${horarioAtendimento}
          </p>
        </td></tr>

        <!-- Faixa final verde -->
        <tr><td style="background:${green};padding:14px 28px;text-align:center;color:${cream};font-family:Georgia,serif;font-size:10px;letter-spacing:0.28em;text-transform:uppercase;">
          © ${year} Western · Pedras Artesanais
        </td></tr>

      </table>
    </td></tr>
  </table>
</body></html>`;
}
