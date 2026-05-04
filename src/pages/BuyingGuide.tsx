import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Check, Loader2 } from "lucide-react";
import { resolveConjunto, type Conjunto } from "@/data/conjuntos";
import { fetchProductsByHandles } from "@/lib/shopify/queries";
import { buildCartItem, useCartStore } from "@/stores/cartStore";
import { formatBRL } from "@/lib/shopify/client";
import { toast } from "sonner";

const finishes = ["Quartzo", "Arenito", "Moledo", "Granito"];
const sizes = [
  { id: "small", label: "Pequeno", desc: "Detalhes e jardins compactos" },
  { id: "medium", label: "Médio", desc: "Lagos e cantos contemplativos" },
  { id: "large", label: "Grande", desc: "Cascatas e piscina praia" },
];
const locations = [
  { id: "garden", label: "Jardim" },
  { id: "pool", label: "Piscina" },
  { id: "indoor", label: "Área interna" },
];

export default function BuyingGuide() {
  const [step, setStep] = useState(0);
  const [location, setLocation] = useState("");
  const [size, setSize] = useState("");
  const [finish, setFinish] = useState("");

  const conjunto: Conjunto | null = useMemo(() => {
    if (!location || !size || !finish) return null;
    return resolveConjunto(location, size, finish);
  }, [location, size, finish]);

  const next = () => setStep((s) => s + 1);
  const restart = () => {
    setStep(0);
    setLocation("");
    setSize("");
    setFinish("");
  };

  return (
    <div className="surface-ivory">
      <div className="container-western py-20 md:py-28 max-w-4xl">
        <p className="text-eyebrow mb-5">Guia de compra · Monte um conjunto</p>
        <div className="w-12 h-px bg-western-gold mb-8" />
        <h1 className="font-display text-4xl md:text-6xl text-western-green-deep leading-[1.05] mb-4">
          Componha seu projeto,<br />passo a passo.
        </h1>
        <p className="text-western-stone-warm text-lg leading-relaxed mb-12 max-w-2xl">
          Em três passos curados sugerimos um <em>Conjunto</em> — um kit de
          peças que conversam entre si para um cenário específico. Você pode
          adicionar tudo de uma vez ao pedido.
        </p>

        <div className="border border-western-stone-warm/20 bg-white p-10 md:p-16">
          {step === 0 && (
            <Step number="01" title="Onde será a instalação?">
              <div className="grid sm:grid-cols-3 gap-4">
                {locations.map((l) => (
                  <Choice
                    key={l.id}
                    selected={location === l.id}
                    onClick={() => {
                      setLocation(l.id);
                      next();
                    }}
                    title={l.label}
                  />
                ))}
              </div>
            </Step>
          )}

          {step === 1 && (
            <Step number="02" title="Qual a escala do projeto?">
              <div className="grid sm:grid-cols-3 gap-4">
                {sizes.map((s) => (
                  <Choice
                    key={s.id}
                    selected={size === s.id}
                    onClick={() => {
                      setSize(s.id);
                      next();
                    }}
                    title={s.label}
                    desc={s.desc}
                  />
                ))}
              </div>
            </Step>
          )}

          {step === 2 && (
            <Step number="03" title="Qual acabamento?">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {finishes.map((f) => (
                  <Choice
                    key={f}
                    selected={finish === f}
                    onClick={() => {
                      setFinish(f);
                      next();
                    }}
                    title={f}
                  />
                ))}
              </div>
            </Step>
          )}

          {step === 3 && (
            <ConjuntoResult conjunto={conjunto} onRestart={restart} finish={finish} />
          )}
        </div>
      </div>
    </div>
  );
}

function Step({
  number,
  title,
  children,
}: {
  number: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="text-spec text-western-gold mb-3">{number} / 03</p>
      <h2 className="font-display text-3xl md:text-4xl text-western-green-deep mb-10">
        {title}
      </h2>
      {children}
    </div>
  );
}

function Choice({
  title,
  desc,
  selected,
  onClick,
}: {
  title: string;
  desc?: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`border p-6 text-left transition-all duration-300 ${
        selected
          ? "border-western-gold bg-western-gold/5"
          : "border-western-stone-warm/25 hover:border-western-gold"
      }`}
    >
      <span className="font-display text-2xl text-western-green-deep block mb-2">
        {title}
      </span>
      {desc && <span className="text-spec text-western-stone-warm">{desc}</span>}
    </button>
  );
}

