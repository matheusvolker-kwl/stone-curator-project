import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { conjuntoComposicao } from "@/data/conjuntoComposicao";
import { guideMap } from "@/data/guideMap";
import {
  usageForCollection,
  usageReframe,
  PROJETO_SCENES,
  PROJETO_ORDER,
} from "@/lib/usage/scenes";

/**
 * "ONDE USAR & COMPOSIÇÃO" — o FECHO da PDP (fusão pedida pelo dono, 18/07).
 * "Onde usar" e "Uma peça não faz uma cena" falavam quase da mesma coisa em
 * duas seções com meia página vazia cada. Agora é UMA seção, por último de
 * propósito: os dois assuntos têm botões que tiram o cliente da PDP (obras,
 * guia, conjuntos) — expandir é o passo DEPOIS de decidir, não antes.
 *
 * Esquerda = onde a peça vai bem (cenas + obras reais). Direita = com quem ela
 * vai (papel na cena, receita humana, conjuntos prontos). DS §11.
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
  destaque: "destaque da cena",
  volume: "volume da cena",
  preenchimento: "preenchimento da cena",
  borda: "borda da cena",
  revestimento: "revestimento da cena",
  piso: "piso da cena",
  funcional: "peça funcional",
};

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
  const usage = usageForCollection(collectionHandle ?? undefined);
  const projetos = usage ? PROJETO_ORDER.filter((t) => usage.projetos.includes(t)) : [];
  const conjuntos = Object.entries(conjuntoComposicao)
    .filter(([, pecas]) => pecas.some((p) => p.handle === productHandle))
    .map(([handle]) => handle)
    .slice(0, 3);

  const guiaPrimario = papel === "volume" || papel === "preenchimento" || papel === "borda";

  return (
    <section
      className="surface-ivory py-10 md:py-14 border-t border-western-border-soft"
      aria-label={`Onde usar e composição — ${productTitle}`}
    >
      <div className="container-western">
        <header className="max-w-2xl">
          <p className="text-eyebrow mb-2">Onde usar & composição</p>
          <h2 className="display-md text-western-green-deep">
            Onde esta peça vai bem — e com quem.
          </h2>
        </header>

        <div className="mt-6 grid gap-8 lg:grid-cols-2 lg:gap-14">
          {/* ESQUERDA — onde a peça vai (cenas, obras reais) */}
          <div>
            {usage && <p className="text-body max-w-[56ch]">{usageReframe(usage.agua)}</p>}
            {usage && usage.tambem.length > 0 && (
              <p className="text-body mt-4 max-w-[56ch]">
                <span className="font-semibold text-western-green-deep">Também fica lindo em: </span>
                {usage.tambem.join(" · ")}.
              </p>
            )}
            {projetos.length > 0 && (
              <div className="mt-6">
                <p className="text-eyebrow mb-3">Ver projetos reais</p>
                <div className="flex flex-wrap gap-3">
                  {projetos.map((t) => {
                    const s = PROJETO_SCENES[t];
                    const Icon = s.icon;
                    return (
                      <Link
                        key={t}
                        to={`/obras?seg=${t}`}
                        aria-label={`Ver obras de ${s.label.toLowerCase()}`}
                        className="group tap-target inline-flex items-center gap-2.5 rounded-full border border-western-border-strong bg-white px-5 text-[16px] font-semibold text-western-green-deep transition-colors hover:border-western-green-deep hover:bg-western-paper"
                      >
                        <Icon className="h-5 w-5 text-western-cta" aria-hidden="true" />
                        {s.label}
                        <ArrowRight
                          className="h-4 w-4 text-western-bronze transition-transform motion-safe:group-hover:translate-x-0.5"
                          aria-hidden="true"
                        />
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* DIREITA — com quem ela vai (papel, receita, conjuntos) */}
          <div>
            <p className="text-body max-w-[54ch]">{RECEITA[papel]}</p>
            <p className="text-meta mt-3">
              {productTitle} · papel na cena: {PAPEL_LABEL[papel]}
            </p>

            {conjuntos.length > 0 && (
              <ul className="mt-6 space-y-3">
                {conjuntos.map((h) => {
                  const info = CONJUNTO_LABEL[h];
                  return (
                    <li key={h}>
                      <Link
                        to={`/conjuntos/${h}`}
                        className="group tap-target flex items-center justify-between gap-4 rounded-xl border border-western-border-soft bg-white px-5 py-3.5 transition-colors hover:border-western-border-strong"
                      >
                        <span>
                          <span className="block font-sans text-[16px] font-semibold text-western-green-deep">
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
            )}

            <Link
              to="/guia-de-composicao"
              className={`${guiaPrimario ? "btn-primary" : "btn-outline-forest"} mt-6 w-full sm:w-auto`}
            >
              Montar uma composição com esta peça
              <ArrowRight className="h-5 w-5" strokeWidth={1.75} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
