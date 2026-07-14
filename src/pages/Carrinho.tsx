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

import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Download,
  FileText,
  Loader2,
  Lock,
  MessageCircle,
  Minus,
  Plus,
  ShieldCheck,
  ShoppingBag,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

import Seo from "@/components/seo/Seo";
import Reveal from "@/components/shared/Reveal";
import QuoteRequestModal from "@/components/cart/QuoteRequestModal";
import { useCartStore, type CartItem } from "@/stores/cartStore";
import { useAuth } from "@/hooks/useAuth";
import { usePartnerPricing } from "@/hooks/usePartnerPricing";
import { formatBRL, cdnImg } from "@/lib/catalog/client";
import { supabase } from "@/integrations/supabase/client";
import { registerPedidoNovoLead } from "@/lib/leads/pedidoNovo";
import { BUSINESS } from "@/config/business";
import atelieFoto from "@/assets/ricardo-botelho.webp";

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

  const currency = items[0]?.price.currencyCode ?? "BRL";

  const { totalQty, subtotal, boxOnly } = useMemo(() => {
    const qty = items.reduce((s, i) => s + i.quantity, 0);
    const gross = items.reduce((s, i) => s + parseFloat(i.price.amount) * i.quantity, 0);
    return {
      totalQty: qty,
      subtotal: gross * (1 - discountPct / 100),
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
    parseFloat(item.price.amount) * item.quantity * (1 - discountPct / 100);
  const unitPrice = (item: CartItem) =>
    parseFloat(item.price.amount) * (1 - discountPct / 100);

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
            result.skipped === 1 ? "linha ficou" : "linhas ficaram"
          } de fora. Revise sua composição ou fale no WhatsApp.`,
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
          title="Seu orçamento · Western"
          description="Revise as peças da sua composição e finalize seu pedido com a Western."
          path="/carrinho"
        />
        <main className="surface-ivory min-h-[70vh] py-16 md:py-24">
          <div className="container-western">
            <div className="mx-auto max-w-[520px] text-center">
              <ShoppingBag
                className="mx-auto h-11 w-11 text-western-border-strong"
                aria-hidden="true"
              />
              <h1 className="display-lg text-western-green-deep mt-5">
                Seu orçamento está vazio
              </h1>
              <p className="text-body mt-3">
                Explore o catálogo ou comece pela Western Box — o kit de amostras aberto a
                todos, sem cadastro.
              </p>
              <div className="mt-8 grid gap-3">
                <Link
                  to="/produtos"
                  className="inline-flex w-full items-center justify-center gap-2 min-h-[52px] px-7 rounded-[10px] bg-western-cta text-western-cream hover:bg-western-green-deep font-sans text-[16px] font-semibold transition-colors"
                >
                  Ver catálogo
                  <ArrowRight className="h-5 w-5" />
                </Link>
                <Link
                  to="/western-box"
                  className="inline-flex w-full items-center justify-center gap-2 min-h-[52px] px-7 rounded-[10px] border border-western-border-strong text-western-green-deep hover:border-western-green-deep hover:bg-western-paper font-sans text-[16px] font-semibold transition-colors"
                >
                  Conhecer a Western Box
                </Link>
              </div>
              <a
                href={WHATS_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="tap-target inline-flex items-center justify-center gap-2 mt-6 font-sans text-[16px] font-semibold text-western-green-deep hover:text-western-cta transition-colors"
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
    ? "Finalizar compra"
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
        Empresa brasileira · NF-e em todo pedido · CNPJ {BUSINESS.cnpj}
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
        title="Seu orçamento · Western"
        description="Revise as peças da sua composição, confira o subtotal e finalize seu pedido com a Western."
        path="/carrinho"
      />

      <main className="surface-ivory pb-[168px] lg:pb-24">
        <div className="container-western pt-8 md:pt-12">
          {/* Cabeçalho */}
          <Link
            to="/produtos"
            className="tap-target inline-flex items-center gap-2 -ml-1 font-sans text-[16px] font-semibold text-western-green-deep hover:text-western-cta transition-colors"
          >
            <ArrowLeft className="h-5 w-5" aria-hidden="true" />
            Continuar comprando
          </Link>

          <header className="mt-2">
            <p className="text-eyebrow">Composição atual</p>
            <h1 className="display-xl text-western-green-deep mt-2">Seu orçamento</h1>
            <p className="text-body mt-2">
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
                <div className="mb-6 rounded-[10px] border border-western-border-soft bg-western-paper p-5 md:p-6">
                  <div className="flex items-start gap-3">
                    <Lock
                      className="h-5 w-5 text-western-bronze flex-shrink-0 mt-0.5"
                      aria-hidden="true"
                    />
                    <div className="min-w-0">
                      <p className="font-sans text-[17px] font-semibold leading-snug text-western-green-deep">
                        {session ? "Cadastro em análise" : "Preços de parceiro"}
                      </p>
                      <p className="text-body mt-1.5">
                        {session
                          ? "Assim que seu cadastro for aprovado, os valores aparecem aqui — sua composição fica guardada."
                          : `Vendemos no atacado para profissionais com CNPJ, com pedido mínimo de ${BUSINESS.pedidoMinimoLabel} por composição. Os valores aparecem aqui assim que seu cadastro for aprovado — sua composição fica guardada.`}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Linhas do orçamento */}
              <ul className="rounded-[16px] border border-western-border-soft bg-white px-5 md:px-6">
                {items.map((item, idx) => (
                  <li
                    key={item.variantId}
                    className={`flex gap-4 md:gap-5 py-6 ${
                      idx === items.length - 1 ? "" : "border-b border-western-border-soft"
                    }`}
                  >
                    <Link
                      to={`/produtos/${item.productHandle}`}
                      className="w-[92px] h-[92px] md:w-[110px] md:h-[110px] flex-shrink-0 overflow-hidden rounded-[10px] bg-western-paper border border-western-border-soft"
                    >
                      {item.productImage && (
                        <img
                          src={cdnImg(item.productImage, 240)}
                          alt={item.productTitle}
                          loading="lazy"
                          className="w-full h-full object-contain p-2"
                        />
                      )}
                    </Link>

                    <div className="flex-1 min-w-0">
                      {/* No mobile a linha EMPILHA (nome em cima, preço embaixo). Lado a
                       * lado, o chip do gate era flex-shrink-0 e espremia a coluna do
                       * nome até ~2ch — "Pedra Média 5" quebrava uma letra por linha. */}
                      <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between md:gap-5">
                        <div className="min-w-0">
                          <h2 className="font-sans text-[20px] font-semibold leading-snug text-western-green-deep">
                            <Link
                              to={`/produtos/${item.productHandle}`}
                              className="hover:text-western-cta transition-colors"
                            >
                              {item.productTitle}
                            </Link>
                          </h2>
                          {item.selectedOptions.length > 0 && (
                            <p className="font-sans text-[15px] text-western-stone-warm mt-1">
                              {item.selectedOptions.map((o) => o.value).join(" · ")}
                            </p>
                          )}
                          {item.sku && (
                            <p className="text-meta mt-0.5 break-words">Ref. {item.sku}</p>
                          )}
                        </div>

                        <div className="md:flex-shrink-0 md:text-right">
                          {showValues ? (
                            <>
                              <p className="font-sans text-[20px] font-bold tabular-nums leading-tight text-western-green-deep whitespace-nowrap">
                                {formatBRL(lineTotal(item), item.price.currencyCode)}
                              </p>
                              {item.quantity > 1 && (
                                <p className="font-sans text-[14px] text-western-stone-warm mt-1 whitespace-nowrap">
                                  {formatBRL(unitPrice(item), item.price.currencyCode)} / peça
                                </p>
                              )}
                            </>
                          ) : (
                            /* O gate aqui é INFORMAÇÃO, não porta: a única porta da
                             * página é o CTA do resumo. Antes eram 3 chips-link
                             * "Ver preço de parceiro" competindo com ele. */
                            <p className="inline-flex items-center gap-1.5 font-sans text-[14px] font-semibold text-western-bronze whitespace-nowrap">
                              <Lock className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
                              Preço de parceiro
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Quantidade + remover */}
                      <div className="flex items-center gap-3 md:gap-4 mt-4 flex-wrap">
                        <div className="inline-flex items-center rounded-[10px] border border-western-border-strong bg-white overflow-hidden">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                            className="h-[52px] w-[52px] flex items-center justify-center text-western-green-deep hover:bg-western-paper transition-colors"
                            aria-label={`Diminuir quantidade de ${item.productTitle}`}
                          >
                            <Minus className="h-4 w-4" aria-hidden="true" />
                          </button>
                          <span className="px-2 font-sans text-[16px] font-semibold min-w-[2.5ch] text-center tabular-nums text-western-green-deep">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                            className="h-[52px] w-[52px] flex items-center justify-center text-western-green-deep hover:bg-western-paper transition-colors"
                            aria-label={`Aumentar quantidade de ${item.productTitle}`}
                          >
                            <Plus className="h-4 w-4" aria-hidden="true" />
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => removeItem(item.variantId)}
                          className="tap-target inline-flex items-center gap-2 px-2 font-sans text-[15px] font-semibold text-[#B3372E] hover:underline"
                          aria-label={`Remover ${item.productTitle} do orçamento`}
                        >
                          <Trash2 className="h-4 w-4" aria-hidden="true" /> Remover
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>

            </div>

            {/* ============ COLUNA DIREITA — resumo ============ */}
            <aside className="lg:sticky lg:top-28">
              <Reveal variant="fade" duration={500}>
                <div className="rounded-[16px] border border-western-border-soft surface-paper p-6">
                  <p className="text-eyebrow">Resumo</p>

                  <div className="mt-4 flex items-baseline justify-between gap-3">
                    <span className="font-sans text-[16px] font-semibold text-western-green-deep">
                      Subtotal
                      <span className="font-normal text-western-stone-warm">
                        {" "}
                        · {totalQty} {totalQty === 1 ? "peça" : "peças"}
                      </span>
                    </span>
                    {showValues ? (
                      <span className="font-sans text-[26px] font-bold tabular-nums leading-none text-western-green-deep">
                        {formatBRL(subtotal, currency)}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 font-sans text-[16px] font-semibold text-western-bronze">
                        <Lock className="h-4 w-4" aria-hidden="true" /> Parceiro
                      </span>
                    )}
                  </div>

                  {/* Pedido mínimo — o visitante precisa saber da barreira ANTES de
                   * se cadastrar, não depois. Para o parceiro aprovado, a barra de
                   * progresso abaixo já diz o mesmo (e diz quanto falta). */}
                  {!showValues && !boxOnly && (
                    <p className="mt-3 font-sans text-[17px] leading-snug text-western-green-deep">
                      Pedido mínimo de{" "}
                      <span className="font-semibold">{BUSINESS.pedidoMinimoLabel}</span> por
                      composição.
                    </p>
                  )}

                  <p className="text-meta mt-2">
                    Frete e prazo são calculados por CEP na próxima etapa.
                  </p>

                  {/* Pedido mínimo — progresso, nunca bloqueio */}
                  {minApplies && (
                    <div className="mt-5">
                      <div className="h-2 rounded-full bg-western-border-soft overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-[width] duration-300 ease-out ${
                            belowMin ? "bg-[#9C6812]" : "bg-[#2E7D4F]"
                          }`}
                          style={{ width: `${minPct}%` }}
                        />
                      </div>
                      <p
                        className={`font-sans text-[14px] font-semibold mt-2 ${
                          belowMin ? "text-[#9C6812]" : "text-[#2E7D4F]"
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
                    <p className="mt-5 rounded-[10px] border border-western-border-soft bg-western-ivory px-3.5 py-3 font-sans text-[15px] leading-normal text-western-stone-warm">
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
                        className="group w-full inline-flex items-center justify-center gap-2 min-h-[52px] px-7 rounded-[10px] bg-western-cta text-western-cream hover:bg-western-green-deep font-sans text-[16px] font-semibold transition-colors disabled:opacity-45 disabled:cursor-not-allowed"
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
                        className="group w-full inline-flex items-center justify-center gap-2 min-h-[52px] px-7 rounded-[10px] bg-western-cta text-western-cream hover:bg-western-green-deep font-sans text-[16px] font-semibold transition-colors"
                      >
                        {ctaLabel}
                        <ArrowRight
                          className="h-5 w-5 transition-transform motion-safe:group-hover:translate-x-0.5"
                          aria-hidden="true"
                        />
                      </Link>
                    )}

                    {/* Mesma porta, outra chave — rebaixada a link de texto. */}
                    {!showValues && !session && (
                      <Link
                        to="/parceiro/login"
                        className="tap-target w-full inline-flex items-center justify-center font-sans text-[16px] font-semibold text-western-green-deep hover:text-western-cta underline underline-offset-4 decoration-western-border-strong transition-colors"
                      >
                        Já sou parceiro · entrar
                      </Link>
                    )}

                    <button
                      type="button"
                      onClick={() => setQuoteOpen(true)}
                      className="w-full inline-flex items-center justify-center gap-2 min-h-[52px] px-7 rounded-[10px] border border-western-border-strong text-western-green-deep hover:border-western-green-deep hover:bg-western-paper font-sans text-[16px] font-semibold transition-colors"
                    >
                      <Download className="h-5 w-5" aria-hidden="true" />
                      Baixar composição (PDF)
                    </button>
                  </div>

                  <p className="text-meta mt-4 leading-normal">
                    Próximo passo em ambiente seguro: entrega → pagamento → confirmação.
                    Produção em {BUSINESS.prazoProducaoLabel}.
                  </p>
                </div>
              </Reveal>

              {/* Atendimento humano */}
              <div className="mt-4 flex items-center gap-3.5 rounded-[10px] border border-western-border-soft bg-white p-4">
                <img
                  src={atelieFoto}
                  alt="Equipe do ateliê Western"
                  loading="lazy"
                  className="h-12 w-12 rounded-full object-cover flex-shrink-0"
                />
                <div className="min-w-0">
                  <p className="font-sans text-[16px] font-semibold leading-snug text-western-green-deep">
                    Atendimento humano do ateliê
                  </p>
                  <a
                    href={WHATS_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-sans text-[15px] font-semibold text-western-green-deep hover:text-western-cta transition-colors"
                  >
                    WhatsApp {BUSINESS.whatsappLabel}
                  </a>
                </div>
              </div>

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
              className="tap-target inline-flex items-center gap-2 font-sans text-[16px] font-semibold text-western-green-deep hover:text-western-cta transition-colors"
            >
              <ArrowLeft className="h-5 w-5" aria-hidden="true" />
              Continuar comprando
            </Link>
            <a
              href={WHATS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="tap-target inline-flex items-center gap-2 font-sans text-[16px] font-semibold text-western-green-deep hover:text-western-cta transition-colors"
            >
              <MessageCircle className="h-5 w-5 text-western-bronze" aria-hidden="true" />
              Dúvidas? Falar com o ateliê
            </a>
          </div>
        </div>
      </main>

      {/* Barra fixa no mobile — o CTA nunca sai da tela */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 surface-paper border-t border-western-border-soft shadow-[0_-12px_32px_-24px_rgba(30,26,22,0.35)] px-5 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <div className="flex items-baseline justify-between gap-3 mb-2">
          <span className="font-sans text-[14px] font-semibold text-western-stone-warm">
            {showValues
              ? `Subtotal · ${totalQty} ${totalQty === 1 ? "peça" : "peças"}`
              : `${totalQty} ${totalQty === 1 ? "peça" : "peças"} no orçamento`}
          </span>
          {showValues ? (
            <span className="font-sans text-[20px] font-bold tabular-nums leading-none text-western-green-deep">
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
            className="w-full inline-flex items-center justify-center gap-2 min-h-[52px] px-7 rounded-[10px] bg-western-cta text-western-cream hover:bg-western-green-deep font-sans text-[16px] font-semibold transition-colors disabled:opacity-45 disabled:cursor-not-allowed"
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
            className="w-full inline-flex items-center justify-center gap-2 min-h-[52px] px-7 rounded-[10px] bg-western-cta text-western-cream hover:bg-western-green-deep font-sans text-[16px] font-semibold transition-colors"
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
