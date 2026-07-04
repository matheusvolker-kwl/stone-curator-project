#!/usr/bin/env node
// Re-export .asset.json binaries whose real width > 1000px to smaller local webp files.
// Pattern A (glob-based, e.g. produtos-aplicados / famosos / marcas): drop local .webp beside
// pointer; the consumer prefers cru; then delete the .asset.json (no import edits).
// Pattern B (static import of .asset.json using .url): rewrite imports to .webp and drop `.url`,
// then delete the .asset.json.

import { readFileSync, writeFileSync, existsSync, statSync, unlinkSync } from "node:fs";
import { execSync } from "node:child_process";
import path from "node:path";
import sharp from "sharp";

const ROOT = process.cwd();
const CDN_BASE = "https://westernstore.com.br";
const ASSETS_DIR = path.join(ROOT, "src/assets");

// Skip list
const SKIP_FILENAMES = new Set(["coming-soon-logo.png.asset.json"]);

function targetWidthFor(relPath) {
  if (relPath.includes("/famosos/")) return 500;
  if (relPath.endsWith("/thiago-castro.webp.asset.json")) return 500;
  return 800;
}

function findAssetJsons() {
  const out = execSync(
    `find src/assets -type f \\( -name '*.webp.asset.json' -o -name '*.jpg.asset.json' -o -name '*.jpeg.asset.json' -o -name '*.png.asset.json' \\)`,
    { cwd: ROOT, encoding: "utf8" }
  );
  return out.trim().split("\n").filter(Boolean);
}

async function fetchBuffer(url) {
  const res = await fetch(CDN_BASE + url);
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return Buffer.from(await res.arrayBuffer());
}

