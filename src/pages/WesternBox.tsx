import { useState } from "react";
import { Check, ShieldCheck, Package, Truck, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import Seo from "@/components/seo/Seo";
import { submitCheckoutHandoff } from "@/lib/woo-checkout";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

import hero from "@/assets/western-box/hero.webp.asset.json";
import boxFechada from "@/assets/western-box/box-fechada.webp.asset.json";
import boxAberta from "@/assets/western-box/box-aberta.webp.asset.json";
import lifestyle from "@/assets/western-box/lifestyle.webp.asset.json";
import catalogo from "@/assets/western-box/catalogo.webp.asset.json";
import texQuartzo from "@/assets/western-box/tex-quartzo.webp.asset.json";
import texArenito from "@/assets/western-box/tex-arenito.webp.asset.json";
import texMoledo from "@/assets/western-box/tex-moledo.webp.asset.json";
import texGranito from "@/assets/western-box/tex-granito.webp.asset.json";
import pb3Quartzo from "@/assets/western-box/pb3-quartzo.webp.asset.json";
import pb3Arenito from "@/assets/western-box/pb3-arenito.webp.asset.json";
import pb3Moledo from "@/assets/western-box/pb3-moledo.webp.asset.json";
import pb3Granito from "@/assets/western-box/pb3-granito.webp.asset.json";

// =============================================================================
// CONFIGURAÇÃO DO PRODUTO NO WOOCOMMERCE
// -----------------------------------------------------------------------------
// O produto Western Box AINDA NÃO existe no Woo. Quando for criado, basta
// preencher o WOO_PRODUCT_ID abaixo com o product_id retornado pelo Woo e o
// botão "Comprar" passa a disparar o hand-off de checkout normalmente.
// Enquanto estiver `null`, o botão fica desabilitado com label "Em breve".
// =============================================================================
const WESTERN_BOX_WOO_PRODUCT_ID: number | null = null;
const PRICE_LABEL = "R$ 149,90";

const ACABAMENTOS = [
  {
    id: "quartzo",
    nome: "Quartzo",
    descricao: "Elegância contemporânea, textura refinada e visual sofisticado.",
    texture: texQuartzo.url,
    pb3: pb3Quartzo.url,
  },
  {
    id: "arenito",
    nome: "Arenito",
    descricao: "Tons naturais e acolhedores, perfeitos para projetos integrados à natureza.",
    texture: texArenito.url,
    pb3: pb3Arenito.url,
  },
  {
    id: "moledo",
    nome: "Moledo",
    descricao: "Textura marcante, personalidade e aspecto orgânico.",
    texture: texMoledo.url,
    pb3: pb3Moledo.url,
  },
  {
    id: "granito",
    nome: "Granito",
    descricao: "Versatilidade, equilíbrio e um acabamento atemporal.",
    texture: texGranito.url,
    pb3: pb3Granito.url,
  },
] as const;

const INCLUI = [
  "Sample Quartzo",
  "Sample Arenito",
  "Sample Moledo",
  "Sample Granito",
  "Catálogo oficial Western Pools",
  "Embalagem premium exclusiva",
];

const FERRAMENTA = [
  "Comparar todos os acabamentos lado a lado",
  "Avaliar textura, relevo e tonalidade reais",
  "Visualizar os materiais sob a iluminação do ambiente onde serão instalados",
  "Apresentar opções aos seus clientes com muito mais segurança",
  "Definir o acabamento ideal antes de investir no projeto",
];

const PARA_QUEM = [
  "Arquitetos",
  "Paisagistas",
  "Designers de exteriores",
  "Piscineiros",
  "Revendedores",
  "Clientes que desejam conhecer nossos acabamentos antes da compra",
];

function BuyButton({ size = "lg", className }: { size?: "lg" | "default"; className?: string }) {
  const disabled = WESTERN_BOX_WOO_PRODUCT_ID === null;

  const handleClick = () => {
    if (disabled || WESTERN_BOX_WOO_PRODUCT_ID === null) return;
    submitCheckoutHandoff([
      {
        // CartItem mínimo para o hand-off — apenas os campos Woo são necessários.
        id: `wbox-${WESTERN_BOX_WOO_PRODUCT_ID}`,
        title: "Western Box",
        handle: "western-box",
        variantId: String(WESTERN_BOX_WOO_PRODUCT_ID),
        price: "149.90",
        quantity: 1,
        wooParentProductId: WESTERN_BOX_WOO_PRODUCT_ID,
        wooVariationId: null,
        wooAttributes: [],
        wooKind: "simple",
      } as never,
    ]);
    toast.success("Redirecionando para o checkout…");
  };

  return (
    <Button
      onClick={handleClick}
      disabled={disabled}
      size={size}
      className={cn(
        "bg-western-gold text-western-green-deep hover:bg-western-gold-soft font-medium tracking-wide uppercase",
        size === "lg" && "h-14 px-10 text-[13px]",
        className,
      )}
    >
      {disabled ? "Em breve" : "Quero minha Western Box"}
    </Button>
  );
}

export default function WesternBox() {
  const [acabamentoAtivo, setAcabamentoAtivo] = useState<(typeof ACABAMENTOS)[number]["id"]>("quartzo");
  const ativo = ACABAMENTOS.find((a) => a.id === acabamentoAtivo)!;

  return (
    <>
      <Seo
        title="Western Box — Kit oficial de amostras Western Pools"
        description="Os quatro acabamentos Western em mãos, com catálogo oficial e cashback de 100%. Veja, toque, compare e decida antes do projeto."
        path="/western-box"
        ogType="product"
        image={hero.url}
      />

      {/* ===================== HERO ===================== */}
      <section className="relative bg-western-green-deep text-western-cream overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={hero.url}
            alt="Western Box à beira da piscina com os quatro samples e o catálogo Western Pools"
            className="h-full w-full object-cover opacity-90"
            loading="eager"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-western-green-deep via-western-green-deep/55 to-western-green-deep/15" />
          <div className="absolute inset-0 bg-gradient-to-r from-western-green-deep/70 via-transparent to-transparent" />
        </div>

        <div className="container-western relative z-10 min-h-[88vh] flex items-end pb-20 md:pb-28 pt-28">
          <div className="max-w-2xl">
            <p className="text-eyebrow text-western-gold-soft mb-6">Western Box</p>
            <h1 className="font-display text-[clamp(2.6rem,6vw,5.25rem)] leading-[1.02] tracking-tight text-western-cream">
              O primeiro passo para escolher com confiança.
            </h1>
            <p className="mt-6 max-w-xl text-western-cream/85 text-lg leading-relaxed">
              A coleção física dos quatro acabamentos Western Pools — entregue na sua mesa, com
              catálogo oficial da marca.
            </p>

            <div className="mt-10 flex flex-wrap items-end gap-x-6 gap-y-3">
              <span className="font-display text-4xl md:text-5xl text-western-cream">{PRICE_LABEL}</span>
              <span className="inline-flex items-center gap-2 rounded-full border border-western-gold/40 bg-western-green-mid/40 px-3 py-1.5 text-[11px] uppercase tracking-[0.16em] text-western-gold-soft">
                <Sparkles className="h-3 w-3" /> 100% de volta como crédito na 1ª compra
              </span>
            </div>

            <div className="mt-10">
              <BuyButton />
            </div>
          </div>
        </div>
      </section>

      {/* ===================== INTRO ===================== */}
      <section className="bg-western-paper py-24 md:py-32">
        <div className="container-western grid md:grid-cols-12 gap-12 items-start">
          <div className="md:col-span-7 md:col-start-2 space-y-7">
            <p className="text-eyebrow text-western-gold">Por que existe</p>
            <p className="font-display text-2xl md:text-3xl leading-snug text-western-green-deep">
              Conhecer um acabamento apenas pela tela nunca conta a história completa.
            </p>
            <p className="font-sans text-base md:text-lg text-western-stone-warm leading-relaxed max-w-2xl">
              A Western Box leva até você uma seleção exclusiva com os quatro acabamentos da
              Western Pools, acompanhados do catálogo oficial da marca, para que você possa analisar
              texturas, cores e detalhes exatamente como eles serão percebidos no seu projeto.
            </p>
          </div>
          <div className="md:col-span-3 md:pt-10">
            <p className="font-display text-3xl md:text-[2.5rem] leading-[1.05] text-western-gold">
              Veja.<br />Toque.<br />Compare.<br />Decida.
            </p>
          </div>
        </div>
      </section>

      {/* ===================== O QUE ACOMPANHA ===================== */}
      <section className="bg-western-ivory py-24 md:py-32">
        <div className="container-western grid md:grid-cols-2 gap-12 md:gap-20 items-center">
          <div className="relative">
            <div className="absolute -inset-6 bg-western-cream/40 rounded-sm -z-10" />
            <img
              src={boxAberta.url}
              alt="Western Box aberta exibindo os quatro samples e o catálogo"
              className="w-full h-auto rounded-sm shadow-2xl"
              loading="lazy"
            />
          </div>
          <div>
            <p className="text-eyebrow text-western-gold mb-5">O que acompanha</p>
            <h2 className="font-display text-4xl md:text-5xl text-western-green-deep leading-tight">
              Tudo o que você precisa para especificar com segurança.
            </h2>
            <ul className="mt-10 space-y-4">
              {INCLUI.map((item) => (
                <li key={item} className="flex items-start gap-3 text-western-stone-dark">
                  <span className="mt-1 flex h-5 w-5 items-center justify-center rounded-full bg-western-gold/20">
                    <Check className="h-3 w-3 text-western-gold" />
                  </span>
                  <span className="font-sans text-base md:text-lg">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ===================== OS 4 ACABAMENTOS ===================== */}
      <section className="bg-western-green-deep text-western-cream py-24 md:py-32">
        <div className="container-western">
          <div className="max-w-2xl mb-14">
            <p className="text-eyebrow text-western-gold-soft mb-5">Os quatro acabamentos</p>
            <h2 className="font-display text-4xl md:text-5xl leading-tight">
              A assinatura Western, em quatro temperamentos.
            </h2>
            <p className="mt-5 text-western-cream/75 max-w-xl">
              Selecione um acabamento e veja como ele aparece aplicado em uma peça real.
            </p>
          </div>

          <div className="grid md:grid-cols-12 gap-8 md:gap-10 items-start">
            {/* Cards */}
            <div className="md:col-span-7 grid grid-cols-2 gap-4 md:gap-5">
              {ACABAMENTOS.map((a) => {
                const active = a.id === acabamentoAtivo;
                return (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() => setAcabamentoAtivo(a.id)}
                    onMouseEnter={() => setAcabamentoAtivo(a.id)}
                    className={cn(
                      "group text-left rounded-sm overflow-hidden border transition-all duration-300 bg-western-green-mid/40",
                      active
                        ? "border-western-gold shadow-[0_0_0_1px_hsl(var(--western-gold)/0.6)]"
                        : "border-western-cream/10 hover:border-western-gold/50",
                    )}
                  >
                    <div className="aspect-square overflow-hidden">
                      <img
                        src={a.texture}
                        alt={`Textura ${a.nome}`}
                        className={cn(
                          "h-full w-full object-cover transition-transform duration-700",
                          active ? "scale-105" : "group-hover:scale-105",
                        )}
                        loading="lazy"
                      />
                    </div>
                    <div className="p-4 md:p-5">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-display text-xl md:text-2xl text-western-cream">{a.nome}</h3>
                        <span
                          className={cn(
                            "h-1.5 w-1.5 rounded-full transition-colors",
                            active ? "bg-western-gold" : "bg-western-cream/20",
                          )}
                        />
                      </div>
                      <p className="text-[13px] md:text-sm text-western-cream/70 leading-relaxed">
                        {a.descricao}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Preview interativo PB3 */}
            <div className="md:col-span-5 md:sticky md:top-24">
              <div className="relative aspect-[4/5] overflow-hidden rounded-sm bg-western-green-mid/40 border border-western-cream/10">
                {ACABAMENTOS.map((a) => (
                  <img
                    key={a.id}
                    src={a.pb3}
                    alt={`Peça PB3 com acabamento ${a.nome}`}
                    className={cn(
                      "absolute inset-0 h-full w-full object-cover transition-opacity duration-500",
                      a.id === acabamentoAtivo ? "opacity-100" : "opacity-0",
                    )}
                    loading="lazy"
                  />
                ))}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-western-green-deep/80 to-transparent p-5">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-western-gold-soft">PB3</p>
                  <p className="font-display text-2xl text-western-cream">{ativo.nome}</p>
                </div>
              </div>
              <p className="mt-4 text-xs text-western-cream/55 text-center">
                Acabamento aplicado em peça real — passe sobre os cards
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ===================== FERRAMENTA DE ESPECIFICAÇÃO ===================== */}
      <section className="bg-western-paper py-24 md:py-32">
        <div className="container-western grid md:grid-cols-12 gap-12">
          <div className="md:col-span-5">
            <p className="text-eyebrow text-western-gold mb-5">Mais do que amostras</p>
            <h2 className="font-display text-4xl md:text-5xl leading-tight text-western-green-deep">
              Uma ferramenta de especificação.
            </h2>
          </div>
          <ul className="md:col-span-7 space-y-5 md:pt-3">
            {FERRAMENTA.map((item, i) => (
              <li key={item} className="flex gap-5 border-b border-western-stone-warm/15 pb-5 last:border-0">
                <span className="font-display text-western-gold text-2xl leading-none w-8 shrink-0">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="font-sans text-base md:text-lg text-western-stone-dark leading-snug">
                  {item}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ===================== CATÁLOGO ===================== */}
      <section className="bg-western-ivory py-24 md:py-32">
        <div className="container-western grid md:grid-cols-2 gap-12 md:gap-16 items-center">
          <div className="md:order-2">
            <img
              src={catalogo.url}
              alt="Catálogo oficial Western Pools"
              className="w-full h-auto rounded-sm shadow-xl"
              loading="lazy"
            />
          </div>
          <div className="md:order-1">
            <p className="text-eyebrow text-western-gold mb-5">Catálogo Western Pools</p>
            <h2 className="font-display text-4xl md:text-5xl leading-tight text-western-green-deep">
              Inspiração e técnica, em um único material.
            </h2>
            <p className="mt-7 font-sans text-base md:text-lg text-western-stone-warm leading-relaxed">
              Além dos samples físicos, você recebe nosso catálogo oficial com inspirações,
              aplicações, informações técnicas e toda a linha de produtos Western Pools. Um material
              pensado para acompanhar você durante toda a fase de especificação do projeto.
            </p>
          </div>
        </div>
      </section>

      {/* ===================== CASHBACK ===================== */}
      <section className="relative py-28 md:py-36 overflow-hidden bg-western-green-deep text-western-cream">
        <img
          src={lifestyle.url}
          alt="Western Box e catálogo dispostos sobre a mesa"
          className="absolute inset-0 h-full w-full object-cover opacity-30"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-western-green-deep via-western-green-deep/85 to-western-green-deep/40" />
        <div className="container-western relative z-10 max-w-3xl">
          <p className="text-eyebrow text-western-gold-soft mb-6">Cashback</p>
          <p className="font-display text-[clamp(3rem,8vw,6.5rem)] leading-[0.95] text-western-gold">
            100%
          </p>
          <p className="mt-4 font-display text-2xl md:text-3xl text-western-cream">
            de volta como crédito na primeira compra.
          </p>
          <p className="mt-8 max-w-2xl text-western-cream/80 text-base md:text-lg leading-relaxed">
            Ao realizar sua primeira compra de produtos Western Pools, os R$ 149,90 investidos na
            Western Box retornam integralmente como crédito. Na prática, você conhece nossos
            materiais sem perder esse investimento.
          </p>
        </div>
      </section>

      {/* ===================== PARA QUEM É ===================== */}
      <section className="bg-western-paper py-24">
        <div className="container-western">
          <p className="text-eyebrow text-western-gold mb-6 text-center">Para quem é</p>
          <h2 className="font-display text-3xl md:text-4xl text-western-green-deep text-center max-w-2xl mx-auto leading-tight">
            Feita para quem decide com critério.
          </h2>
          <ul className="mt-12 flex flex-wrap justify-center gap-3 md:gap-4 max-w-3xl mx-auto">
            {PARA_QUEM.map((p) => (
              <li
                key={p}
                className="rounded-full border border-western-stone-warm/25 bg-white px-5 py-2.5 text-sm md:text-base text-western-stone-dark"
              >
                {p}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ===================== ENVIO + SPECS ===================== */}
      <section className="bg-western-ivory py-24 border-t border-western-stone-warm/10">
        <div className="container-western grid md:grid-cols-2 gap-12 md:gap-20 items-center">
          <div>
            <img
              src={boxFechada.url}
              alt="Western Box fechada com selo da marca"
              className="w-full h-auto rounded-sm shadow-xl"
              loading="lazy"
            />
          </div>
          <div>
            <p className="text-eyebrow text-western-gold mb-5">Envio</p>
            <h2 className="font-display text-3xl md:text-4xl text-western-green-deep leading-tight">
              Sua Western Box é preparada cuidadosamente e enviada em até 5 a 7 dias úteis após a
              confirmação do pedido.
            </h2>

            <dl className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-6 border-t border-western-stone-warm/15 pt-8">
              <div>
                <dt className="flex items-center gap-2 text-xs uppercase tracking-[0.14em] text-western-stone-warm">
                  <Package className="h-3.5 w-3.5" /> Conteúdo
                </dt>
                <dd className="mt-2 font-display text-lg text-western-green-deep leading-snug">
                  4 samples físicos + Catálogo oficial
                </dd>
              </div>
              <div>
                <dt className="flex items-center gap-2 text-xs uppercase tracking-[0.14em] text-western-stone-warm">
                  <Truck className="h-3.5 w-3.5" /> Valor
                </dt>
                <dd className="mt-2 font-display text-lg text-western-green-deep">{PRICE_LABEL}</dd>
              </div>
              <div>
                <dt className="flex items-center gap-2 text-xs uppercase tracking-[0.14em] text-western-stone-warm">
                  <ShieldCheck className="h-3.5 w-3.5" /> Cashback
                </dt>
                <dd className="mt-2 font-display text-lg text-western-green-deep">100%</dd>
              </div>
            </dl>
          </div>
        </div>
      </section>

      {/* ===================== CTA FINAL ===================== */}
      <section className="bg-western-green-deep text-western-cream py-28 md:py-36 text-center">
        <div className="container-western max-w-3xl">
          <p className="text-eyebrow text-western-gold-soft mb-8">Pronto para começar</p>
          <p className="font-display text-3xl md:text-5xl leading-tight text-western-cream">
            Receba a Western Box, descubra nossos acabamentos e transforme os R$ 149,90 em crédito
            no seu primeiro pedido.
          </p>
          <div className="mt-12 flex flex-col items-center gap-4">
            <BuyButton />
            <span className="text-xs uppercase tracking-[0.18em] text-western-cream/55">
              {PRICE_LABEL} · Cashback 100%
            </span>
          </div>
        </div>
      </section>
    </>
  );
}
