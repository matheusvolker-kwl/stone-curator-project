// Página do carrinho — "Ver orçamento completo".
//
// Destino do CartDrawer (que continua existindo para a revisão rápida). Aqui o
// cliente respira: linhas grandes, uma decisão por vez, resumo sempre visível.
//
// Regras de negócio respeitadas (mesmas do drawer — fonte única):
//   · Preço é gated: visitante não vê valores…
//   · …EXCETO quando o orçamento só tem Western Box — ela é vendida sem
//     cadastro e sem pedido mínimo (boxOnly).
//   · Pedido mínimo (BUSINESS.pedidoMinimoBRL) é INFORMATIVO — mostra o quanto
//     falta, nunca bloqueia o botão (idêntico ao CartDrawer).
//   · Checkout = hand-off top-level para o Woo (submitCheckoutHandoff).

import { useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, Clock, Download, FileText, Loader2, Lock, MessageCircle, Minus, Plus, ShieldCheck, ShoppingBag, Store, Trash2, TrendingUp, Truck } from "lucide-react";
import { toast } from "sonner";

import Seo from "@/components/seo/Seo";
import Reveal from "@/components/shared/Reveal";
import QtyInput from "@/components/shared/QtyInput";
import QuoteRequestModal from "@/components/cart/QuoteRequestModal";
import CartCrossSell from "@/components/cart/CartCrossSell";
import { useCartStore, type CartItem } from "@/stores/cartStore";
import { useAuth } from "@/hooks/useAuth";
import { usePartnerPricing } from "@/hooks/usePartnerPricing";
import { usePublishStickyBarHeight } from "@/hooks/usePublishStickyBarHeight";
import { formatBRL, cdnImg } from "@/lib/catalog/client";
import { supabase } from "@/integrations/supabase/client";
import { registerPedidoNovoLead } from "@/lib/leads/pedidoNovo";
import { BUSINESS } from "@/config/business";
import { totalComDesconto, unitarioComDesconto, somaComDesconto, vendaSugerida } from "@/lib/precoParceiro";

const WHATS_URL = `https://wa.me/${BUSINESS.whatsappFabrica}`;

/** Western Box — única peça aberta a todos (sem cadastro, sem pedido mínimo). */
const BOX_SKU = "western-box-01";
const BOX_HANDLE = "western-box";

function isWesternBox(item: CartItem) {
  return (
    item.sku?.toLowerCase() === BOX_SKU ||
    item.productHandle?.toLowerCase() === BOX_HANDLE
  );
}

