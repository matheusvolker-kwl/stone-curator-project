import { useMemo, useState } from "react";
import { Loader2, Truck, MessageCircle, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { formatBRL } from "@/lib/shopify/client";
import type { CartItem } from "@/stores/cartStore";

const WHATSAPP_FALLBACK = "5511993403485";
const PESO_LIMITE_KG = 100;

interface OpcaoFrete {
  transportadora: string;
  valor: number;
  prazo_min_dias: number;
  prazo_max_dias: number;
}

interface CalcFreteProps {
  items: CartItem[];
}

function formatCep(v: string) {
  const d = v.replace(/\D/g, "").slice(0, 8);
  return d.length > 5 ? `${d.slice(0, 5)}-${d.slice(5)}` : d;
}

function whatsappLink(items: CartItem[], cep: string, motivo: "pesado" | "sem_cobertura") {
  const skus = items.map((i) => i.sku || i.variantTitle).join(", ");
  const intro =
    motivo === "pesado"
      ? "Estou montando um pedido com peças de grande porte e gostaria de condição logística personalizada."
      : "Preciso de cotação de frete para um CEP que não tem cotação automática.";
  const msg = `Olá, Western. ${intro} Itens: ${skus}. CEP destino: ${cep || "—"}.`;
  return `https://wa.me/${WHATSAPP_FALLBACK}?text=${encodeURIComponent(msg)}`;
}

export default function CalcFrete({ items }: CalcFreteProps) {
  const [cep, setCep] = useState("");
  const [loading, setLoading] = useState(false);
  const [opcoes, setOpcoes] = useState<OpcaoFrete[] | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [validacao, setValidacao] = useState<string | null>(null);

  const temPesado = useMemo(
    () => items.some((i) => (i.peso_kg ?? 0) > PESO_LIMITE_KG),
    [items],
  );

  const handleCalcular = async () => {
    setValidacao(null);
    const cepDigits = cep.replace(/\D/g, "");
    if (cepDigits.length !== 8) {
      setValidacao("CEP inválido. Verifique o formato (00000-000).");
      return;
    }
    setLoading(true);
    setErro(null);
    try {
      const { data, error } = await supabase.functions.invoke("calc-frete", {
        body: {
          cep_destino: cepDigits,
          items: items.map((i) => ({
            sku: i.sku ?? undefined,
            peso_kg: i.peso_kg,
            comprimento_cm: i.comprimento_cm,
            largura_cm: i.largura_cm,
            altura_cm: i.altura_cm,
            quantidade: i.quantity,
            valor_unitario: parseFloat(i.price.amount),
          })),
        },
      });
      if (error) throw error;
      setOpcoes((data?.opcoes as OpcaoFrete[]) ?? []);
      setErro((data?.erro as string) ?? null);
    } catch (e) {
      console.error("calc-frete", e);
      setOpcoes([]);
      setErro("api_indisponivel");
    } finally {
      setLoading(false);
    }
  };

  const calculou = opcoes !== null;
  const semCobertura = erro === "sem_cobertura" || erro === "api_indisponivel";

  return (
    <div className="border border-western-gold/25 bg-western-green-deep/40 p-5 md:p-6 space-y-5">
      <div>
        <p className="text-eyebrow flex items-center gap-2">
          <Truck className="h-3.5 w-3.5 text-western-gold-soft" /> Calcule prazo e frete
        </p>
        <p className="text-spec text-western-cream-muted text-xs mt-1">
          Inclui 15 dias úteis de produção no atelier.
        </p>
      </div>

      <div className="space-y-2">
        <label className="font-mono text-[10px] uppercase tracking-[0.22em] text-western-cream-muted">
          CEP do destino
        </label>
        <div className="flex gap-2">
          <input
            value={cep}
            onChange={(e) => setCep(formatCep(e.target.value))}
            placeholder="00000-000"
            inputMode="numeric"
            className="flex-1 h-11 bg-transparent border border-western-gold/30 px-3 text-western-cream placeholder:text-western-cream-muted/50 focus:outline-none focus:border-western-gold font-mono text-sm tracking-wider"
          />
          <button
            type="button"
            onClick={handleCalcular}
            disabled={loading}
            className="h-11 px-5 bg-western-gold text-western-green-deep hover:bg-western-gold/90 font-mono text-[11px] uppercase tracking-[0.22em] disabled:opacity-60 inline-flex items-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" /> Cotando…
              </>
            ) : calculou ? (
              "Recalcular"
            ) : (
              "Calcular"
            )}
          </button>
        </div>
        {validacao && (
          <p className="text-spec text-red-300 text-xs">{validacao}</p>
        )}
        <a
          href="https://buscacepinter.correios.com.br/app/endereco/index.php"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block font-mono text-[10px] uppercase tracking-[0.22em] text-western-cream-muted hover:text-western-gold-soft"
        >
          Não sei meu CEP →
        </a>
      </div>

      {temPesado && (
        <div className="border border-western-gold/40 bg-western-gold/5 p-4 space-y-3">
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 text-western-gold-soft mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-western-gold-soft">
                Peças de grande porte no seu pedido
              </p>
              <p className="text-spec text-western-cream-muted text-xs mt-2 leading-relaxed">
                Identificamos itens com mais de 100kg. Para estes, oferecemos condição logística
                personalizada — frete dedicado, descarga programada e transportadora especializada.
              </p>
            </div>
          </div>
          <a
            href={whatsappLink(items, cep, "pesado")}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full h-11 border border-western-gold/40 bg-western-green-deep text-western-cream hover:border-western-gold font-mono text-[11px] uppercase tracking-[0.22em] inline-flex items-center justify-center gap-2 transition-colors"
          >
            <MessageCircle className="h-3.5 w-3.5" /> Falar com especialista no WhatsApp
          </a>
        </div>
      )}

      {calculou && (
        <div className="space-y-3">
          {/* Bloco B — Retirada */}
          <div className="border border-western-gold/20 p-3 flex items-start justify-between gap-3">
            <div>
              <p className="font-display text-sm text-western-cream">Retirada gratuita na fábrica</p>
              <p className="text-spec text-western-cream-muted text-xs mt-1 leading-relaxed">
                Cajamar/SP · Seg–Sex, 8h às 17h, mediante agendamento
              </p>
            </div>
            <p className="font-mono text-xs text-western-gold-soft whitespace-nowrap">R$ 0,00</p>
          </div>

          {/* Bloco C — Opções GoFretes */}
          {opcoes && opcoes.length > 0 && (
            <ul className="space-y-2">
              {opcoes.map((o, idx) => (
                <li
                  key={`${o.transportadora}-${idx}`}
                  className="border border-western-gold/15 p-3 flex items-start justify-between gap-3"
                >
                  <div>
                    <p className="font-display text-sm text-western-cream">{o.transportadora}</p>
                    <p className="text-spec text-western-cream-muted text-xs mt-1">
                      {o.prazo_min_dias === o.prazo_max_dias
                        ? `${o.prazo_min_dias} dias úteis`
                        : `${o.prazo_min_dias} a ${o.prazo_max_dias} dias úteis`}
                    </p>
                  </div>
                  <p className="font-mono text-xs text-western-gold-soft whitespace-nowrap">
                    {formatBRL(o.valor, "BRL")}
                  </p>
                </li>
              ))}
            </ul>
          )}

          {semCobertura && (
            <div className="space-y-3">
              <p className="text-spec text-western-cream-muted text-xs leading-relaxed">
                {erro === "api_indisponivel"
                  ? "Cotação automática indisponível no momento. Use a retirada ou fale com nosso especialista."
                  : "Este CEP não tem cotação automática. Use a retirada ou fale com nosso especialista."}
              </p>
              <a
                href={whatsappLink(items, cep, "sem_cobertura")}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full h-11 border border-western-gold/40 text-western-cream hover:border-western-gold font-mono text-[11px] uppercase tracking-[0.22em] inline-flex items-center justify-center gap-2 transition-colors"
              >
                <MessageCircle className="h-3.5 w-3.5" /> Falar com especialista no WhatsApp
              </a>
            </div>
          )}

          {opcoes && opcoes.length > 0 && (
            <p className="text-spec text-western-cream-muted text-[10px] italic leading-relaxed">
              Valor estimado. Frete definitivo confirmado no checkout. Prazo já inclui 15 dias úteis
              de produção.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
