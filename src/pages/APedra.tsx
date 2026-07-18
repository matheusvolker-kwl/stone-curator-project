import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

import Seo from "@/components/seo/Seo";
import Reveal from "@/components/shared/Reveal";

/* Hero = A PEDRA em close, na borda da piscina (dono, 2026-07-18). A obra-real
   de antes não comunicava o assunto da página; a primeira troca (02_pedra-detalhe)
   tinha só 733px e borrava esticada. Esta vem do molde-macro upscalado por IA
   (1600×1200 → 4096×3072, ByteDance) e recortado em faixa wide: 2400×1348.
   A peça É o argumento de "É pedra de verdade". */
import heroPedra from "@/assets/a-pedra/hero-pedra-macro.webp";
import moldeMacro from "@/assets/a-pedra/molde-macro-close.webp";
import cascaInclinada from "@/assets/a-pedra/casca-inclinada.webp";
import ocoGas2009 from "@/assets/a-pedra/oco-gas-2009.webp";
import endSubmersa from "@/assets/a-pedra/end-submersa.webp";
import quadriplex3d from "@/assets/a-pedra/quadriplex-3d.webp";
import quadriplexObra from "@/assets/a-pedra/quadriplex-obra.webp";
import pisavelDesk from "@/assets/a-pedra/pisavel.webp";
import perfuravel from "@/assets/a-pedra/perfuravel.webp";

/**
 * /a-pedra — a página do ARGUMENTO. O nó ANTES da bifurcação
 * (profissional × casa).
 *
 * ---------------------------------------------------------------------------
 * O EIXO — ALTERNATIVA, não redenção.
 * ---------------------------------------------------------------------------
 * Ninguém errou ao usar pedra natural. A Western não precisa que a outra
 * esteja errada para estar certa. Nenhuma frase-chave tem sujeito humano — a
 * física é descrita sobre a PEDRA. A natural aparece como medida de
 * comparação, nunca como erro.
 *
 * ---------------------------------------------------------------------------
 * A VERSÃO "FICHA DE PROVAS" (2026-07-18, escolha do dono entre 3 propostas).
 * ---------------------------------------------------------------------------
 * A v2 tinha 8 seções editoriais e media ~12.000px (~25 telas). O dono: "o
 * objetivo é convencimento fácil e simples de confiança; o conteúdo é muito
 * bom, mas cansa; não quero FAQ". Esta versão inverte o formato: as dúvidas
 * reais viram TÍTULOS e cada uma é respondida em duas linhas com uma foto
 * pequena de prova ao lado. ~6 telas. As fotos grandes de endereço e a
 * narrativa de família saíram — o acervo continua em /obras e /sobre.
 *
 * NÃO é FAQ: nada colapsa, não há JSON-LD FAQPage (que mora em /faq), e cada
 * bloco é afirmação com prova visual — não lista de perguntas.
 *
 * ---------------------------------------------------------------------------
 * GUARDAS DE CONTEÚDO que sobrevivem a qualquer layout — não viole:
 * ---------------------------------------------------------------------------
 * · A PEÇA NÃO É MAIS BARATA que pedra natural. O que cai ≥30% é a OBRA.
 *   Três versões erradas já foram publicadas e removidas.
 * · RENDER NUNCA é apresentado como foto. O rótulo é parte do argumento.
 * · A submersa prova PRESENÇA (a alga é real). NÃO prova duração — nenhuma
 *   legenda afirma duração.
 * · A foto do furo mostra peça CRUA, branca, sem pintura: a legenda NOMEIA
 *   isso, senão ela lê gesso e sabota o argumento de realismo.
 * · A forense de 2009 (registro de gás) exibida pequena — documento grande
 *   vira publicidade. E não se escreve "17 anos e continua lá": o carimbo
 *   prova a DATA da foto, não a permanência.
 * · REGRA DO DONO (tons por geologia): UMA frase declarativa, sem CTA, sem
 *   bloco próprio. Capacidade gera admiração; oferta emperra a produção.
 * · SEM imagem de fundo no CTA final: o arquivo "cover-cascata.webp" é o
 *   retrato de imprensa do Caito Maia — NÃO reintroduza sem abrir o arquivo.
 * · Não reescreva esta página a partir de suposições sobre o acervo: ABRA A
 *   PASTA (já custou uma investigação inteira).
 * · SEM barra sticky: isto é uma prova, não um checkout.
 * ---------------------------------------------------------------------------
 */

