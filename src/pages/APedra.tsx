import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

import Seo from "@/components/seo/Seo";
import Reveal from "@/components/shared/Reveal";

import heroDesk from "@/assets/a-pedra/hero-linha-dagua.webp";
import heroMob from "@/assets/a-pedra/hero-linha-dagua-mob.webp";
import moldeMacro from "@/assets/a-pedra/molde-macro.webp";
import descargaVan from "@/assets/a-pedra/descarga-van.webp";
import levezaDuasPessoas from "@/assets/a-pedra/leveza-duas-pessoas.webp";
import cascaInclinada from "@/assets/a-pedra/casca-inclinada.webp";
import ocoGas2009 from "@/assets/a-pedra/oco-gas-2009.webp";
import endQuadriplex from "@/assets/a-pedra/end-quadriplex.webp";
import endLaje from "@/assets/a-pedra/end-laje.webp";
import endSubmersa from "@/assets/a-pedra/end-submersa.webp";
import endEnora from "@/assets/a-pedra/end-enora.webp";
import quadriplex3d from "@/assets/a-pedra/quadriplex-3d.webp";
import quadriplexObra from "@/assets/a-pedra/quadriplex-obra.webp";
import pisavelDesk from "@/assets/a-pedra/pisavel.webp";
import pisavelMob from "@/assets/a-pedra/pisavel-mob.webp";
import perfuravel from "@/assets/a-pedra/perfuravel.webp";
import ricardoDesenhos from "@/assets/a-pedra/ricardo-desenhos.webp";
import desenhoBotelho from "@/assets/a-pedra/desenho-botelho.webp";

/**
 * /a-pedra — a página do ARGUMENTO. O nó ANTES da bifurcação
 * (profissional × casa).
 *
 * ---------------------------------------------------------------------------
 * O EIXO — ALTERNATIVA, não redenção.
 * ---------------------------------------------------------------------------
 * Ninguém errou ao usar pedra natural. Genesis e Cristal Pool compram pedra
 * natural há duas décadas. A Western não precisa que a outra esteja errada para
 * estar certa. Regra de escrita: nenhuma frase-chave tem sujeito humano — a
 * física é descrita sobre a PEDRA, nunca sobre quem a especificou. A pedra
 * natural aparece como medida de comparação, nunca como erro.
 *
 * ---------------------------------------------------------------------------
 * A REESCRITA DE 2026-07 — por que o layout v1 caiu.
 * ---------------------------------------------------------------------------
 * A v1 tinha 8 seções e 4 fotos: fotografia ocupava 9,2% da página e o miolo
 * passava 2,1 telas sem imagem. A copy estava certa; o que faltava era PROVA
 * VISUAL. Chegou acervo novo (2026-07) e esta versão tem 13 fotografias reais,
 * nenhuma seção sem imagem.
 *
 * ⚠ O comentário da v1 dizia "não existe no acervo nenhuma foto de alguém
 * pisando/furando/oco". Era FALSO e custou uma investigação inteira. Não
 * reescreva esta página a partir de suposições sobre o acervo: ABRA A PASTA.
 *
 * ---------------------------------------------------------------------------
 * DECISÕES DE CURADORIA que a próxima pessoa vai querer "melhorar" — não faça:
 * ---------------------------------------------------------------------------
 * · A foto do FURO (S6) vive a 5 seções da macro de textura (S1) DE PROPÓSITO.
 *   A peça furada está CRUA, branca, sem pintura: perto do argumento de
 *   realismo ela lê gesso e derruba a S1. A legenda nomeia o branco cru — é
 *   assim que ela para de sabotar e vira processo.
 * · A foto das duas pessoas (S3) NÃO é retocada, NÃO é ampliada além de 960px e
 *   NÃO tem o pé descalço recortado. O valor dela é não parecer publicidade.
 * · A forense de 2009 (S3) é exibida ≤420px SEMPRE. Documento grande vira
 *   publicidade. E não se escreve "17 anos e continua lá": o carimbo prova a
 *   DATA da foto, não a permanência.
 * · A submersa (S4) prova PRESENÇA e sugere tempo (a alga é real). NÃO prova
 *   duração — e a legenda não afirma duração. Falta uma data que só o dono tem.
 * · O par da S5 é 9-19/9-20 (não 9-17/9-18, que o plano pedia). Olhei os quatro:
 *   9-19 e 9-20 compartilham câmera e mobiliário (espelho arqueado + biombo
 *   dourado + paredão + painel ripado); 9-17 é plano aberto e 9-18 é close, e
 *   lado a lado aquele par lê MISMATCH — o mesmo defeito que a v1 documentou no
 *   par tapirai e recusou por escrito.
 * · RENDER NUNCA é apresentado como foto. O rótulo é parte do argumento.
 *
 * ---------------------------------------------------------------------------
 * S7 · REGRA DO DONO (tons por geologia): UMA frase declarativa, no meio dos
 * fatos de ofício, SEM CTA, SEM link, SEM bloco próprio. Capacidade ("sabemos
 * fazer") gera admiração; oferta ("você quer?") gera dúvida e emperra a
 * produção. Zero presença na PDP.
 *
 * SEM JSON-LD: /a-pedra é argumento, não FAQ. FAQPage mora em /faq.
 * SEM barra sticky: isto é uma prova, não um checkout.
 * ---------------------------------------------------------------------------
 */

