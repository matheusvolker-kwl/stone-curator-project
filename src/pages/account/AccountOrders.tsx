import { ShoppingBag } from "lucide-react";

export default function AccountOrders() {
  return (
    <div>
      <p className="text-eyebrow mb-3">Pedidos</p>
      <h2 className="font-display text-3xl text-western-green-deep mb-8">Últimos pedidos</h2>
      <div className="border border-dashed border-western-stone-warm/30 p-10 text-center bg-white">
        <ShoppingBag className="h-8 w-8 text-western-stone-warm/40 mx-auto mb-4" />
        <p className="text-western-stone-warm max-w-md mx-auto">
          O histórico de pedidos será sincronizado com o Shopify assim que seu primeiro orçamento for finalizado. Em breve você verá aqui status, NF e rastreio.
        </p>
      </div>
    </div>
  );
}
