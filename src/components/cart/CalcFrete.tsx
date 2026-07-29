import { useMemo, useState } from "react";
import { Loader2, MapPin, Truck } from "lucide-react";
import { calcFrete, type FreteOpcao } from "@/lib/yampi/client";
import { useCartStore } from "@/stores/cartStore";
import { formatBRL } from "@/lib/catalog/client";
import { BUSINESS } from "@/config/business";

type Erro = null | "sem_cobertura" | "api_indisponivel" | "cep_invalido" | "sku_nao_encontrado";

function maskCep(v: string) {
  const d = v.replace(/\D/g, "").slice(0, 8);
  return d.length > 5 ? `${d.slice(0, 5)}-${d.slice(5)}` : d;
}

function whatsappPesadoUrl(skus: string[], cep: string) {
  const msg = `Olá, Western. Estou montando um pedido com peças de grande porte e gostaria de condição logística personalizada.\nItens: ${skus.join(
    ", ",
  )}\nCEP destino: ${cep || "—"}`;
  return `https://wa.me/${BUSINESS.whatsappFabrica}?text=${encodeURIComponent(msg)}`;
}

export default function CalcFrete() {
  const items = useCartStore((s) => s.items);
  const [cep, setCep] = useState("");
  const [loading, setLoading] = useState(false);
  const [opcoes, setOpcoes] = useState<FreteOpcao[]>([]);
  const [erro, setErro] = useState<Erro>(null);
  const [calculou, setCalculou] = useState(false);

  const temPesado = useMemo(
    () => items.some((i) => (i.pesoKg ?? 0) > 100),
    [items],
  );

  const subtotal = useMemo(
    () => items.reduce((s, i) => s + parseFloat(i.price.amount) * i.quantity, 0),
    [items],
  );

  async function handleCalc() {
    const digits = cep.replace(/\D/g, "");
    if (digits.length !== 8) {
      setErro("cep_invalido");
      setOpcoes([]);
      setCalculou(false);
      return;
    }
    setLoading(true);
    setErro(null);
    try {
      const payloadItems = items
        .filter((i) => i.sku)
        .map((i) => ({ sku: i.sku as string, quantidade: i.quantity }));
      if (payloadItems.length === 0) {
        setErro("api_indisponivel");
        setOpcoes([]);
        setCalculou(true);
        return;
      }
      const res = await calcFrete({
        cep_destino: digits,
        total: subtotal,
        items: payloadItems,
      });
      setOpcoes(res.opcoes ?? []);
      setErro(res.erro as Erro);
      setCalculou(true);
    } catch {
      setErro("api_indisponivel");
      setOpcoes([]);
      setCalculou(true);
    } finally {
      setLoading(false);
    }
  }

  const skusList = items.map((i) => i.sku ?? i.productHandle);
  const showOpcoes = calculou && opcoes.length > 0 && !erro;
  const showFallback = calculou && (erro === "sem_cobertura" || erro === "api_indisponivel");

  return (
    <div className="border border-western-gold/25 bg-western-green-deep/40 p-4 md:p-5 space-y-4">
      <div className="flex items-center gap-2">
        <Truck className="h-3.5 w-3.5 text-western-gold-soft" />
        <h3 className="text-[14px] font-semibold uppercase tracking-[0.06em] text-western-cream">
          Calcule prazo e frete
        </h3>
      </div>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <MapPin className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-western-cream-muted" />
          <input
            value={cep}
            onChange={(e) => setCep(maskCep(e.target.value))}
            onKeyDown={(e) => e.key === "Enter" && handleCalc()}
            placeholder="00000-000"
            inputMode="numeric"
            className="w-full h-11 pl-8 pr-3 bg-transparent border border-western-gold/30 text-western-cream placeholder:text-western-cream-muted/60 tabular-nums text-sm tracking-wider focus:border-western-gold focus:outline-none"
            aria-label="CEP de destino"
          />
        </div>
        <button
          type="button"
          onClick={handleCalc}
          disabled={loading}
          className="h-11 px-4 bg-western-gold text-western-green-deep font-semibold text-[14px] uppercase tracking-[0.06em] hover:bg-western-gold/90 disabled:opacity-50 inline-flex items-center gap-2"
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

      {erro === "cep_invalido" && (
        <p className="text-spec text-red-300/80 text-[14px]">CEP inválido. Verifique os 8 dígitos.</p>
      )}

      {(showOpcoes || showFallback) && (
        <div className="space-y-3 pt-2 border-t border-western-gold/15">
          {/* Bloco A — peças pesadas */}
          {temPesado && (
            <div className="border border-western-gold/40 bg-western-gold/5 p-3 space-y-2">
              <p className="text-[14px] font-semibold uppercase tracking-[0.06em] text-western-gold-soft">
                Peças de grande porte no seu pedido
              </p>
              <p className="text-spec text-western-cream-muted text-[14px] leading-relaxed">
                Identificamos itens com mais de 100kg. Para estes, oferecemos condição logística
                personalizada — frete dedicado, descarga programada e transportadora especializada.
              </p>
              <a
                href={whatsappPesadoUrl(skusList, cep.replace(/\D/g, ""))}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center w-full h-10 border border-western-gold/40 text-western-cream hover:border-western-gold font-semibold text-[14px] uppercase tracking-[0.06em] transition-colors"
              >
                Falar com especialista no WhatsApp
              </a>
            </div>
          )}

          {/* Bloco B — retirada */}
          <label className="flex items-start justify-between gap-3 py-2 cursor-pointer">
            <div className="flex items-start gap-2.5">
              <input type="radio" name="frete" defaultChecked className="mt-1 accent-western-gold" />
              <div>
                <p className="text-western-cream text-sm">Retirada gratuita no ateliê</p>
                <p className="text-spec text-western-cream-muted text-[14px] mt-0.5">
                  {BUSINESS.enderecoAtelieRua} · {BUSINESS.cidadeAtelie}/{BUSINESS.ufAtelie}
                  <br />
                  {BUSINESS.horarioAtelie} · mediante agendamento
                </p>
              </div>
            </div>
            <span className="font-display text-base text-western-cream">R$ 0,00</span>
          </label>

          {/* Bloco C — opções Yampi */}
          {showOpcoes &&
            opcoes.map((o) => (
              <label
                key={o.id}
                className="flex items-center justify-between gap-3 py-2 cursor-pointer border-t border-western-gold/10"
              >
                <div className="flex items-center gap-2.5">
                  <input type="radio" name="frete" className="accent-western-gold" />
                  <div>
                    <p className="text-western-cream text-sm">{o.transportadora}</p>
                    <p className="text-spec text-western-cream-muted text-[14px] mt-0.5">
                      {o.prazo_min_dias === o.prazo_max_dias
                        ? `${o.prazo_min_dias} dias úteis`
                        : `${o.prazo_min_dias} a ${o.prazo_max_dias} dias úteis`}
                    </p>
                  </div>
                </div>
                <span className="font-display text-base text-western-cream">
                  {formatBRL(o.valor)}
                </span>
              </label>
            ))}

          {showFallback && (
            <div className="border-t border-western-gold/10 pt-3 space-y-2">
              <p className="text-spec text-western-cream-muted text-[14px] leading-relaxed">
                {erro === "sem_cobertura"
                  ? "Este CEP não tem cotação automática."
                  : "Estamos com instabilidade na cotação."}{" "}
                Use a retirada ou fale com nosso especialista.
              </p>
              <a
                href={whatsappPesadoUrl(skusList, cep.replace(/\D/g, ""))}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center w-full h-10 border border-western-gold/40 text-western-cream hover:border-western-gold font-semibold text-[14px] uppercase tracking-[0.06em] transition-colors"
              >
                Falar com especialista no WhatsApp
              </a>
            </div>
          )}

          <p className="text-spec text-western-cream-muted/70 text-[14px] leading-relaxed pt-1">
            Valor estimado. Frete definitivo confirmado no checkout. Prazo já inclui{" "}
            {BUSINESS.prazoProducaoDias} dias úteis de produção.
          </p>
        </div>
      )}
    </div>
  );
}