/** A ficha: pergunta real → resposta em 2 linhas → prova fotográfica pequena. */
const PROVAS = [
  {
    img: moldeMacro,
    alt: "Close de uma pedra Western na prainha: grão de areia, sedimentos e vincos herdados da rocha original.",
    pergunta: "Parece de verdade?",
    resposta:
      "O molde sai de uma pedra natural, no lugar onde ela está. Grão, sedimentos e vincos vêm da rocha — e a rocha continua onde estava.",
    meta: "“A três metros de distância, nem o nosso fundador acerta qual é qual.”",
  },
  {
    img: pisavelDesk,
    alt: "Uma pessoa em pé, de mãos nos bolsos, sobre o lábio de uma cascata Western, com a água caindo por baixo dos pés.",
    pergunta: "Aguenta pisar?",
    resposta: "Suporta uma pessoa em cima. Não é casca: é estrutura.",
    meta: "Uma pessoa em pé no lábio da cascata, com a água caindo por baixo.",
  },
  {
    img: cascaInclinada,
    alt: "Dois homens inclinando uma peça Western em obra: a cavidade interna à mostra e a parede com a espessura de um dedo.",
    pergunta: "É oca — não quebra?",
    resposta:
      "Cimento estrutural com fibra de PET reciclado: mais resistente a impacto que a pedra natural, frágil a fissuras laterais.",
    meta: "A parede tem a espessura de um dedo.",
  },
  {
    img: endSubmersa,
    alt: "Pedras Western dentro de água limpa, com pátina de alga na linha da lâmina.",
    pergunta: "Pode ficar na água?",
    resposta: "Resiste a cloro, sol, chuva e variação térmica — dentro e fora da piscina.",
    meta: "Peça submersa, com pátina de alga na linha da lâmina.",
  },
  {
    img: perfuravel,
    alt: "Funcionário Western de capacete furando uma pedra com martelete em obra. A peça ainda está crua, sem pintura.",
    pergunta: "Pode furar?",
    resposta: "Fura com furadeira comum para passar fiação — e não trinca.",
    meta: "Peça ainda crua, sem pintura, furada em obra.",
  },
  {
    img: ocoGas2009,
    alt: "Casca de pedra Western levantada no gramado, revelando registro de gás, mangueiras e caixa elétrica embaixo.",
    pergunta: "E a manutenção?",
    resposta:
      "O vazio é onde o trabalho passa: fiação, tubulação, bomba, LED. A pedra levanta — sem demolição.",
    meta: "Registro de gás e caixa elétrica sob a pedra. Foto de obra, 2009.",
  },
];

