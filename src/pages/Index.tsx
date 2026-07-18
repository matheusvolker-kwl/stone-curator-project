import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useQuery } from "@tanstack/react-query";
import { fetchProducts } from "@/lib/datasource";
import Seo from "@/components/seo/Seo";
import ProductCard from "@/components/product/ProductCard";
import ObraCard from "@/components/shared/ObraCard";
import ArtistaSection from "@/components/home/ArtistaSection";
import SobreAWestern from "@/components/home/SobreAWestern";
import Reveal from "@/components/shared/Reveal";
import SocialProof from "@/components/shared/SocialProof";
import { SOCIAL_PROOF } from "@/data/socialProof";
import { ArrowRight, Check, X } from "lucide-react";
import { BUSINESS } from "@/config/business";
import { texturaPara } from "@/lib/acabamentoTexturas";
import { useAuth } from "@/hooks/useAuth";
import { useCartStore } from "@/stores/cartStore";
import heroHome from "@/assets/hero-home.webp";
import heroHomeMobile from "@/assets/hero-home-mobile.webp";
import iconePedraBranco from "@/assets/icone-pedra-branco.png";
import imgFonte from "@/assets/about-projetos/cascata-tropical.webp";
import imgLagoHibrido from "@/assets/conjuntos-render/conjunto-lago-hibrido-igarape-equilibrado.webp";
import imgLangPiscina from "@/assets/linguagens/piscina.webp";
import imgLangLago from "@/assets/linguagens/lago.webp";
import imgLangJardim from "@/assets/linguagens/jardim.webp";
import imgObraTato from "@/assets/obras/tato.webp";
import imgObraNeymar from "@/assets/obras/neymar.webp";
import imgObraTapirai from "@/assets/obras/tapirai.webp";
import imgObraEvandro from "@/assets/obras/evandro.webp";
import imgObraShowroom from "@/assets/obras/showroom.webp";
import imgObraUnique from "@/assets/obras/unique.webp";
import linhaCapaCascatas from "@/assets/linhas/cascatas.webp";
import linhaCapaRevestimentos from "@/assets/linhas/revestimentos.webp";
import linhaCapaAcessorios from "@/assets/linhas/acessorios.webp";
import linhaCapaPedras from "@/assets/linhas/pedras-grandes.webp";

/* DS V3 — eyebrow sobre fundo escuro/foto: mesma métrica do .text-eyebrow
 * (sans semibold 14px, tracking 0.06em), em dourado claro porque o bronze
 * não teria contraste sobre o verde profundo. */
const eyebrowDark =
  "font-sans text-[14px] font-semibold uppercase tracking-[0.06em] text-western-gold-soft";

const ACABAMENTOS = [
  { nome: "Moledo", tone: "#8A7A64" },
  { nome: "Arenito", tone: "#C4A883" },
  { nome: "Granito", tone: "#8C8C88" },
  { nome: "Quartzo", tone: "#D9D2C4" },
];

const TILES = [
  { nome: "Piscina", desc: "Cascatas e bordas para o entorno da piscina", img: imgLangPiscina },
  { nome: "Lago ornamental", desc: "Composições para lagos e espelhos d'água", img: imgLangLago },
  { nome: "Lago híbrido", desc: "Estrutura Western + pedra natural", img: imgLagoHibrido },
  { nome: "Jardim", desc: "Jardins contemplativos, com ou sem água", img: imgLangJardim },
  { nome: "Fonte & cascata", desc: "Fontes e quedas com água corrente", img: imgFonte },
];

const LINHAS_HOME = [
  { handle: "pedras-decorativas", label: "Pedras decorativas", cover: linhaCapaPedras },
  { handle: "cascatas", label: "Cascatas", cover: linhaCapaCascatas },
  { handle: "revestimentos", label: "Revestimentos", cover: linhaCapaRevestimentos },
  { handle: "acessorios", label: "Acessórios", cover: linhaCapaAcessorios },
];

const PROJETOS = [
  { img: imgObraTato, nome: "Casa de Praia · Tato (Falamansa)", tipo: "Piscina natural + lago" },
  { img: imgObraNeymar, nome: "Lago híbrido · Neymar Jr.", tipo: "Natural + Western · Genesis" },
  { img: imgObraTapirai, nome: "Piscina na serra · Tapiraí", tipo: "Borda infinita" },
  { img: imgObraEvandro, nome: "Cascata no riacho · Evandro Mesquita", tipo: "Rio de Janeiro" },
  { img: imgObraShowroom, nome: "ShowRoom Riviera", tipo: "Piscina-praia demonstração" },
  { img: imgObraUnique, nome: "Unique Garden", tipo: "Revestimento em villa" },
];

