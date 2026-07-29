// Validações & helpers brasileiros — CNPJ, CPF, telefone (10/11), CEP (ViaCEP+BrasilAPI),
// e-mail (normalizado), datas dd/mm/aaaa, normalização de texto, mapeamento Woo.
import { z } from "zod";

export const onlyDigits = (v: string) => v.replace(/\D/g, "");

/** trim + colapsa espaços duplicados em strings de nome/texto livre. */
export const normalizeText = (v: string) => v.replace(/\s+/g, " ").trim();

/* ---------------- CNPJ ---------------- */
export function isValidCNPJ(raw: string): boolean {
  const cnpj = onlyDigits(raw);
  if (cnpj.length !== 14) return false;
  if (/^(\d)\1+$/.test(cnpj)) return false;
  const calc = (base: string, weights: number[]) => {
    const sum = base
      .split("")
      .reduce((acc, n, i) => acc + parseInt(n, 10) * weights[i], 0);
    const r = sum % 11;
    return r < 2 ? 0 : 11 - r;
  };
  const w1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const w2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const d1 = calc(cnpj.slice(0, 12), w1);
  const d2 = calc(cnpj.slice(0, 12) + d1, w2);
  return d1 === parseInt(cnpj[12], 10) && d2 === parseInt(cnpj[13], 10);
}

export const cnpjSchema = z
  .string()
  .transform(onlyDigits)
  .refine((v) => v.length === 14, { message: "CNPJ deve ter 14 dígitos" })
  .refine(isValidCNPJ, { message: "CNPJ inválido" });

/** Dados públicos do CNPJ (BrasilAPI). Preenche a razão social e o endereço,
 *  para o cadastro de parceiro não precisar digitar. */
export interface CnpjResult {
  razao_social: string;
  nome_fantasia: string;
  cep: string;
  logradouro: string;
  numero: string;
  complemento: string;
  bairro: string;
  municipio: string;
  uf: string;
  situacao: string; // descrição da situação cadastral (ex.: "ATIVA")
}