export default function APedra() {
  return (
    <>
      <Seo
        title="A pedra Western — nasce da pedra real, pesa 10× menos"
        description="Réplica autoral moldada de pedra natural no local, em composto mineral com PET reciclado. 280 kg onde a natural pesa quase 3 toneladas. Bloco 3D no SketchUp antes de comprar."
        path="/a-pedra"
        ogType="article"
      />

      {/* ==================================================================
          HERO — foto de obra real, mais curto que a v2 (a página agora é
          ficha, não epopeia). SEM Reveal: é o LCP — a dobra abria em branco
          esperando hidratação. Scrim direcional: escuro na coluna esquerda
          onde o texto vive, limpo à direita onde a pedra é o assunto.
          ================================================================== */}
      <section className="relative h-[70vh] md:h-[56vh] w-full overflow-hidden">
        <img
          src={heroPedra}
          alt="Pedra Western na borda de uma piscina, sobre areia clara — textura e grão herdados da rocha real."
          loading="eager"
          fetchPriority="high"
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover"
        />
        {/* Scrim redesenhado (dono: "não dá leitura"): antes eram dois gradientes
            empilhados (0.92→0.78→0.50 na horizontal + 0.30/0.45 na vertical) que
            escureciam o quadro TODO. Agora protege só onde o texto vive — o
            rodapé — e uma tinta leve à esquerda; o resto da pedra fica visível. */}
        <div
          className="absolute inset-0 pointer-events-none"
          aria-hidden
          style={{
            background:
              "linear-gradient(180deg, transparent 28%, hsl(var(--western-green-deep) / 0.58) 58%, hsl(var(--western-green-deep) / 0.93) 100%)",
          }}
        />
        <div
          className="absolute inset-0 pointer-events-none"
          aria-hidden
          style={{
            background:
              "linear-gradient(100deg, hsl(var(--western-green-deep) / 0.80) 0%, hsl(var(--western-green-deep) / 0.42) 42%, transparent 72%)",
          }}
        />
        <div className="container-western relative h-full flex flex-col justify-end pb-10">
          <div>
            <p className="text-eyebrow text-western-gold-soft mb-3">A pedra Western</p>
            <h1 className="display-xl text-western-cream">
              É pedra de verdade.
              <br />
              {/* gold-soft, NÃO bronze: sobre foto/verde o acento do DS é o
                  dourado claro (o eyebrow acima já usa). O bronze é acento de
                  fundo CLARO — sobre a pedra clara ficava ilegível (dono). */}
              <span className="inline-block text-western-gold-soft [text-wrap:balance]">
                Leve o bastante para carregar na mão.
              </span>
            </h1>
            <p className="text-meta text-western-cream-muted/80 mt-5 max-w-[52ch]">
              As pedras desta foto foram moldadas de rocha real. E fabricadas em Cajamar.
            </p>
          </div>
        </div>
      </section>

      {/* ==================================================================
          OS 3 FATOS — a página inteira em uma linha. Quem só ler isto já
          entendeu o produto.
          ================================================================== */}
      <section className="surface-paper py-10 md:py-12">
        <div className="container-western">
          <Reveal variant="fade-up" duration={700}>
            <div className="grid md:grid-cols-3 gap-6 md:gap-10">
              {[
                ["Molde de rocha real", "A textura não é desenhada — é herdada."],
                ["Oca por dentro, estrutura", "Cimento com fibra de PET reciclado."],
                ["Cerca de 10% do peso", "280 kg onde a natural pesa quase 3 t."],
              ].map(([t, s], i) => (
                <div key={t} className="flex gap-4 items-start">
                  <span className="font-sans text-[15px] font-semibold tabular-nums text-western-bronze pt-0.5">
                    0{i + 1}
                  </span>
                  <div>
                    <h2 className="text-title-sm">{t}</h2>
                    <p className="text-meta mt-1">{s}</p>
                  </div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ==================================================================
          A FICHA DE PROVAS — as dúvidas reais viram títulos; cada resposta
          tem 2 linhas e uma foto pequena de prova. Formato aprovado pelo
          dono (V1 entre 3 propostas, 18/07).
          ================================================================== */}
      <section className="surface-ivory py-12 md:py-16 border-t border-western-border-soft">
        <div className="container-western">
          <Reveal variant="fade-up" duration={700}>
            <div className="max-w-[52ch]">
              <p className="text-eyebrow mb-3">As provas</p>
              <h2 className="display-lg text-western-green-deep">
                As perguntas que todo mundo faz — respondidas com foto.
              </h2>
            </div>
          </Reveal>
          <div className="mt-10 grid gap-x-10 gap-y-10 md:grid-cols-2">
            {PROVAS.map(({ img, alt, pergunta, resposta, meta }, i) => (
              <Reveal key={pergunta} variant="fade-up" duration={700} delay={(i % 2) * 80}>
                <article className="flex gap-5 items-start">
                  <img
                    src={img}
                    alt={alt}
                    loading="lazy"
                    decoding="async"
                    className="w-[132px] md:w-[150px] aspect-[3/4] object-cover rounded-xl shrink-0"
                  />
                  <div className="min-w-0">
                    <h3 className="text-title-sm">{pergunta}</h3>
                    <p className="text-body mt-2">{resposta}</p>
                    <p className="text-meta mt-2.5">{meta}</p>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ==================================================================
          O NÚMERO + O 3D — os dois argumentos de negócio, lado a lado.
          As barras dividem a MESMA régua: a comparação é geométrica antes
          de ser numérica. ⚠ A peça não é mais barata — a OBRA cai ≥30%.
          ================================================================== */}
      <section className="surface-paper py-12 md:py-16 border-t border-western-border-soft">
        <div className="container-western grid gap-12 lg:grid-cols-2 lg:gap-16 items-start">
          <Reveal variant="fade-up" duration={700}>
            <div>
              <p className="text-eyebrow mb-3">O número</p>
              <p className="display-stat text-western-green-deep">280 kg</p>
              <div className="mt-2 h-3 rounded-[2px] bg-western-gold w-[10%]" aria-hidden />
              <p className="display-stat text-western-stone-warm mt-5">quase 3 t</p>
              <div className="mt-2 h-3 rounded-[2px] bg-western-stone-warm w-full" aria-hidden />
              <p className="text-meta mt-3">
                A maior cascata da linha × a mesma peça em pedra natural.
              </p>
              <p className="text-body mt-5 max-w-[48ch]">
                A peça em si não é mais barata que pedra natural. A obra é: instalação,
                transporte e mão de obra caem no mínimo 30%. Desce de caminhão comum na mão,
                entra por onde as pessoas entram e fixa com argamassa AC3 de loja de bairro.
              </p>
            </div>
          </Reveal>

          <Reveal variant="fade-up" delay={100} duration={700}>
            <div>
              <p className="text-eyebrow mb-3">O projeto antes da obra</p>
              {/* Duas VISTAS do mesmo quarto (luz de render × luz de dia). A
                  legenda NOMEIA a âncora (espelho + biombo + paredão) — sem
                  ela o olho procura sozinho, não acha, e lê mismatch. */}
              <figure className="bg-white border border-western-border-soft rounded-xl overflow-hidden">
                <div className="grid grid-cols-2 gap-px bg-western-border-soft">
                  <div className="bg-white">
                    <img
                      src={quadriplex3d}
                      alt="Render do quarto: paredão de rocha, espelho arqueado dourado e biombo de vareta contra o painel ripado."
                      loading="lazy"
                      decoding="async"
                      className="w-full aspect-square object-cover"
                    />
                    <figcaption className="text-meta px-4 py-2.5">Projeto 3D · render</figcaption>
                  </div>
                  <div className="bg-white">
                    <img
                      src={quadriplexObra}
                      alt="Foto do mesmo quarto construído: o mesmo paredão, espelho e biombo, em obra entregue."
                      loading="lazy"
                      decoding="async"
                      className="w-full aspect-square object-cover"
                    />
                    <figcaption className="text-meta px-4 py-2.5">A obra construída · foto</figcaption>
                  </div>
                </div>
                <figcaption className="text-meta border-t border-western-border-soft px-4 py-2.5">
                  O mesmo quarto: o mesmo espelho arqueado, o mesmo biombo, o mesmo paredão —
                  do projeto à obra entregue.
                </figcaption>
              </figure>
              <p className="text-body mt-4 max-w-[48ch]">
                Toda peça tem bloco 3D no SketchUp — você monta a composição, valida com o
                cliente e só compra depois de aprovado.{" "}
                <span className="font-semibold text-western-bronze">+300 mil downloads.</span>
              </p>
              {/* Quem faz, em duas linhas — a história completa vive em /sobre.
                  A frase dos tons é a REGRA DO DONO: declarativa, sem CTA. */}
              <p className="text-meta mt-3 max-w-[52ch]">
                Ateliê próprio em Cajamar/SP desde 1993 · pintado à mão, peça por peça ·
                Cristal Pool e Genesis compram há mais de duas décadas. O ateliê desenvolve
                tons conforme a geologia da região de cada projeto.
              </p>
              <Link
                to="/obras"
                className="tap-target mt-5 inline-flex items-center gap-1.5 font-sans text-base font-semibold text-western-green-deep hover:text-western-cta transition-colors"
              >
                Ver obras entregues
                <ArrowRight className="h-5 w-5" strokeWidth={1.75} aria-hidden />
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ==================================================================
          CTA — a bifurcação, DEPOIS da prova. Forest liso, sem imagem de
          fundo (ver guarda no topo do arquivo).
          ================================================================== */}
      <section className="surface-forest py-12 md:py-14">
        <div className="container-western">
          <Reveal variant="fade-up" duration={700}>
            <div>
              <h2 className="display-md text-western-cream max-w-xl">
                Sinta a textura antes de escolher.
              </h2>
              <p className="text-body text-western-cream-muted mt-3 max-w-[52ch]">
                A Western Box leva os quatro acabamentos até a sua mesa — Moledo, Arenito,
                Granito e Quartzo.
              </p>
              <div className="mt-6 flex flex-col md:flex-row md:items-center gap-3">
                <Link to="/western-box" className="btn-gold w-full md:w-auto">
                  Receber as amostras
                  <ArrowRight className="h-5 w-5" strokeWidth={1.75} aria-hidden />
                </Link>
                <Link to="/parceiro/cadastro" className="btn-outline-cream w-full md:w-auto">
                  Sou profissional · ver preços
                </Link>
                <Link
                  to="/para-sua-casa"
                  className="tap-target inline-flex items-center justify-center gap-1.5 font-sans text-base font-semibold text-western-cream hover:text-western-gold-soft transition-colors md:ml-2"
                >
                  É para a minha casa
                  <ArrowRight className="h-5 w-5" strokeWidth={1.75} aria-hidden />
                </Link>
              </div>
              <p className="text-meta text-western-cream-muted/80 mt-6">
                Ateliê desde 1993 · Garantia de 1 ano · Cajamar/SP
              </p>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