function rewriteImports(reexportedRelPaths) {
  // reexportedRelPaths: array of paths like "src/assets/linhas/cascatas.webp.asset.json"
  // For each, compute the alias-form import token: "@/assets/linhas/cascatas.webp.asset.json"
  const tokens = reexportedRelPaths.map((rel) => {
    const aliased = "@/" + rel.replace(/^src\//, "");
    return { rel, aliased, newAliased: aliased.replace(/\.asset\.json$/, "") };
  });

  // Grep all TS/TSX files touching any of these tokens
  const files = new Set();
  for (const t of tokens) {
    try {
      const out = execSync(
        `rg -l --fixed-strings "${t.aliased}" src`,
        { cwd: ROOT, encoding: "utf8" }
      );
      out.trim().split("\n").filter(Boolean).forEach((f) => files.add(f));
    } catch {
      // no match → pattern A
    }
  }

  const editsPerFile = {};

  for (const file of files) {
    let src = readFileSync(path.join(ROOT, file), "utf8");
    const original = src;
    for (const t of tokens) {
      // Match: import <NAME> from "<t.aliased>";
      const importRe = new RegExp(
        `import\\s+(\\w+)\\s+from\\s+["']${t.aliased.replace(/[.*+?^${}()|[\\]\\\\]/g, "\\\\$&")}["'];?`,
        "g"
      );
      let m;
      const names = new Set();
      importRe.lastIndex = 0;
      while ((m = importRe.exec(src)) !== null) names.add(m[1]);
      if (names.size === 0) continue;

      // Replace import path
      src = src.replace(importRe, (match, name) => {
        return match.replace(t.aliased, t.newAliased);
      });

      // Replace `<NAME>.url` → `<NAME>` for each captured name (word-boundary)
      for (const name of names) {
        const useRe = new RegExp(`\\b${name}\\.url\\b`, "g");
        src = src.replace(useRe, name);
      }
    }
    if (src !== original) {
      writeFileSync(path.join(ROOT, file), src);
      editsPerFile[file] = (editsPerFile[file] ?? 0) + 1;
    }
  }

  return editsPerFile;
}

async function main() {
  const jsons = findAssetJsons();
  let scanned = 0, reexported = 0, skippedSmall = 0, skippedByRule = 0, savedBytes = 0;
  const reexportedRelPaths = [];
  const errors = [];

  for (const rel of jsons) {
    scanned++;
    const base = path.basename(rel);
    if (SKIP_FILENAMES.has(base)) { skippedByRule++; console.log(`[skip-rule] ${rel}`); continue; }

    const absJson = path.join(ROOT, rel);
    let json;
    try { json = JSON.parse(readFileSync(absJson, "utf8")); }
    catch (e) { errors.push(`${rel}: bad JSON`); continue; }

    if ((json.content_type ?? "").startsWith("video/")) { skippedByRule++; continue; }
    if ((json.content_type ?? "").includes("svg")) { skippedByRule++; continue; }

    let buf;
    try { buf = await fetchBuffer(json.url); }
    catch (e) { errors.push(`${rel}: ${e.message}`); continue; }

    let meta;
    try { meta = await sharp(buf).metadata(); }
    catch (e) { errors.push(`${rel}: sharp meta: ${e.message}`); continue; }

    const origW = meta.width ?? 0;
    const origH = meta.height ?? 0;
    const origBytes = buf.length;

    if (origW <= 1000) {
      skippedSmall++;
      console.log(`[skip-small] ${rel}  ${origW}x${origH}  ${origBytes}B`);
      continue;
    }

    const targetW = targetWidthFor(rel);
    let outBuf;
    try {
      outBuf = await sharp(buf)
        .resize({ width: targetW, withoutEnlargement: true })
        .webp({ quality: 80 })
        .toBuffer();
    } catch (e) { errors.push(`${rel}: sharp resize: ${e.message}`); continue; }

    // Output path: strip .asset.json → keep original ext but replace with .webp
    // Original files may be .png/.jpg — we always write .webp local file.
    const stripped = rel.replace(/\.asset\.json$/, "");
    // Replace terminal ext with .webp for consistency (spec says webp q80)
    const outRel = stripped.replace(/\.(png|jpg|jpeg|webp)$/i, ".webp");
    const outAbs = path.join(ROOT, outRel);
    writeFileSync(outAbs, outBuf);

    const outMeta = await sharp(outBuf).metadata();
    const savings = origBytes - outBuf.length;
    savedBytes += savings;
    reexported++;
    reexportedRelPaths.push(rel);
    console.log(
      `[reexport] ${rel}  ${origW}x${origH} ${origBytes}B  →  ${outMeta.width}x${outMeta.height} ${outBuf.length}B  (-${savings}B)`
    );

    // If we wrote outRel that differs from stripped (ext changed), also we need to consider imports.
    // But pattern B always imports the .asset.json with matching ext, so we handle that.
    // Any raw imports of the previous ext (e.g. `.png`) would resolve to a now-existing sibling — but
    // we didn't remove the old raw file (it was never in repo). New `.webp` is written; that's fine.
  }

  console.log("\n=== Rewriting imports (pattern B) ===");
  const edits = rewriteImports(reexportedRelPaths);
  const editedFiles = Object.keys(edits);
  console.log(`Edited files: ${editedFiles.length}`);
  editedFiles.forEach((f) => console.log(`  ${f}`));

  console.log("\n=== Deleting re-exported .asset.json pointers ===");
  let deleted = 0;
  for (const rel of reexportedRelPaths) {
    const absJson = path.join(ROOT, rel);
    // Safety: ensure no remaining reference to this path
    let stillRef = false;
    try {
      execSync(`rg -l --fixed-strings "@/${rel.replace(/^src\//, "")}" src`, { cwd: ROOT, stdio: "pipe" });
      stillRef = true;
    } catch { stillRef = false; }
    if (stillRef) {
      console.log(`[keep] ${rel} still referenced`);
      continue;
    }
    unlinkSync(absJson);
    deleted++;
  }
  console.log(`Deleted ${deleted} pointer files.`);

  console.log("\n=== Summary ===");
  console.log(`scanned:       ${scanned}`);
  console.log(`re-exported:   ${reexported}`);
  console.log(`skipped small: ${skippedSmall}`);
  console.log(`skipped rule:  ${skippedByRule}`);
  console.log(`bytes saved:   ${savedBytes} (${(savedBytes / 1024 / 1024).toFixed(2)} MB)`);
  console.log(`errors:        ${errors.length}`);
  errors.forEach((e) => console.log(`  ! ${e}`));
}

main().catch((e) => { console.error(e); process.exit(1); });
