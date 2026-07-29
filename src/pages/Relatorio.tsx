import { useEffect, useRef, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, MoveHorizontal } from "lucide-react";
import Seo from "@/components/seo/Seo";
import Reveal from "@/components/shared/Reveal";

/* Página /relatorio — apresentação interna da reconstrução do site.
 *
 * PÚBLICO: gente da empresa que NÃO trabalha com web. Por isso:
 * jargão zero (nada de "commit", "componente", "deploy"), texto curto,
 * e o peso da explicação vai para o COMPARADOR ARRASTÁVEL — ver antes/depois
 * dispensa vocabulário. As falas do dono entram porque humanizam o "porquê".
 *
 * DIAGRAMAÇÃO: segue a regra do dono — eixo forte à esquerda, conteúdo
 * distribuído na largura, sempre algo à direita. Nunca "tudo mx-auto".
 *
 * NÃO indexável e fora do menu: é material interno, não página de loja.
 */

/* ---------------- assets ---------------- */
import v1Home from "@/assets/relatorio/v1-home.webp";
import v3Home from "@/assets/relatorio/v3-home.webp";
import v1Pdp from "@/assets/relatorio/v1-pdp.webp";
import v3Pdp from "@/assets/relatorio/v3-pdp.webp";
import v1Linhas from "@/assets/relatorio/v1-linhas.webp";
import v3Linhas from "@/assets/relatorio/v3-linhas.webp";
import v1Cadastro from "@/assets/relatorio/v1-cadastro.webp";
import v3Cadastro from "@/assets/relatorio/v3-cadastro.webp";
import v1HomeMob from "@/assets/relatorio/v1-home-mob.webp";
import v3HomeMob from "@/assets/relatorio/v3-home-mob.webp";
import novaApedra from "@/assets/relatorio/nova-apedra.webp";
import novaObras from "@/assets/relatorio/nova-obras.webp";
import novaParaSuaCasa from "@/assets/relatorio/nova-parasuacasa.webp";
import novaComoComprar from "@/assets/relatorio/nova-comocomprar.webp";
import novaCarrinho from "@/assets/relatorio/nova-carrinho.webp";

/* ---------------- comparador arrastável ---------------- */

type CompProps = { antes: string; depois: string; alt: string; retrato?: boolean };

function Comparador({ antes, depois, alt, retrato = false }: CompProps) {
  const [pos, setPos] = useState(50);
  const stage = useRef<HTMLDivElement>(null);
  const arrastando = useRef(false);

  const mover = useCallback((clientX: number) => {
    const el = stage.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const p = ((clientX - r.left) / r.width) * 100;
    setPos(Math.max(0, Math.min(100, p)));
  }, []);

  useEffect(() => {
    const up = () => { arrastando.current = false; };
    const move = (e: PointerEvent) => { if (arrastando.current) mover(e.clientX); };
    window.addEventListener("pointerup", up);
    window.addEventListener("pointermove", move);
    return () => {
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointermove", move);
    };
  }, [mover]);

  return (
    <div
      ref={stage}
      className={`relative overflow-hidden rounded-[12px] border border-western-border-soft bg-western-paper select-none touch-pan-y ${
        retrato ? "aspect-[9/16] sm:aspect-[4/5]" : "aspect-[16/10]"
      }`}
      onPointerDown={(e) => { arrastando.current = true; mover(e.clientX); }}
    >
      {/* base = DEPOIS (fica à direita) */}
      <img src={depois} alt={`Novo — ${alt}`} className="absolute inset-0 h-full w-full object-cover object-top" loading="lazy" />
      {/* sobreposta recortada da esquerda = ANTES */}
      <div className="absolute inset-0 overflow-hidden" style={{ width: `${pos}%` }}>
        <img
          src={antes}
          alt={`Antes — ${alt}`}
          className="absolute inset-0 h-full object-cover object-top"
          style={{ width: stage.current?.offsetWidth ? `${stage.current.offsetWidth}px` : "100%" }}
          loading="lazy"
        />
      </div>

      <span className="pointer-events-none absolute left-3 top-3 rounded-[6px] bg-black/65 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.1em] text-white">
        Antes
      </span>
      <span className="pointer-events-none absolute right-3 top-3 rounded-[6px] bg-western-cta px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.1em] text-white">
        Agora
      </span>

      <div className="pointer-events-none absolute inset-y-0 w-[2px] bg-western-bronze" style={{ left: `${pos}%` }} />
      <div
        className="pointer-events-none absolute top-1/2 grid h-12 w-12 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-western-bronze text-white shadow-lg"
        style={{ left: `${pos}%` }}
      >
        <MoveHorizontal className="h-5 w-5" strokeWidth={2} />
      </div>

      <input
        type="range"
        min={0}
        max={100}
        value={pos}
        onChange={(e) => setPos(Number(e.target.value))}
        aria-label={`Comparar antes e agora: ${alt}`}
        className="absolute inset-0 h-full w-full cursor-ew-resize opacity-0"
      />
    </div>
  );
}