/** Consulta o CNPJ na BrasilAPI (pública e gratuita, sem chave). */
export async function fetchCnpj(cnpj: string): Promise<CnpjResult | null> {
  const d = onlyDigits(cnpj);
  if (d.length !== 14) return null;
  try {
    const r = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${d}`);
    if (!r.ok) return null;
    const j = (await r.json()) as Record<string, unknown>;
    if (!j || typeof j.razao_social !== "string") return null;
    const s = (k: string) => (typeof j[k] === "string" ? (j[k] as string) : "");
    return {
      razao_social: j.razao_social as string,
      nome_fantasia: s("nome_fantasia"),
      cep: j.cep ? onlyDigits(String(j.cep)) : "",
      logradouro: s("logradouro"),
      numero: j.numero != null ? String(j.numero) : "",
      complemento: s("complemento"),
      bairro: s("bairro"),
      municipio: s("municipio"),
      uf: s("uf"),
      situacao: s("descricao_situacao_cadastral"),
    };
  } catch {
    return null;
  }
}

/* ---------------- CPF ---------------- */
export function isValidCPF(raw: string): boolean {
  const cpf = onlyDigits(raw);
  if (cpf.length !== 11) return false;
  if (/^(\d)\1+$/.test(cpf)) return false;
  const calc = (slice: string) => {
    const len = slice.length + 1;
    let sum = 0;
    for (let i = 0; i < slice.length; i++) {
      sum += parseInt(slice[i], 10) * (len - i);
    }
    const r = (sum * 10) % 11;
    return r === 10 ? 0 : r;
  };
  const d1 = calc(cpf.slice(0, 9));
  const d2 = calc(cpf.slice(0, 10));
  return d1 === parseInt(cpf[9], 10) && d2 === parseInt(cpf[10], 10);
}

export const cpfSchema = z
  .string()
  .transform(onlyDigits)
  .refine((v) => v.length === 11, { message: "CPF deve ter 11 dígitos" })
  .refine(isValidCPF, { message: "CPF inválido" });

/* ---------------- Telefone BR ---------------- */
/** DDDs ativos no Brasil (ANATEL). */
const VALID_DDDS = new Set([
  11, 12, 13, 14, 15, 16, 17, 18, 19,
  21, 22, 24, 27, 28,
  31, 32, 33, 34, 35, 37, 38,
  41, 42, 43, 44, 45, 46, 47, 48, 49,
  51, 53, 54, 55,
  61, 62, 63, 64, 65, 66, 67, 68, 69,
  71, 73, 74, 75, 77, 79,
  81, 82, 83, 84, 85, 86, 87, 88, 89,
  91, 92, 93, 94, 95, 96, 97, 98, 99,
]);

export function isValidPhoneBR(raw: string): boolean {
  const d = onlyDigits(raw);
  if (d.length !== 10 && d.length !== 11) return false;
  const ddd = parseInt(d.slice(0, 2), 10);
  if (!VALID_DDDS.has(ddd)) return false;
  // Celular (11 dígitos) precisa começar com 9 no terceiro dígito.
  if (d.length === 11 && d[2] !== "9") return false;
  return true;
}

export const phoneBRSchema = z
  .string()
  .transform((v) => {
    const d = onlyDigits(v);
    if ((d.length === 12 || d.length === 13) && d.startsWith("55")) {
      return d.slice(2);
    }
    return d;
  })
  .refine((v) => v.length === 10 || v.length === 11, {
    message: "Informe DDD + número (10 ou 11 dígitos)",
  })
  .refine(isValidPhoneBR, { message: "Telefone inválido (DDD ou formato)" });

/** Formata para exibição: (11) 95896-7088 ou (11) 3456-7890. */
export function formatPhoneBR(raw: string): string {
  const d = onlyDigits(raw);
  if (d.length === 11) return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  if (d.length === 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return raw;
}

/* ---------------- CEP ---------------- */
export const cepSchema = z
  .string()
  .transform(onlyDigits)
  .refine((v) => v.length === 8, { message: "CEP deve ter 8 dígitos" });

export interface ViaCepResult {
  cep: string;
  logradouro: string;
  bairro: string;
  localidade: string; // cidade
  uf: string;
  erro?: boolean;
}

/** Busca CEP no ViaCEP; em falha, fallback BrasilAPI. Retorna no formato ViaCepResult. */
export async function fetchCep(cep: string): Promise<ViaCepResult | null> {
  const d = onlyDigits(cep);
  if (d.length !== 8) return null;
  // 1) ViaCEP
  try {
    const r = await fetch(`https://viacep.com.br/ws/${d}/json/`);
    if (r.ok) {
      const j = (await r.json()) as ViaCepResult;
      if (!j.erro && (j.logradouro || j.localidade)) return j;
    }
  } catch {
    /* fallback */
  }
  // 2) BrasilAPI
  try {
    const r = await fetch(`https://brasilapi.com.br/api/cep/v1/${d}`);
    if (r.ok) {
      const j = (await r.json()) as {
        cep: string; street?: string; neighborhood?: string; city: string; state: string;
      };
      return {
        cep: j.cep,
        logradouro: j.street ?? "",
        bairro: j.neighborhood ?? "",
        localidade: j.city,
        uf: j.state,
      };
    }
  } catch {
    /* sem rede */
  }
  return null;
}

/* ---------------- E-mail ---------------- */
export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(5, { message: "E-mail muito curto" })
  .max(320, { message: "E-mail muito longo" })
  .email({ message: "E-mail inválido" });

const COMMON_DOMAINS = [
  "gmail.com",
  "hotmail.com",
  "outlook.com",
  "yahoo.com.br",
  "yahoo.com",
  "icloud.com",
  "uol.com.br",
  "live.com",
];

/** Sugestão de typo simples (Levenshtein ≤ 2) — retorna null se ok. */
export function suggestEmailFix(email: string): string | null {
  const at = email.lastIndexOf("@");
  if (at < 1) return null;
  const domain = email.slice(at + 1).toLowerCase();
  if (COMMON_DOMAINS.includes(domain)) return null;
  const close = COMMON_DOMAINS.find((d) => levenshtein(domain, d) <= 2 && d !== domain);
  if (!close) return null;
  return email.slice(0, at + 1) + close;
}

function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;
  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost);
    }
  }
  return dp[m][n];
}

