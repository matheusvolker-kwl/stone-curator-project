import { Link } from "react-router-dom";
import { ArrowRight, Drill, Footprints, ShieldCheck } from "lucide-react";

import Seo from "@/components/seo/Seo";
import Reveal from "@/components/shared/Reveal";
import csbClose from "@/assets/produtos-aplicados/CSB_close.webp";
import champanheiraClose from "@/assets/produtos-aplicados/CHAMPANHEIRA_close.webp";
import parceriaInstalacao from "@/assets/parceria-instalacao.webp";
import irmaosGruta from "@/assets/irmaos-botelho-gruta.webp";
import projetoCascata from "@/assets/projetos/cover-cascata.webp";

/**
 * /a-pedra — a página do ARGUMENTO. O nó ANTES da bifurcação
 * (profissional × casa), que hoje a home faz cedo demais: ela bifurca antes
 * de provar.
 *
 * ---------------------------------------------------------------------------
 * O EIXO — ALTERNATIVA, não redenção.
 * ---------------------------------------------------------------------------
 * Ninguém errou ao usar pedra natural. Os melhores parceiros da casa (Genesis,
 * Cristal Pool) trabalham com ela há duas décadas e nunca desistiram de nada.
 * A Western não precisa que a outra esteja errada para estar certa: é a
 * alternativa mais planejável, mais leve, mais segura, mais sustentável — e
 * possível onde a outra não é.
 *
 * Regra de escrita desta página: NENHUMA frase-chave tem sujeito humano.
 * "Oca por dentro. De propósito." / "Pode pisar." / "Passa pela porta."
 * A física (peso, empilhamento, apoio, içamento) é DESCRITA — sempre sobre a
 * PEDRA, nunca sobre quem a especificou. A pedra natural aparece como medida
 * de comparação, nunca como erro.
 *
 * ---------------------------------------------------------------------------
 * ROTEIRO — 8 seções lineares, na ordem em que a dúvida NASCE (não na ordem do
 * argumento). ZERO acordeão: sanfona é o que se usa quando não se decidiu o
 * que importa.
 * ---------------------------------------------------------------------------
 *   S1 HERO+ORIGEM ....... "é pedra?"            → a causa: o molde
 *   S2 O QUE TEM DENTRO .. "então o que é?"      → oco = função
 *   S3 RESISTÊNCIA ....... "oco não quebra?"     → mata o medo ANTES da oferta
 *   S4 PASSA PELA PORTA .. "e daí que é leve?"   → 280 kg. A dobradiça.
 *   S5 O ENTREGUE É O VENDIDO .. "sem surpresa"  → O CORAÇÃO
 *   S6 A CONTA AMBIENTAL . "é cimento e plástico?" → aritmética
 *   S7 QUEM FAZ .......... "quem são vocês?"     → última prova
 *   S8 CTA ............... a bifurcação, DEPOIS da prova
 *
 * Ritmo: foto / foto / cards / foto / texto / números / foto / CTA.
 * Superfície: paper → ivory → paper → ivory → paper → ivory → paper → forest.
 * Só a S8 é escura. Sem barra fixa de CTA: esta página é uma PROVA, não um
 * checkout — sticky aqui é ansiedade.
 *
 * ---------------------------------------------------------------------------
 * SEM JSON-LD — decisão, não omissão.
 * ---------------------------------------------------------------------------
 * /a-pedra não é FAQ, é argumento. FAQPage fica em /faq.
 *
 * ---------------------------------------------------------------------------
 * S5 e S6 NÃO TÊM FOTO — decisão.
 * ---------------------------------------------------------------------------
 * Não existe no acervo nenhuma foto de: avesso, oco, peça virada, alguém
 * furando, alguém pisando, PET, fibra, teia, molde, ateliê real de Cajamar ou
 * tela do SketchUp. A copy não promete nada disso. A S3 usa cards com ícone —
 * categoria visual distinta de foto: dá densidade onde faltaria imagem sem
 * quebrar a grade.
 */