export default function Carrinho() {
  const { items, isLoading, updateQuantity, removeItem } = useCartStore();
  const { user, isApproved, session, empresa } = useAuth();
  const { discountPct } = usePartnerPricing();

  const [quoteOpen, setQuoteOpen] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  // Publica a altura da barra fixa mobile p/ o FAB do WhatsApp e a pílula
  // subirem acima do CTA de checkout (antes cobriam o botão).
  const mobileBarRef = useRef<HTMLDivElement>(null);
  usePublishStickyBarHeight(mobileBarRef);

  const currency = items[0]?.price.currencyCode ?? "BRL";

  const { totalQty, subtotal, sugerido, boxOnly } = useMemo(() => {
    const qty = items.reduce((s, i) => s + i.quantity, 0);
    const liquido = somaComDesconto(
      items.map((i) => ({ precoUnitario: parseFloat(i.price.amount), quantidade: i.quantity })),
      discountPct,
    );
    return {
      totalQty: qty,
      subtotal: liquido,
      // Quanto este carrinho revende, pelo preço sugerido ao consumidor.
      // Parte do preço de TABELA de cada item, nunca do preço já descontado.
      sugerido: items.reduce(
        (s, i) => s + vendaSugerida(parseFloat(i.price.amount)) * i.quantity,
        0,
      ),
      boxOnly: items.length > 0 && items.every(isWesternBox),
    };
  }, [items, discountPct]);

  // Valores só aparecem para parceiro aprovado — ou quando o orçamento é só Box.
  const showValues = isApproved || boxOnly;

  // Pedido mínimo: informativo (progresso), nunca bloqueia. Não vale para a Box.
  const minOrder = BUSINESS.pedidoMinimoBRL;
  const minApplies = showValues && !boxOnly;
  const belowMin = minApplies && subtotal > 0 && subtotal < minOrder;
  const minPct = Math.min(100, Math.round((subtotal / minOrder) * 100));

  const lineTotal = (item: CartItem) =>
    totalComDesconto(parseFloat(item.price.amount), item.quantity, discountPct);
  const unitPrice = (item: CartItem) =>
    unitarioComDesconto(parseFloat(item.price.amount), discountPct);

  const handleCheckout = async () => {
    if (checkoutLoading) return;
    setCheckoutLoading(true);

    // Fire-and-forget: registra o lead antes do redirect para o Woo.
    void (async () => {
      let profile: { nome?: string; telefone?: string; cidade?: string; empresa?: string } | null =
        null;
      if (user) {
        const { data } = await supabase
          .from("partner_profiles")
          .select("nome, telefone, cidade, empresa")
          .eq("user_id", user.id)
          .maybeSingle();
        profile = data ?? null;
      }
      await registerPedidoNovoLead({
        items,
        subtotal,
        currency,
        userId: user?.id ?? null,
        origem: "cart_checkout",
        contact: {
          nome: profile?.nome ?? null,
          email: user?.email ?? null,
          telefone: profile?.telefone ?? null,
          empresa: profile?.empresa ?? empresa ?? null,
          cidade: profile?.cidade ?? null,
        },
      });
    })();

    try {
      // Parceiro aprovado: pede um TICKET OPACO ao backend. O payload PJ nunca
      // trafega pelo browser — o mu-plugin do Woo troca o ticket server-to-server.
      let ticket: string | null = null;
      if (isApproved && user) {
        try {
          const { data, error } = await supabase.functions.invoke("checkout-ticket-create", {
            method: "POST",
          });
          if (error) console.warn("[checkout-ticket-create] failed", error);
          else if (typeof data?.ticket === "string" && data.ticket.length >= 16) {
            ticket = data.ticket;
          }
        } catch (e) {
          console.warn("[checkout-ticket-create] exception", e);
        }
      }

      const { submitCheckoutHandoff } = await import("@/lib/woo-checkout");
      const result = submitCheckoutHandoff(items, ticket);

      if (result.submitted === 0) {
        toast.error("Não foi possível abrir o checkout", {
          description: "Atualize a página e tente novamente, ou fale conosco no WhatsApp.",
        });
        return;
      }
      if (result.skipped > 0) {
        toast.warning("Algumas peças não puderam ser enviadas ao checkout", {
          description: `${result.skipped} ${
            result.skipped === 1 ? "peça ficou" : "peças ficaram"
          } de fora. Revise seu carrinho ou fale no WhatsApp.`,
          duration: 8000,
        });
      }
      // A navegação top-level já foi disparada pelo form.submit().
    } catch (e) {
      console.error(e);
      toast.error("Instabilidade no checkout", {
        description: "Tente novamente em alguns minutos ou fale conosco no WhatsApp.",
      });
    } finally {
      setCheckoutLoading(false);
    }
  };

  /* ======================================================================
   * ESTADO VAZIO — uma tela, duas saídas.
   * ==================================================================== */
  if (items.length === 0) {
    return (
      <>
        <Seo
          title="Meu carrinho · Western"
          description="Revise as peças do seu carrinho e finalize seu pedido com a Western."
          path="/carrinho"
        />
        <main className="surface-ivory min-h-[70vh] py-12 md:py-16">
          <div className="container-western">
            <div className="mx-auto max-w-[520px] text-center">
              <ShoppingBag
                className="mx-auto h-10 w-10 text-western-border-strong"
                aria-hidden="true"
              />
              <h1 className="display-md text-western-green-deep mt-4">
                Seu carrinho está vazio
              </h1>
              <p className="text-body mt-3">
                Explore o catálogo ou comece pela Western Box — o kit de amostras aberto a
                todos, sem cadastro.
              </p>
              <div className="mt-8 grid gap-3">
                <Link
                  to="/produtos"
                  className="inline-flex w-full items-center justify-center gap-2 min-h-control px-7 rounded-lg bg-western-cta text-western-cream hover:bg-western-green-deep font-sans text-[15px] font-semibold transition-[background-color,color,transform] duration-150 ease-out active:scale-[0.97] motion-reduce:active:scale-100"
                >
                  Ver catálogo
                  <ArrowRight className="h-5 w-5" />
                </Link>
                <Link
                  to="/western-box"
                  className="inline-flex w-full items-center justify-center gap-2 min-h-control px-7 rounded-lg border border-western-border-strong text-western-green-deep hover:border-western-green-deep hover:bg-western-paper font-sans text-[15px] font-semibold transition-colors"
                >
                  Conhecer a Western Box
                </Link>
              </div>
              <a
                href={WHATS_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="tap-target inline-flex items-center justify-center gap-2 mt-6 font-sans text-[15px] font-semibold text-western-green-deep hover:text-western-cta transition-colors"
              >
                <MessageCircle className="h-5 w-5 text-western-bronze" />
                Dúvidas? Falar com o ateliê
              </a>
            </div>
          </div>
        </main>
      </>
    );
  }

  /* ======================================================================
   * ORÇAMENTO COM PEÇAS
   * ==================================================================== */
  /* UMA porta para o passo "autenticar". Antes eram quatro (o CTA do resumo, os
   * dois botões do card do gate e o chip "Ver preço de parceiro" de cada peça).
   * Sobram: este CTA + o link discreto "Já sou parceiro" logo abaixo dele.
   * O rótulo também deixa de mentir: visitante não "finaliza" nada. */
  const ctaLabel = showValues
    ? "Ir para o pagamento"
    : session
      ? "Acompanhar meu cadastro"
      : "Criar cadastro para ver preços";
  const ctaTo = session ? "/minha-conta" : "/parceiro/cadastro";

  const TrustRow = () => (
    <div className="space-y-2">
      <p className="flex items-start gap-2.5 font-sans text-[14px] leading-snug text-western-stone-warm">
        <Lock className="h-4 w-4 text-western-bronze flex-shrink-0 mt-0.5" aria-hidden="true" />
        Você conclui o pagamento em ambiente seguro, fora do site.
      </p>
      <p className="flex items-start gap-2.5 font-sans text-[14px] leading-snug text-western-stone-warm">
        <FileText
          className="h-4 w-4 text-western-bronze flex-shrink-0 mt-0.5"
          aria-hidden="true"
        />
        {/* O CNPJ é UM token: sem o nowrap ele quebrava no meio e o "24"
            final caía sozinho na linha de baixo (item 8 da lista de 05/08). */}
        <span>
          Empresa brasileira · Compra segura ·{" "}
          <span className="whitespace-nowrap">CNPJ {BUSINESS.cnpj}</span>
        </span>
      </p>
      <p className="flex items-start gap-2.5 font-sans text-[14px] leading-snug text-western-stone-warm">
        <ShieldCheck
          className="h-4 w-4 text-western-bronze flex-shrink-0 mt-0.5"
          aria-hidden="true"
        />
        Garantia de {BUSINESS.garantiaLabel} · reposição garantida · entrega rastreada
      </p>
    </div>
  );

  return (
    <>
      <Seo
        title="Meu carrinho · Western"
        description="Revise as peças do seu carrinho, confira o subtotal e finalize seu pedido com a Western."
        path="/carrinho"
      />

      <main className="surface-ivory pb-[168px] lg:pb-24">
        <div className="container-western pt-8 md:pt-12">
          {/* Cabeçalho */}
          <Link
            to="/produtos"
            className="tap-target inline-flex items-center gap-2 -ml-1 font-sans text-[15px] font-semibold text-western-green-deep hover:text-western-cta transition-colors"
          >
            <ArrowLeft className="h-5 w-5" aria-hidden="true" />
            Continuar comprando
          </Link>

          {/* Cabeçalho Balcão: título display-md + UMA linha meta (sem eyebrow —
              "Composição atual" violava o vocabulário: composição é cena). */}
          <header className="mt-2">
            <h1 className="display-md text-western-green-deep">Meu carrinho</h1>
            <p className="text-meta mt-1.5">
              {totalQty} {totalQty === 1 ? "peça" : "peças"} · garantia de{" "}
              {BUSINESS.garantiaLabel} e reposição garantida
            </p>
          </header>

          <div className="mt-8 md:mt-10 grid gap-10 lg:gap-14 lg:grid-cols-[minmax(0,1fr)_380px] items-start">
            {/* ============ COLUNA ESQUERDA — linhas ============ */}
            <div>
              {/* Gate do preço — visitante (a Box sozinha nunca é gated).
               * Explica a regra; NÃO oferece botões. A ação vive uma única vez,
               * no resumo (e na barra fixa do mobile, que é o mesmo CTA). */}
              {!showValues && (
                <div className="mb-5 rounded-lg border border-western-border-soft bg-western-paper p-4">
                  <div className="flex items-start gap-3">
                    <Lock
                      className="h-5 w-5 text-western-bronze flex-shrink-0 mt-0.5"
                      aria-hidden="true"
                    />
                    <div className="min-w-0">
                      <p className="font-sans text-[15px] font-semibold leading-snug text-western-green-deep">
                        {session ? "Cadastro em análise" : "Preços de parceiro"}
                      </p>
                      <p className="text-body-balcao mt-1">
                        {session
                          ? "Assim que seu cadastro for aprovado, os valores aparecem aqui — seu carrinho fica guardado."
                          : `Vendemos no atacado para profissionais com CNPJ, com pedido mínimo de ${BUSINESS.pedidoMinimoLabel} por pedido. Os valores aparecem aqui assim que seu cadastro for aprovado — seu carrinho fica guardado.`}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Linhas do orçamento */}
              <ul className="rounded-xl border border-western-border-soft bg-white px-5 md:px-6">
                {items.map((item, idx) => (
                  <li
                    key={item.variantId}
                    className={`flex gap-4 py-4 ${
                      idx === items.length - 1 ? "" : "border-b border-western-border-soft"
                    }`}
                  >
                    <Link
                      to={`/produtos/${item.productHandle}`}
                      className="w-[72px] h-[72px] md:w-[84px] md:h-[84px] flex-shrink-0 overflow-hidden rounded-lg bg-western-paper border border-western-border-soft"
                    >
                      {item.productImage && (
                        <img
                          src={cdnImg(item.productImage, 200)}
                          alt={item.productTitle}
                          loading="lazy"
                          className="w-full h-full object-contain p-1.5"
                        />
                      )}
                    </Link>

                    <div className="flex-1 min-w-0">
                      {/* MODELO B: linha ÚNICA no desktop — nome · stepper · total ·
                          remover, tudo alinhado na mesma régua. No mobile o nome
                          ocupa a 1ª linha e os controles descem juntos pra 2ª. */}
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 md:flex-nowrap">
                        <div className="min-w-0 flex-1 basis-full md:basis-auto">
                          <h2 className="font-sans text-[15px] font-semibold leading-snug text-western-green-deep truncate">
                            <Link
                              to={`/produtos/${item.productHandle}`}
                              className="hover:text-western-cta transition-colors"
                            >
                              {item.productTitle}
                            </Link>
                          </h2>
                          <p className="font-sans text-[13px] text-western-stone-warm mt-0.5 truncate">
                            {item.selectedOptions.map((o) => o.value).join(" · ")}
                            {item.sku && <> · Ref. {item.sku}</>}
                          </p>
                        </div>

                        <div className="inline-flex shrink-0 items-center rounded-lg border border-western-border-strong bg-white overflow-hidden">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                            className="h-9 w-9 flex items-center justify-center text-western-green-deep hover:bg-western-paper transition-colors"
                            aria-label={`Diminuir quantidade de ${item.productTitle}`}
                          >
                            <Minus className="h-3.5 w-3.5" aria-hidden="true" />
                          </button>
                          <QtyInput
                            value={item.quantity}
                            onCommit={(n) => updateQuantity(item.variantId, n)}
                            ariaLabel={`Quantidade de ${item.productTitle}`}
                            className="h-9 w-12 border-0 bg-transparent px-1 text-center font-sans text-[14px] font-semibold tabular-nums text-western-green-deep focus:outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                            className="h-9 w-9 flex items-center justify-center text-western-green-deep hover:bg-western-paper transition-colors"
                            aria-label={`Aumentar quantidade de ${item.productTitle}`}
                          >
                            <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                          </button>
                        </div>

                        <div className="shrink-0 text-right min-w-[96px]">
                          {showValues ? (
                            <>
                              <p className="font-sans text-[15px] font-bold tabular-nums leading-tight text-western-green-deep whitespace-nowrap">
                                {formatBRL(lineTotal(item), item.price.currencyCode)}
                              </p>
                              {item.quantity > 1 && (
                                <p className="font-sans text-[13px] text-western-stone-warm whitespace-nowrap">
                                  {formatBRL(unitPrice(item), item.price.currencyCode)} / peça
                                </p>
                              )}
                            </>
                          ) : (
                            /* O gate é INFORMAÇÃO, não porta — a porta é o CTA do resumo. */
                            <p className="inline-flex items-center gap-1.5 font-sans text-[13.5px] font-semibold text-western-bronze whitespace-nowrap">
                              <Lock className="h-3.5 w-3.5 flex-shrink-0" aria-hidden="true" />
                              Preço de parceiro
                            </p>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={() => removeItem(item.variantId)}
                          className="h-9 w-9 shrink-0 flex items-center justify-center rounded-md text-western-stone-warm hover:text-status-error hover:bg-western-paper transition-colors"
                          aria-label={`Remover ${item.productTitle} do carrinho`}
                        >
                          <Trash2 className="h-4 w-4" aria-hidden="true" />
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>

              {/* Cross-sell — combina com a composição (mesmo componente do drawer) */}
              {items.length > 0 && (
                <div className="mt-8">
                  <CartCrossSell
                    collectionHandle={
                      items.every((i) => i.wooKind !== "bundle" && !i.conjuntoRef)
                        ? "conjuntos"
                        : items[0]?.collectionHandle ?? "conjuntos"
                    }
                    excludeHandles={items.map((i) => i.productHandle)}
                    onNavigate={() => {}}
                  />
                </div>
              )}

            </div>

            {/* ============ COLUNA DIREITA — resumo ============ */}
            <aside className="lg:sticky lg:top-28">
              <Reveal variant="fade" duration={500}>
                <div className="rounded-xl border border-western-border-soft surface-paper p-5">
                  <p className="text-eyebrow">Resumo</p>

                  <div className="mt-3 flex items-baseline justify-between gap-3">
                    <span className="font-sans text-[15px] font-semibold text-western-green-deep">
                      Subtotal
                      <span className="font-normal text-western-stone-warm">
                        {" "}
                        · {totalQty} {totalQty === 1 ? "peça" : "peças"}
                      </span>
                    </span>
                    {showValues ? (
                      <span className="font-sans text-[20px] font-bold tabular-nums leading-none text-western-green-deep">
                        {formatBRL(subtotal, currency)}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 font-sans text-[15px] font-semibold text-western-bronze">
                        <Lock className="h-4 w-4" aria-hidden="true" /> Parceiro
                      </span>
                    )}
                  </div>

                  {/* O QUE ESTE PEDIDO REVENDE
                      O parceiro decide o tamanho da compra pelo que ela devolve,
                      não pelo que ela custa. Ver os dois números lado a lado é o
                      que transforma "R$ 3.020 é caro" em "R$ 3.020 viram
                      R$ 6.342". Sem isso ele faz essa conta fora da loja — ou
                      não faz, e compra menos. */}
                  {showValues && sugerido > 0 && (
                    <div className="mt-4 border-t border-western-border-soft pt-4">
                      <div className="flex items-baseline justify-between gap-4">
                        <span className="inline-flex items-center gap-2 font-sans text-[14px] text-western-stone-warm">
                          <Store className="h-4 w-4 text-western-bronze" aria-hidden="true" />
                          Você revende por
                        </span>
                        <span className="font-sans text-[16px] font-semibold tabular-nums text-western-green-deep">
                          {formatBRL(sugerido, currency)}
                        </span>
                      </div>
                      {/* Mesmo tratamento da página de produto: ícone e bronze
                          sobre fundo papel marcam a família "ganho". O parceiro
                          reconhece o bloco em qualquer tela sem precisar ler. */}
                      <div className="mt-2.5 flex items-baseline justify-between gap-4 rounded-md bg-western-paper px-3 py-2.5">
                        <span className="inline-flex items-center gap-2 font-sans text-[14px] font-semibold text-western-green-deep">
                          <TrendingUp className="h-4 w-4 text-western-bronze" aria-hidden="true" />
                          Seu lucro
                        </span>
                        <span className="font-sans text-[20px] font-bold tabular-nums text-western-bronze">
                          {formatBRL(sugerido - subtotal, currency)}
                        </span>
                      </div>
                      <p className="text-meta mt-2">
                        Pelo preço sugerido ao consumidor final.
                      </p>
                    </div>
                  )}

                  {/* Pedido mínimo — o visitante precisa saber da barreira ANTES de
                   * se cadastrar, não depois. Para o parceiro aprovado, a barra de
                   * progresso abaixo já diz o mesmo (e diz quanto falta). */}
                  {!showValues && !boxOnly && (
                    <p className="mt-2.5 font-sans text-[15px] leading-snug text-western-green-deep">
                      Pedido mínimo de{" "}
                      <span className="font-semibold">{BUSINESS.pedidoMinimoLabel}</span> por
                      pedido.
                    </p>
                  )}

                  {/* Frete/retirada/prazo são resolvidos no checkout Woo (decisão do
                      dono). Aqui só antecipamos, com clareza, o que vem no próximo passo. */}
                  <div className="mt-3.5 rounded-[12px] border border-western-border-soft bg-western-paper p-3.5">
                    <p className="text-eyebrow mb-2.5">No próximo passo</p>
                    <ul className="space-y-2.5">
                      <li className="flex items-start gap-3">
                        <Truck
                          className="h-5 w-5 flex-shrink-0 text-western-bronze"
                          strokeWidth={1.75}
                          aria-hidden="true"
                        />
                        <div className="min-w-0">
                          <p className="font-sans text-[15px] font-semibold leading-snug text-western-green-deep">
                            Frete pelo seu CEP
                          </p>
                          <p className="text-meta mt-0.5">
                            Você calcula o valor para o seu endereço.
                          </p>
                        </div>
                      </li>
                      <li className="flex items-start gap-3">
                        <Store
                          className="h-5 w-5 flex-shrink-0 text-western-bronze"
                          strokeWidth={1.75}
                          aria-hidden="true"
                        />
                        <div className="min-w-0">
                          <p className="font-sans text-[15px] font-semibold leading-snug text-western-green-deep">
                            Ou retire grátis no ateliê
                          </p>
                          <p className="text-meta mt-0.5">
                            Retirada em {BUSINESS.cidadeAtelie}/{BUSINESS.ufAtelie}, sem custo.
                          </p>
                        </div>
                      </li>
                      <li className="flex items-start gap-3">
                        <Clock
                          className="h-5 w-5 flex-shrink-0 text-western-bronze"
                          strokeWidth={1.75}
                          aria-hidden="true"
                        />
                        <div className="min-w-0">
                          <p className="font-sans text-[15px] font-semibold leading-snug text-western-green-deep">
                            Prazo de entrega
                          </p>
                          <p className="text-meta mt-0.5">
                            Aparece junto com o frete, antes de você pagar.
                          </p>
                        </div>
                      </li>
                    </ul>
                  </div>

                  {/* Pedido mínimo — progresso, nunca bloqueio */}
                  {minApplies && (
                    <div className="mt-5">
                      <div className="h-2 rounded-full bg-western-border-soft overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-[width] duration-300 ease-out ${
                            belowMin ? "bg-status-warning" : "bg-status-success"
                          }`}
                          style={{ width: `${minPct}%` }}
                        />
                      </div>
                      <p
                        className={`font-sans text-[14px] font-semibold mt-2 ${
                          belowMin ? "text-status-warning" : "text-status-success"
                        }`}
                      >
                        {belowMin
                          ? `Faltam ${formatBRL(
                              minOrder - subtotal,
                              currency,
                            )} para o pedido mínimo de ${BUSINESS.pedidoMinimoLabel}`
                          : `Pedido mínimo de ${BUSINESS.pedidoMinimoLabel} atingido`}
                      </p>
                    </div>
                  )}

                  {boxOnly && (
                    <p className="mt-5 rounded-lg border border-western-border-soft bg-western-ivory px-3.5 py-3 font-sans text-[15px] leading-normal text-western-stone-warm">
                      A Western Box é vendida sem cadastro e sem pedido mínimo.
                    </p>
                  )}

                  {/* CTA primário — VERDE, full-width, 52px+ */}
                  <div className="mt-6 space-y-3">
                    {showValues ? (
                      <button
                        type="button"
                        onClick={handleCheckout}
                        disabled={isLoading || checkoutLoading}
                        className="group w-full inline-flex items-center justify-center gap-2 min-h-control px-7 rounded-lg bg-western-cta text-western-cream hover:bg-western-green-deep font-sans text-[15px] font-semibold transition-[background-color,color,transform] duration-150 ease-out active:scale-[0.97] motion-reduce:active:scale-100 disabled:opacity-45 disabled:cursor-not-allowed"
                      >
                        {isLoading || checkoutLoading ? (
                          <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
                        ) : (
                          <>
                            {ctaLabel}
                            <ArrowRight
                              className="h-5 w-5 transition-transform motion-safe:group-hover:translate-x-0.5"
                              aria-hidden="true"
                            />
                          </>
                        )}
                      </button>
                    ) : (
                      <Link
                        to={ctaTo}
                        className="group w-full inline-flex items-center justify-center gap-2 min-h-control px-7 rounded-lg bg-western-cta text-western-cream hover:bg-western-green-deep font-sans text-[15px] font-semibold transition-[background-color,color,transform] duration-150 ease-out active:scale-[0.97] motion-reduce:active:scale-100"
                      >
                        {ctaLabel}
                        <ArrowRight
                          className="h-5 w-5 transition-transform motion-safe:group-hover:translate-x-0.5"
                          aria-hidden="true"
                        />
                      </Link>
                    )}

                    {/* Formas de pagamento — reassurance no ponto de decisão */}
                    {showValues && (
                      <div className="flex items-center justify-center gap-2.5 pt-1 font-sans text-[14px] font-semibold text-western-stone-warm">
                        <span>Pix</span>
                        <span aria-hidden="true" className="text-western-border-strong">·</span>
                        <span>Boleto</span>
                        <span aria-hidden="true" className="text-western-border-strong">·</span>
                        <span>Cartão até 12×</span>
                      </div>
                    )}

                    {/* Mesma porta, outra chave — rebaixada a link de texto. */}
                    {!showValues && !session && (
                      <Link
                        to="/parceiro/login"
                        className="tap-target w-full inline-flex items-center justify-center font-sans text-[15px] font-semibold text-western-green-deep hover:text-western-cta underline underline-offset-4 decoration-western-border-strong transition-colors"
                      >
                        Já sou parceiro · entrar
                      </Link>
                    )}

                    <button
                      type="button"
                      onClick={() => setQuoteOpen(true)}
                      className="w-full inline-flex items-center justify-center gap-2 min-h-control px-7 rounded-lg border border-western-border-strong text-western-green-deep hover:border-western-green-deep hover:bg-western-paper font-sans text-[15px] font-semibold transition-colors"
                    >
                      <Download className="h-5 w-5" aria-hidden="true" />
                      Baixar orçamento (PDF)
                    </button>
                  </div>

                  <p className="text-meta mt-4 leading-normal">
                    Produção em {BUSINESS.prazoProducaoLabel}.
                  </p>
                </div>
              </Reveal>

              {/* Selos DEPOIS do resumo — no mobile eles vinham antes do CTA. */}
              <div className="mt-6">
                <TrustRow />
              </div>
            </aside>
          </div>

          {/* Saídas — por último, sempre. Dois links de SAÍDA nunca podem aparecer
           * antes da ação de AVANÇO (era a ordem do mobile). */}
          <div className="mt-10 lg:mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-western-border-soft pt-6">
            <Link
              to="/produtos"
              className="tap-target inline-flex items-center gap-2 font-sans text-[15px] font-semibold text-western-green-deep hover:text-western-cta transition-colors"
            >
              <ArrowLeft className="h-5 w-5" aria-hidden="true" />
              Continuar comprando
            </Link>
            <a
              href={WHATS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="tap-target inline-flex items-center gap-2 font-sans text-[15px] font-semibold text-western-green-deep hover:text-western-cta transition-colors"
            >
              <MessageCircle className="h-5 w-5 text-western-bronze" aria-hidden="true" />
              Dúvidas? Falar com o ateliê
            </a>
          </div>
        </div>
      </main>

      {/* Barra fixa no mobile — o CTA nunca sai da tela */}
      <div
        ref={mobileBarRef}
        className="lg:hidden fixed bottom-0 inset-x-0 z-40 surface-paper border-t border-western-border-soft shadow-[0_-12px_32px_-24px_rgba(30,26,22,0.35)] px-5 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]"
      >
        <div className="flex items-baseline justify-between gap-3 mb-2">
          <span className="font-sans text-[14px] font-semibold text-western-stone-warm">
            {showValues
              ? `Subtotal · ${totalQty} ${totalQty === 1 ? "peça" : "peças"}`
              : `${totalQty} ${totalQty === 1 ? "peça" : "peças"} no carrinho`}
          </span>
          {showValues ? (
            <span className="font-sans text-[18px] font-bold tabular-nums leading-none text-western-green-deep">
              {formatBRL(subtotal, currency)}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 font-sans text-[14px] font-semibold text-western-bronze">
              <Lock className="h-4 w-4" aria-hidden="true" /> Parceiro
            </span>
          )}
        </div>
        {showValues ? (
          <button
            type="button"
            onClick={handleCheckout}
            disabled={isLoading || checkoutLoading}
            className="w-full inline-flex items-center justify-center gap-2 min-h-control px-7 rounded-lg bg-western-cta text-western-cream hover:bg-western-green-deep font-sans text-[15px] font-semibold transition-[background-color,color,transform] duration-150 ease-out active:scale-[0.97] motion-reduce:active:scale-100 disabled:opacity-45 disabled:cursor-not-allowed"
          >
            {isLoading || checkoutLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
            ) : (
              <>
                {ctaLabel}
                <ArrowRight className="h-5 w-5" aria-hidden="true" />
              </>
            )}
          </button>
        ) : (
          <Link
            to={ctaTo}
            className="w-full inline-flex items-center justify-center gap-2 min-h-control px-7 rounded-lg bg-western-cta text-western-cream hover:bg-western-green-deep font-sans text-[15px] font-semibold transition-[background-color,color,transform] duration-150 ease-out active:scale-[0.97] motion-reduce:active:scale-100"
          >
            {ctaLabel}
            <ArrowRight className="h-5 w-5" aria-hidden="true" />
          </Link>
        )}
      </div>

      <QuoteRequestModal open={quoteOpen} onOpenChange={setQuoteOpen} />
    </>
  );
}