/* ---------------- Senha ---------------- */
export interface PasswordStrength {
  score: 0 | 1 | 2 | 3 | 4;
  label: "Muito fraca" | "Fraca" | "Média" | "Forte" | "Muito forte";
  rules: { has8: boolean; hasNumber: boolean; hasSymbol: boolean; hasUpper: boolean };
}

export function passwordStrength(pwd: string): PasswordStrength {
  const rules = {
    has8: pwd.length >= 8,
    hasNumber: /\d/.test(pwd),
    hasSymbol: /[^A-Za-z0-9]/.test(pwd),
    hasUpper: /[A-Z]/.test(pwd),
  };
  const score = Object.values(rules).filter(Boolean).length as 0 | 1 | 2 | 3 | 4;
  const labels = ["Muito fraca", "Fraca", "Média", "Forte", "Muito forte"] as const;
  return { score, label: labels[score], rules };
}

export const passwordSchema = z
  .string()
  .min(8, { message: "Mínimo 8 caracteres" })
  .refine((v) => /\d/.test(v), { message: "Inclua ao menos um número" });

/* ---------------- Data dd/mm/aaaa ---------------- */
/** Valida string dd/mm/aaaa e rejeita datas impossíveis. */
export function isValidDateBR(raw: string): boolean {
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(raw.trim());
  if (!m) return false;
  const d = parseInt(m[1], 10);
  const mo = parseInt(m[2], 10);
  const y = parseInt(m[3], 10);
  if (y < 1900 || y > 2100 || mo < 1 || mo > 12 || d < 1 || d > 31) return false;
  const dt = new Date(y, mo - 1, d);
  return dt.getFullYear() === y && dt.getMonth() === mo - 1 && dt.getDate() === d;
}

export const dateBRSchema = z
  .string()
  .trim()
  .refine(isValidDateBR, { message: "Data inválida (use dd/mm/aaaa)" });

/* ---------------- UFs ---------------- */
export const UF_LIST = [
  "AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG",
  "PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO",
] as const;

export type UF = (typeof UF_LIST)[number];

/* ---------------- Hand-off Woo (billing_*) ---------------- */
export interface BrAddressForm {
  cep: string; endereco: string; numero: string; complemento?: string;
  bairro: string; cidade: string; estado: string;
}
export interface BrContactForm {
  nome?: string; email?: string; telefone?: string; cnpj?: string; empresa?: string;
}
/** Converte os campos do formulário para o payload esperado pelo checkout Woo. */
export function toWooBillingPayload(
  addr: Partial<BrAddressForm>,
  contact: Partial<BrContactForm> = {},
): Record<string, string> {
  const out: Record<string, string> = {};
  if (addr.cep) out.billing_postcode = onlyDigits(addr.cep);
  if (addr.endereco) out.billing_address_1 = addr.endereco;
  if (addr.numero) out.billing_number = addr.numero;
  if (addr.complemento) out.billing_address_2 = addr.complemento;
  if (addr.bairro) out.billing_neighborhood = addr.bairro;
  if (addr.cidade) out.billing_city = addr.cidade;
  if (addr.estado) out.billing_state = addr.estado;
  if (contact.email) out.billing_email = contact.email.toLowerCase().trim();
  if (contact.telefone) out.billing_phone = onlyDigits(contact.telefone);
  if (contact.cnpj) out.billing_cnpj = onlyDigits(contact.cnpj);
  if (contact.empresa) out.billing_company = contact.empresa;
  if (contact.nome) {
    const parts = normalizeText(contact.nome).split(" ");
    out.billing_first_name = parts.shift() ?? "";
    out.billing_last_name = parts.join(" ");
  }
  return out;
}

/* ---------------- Helper a11y ---------------- */
/** Foca o primeiro campo inválido dentro do form com base no mapa de erros. */
export function focusFirstInvalid(
  formEl: HTMLFormElement | null,
  errors: Record<string, string>,
): void {
  if (!formEl) return;
  const firstKey = Object.keys(errors).find((k) => errors[k]);
  if (!firstKey) return;
  const el =
    formEl.querySelector<HTMLElement>(`#${CSS.escape(firstKey)}`) ??
    formEl.querySelector<HTMLElement>(`[name="${CSS.escape(firstKey)}"]`);
  el?.focus();
}
