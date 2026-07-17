import { Link } from "react-router-dom";
import { useState } from "react";
import { ChevronDown, ArrowRight } from "lucide-react";
import { BUSINESS } from "@/config/business";
import Seo from "@/components/seo/Seo";

type Item = { q: string; a: React.ReactNode; text: string };
type Grupo = {
  eyebrow: string;
  titulo: string;
  itens: Item[];
  /** saída opcional do grupo (link para a página que aprofunda o assunto) */
  saida?: { to: string; label: string };
};

const linkClass =
  "font-semibold text-western-cta underline decoration-western-bronze/50 underline-offset-4 hover:decoration-western-cta transition-colors";

/* Objeções de quem ESPECIFICA (arquitetos/paisagistas) — antes viviam na página
 * "Por que Western", fundida aqui (2026-07). Respostas com dado e caso real. */
const OBJEÇÕES: { q: string; a: string }[] = [
  {
    q: "Pedra artificial não fica tão bonita quanto natural.",
    a: "Western não é 'pedra artificial' de revenda — é uma réplica autoral moldada a partir de pedra real. Cada peça nasce do molde de uma pedra natural, com fissuras, sedimentos e textura idênticos; a diferença está no material: um composto mineral (cimento estrutural + fibra de PET reciclado), até 10× mais leve, moldado sem retirar a pedra do ambiente. A três metros de distância, nem o nosso fundador acerta qual é qual. E em três anos, com pátina de musgo e oxidação ambiental, a peça fica ainda mais indistinguível.",
  },
  {
    q: "Vai amarelar com o tempo, vai descascar.",
    a: "A pintura Western é desenvolvida há 33 anos para resistir a cloro, sol, chuva e variação térmica. Não é tinta de parede aplicada por cima — são 6 camadas distintas de pigmento mineral, com 5 cores sobrepostas em cada camada, simulando a sedimentação geológica natural. Garantia formal de 1 ano contra defeito; histórico real: peças instaladas em 1995 ainda estão em pé.",
  },
  {
    q: "É caro.",
    a: "A peça em si não é mais barata que pedra natural, e não vamos fingir que é. O que muda é a obra em volta dela. Pedra natural equivalente pesa até 10× mais, e esse peso cobra: guindaste, fechamento de rua, alvará municipal, equipe de içamento por dias. Western vai em caminhão comum, descarrega na mão e assenta em horas com argamassa AC3 de loja de bairro. Instalação, transporte e mão de obra caem no mínimo 30% — e param de ser surpresa no meio da obra.",
  },
  {
    q: "É pesada para a laje? Aguenta?",
    a: "Pelo contrário — esse é um dos maiores diferenciais. As pedras são ocas internamente, com armadura de fibra de PET reciclado e cimento estrutural. A Cascata Santa Bárbara, a maior peça da linha, pesa 280 kg; a mesma cascata em pedra natural chega a quase 3 toneladas. Western viabiliza laje, terraço, mezanino, jardim suspenso e cobertura — projetos que pedra natural inviabiliza.",
  },
  {
    q: "Mas o cliente vai querer pedra de verdade.",
    a: "Os clientes que mais conhecem o mercado já sabem que pedra natural em escala de cascata é um pesadelo logístico — vários já tiveram experiência ruim. Western entrega a estética da natural sem os custos invisíveis. Prova social: já está nos projetos de Neymar Jr., Caito Maia e Tato (Falamansa); em Unique Garden, Cobasi, Rosewood; nas pranchas de Alex Hanazaki, Jader Almeida e Marcelo Faisal. Esses clientes não aceitariam algo que parecesse 'artificial barato'.",
  },
  {
    q: "Tem garantia? E se quebrar?",
    a: "1 ano formal contra defeito de fabricação. Mas o ponto é que Western quase não quebra: você pode pular em cima, pode furar com furadeira para passar fiação, pode sentar — o composto de cimento com fibra de PET é mais resistente a impacto que pedra natural, que é frágil a fissuras laterais. Em 33 anos, parceiros como Cristal Pool e Genesis continuam comprando há mais de duas décadas — falariam abertamente se houvesse histórico de problemas.",
  },
  {
    q: "Como vai ficar montado? Não quero surpresa.",
    a: "Esse é exatamente o problema da pedra natural — você só sabe como ficou quando o guindaste posiciona. Western resolve isso em definitivo: toda peça do catálogo tem modelo 3D no SketchUp Warehouse. Você puxa a peça pro projeto, monta a composição inteira no SketchUp do estúdio, testa enquadramentos, valida com cliente, e só compra depois que está aprovado em 3D. Zero surpresa. Única empresa do segmento que entrega isso.",
  },
  {
    q: "Manutenção dá trabalho? Tenho que pintar de novo?",
    a: "Manutenção zero. A pintura é resistente a cloro, sol, chuva e variação térmica. Não escama, não desbota, não exige retoque periódico. E como a peça é oca por dentro, se um dia precisar trocar uma bomba, um LED ou passar nova fiação, é fácil — toda a engenharia fica acessível dentro da peça, sem demolição.",
  },
  {
    q: "Não é sustentável, é cimento e plástico.",
    a: "Comparando com pedra natural: extração de toneladas de rocha de uma jazida, transporte com caminhão pesado emitindo CO₂, e cada peça que sai é peça que não volta. Western não retira nada da natureza — o molde é tirado da pedra real no local sem mover a pedra. A fibra estrutural é PET reciclado: cada peça incorpora plástico que iria para aterro. Em qualquer matriz ESG séria, Western pontua melhor que pedra natural.",
  },
  {
    q: "Prefiro fornecedor mais conhecido / mais barato.",
    a: "Em pedra artificial no Brasil, mais conhecido que Western não existe. Somos a empresa que trouxe essa tecnologia para o país em 1993, vinda do Arizona — dos mesmos artistas que assinaram trabalhos da Disney e de Las Vegas. 33 anos de operação com a mesma família. Se a comparação é com produto importado da China ou cimento texturizado por revendedor local, sim, somos mais caros — mas o material é incomparável. Mande uma amostra dos dois lado a lado.",
  },
  {
    q: "Não tenho como ir até a fábrica para ver.",
    a: "Sem problema. A Western Box leva os 4 acabamentos (Quartzo, Arenito, Moledo, Granito) até você pelo correio, para sentir a textura na mão — e o valor volta 100% como crédito no primeiro pedido. Também mandamos catálogo completo digital, vídeos de obras executadas, e fazemos videochamada do showroom em Cajamar/SP se quiser ver os tamanhos grandes ao vivo. Cajamar fica na Grande São Paulo — visita ao ateliê é sempre bem-vinda.",
  },
  {
    q: "E se o cliente final não gostar?",
    a: "Por isso o SketchUp 3D resolve antes de comprar. E mais: se o problema for tonalidade, conseguimos pintar peças sob medida adaptadas ao ambiente específico — respeitando a biologia do local, fazendo a peça conversar com a vegetação, com a tinta da fachada, com o piso. Pintura personalizada é serviço sob demanda em projetos premium nossos.",
  },
];

