import Seo from "@/components/seo/Seo";

/**
 * /unaparceiros — o Una Spa para o parceiro B2B (arquiteto, paisagista, lojista).
 *
 * Página standalone (fora do SiteLayout), na paleta da loja (verde/ivory).
 * Não aparece em nenhum menu — chega por link direto do time comercial.
 * A porta B2C correspondente é /una.
 */

const WHATS = "https://wa.me/5511958967088";
const ZAP_ESPECIFICAR = `${WHATS}?text=${encodeURIComponent("Sou parceiro e quero especificar o UNA Spa em um projeto.")}`;
const ZAP_VISITA = `${WHATS}?text=${encodeURIComponent("Sou parceiro e quero agendar uma visita para ver o UNA Spa no ateliê.")}`;

const STATS = [
  { valor: "20%", sub: "de comissão para o parceiro que especifica" },
  { valor: "3,00 × 2,00 m", sub: "cabe em varanda, deck, cobertura e laje" },
  { valor: "5 acabamentos", sub: "pintados à mão, peça por peça" },
  { valor: "Render 3D", sub: "aprovação do cliente antes da produção" },
];

const FICHA = [
  { titulo: "Concha monolítica", sub: "Borda orgânica e assento esculpidos na própria peça — nada é acessório." },
  { titulo: "Escada em lajes de pedra", sub: "Três lajes esculpidas em cascata acompanham o conjunto." },
  { titulo: "Dimensões", sub: "C 3,00 × L 2,00 × A 0,95 m — varandas, decks, coberturas e jardins compactos." },
  { titulo: "Até 6 pessoas", sub: "Assento contínuo modelado na concha." },
  { titulo: "6 pontos de hidro · 50 mm", sub: "Distribuídos no assento." },
  { titulo: "2 LEDs RGB · inox 316", sub: "Luz subaquática, cor à escolha do cliente." },
  { titulo: "Água aquecida", sub: "Temperatura de spa o ano inteiro, dentro ou fora de casa." },
  { titulo: "Tratamento sem cloro", sub: "Gerador de ozônio de fábrica." },
  { titulo: "Automação Sync", sub: "Comando por voz — Alexa e Google Home." },
  { titulo: "Interior Cristal Pool", sub: "Revestimento monolítico Nassau, contínuo ao toque da água." },
];

const TONS = ["Quartzo", "Arenito", "Moledo · mais pedido", "Granito", "Carbono"];

const DETALHES = [
  { img: "/una/macro-degraus.jpg", alt: "Escada em lajes de pedra em cascata", legenda: "A escada em cascata" },
  { img: "/una/macro-jato.jpg", alt: "Hidrojato em funcionamento sob a água", legenda: "Hidro de 50 mm" },
  { img: "/una/macro-led.jpg", alt: "LED subaquático aceso", legenda: "LED em inox 316" },
  { img: "/una/macro-borda.jpg", alt: "Transição da casca esculpida para a praia da borda", legenda: "A borda pintada à mão" },
];

const PASSOS = [
  { titulo: "Indicação", sub: "Você apresenta o Una ao cliente e passa o contato ao time Western." },
  { titulo: "Projeto e render 3D", sub: "Consultoria e render gratuitos — você e o cliente aprovam antes da produção." },
  { titulo: "Produção no ateliê", sub: "Esculpido e pintado à mão em Cajamar, no acabamento escolhido." },
  { titulo: "Instalação e comissão", sub: "Equipe própria instala; sua comissão de 20% é paga na conclusão da venda." },
];

