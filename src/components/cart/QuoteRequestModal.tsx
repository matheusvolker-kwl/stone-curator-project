import { useCartStore } from "@/stores/cartStore";
import QuoteLeadModal from "@/components/quote/QuoteLeadModal";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function QuoteRequestModal({ open, onOpenChange }: Props) {
  const { items } = useCartStore();
  const subtotal = items.reduce((s, i) => s + parseFloat(i.price.amount) * i.quantity, 0);
  const currency = items[0]?.price.currencyCode ?? "BRL";

  return (
    <QuoteLeadModal
      open={open}
      onOpenChange={onOpenChange}
      items={items}
      subtotal={subtotal}
      currency={currency}
      origem="cart_drawer"
    />
  );
}
