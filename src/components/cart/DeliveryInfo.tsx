import { useMemo } from "react";
import { Truck, Check } from "lucide-react";
import { useCartStore } from "@/stores/cartStore";
import { BUSINESS } from "@/config/business";

function whatsappPesadoUrl(skus: string[]) {
  const msg = `Olá, Western. Estou montando um pedido com peças de grande porte e gostaria de condição logística personalizada.\nItens: ${skus.join(", ")}`;
  return `https://wa.me/${BUSINESS.whatsappFabrica}?text=${encodeURIComponent(msg)}`;
}

export default function DeliveryInfo() {
  const items = useCartStore((s) => s.items);
  const temPesado = useMemo(
    () => items.some((i) => (i.pesoKg ?? 0) > 100),
    [items],
  );
  const skusList = items.map((i) => i.sku ?? i.productHandle);

  return (
    <div className="border border-western-gold/25 bg-western-green-deep/40 p-3.5 md:p-4 space-y-2.5">
      <div className="flex items-center gap-2">
        <Truck className="h-3.5 w-3.5 text-western-gold-soft" />
        <h3 className="font-mono text-[10px] uppercase tracking-[0.25em] text-western-cream">
          Entrega
        </h3>
      </div>

      <div className="space-y-2.5">
        <div className="flex items-start gap-2.5">
          <Check className="h-3.5 w-3.5 text-western-gold-soft mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-western-cream text-sm">Retirada gratuita no ateliê</p>
            <p className="text-spec text-western-cream-muted text-xs leading-relaxed mt-0.5">
              {BUSINESS.enderecoAtelieRua} · {BUSINESS.cidadeAtelie}/{BUSINESS.ufAtelie} · {BUSINESS.horarioAtelie} (agendamento)
            </p>
          </div>
        </div>

        <div className="flex items-start gap-2.5 border-t border-western-gold/15 pt-2.5">
          <Check className="h-3.5 w-3.5 text-western-gold-soft mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-western-cream text-sm">Envio para todo o Brasil</p>
            <p className="text-spec text-western-cream-muted text-xs leading-relaxed mt-0.5">
              Frete calculado no checkout.
            </p>
          </div>
        </div>

        {temPesado && (
          <div className="border-t border-western-gold/15 pt-2.5 space-y-2">
            <p className="text-spec text-western-cream-muted text-xs leading-relaxed">
              Peças acima de 100 kg no seu pedido. Oferecemos cotação dedicada com transportadora especializada.
            </p>
            <a
              href={whatsappPesadoUrl(skusList)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center w-full h-10 border border-western-gold/40 text-western-cream hover:border-western-gold font-mono text-[10px] uppercase tracking-[0.22em] transition-colors"
            >
              Falar com especialista no WhatsApp
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