export default function UnaParceiros() {
  return (
    <div className="flex min-h-screen flex-col bg-[#FBF8F3] font-sans text-[17px] text-[#0F2918]">
      <Seo
        title="Una Spa para parceiros — especifique com 20% de comissão | Western Store"
        description="Spa de pedra artesanal para o seu projeto: 3,00 × 2,00 m, 5 acabamentos pintados à mão, render 3D e instalação com equipe própria. Preço de parceiro sob consulta e 20% de comissão."
        path="/unaparceiros"
        image="https://westernstore.com.br/una/capa-una.jpg"
      />

      {/* Topbar */}
      <div className="border-b border-[#E7DFCE] bg-white">
        <div className="mx-auto flex max-w-[1200px] items-center justify-between gap-6 px-6 py-4 md:px-8">
          <img src="/una/logos/western-verde.png" alt="Western" className="h-8 w-auto" />
          <nav className="flex items-center gap-4 md:gap-6">
            <a href="#specs" className="hidden text-base text-[#5A6B62] transition-colors hover:text-[#0F2918] sm:inline">Ficha técnica</a>
            <a href="#parceria" className="hidden text-base text-[#5A6B62] transition-colors hover:text-[#0F2918] sm:inline">Como funciona</a>
            <a href="#estande" className="hidden text-base text-[#5A6B62] transition-colors hover:text-[#0F2918] md:inline">Ver de perto</a>
            <a href="#parceiro" className="rounded-[10px] bg-[#1B3C26] px-5 py-3 text-base font-semibold text-[#F2EDDF] transition-colors hover:bg-[#14301D]">
              Especificar o UNA
            </a>
          </nav>
        </div>
      </div>

      {/* Hero */}
      <div className="bg-[#FBF8F3]">
        <div className="mx-auto max-w-[1200px] px-6 pt-5 md:px-8">
          <p className="text-[15px] text-[#5A6B62]">
            Western Store · Linhas · <strong className="font-semibold text-[#0F2918]">Una Spa</strong>
          </p>
        </div>
        <div className="mx-auto grid max-w-[1200px] grid-cols-1 items-center gap-12 px-6 pb-20 pt-10 md:grid-cols-2 md:px-8">
          <div className="relative min-h-[460px] overflow-hidden rounded-2xl">
            <img src="/una/capa-una.jpg" alt="Una Spa — peça real fotografada no estande Western" className="absolute inset-0 h-full w-full object-cover" />
            <span className="absolute left-5 top-5 rounded-md bg-[#F0E8DA] px-3.5 py-1.5 text-sm font-semibold uppercase tracking-wider text-[#7E6240]">
              Estreia Expolazer 2026
            </span>
          </div>
          <div className="flex flex-col gap-5">
            <span className="text-sm font-semibold uppercase tracking-[.14em] text-[#7E6240]">Spa de pedra artesanal · linha pronta</span>
            <img src="/una/logos/cristal-petroleo.png" alt="Una Spa, interior Cristal Pool" className="w-[300px] max-w-full" />
            <p className="text-[19px] leading-relaxed text-[#31463A] [text-wrap:pretty]">
              Concha, borda e assento esculpidos numa única forma contínua, pintada à mão no ateliê de Cajamar — com a escada em lajes de pedra que acompanha a peça. Por dentro, revestimento monolítico Nassau, da Cristal Pool. A peça que segura o projeto — e a margem.
            </p>
            <div className="flex flex-col gap-3 rounded-xl border-[1.5px] border-[#E7DFCE] bg-white px-6 py-5">
              <div className="flex items-baseline justify-between gap-3">
                <span className="text-base font-semibold">Preço de parceiro</span>
                <span className="text-base text-[#5A6B62]">sob consulta</span>
              </div>
              <span className="h-px bg-[#E7DFCE]" />
              <div className="flex items-baseline justify-between gap-3">
                <span className="text-base font-semibold">Comissionamento</span>
                <span className="font-display text-2xl font-[650] text-[#1B3C26]">20%</span>
              </div>
              <p className="text-[15px] leading-normal text-[#5A6B62]">
                Tabela e condições liberadas após credenciamento — cadastro com CNPJ, aprovação automática.
              </p>
            </div>
            <div className="flex flex-wrap gap-3.5">
              <a href="#parceiro" className="min-w-[200px] flex-1 rounded-[10px] bg-[#1B3C26] px-6 py-4 text-center text-[17px] font-bold text-[#F2EDDF] transition-colors hover:bg-[#14301D]">
                Especificar o UNA
              </a>
              <a href="#specs" className="rounded-[10px] border-[1.5px] border-[#B9B09C] px-6 py-4 text-center text-[17px] font-semibold transition-colors hover:bg-[#F7F3EE]">
                Ficha técnica
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="bg-[#0F2918]">
        <div className="mx-auto grid max-w-[1200px] grid-cols-2 gap-9 px-6 py-16 md:px-8 lg:grid-cols-4">
          {STATS.map((s) => (
            <div key={s.valor} className="flex flex-col gap-1">
              <span className="font-display text-3xl font-[650] text-[#F2EDDF]">{s.valor}</span>
              <span className="text-base text-[#F2EDDF]/70">{s.sub}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Ficha técnica */}
      <section id="specs" className="bg-[#FBF8F3]">
        <div className="mx-auto flex max-w-[1200px] flex-col gap-10 px-6 py-[88px] md:px-8">
          <div className="flex max-w-[720px] flex-col gap-2.5">
            <span className="text-sm font-semibold uppercase tracking-[.14em] text-[#7E6240]">Ficha técnica</span>
            <h2 className="font-display text-[clamp(26px,3.5vw,38px)] font-[650] leading-[1.12] tracking-[-.015em]">O que o seu cliente recebe.</h2>
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {FICHA.map((f) => (
              <div key={f.titulo} className="flex flex-col gap-1 rounded-[10px] bg-white px-6 py-6 shadow-[0_1px_3px_rgba(15,41,24,.08)]">
                <p className="text-[17px] font-semibold">{f.titulo}</p>
                <p className="text-base leading-normal text-[#5A6B62]">{f.sub}</p>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap gap-3">
            {TONS.map((t) => (
              <span
                key={t}
                className={
                  t.includes("Moledo")
                    ? "rounded-full bg-[#1B3C26] px-[18px] py-2 text-[15px] font-semibold text-[#F2EDDF]"
                    : "rounded-full bg-[#F0E8DA] px-[18px] py-2 text-[15px] font-semibold text-[#0F2918]"
                }
              >
                {t}
              </span>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {DETALHES.map((d) => (
              <figure key={d.legenda} className="relative m-0 min-h-[280px] overflow-hidden rounded-xl">
                <img src={d.img} alt={d.alt} loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
                <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-b from-transparent to-[rgba(15,41,24,.78)] px-4 pb-3.5 pt-12">
                  <p className="text-sm font-semibold text-[#F2EDDF]">{d.legenda}</p>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* Para o parceiro */}
      <section id="parceria" className="border-y border-[#E7DFCE] bg-[#F7F3EE]">
        <div className="mx-auto flex max-w-[1200px] flex-col gap-11 px-6 py-[88px] md:px-8">
          <div className="flex max-w-[760px] flex-col gap-2.5">
            <span className="text-sm font-semibold uppercase tracking-[.14em] text-[#7E6240]">Para o parceiro</span>
            <h2 className="font-display text-[clamp(26px,3.5vw,38px)] font-[650] leading-[1.12] tracking-[-.015em]">
              Você especifica. O ateliê executa. Você recebe 20%.
            </h2>
            <p className="text-lg leading-relaxed text-[#31463A] [text-wrap:pretty]">
              O Una entra no seu projeto como peça de paisagismo, não como obra de piscina: sem escavação, direto sobre deck, laje ou jardim. <strong className="text-[#0F2918]">O cliente continua sendo seu</strong> — a Western entra como fábrica, entrega e instalação, e a comissão é sua.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {PASSOS.map((p, i) => (
              <div key={p.titulo} className="flex flex-col gap-2 rounded-[10px] bg-white px-7 py-6 shadow-[0_1px_3px_rgba(15,41,24,.08)]">
                <span className="font-display text-[15px] font-[650] tracking-[.08em] text-[#7E6240]">0{i + 1}</span>
                <p className="text-[17px] font-semibold">{p.titulo}</p>
                <p className="text-base leading-normal text-[#5A6B62]">{p.sub}</p>
              </div>
            ))}
          </div>
          <div className="max-w-[860px] rounded-r-[10px] border-l-[3px] border-[#A68764] bg-white px-7 py-5">
            <p className="text-base leading-relaxed text-[#31463A] [text-wrap:pretty]">
              <strong className="text-[#0F2918]">Garantia de 1 ano e um responsável só.</strong> Quem fabrica é quem instala — custo, prazo e responsabilidade num time único, com NF-e e atendimento humano pelo WhatsApp.
            </p>
          </div>
        </div>
      </section>

      {/* Estande */}
      <section id="estande" className="bg-[#FBF8F3]">
        <div className="mx-auto grid max-w-[1200px] grid-cols-1 items-center gap-12 px-6 py-[88px] md:grid-cols-2 md:px-8">
          <img src="/una/refoto-estande.jpg" alt="Una Spa no estande Western na Expolazer 2026" loading="lazy" className="min-h-[400px] w-full rounded-2xl object-cover" />
          <div className="flex flex-col gap-4">
            <span className="text-sm font-semibold uppercase tracking-[.14em] text-[#7E6240]">Visto na Expolazer 2026</span>
            <h2 className="font-display text-[clamp(26px,3.5vw,38px)] font-[650] leading-[1.12] tracking-[-.015em]">A peça em que a feira entrou.</h2>
            <p className="text-lg leading-relaxed text-[#31463A] [text-wrap:pretty]">
              O Una estreou no estande Western Pools na Expolazer 2026 e segue em exposição no ateliê. Parceiros agendam visita para ver — e entrar — na peça antes de especificar.
            </p>
            <p className="text-base leading-relaxed text-[#5A6B62]">Projetos Western em: Hotel Rosewood · All Resort Porto Belo · Cobasi</p>
            <div>
              <a href={ZAP_VISITA} target="_blank" rel="noreferrer" className="inline-block rounded-[10px] border-[1.5px] border-[#B9B09C] px-6 py-3.5 text-base font-semibold transition-colors hover:bg-[#F7F3EE]">
                Agendar visita ao ateliê
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* CTA parceiro */}
      <section id="parceiro" className="bg-[#0F2918]">
        <div className="mx-auto grid max-w-[1200px] grid-cols-1 items-center gap-14 px-6 py-24 md:grid-cols-2 md:px-8">
          <div className="flex flex-col gap-4">
            <img src="/una/logos/cristal-areia.png" alt="Una Spa" className="w-[250px] max-w-full" />
            <h2 className="font-display text-[clamp(26px,3.5vw,38px)] font-[650] leading-[1.12] tracking-[-.015em] text-[#F2EDDF] [text-wrap:pretty]">
              Leve o Una para o seu próximo projeto.
            </h2>
            <p className="text-lg leading-relaxed text-[#F2EDDF]/[.78] [text-wrap:pretty]">
              Preço de parceiro, condições e material de especificação liberados após o credenciamento. Já é parceiro Western? É só chamar no WhatsApp.
            </p>
          </div>
          <div className="flex flex-col gap-4 rounded-2xl bg-white px-9 py-10">
            <p className="font-display text-2xl font-[650] tracking-[-.01em]">Especificar o UNA.</p>
            <p className="text-base leading-normal text-[#5A6B62]">
              Fale com o time comercial — resposta no mesmo dia útil, orçamento direto do ateliê.
            </p>
            <a href={ZAP_ESPECIFICAR} target="_blank" rel="noreferrer" className="rounded-[10px] bg-[#1B3C26] px-7 py-4 text-center text-[17px] font-bold text-[#F2EDDF] transition-colors hover:bg-[#14301D]">
              Especificar pelo WhatsApp
            </a>
            <a href="/parceiro/cadastro" className="rounded-[10px] border-[1.5px] border-[#B9B09C] px-7 py-3.5 text-center text-base font-semibold transition-colors hover:bg-[#F7F3EE]">
              Ainda não é parceiro? Credencie-se
            </a>
            <p className="text-sm leading-normal text-[#8C9A8E]">WhatsApp (11) 95896-7088 · cadastro com CNPJ, aprovação automática.</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#F2EDDF]/[.14] bg-[#0F2918]">
        <div className="mx-auto flex max-w-[1200px] flex-wrap items-center justify-between gap-5 px-6 py-10 md:px-8">
          <img src="/una/logos/western-branco.png" alt="Western" className="h-[26px] w-auto opacity-90" />
          <div className="flex flex-wrap items-center gap-6">
            <a href="/una" className="text-sm font-semibold text-[#F2EDDF]/70 transition-colors hover:text-white">
              Página do cliente final → /una
            </a>
            <span className="text-sm text-[#F2EDDF]/55">Ateliê próprio desde 1993 · Cajamar/SP · (11) 4448-2918 · @westernpools</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
