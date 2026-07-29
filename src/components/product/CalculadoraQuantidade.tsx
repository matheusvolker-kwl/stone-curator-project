import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  getCalcMedida,
  SOBRAS_PCT,
  SOBRA_PADRAO_PCT,
  VAO_PISADA_CM,
} from "@/data/calcMedidas";

interface Props {
  /** Handle do produto. Fora do mapa de medidas, o bloco não renderiza. */
  handle: string;
  /** Parceiro aprovado vê preço — o CTA leva a quantidade para o pedido. */
  isApproved: boolean;
  /** Aplica a quantidade calculada no seletor da compra (só quando aprovado). */
  onUseQuantity?: (n: number) => void;
}

const num = (v: number, dec = 1) =>
  v.toLocaleString("pt-BR", { maximumFractionDigits: dec });

/**
 * Calculadora de quantidade — quem compra revestimento ou pisada mede o MURO
 * ou o CAMINHO, não conta peças. Aqui a gente faz a conta e mostra ela por
 * extenso, para o cliente confiar no número antes de pedir.
 *
 * FERRAMENTA, não vitrine: é a primeira seção depois da compra, então cabe
 * numa dobra — um cartão só (entrada à esquerda, resultado à direita).
 */
export default function CalculadoraQuantidade({
  handle,
  isApproved,
  onUseQuantity,
}: Props) {
  const med = useMemo(() => getCalcMedida(handle), [handle]);

  const [raw, setRaw] = useState(med?.tipo === "rev" ? "12" : "6");
  const [sobra, setSobra] = useState<number>(SOBRA_PADRAO_PCT);

  if (!med) return null;

  const valor = parseFloat(raw.replace(",", ".")) || 0;
  const alvo = valor * (1 + sobra / 100);

  // Passada da pisada: comprimento da peça + vão entre as bordas (cm → m).
  const passadaCm = med.tipo === "pis" ? med.comp + VAO_PISADA_CM : 0;

  let n = 0;
  if (valor > 0) {
    n =
      med.tipo === "rev"
        ? Math.ceil(alvo / med.cob)
        : Math.ceil(alvo / (passadaCm / 100));
  }

  const unidade =
    med.tipo === "rev" ? (n === 1 ? "painel" : "painéis") : n === 1 ? "pisada" : "pisadas";

  const unidadePlural = med.tipo === "rev" ? "painéis" : "pisadas";

  const campoLabel =
    med.tipo === "rev" ? "Área da parede ou muro" : "Comprimento do caminho";
  const campoUnidade = med.tipo === "rev" ? "m²" : "m";
  const folgaLabel =
    med.tipo === "rev" ? "Folga para recorte e encaixe" : "Folga para curvas e ajustes";

  const conta =
    valor > 0
      ? med.tipo === "rev"
        ? `${num(valor)} m² + ${sobra}% = ${num(alvo)} m² ÷ ${num(med.cob, 2)} m² por painel`
        : `${num(valor)} m + ${sobra}% = ${num(alvo)} m ÷ ${passadaCm} cm por passo`
      : med.tipo === "rev"
        ? "Informe a área do muro para ver a conta."
        : "Informe o comprimento do caminho para ver a conta.";

  const pesoTotal = n * med.peso;

  // Ficha do resultado numa linha só — detalhe sem virar painel.
  const statsLine =
    n > 0
      ? med.tipo === "rev"
        ? `Cobre ${num(n * med.cob)} m² · ${pesoTotal.toLocaleString("pt-BR")} kg no total · face ${med.face}`
        : `${pesoTotal.toLocaleString("pt-BR")} kg no total · face ${med.face} · centro a centro ${passadaCm} cm`
      : null;

  const inputId = `calc-${handle}`;

  return (
    <section
      id="calcular"
      aria-labelledby="calc-titulo"
      className="surface-cream border-t border-western-border-soft py-10 md:py-12 scroll-mt-24"
    >
      <div className="max-w-5xl mx-auto px-6 md:px-8">
        <header className="mb-5 md:mb-6">
          <p className="text-section-label mb-2">A conta · Quantidade</p>
          <h2 id="calc-titulo" className="display-md text-western-green-deep">
            {med.tipo === "rev"
              ? "Quantos painéis o seu muro pede?"
              : "Quantas pisadas o seu caminho pede?"}
          </h2>
        </header>

        <div className="rounded-xl border border-western-border-soft bg-white p-4 md:p-5">
          <div className="grid md:grid-cols-[1fr_1.15fr] gap-4 md:gap-6 items-stretch">
            {/* Entrada — uma pergunta por vez */}
            <div className="min-w-0 md:py-1">
              <label
                htmlFor={inputId}
                className="block font-sans text-[14px] font-semibold text-western-green-deep mb-2"
              >
                {campoLabel}
              </label>
              <div className="flex items-center h-11 rounded-lg border border-western-border-strong bg-white focus-within:border-western-green-deep transition-colors">
                <input
                  id={inputId}
                  type="text"
                  inputMode="decimal"
                  autoComplete="off"
                  value={raw}
                  onChange={(e) => {
                    const v = e.target.value;
                    if (/^\d{0,5}([.,]\d{0,2})?$/.test(v)) setRaw(v);
                  }}
                  placeholder="0"
                  className="h-full flex-1 min-w-0 bg-transparent px-3.5 rounded-l-lg font-sans text-[17px] font-semibold tabular-nums text-western-green-deep placeholder:text-western-stone-warm/50 focus:outline-none"
                />
                <span
                  aria-hidden
                  className="pr-3.5 pl-1.5 font-sans text-[14px] text-western-stone-warm"
                >
                  {campoUnidade}
                </span>
              </div>

              <fieldset className="mt-4 border-0 p-0 m-0">
                <legend className="font-sans text-[14px] font-semibold text-western-green-deep mb-2 p-0">
                  {folgaLabel}
                </legend>
                <div className="flex flex-wrap gap-2">
                  {SOBRAS_PCT.map((pct) => {
                    const selected = sobra === pct;
                    return (
                      <button
                        key={pct}
                        type="button"
                        onClick={() => setSobra(pct)}
                        aria-pressed={selected}
                        className={`h-11 px-4 inline-flex items-center justify-center rounded-lg border font-sans text-[15px] tabular-nums transition-colors ${
                          selected
                            ? "border-western-gold bg-western-gold/10 text-western-green-deep font-semibold"
                            : "border-western-border-strong text-western-green-deep font-medium hover:border-western-green-deep"
                        }`}
                      >
                        +{pct}%
                      </button>
                    );
                  })}
                </div>
                <p className="text-meta mt-2.5">
                  {med.tipo === "rev"
                    ? "Sugerimos 15% — cobre recorte, encaixe e a peça que quebra na obra."
                    : "Sugerimos 15% — cobre curvas do caminho e ajuste de passo."}
                </p>
              </fieldset>
            </div>

            {/* Resultado — salta aos olhos sem tomar a dobra */}
            <div className="min-w-0 rounded-xl bg-western-green-deep p-4 md:p-5 text-western-cream flex flex-col">
              <p className="font-sans text-[12px] uppercase tracking-[0.08em] font-semibold text-western-gold-soft">
                Você precisa de
              </p>

              <p className="mt-1.5 flex items-baseline flex-wrap gap-x-2.5" aria-live="polite">
                <span className="font-sans text-[40px] leading-none font-bold tabular-nums text-white">
                  {n > 0 ? n : "—"}
                </span>
                <span className="font-sans text-[16px] font-semibold text-western-cream">
                  {n > 0 ? unidade : unidadePlural}
                </span>
              </p>

              <p className="mt-2 font-sans text-[13px] leading-[1.45] text-western-cream/75 break-words">
                {conta}
              </p>

              {statsLine && (
                <p className="mt-2.5 pt-2.5 border-t border-western-cream/15 font-sans text-[13px] leading-[1.5] text-western-cream/85 break-words">
                  {statsLine}
                </p>
              )}

              {/* CTA dourado: único lugar onde o acento manda — sobre o verde. */}
              <div className="mt-auto pt-4">
                {isApproved ? (
                  <Button
                    variant="gold"
                    className="w-full"
                    disabled={n === 0}
                    onClick={() => n > 0 && onUseQuantity?.(n)}
                  >
                    {n > 0 ? (
                      <>
                        <span className="truncate">
                          Usar {n} {unidade} na compra
                        </span>
                        <ArrowRight className="h-5 w-5" aria-hidden />
                      </>
                    ) : (
                      <span className="truncate">
                        {med.tipo === "rev" ? "Informe a área do muro" : "Informe o comprimento"}
                      </span>
                    )}
                  </Button>
                ) : n > 0 ? (
                  <Button asChild variant="gold" className="w-full">
                    <Link to="/parceiro/cadastro">
                      <Lock className="h-5 w-5" aria-hidden />
                      <span className="truncate">
                        Ver preço de {n} {unidade}
                      </span>
                    </Link>
                  </Button>
                ) : (
                  <Button variant="gold" className="w-full" disabled>
                    <span className="truncate">
                      {med.tipo === "rev" ? "Informe a área do muro" : "Informe o comprimento"}
                    </span>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
