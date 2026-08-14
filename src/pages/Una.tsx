import { useEffect, useRef, useState, type ReactNode } from "react";
import Seo from "@/components/seo/Seo";

/**
 * /una — landing do Una Spa para o cliente final (B2C).
 *
 * Página standalone (fora do SiteLayout): identidade própria do UNA
 * (areia + petróleo + bronze), sem header/footer da loja. Não aparece
 * em nenhum menu — o tráfego chega por campanha/QR da feira.
 * A porta B2B correspondente é /unaparceiros.
 */

const WHATS = "https://wa.me/5511958967088";
const ZAP_QUERO = `${WHATS}?text=${encodeURIComponent("Olá! Quero um UNA Spa no meu projeto.")}`;
const ZAP_VISITA = `${WHATS}?text=${encodeURIComponent("Olá! Quero agendar uma visita para ver o UNA Spa de perto.")}`;

const ANCORAS = [
  { href: "#peca", rotulo: "A peça" },
  { href: "#agua", rotulo: "A água" },
  { href: "#tons", rotulo: "Tons" },
  { href: "#como", rotulo: "Como funciona" },
];

const MACROS = [
  { img: "/una/tatil-mao.jpg", alt: "Mão pousada sobre a praia granulada da borda do Una, com a água ao lado", titulo: "Feita para o toque", sub: "A praia granulada da borda, morna ao sol." },
  { img: "/una/macro-degraus-v2.jpg", alt: "Escada do Una Spa: três degraus de pedra esculpida", titulo: "Escada de pedra", sub: "Três degraus esculpidos à mão acompanham a peça." },
  { img: "/una/macro-jato.jpg", alt: "Hidrojato de 50 mm visto por baixo d'água", titulo: "Hidro de 50 mm", sub: "Seis pontos distribuídos no assento." },
  { img: "/una/macro-led.jpg", alt: "LED subaquático em inox 316", titulo: "LED em inox 316", sub: "Dois pontos, cor ao seu gosto." },
];

const FORMA = [
  { titulo: "Concha monolítica", sub: "Revestida em Cristal Pool da borda ao fundo — uma única superfície, sem juntas." },
  { titulo: "Produto artesanal", sub: "Criado à mão pela Western para ser leve e resistente." },
  { titulo: "Até 6 pessoas", sub: "Banco contínuo modelado na concha, sem começo nem fim." },
  { titulo: "6 pontos de hidro", sub: "Dispositivos de 50 mm distribuídos no assento." },
  { titulo: "Água aquecida", sub: "Temperatura de spa o ano inteiro, dentro ou fora de casa." },
  { titulo: "Luz subaquática", sub: "2 LEDs RGB em inox 316, cor ao seu gosto." },
  { titulo: "Tratamento sem cloro", sub: "Equipado com gerador de ozônio." },
  { titulo: "Automação Sync", sub: "Comande pela voz, com Alexa e Google Home." },
  { titulo: "3,00 × 2,00 × 0,95 m", sub: "Solução para varandas, decks, coberturas e jardins compactos." },
];

const TONS = [
  { key: "quartzo", nome: "Quartzo", sub: "Quase branco — a luz que a pedra devolve." },
  { key: "arenito", nome: "Arenito", sub: "Quente e dourado, tom de praia." },
  { key: "moledo", nome: "Moledo", sub: "O mais pedido do ateliê.", destaque: true },
  { key: "granito", nome: "Granito", sub: "Cinza mineral, sóbrio." },
  { key: "carbono", nome: "Carbono", sub: "O mais grave — quase noite." },
];

const AMBIENTES = [
  { img: "/una/amb-varanda-carbono.jpg", alt: "Una Spa em acabamento Carbono numa varanda", legenda: "Carbono, na varanda" },
  { img: "/una/amb-cobertura.jpg", alt: "Una Spa em tom claro numa cobertura com vista da cidade", legenda: "Tom claro, na cobertura" },
  { img: "/una/amb-pergolado-v2.jpg", alt: "Una Spa em tom claro num deck ao fim de tarde, com a escada de pedra esculpida", legenda: "Fim de tarde, no deck" },
];