function ConjuntoResult({
  conjunto,
  finish,
  onRestart,
}: {
  conjunto: Conjunto | null;
  finish: string;
  onRestart: () => void;
}) {
  const handles = conjunto?.items.map((i) => i.handle) ?? [];
  const { data: products = [], isLoading } = useQuery({
    queryKey: ["bundle-products", handles.join(",")],
    queryFn: () => fetchProductsByHandles(handles),
    enabled: handles.length > 0,
  });
  const addBundle = useCartStore((s) => s.addBundle);
  const isLoadingCart = useCartStore((s) => s.isLoading);

  if (!conjunto) {
    return (
      <div>
        <p className="text-eyebrow mb-3">Sem conjunto curado</p>
        <h2 className="font-display text-3xl text-western-green-deep mb-4">
          Ainda não há um conjunto para essa combinação.
        </h2>
        <p className="text-western-stone-warm mb-8">
          Fale com nosso time — montamos uma curadoria sob medida para o seu projeto.
        </p>
        <div className="flex gap-4">
          <Link to="/contato" className="btn-outline-forest">Falar com curadoria</Link>
          <button onClick={onRestart} className="link-underline font-mono text-xs uppercase tracking-[0.2em] text-western-green-deep">
            Recomeçar
          </button>
        </div>
      </div>
    );
  }

  const itemsResolved = conjunto.items.map((it) => {
    const product = products.find((p) => p.handle === it.handle);
    return { ...it, product };
  });

  const total = itemsResolved.reduce((sum, it) => {
    if (!it.product) return sum;
    const price = parseFloat(it.product.priceRange.minVariantPrice.amount);
    return sum + price * it.qty;
  }, 0);

  const allAvailable = itemsResolved.every((it) => it.product);

  const handleAdd = async () => {
    const cartItems = itemsResolved
      .map((it) => {
        if (!it.product) return null;
        const variantId = it.product.variants.edges[0]?.node?.id;
        if (!variantId) return null;
        return buildCartItem(it.product, variantId, it.qty);
      })
      .filter((x): x is NonNullable<typeof x> => !!x);
    if (cartItems.length === 0) return;
    await addBundle(cartItems);
    toast.success(`Conjunto "${conjunto.nome}" adicionado ao pedido`, {
      description: `${cartItems.length} ${cartItems.length === 1 ? "peça" : "peças"} no carrinho`,
      position: "top-right",
    });
  };

  return (
    <div>
      <p className="text-eyebrow mb-3">Conjunto sugerido</p>
      <h2 className="font-display text-4xl md:text-5xl text-western-green-deep leading-tight mb-2">
        {conjunto.nome}
      </h2>
      <p className="text-spec text-western-stone-warm mb-8">{conjunto.ambiente}</p>
      <p className="text-western-stone-warm leading-relaxed mb-10 max-w-2xl">
        {conjunto.descricao}
      </p>

      {/* Lista de peças do conjunto */}
      <div className="border-t border-western-stone-warm/20">
        {itemsResolved.map((it) => (
          <div
            key={it.handle}
            className="grid grid-cols-[80px_1fr_auto] gap-4 py-5 border-b border-western-stone-warm/15 items-center"
          >
            <div className="frame-product w-20 h-20">
              {it.product?.images.edges[0]?.node && (
                <img
                  src={it.product.images.edges[0].node.url}
                  alt={it.product.title}
                  className="w-full h-full object-contain p-1"
                />
              )}
            </div>
            <div>
              <p className="font-display text-xl text-western-green-deep">
                {it.product?.title ?? it.handle}
              </p>
              {it.notaRapida && (
                <p className="text-spec text-western-stone-warm mt-1">{it.notaRapida}</p>
              )}
            </div>
            <div className="text-right">
              <p className="text-spec text-western-stone-warm">qty</p>
              <p className="font-display text-2xl text-western-green-deep">{it.qty}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Total */}
      <div className="flex flex-wrap items-baseline justify-between gap-4 pt-8 mb-8">
        <div>
          <p className="text-eyebrow mb-2">Investimento estimado</p>
          <p className="font-display text-4xl text-western-green-deep">
            {isLoading ? "—" : formatBRL(total)}
          </p>
          <p className="text-spec text-western-stone-warm mt-2">
            Sem frete · prazo de produção 15 a 30 dias úteis
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 items-center">
        <button
          onClick={handleAdd}
          disabled={!allAvailable || isLoading || isLoadingCart}
          className="btn-gold disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoadingCart ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <Check className="h-4 w-4" /> Adicionar conjunto ao pedido
            </>
          )}
        </button>
        <Link
          to="/linhas"
          className="link-underline font-mono text-xs uppercase tracking-[0.2em] text-western-green-deep"
        >
          Ajustar manualmente <ArrowRight className="inline h-3 w-3 ml-1" />
        </Link>
        <button
          onClick={onRestart}
          className="link-underline font-mono text-xs uppercase tracking-[0.2em] text-western-stone-warm"
        >
          Refazer o guia
        </button>
      </div>

      {!allAvailable && !isLoading && (
        <p className="text-spec text-western-stone-warm mt-6">
          Algumas peças deste conjunto ainda não estão no catálogo —
          fale com a curadoria para uma cotação exclusiva ({finish}).
        </p>
      )}
    </div>
  );
}
