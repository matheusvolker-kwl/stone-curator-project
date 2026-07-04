import { Link } from "react-router-dom";
import { useState } from "react";
import { Plus, Minus, ArrowRight } from "lucide-react";
import { BUSINESS } from "@/config/business";
import Seo from "@/components/seo/Seo";

type Item = { q: string; a: React.ReactNode; text: string };
type Grupo = { eyebrow: string; titulo: string; itens: Item[] };

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
            Preços de parceiro ficam liberados após o <Link to="/parceria" className="underline decoration-western-gold/40 underline-offset-2 hover:decoration-western-gold">cadastro</Link> (gratuito);
            para projetos residenciais, solicite um{" "}
            <Link to="/orcamento" className="underline decoration-western-gold/40 underline-offset-2 hover:decoration-western-gold">orçamento sem compromisso</Link>.
          </>
        ),
      },
      {
        q: "Por que preciso me cadastrar para ver o preço? Quanto leva a aprovação?",
        text: "A loja é um canal exclusivo para parceiros do ramo — arquitetos, paisagistas, laguistas, revendas e profissionais correlatos — que compram para aplicar nos projetos dos seus clientes. Por isso o preço de parceiro é liberado após o cadastro. A aprovação é automática e imediata para CNAEs compatíveis; casos que exigem análise manual têm retorno em até 2 dias úteis.",
        a: "A loja é um canal exclusivo para parceiros do ramo — arquitetos, paisagistas, laguistas, revendas e profissionais correlatos — que compram para aplicar nos projetos dos seus clientes. Por isso o preço de parceiro é liberado após o cadastro. A aprovação é automática e imediata para CNAEs compatíveis; casos que exigem análise manual têm retorno em até 2 dias úteis.",
      },
      {
        q: "Posso comprar uma peça só ou uma amostra antes?",
        text: `O pedido mínimo é ${BUSINESS.pedidoMinimoLabel}. Para conhecer o material antes, temos a Western Box (amostras com cashback). Clientes com serviço contratado ou pedidos maiores podem negociar um kit de amostras diretamente com o nosso time.`,
        a: (
          <>
            O pedido mínimo é <strong>{BUSINESS.pedidoMinimoLabel}</strong>. Para conhecer o material antes,
            temos a <Link to="/western-box" className="underline decoration-western-gold/40 underline-offset-2 hover:decoration-western-gold">Western Box</Link> (amostras com cashback).
            Clientes com serviço contratado ou pedidos maiores podem negociar um kit de amostras diretamente com o nosso time.
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
      <section className="surface-forest">
        <div className="container-western py-20 md:py-28 max-w-4xl">
          <p className="text-eyebrow text-western-gold-soft mb-5">Perguntas frequentes</p>
          <div className="w-12 h-px bg-western-gold mb-8" />
          <h1 className="font-display text-4xl md:text-6xl text-western-cream leading-[1.05] mb-6">
            Dúvidas diretas,<br />respostas diretas.
          </h1>
          <p className="text-lg text-western-cream-muted leading-relaxed max-w-2xl">
            O que profissionais e clientes mais perguntam antes de fechar pedido —
            sobre produto, preço, cadastro, entrega, pagamento e pós-venda.
          </p>
        </div>
      </section>

      <section className="surface-ivory py-16 md:py-20">
        <div className="container-western max-w-3xl space-y-14">
          {GRUPOS.map((g, gi) => (
            <div key={g.titulo}>
              <p className="text-eyebrow mb-2">{g.eyebrow}</p>
              <h2 className="font-display text-2xl md:text-3xl text-western-green-deep leading-tight mb-6">
                {g.titulo}
              </h2>
              <ul className="border-t border-western-stone-warm/15">
                {g.itens.map((it, ii) => {
                  const id = `${gi}-${ii}`;
                  const aberto = open === id;
                  return (
                    <li key={id} className="border-b border-western-stone-warm/15">
                      <button
                        onClick={() => setOpen(aberto ? null : id)}
                        className="w-full flex items-start justify-between gap-4 text-left py-5 group"
                        aria-expanded={aberto}
                      >
                        <span className="font-display text-base md:text-lg text-western-green-deep group-hover:text-western-gold transition-colors leading-snug">
                          {it.q}
                        </span>
                        <span className="text-western-gold mt-1 flex-shrink-0">
                          {aberto ? <Minus className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
                        </span>
                      </button>
                      {aberto && (
                        <div className="pb-6 pr-2 text-western-stone-warm leading-relaxed text-[15px]">
                          {it.a}
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}

          <div className="pt-4 text-center">
            <p className="text-western-stone-warm mb-5">Não encontrou o que procurava?</p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link to="/por-que-western" className="inline-flex items-center gap-2 h-12 px-7 bg-western-green-deep text-western-cream hover:bg-western-green-deep/90 font-mono text-xs uppercase tracking-[0.22em] transition-colors">
                Ver argumentário completo <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/contato" className="inline-flex items-center gap-2 h-12 px-7 border border-western-green-deep/40 text-western-green-deep hover:border-western-gold hover:text-western-gold font-mono text-xs uppercase tracking-[0.22em] transition-colors">
                Falar com a fábrica
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