const GRUPOS: Grupo[] = [
  {
    eyebrow: "Confiança",
    titulo: "Quem é a Western",
    itens: [
      {
        q: "Quem é a Western?",
        text: `Fabricante artesanal de pedras decorativas para paisagismo, com ateliê em ${BUSINESS.cidadeAtelie}/${BUSINESS.ufAtelie} desde ${BUSINESS.fundadaEm}. ${BUSINESS.razaoSocial} — CNPJ ${BUSINESS.cnpj}.`,
        a: (
          <>
            Fabricante artesanal de pedras decorativas para paisagismo, com ateliê em{" "}
            {BUSINESS.cidadeAtelie}/{BUSINESS.ufAtelie} desde {BUSINESS.fundadaEm}. {BUSINESS.razaoSocial} —
            CNPJ {BUSINESS.cnpj}.
          </>
        ),
      },
    ],
  },
  {
    eyebrow: "Produto",
    titulo: "O que é a pedra Western",
    itens: [
      {
        q: "A pedra é natural ou artificial?",
        text: "Réplica autoral em composto mineral (cimento estrutural + fibra de PET reciclado), moldada e pintada à mão. Até 10× mais leve que a pedra natural e sem extração ambiental.",
        a: "Réplica autoral em composto mineral (cimento estrutural + fibra de PET reciclado), moldada e pintada à mão. Até 10× mais leve que a pedra natural e sem extração ambiental.",
      },
      {
        q: "A pedra aguenta sol, chuva, cloro e peso?",
        text: "Sim. A pintura em 6 fases resiste a sol, chuva, cloro e variação térmica; é indicada para uso externo e suporta peso e perfuração. Há peças instaladas em 1995 ainda em pé.",
        a: "Sim. A pintura em 6 fases resiste a sol, chuva, cloro e variação térmica; é indicada para uso externo e suporta peso e perfuração. Há peças instaladas em 1995 ainda em pé.",
      },
    ],
  },
  {
    eyebrow: "Preço & cadastro",
    titulo: "Como funciona o valor",
    itens: [
      {
        q: "Quanto custa?",
        text: "O valor depende do produto e do porte do projeto — de peças avulsas a composições completas. Preços de parceiro ficam liberados após o cadastro (gratuito); para projetos residenciais, solicite um orçamento sem compromisso.",
        a: (
          <>
            O valor depende do produto e do porte do projeto — de peças avulsas a composições completas.
            Preços de parceiro ficam liberados após o{" "}
            <Link to="/parceiro/cadastro" className={linkClass}>
              cadastro
            </Link>{" "}
            (gratuito); para projetos residenciais, solicite um{" "}
            <Link to="/para-sua-casa" className={linkClass}>
              orçamento sem compromisso
            </Link>
            .
          </>
        ),
      },
      {
        q: "Por que preciso me cadastrar para ver o preço? Quanto leva a aprovação?",
        text: "A loja é um canal exclusivo para parceiros do ramo — arquitetos, paisagistas, laguistas, revendas e profissionais correlatos — que compram para aplicar nos projetos dos seus clientes. Por isso o preço de parceiro é liberado após o cadastro. A aprovação é automática e imediata para CNAEs compatíveis; casos que exigem análise manual têm retorno em até 2 dias úteis.",
        a: "A loja é um canal exclusivo para parceiros do ramo — arquitetos, paisagistas, laguistas, revendas e profissionais correlatos — que compram para aplicar nos projetos dos seus clientes. Por isso o preço de parceiro é liberado após o cadastro. A aprovação é automática e imediata para CNAEs compatíveis; casos que exigem análise manual têm retorno em até 2 dias úteis.",
      },
      /* Fonte única do mínimo: BUSINESS.pedidoMinimoLabel (src/config/business.ts).
       * Nunca escreva o valor à mão aqui — nem no `text` do JSON-LD. */
      {
        q: "Qual o pedido mínimo?",
        text: `${BUSINESS.pedidoMinimoLabel} por nota, exclusivo B2B. O mesmo valor vale para todo o catálogo — você monta a nota com uma peça ou uma composição inteira, desde que ela alcance esse valor. A Western Box de amostras é a única exceção: aberta a todos, sem cadastro e sem mínimo.`,
        a: (
          <>
            <strong>{BUSINESS.pedidoMinimoLabel} por nota</strong>, exclusivo B2B. O mesmo valor vale para
            todo o catálogo — você monta a nota com uma peça ou uma composição inteira, desde que ela
            alcance esse valor. A{" "}
            <Link to="/western-box" className={linkClass}>
              Western Box
            </Link>{" "}
            de amostras é a única exceção: aberta a todos, sem cadastro e sem mínimo.
          </>
        ),
      },
      {
        q: "Posso comprar uma peça só ou uma amostra antes?",
        text: `Uma peça só, sim — desde que a nota alcance o pedido mínimo de ${BUSINESS.pedidoMinimoLabel}. Para conhecer o material antes de fechar pedido, temos a Western Box (amostras com cashback), aberta a todos e sem mínimo. Clientes com serviço contratado ou pedidos maiores podem negociar um kit de amostras diretamente com o nosso time.`,
        a: (
          <>
            Uma peça só, sim — desde que a nota alcance o pedido mínimo de{" "}
            {BUSINESS.pedidoMinimoLabel}. Para conhecer o material antes de fechar pedido, temos a{" "}
            <Link to="/western-box" className={linkClass}>
              Western Box
            </Link>{" "}
            (amostras com cashback), aberta a todos e sem mínimo. Clientes com serviço contratado ou
            pedidos maiores podem negociar um kit de amostras diretamente com o nosso time.
          </>
        ),
      },
    ],
  },
  {
    eyebrow: "Logística",
    titulo: "Entrega e prazo",
    itens: [
      {
        q: "Vocês entregam na minha cidade? Quanto custa o frete?",
        text: `Enviamos para todo o Brasil por transportadora, com o frete cotado no checkout (ou junto da proposta de orçamento). Você também pode retirar no ateliê em ${BUSINESS.cidadeAtelie}/${BUSINESS.ufAtelie} (segunda a sexta, 9h às 16h): basta aguardar a confirmação de que o pedido está pronto e agendar a coleta com o nosso time, ou contratar a transportadora direto no checkout.`,
        a: (
          <>
            Enviamos para todo o Brasil por transportadora, com o frete cotado no checkout (ou junto da
            proposta de orçamento). Você também pode retirar no ateliê em {BUSINESS.cidadeAtelie}/
            {BUSINESS.ufAtelie} (segunda a sexta, 9h às 16h): basta aguardar a confirmação de que o pedido
            está pronto e agendar a coleta com o nosso time, ou contratar a transportadora direto no checkout.
          </>
        ),
      },
      {
        q: "Qual o prazo de produção e entrega?",
        text: "Produção em cerca de 15 dias úteis após a confirmação do pedido, mais o prazo de transporte. A estimativa aparece no carrinho e na proposta.",
        a: "Produção em cerca de 15 dias úteis após a confirmação do pedido, mais o prazo de transporte. A estimativa aparece no carrinho e na proposta.",
      },
    ],
  },
  {
    eyebrow: "Compra & pagamento",
    titulo: "Como pagar",
    itens: [
      {
        q: "Como funciona o pagamento e o parcelamento?",
        text: "Pix, boleto ou cartão de crédito — no cartão, em até 12× (com juros).",
        a: "Pix, boleto ou cartão de crédito — no cartão, em até 12× (com juros).",
      },
    ],
  },
  {
    eyebrow: "Pós-venda",
    titulo: "Acompanhamento e nota fiscal",
    itens: [
      {
        q: "Como acompanho meu pedido e recebo a nota fiscal?",
        text: "O status é enviado por e-mail e também fica disponível no seu painel de cliente na plataforma. A nota fiscal é emitida em toda venda.",
        a: "O status é enviado por e-mail e também fica disponível no seu painel de cliente na plataforma. A nota fiscal é emitida em toda venda.",
      },
    ],
  },
  {
    eyebrow: "Para quem especifica",
    titulo: "Por que Western — objeções de arquitetos e paisagistas",
    itens: OBJEÇÕES.map((o) => ({ q: o.q, a: o.a, text: o.a })),
    // Este grupo é a /a-pedra reescrita em acordeão (9 frases são verbatim nas
    // duas páginas). O argumento mora lá, com as fotos; aqui fica a logística.
    // ⚠ Encolher os 12 itens tem custo de SEO — eles alimentam o JSON-LD
    // FAQPage abaixo. É decisão do dono, não de quem passar por aqui.
    saida: { to: "/a-pedra", label: "O argumento completo, com as fotos" },
  },
];