/* ---------------- conteúdo ---------------- */

const COMPARACOES = [
  {
    titulo: "A primeira tela",
    legenda: "A antiga anunciava a empresa. A nova mostra a peça no lugar dela — e o botão diz o que você ganha ao entrar.",
    antes: v1Home, depois: v3Home,
  },
  {
    titulo: "A página de uma peça",
    legenda: "A ficha técnica estava escondida atrás de abas. Agora ela se lê rolando, na ordem em que a dúvida aparece.",
    antes: v1Pdp, depois: v3Pdp,
  },
  {
    titulo: "O catálogo",
    legenda: "Antes o título falava de como a empresa organiza os produtos. Agora pergunta o que o cliente vai construir.",
    antes: v1Linhas, depois: v3Linhas,
  },
  {
    titulo: "O cadastro do parceiro",
    legenda: "O endereço saiu do formulário. Digita o CNPJ e a razão social vem sozinha.",
    antes: v1Cadastro, depois: v3Cadastro,
  },
  {
    titulo: "No celular",
    legenda: "Onde entra a maior parte dos clientes. Toda tela foi conferida também aqui, não só no computador.",
    antes: v1HomeMob, depois: v3HomeMob, retrato: true,
  },
];

const NOVAS = [
  {
    titulo: "A pedra",
    texto: "Responde a dúvida que mais trava a venda: “isso é pedra de verdade?”. Cada objeção virou um título com foto ao lado.",
    img: novaApedra,
  },
  {
    titulo: "Obras entregues",
    texto: "Cada obra mostra as peças que a compõem — e dá para pedir orçamento a partir da foto.",
    img: novaObras,
  },
  {
    titulo: "Para sua casa",
    texto: "Quem não tem CNPJ deixou de bater numa parede. Agora tem caminho próprio, atendido como projeto.",
    img: novaParaSuaCasa,
  },
  {
    titulo: "Como comprar",
    texto: "O processo inteiro explicado antes do clique: o cadastro é grátis, a aprovação é na hora, a produção tem prazo.",
    img: novaComoComprar,
  },
  {
    titulo: "Carrinho",
    texto: "Antes não existia — a página dava erro. Hoje o pedido pode virar compra ou virar orçamento.",
    img: novaCarrinho,
  },
];

const PRINCIPIOS = [
  {
    titulo: "Uma decisão por vez",
    texto: "Cada tela pede uma coisa só. Quando duas opções brigavam pelo mesmo momento, uma foi cortada.",
    fala: "Como a Apple faria? Como deixar mais acessível pensando no público que vai utilizar?",
  },
  {
    titulo: "A língua do cliente",
    texto: "O site parou de falar como a empresa se organiza por dentro e passou a falar como o cliente pensa lá fora.",
    fala: "O site segue a lógica do usuário ou apenas a estrutura interna da empresa?",
  },
  {
    titulo: "Provar, não afirmar",
    texto: "Adjetivo virou prova. Em vez de escrever que a peça é leve, uma pessoa de 1,70 m aparece ao lado dela em 50 fotos.",
    fala: "Não pode ser conteúdo raso. Trabalhe real nisso.",
  },
  {
    titulo: "Ninguém fica sem saída",
    texto: "Todo ponto onde alguém era barrado ganhou uma segunda porta — inclusive para quem não é o cliente da loja.",
    fala: "É para não perdermos esse lead e conseguirmos guiar ele pra atendermos como turnkey.",
  },
];