const PASSOS = [
  { titulo: "Conversa no WhatsApp", sub: "Você conta onde o Una vai viver; o time responde no mesmo dia útil." },
  { titulo: "Projeto e render 3D", sub: "Você vê e aprova a peça no seu espaço antes da produção." },
  { titulo: "Produção no ateliê", sub: "Esculpido e pintado à mão em Cajamar, no tom escolhido." },
  { titulo: "Entrega e instalação", sub: "Equipe própria Western instala — sem escavação, direto no deck, laje ou jardim." },
];

/* Entrada suave em scroll: fade + deslize de 18px, uma vez só (ASMR, nada "estoura"). */
function Reveal({ children, delay = 0, className = "" }: { children: ReactNode; delay?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [dentro, setDentro] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setDentro(true);
          io.disconnect();
        }
      },
      { threshold: 0.16, rootMargin: "0px 0px -8% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={ref} style={{ transitionDelay: `${delay}ms` }} className={`una-reveal ${dentro ? "una-reveal--in" : ""} ${className}`}>
      {children}
    </div>
  );
}

/* Linha de voz da marca: Sentient itálico, sempre com a barra. Uma por seção, no máximo. */
function Voz({ children, clara = false }: { children: ReactNode; clara?: boolean }) {
  return (
    <p className={`una-voz text-[19px] leading-snug ${clara ? "text-[#E6DCC6]/75" : "text-[#7E6240]"}`}>{children}</p>
  );
}

const UNA_CSS = `
  .una-root ::selection { background: #B99F84; color: #14262B; }
  .una-voz { font-family: "Sentient", Georgia, serif; font-style: italic; font-weight: 400; }
  .una-reveal { opacity: 0; transform: translateY(18px); transition: opacity .85s ease, transform .85s cubic-bezier(.22,.61,.36,1); }
  .una-reveal--in { opacity: 1; transform: none; }
  .una-kenburns { animation: unaKenburns 18s ease-in-out infinite alternate; transform-origin: 52% 42%; }
  @keyframes unaKenburns { from { transform: scale(1); } to { transform: scale(1.07); } }
  .una-fade { animation: unaFade .6s ease both; }
  @keyframes unaFade { from { opacity: 0; } to { opacity: 1; } }
  .una-zoom { transition: transform .7s cubic-bezier(.22,.61,.36,1); }
  .una-card:hover .una-zoom, .una-card:focus-visible .una-zoom { transform: scale(1.045); }
  @media (prefers-reduced-motion: reduce) {
    .una-reveal { opacity: 1; transform: none; transition: none; }
    .una-kenburns, .una-fade { animation: none; }
    .una-zoom, .una-card:hover .una-zoom { transition: none; transform: none; }
  }
`;

