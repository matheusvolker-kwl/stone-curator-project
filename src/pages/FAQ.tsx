import { Link } from "react-router-dom";
import { useState } from "react";
import { ChevronDown, ArrowRight } from "lucide-react";
import { BUSINESS } from "@/config/business";
import Seo from "@/components/seo/Seo";

type Item = { q: string; a: React.ReactNode; text: string };
type Grupo = { eyebrow: string; titulo: string; itens: Item[] };

const linkClass =
  "font-semibold text-western-cta underline decoration-western-bronze/50 underline-offset-4 hover:decoration-western-cta transition-colors";

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
            <Link to="/parceria" className={linkClass}>
              cadastro
            </Link>{" "}
            (gratuito); para projetos residenciais, solicite um{" "}
            <Link to="/contrate-a-western" className={linkClass}>
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
        <div className="container-western max-w-3xl py-14 md:py-20">
          <p className="text-eyebrow mb-3">Perguntas frequentes</p>
          <h1 className="display-lg text-western-green-deep mb-4">
            Dúvidas diretas, respostas diretas.
          </h1>
          <p className="text-body max-w-2xl">
            O que profissionais e clientes mais perguntam antes de fechar pedido — sobre produto, preço,
            cadastro, entrega, pagamento e pós-venda.
          </p>
        </div>
      </section>

      {/* Acordeão por categoria */}
      <section className="surface-ivory py-12 md:py-16">
        <div className="container-western max-w-3xl">
          <div className="space-y-10 md:space-y-12">
            {GRUPOS.map((g, gi) => (
              <section key={g.titulo}>
                <p className="text-eyebrow mb-2">{g.eyebrow}</p>
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
              </section>
            ))}
          </div>
        </div>
      </section>

      {/* Faixa escura pontual — saída para argumentário e contato */}
      <section className="surface-forest">
        <div className="container-western max-w-3xl py-14 md:py-20 text-center">
          <h2 className="display-md text-western-cream mx-auto max-w-lg">
            Não encontrou o que procurava?
          </h2>
          <p className="mx-auto mt-4 max-w-xl font-sans text-[17px] leading-[1.6] text-western-cream-muted">
            Veja o argumentário completo — por que a pedra Western — ou fale direto com a fábrica.
          </p>

          <div className="mx-auto mt-8 flex max-w-md flex-col gap-3 sm:flex-row sm:justify-center">
            <Link to="/por-que-western" className="btn-gold w-full sm:w-auto">
              Ver argumentário completo
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
      </section>
    </>
  );
}