const NUMEROS = [
  { v: "31", l: "dias de trabalho" },
  { v: "47", l: "páginas no site" },
  { v: "50", l: "fotos produzidas para mostrar o tamanho real" },
  { v: "29", l: "áreas revisadas, uma a uma" },
  { v: "33", l: "concorrentes analisados" },
  { v: "112", l: "pontos levantados numa auditoria" },
];

/* ---------------- página ---------------- */

export default function Relatorio() {
  return (
    <>
      <Seo
        title="O que mudou no site da Western"
        description="Apresentação interna da reconstrução do site: o antes e o depois de cada tela, as páginas novas e o porquê de cada decisão."
        path="/relatorio"
        noindex
      />

      {/* ---------- herói ---------- */}
      <section className="bg-western-green-deep py-16 md:py-24">
        <div className="container-western">
          <div className="grid gap-10 md:grid-cols-12 md:items-end">
            <div className="md:col-span-7">
              <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-western-gold-soft">
                Relatório interno · julho de 2026
              </p>
              <h1 className="mt-4 font-display text-[34px] leading-[1.05] text-white sm:text-[46px] md:text-[58px]">
                O site foi reconstruído.
              </h1>
              <p className="mt-5 max-w-[46ch] text-[18px] leading-[1.6] text-western-cream-muted md:text-[20px]">
                O estoque, o caixa e a maquininha continuam os mesmos. O que mudou foi a vitrine —
                e ela foi refeita do zero.
              </p>
            </div>

            <div className="md:col-span-5">
              <figure className="rounded-[14px] border border-western-gold/30 bg-white/[0.04] p-6">
                <blockquote className="text-[17px] leading-[1.6] text-western-cream">
                  “Estoque, caixa e maquininha continuam. Mas a vitrine e o layout foram
                  reprojetados do zero.”
                </blockquote>
                <figcaption className="mt-4 text-[13px] text-western-cream-muted">
                  A diretriz que orientou o trabalho · 14 de julho
                </figcaption>
              </figure>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- comparações ---------- */}
      <section className="bg-western-ivory py-16 md:py-24">
        <div className="container-western">
          <div className="grid gap-6 md:grid-cols-12 md:items-end">
            <div className="md:col-span-7">
              <p className="text-sublabel">Antes e agora</p>
              <h2 className="mt-3 font-display text-[28px] leading-[1.1] text-western-green-deep sm:text-[36px]">
                Arraste e veja a diferença.
              </h2>
            </div>
            <div className="md:col-span-5">
              <p className="text-[16px] leading-[1.6] text-western-stone-warm">
                Mesma página, mesmo dia. À esquerda o site antigo, à direita o novo.
                Puxe a alça para o lado.
              </p>
            </div>
          </div>

          <div className="mt-10 space-y-12 md:mt-14 md:space-y-16">
            {COMPARACOES.map((c, i) => (
              <Reveal key={c.titulo} variant="fade-up" duration={600} delay={i === 0 ? 0 : 60}>
                <article className="grid gap-5 md:grid-cols-12 md:items-start md:gap-8">
                  <div className="md:col-span-8 md:order-2">
                    <Comparador antes={c.antes} depois={c.depois} alt={c.titulo} retrato={c.retrato} />
                  </div>
                  {/* acompanha a imagem na rolagem: o rótulo fica visível enquanto se arrasta */}
                  <div className="md:col-span-4 md:order-1 md:sticky md:top-28 md:pt-2">
                    <h3 className="font-display text-[21px] leading-[1.2] text-western-green-deep">
                      {c.titulo}
                    </h3>
                    <p className="mt-3 text-[16px] leading-[1.6] text-western-stone-warm">
                      {c.legenda}
                    </p>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- páginas novas ---------- */}
      <section className="bg-western-paper py-16 md:py-24">
        <div className="container-western">
          <div className="grid gap-6 md:grid-cols-12 md:items-end">
            <div className="md:col-span-7">
              <p className="text-sublabel">O que não existia</p>
              <h2 className="mt-3 font-display text-[28px] leading-[1.1] text-western-green-deep sm:text-[36px]">
                Cinco páginas novas.
              </h2>
            </div>
            <div className="md:col-span-5">
              <p className="text-[16px] leading-[1.6] text-western-stone-warm">
                No site antigo, estes cinco endereços davam erro. Cada um resolve uma dúvida
                que fazia o cliente parar.
              </p>
            </div>
          </div>

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {NOVAS.map((n, i) => (
              <Reveal key={n.titulo} variant="fade-up" duration={600} delay={i * 50}>
                <article className="h-full overflow-hidden rounded-[14px] border border-western-border-soft bg-white">
                  <img
                    src={n.img}
                    alt={n.titulo}
                    className="aspect-[16/10] w-full border-b border-western-border-soft object-cover object-top"
                    loading="lazy"
                  />
                  <div className="p-6">
                    <h3 className="font-display text-[19px] text-western-green-deep">{n.titulo}</h3>
                    <p className="mt-2.5 text-[15.5px] leading-[1.6] text-western-stone-warm">{n.texto}</p>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- princípios ---------- */}
      <section className="bg-western-ivory py-16 md:py-24">
        <div className="container-western">
          <div className="grid gap-6 md:grid-cols-12 md:items-end">
            <div className="md:col-span-7">
              <p className="text-sublabel">Por que mudou</p>
              <h2 className="mt-3 font-display text-[28px] leading-[1.1] text-western-green-deep sm:text-[36px]">
                Quatro regras guiaram tudo.
              </h2>
            </div>
            <div className="md:col-span-5">
              <p className="text-[16px] leading-[1.6] text-western-stone-warm">
                Nenhuma decisão foi tomada por gosto. Cada uma respondeu a uma pergunta feita
                durante o trabalho.
              </p>
            </div>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {PRINCIPIOS.map((p, i) => (
              <Reveal key={p.titulo} variant="fade-up" duration={600} delay={i * 50}>
                <article className="h-full rounded-[14px] border border-western-border-soft bg-white p-7">
                  <h3 className="font-display text-[20px] text-western-green-deep">{p.titulo}</h3>
                  <p className="mt-3 text-[16px] leading-[1.6] text-western-stone-warm">{p.texto}</p>
                  <p className="mt-5 border-l-2 border-western-bronze pl-4 text-[15.5px] italic leading-[1.55] text-western-green-deep">
                    “{p.fala}”
                  </p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- números ---------- */}
      <section className="bg-western-green-deep py-16 md:py-24">
        <div className="container-western">
          <div className="grid gap-8 md:grid-cols-12 md:items-start">
            <div className="md:col-span-4">
              <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-western-gold-soft">
                O tamanho do trabalho
              </p>
              <h2 className="mt-3 font-display text-[28px] leading-[1.1] text-white sm:text-[34px]">
                Em números.
              </h2>
            </div>

            <div className="md:col-span-8">
              <dl className="grid grid-cols-2 gap-x-8 gap-y-9 sm:grid-cols-3">
                {NUMEROS.map((n) => (
                  <div key={n.l}>
                    <dt className="font-display text-[38px] leading-none tabular-nums text-western-gold-soft sm:text-[44px]">
                      {n.v}
                    </dt>
                    <dd className="mt-2.5 text-[14.5px] leading-[1.45] text-western-cream-muted">{n.l}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- fecho ---------- */}
      <section className="bg-western-paper py-16 md:py-20">
        <div className="container-western">
          <div className="grid gap-8 md:grid-cols-12 md:items-center">
            <div className="md:col-span-7">
              <h2 className="font-display text-[26px] leading-[1.15] text-western-green-deep sm:text-[32px]">
                O site novo já está no ar.
              </h2>
              <p className="mt-4 max-w-[54ch] text-[17px] leading-[1.6] text-western-stone-warm">
                Tudo o que está neste relatório pode ser visto funcionando. Comece pela primeira
                tela e siga o caminho de um cliente.
              </p>
            </div>
            <div className="md:col-span-5 md:justify-self-end">
              <div className="flex flex-col gap-3 sm:flex-row md:flex-col">
                <Link to="/" className="btn-primary">
                  Ver a primeira tela
                  <ArrowRight className="ml-2 h-4 w-4" strokeWidth={2} />
                </Link>
                <Link to="/produtos" className="btn-outline">
                  Ver o catálogo
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