export default function FAQ() {
  const [open, setOpen] = useState<string | null>("0-0");
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: GRUPOS.flatMap((g) =>
      g.itens.map((it) => ({
        "@type": "Question",
        name: it.q,
        acceptedAnswer: {
          "@type": "Answer",
          text: it.text,
        },
      }))
    ),
  };
  return (
    <>
      <Seo
        title="FAQ — Western: dúvidas de quem compra pedra artesanal"
        description="Produto, preço, cadastro, entrega, prazo, pagamento e pós-venda: as perguntas mais frequentes sobre as pedras artesanais Western."
        path="/faq"
        jsonLd={faqJsonLd}
      />

      {/* Cabeçalho — fundo claro e quente, respiro generoso (V3) */}
      <section className="surface-paper">
        <div className="container-western py-14 md:py-20">
          <div className="max-w-3xl">
            <p className="text-eyebrow mb-3">Perguntas frequentes</p>
            <h1 className="display-lg text-western-green-deep mb-4">
              Dúvidas diretas, respostas diretas.
            </h1>
            <p className="text-body max-w-2xl">
              O que profissionais e clientes mais perguntam antes de fechar pedido — sobre produto, preço,
              cadastro, entrega, pagamento e pós-venda.
            </p>
          </div>
        </div>
      </section>

      {/* Acordeão por categoria */}
      <section className="surface-ivory py-12 md:py-16">
        <div className="container-western">
          <div className="max-w-3xl space-y-10 md:space-y-12">
            {GRUPOS.map((g, gi) => (
              <section key={g.titulo}>
                <p className="text-eyebrow mb-3">{g.eyebrow}</p>
                <h2 className="display-md text-western-green-deep mb-5">{g.titulo}</h2>

                <ul className="rounded-[16px] border border-western-border-soft bg-white overflow-hidden">
                  {g.itens.map((it, ii) => {
                    const id = `${gi}-${ii}`;
                    const aberto = open === id;
                    return (
                      <li
                        key={id}
                        className="border-b border-western-border-soft last:border-b-0"
                      >
                        <button
                          type="button"
                          onClick={() => setOpen(aberto ? null : id)}
                          aria-expanded={aberto}
                          aria-controls={`faq-a-${id}`}
                          className="tap-target group flex w-full items-start justify-between gap-4 px-5 py-5 text-left md:px-7 hover:bg-western-paper transition-colors"
                        >
                          <span className="font-sans text-[17px] md:text-[18px] font-semibold leading-snug text-western-green-deep group-hover:text-western-cta transition-colors">
                            {it.q}
                          </span>
                          <ChevronDown
                            aria-hidden="true"
                            className={`mt-0.5 h-6 w-6 flex-shrink-0 text-western-bronze transition-transform duration-200 ${
                              aberto ? "rotate-180" : ""
                            }`}
                          />
                        </button>

                        {aberto && (
                          <div
                            id={`faq-a-${id}`}
                            role="region"
                            className="text-body px-5 pb-6 pr-6 md:px-7 md:pb-7"
                          >
                            {it.a}
                          </div>
                        )}
                      </li>
                    );
                  })}
                </ul>

                {g.saida && (
                  <Link
                    to={g.saida.to}
                    className="tap-target mt-5 inline-flex items-center gap-1.5 font-sans text-base font-semibold text-western-green-deep hover:text-western-cta transition-colors"
                  >
                    {g.saida.label}
                    <ArrowRight className="h-5 w-5" strokeWidth={1.75} aria-hidden />
                  </Link>
                )}
              </section>
            ))}
          </div>
        </div>
      </section>

      {/* Faixa escura pontual — saída para argumentário e contato */}
      <section className="surface-forest">
        <div className="container-western py-14 md:py-20">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="display-md text-western-cream mx-auto max-w-lg">
              Não encontrou o que procurava?
            </h2>
            <p className="mx-auto mt-4 max-w-xl font-sans text-[17px] leading-[1.6] text-western-cream-muted">
              Receba os 4 acabamentos e sinta a pedra na mão — o valor volta como crédito no primeiro pedido. Ou fale direto com a fábrica.
            </p>

            <div className="mx-auto mt-8 flex max-w-md flex-col gap-3 sm:flex-row sm:justify-center">
              <Link to="/western-box" className="btn-gold w-full sm:w-auto">
                Receber a Western Box
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link to="/contato" className="btn-outline-cream w-full sm:w-auto">
                Falar com a fábrica
              </Link>
            </div>

            <p className="text-meta mt-8 text-western-cream-muted">
              Ateliê desde {BUSINESS.fundadaEm} · Compra segura · Garantia de {BUSINESS.garantiaLabel} ·
              CNPJ {BUSINESS.cnpj}
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