/** Os 4 endereços da S4. Nenhum vira link: nenhum tem obra com cover, e
 *  ObraPage redireciona — seria o link morto do jader-porto-belo de novo. */
const ENDERECOS = [
  {
    img: endQuadriplex,
    titulo: "Um quarto no 20º andar.",
    texto: "Paredão de rocha do chão ao teto, dentro de um apartamento em torre.",
    meta: "São Paulo · projeto Dama Arquitetura",
    alt: "Quarto de apartamento com um paredão de rocha cinza do chão ao teto atrás da cabeceira de couro, com faixa dourada.",
  },
  {
    img: endLaje,
    titulo: "Uma laje sobre o vale.",
    texto: "Uma praia inteira de matacões, montada sobre a laje — onde não existe chão.",
    meta: "Obra em andamento",
    alt: "Vista de cima: praia de areia com matacões Western montada sobre uma laje de concreto, com o vale florestado logo atrás.",
  },
  {
    img: endSubmersa,
    titulo: "Debaixo d'água.",
    texto: "Resiste a cloro, sol, chuva e variação térmica.",
    meta: "Peça submersa, com pátina de alga na linha da lâmina",
    alt: "Matacões Western dentro de água limpa, com cáusticas de sol no fundo de areia e pátina de alga na linha da lâmina.",
  },
  {
    img: endEnora,
    titulo: "De pedestal para uma torre.",
    texto: "A maquete do empreendimento apoiada numa pedra Western.",
    meta: "Enora · São Paulo · Jader Almeida",
    alt: "Maquete de uma torre residencial apoiada sobre um matacão Western, em showroom.",
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
          S0 · HERO — foto, zero grade. O primeiro pixel da página é pedra
          molhada. A LEGENDA é o que transforma papel de parede em prova: sem
          a acusação, esta foto lê como um rio de verdade — que é justamente o
          paradoxo da prova de realismo (quanto melhor, menos prova sozinha).
          ================================================================== */}
      <section className="relative h-[88vh] md:h-[72vh] w-full overflow-hidden">
        <picture>
          <source media="(min-width: 768px)" srcSet={heroDesk} />
          <img
            src={heroMob}
            alt="Matacões Western na linha d'água de uma piscina natural, com o fundo de seixos visível através da água limpa."
            loading="eager"
            fetchPriority="high"
            decoding="async"
            className="absolute inset-0 h-full w-full object-cover"
          />
        </picture>
        {/* ⚠ O scrim é FORTE de propósito, e foi medido no browser. Com o
            gradiente anterior (transparent 40% → 0.85) o h1 caía sobre a parte
            CLARA da foto (a pedra iluminada) e a 2ª linha, em bronze, ficava
            praticamente invisível nos dois viewports. Prova de realismo boa é
            clara e contrastada — é justamente por isso que ela engole texto.
            Se trocar a foto do hero, MEÇA de novo: não confie neste gradiente. */}
        <div
          className="absolute inset-0 pointer-events-none"
          aria-hidden
          style={{
            background:
              "linear-gradient(180deg, hsl(var(--western-green-deep) / 0.10) 0%, hsl(var(--western-green-deep) / 0.28) 35%, hsl(var(--western-green-deep) / 0.78) 62%, hsl(var(--western-green-deep) / 0.96) 100%)",
          }}
        />
        <div className="container-western relative h-full flex flex-col justify-end pb-10 md:pb-14">
          <Reveal variant="fade-up" duration={700}>
            <p className="text-eyebrow text-western-gold-soft mb-3">A pedra Western</p>
            <h1 className="display-xl text-western-cream">
              É pedra de verdade.
              <br />
              <span className="inline-block text-western-bronze [text-wrap:balance]">
                E faz o que pedra não faz.
              </span>
            </h1>
            <p className="text-quote text-western-cream-muted mt-5 max-w-[52ch] font-normal">
              O molde sai de uma pedra real, no lugar onde ela está. O que muda é o que vem dentro.
            </p>
            <p className="text-meta text-western-cream-muted/80 mt-6 max-w-[52ch]">
              Os matacões desta foto foram moldados de rocha real. E fabricados em Cajamar.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ==================================================================
          S1 · A ORIGEM (paper) — texto esq / macro dir.
          ================================================================== */}
      <section className="surface-paper py-16 md:py-24">
        <div className="container-western">
          <div className="grid gap-10 lg:grid-cols-[1fr_0.85fr] lg:gap-14 lg:items-start">
            <Reveal variant="fade-up" duration={700}>
              <div>
                <p className="text-eyebrow mb-3">A origem</p>
                <h2 className="display-lg text-western-green-deep">
                  Não imitamos a pedra. Tiramos o molde dela.
                </h2>
                <p className="text-body mt-5 max-w-[52ch]">
                  Cada matriz nasce de uma pedra natural moldada no próprio ambiente, sem mover a
                  pedra do lugar. As fissuras, os sedimentos e a textura vêm da rocha — e a rocha
                  continua onde estava.
                </p>

                <blockquote className="mt-7 border-l-2 border-western-bronze pl-5">
                  <p className="text-quote text-western-green-deep">
                    “A três metros de distância, nem o nosso fundador acerta qual é qual.”
                  </p>
                </blockquote>

                <p className="text-body mt-7 max-w-[52ch]">
                  E o tempo trabalha a favor. Em três anos, com pátina de musgo e oxidação
                  ambiental, a peça fica ainda mais indistinguível. Não menos.
                </p>

                <p className="text-meta mt-7">Acabamentos: Moledo · Arenito · Granito · Quartzo</p>
              </div>
            </Reveal>

            <Reveal variant="fade-up" delay={100} duration={700}>
              <figure>
                <img
                  src={moldeMacro}
                  alt="Macro de uma pedra Western estratificada: laminação sedimentar fina, grão de areia e mica, com folhagem tropical desfocada ao fundo."
                  loading="eager"
                  decoding="async"
                  className="w-full aspect-[2/3] object-cover rounded-2xl"
                />
                <figcaption className="text-meta mt-4">
                  Aproxime. É para isso que ela está aqui.
                </figcaption>
              </figure>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ==================================================================
          S2 · O NÚMERO (ivory) — a BARRA. A demonstração visual do 10× que
          nunca existiu: na v1 os dois números eram uma tabelinha de 2 células
          e no mobile empilhavam a 110px de distância, perdendo o lado-a-lado
          que torna a comparação instantânea. Aqui as barras dividem a MESMA
          régua, então a comparação é geométrica antes de ser numérica.
          ================================================================== */}
      <section className="surface-ivory py-16 md:py-24 border-t border-western-border-soft overflow-x-hidden">
        <div className="container-western">
          <Reveal variant="fade-up" duration={700}>
            <div className="max-w-[52ch]">
              <p className="text-eyebrow mb-3">O número</p>
              <h2 className="display-lg text-western-green-deep">
                Tudo daqui pra frente é consequência de um número.
              </h2>
            </div>
          </Reveal>

          <Reveal variant="fade-up" delay={80} duration={700}>
            <div className="mt-10 md:mt-14 space-y-8 md:space-y-10">
              <div>
                <p className="display-stat text-western-green-deep">280 kg</p>
                <div
                  className="mt-3 h-3 md:h-4 rounded-[2px] bg-western-gold w-[10%]"
                  aria-hidden
                />
                <p className="text-meta mt-3">Cascata Santa Bárbara, a maior peça da linha</p>
              </div>
              <div>
                <p className="display-stat text-western-stone-warm">quase 3 t</p>
                {/* A barra da natural sai pela borda no mobile de propósito: o
                    excesso É o argumento. overflow-x-hidden na SECTION, jamais
                    no body. */}
                <div
                  className="mt-3 h-3 md:h-4 rounded-[2px] bg-western-stone-warm w-full"
                  aria-hidden
                />
                <p className="text-meta mt-3">a mesma cascata em pedra natural</p>
              </div>
            </div>
          </Reveal>

          <div className="mt-14 md:mt-20 grid gap-10 lg:grid-cols-[1fr_0.7fr] lg:gap-14 lg:items-start">
            <Reveal variant="fade-up" duration={700}>
              <dl className="space-y-7 max-w-[52ch]">
                <div>
                  <dt className="text-section-label text-western-green-deep">A obra.</dt>
                  {/* ⚠ A PEÇA NÃO É MAIS BARATA que pedra natural. Nunca escreva
                      que é: 3 versões erradas já foram publicadas e removidas.
                      O que cai ≥30% é a OBRA. É PISO, não teto. */}
                  <dd className="text-body mt-1.5">
                    A peça em si não é mais barata que pedra natural. A obra é: instalação,
                    transporte e mão de obra caem no mínimo 30%.
                  </dd>
                </div>
                <div>
                  <dt className="text-section-label text-western-green-deep">A entrada.</dt>
                  <dd className="text-body mt-1.5">
                    Desce de um caminhão comum na mão e entra por onde as pessoas entram. Fixa com
                    argamassa AC3 de loja de bairro, cura em 7 dias. Sem guindaste, sem sistema
                    proprietário.
                  </dd>
                </div>
                <div>
                  <dt className="text-section-label text-western-green-deep">O caminhão.</dt>
                  <dd className="text-body mt-1.5">
                    Com cerca de 10% do peso, a mesma obra sai numa fração dos veículos. E do CO₂.
                    Não é selo. É aritmética.
                  </dd>
                </div>
              </dl>
            </Reveal>

            <Reveal variant="fade-up" delay={100} duration={700}>
              <figure>
                <img
                  src={descargaVan}
                  alt="Dois homens tirando um matacão Western de dentro de uma van, na mão, sem guindaste."
                  loading="lazy"
                  decoding="async"
                  className="w-full aspect-[3/4] object-cover rounded-2xl"
                />
                <figcaption className="text-meta mt-4">
                  Dois homens descarregam um matacão Western de uma van. Sem guindaste, sem cinta.
                </figcaption>
              </figure>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ==================================================================
          S3 · A PEDRA LEVANTA (FOREST) — O CLÍMAX.
          A única seção escura do miolo e a mais alta da página: a v1 não tinha
          clímax nenhum (alturas 930/630/738/880/911/558/1004/546, e a seção
          mais alta era "quem faz"). Se tudo tem o mesmo peso, nada tem peso.
          ================================================================== */}
      <section className="surface-forest py-16 md:py-24">
        <div className="container-western">
          <div className="grid gap-10 lg:grid-cols-[0.95fr_1fr] lg:gap-14 lg:items-start">
            <Reveal variant="fade-up" duration={700}>
              <div>
                <p className="text-eyebrow text-western-gold-soft mb-3">O avesso</p>
                <h2 className="display-lg text-western-cream">A pedra levanta.</h2>
                <p className="text-body text-western-cream-muted mt-5 max-w-[52ch]">
                  Cimento estrutural reforçado com fibra de fios de PET reciclado, formando uma
                  teia tridimensional interna. A peça é oca. O vazio não é falta de pedra: é onde o
                  trabalho passa — fiação, tubulação, a bomba, o LED. E cada peça incorpora plástico
                  que iria para aterro.
                </p>
                <p className="text-body text-western-cream-muted mt-4 max-w-[52ch]">
                  Se um dia precisar trocar uma bomba ou passar fiação nova, a engenharia fica
                  acessível dentro da peça. Sem demolição.
                </p>
              </div>
            </Reveal>

            {/* A foto DOMINANTE — o momento memorável da página. 960px é o teto
                honesto do arquivo: jamais full-bleed no desktop. No mobile ela
                é full-bleed porque 390px dá 2,4× de densidade — ela é melhor no
                celular, e é lá que a página mais falhava. */}
            <Reveal variant="fade-up" delay={100} duration={700}>
              <figure>
                <img
                  src={levezaDuasPessoas}
                  alt="Duas mulheres de roupa de rua, uma descalça, carregando juntas um matacão Western pelo jardim, sorrindo."
                  loading="lazy"
                  decoding="async"
                  className="w-full max-w-[700px] aspect-[3/4] object-cover rounded-2xl"
                />
                <figcaption className="text-meta text-western-cream-muted/80 mt-4">
                  Duas pessoas carregam um matacão Western na mão. Sem cinta, sem guindaste.
                </figcaption>
              </figure>
            </Reveal>
          </div>

          <div className="mt-14 md:mt-20 grid gap-10 md:grid-cols-[1fr_0.62fr] md:gap-12 md:items-end">
            <Reveal variant="fade-up" duration={700}>
              <figure>
                <img
                  src={cascaInclinada}
                  alt="Dois homens inclinando uma peça Western em obra: a cavidade interna inteira fica à mostra e a parede tem a espessura de um dedo."
                  loading="lazy"
                  decoding="async"
                  className="w-full max-w-[520px] aspect-[3/4] object-cover rounded-2xl"
                />
                <figcaption className="text-meta text-western-cream-muted/80 mt-4">
                  Dois homens inclinam uma peça em obra. A parede tem a espessura de um dedo.
                </figcaption>
              </figure>
            </Reveal>

            <Reveal variant="fade-up" delay={100} duration={700}>
              <figure>
                <img
                  src={ocoGas2009}
                  alt="Uma casca de pedra Western levantada no gramado, revelando registro de gás, mangueiras e caixa elétrica escondidos embaixo."
                  loading="lazy"
                  decoding="async"
                  className="w-full max-w-[420px] aspect-[4/3] object-cover rounded-2xl"
                />
                <figcaption className="text-meta text-western-cream-muted/80 mt-4">
                  Registro de gás, mangueiras e caixa elétrica escondidos sob uma pedra, no gramado.
                  A pedra levanta para a manutenção. Foto de obra, 2009.
                </figcaption>
              </figure>
            </Reveal>
          </div>

          <Reveal variant="fade-up" delay={80} duration={700}>
            <p className="text-quote text-western-gold-soft mt-14 md:mt-16 max-w-[46ch]">
              Uma pedra maciça de tonelada faz muitas coisas. Levantar não é uma delas.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ==================================================================
          S4 · ONDE A PEDRA FOI (paper) — 4 endereços alternando lado.
          A TESE abre a seção: é o que impede isto de virar lista de casos.
          ================================================================== */}
      <section className="surface-paper py-16 md:py-24">
        <div className="container-western">
          <Reveal variant="fade-up" duration={700}>
            <div className="max-w-[52ch]">
              <p className="text-eyebrow mb-3">Endereços</p>
              <h2 className="display-lg text-western-green-deep">Onde a pedra foi.</h2>
              <p className="text-body mt-5">
                Nada aqui é truque. É tudo a mesma causa: a peça é oca e pesa cerca de 10% — e por
                isso ela chega em lugares que não recebem tonelada.
              </p>
            </div>
          </Reveal>

          <div className="mt-12 md:mt-16 space-y-12 md:space-y-20">
            {ENDERECOS.map(({ img, titulo, texto, meta, alt }, i) => (
              <Reveal key={titulo} variant="fade-up" duration={700}>
                <div
                  className={`grid gap-6 md:grid-cols-[0.9fr_1fr] md:gap-12 md:items-start ${
                    i % 2 === 1 ? "md:[&>figure]:order-2" : ""
                  }`}
                >
                  <figure>
                    <img
                      src={img}
                      alt={alt}
                      loading="lazy"
                      decoding="async"
                      className="w-full max-w-[520px] aspect-[4/5] object-cover rounded-2xl"
                    />
                  </figure>
                  <div>
                    <h3 className="display-md text-western-green-deep">{titulo}</h3>
                    <p className="text-body mt-2 max-w-[46ch]">{texto}</p>
                    <p className="text-meta mt-4">{meta}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ==================================================================
          S5 · O ENTREGUE É O VENDIDO (ivory) — o par lado a lado.
          Isto não é sobre pedra: é sobre RISCO — a distância entre o que foi
          VENDIDO e o que se consegue ENTREGAR. Uma pedreira NÃO PODE escrever
          esta seção: as peças dela não se repetem, logo ela não pode ter bloco
          3D de cada uma. A previsibilidade é consequência física de ser autora
          da matriz. E ESCALA com a dificuldade do projeto.
          ================================================================== */}
      <section className="surface-ivory py-16 md:py-24 border-t border-western-border-soft">
        <div className="container-western">
          <Reveal variant="fade-up" duration={700}>
            <div className="max-w-[52ch]">
              <p className="text-eyebrow mb-3">O projeto antes da obra</p>
              <h2 className="display-lg text-western-green-deep">
                O 3D não é catálogo. É a garantia de que o entregue é o vendido.
              </h2>
            </div>
          </Reveal>

          {/* O par vive num CARTÃO único, com filete divisório: no mobile ele
              impede que as duas fotos empilhadas leiam como duas fotos
              soltas — o argumento é a RELAÇÃO entre elas, não cada uma.

              ⚠ HONESTIDADE SOBRE ESTE PAR — leia antes de mexer.
              É o MESMO projeto e o MESMO quarto (conferido: espelho arqueado
              dourado, biombo de vareta, painel ripado e paredão coincidem). Mas
              NÃO é o mesmo enquadramento: são duas VISTAS do mesmo ambiente, uma
              em luz de render noturno e outra em luz de dia. Batendo o olho, o
              leitor não diz "é igual" — ele diz "parecido". Por isso a legenda
              abaixo NOMEIA a âncora (espelho + biombo + paredão): sem ela o olho
              procura sozinho, não acha, e lê MISMATCH — que era exatamente o
              defeito que a v1 documentou no par tapirai e recusou por escrito.
              Este é o elo mais fraco da página. O conserto de verdade não é
              layout: é o dono entregar um par de MESMO enquadramento (render e
              foto do mesmo ângulo). É o pedido de asset nº 1. */}
          <Reveal variant="fade-up" delay={80} duration={700}>
            <figure className="mt-10 md:mt-14 bg-white border border-western-border-soft rounded-2xl overflow-hidden">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-western-border-soft">
                <div className="bg-white">
                  <img
                    src={quadriplex3d}
                    alt="Render do quarto: paredão de rocha, espelho arqueado dourado e biombo de vareta dourada contra o painel ripado."
                    loading="lazy"
                    decoding="async"
                    className="w-full aspect-[3/4] object-cover"
                  />
                  <figcaption className="text-meta px-5 py-4 md:px-6">
                    Projeto 3D · render · Dama Arquitetura
                  </figcaption>
                </div>
                <div className="bg-white">
                  <img
                    src={quadriplexObra}
                    alt="Foto do mesmo quarto construído: o mesmo paredão de rocha, o mesmo espelho arqueado dourado e o mesmo biombo, agora em obra entregue."
                    loading="lazy"
                    decoding="async"
                    className="w-full aspect-[3/4] object-cover"
                  />
                  <figcaption className="text-meta px-5 py-4 md:px-6">
                    A obra construída · fotografia
                  </figcaption>
                </div>
              </div>
              {/* A legenda que faz o par funcionar: aponta a âncora em vez de
                  pedir que o leitor compare pixel a pixel duas vistas em luzes
                  diferentes. Sem ela, o par lê "dois quartos". */}
              <figcaption className="text-meta border-t border-western-border-soft px-5 py-4 md:px-6">
                Duas vistas do mesmo quarto: o mesmo espelho arqueado, o mesmo biombo e o mesmo
                paredão de rocha — do projeto à obra entregue.
              </figcaption>
            </figure>
          </Reveal>

          <div className="mt-12 md:mt-16 grid gap-10 lg:grid-cols-2 lg:gap-14 lg:items-start">
            <Reveal variant="fade-up" duration={700}>
              <div className="max-w-[52ch]">
                <p className="text-body">
                  Toda peça tem modelo 3D no SketchUp Warehouse. Você puxa a peça pro projeto, monta
                  a composição inteira, testa enquadramentos, valida com o cliente — e só compra
                  depois de aprovado em 3D.
                </p>
                <blockquote className="mt-7 border-l-2 border-western-bronze pl-5">
                  <p className="text-quote text-western-green-deep">
                    Peso de tonelada traz empilhamento, apoio, içamento: variáveis que só se
                    resolvem na obra. Aqui, a peça do 3D e a peça que chega são a mesma peça. Mesmo
                    volume, mesma face, mesmo lugar.
                  </p>
                </blockquote>
              </div>
            </Reveal>

            <Reveal variant="fade-up" delay={100} duration={700}>
              <div className="max-w-[52ch]">
                <p className="text-body">
                  E quanto maior o projeto, mais isso vale. Uma pedra avulsa qualquer um posiciona.
                  Uma cascata, um revestimento, um maciço inteiro — é aí que entregar do jeito que o
                  cliente imaginou vira o problema. É aí que o 3D paga.
                </p>
                <div className="mt-8 pt-7 border-t border-western-border-soft">
                  <p className="display-lg text-western-bronze tabular-nums">+300 mil</p>
                  <p className="text-meta mt-1">downloads no SketchUp</p>
                </div>
                <Link
                  to="/inspiracoes"
                  className="tap-target mt-6 inline-flex items-center gap-1.5 font-sans text-base font-semibold text-western-green-deep hover:text-western-cta transition-colors"
                >
                  Ver obras entregues
                  <ArrowRight className="h-5 w-5" strokeWidth={1.75} aria-hidden />
                </Link>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ==================================================================
          S6 · RESISTÊNCIA (paper) — mata o medo do oco.
          A v1 fazia isto com 3 ícones de linha do lucide (footprints/drill/
          shield): a categoria visual mais templada da internet, num ateliê
          artesanal de pedra. Agora são as duas fotos que provam a frase ao
          lado — e existiam no acervo o tempo todo.
          ================================================================== */}
      <section className="surface-paper py-16 md:py-24 border-t border-western-border-soft">
        <div className="container-western">
          <div className="grid gap-10 lg:grid-cols-[1fr_0.85fr] lg:gap-14 lg:items-start">
            <Reveal variant="fade-up" duration={700}>
              <div>
                <p className="text-eyebrow mb-3">Resistência</p>
                <h2 className="display-lg text-western-green-deep">Pode pisar. Pode furar.</h2>
                <p className="text-body mt-5 max-w-[52ch]">
                  Suporta uma pessoa em cima. Não é casca: é estrutura. Fura com furadeira comum
                  para passar fiação, e não trinca.
                </p>
                <p className="text-body mt-4 max-w-[52ch]">
                  O composto de cimento com fibra de PET é mais resistente a impacto que a pedra
                  natural, que é frágil a fissuras laterais.
                </p>
                <p className="text-meta mt-7">
                  Garantia de 1 ano contra defeito de fabricação.{" "}
                  <Link
                    to="/politica-comercial"
                    className="font-semibold text-western-green-deep underline decoration-western-gold underline-offset-4 hover:decoration-2"
                  >
                    Ver política comercial →
                  </Link>
                </p>
                <p className="text-sublabel mt-6 max-w-[46ch]">
                  Cristal Pool e Genesis Ecossistemas compram há mais de duas décadas.
                </p>

                {/* A foto do furo mora AQUI, longe da macro da S1. A legenda
                    NOMEIA o branco cru — sem isso ela lê gesso e sabota a S1. */}
                <Reveal variant="fade-up" delay={100} duration={700}>
                  <figure className="mt-10">
                    <img
                      src={perfuravel}
                      alt="Funcionário Western de capacete furando um matacão com martelete em obra, para passagem de fiação. A peça ainda está crua, sem pintura."
                      loading="lazy"
                      decoding="async"
                      className="w-full max-w-[420px] aspect-[3/4] object-cover rounded-2xl"
                    />
                    <figcaption className="text-meta mt-4 max-w-[46ch]">
                      Peça ainda crua, sem pintura, sendo furada em obra para passagem de fiação.
                    </figcaption>
                  </figure>
                </Reveal>
              </div>
            </Reveal>

            {/* Desktop: corte 3:4 vertical. JAMAIS 16:9 — a mensagem É a relação
                vertical (a pessoa em cima / a queda embaixo).
                ⚠ A legenda NÃO nomeia o Ricardo: prova anônima é mais forte que
                o fundador confiando no próprio produto. Quem conectar com a S7
                ganha um presente. */}
            <Reveal variant="fade-up" delay={100} duration={700}>
              <figure>
                <picture>
                  <source media="(min-width: 768px)" srcSet={pisavelDesk} />
                  <img
                    src={pisavelMob}
                    alt="Uma pessoa em pé, de mãos nos bolsos, sobre o lábio de uma cascata Western, com a água caindo por baixo dos pés na piscina."
                    loading="lazy"
                    decoding="async"
                    className="w-full aspect-[9/16] md:aspect-[3/4] object-cover rounded-2xl"
                  />
                </picture>
                <figcaption className="text-meta mt-4">
                  Uma pessoa em pé no lábio da cascata, com a água caindo por baixo.
                </figcaption>
              </figure>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ==================================================================
          S7 · QUEM FAZ (ivory) — a última prova.
          Esta seção LARGA a foto irmaos-botelho-gruta e a narrativa de família:
          são de /sobre. Menos duplicação, mais malha — e de quebra some a
          divergência 1993 (aqui) × 1996 (/sobre) que a mesma foto carregava nas
          duas páginas.
          ================================================================== */}
      <section className="surface-ivory py-16 md:py-24 border-t border-western-border-soft">
        <div className="container-western">
          <div className="grid gap-10 lg:grid-cols-[1fr_0.85fr] lg:gap-14 lg:items-start">
            <Reveal variant="fade-up" duration={700}>
              <div>
                <p className="text-eyebrow mb-3">Quem faz</p>
                <h2 className="display-lg text-western-green-deep">
                  Trinta e três anos, o mesmo ateliê, a mesma família.
                </h2>
                <p className="text-body mt-5 max-w-[52ch]">
                  Ateliê próprio em Cajamar/SP desde 1993. Ricardo Botelho no desenho e na direção
                  criativa. Segunda geração. 8 linhas. Quatro acabamentos: Moledo, Arenito, Granito,
                  Quartzo. Pintados à mão, peça por peça.
                </p>
                {/* ⚠ REGRA DO DONO: UMA frase, sem CTA, sem link, sem bloco
                    próprio. Capacidade, nunca oferta. Copy que convide a pedir
                    cor especial VIOLA a regra e emperra a produção. */}
                <p className="text-body mt-4 max-w-[52ch]">
                  O ateliê desenvolve tons conforme o ecossistema de pedras da região de cada
                  projeto — para a peça conversar com a geologia do lugar onde ela vai ficar.
                </p>
                <p className="text-sublabel mt-7 max-w-[46ch]">
                  Quem mantém ateliê próprio há 33 anos não está revendendo o que outro fabricou.
                </p>

                <Reveal variant="fade-up" delay={100} duration={700}>
                  <figure className="mt-10">
                    <img
                      src={desenhoBotelho}
                      alt="Desenho à mão de Ricardo Botelho: perspectiva de um lago com passo-a-passo de pedras e cascata, em nanquim e lápis de cor, assinado."
                      loading="lazy"
                      decoding="async"
                      className="w-full max-w-[560px] aspect-[16/9] object-cover rounded-2xl bg-white"
                    />
                    <figcaption className="text-meta mt-4">
                      Estudo à mão de Ricardo Botelho. Assinado.
                    </figcaption>
                  </figure>
                </Reveal>
              </div>
            </Reveal>

            <Reveal variant="fade-up" delay={100} duration={700}>
              <figure>
                <img
                  src={ricardoDesenhos}
                  alt="Ricardo Botelho apresentando as técnicas Western num showroom, com os desenhos à mão do projeto exibidos na tela atrás dele."
                  loading="lazy"
                  decoding="async"
                  className="w-full aspect-[3/4] object-cover rounded-2xl"
                />
                <figcaption className="text-meta mt-4">
                  Ricardo Botelho apresentando o processo — com os desenhos à mão na tela.
                </figcaption>
              </figure>
            </Reveal>
          </div>

          {/* Única quebra do alinhamento à esquerda da página inteira. */}
          <Reveal variant="fade-up" delay={80} duration={700}>
            <div className="mt-14 md:mt-20 max-w-[760px] mx-auto text-center">
              <div className="w-[34px] h-[2px] bg-western-gold mx-auto mb-6" aria-hidden />
              <blockquote className="display-md text-western-green-deep leading-[1.32]">
                “Não vendemos pedra. Oferecemos elemento autoral para o projeto — pintado à mão,
                peça por peça, no nosso ateliê.”
              </blockquote>
              <p className="text-eyebrow mt-6">Ricardo Botelho · Diretor de criação</p>

              <div className="mt-7 flex flex-wrap justify-center gap-x-8 gap-y-2">
                <Link
                  to="/visitar"
                  className="tap-target inline-flex items-center gap-1.5 font-sans text-base font-semibold text-western-green-deep hover:text-western-cta transition-colors"
                >
                  Conhecer o ateliê
                  <ArrowRight className="h-5 w-5" strokeWidth={1.75} aria-hidden />
                </Link>
                <Link
                  to="/sobre"
                  className="tap-target inline-flex items-center gap-1.5 font-sans text-base font-semibold text-western-green-deep hover:text-western-cta transition-colors"
                >
                  A história da família
                  <ArrowRight className="h-5 w-5" strokeWidth={1.75} aria-hidden />
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ==================================================================
          S8 · CTA — a bifurcação, DEPOIS da prova. Nunca antes.
          ⚠ FOREST LISO, sem imagem de fundo. A v1 usava aqui o arquivo
          "projetos/cover-cascata.webp" a opacity-25 — que NÃO é uma cascata: é
          o retrato de imprensa do Caito Maia (rosto identificável, 900×600).
          Com alt="" + aria-hidden nenhum linter, teste de a11y ou medição por
          JS pegava; só o olho pegava. Uso de imagem de terceiro em página
          comercial sugere endosso. NÃO reintroduza imagem de fundo aqui sem
          conferir o arquivo com os próprios olhos.
          ================================================================== */}
      <section className="surface-forest py-16 md:py-24">
        <div className="container-western">
          <Reveal variant="fade-up" duration={700}>
            <div className="max-w-2xl">
              <p className="text-eyebrow text-western-gold-soft mb-3">O último teste</p>
              <h2 className="display-lg text-western-cream">Ponha lado a lado com a sua pedra.</h2>
              <p className="text-quote font-normal text-western-cream-muted mt-4 max-w-[52ch]">
                A Western Box leva os quatro acabamentos até a sua mesa. Decida com a mão, não com a
                foto.
              </p>

              <div className="mt-8 flex flex-col md:flex-row gap-3">
                <Link to="/western-box" className="btn-gold w-full md:w-auto">
                  Receber as amostras
                  <ArrowRight className="h-5 w-5" strokeWidth={1.75} aria-hidden />
                </Link>
                <Link to="/parceiro/cadastro" className="btn-outline-cream w-full md:w-auto">
                  Sou profissional · ver preços
                </Link>
              </div>

              <Link
                to="/para-sua-casa"
                className="tap-target mt-6 inline-flex items-center gap-1.5 font-sans text-base font-semibold text-western-cream hover:text-western-gold-soft transition-colors"
              >
                É para a minha casa
                <ArrowRight className="h-5 w-5" strokeWidth={1.75} aria-hidden />
              </Link>

              <p className="text-meta text-western-cream-muted/80 mt-8">
                Ateliê desde 1993 · Garantia de 1 ano · Cajamar/SP
              </p>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