export default function Una() {
  const [tomKey, setTomKey] = useState("moledo");
  const tom = TONS.find((t) => t.key === tomKey) ?? TONS[2];

  useEffect(() => {
    const anterior = document.documentElement.style.scrollBehavior;
    document.documentElement.style.scrollBehavior = "smooth";
    return () => {
      document.documentElement.style.scrollBehavior = anterior;
    };
  }, []);

  return (
    <div className="una-root flex min-h-screen flex-col bg-[#E6DCC6] font-sans text-[#3E5058]">
      <style>{UNA_CSS}</style>
      <Seo
        title="Una Spa — spa de pedra artesanal, by Western"
        description="Concha, borda e assento esculpidos numa única forma contínua. Água aquecida o ano inteiro, hidro, LED e tratamento sem cloro. A partir de R$ 98.000 — varandas, decks e jardins."
        path="/una"
        image="https://westernstore.com.br/una/capa-una.jpg"
      />

      {/* Hero */}
      <div className="relative overflow-hidden bg-[#14262B]">
        <img src="/una/capa-una.jpg" alt="" aria-hidden className="una-kenburns absolute inset-0 h-full w-full object-cover opacity-[.62]" />
        <span className="absolute inset-0 bg-gradient-to-b from-[rgba(20,38,43,.62)] via-[rgba(20,38,43,.18)] to-[rgba(20,38,43,.88)]" />
        <div className="relative mx-auto flex min-h-[92vh] max-w-[1100px] flex-col px-6 md:px-8">
          <div className="flex flex-wrap items-center justify-between gap-4 py-7">
            <img src="/una/logos/cristal-areia.png" alt="Una Spa" className="h-9 w-auto md:h-10" />
            <nav className="flex flex-wrap items-center gap-4 md:gap-6">
              {ANCORAS.map((a) => (
                <a key={a.href} href={a.href} className="hidden text-[15px] font-semibold text-[#E6DCC6]/85 transition-colors hover:text-white md:inline">
                  {a.rotulo}
                </a>
              ))}
              <a href="#contato" className="rounded-[10px] border border-[#E6DCC6]/45 px-5 py-2.5 text-[15px] font-semibold tracking-wide text-[#E6DCC6] transition-colors hover:bg-[#E6DCC6]/10 hover:text-white">
                Quero um UNA
              </a>
            </nav>
          </div>
          <div className="flex flex-1 flex-col justify-center gap-6 pb-24 pt-16">
            <Reveal>
              <span className="text-sm font-semibold uppercase tracking-[.24em] text-[#B99F84]">
                Spa de pedra artesanal · by Western · estreia Expolazer 2026
              </span>
            </Reveal>
            <Reveal delay={110}>
              <h1 className="max-w-[640px] font-display text-[clamp(38px,6vw,64px)] font-[650] leading-[1.06] tracking-[-.02em] text-[#F5EFE2] [text-wrap:pretty]">
                Água, pedra e luz em uma única forma.
              </h1>
            </Reveal>
            <Reveal delay={220}>
              <Voz clara>/ a calma tem forma.</Voz>
            </Reveal>
            <Reveal delay={330}>
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <a href="#contato" className="rounded-[10px] bg-[#B99F84] px-8 py-4 text-[17px] font-bold text-[#14262B] transition-colors hover:bg-[#C9B098]">
                  Quero um UNA
                </a>
                <a href="#peca" className="border-b border-[#E6DCC6]/40 pb-0.5 text-base font-semibold text-[#E6DCC6]/85 transition-colors hover:text-white">
                  Ver a peça de perto
                </a>
              </div>
            </Reveal>
            <Reveal delay={430}>
              <p className="text-[15px] text-[#E6DCC6]/55">3,00 × 2,00 m · até 6 pessoas · a partir de R$ 98.000</p>
            </Reveal>
          </div>
        </div>
      </div>

      {/* A peça */}
      <section id="peca" className="bg-[#E6DCC6]">
        <div className="mx-auto flex max-w-[1100px] flex-col gap-14 px-6 py-24 md:px-8">
          <Reveal className="flex max-w-[680px] flex-col gap-3.5">
            <span className="text-sm font-semibold uppercase tracking-[.18em] text-[#7E6240]">A peça</span>
            <h2 className="font-display text-[clamp(28px,4vw,42px)] font-[650] leading-[1.1] tracking-[-.015em] text-[#1B3640]">
              Esculpido e pintado à mão, peça por peça.
            </h2>
            <p className="text-lg leading-[1.65] [text-wrap:pretty]">
              UNA vem de unidade: concha, borda e assento numa única forma contínua, nascida no mesmo ateliê em Cajamar onde a Western esculpe pedra artesanal desde 1993. Por fora, rocha esculpida e pintada à mão em seis fases. Por dentro, uma concha monolítica revestida em Cristal Pool, acabamento Nassau: o revestimento começa na borda e desce contínuo — parede, banco e fundo numa única superfície, sem juntas, lisa ao toque da água.
            </p>
            <Voz>/ nenhuma peça sai igual. nenhuma tenta.</Voz>
          </Reveal>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {MACROS.map((m, i) => (
              <Reveal key={m.titulo} delay={i * 90}>
                <figure className="una-card relative m-0 min-h-[420px] overflow-hidden rounded-2xl">
                  <img src={m.img} alt={m.alt} loading="lazy" className="una-zoom absolute inset-0 h-full w-full object-cover" />
                  <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-b from-transparent to-[rgba(20,38,43,.82)] px-6 pb-5 pt-20">
                    <p className="text-base font-semibold text-[#E6DCC6]">{m.titulo}</p>
                    <p className="text-[15px] text-[#E6DCC6]/75">{m.sub}</p>
                  </figcaption>
                </figure>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* A água */}
      <section id="agua" className="bg-[#14262B]">
        <div className="mx-auto flex max-w-[1100px] flex-col gap-12 px-6 py-24 md:px-8">
          <Reveal className="flex max-w-[640px] flex-col gap-3.5">
            <span className="text-sm font-semibold uppercase tracking-[.18em] text-[#B99F84]">A água</span>
            <h2 className="font-display text-[clamp(28px,4vw,42px)] font-[650] leading-[1.1] tracking-[-.015em] text-[#F5EFE2]">
              Aquecida o ano inteiro. Sem cheiro de cloro.
            </h2>
            <p className="text-lg leading-relaxed text-[#E6DCC6]/80 [text-wrap:pretty]">
              O banco contínuo — uma única curva que acompanha toda a concha, sem começo nem fim — fica todo submerso. O aquecimento mantém temperatura de spa em qualquer estação e o gerador de ozônio trata a água sem depender de cloro.
            </p>
            <Voz clara>/ quente, limpa, em silêncio.</Voz>
          </Reveal>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <Reveal className="sm:col-span-2">
              <div className="una-card overflow-hidden rounded-2xl">
                <img src="/una/macro-meia-agua-v2.jpg" alt="Linha d'água do Una: o mesmo revestimento granulado segue da borda para dentro da água" loading="lazy" className="una-zoom min-h-[340px] w-full object-cover" />
              </div>
            </Reveal>
            <Reveal delay={90}>
              <div className="una-card overflow-hidden rounded-2xl">
                <img src="/una/macro-vapor.jpg" alt="Vapor da água aquecida ao amanhecer" loading="lazy" className="una-zoom min-h-[300px] w-full object-cover" />
              </div>
            </Reveal>
            <Reveal delay={180}>
              <div className="una-card overflow-hidden rounded-2xl">
                <img src="/una/interna-topo.jpg" alt="Una visto de cima: banco contínuo e poço central sob a água cristalina" loading="lazy" className="una-zoom min-h-[300px] w-full object-cover" />
              </div>
            </Reveal>
            <Reveal className="sm:col-span-2">
              <div className="una-card overflow-hidden rounded-2xl">
                <img src="/una/tatil-agua.jpg" alt="Ondulação suave na água verde-jade encostando na praia granulada da borda" loading="lazy" className="una-zoom min-h-[340px] w-full object-cover" />
              </div>
            </Reveal>
          </div>
          <div className="grid grid-cols-1 gap-px overflow-hidden rounded-[14px] border border-[#E6DCC6]/15 bg-[#E6DCC6]/15 sm:grid-cols-3">
            {[
              { titulo: "Aquecida o ano inteiro", sub: "Dentro ou fora de casa, verão e inverno." },
              { titulo: "Ozônio, sem cloro", sub: "Tratamento de fábrica, água leve na pele." },
              { titulo: "Hidro + luz", sub: "Seis jatos no assento, dois LEDs na água." },
            ].map((f) => (
              <div key={f.titulo} className="bg-[#14262B] px-6 py-6">
                <p className="font-display text-lg font-[650] text-[#E6DCC6]">{f.titulo}</p>
                <p className="text-[15px] leading-normal text-[#E6DCC6]/70">{f.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* O que vem na forma */}
      <section className="bg-[#1B3640]">
        <div className="mx-auto flex max-w-[1100px] flex-col gap-12 px-6 py-24 md:px-8">
          <Reveal className="flex max-w-[640px] flex-col gap-3.5">
            <span className="text-sm font-semibold uppercase tracking-[.18em] text-[#B99F84]">O que vem na forma</span>
            <h2 className="font-display text-[clamp(28px,4vw,42px)] font-[650] leading-[1.1] tracking-[-.015em] text-[#F5EFE2]">Nada é acessório.</h2>
          </Reveal>
          <Reveal delay={120}>
            <div className="grid grid-cols-1 gap-px overflow-hidden rounded-[14px] border border-[#E6DCC6]/15 bg-[#E6DCC6]/15 sm:grid-cols-2 lg:grid-cols-3">
              {FORMA.map((f) => (
                <div key={f.titulo} className="flex flex-col gap-1.5 bg-[#1B3640] p-7">
                  <p className="font-display text-[19px] font-[650] text-[#E6DCC6]">{f.titulo}</p>
                  <p className="text-base leading-normal text-[#E6DCC6]/70">{f.sub}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* Tons */}
      <section id="tons" className="bg-[#E6DCC6]">
        <div className="mx-auto flex max-w-[1100px] flex-col gap-12 px-6 py-24 md:px-8">
          <Reveal className="flex max-w-[680px] flex-col gap-3.5">
            <span className="text-sm font-semibold uppercase tracking-[.18em] text-[#7E6240]">A paleta · cinco tons autorais</span>
            <h2 className="font-display text-[clamp(28px,4vw,42px)] font-[650] leading-[1.1] tracking-[-.015em] text-[#1B3640]">
              O mesmo Una, cinco temperamentos.
            </h2>
            <p className="text-lg leading-relaxed [text-wrap:pretty]">
              Do tom mais luminoso ao mais grave, todos pintados à mão no ateliê. Escolha o seu — ele acompanha o projeto.
            </p>
          </Reveal>
          <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[1.5fr_1fr]">
            <figure className="relative m-0 overflow-hidden rounded-2xl bg-[#D8CDB6]">
              <img
                key={tom.key}
                src={`/una/tons/spa-${tom.key}.jpg`}
                alt={`Una Spa no tom ${tom.nome}`}
                className="una-fade aspect-[4/3] w-full object-cover"
              />
              <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-b from-transparent to-[rgba(20,38,43,.72)] px-6 pb-5 pt-16">
                <p className="font-display text-xl font-[650] text-[#F5EFE2]">{tom.nome}</p>
                <p className="text-[15px] text-[#E6DCC6]/80">{tom.sub}</p>
              </figcaption>
            </figure>
            <div className="flex flex-col gap-2.5" role="tablist" aria-label="Tons do Una">
              {TONS.map((t) => (
                <button
                  key={t.key}
                  type="button"
                  role="tab"
                  aria-selected={t.key === tomKey}
                  onClick={() => setTomKey(t.key)}
                  className={`flex items-center gap-4 rounded-[14px] border-2 bg-white px-4 py-3 text-left transition-all ${
                    t.key === tomKey ? "border-[#B99F84] shadow-[0_6px_18px_rgba(20,38,43,.12)]" : "border-transparent hover:border-[#D8CDB6]"
                  }`}
                >
                  <img src={`/una/tons/tex-${t.key}.webp`} alt="" aria-hidden className="h-12 w-12 shrink-0 rounded-full object-cover" />
                  <span className="flex flex-col">
                    <span className="font-display text-[17px] font-[650] leading-tight text-[#1B3640]">
                      {t.nome}
                      {t.destaque ? <span className="ml-2 rounded-full bg-[#E6DCC6] px-2 py-0.5 text-[11px] font-bold uppercase tracking-[.08em] text-[#7E6240]">mais pedido</span> : null}
                    </span>
                    <span className="text-[14px] leading-snug text-[#6B7A7E]">{t.sub}</span>
                  </span>
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {AMBIENTES.map((a, i) => (
              <Reveal key={a.legenda} delay={i * 90}>
                <figure className="una-card relative m-0 min-h-[340px] overflow-hidden rounded-2xl">
                  <img src={a.img} alt={a.alt} loading="lazy" className="una-zoom absolute inset-0 h-full w-full object-cover" />
                  <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-b from-transparent to-[rgba(20,38,43,.72)] px-5 pb-4 pt-14">
                    <p className="text-[15px] font-semibold text-[#E6DCC6]">{a.legenda}</p>
                  </figcaption>
                </figure>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Visto de perto */}
      <section className="bg-[#F0E8DA]">
        <div className="mx-auto grid max-w-[1100px] grid-cols-1 items-center gap-12 px-6 py-24 md:grid-cols-2 md:px-8">
          <img src="/una/refoto-estande.jpg" alt="Una Spa em exposição no estande Western" loading="lazy" className="min-h-[400px] w-full rounded-2xl object-cover" />
          <div className="flex flex-col gap-4">
            <span className="text-sm font-semibold uppercase tracking-[.18em] text-[#7E6240]">Visto de perto</span>
            <h2 className="font-display text-[clamp(28px,4vw,40px)] font-[650] leading-[1.12] tracking-[-.015em] text-[#1B3640] [text-wrap:pretty]">
              A peça em que a Expolazer entrou.
            </h2>
            <p className="text-lg leading-relaxed [text-wrap:pretty]">
              O Una estreou no estande Western na Expolazer 2026 — e segue em exposição no ateliê, em Cajamar. Se quiser sentir a pedra antes de decidir, é só agendar.
            </p>
            <div>
              <a href={ZAP_VISITA} target="_blank" rel="noreferrer" className="inline-block rounded-[10px] border-[1.5px] border-[#7E6240] px-6 py-3.5 text-base font-semibold text-[#1B3640] transition-colors hover:bg-[#E6DCC6]">
                Agendar visita ao ateliê
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Como funciona */}
      <section id="como" className="bg-[#E6DCC6]">
        <div className="mx-auto flex max-w-[1100px] flex-col gap-11 px-6 py-24 md:px-8">
          <div className="flex max-w-[680px] flex-col gap-3.5">
            <span className="text-sm font-semibold uppercase tracking-[.18em] text-[#7E6240]">Como funciona</span>
            <h2 className="font-display text-[clamp(28px,4vw,42px)] font-[650] leading-[1.1] tracking-[-.015em] text-[#1B3640]">
              Do primeiro oi à água aquecida.
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {PASSOS.map((p, i) => (
              <Reveal key={p.titulo} delay={i * 80}>
                <div className="flex h-full flex-col gap-2 rounded-[14px] bg-white px-7 py-6">
                  <span className="font-display text-[15px] font-[650] tracking-[.08em] text-[#7E6240]">0{i + 1}</span>
                  <p className="text-[17px] font-semibold text-[#1B3640]">{p.titulo}</p>
                  <p className="text-base leading-normal">{p.sub}</p>
                </div>
              </Reveal>
            ))}
          </div>
          <div className="max-w-[860px] rounded-r-[10px] border-l-[3px] border-[#B99F84] bg-white px-7 py-5">
            <p className="text-base leading-relaxed [text-wrap:pretty]">
              <strong className="text-[#1B3640]">Um responsável só, do início ao fim.</strong> Quem fabrica é quem instala: garantia de 1 ano, NF-e e atendimento humano pelo WhatsApp.
            </p>
          </div>
        </div>
      </section>

      {/* Contato */}
      <section id="contato" className="bg-[#F0E8DA]">
        <div className="mx-auto grid max-w-[1100px] grid-cols-1 items-center gap-14 px-6 py-24 md:grid-cols-2 md:px-8">
          <div className="flex flex-col gap-5">
            <img src="/una/logos/cristal-petroleo.png" alt="Una Spa, interior Cristal Pool" className="w-[260px]" />
            <h2 className="font-display text-[clamp(28px,4vw,40px)] font-[650] leading-[1.12] tracking-[-.015em] text-[#1B3640] [text-wrap:pretty]">
              A partir de R$ 98.000, direto do ateliê.
            </h2>
            <p className="text-lg leading-relaxed [text-wrap:pretty]">
              Cada Una é produzido por encomenda, no acabamento e na configuração do seu projeto. Conte onde ele vai viver e o time responde no mesmo dia útil — sem fila, sem robô.
            </p>
            <p className="text-[15px] leading-normal text-[#6B7A7E]">
              O valor não inclui frete e instalação — cotados por projeto, para o seu endereço.
            </p>
            <ul className="m-0 flex list-none flex-col gap-2.5 p-0">
              {["Orçamento e prazo direto do ateliê", "Projeto aprovado em render 3D antes da produção", "Instalação com equipe própria Western"].map((li) => (
                <li key={li} className="flex gap-2.5 text-base">
                  <span className="font-bold text-[#B99F84]">—</span>
                  {li}
                </li>
              ))}
            </ul>
          </div>
          <div className="flex flex-col gap-4 rounded-[18px] bg-[#1B3640] px-10 py-11">
            <p className="font-display text-[26px] font-[650] tracking-[-.01em] text-[#F5EFE2]">Quero um UNA.</p>
            <p className="text-base leading-relaxed text-[#E6DCC6]/80">
              A conversa segue no WhatsApp oficial da Western — a mensagem já vai montada.
            </p>
            <a href={ZAP_QUERO} target="_blank" rel="noreferrer" className="rounded-[10px] bg-[#B99F84] px-7 py-4 text-center text-[17px] font-bold text-[#14262B] transition-colors hover:bg-[#C9B098]">
              Quero um UNA
            </a>
            <a href={ZAP_VISITA} target="_blank" rel="noreferrer" className="rounded-[10px] border-[1.5px] border-[#E6DCC6]/45 px-7 py-3.5 text-center text-base font-semibold text-[#E6DCC6] transition-colors hover:bg-[#E6DCC6]/10">
              Prefiro ver de perto — agendar visita
            </a>
            <p className="text-sm leading-normal text-[#E6DCC6]/60">
              WhatsApp (11) 95896-7088 · resposta no mesmo dia útil. Usamos seus dados só para este atendimento.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#14262B]">
        <div className="mx-auto flex max-w-[1100px] flex-wrap items-center justify-between gap-7 px-6 py-14 md:px-8">
          <div className="flex items-center gap-5">
            <img src="/una/logos/simbolo-areia.png" alt="" aria-hidden className="h-11 w-auto" />
            <div className="flex flex-col gap-0.5">
              <span className="text-sm font-semibold uppercase tracking-[.16em] text-[#E6DCC6]/70">Una Spa · um produto do ateliê</span>
              <span className="text-sm text-[#E6DCC6]/50">Rua Colina, 38 — Jardim Paraíso · Cajamar/SP</span>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-6">
            <a href="/unaparceiros" className="text-sm font-semibold text-[#E6DCC6]/70 transition-colors hover:text-white">
              Sou arquiteto ou lojista → Una para parceiros
            </a>
            <img src="/una/logos/western-branco.png" alt="Western" className="h-[26px] w-auto opacity-85" />
            <span className="text-sm text-[#E6DCC6]/50">Ateliê próprio desde 1993 · @westernpools</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