/* "Mais especificados" — a 375px a grade de 2 colunas deixava ~163px por card:
 * o nome da peça truncava ("Cascata Santa…") e o coração/código colidiam com a
 * foto. No mobile vira carrossel com peek (card ~76vw, ~285px); de sm pra cima
 * volta a ser grade. Mesmas classes no esqueleto pra não haver salto de layout. */
const featuredTrack =
  "flex gap-4 overflow-x-auto snap-x snap-mandatory scroll-px-6 scrollbar-hide -mx-6 px-6 pb-1 " +
  "sm:mx-0 sm:px-0 sm:scroll-px-0 sm:grid sm:grid-cols-2 sm:gap-6 sm:overflow-visible " +
  "md:grid-cols-3 lg:grid-cols-4";
const featuredItem = "snap-start shrink-0 w-[76vw] max-w-[300px] sm:w-auto sm:max-w-none";

export default function Index() {
  const { data: featured = [], isLoading: loadingFeatured } = useQuery({
    queryKey: ["featured-products"],
    queryFn: () => fetchProducts(8),
  });

  /* PERSONALIZAÇÃO FASE 1 (2026-07-18): logado, a home vira balcão — os CTAs
   * do hero trocam de missão (recompra > cadastro) e a faixa de credenciamento
   * some (pedir acesso a quem já tem acesso era ruído). Quem volta navega pelo
   * header; a home só precisa não ATRAPALHAR quem já é de casa. */
  const { session, isApproved, empresa } = useAuth();
  const isPartnerHome = !!session && isApproved;
  const cartCount = useCartStore((s) => s.items.reduce((n, i) => n + i.quantity, 0));

  /* Vitrine extraída para renderização condicional: parceiro aprovado vê os
   * Mais vendidos LOGO APÓS o hero (fase 2 da personalização); visitante segue
   * com a narrativa completa (tecnologia → vitrine). */
  const vitrineMaisVendidos = (
    <>
      {/* Mais vendidos (catálogo dinâmico). Ordem pedida pelo dono: best-sellers
          primeiro, depois as linhas, e só então "o que você vai construir".
          (A antiga "barra de confiança" saiu daqui: repetia 10% do peso / garantia
          / reposição / 50 modelos, que a seção "O que é a Western Store" já diz.) */}
      <section className="surface-paper section border-t border-western-border-soft" id="produtos">
        <div className="container-western">
          <Reveal variant="fade-up" duration={700}>
            <div className="flex items-end justify-between mb-5 md:mb-6 flex-wrap gap-4">
              <div>
                <p className="text-eyebrow mb-2">Os mais pedidos</p>
                <h2 className="display-md text-western-green-deep">Mais vendidos.</h2>
              </div>
              <Link
                to="/produtos"
                className="tap-target inline-flex items-center gap-2 font-sans text-[15px] font-semibold text-western-green-deep underline underline-offset-4 decoration-western-gold hover:decoration-western-green-deep transition-colors"
              >
                Ver catálogo completo <ArrowRight className="h-5 w-5" strokeWidth={1.75} />
              </Link>
            </div>
          </Reveal>
          {loadingFeatured && featured.length === 0 ? (
            <div className={featuredTrack}>
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className={`${featuredItem} space-y-3`}>
                  <div className="aspect-square rounded-xl bg-western-stone-warm/10 animate-pulse" />
                  <div className="h-5 w-3/4 rounded-sm bg-western-stone-warm/10 animate-pulse" />
                  <div className="h-4 w-1/3 rounded-sm bg-western-stone-warm/10 animate-pulse" />
                </div>
              ))}
            </div>
          ) : featured.length === 0 ? (
            <div className="rounded-xl border border-dashed border-western-border-strong p-10 text-center text-body">
              Catálogo indisponível no momento. Tente recarregar em instantes.
            </div>
          ) : (
            <div className={featuredTrack}>
              {featured.slice(0, 8).map((p, i) => (
                <Reveal
                  key={p.node.id}
                  className={featuredItem}
                  variant="fade-up"
                  delay={(i % 4) * 90}
                  duration={650}
                  distance={20}
                >
                  <ProductCard product={p.node} />
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </section>

    </>
  );

  return (
    <>
      <Seo
        title="Western — Pedras artesanais para paisagismo profissional"
        description="Cascatas, pedras e revestimentos artesanais, até 10× mais leves que a pedra natural — sem guindaste. Catálogo B2B para arquitetos, paisagistas e laguistas, com modelos 3D no SketchUp."
        path="/"
        ogType="website"
      />

      {/* Preload do herói. É o primeiro pixel que a pessoa vê e era o ÚLTIMO a
          ser pedido: o navegador só descobria a foto depois de baixar e rodar o
          app inteiro. Duas linhas, o maior ganho de velocidade isolado da
          página — e não muda um pixel do design. `media` garante que só a versão
          do breakpoint certo é baixada (nunca as duas). */}
      <Helmet>
        <link rel="preload" as="image" href={heroHomeMobile} media="(max-width: 767px)" />
        <link rel="preload" as="image" href={heroHome} media="(min-width: 768px)" />
      </Helmet>

      {/* 1 — HERO "Declaração 10%" (foto full-bleed + overlay verde de proteção) */}
      {/* Art direction por breakpoint: no celular a foto é um RECORTE RETRATO
          (9:16) da mesma obra; no desktop, uma faixa. Antes era a mesma foto
          deitada espremida num slot em pé — o navegador ampliava 1,3x e jogava
          fora 68% da largura. */}
      <section className="relative w-full overflow-hidden bg-western-green-deep flex items-start md:items-center min-h-[760px] md:min-h-[720px]">
        <picture>
          <source media="(min-width: 768px)" srcSet={heroHome} width={1600} height={900} />
          <img
            src={heroHomeMobile}
            alt="Piscina natural no ateliê Western — cascatas sobre pedras artesanais e água cristalina."
            loading="eager"
            {...({ fetchpriority: "high" } as Record<string, string>)}
            decoding="async"
            width={860}
            height={1529}
            /* object-bottom no desktop: a pedra em primeiro plano é o PRODUTO
               e vive na base do recorte. Ancorando embaixo, ele nunca sai do
               quadro — por mais larga que seja a tela, o corte come o topo. */
            className="absolute inset-0 w-full h-full object-cover object-center md:object-bottom"
          />
        </picture>
        {/* Scrim mobile ANCORADO NO TOPO: o texto vive no escuro de cima (onde a
            foto só tem copa de árvore) e a base fica LIMPA — é lá que está o
            pedra, que é o produto. Antes era um cobertor de 70-90% na altura
            toda: a foto virava fundo. */}
        <div
          className="absolute inset-0 pointer-events-none md:hidden"
          aria-hidden
          style={{
            background:
              "linear-gradient(180deg, hsl(var(--western-green-deep) / 0.95) 0%, hsl(var(--western-green-deep) / 0.92) 45%, hsl(var(--western-green-deep) / 0.55) 70%, hsl(var(--western-green-deep) / 0.08) 100%)",
          }}
        />
        {/* Scrim desktop em DUAS camadas: forte na esquerda (onde vive o H1, a
            subline e a régua) e um véu leve subindo da base (pra régua não perder
            contraste sobre a pedra clara). O CENTRO-DIREITA fica livre — é onde a
            piscina turquesa e as pedras aparecem. Antes um único gradiente de 0.66
            no meio matava a foto: o hero inteiro lia como verde chapado. */}
        <div
          className="absolute inset-0 pointer-events-none hidden md:block"
          aria-hidden
          style={{
            background:
              "linear-gradient(180deg, transparent 42%, hsl(var(--western-green-deep) / 0.5) 100%), linear-gradient(100deg, hsl(var(--western-green-deep) / 0.85) 0%, hsl(var(--western-green-deep) / 0.48) 36%, transparent 64%)",
          }}
        />
        {/* Símbolo da marca como marca d'água (estático — o DS não usa parallax) */}
        <img
          src={iconePedraBranco}
          alt=""
          aria-hidden
          className="hidden md:block absolute right-[6%] top-1/2 -translate-y-1/2 w-[38vw] max-w-[480px] opacity-[0.1] pointer-events-none select-none"
        />

        {/* O posicionamento vertical é da <section>: no celular o texto ancora
            no TOPO (items-start) e a foto respira na base; no desktop, centro. */}
        <div className="relative container-western w-full pt-14 pb-20 md:py-24">
          <div className="w-full max-w-2xl text-western-cream animate-fade-in-up">
            {isPartnerHome && (
              <p className="text-eyebrow text-western-gold-soft mb-3">
                Bem-vindo de volta{empresa ? ` · ${empresa}` : ""}
              </p>
            )}
            <div className="w-12 h-px bg-western-gold mb-6" />
            <h1 className="display-xl text-western-cream">
              Natureza que ninguém acredita ser{" "}
              <span className="text-western-gold-soft">obra.</span>
            </h1>
            <p className="text-[16px] md:text-[17px] leading-[1.6] text-western-cream/85 max-w-md mt-5 mb-6">
              Cascatas, pedras e revestimentos artesanais — até 10× mais leves — para projetos e profissionais.
            </p>

            {/* Hierarquia de CTA: a AÇÃO de maior valor (converter) vem primeiro.
                Dourado porque o verde não teria contraste sobre a foto com overlay
                verde — é a regra do V3 (verde é primário sobre fundo claro; sobre
                foto/verde, o acento dourado assume). */}
            <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-3">
              {session ? (
                cartCount > 0 ? (
                  <>
                    <Link to="/carrinho" className="btn-gold w-full sm:w-auto">
                      Continuar meu carrinho ({cartCount}){" "}
                      <ArrowRight className="h-5 w-5" strokeWidth={1.75} />
                    </Link>
                    <Link to="/produtos" className="btn-outline-cream w-full sm:w-auto">
                      Ver catálogo
                    </Link>
                  </>
                ) : (
                  <>
                    <Link to="/produtos" className="btn-gold w-full sm:w-auto">
                      {isApproved ? "Ver catálogo · preços liberados" : "Ver catálogo"}{" "}
                      <ArrowRight className="h-5 w-5" strokeWidth={1.75} />
                    </Link>
                    <Link to="/conjuntos" className="btn-outline-cream w-full sm:w-auto">
                      Conjuntos prontos
                    </Link>
                  </>
                )
              ) : (
                <>
                  <Link to="/parceiro/cadastro" className="btn-gold w-full sm:w-auto">
                    Criar cadastro · ver preços <ArrowRight className="h-5 w-5" strokeWidth={1.75} />
                  </Link>
                  <Link to="/produtos" className="btn-outline-cream w-full sm:w-auto">
                    Ver catálogo
                  </Link>
                </>
              )}
            </div>
            {/* Régua de provas. Era `flex flex-wrap` SEM breakpoint nenhum — o
                layout no celular não era projetado, era emergente: a 375/390px
                os três quebravam 2+1 com "33 anos" órfão, e só a partir de 403px
                (limiar que ninguém escolheu) cabiam numa linha. Agora a grade é
                DECLARADA: 2×2 no celular, 4 colunas no desktop. Nunca há órfão,
                de 320px a 1360px.

                min-h no rótulo: dentro do max-w-2xl do hero as colunas do desktop
                têm ~144px, então os rótulos longos quebram em 2 linhas de todo
                jeito. Reservar a altura mantém as 4 células iguais e os números
                na mesma base — a quebra vira projeto, não acidente.

                O 50% é o único dourado, no mesmo token do "obra." do h1 (regra do
                DS: sobre foto/verde o acento é dourado). Vem primeiro porque fica
                logo abaixo do "Criar cadastro · ver preços" — ele é a resposta à
                pergunta que o botão faz.

                "abaixo do varejo" e não "de desconto": no vocabulário deste site
                "% de desconto" já significa o desconto do TIER (AccountLayout.tsx
                :155 mostra os 5–20% reais pós-login). São coisas diferentes — o
                50% é a distância do preço B2B para o preço B2C, e o tier corre em
                cima dessa base. Mesma palavra para as duas quebraria a promessa
                no primeiro login. */}
            {/* V1 (escolha do dono, 18/07): a régua 2×2 virou UMA linha corrida
                com separadores — desk e mobile. O hero fecha ~110px mais cedo
                no celular e os números param de disputar com os CTAs. */}
            <p className="mt-6 pt-4 border-t border-western-cream/20 font-sans text-[13px] md:text-[14px] leading-[1.8] text-western-cream/80 max-w-xl">
              <b className="font-semibold text-western-gold-soft">50%</b> abaixo do varejo, em média
              {" · "}
              <b className="font-semibold text-western-cream">8</b> linhas de produtos
              {" · "}
              <b className="font-semibold text-western-cream">+300 mil</b> downloads no SketchUp
              {" · "}
              <b className="font-semibold text-western-cream">33 anos</b> de ateliê
            </p>
          </div>
        </div>
      </section>

      {isPartnerHome && vitrineMaisVendidos}

      {/* 1b — Segmentação B2B×B2C inline (substitui o antigo modal de entrada).
          Uma porta só para "por onde começar": profissional (vê preço) ou casa. */}
      {/* 1 — O que é a Western Store (orientação p/ quem cai de paraquedas) */}
      <SobreAWestern />

      {!isPartnerHome && vitrineMaisVendidos}

      {/* 2b — CREDENCIAL. Uma tira de ~120px que responde "quem são vocês para
          pedir o meu CNPJ?" — logo abaixo do primeiro pedido de cadastro. Antes
          estes números viviam na 11ª seção: a página cobrava o crédito muito
          antes de mostrar o extrato. Cento e vinte pixels resolvem o que uma
          reordenação inteira tentava resolver. */}
      {/* V1 (escolha do dono, 18/07): duas linhas FIXAS — números numa linha
          corrida; marcas numa fita horizontal rolável sem quebra (as 8, não 5).
          No desktop as duas dividem a mesma linha: números à esquerda, fita à
          direita ocupando o resto. Nada mais quebra em wrap solto. */}
      <section className="surface-paper border-y border-western-border-soft">
        <div className="container-western py-4 md:py-5">
          <div className="flex flex-col gap-2.5 md:flex-row md:items-center md:justify-between md:gap-10">
            <p className="shrink-0 font-sans text-[13.5px] md:text-[14px] text-western-stone-warm whitespace-nowrap">
              <b className="font-display text-[16px] md:text-[17px] text-western-green-deep tabular-nums">4,9</b>{" "}
              <span className="text-[9px] tracking-[0.15em] text-western-gold" aria-hidden="true">★★★★★</span> no Google
              {" · "}
              <b className="font-display text-[16px] md:text-[17px] text-western-green-deep tabular-nums">+14 mil</b> no Instagram
              {" · "}
              <b className="font-display text-[16px] md:text-[17px] text-western-green-deep tabular-nums">+700</b> obras entregues
            </p>
            <div className="flex min-w-0 items-center gap-x-5 overflow-x-auto whitespace-nowrap [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <span className="shrink-0 text-[11px] font-semibold uppercase tracking-[0.1em] text-western-stone-warm/55">
                Escolhida por
              </span>
              <ul className="flex items-center gap-x-5 md:gap-x-6">
                {SOCIAL_PROOF.marcas.map((m) => (
                  <li
                    key={m.slug}
                    className="shrink-0 font-sans text-[13.5px] md:text-[14px] font-semibold text-western-stone-warm/85"
                  >
                    {m.nome}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 3b — Principais linhas (navegação por categoria) */}
      <section className="surface-ivory section border-t border-western-border-soft">
        <div className="container-western">
          <Reveal variant="fade-up" duration={700}>
            <div className="flex items-end justify-between mb-8 md:mb-12 flex-wrap gap-4">
              <div>
                <p className="text-eyebrow mb-3">Navegue por linha</p>
                <h2 className="display-md text-western-green-deep">Principais linhas.</h2>
              </div>
              <Link
                to="/linhas"
                className="tap-target inline-flex items-center gap-2 font-sans text-[15px] font-semibold text-western-green-deep underline underline-offset-4 decoration-western-gold hover:decoration-western-green-deep transition-colors"
              >
                Ver todas as linhas <ArrowRight className="h-5 w-5" strokeWidth={1.75} />
              </Link>
            </div>
          </Reveal>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {LINHAS_HOME.map((l, i) => (
              <Reveal key={l.handle} variant="fade-up" delay={(i % 4) * 80} duration={620} distance={18}>
                <Link to={`/linhas/${l.handle}`} className="group block">
                  <div className="relative overflow-hidden rounded-xl aspect-[4/3] bg-western-cream-muted">
                    <img
                      src={l.cover}
                      alt={l.label}
                      loading="lazy"
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <h3 className="mt-3 font-sans text-[17px] font-semibold text-western-green-deep transition-colors group-hover:text-western-bronze">
                    {l.label}
                  </h3>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* 3c — O que você vai construir? (intenção por aplicação → guia) */}
      <section className="surface-paper section border-t border-western-border-soft">
        <div className="container-western">
          {/* O link do guia vive AQUI, no cabeçalho — os 5 tiles já levam todos
              para /guia-de-composicao. A antiga seção "Não sabe por onde começar"
              era um segundo CTA para a MESMA url: um post-it, não uma seção. */}
          <Reveal variant="fade-up" duration={700}>
            <div className="flex items-end justify-between mb-8 md:mb-12 flex-wrap gap-4">
              <div>
                <p className="text-eyebrow mb-3">Compre por projeto</p>
                <h2 className="display-md text-western-green-deep">O que você vai construir?</h2>
              </div>
              <Link
                to="/guia-de-composicao"
                className="tap-target inline-flex items-center gap-2 font-sans text-[15px] font-semibold text-western-green-deep underline underline-offset-4 decoration-western-gold hover:decoration-western-green-deep transition-colors"
              >
                Responda 3 perguntas <ArrowRight className="h-5 w-5" strokeWidth={1.75} />
              </Link>
            </div>
          </Reveal>
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 md:gap-6">
            {TILES.map((t, i) => (
              <Reveal key={t.nome} variant="fade-up" delay={(i % 4) * 80} duration={600} distance={18}>
                <Link to="/guia-de-composicao" className="group block">
                  <div className="relative overflow-hidden rounded-xl aspect-[4/5] bg-western-cream-muted">
                    <img
                      src={t.img}
                      alt={t.nome}
                      loading="lazy"
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-western-green-deep/90 via-western-green-deep/25 to-transparent" />
                    <div className="absolute inset-x-0 bottom-0 p-4 md:p-5">
                      <p className="font-sans text-[18px] font-semibold text-western-cream leading-snug">{t.nome}</p>
                      <p className="text-[14px] text-western-cream/80 mt-1 leading-snug">{t.desc}</p>
                    </div>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* 5 — Western Box (porta de entrada, preço aberto) */}
      <section className="surface-ivory section border-y border-western-border-soft">
        <div className="container-western">
          <div className="grid md:grid-cols-2 gap-8 md:gap-14 items-center">
            <Reveal variant="fade-right" duration={700}>
              <div className="grid grid-cols-2 gap-px rounded-xl overflow-hidden bg-western-border-soft">
                {ACABAMENTOS.map((a) => (
                  <div
                    key={a.nome}
                    className="relative flex items-end p-4 min-h-[140px] md:min-h-[160px] overflow-hidden"
                    style={{ backgroundColor: a.tone }}
                  >
                    <img
                      src={texturaPara(a.nome)}
                      alt={`Acabamento ${a.nome}`}
                      loading="lazy"
                      decoding="async"
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                    {/* gradiente inferior — mantém o rótulo legível sobre texturas escuras */}
                    <span
                      aria-hidden
                      className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/55 via-black/15 to-transparent"
                    />
                    <span className="relative font-sans text-[15px] font-semibold text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.55)]">
                      {a.nome}
                    </span>
                  </div>
                ))}
              </div>
            </Reveal>
            <Reveal variant="fade-left" delay={100} duration={700}>
              <div>
                <p className={`${eyebrowDark} inline-flex items-center rounded-sm bg-western-green-deep px-3 py-1.5 mb-5`}>
                  Porta de entrada
                </p>
                <h2 className="display-lg text-western-green-deep mb-4">
                  Western Box — os 4 acabamentos na sua mão.
                </h2>
                <p className="text-body max-w-md mb-8">
                  A amostra que se paga: os{" "}
                  <b className="text-western-green-deep font-semibold">R$ 149,90 voltam como crédito</b> no seu
                  primeiro pedido. Aberta a todos, sem cadastro e sem mínimo.
                </p>
                <div className="flex flex-col sm:flex-row sm:items-center gap-5">
                  <span className="text-price">R$ 149,90</span>
                  <Link to="/western-box" className="btn-primary w-full sm:w-auto">
                    Conhecer a Box <ArrowRight className="h-5 w-5" strokeWidth={1.75} />
                  </Link>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* 6 — Veja em uso (projetos reais) */}
      <section className="surface-paper section">
        <div className="container-western">
          <Reveal variant="fade-up" duration={700}>
            <p className="text-eyebrow mb-3">Veja em uso</p>
            <h2 className="display-md text-western-green-deep mb-6 md:mb-8">
              Projetos reais, pedra Western.
            </h2>
          </Reveal>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-7 md:gap-x-6 md:gap-y-10">
            {/* Card unificado (ObraCard, variant teaser): a legenda vive FORA da
                  foto de propósito — sobre foto clara (água/areia) o texto creme
                  sumia (~1,1:1); no fundo da seção o contraste não depende dela. */}
              {PROJETOS.map((p, i) => (
                <ObraCard key={p.nome} variant="teaser" index={i} image={p.img} alt={p.nome} title={p.nome} desc={p.tipo} />
              ))}
          </div>
          {/* Os retratos NÃO vivem aqui: são headshots de imprensa, não fotos de
              obra — no meio de uma grade de obras viravam ruído. E os cards já
              creditam "Casa de Praia · Tato" e "Lago híbrido · Neymar Jr.":
              o rosto seria a mesma prova, dita duas vezes. Eles vivem na tira de
              "quem confia", perto do fechamento. */}
          <div className="mt-10">
            <Link to="/obras" className="btn-outline-forest w-full sm:w-auto">
              Ver todas as obras <ArrowRight className="h-5 w-5" strokeWidth={1.75} />
            </Link>
          </div>
        </div>
      </section>

      {/* 7 — O CLÍMAX. Vem logo depois das obras, com a foto ainda quente na
          retina: "aquilo que você acabou de ver pesa 10% e sobe sem guindaste".
          É a ÚNICA seção escura do miolo — a página não tinha ponto alto: 11
          seções com o mesmo h2, o mesmo respiro e o mesmo bege, e por isso nada
          parecia importante. O argumento da empresa não pode respirar igual a
          um passo-a-passo. */}
      <section className="surface-forest section border-y border-western-gold/15">
        <div className="container-western">
          <Reveal variant="fade-up" duration={700}>
            <p className={`${eyebrowDark} mb-3`}>Por que Western</p>
            <h2 className="display-lg text-western-cream mb-8 md:mb-12">
              A pedra sem o peso da pedra.
            </h2>
          </Reveal>
          <div className="grid md:grid-cols-2 gap-4 md:gap-6">
            <Reveal variant="fade-up" duration={650}>
              <div className="rounded-xl border border-western-cream/15 bg-western-green-mid/20 p-7 md:p-9 h-full">
                <p className="font-sans text-[14px] font-semibold uppercase tracking-[0.06em] text-western-cream/50 mb-6">
                  Pedra natural
                </p>
                <ul className="space-y-4">
                  {[
                    "Pesada — exige guindaste e caminhão Munck",
                    "Difícil em cobertura, terraço ou pavimento alto",
                    "Variedade limitada ao que a natureza deu",
                    "Obra pesada, mais tempo e custo",
                  ].map((t) => (
                    <li key={t} className="flex gap-3 items-start text-[16px] leading-[1.5] text-western-cream/55">
                      <X className="h-5 w-5 text-western-cream/35 mt-0.5 shrink-0" strokeWidth={1.75} />
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
            <Reveal variant="fade-up" delay={100} duration={650}>
              <div className="rounded-xl border border-western-gold/50 bg-western-green-mid/50 ring-1 ring-western-gold/20 p-7 md:p-9 h-full">
                <p className={`${eyebrowDark} mb-6`}>Pedra Western</p>
                <ul className="space-y-4">
                  {/* A CAUSA (≈10% do peso) e a PROVA (reprodução fiel) subiram
                      para a 2ª seção, onde o visitante ainda está perguntando o
                      que a empresa é — aqui elas chegavam sete telas tarde e
                      repetiam a seção 2 palavra por palavra. Esta seção agora é
                      CONSEQUÊNCIA, não revelação: o que muda na obra de quem
                      compra. Os dois bullets novos são fatos publicados e até
                      hoje sem casa — About.tsx:45 (caminhão comum) e
                      installation.ts:122 (AC3, sem sistema proprietário). */}
                  {[
                    "Sobe em caminhão comum, descarrega manual",
                    "Fácil em cobertura, terraço e pavimento alto",
                    "50 modelos, formatos para cada cena",
                    "Fixa com argamassa AC3 — sem sistema proprietário",
                  ].map((t) => (
                    <li key={t} className="flex gap-3 items-start text-[16px] leading-[1.5] text-western-cream">
                      <Check className="h-5 w-5 text-western-gold-soft mt-0.5 shrink-0" strokeWidth={1.75} />
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          </div>
          <p className="mt-9 max-w-xl text-[15px] text-western-cream/70">
            Mesma leitura de pedra natural, sem a obra pesada. Ateliê próprio desde 1993.
          </p>
        </div>
      </section>

      {/* 8 — Como comprar (4 passos) */}
      <section className="surface-paper section" id="como-comprar">
        <div className="container-western">
          <Reveal variant="fade-up" duration={700}>
            <p className="text-eyebrow mb-3">Loja para profissionais</p>
            <h2 className="display-md text-western-green-deep mb-6 md:mb-8">
              Como comprar na Western.
            </h2>
          </Reveal>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { n: "1", t: "Cadastre-se grátis", d: "Rápido, com o CNPJ da empresa." },
              { n: "2", t: "Acesso na hora", d: "Aprovação automática e imediata." },
              { n: "3", t: "Preço de parceiro", d: "Valor de atacado e modelos 3D liberados." },
              { n: "4", t: "Monte e finalize", d: `Pedido mín. ${BUSINESS.pedidoMinimoLabel} · garantia de ${BUSINESS.garantiaLabel}.` },
            ].map((s, i) => (
              <Reveal key={s.n} variant="fade-up" delay={i * 80} duration={600} distance={16}>
                <div className="flex gap-4 items-start">
                  <span className="font-sans text-[18px] font-semibold text-western-bronze bg-white border border-western-border-soft rounded-lg w-12 h-12 flex items-center justify-center shrink-0">
                    {s.n}
                  </span>
                  <div>
                    <p className="font-sans text-[16px] font-semibold text-western-green-deep mb-1">{s.t}</p>
                    <p className="text-[15px] leading-[1.5] text-western-stone-warm">{s.d}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 mt-12">
            <Link to="/parceiro/cadastro" className="btn-primary w-full sm:w-auto">
              Criar cadastro grátis <ArrowRight className="h-5 w-5" strokeWidth={1.75} />
            </Link>
            <span className="text-[15px] text-western-stone-warm">Leva menos de 2 minutos · precisa de CNPJ</span>
          </div>
        </div>
      </section>

      {/* 10 — QUEM ESPECIFICA. Só os PROFISSIONAIS: são o espelho do visitante,
          e ele precisa vê-los no exato momento em que vai decidir. SEM link — a
          uma tela do fechamento não se manda ninguém embora.
          (Os clientes migraram para "Veja em uso" — eles não ilustram obras,
          eles SÃO obras. Os números e as marcas viraram a faixa de credencial
          da 2ª tela, colada no 1º pedido de CNPJ.) */}
      <section className="surface-paper section-tight border-t border-western-border-soft">
        <div className="container-western">
          <Reveal variant="fade-up" duration={750}>
            <SocialProof
              interactive
              layout="row"
              align="left"
              groups={["celebridades", "profissionais"]}
              eyebrow="Clientes · e quem especifica"
              titulo={<>Quem confia a sua paisagem à Western.</>}
            />
          </Reveal>
        </div>
      </section>

      {/* 11 — Credenciamento B2B (o PEDIDO) — some para quem já tem sessão:
          pedir acesso a quem já entrou era ruído de fim de página. */}
      {!session && (
      <section className="surface-forest section">
        <div className="container-western">
          <div className="grid md:grid-cols-2 gap-10 md:gap-14 items-center">
            <Reveal variant="fade-right" duration={750}>
              <div>
                <p className={`${eyebrowDark} mb-4`}>Seja parceiro Western</p>
                <h2 className="display-lg text-western-cream mb-6">
                  Tabela de preços, condições e modelos 3D liberados após o cadastro.
                </h2>
                <p className="text-[16px] leading-[1.6] text-western-cream/80 max-w-md mb-9">
                  Atendemos profissionais e empresas com CNPJ ativo — de arquitetos e paisagistas a laguistas,
                  jardineiros, garden centers, lojas e construtoras.
                </p>
                {/* Dourado: único CTA da faixa escura, onde o verde não teria contraste. */}
                <Link to="/parceiro/cadastro" className="btn-gold w-full sm:w-auto">
                  Solicitar acesso B2B <ArrowRight className="h-5 w-5" strokeWidth={1.75} />
                </Link>
              </div>
            </Reveal>
            <Reveal variant="fade-left" delay={120} duration={750}>
              <div className="grid grid-cols-2 gap-px rounded-xl overflow-hidden bg-western-gold/20">
                {[
                  { eyebrow: "Pedido mínimo", t: BUSINESS.pedidoMinimoLabel },
                  { eyebrow: "Garantia", t: BUSINESS.garantiaLabel },
                  { eyebrow: "Reposição", t: "Em caso de avaria" },
                  { eyebrow: "Cadastro", t: "Automático por CNPJ" },
                ].map((s) => (
                  <div key={s.eyebrow} className="bg-western-green-deep p-6 md:p-8">
                    <p className={`${eyebrowDark} mb-3`}>{s.eyebrow}</p>
                    <h3 className="display-md text-western-cream">{s.t}</h3>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </div>
      </section>
      )}

      {/* 12 — Ricardo: a ASSINATURA da casa, por último. O credenciamento é o
          pedido; esta é o aperto de mão. Quem rolou até aqui e não clicou no
          dourado não vai clicar num 12º botão — vai olhar quem fez aquilo.
          As duas telas escuras finais viram um bloco único: o olho lê "fecho". */}
      <Reveal variant="fade-up" duration={800}>
        <ArtistaSection />
      </Reveal>
    </>
  );
}
