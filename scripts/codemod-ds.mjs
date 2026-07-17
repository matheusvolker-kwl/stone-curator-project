/**
 * Codemod DS V3 — substituições 1:1 SEM mudança visual (auditoria 2026-07-17).
 *
 * Só troca grafia: o valor renderizado é idêntico byte a byte.
 *   rounded-[10px] → rounded-lg      (--radius = 10px, 189×)
 *   rounded-[6px]  → rounded-sm      (calc(--radius - 4px) = 6px, 118×)
 *   rounded-[16px] → rounded-2xl     (default Tailwind = 16px, 122×)
 *   h-[52px]       → h-control       (--control-h = 52px, 97×)
 *   min-h-[52px]   → min-h-control
 *   h-[48px]       → h-tap           (--tap-min = 48px)
 *   min-h-[48px]   → min-h-tap
 *   min-w-[48px]   → min-w-tap
 *   [#B3372E]      → status-error    (o token agora existe; 128×)
 *   [#9C6812]      → status-warning
 *   [#2E7D4F]      → status-success
 *
 * Idempotente. Roda: node scripts/codemod-ds.mjs
 */
import { readdirSync, readFileSync, writeFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

/* fileURLToPath e não .pathname: o espaço em "Matheus Volker" vira %20 na URL
   e o fs não acha o diretório. */
const ROOT = fileURLToPath(new URL("../src", import.meta.url));

const SUBS = [
  [/\brounded-\[10px\]/g, "rounded-lg"],
  [/\brounded-\[6px\]/g, "rounded-sm"],
  [/\brounded-\[16px\]/g, "rounded-2xl"],
  [/\bmin-h-\[52px\]/g, "min-h-control"],
  [/\bmin-h-\[48px\]/g, "min-h-tap"],
  [/\bmin-w-\[48px\]/g, "min-w-tap"],
  [/\bh-\[52px\]/g, "h-control"],
  [/\bh-\[48px\]/g, "h-tap"],
  [/\[#B3372E\]/gi, "status-error"],
  [/\[#9C6812\]/gi, "status-warning"],
  [/\[#2E7D4F\]/gi, "status-success"],
];

function walk(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) out.push(...walk(p));
    else if (/\.(tsx|ts)$/.test(name) && !name.endsWith(".d.ts")) out.push(p);
  }
  return out;
}

let files = 0;
let total = 0;
for (const f of walk(ROOT)) {
  const before = readFileSync(f, "utf8");
  let after = before;
  let n = 0;
  for (const [re, to] of SUBS) {
    after = after.replace(re, () => (n++, to));
  }
  if (n > 0) {
    writeFileSync(f, after);
    files++;
    total += n;
  }
}
console.log(`codemod-ds: ${total} substituições em ${files} arquivos`);
