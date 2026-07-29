// Shared email helpers for Western transactional emails.
// Sends via Resend directly. Do NOT import from src/ — edge functions are isolated.

const RESEND_URL = 'https://api.resend.com/emails';
const FROM = 'Western <no-reply@westernstore.com.br>';

// Espelha src/config/business.ts (edge functions não podem importar de src/)
// Paleta = tokens do DS V3 (2026-07-18): verde profundo, dourado, areia.
export const BRAND = {
  green: '#0F2918',
  greenCta: '#1B3C26',
  gold: '#A68764',
  goldSoft: '#CBB289',
  cream: '#FBF8F3',
  wash: '#F0E8DA',
  hairline: '#E7DFCE',
  inkMuted: '#6E665A',
  atelieEndereco: 'Rua Colina, 38 — Jardim Paraíso · Cajamar/SP · 07794-075',
  whatsappLabel: '+55 11 95896-7088',
  whatsappLink: 'https://wa.me/5511958967088',
  atendimentoEmail: 'atendimento@westernstore.com.br',
  razaoSocial: 'Western Pools - Cascatas e Pedras Artesanais LTDA',
  cnpj: '10.465.584/0001-24',
  siteUrl: 'https://westernstore.com.br',
  horarioAtendimento: 'Seg–Sex · 9h às 17h',
  iconUrl: 'https://zibtysewpbeycngtbjjk.supabase.co/storage/v1/object/public/brand/icone-pedra.png',
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
  const { green, greenCta, gold, goldSoft, cream, wash, hairline, inkMuted, atelieEndereco, whatsappLabel, whatsappLink, atendimentoEmail, razaoSocial, cnpj, siteUrl, horarioAtendimento, iconUrl } = BRAND;
  const year = new Date().getFullYear();

  // DS V3: sans em tudo (a serifa era o visual institucional aposentado).
  // Webfont não sobrevive na maioria dos clientes de e-mail — a pilha cai em
  // Arial/Segoe mantendo pesos, caixa e cores da marca.
  const sans = `'Source Sans 3','Segoe UI',-apple-system,Arial,Helvetica,sans-serif`;
  const display = `'Archivo','Segoe UI',-apple-system,Arial,Helvetica,sans-serif`;

  const eyebrowHtml = eyebrow
    ? `<div style="font-family:${sans};color:${gold};letter-spacing:0.08em;font-weight:700;font-size:12px;text-transform:uppercase;margin-bottom:10px;">${eyebrow}</div>`
    : '';

  const ctaHtml = ctaLabel && ctaUrl
    ? `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:26px 0 6px;"><tr><td style="background:${greenCta};border-radius:10px;">
         <a href="${ctaUrl}" style="display:inline-block;padding:14px 26px;color:${cream};font-family:${sans};font-size:16px;font-weight:600;text-decoration:none;">${ctaLabel}</a>
       </td></tr></table>`
    : '';

  return `<!doctype html>
<html><head><meta charset="utf-8" /><meta name="viewport" content="width=device-width,initial-scale=1" /></head>
<body style="margin:0;padding:0;background:${cream};font-family:${sans};color:${green};-webkit-font-smoothing:antialiased;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${cream};padding:32px 12px;">
    <tr><td align="center">
      <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:#ffffff;border:1px solid ${hairline};border-radius:16px;overflow:hidden;">

        <!-- Header: faixa verde profunda com o símbolo + wordmark (a marca sobre verde usa bege/branco) -->
        <tr><td style="background:${green};padding:26px 28px;text-align:center;">
          <img src="${iconUrl}" alt="" width="40" style="display:block;margin:0 auto 10px;width:40px;height:auto;border:0;outline:none;" />
          <div style="font-family:${display};color:${cream};font-size:24px;letter-spacing:0.30em;font-weight:600;">WESTERN</div>
          <div style="font-family:${sans};color:${goldSoft};letter-spacing:0.12em;font-size:11px;font-weight:600;text-transform:uppercase;margin-top:6px;">Ateliê de pedras artesanais · desde 1993</div>
        </td></tr>

        <!-- Body -->
        <tr><td style="padding:32px 30px 28px;">
          ${eyebrowHtml}
          <h1 style="margin:0 0 16px;font-family:${display};color:${green};font-size:24px;line-height:1.25;font-weight:600;">${heading}</h1>
          <div style="font-family:${sans};color:${green};font-size:16px;line-height:1.6;">${bodyHtml}</div>
          ${ctaHtml}
        </td></tr>

        <!-- Faixa de contato em lavagem areia -->
        <tr><td style="padding:0 30px 26px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${wash};border-radius:12px;">
            <tr><td style="padding:16px 20px;text-align:center;font-family:${sans};font-size:15px;line-height:1.7;color:${green};">
              <a href="${whatsappLink}" style="color:${green};text-decoration:none;font-weight:600;">WhatsApp ${whatsappLabel}</a>
              <span style="color:${gold};padding:0 8px;">·</span>
              <a href="mailto:${atendimentoEmail}" style="color:${green};text-decoration:none;">${atendimentoEmail}</a>
            </td></tr>
          </table>
        </td></tr>

        <!-- Rodapé: aviso -->
        <tr><td style="padding:0 30px;"><div style="height:1px;background:${hairline};"></div></td></tr>
        <tr><td style="padding:18px 30px 0;text-align:center;">
          <p style="margin:0;font-family:${sans};font-size:13px;line-height:1.6;color:${inkMuted};">
            Este é um e-mail automático e não recebe respostas.<br/>Para falar com a gente, escreva para <a href="mailto:${atendimentoEmail}" style="color:${gold};text-decoration:none;font-weight:600;">${atendimentoEmail}</a>.
          </p>
        </td></tr>

        <!-- Rodapé: institucional -->
        <tr><td style="padding:14px 30px 24px;text-align:center;">
          <p style="margin:0;font-family:${sans};font-size:12px;line-height:1.7;color:${inkMuted};">
            ${razaoSocial}<br/>
            CNPJ ${cnpj}<br/>
            ${atelieEndereco}<br/>
            ${horarioAtendimento}
          </p>
        </td></tr>

        <!-- Faixa final verde -->
        <tr><td style="background:${green};padding:13px 28px;text-align:center;color:${goldSoft};font-family:${sans};font-size:11px;font-weight:600;letter-spacing:0.12em;text-transform:uppercase;">
          © ${year} Western · Pedras artesanais
        </td></tr>

      </table>
    </td></tr>
  </table>
</body></html>`;
}