const CARDS_RESISTENCIA = [
  {
    Icon: Footprints,
    titulo: "Pisável",
    texto: "Suporta uma pessoa em cima. Não é casca: é estrutura.",
  },
  {
    Icon: Drill,
    titulo: "Perfurável",
    texto: "Fura com furadeira comum para passar fiação, e não trinca.",
  },
  {
    Icon: ShieldCheck,
    titulo: "Impacto",
    texto:
      "O composto de cimento com fibra de PET é mais resistente a impacto que a pedra natural, que é frágil a fissuras laterais.",
  },
];

const CONTA_AMBIENTAL = [
  {
    titulo: "Zero extração",
    texto:
      "O molde é tirado da pedra real no local, sem mover a pedra. A rocha continua onde estava.",
  },
  {
    titulo: "PET reciclado",
    texto:
      "A fibra estrutural é fio de PET reciclado. Cada peça incorpora plástico que iria para aterro.",
  },
  {
    titulo: "Menos caminhão",
    texto:
      "Com cerca de 10% do peso, a mesma obra sai numa fração dos veículos. E do CO₂.",
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
          S1 · HERO + ORIGEM — "é pedra?" → a causa: o molde.
          A foto vem DEPOIS do texto no mobile: a prova confirma o argumento,
          não abre a tela sozinha sem legenda.
          ================================================================== */}
      <section className="surface-paper py-16 md:py-24">
        <div className="container-western">
          {/* O h1 é LARGURA CHEIA, acima da grade — não dentro da coluna de
              texto. Medido no browser: dentro da coluna de 1.05fr (537px em
              1280px de tela) a 2ª linha precisa de ~660px e quebrava em duas,
              criando a 3ª linha órfã que o DS proíbe. E ela não cabe em coluna
              nenhuma: alargar a coluna a 660px espremeria a foto abaixo de
              390px. As duas linhas são as duas metades da página — elas abrem
              a tela inteira. */}
          <Reveal variant="fade-up" duration={700}>
            <div className="max-w-[52ch] lg:max-w-none">
              <p className="text-eyebrow mb-3">A pedra Western</p>
              {/* Sem max-w em ch no h1: qualquer medida mais estreita quebraria
                  as duas metades da página. O <br> já define as duas linhas.
                  O inline-block + balance na 2ª metade é só para o CELULAR:
                  medido a 360px, "E chega como você imaginou." precisa de
                  ~411px numa coluna de 312 — a quebra é física, não escolha
                  (a 30px do display-xl nenhuma coluna de 360px a segura numa
                  linha só). Sem o balance ela caía 272/139 e sobrava
                  "imaginou." sozinha; com ele, cai 198/213 — duas linhas
                  pares, sem órfã. No desktop a frase cabe inteira e o balance
                  não faz nada. */}
              <h1 className="display-xl text-western-green-deep">
                É pedra de verdade.
                <br />
                <span className="inline-block text-western-bronze [text-wrap:balance]">
                  E chega como você imaginou.
                </span>
              </h1>
              <p className="text-body mt-5 max-w-[52ch]">
                O molde é tirado de uma pedra real, no lugar onde ela está. O que muda é o que
                vem dentro — e é por isso que ela cabe no seu projeto.
              </p>
            </div>
          </Reveal>

          <div className="mt-12 md:mt-16 grid gap-10 lg:grid-cols-[1.05fr_1fr] lg:gap-14 lg:items-start">
            <Reveal variant="fade-up" duration={700}>
              <div>
                <h2 className="display-md text-western-green-deep">
                  Não imitamos a pedra. Tiramos o molde dela.
                </h2>
                <p className="text-body mt-3 max-w-[52ch]">
                  Cada matriz nasce de uma pedra natural moldada no próprio ambiente, sem mover a
                  pedra do lugar. As fissuras, os sedimentos e a textura vêm da rocha.
                </p>

                <blockquote className="mt-6 border-l-2 border-western-bronze pl-5">
                  <p className="font-sans text-[17px] md:text-[19px] font-semibold leading-[1.45] text-western-green-deep">
                    “A três metros de distância, nem o nosso fundador acerta qual é qual.”
                  </p>
                </blockquote>

                <p className="text-body mt-6 max-w-[52ch]">
                  E o tempo trabalha a favor. Em três anos, com pátina de musgo e oxidação
                  ambiental, a peça fica ainda mais indistinguível. Não menos.
                </p>

                <p className="text-meta mt-6">
                  Acabamentos: Moledo · Arenito · Granito · Quartzo
                </p>
              </div>
            </Reveal>

            <Reveal variant="fade-up" delay={100} duration={700}>
              <figure>
                <img
                  src={csbClose}
                  alt="Cascata Santa Bárbara em operação: água caindo sobre a piscina, com as bandas de sedimento da réplica Western visíveis de perto."
                  loading="eager"
                  decoding="async"
                  className="w-full aspect-[4/3] object-cover rounded-2xl"
                />
                {/* Legenda FORA da foto — tarja sobreposta em coluna estreita
                    come a cabeça ou os pés do enquadramento. */}
                <figcaption className="text-meta mt-4">
                  Cascata Santa Bárbara em operação · réplica Western
                </figcaption>
              </figure>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ==================================================================
          S2 · O QUE TEM DENTRO — "então o que é?" → oco = função.
          A champanheira PROVA o oco numa foto de estúdio nítida: uma peça
          cujo vazio é o produto. Nenhum catálogo de pedra do mundo mostra
          isso, porque pedra maciça não faz.
          ================================================================== */}
      <section className="surface-ivory py-16 md:py-24 border-t border-western-border-soft">
        <div className="container-western">
          <div className="grid gap-10 lg:grid-cols-2 lg:gap-14 lg:items-start">
            <Reveal variant="fade-up" duration={700}>
              <p className="text-eyebrow mb-3">O que tem dentro</p>
              <h2 className="display-md text-western-green-deep">Oca por dentro. De propósito.</h2>

              <p className="text-body mt-4 max-w-[52ch]">
                Cimento estrutural reforçado com fibra de fios de PET reciclado, formando uma teia
                tridimensional interna.
              </p>
              <p className="text-body mt-4 max-w-[52ch]">
                O vazio não é falta de pedra. É onde o trabalho passa: fiação, tubulação, a bomba,
                o LED.
              </p>
              <p className="text-body mt-4 max-w-[52ch]">
                Se um dia precisar trocar uma bomba ou passar fiação nova, a engenharia fica
                acessível dentro da peça. Sem demolição.
              </p>

              {/*
                BLOCO CONDICIONAL — A CAIXA DE LUZ DO NEYMAR.
                É detalhe de bastidor de obra de cliente: o dono foi consultado
                em 2026-07-16 e AINDA NÃO respondeu. Fica comentado até o aval.
                A seção está de pé sem ele por desenho — a champanheira já prova
                "oco = função" numa foto de estúdio nítida. Se o dono liberar,
                basta descomentar: é pull-quote de texto puro, sem imagem
                (não existe foto da caixa nem da pedra sobre ela no gramado).

                <blockquote className="mt-8 border-l-2 border-western-bronze pl-5">
                  <p className="font-sans text-[17px] md:text-[19px] font-semibold leading-[1.45] text-western-green-deep">
                    “Na obra do Neymar Jr. havia uma caixa de fiação no meio do gramado e nenhuma
                    solução para escondê-la. Uma pedra Western por cima resolveu: escondeu,
                    protegeu da chuva — e uma pessoa levanta sozinha quando precisa de manutenção.”
                  </p>
                </blockquote>
              */}
            </Reveal>

            <Reveal variant="fade-up" delay={100} duration={700}>
              <figure>
                <img
                  src={champanheiraClose}
                  alt="Champanheira Western na borda da piscina: a cavidade da peça, cheia de gelo, com três garrafas dentro."
                  loading="lazy"
                  decoding="async"
                  className="w-full aspect-[4/3] object-cover rounded-2xl"
                />
                {/* ⚠ Esta foto NÃO é da obra do Neymar (deck de cerâmica,
                    piscina azul, luz de estúdio). Atribuir seria falso. */}
                <figcaption className="text-meta mt-4">
                  Uma peça oca faz o que pedra maciça nenhuma faz: guardar o gelo.
                </figcaption>
              </figure>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ==================================================================
          S3 · RESISTÊNCIA — "oco não quebra?" → mata o medo ANTES de abrir a
          oportunidade da S4. Cards (não foto): o acervo não tem imagem de
          alguém pisando ou furando, e prometer em copy o que a foto não
          entrega seria pior que não ter foto.
          ================================================================== */}
      <section className="surface-paper py-16 md:py-24 border-t border-western-border-soft">
        <div className="container-western">
          <Reveal variant="fade-up" duration={700}>
            <div className="max-w-2xl mb-9 md:mb-12">
              <p className="text-eyebrow mb-3">Resistência</p>
              <h2 className="display-md text-western-green-deep">
                Pode pisar. Pode furar. Pode sentar.
              </h2>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
            {CARDS_RESISTENCIA.map(({ Icon, titulo, texto }, i) => (
              <Reveal key={titulo} variant="fade-up" delay={i * 90} duration={700} distance={24}>
                <article className="h-full bg-white border border-western-border-soft rounded-2xl p-6 md:p-8">
                  <span className="flex h-12 w-12 items-center justify-center rounded-[10px] bg-western-paper mb-5">
                    <Icon className="h-6 w-6 text-western-bronze" strokeWidth={1.75} aria-hidden />
                  </span>
                  <h3 className="display-md text-western-green-deep mb-2">{titulo}</h3>
                  <p className="text-body">{texto}</p>
                </article>
              </Reveal>
            ))}
          </div>

          <Reveal variant="fade-up" delay={120} duration={700}>
            <div className="mt-8 md:mt-10 max-w-[52ch]">
              <p className="text-body">Resiste a cloro, sol, chuva e variação térmica.</p>
              {/* O FATO físico é desta página; o TERMO da garantia é da
                  política comercial. Por isso o link, e não a cópia. */}
              <p className="text-meta mt-4">
                Garantia de 1 ano contra defeito de fabricação.{" "}
                <Link
                  to="/politica-comercial"
                  className="font-semibold text-western-green-deep underline decoration-western-gold underline-offset-4 hover:decoration-2"
                >
                  Ver política comercial →
                </Link>
              </p>
              <p className="text-sublabel mt-6">
                Cristal Pool e Genesis Ecossistemas compram há mais de duas décadas.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ==================================================================
          S4 · PASSA PELA PORTA — "e daí que é leve?" → 280 kg. A DOBRADIÇA.
          O peso vem de um SKU NOMEADO e conferível (Cascata Santa Bárbara,
          280 kg; o equivalente natural usa a mesma conta da PDP — peso × 10 —
          arredondado para fora: "quase 3 t").
          ================================================================== */}
      <section className="surface-ivory py-16 md:py-24 border-t border-western-border-soft">
        <div className="container-western">
          <div className="grid gap-10 lg:grid-cols-[1.05fr_1fr] lg:gap-14 lg:items-start">
            <Reveal variant="fade-up" duration={700}>
              <p className="text-eyebrow mb-3">Onde a pedra passa a caber</p>
              <h2 className="display-md text-western-green-deep">Passa pela porta.</h2>

              <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-px bg-western-border-soft border border-western-border-soft rounded-2xl overflow-hidden">
                <div className="bg-white p-6 md:p-7">
                  <p className="font-display text-[34px] md:text-[42px] leading-none tracking-[-0.02em] text-western-green-deep tabular-nums">
                    280 kg
                  </p>
                  <p className="text-meta mt-2 leading-snug">
                    Cascata Santa Bárbara, a maior peça da linha
                  </p>
                </div>
                <div className="bg-white p-6 md:p-7">
                  <p className="font-display text-[34px] md:text-[42px] leading-none tracking-[-0.02em] text-western-stone-warm tabular-nums">
                    quase 3 t
                  </p>
                  <p className="text-meta mt-2 leading-snug">
                    a mesma cascata em pedra natural
                  </p>
                </div>
              </div>

              <p className="text-body mt-8 max-w-[52ch]">
                Uma peça de toneladas não atravessa uma sacada, não passa por uma porta, não sobe
                um lance de escada. Muitas vezes precisa ser içada. A Cascata Santa Bárbara desce
                de um caminhão comum na mão e entra por onde as pessoas entram.
              </p>
              <p className="text-body mt-4 max-w-[52ch]">
                Laje, terraço, mezanino, jardim suspenso, cobertura — projetos que pedra natural
                inviabiliza. Fixa com argamassa AC3 de loja de bairro, sem sistema proprietário.
              </p>

              <p className="text-section-label mt-10 md:mt-12">
                Todo o resto desta página é consequência desse número.
              </p>
            </Reveal>

            {/* Retrato 4:5 NATIVO. Nunca esticar em banda larga: o
                enquadramento perde a sala acabada, que é o argumento. */}
            <Reveal variant="fade-up" delay={100} duration={700}>
              <figure>
                <img
                  src={parceriaInstalacao}
                  alt="Instalador ajoelhado assentando um matacão Western dentro de uma sala já acabada, com piso de madeira, sofá e planta ao fundo."
                  loading="lazy"
                  decoding="async"
                  className="w-full aspect-[4/5] object-cover rounded-2xl"
                />
                <figcaption className="text-meta mt-4">
                  Assentamento com a obra já acabada — piso posto, móvel no lugar.
                </figcaption>
              </figure>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ==================================================================
          S5 · O ENTREGUE É O VENDIDO — O CORAÇÃO DA PÁGINA.
          Isto não é sobre pedra: é sobre RISCO. O medo não é o peso — é a
          distância entre o que foi VENDIDO e o que se consegue ENTREGAR.
          Uma pedreira NÃO PODE escrever esta seção: as peças dela não se
          repetem, logo ela não pode ter bloco 3D de cada uma. A
          previsibilidade não é vantagem de marketing — é consequência física
          de ser autora da matriz. E ESCALA com a dificuldade do projeto.

          SEM FOTO, por decisão: não existe print do bloco no SketchUp ao lado
          da foto da MESMA peça (pedido nº1 de asset). O par tapirai-render +
          tapirai-real NÃO serve: são projetos visualmente diferentes e,
          rotulados "vendido/entregue", o olho lê mismatch — auto-sabotagem
          exatamente na promessa que a página sustenta.
          ================================================================== */}
      <section className="surface-paper py-16 md:py-24 border-t border-western-border-soft">
        <div className="container-western">
          <Reveal variant="fade-up" duration={700}>
            <div className="max-w-[52ch]">
              <p className="text-eyebrow mb-3">O projeto antes da obra</p>
              <h2 className="display-md text-western-green-deep">
                O 3D não é catálogo. É a garantia de que o entregue é o vendido.
              </h2>

              <p className="text-body mt-5">
                Toda peça tem modelo 3D no SketchUp Warehouse. Você puxa a peça pro projeto, monta
                a composição inteira, testa enquadramentos, valida com o cliente — e só compra
                depois de aprovado em 3D.
              </p>

              <blockquote className="mt-7 border-l-2 border-western-bronze pl-5">
                <p className="font-sans text-[17px] md:text-[19px] font-semibold leading-[1.45] text-western-green-deep">
                  Peso de tonelada traz empilhamento, apoio, içamento: variáveis que só se resolvem
                  na obra. Aqui, a peça do 3D e a peça que chega são a mesma peça. Mesmo volume,
                  mesma face, mesmo lugar.
                </p>
              </blockquote>

              <p className="text-body mt-7">
                E quanto maior o projeto, mais isso vale. Uma pedra avulsa qualquer um posiciona.
                Uma cascata, um revestimento, um maciço inteiro — é aí que entregar do jeito que o
                cliente imaginou vira o problema. É aí que o 3D paga.
              </p>

              <div className="mt-10 pt-8 border-t border-western-border-soft">
                <p className="display-lg text-western-bronze tabular-nums">+300 mil</p>
                <p className="text-meta mt-1">downloads no SketchUp</p>
              </div>

              <Link
                to="/inspiracoes"
                className="tap-target mt-6 inline-flex items-center gap-1.5 font-sans text-[16px] font-semibold text-western-green-deep hover:text-western-cta transition-colors"
              >
                Ver obras entregues
                <ArrowRight className="h-5 w-5" strokeWidth={1.75} aria-hidden />
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ==================================================================
          S6 · A CONTA AMBIENTAL — "é cimento e plástico?" → aritmética.
          Todo mundo compra selo ESG. Ninguém compra 10% do peso.
          ================================================================== */}
      <section className="surface-ivory py-16 md:py-24 border-t border-western-border-soft">
        <div className="container-western">
          <Reveal variant="fade-up" duration={700}>
            <div className="max-w-2xl mb-9 md:mb-12">
              <p className="text-eyebrow mb-3">A conta ambiental</p>
              <h2 className="display-md text-western-green-deep">Não é selo. É aritmética.</h2>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-western-border-soft border border-western-border-soft rounded-2xl overflow-hidden">
            {CONTA_AMBIENTAL.map(({ titulo, texto }, i) => (
              <Reveal key={titulo} variant="fade-up" delay={i * 90} duration={700} distance={20}>
                <div className="bg-white h-full p-6 md:p-8">
                  <h3 className="display-md text-western-green-deep mb-2">{titulo}</h3>
                  <p className="text-body">{texto}</p>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal variant="fade-up" delay={120} duration={700}>
            <p className="text-section-label mt-8 md:mt-10">
              A rocha continua na natureza. O plástico não continua no aterro.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ==================================================================
          S7 · QUEM FAZ — última prova. Aqui mora a CAPACIDADE.
          ⚠ REGRA DO DONO (tons por geologia local): UMA frase declarativa, no
          meio dos fatos de ofício, SEM CTA, SEM link, SEM imagem, e NUNCA como
          bloco próprio — bloco = oferta. Capacidade ("sabemos fazer isso") gera
          admiração; oferta ("você quer?") gera dúvida, trava a conversão e
          emperra a produção. Zero presença na PDP.
          ================================================================== */}
      <section className="surface-paper py-16 md:py-24 border-t border-western-border-soft">
        <div className="container-western">
          <div className="grid gap-10 lg:grid-cols-2 lg:gap-14 lg:items-start">
            <Reveal variant="fade-up" duration={700}>
              <p className="text-eyebrow mb-3">Quem faz</p>
              <h2 className="display-md text-western-green-deep">
                Trinta e três anos, o mesmo ateliê, a mesma família.
              </h2>

              <div className="mt-6 space-y-3 max-w-[52ch]">
                <p className="text-body">Ateliê próprio em Cajamar/SP desde 1993.</p>
                <p className="text-body">
                  Ricardo Botelho no desenho e na direção criativa. Segunda geração.
                </p>
                <p className="text-body">
                  8 linhas. Quatro acabamentos: Moledo, Arenito, Granito, Quartzo. Pintados à mão,
                  peça por peça.
                </p>
                <p className="text-body">
                  O ateliê desenvolve tons conforme o ecossistema de pedras da região de cada
                  projeto — para a peça conversar com a geologia do lugar onde ela vai ficar.
                </p>
              </div>

              <p className="text-sublabel mt-7 max-w-[46ch]">
                Quem mantém ateliê próprio há 33 anos não está revendendo o que outro fabricou.
              </p>
            </Reveal>

            <Reveal variant="fade-up" delay={100} duration={700}>
              {/* Única foto com figcaption SOBREPOSTO: é foto de ambiente, sem
                  referência de escala nos pés — a tarja cabe. É o padrão de
                  /sobre. Data: 1993 (o ateliê), não 1996 (quando os irmãos
                  assumiram) — os dois não se misturam numa legenda só. */}
              <figure className="relative overflow-hidden rounded-2xl">
                <img
                  src={irmaosGruta}
                  alt="Ricardo e Luiz Carlos Botelho entre formações de pedra Western, com cascata ao fundo."
                  loading="lazy"
                  decoding="async"
                  className="w-full aspect-[16/10] md:aspect-[21/9] object-cover"
                />
                <figcaption className="absolute bottom-4 left-4 md:bottom-6 md:left-6 max-w-[80%] rounded-[10px] bg-western-green-deep/90 px-4 py-3 md:px-5 md:py-4">
                  <p className="text-eyebrow text-western-gold-soft mb-1">
                    Cajamar/SP · desde 1993
                  </p>
                  <p className="font-sans font-semibold text-[17px] md:text-[19px] text-western-cream leading-tight">
                    Ricardo &amp; Luiz Carlos Botelho
                  </p>
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

              <Link
                to="/visitar"
                className="tap-target mt-7 inline-flex items-center gap-1.5 font-sans text-[16px] font-semibold text-western-green-deep hover:text-western-cta transition-colors"
              >
                Conhecer o ateliê
                <ArrowRight className="h-5 w-5" strokeWidth={1.75} aria-hidden />
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ==================================================================
          S8 · CTA — a bifurcação, DEPOIS da prova. Nunca antes.
          Dourado sobre o verde (o verde é CTA de fundo claro; sobre foto/verde
          o acento é o dourado). O B2C fica visível, mas nunca como primário.
          Os botões viram linha em md (não em sm): de 640 a 767px o conteúdo
          ainda empilha e a seção pareceria meio montada.
          ================================================================== */}
      <section className="relative overflow-hidden surface-forest py-16 md:py-24">
        <img
          src={projetoCascata}
          alt=""
          aria-hidden
          loading="lazy"
          decoding="async"
          className="absolute inset-0 w-full h-full object-cover opacity-25"
        />
        <div
          className="absolute inset-0 pointer-events-none"
          aria-hidden
          style={{
            background:
              "linear-gradient(180deg, hsl(var(--western-green-deep) / 0.85) 0%, hsl(var(--western-green-deep) / 0.95) 100%)",
          }}
        />
        <div className="container-western relative">
          <Reveal variant="fade-up" duration={700}>
            <div className="max-w-2xl">
              <p className="text-eyebrow text-western-gold-soft mb-3">O último teste</p>
              <h2 className="display-md text-western-cream">
                Ponha lado a lado com a sua pedra.
              </h2>
              <p className="text-[17px] md:text-[19px] leading-[1.6] text-western-cream-muted mt-4 max-w-[52ch]">
                A Western Box leva os quatro acabamentos até a sua mesa. Decida com a mão, não com
                a foto.
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
                className="tap-target mt-6 inline-flex items-center gap-1.5 font-sans text-[16px] font-semibold text-western-cream hover:text-western-gold-soft transition-colors"
              >
                É para a minha casa
                <ArrowRight className="h-5 w-5" strokeWidth={1.75} aria-hidden />
              </Link>

              <p className="text-[14px] text-western-cream-muted mt-8">
                Ateliê desde 1993 · Garantia de 1 ano · Cajamar/SP
              </p>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
