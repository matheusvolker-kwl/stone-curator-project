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
 * Uma decisão por vez: um campo (área ou comprimento) + a folga. O resto é
 * resultado. Vive logo depois do "Tamanho real" — é ali que a dúvida nasce.
 */
export default function CalculadoraQuantidade({
  handle,
  isApproved,
  onUseQuantity,
}: Props) {
  const med = useMemo(() => getCalcMedida(handle), [handle]);
  const isRev = med?.tipo === "rev";

  const [raw, setRaw] = useState(isRev ? "12" : "6");
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

  const stats: { label: string; value: string }[] =
    n > 0
      ? med.tipo === "rev"
        ? [
            { label: "Cobre", value: `${num(n * med.cob)} m²` },
            { label: "Peso total", value: `${pesoTotal.toLocaleString("pt-BR")} kg` },
            { label: "Face da peça", value: med.face },
          ]
        : [
            { label: "Peso total", value: `${pesoTotal.toLocaleString("pt-BR")} kg` },
            { label: "Face da peça", value: med.face },
            { label: "Centro a centro", value: `${passadaCm} cm` },
          ]
      : [];

  const inputId = `calc-${handle}`;

  return (
    <section
      id="calcular"
      aria-labelledby="calc-titulo"
      className="surface-cream border-t border-western-border-soft py-14 md:py-20 scroll-mt-24"
    >
      <div className="max-w-5xl mx-auto px-6 md:px-8">
        <header className="mb-9 md:mb-12 max-w-2xl">
          <p className="text-section-label mb-3">A conta · Quantidade</p>
          <h2 id="calc-titulo" className="display-lg text-western-green-deep">
            {med.tipo === "rev"
              ? "Quantos painéis o seu muro pede?"
              : "Quantas pisadas o seu caminho pede?"}
          </h2>
          <p className="text-body mt-3">
            {med.tipo === "rev"
              ? "Você mede a parede em metros quadrados. A gente faz a conta pela cobertura real do painel — e mostra ela por extenso."
              : "Você mede o caminho em metros. A gente faz a conta por passo — e mostra ela por extenso."}
          </p>
        </header>

        <div className="grid md:grid-cols-2 gap-8 md:gap-10 items-start">
          {/* Entrada — uma pergunta por vez */}
          <div className="rounded-2xl border border-western-border-soft bg-white p-6 md:p-7">
            <label
              htmlFor={inputId}
              className="block font-sans text-[16px] font-semibold text-western-green-deep mb-3"
            >
              {campoLabel}
            </label>
            <div className="flex items-center h-control rounded-lg border border-western-border-strong bg-white focus-within:border-western-green-deep transition-colors">
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
                className="h-control flex-1 min-w-0 bg-transparent px-4 rounded-l-[10px] font-sans text-[20px] font-semibold tabular-nums text-western-green-deep placeholder:text-western-stone-warm/50 focus:outline-none"
              />
              <span
                aria-hidden
                className="pr-4 pl-2 font-sans text-[16px] text-western-stone-warm"
              >
                {campoUnidade}
              </span>
            </div>

            <fieldset className="mt-7 border-0 p-0 m-0">
              <legend className="font-sans text-[16px] font-semibold text-western-green-deep mb-3 p-0">
                {folgaLabel}
              </legend>
              <div className="flex flex-wrap gap-3">
                {SOBRAS_PCT.map((pct) => {
                  const selected = sobra === pct;
                  return (
                    <button
                      key={pct}
                      type="button"
                      onClick={() => setSobra(pct)}
                      aria-pressed={selected}
                      className={`tap-target inline-flex items-center justify-center px-6 rounded-lg border font-sans text-[16px] tabular-nums transition-colors ${
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
              <p className="text-meta mt-3">
                {med.tipo === "rev"
                  ? "Sugerimos 15% — cobre recorte, encaixe e a peça que quebra na obra."
                  : "Sugerimos 15% — cobre curvas do caminho e ajuste de passo."}
              </p>
            </fieldset>
          </div>

          {/* Resultado — grande, legível e explicado */}
          <div className="rounded-2xl bg-western-green-deep p-6 md:p-7 text-western-cream">
            <p className="font-sans text-[14px] uppercase tracking-[0.06em] font-semibold text-western-gold">
              Você precisa de
            </p>

            <p className="mt-3 flex items-baseline flex-wrap gap-x-3" aria-live="polite">
              <span className="font-sans text-[56px] md:text-[64px] leading-none font-bold tabular-nums text-white">
                {n > 0 ? n : "—"}
              </span>
              <span className="font-sans text-[20px] font-semibold text-western-cream">
                {n > 0 ? unidade : unidadePlural}
              </span>
            </p>

            <p className="mt-4 font-sans text-[15px] leading-[1.5] text-western-cream/80">
              {conta}
            </p>

            {stats.length > 0 && (
              <dl className="mt-6 pt-6 border-t border-western-cream/20 grid grid-cols-2 gap-x-6 gap-y-5">
                {stats.map((s) => (
                  <div key={s.label}>
                    <dt className="font-sans text-[14px] text-western-cream/70">{s.label}</dt>
                    <dd className="mt-1 font-sans text-[20px] font-semibold tabular-nums text-white">
                      {s.value}
                    </dd>
                  </div>
                ))}
              </dl>
            )}

            {/* CTA dourado: é o único lugar onde o acento manda — sobre o verde. */}
            <div className="mt-7">
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
                        Usar {n} {unidade} no pedido
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

        <p className="text-meta mt-7 max-w-[62ch]">
          {med.tipo === "rev"
            ? "O painel é peça artesanal e irregular — a folga cobre o recorte e o encaixe entre painéis. Ajuste como preferir; a conta acompanha."
            : `Vão de ${VAO_PISADA_CM} cm entre as bordas — padrão de paisagismo. De centro a centro, cada passo avança ${passadaCm} cm.`}
        </p>
      </div>
    </section>
  );
}
