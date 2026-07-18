import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { conjuntoComposicao } from "@/data/conjuntoComposicao";
import { guideMap } from "@/data/guideMap";

/**
 * "Uma peça não faz uma cena" — bloco de composição da PDP (DS §11).
 * O produto da Western é a COMPOSIÇÃO; a peça é ingrediente. Este bloco dá o
 * próximo passo por PAPEL (destaque/volume/preenchimento/…): receita
 * complementar em linguagem humana + guia + os conjuntos prontos em que a
 * peça aparece. Guardrail anti-poluição: UM bloco, UM próximo passo.
 */

type Papel =
  | "destaque"
  | "volume"
  | "preenchimento"
  | "borda"
  | "revestimento"
  | "piso"
  | "funcional";

function papelDaLinha(collectionHandle?: string): Papel {
  const h = collectionHandle ?? "";
  if (/cascata|fonte|fossil|fósse|pedras-grandes|pedra-grande/.test(h)) return "destaque";
  if (/pedras-medias|pedra-media|médias/.test(h)) return "volume";
  if (/pedras-pequenas|pedra-pequena/.test(h)) return "preenchimento";
  if (/borda/.test(h)) return "borda";
  if (/revestimento/.test(h)) return "revestimento";
  if (/pisada/.test(h)) return "piso";
  return "funcional";
}

const PAPEL_LABEL: Record<Papel, string> = {
  destaque: "Destaque da cena",
  volume: "Volume da cena",
  preenchimento: "Preenchimento da cena",
  borda: "Borda da cena",
  revestimento: "Revestimento da cena",
  piso: "Piso da cena",
  funcional: "Peça funcional",
};

/* Receita complementar em linguagem humana (nunca "7–11 peças"). */
const RECEITA: Record<Papel, string> = {
  destaque:
    "Ela é a âncora — o olho chega primeiro nela. Complete a cena com 2 ou 3 pedras médias fazendo volume e 4 a 6 pequenas costurando o caminho da água.",
  volume:
    "Ela dá corpo ao redor da âncora. Uma cena típica leva 1 destaque, 2 ou 3 médias como esta e 4 a 6 pequenas de preenchimento.",
  preenchimento:
    "Ela costura a cena — é a peça que faz o conjunto parecer nascido ali. Agrupe 4 a 6 pequenas em torno de 1 destaque e 2 médias.",
  borda:
    "Ela acaba o encontro da água com o piso. Combine com 1 destaque e pedras médias e pequenas para a cena fechar redonda.",
  revestimento:
    "Ela veste a parede ou o talude. Uma cena completa junta o revestimento a um destaque e a pedras soltas no pé.",
  piso: "Ela conduz o caminho. Puxe a cena com um destaque à vista e preencha as beiradas com pedras pequenas.",
  funcional:
    "Ela resolve a função sem aparecer. Monte a cena em volta com destaque, volume e preenchimento.",
};

/* handle do conjunto → rótulo humano, achatando o guideMap uma única vez. */
const CONJUNTO_LABEL: Record<string, { nome: string; subtitulo: string }> = (() => {
  const out: Record<string, { nome: string; subtitulo: string }> = {};
  const visit = (node: unknown) => {
    if (!node || typeof node !== "object") return;
    const n = node as Record<string, unknown>;
    if (typeof n.handle === "string" && typeof n.nome === "string") {
      out[n.handle] = {
        nome: n.nome,
        subtitulo: typeof n.subtitulo === "string" ? n.subtitulo : "",
      };
      return;
    }
    Object.values(n).forEach(visit);
  };
  visit(guideMap);
  return out;
})();

function tipoDoHandle(handle: string): string {
  if (handle.startsWith("conjunto-lago-hibrido")) return "Lago híbrido";
  if (handle.startsWith("conjunto-lago")) return "Lago";
  if (handle.startsWith("conjunto-piscina")) return "Piscina";
  if (handle.startsWith("conjunto-jardim-seco")) return "Jardim seco";
  if (handle.startsWith("conjunto-jardim-fonte")) return "Jardim-fonte";
  if (handle.startsWith("conjunto-jardim")) return "Jardim";
  return "Conjunto";
}

export default function ComposicaoCena({
  productHandle,
  productTitle,
  collectionHandle,
}: {
  productHandle: string;
  productTitle: string;
  collectionHandle?: string;
}) {
  const papel = papelDaLinha(collectionHandle);
  const conjuntos = Object.entries(conjuntoComposicao)
    .filter(([, pecas]) => pecas.some((p) => p.handle === productHandle))
    .map(([handle]) => handle)
    .slice(0, 4);

  /* Ênfase por papel (DS §11): quem preenche/dá volume compra MAIS certo em
     composição (guia primário); destaque/revestimento seguram-se sozinhos
     (guia como caminho secundário, sem roubar o CTA de compra). */
  const guiaPrimario = papel === "volume" || papel === "preenchimento" || papel === "borda";

  return (
    <section
      className="surface-paper section border-t border-western-border-soft"
      aria-label="Composição da cena"
    >
      <div className="container-western">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-7">
            <p className="text-eyebrow mb-3">Composição</p>
            <h2 className="display-md text-western-green-deep">Uma peça não faz uma cena.</h2>
            <p className="text-body mt-4 max-w-[54ch]">{RECEITA[papel]}</p>
            <p className="text-meta mt-4">
              {productTitle} · papel na cena: {PAPEL_LABEL[papel].toLowerCase()}
            </p>

            <div className="mt-7 flex flex-col sm:flex-row sm:items-center gap-4">
              <Link
                to="/guia-de-composicao"
                className={`${guiaPrimario ? "btn-primary" : "btn-outline-forest"} w-full sm:w-auto`}
              >
                Montar uma composição com esta peça
                <ArrowRight className="h-5 w-5" strokeWidth={1.75} aria-hidden="true" />
              </Link>
            </div>
          </div>

          {conjuntos.length > 0 && (
            <div className="lg:col-span-5">
              <p className="text-eyebrow mb-4">Aparece nestes conjuntos</p>
              <ul className="space-y-3">
                {conjuntos.map((h) => {
                  const info = CONJUNTO_LABEL[h];
                  return (
                    <li key={h}>
                      <Link
                        to={`/conjuntos/${h}`}
                        className="group tap-target flex items-center justify-between gap-4 rounded-xl border border-western-border-soft bg-white px-5 py-4 transition-colors hover:border-western-border-strong"
                      >
                        <span>
                          <span className="block font-sans text-[17px] font-semibold text-western-green-deep">
                            {info?.nome ?? h.replace(/^conjunto-/, "").replace(/-/g, " ")}
                          </span>
                          <span className="block text-meta mt-0.5">
                            {tipoDoHandle(h)}
                            {info?.subtitulo ? ` · ${info.subtitulo}` : ""}
                          </span>
                        </span>
                        <ArrowRight
                          className="h-5 w-5 shrink-0 text-western-bronze transition-transform group-hover:translate-x-0.5"
                          strokeWidth={1.75}
                          aria-hidden="true"
                        />
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
