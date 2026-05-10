// Validações & helpers brasileiros — CNPJ, telefone, CEP, e-mail.
import { z } from "zod";

export const onlyDigits = (v: string) => v.replace(/\D/g, "");

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

/* ---------------- Telefone BR ---------------- */
/** Aceita 10 (fixo) ou 11 (celular). Retorna apenas os dígitos. */
export const phoneBRSchema = z
  .string()
  .transform(onlyDigits)
  .refine((v) => v.length === 10 || v.length === 11, {
    message: "Informe DDD + número (10 ou 11 dígitos)",
  });

/** Formata para exibição: (11) 95896-7088 ou (11) 9589-7088. */
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

export async function fetchCep(cep: string): Promise<ViaCepResult | null> {
  const d = onlyDigits(cep);
  if (d.length !== 8) return null;
  try {
    const r = await fetch(`https://viacep.com.br/ws/${d}/json/`);
    const j = (await r.json()) as ViaCepResult;
    if (j.erro) return null;
    return j;
  } catch {
    return null;
  }
}

/* ---------------- E-mail ---------------- */
export const emailSchema = z
  .string()
  .trim()
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

/* ---------------- UFs ---------------- */
export const UF_LIST = [
  "AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG",
  "PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO",
] as const;

export type UF = (typeof UF_LIST)[number];
