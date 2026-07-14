import { Link } from "react-router-dom";
import { ArrowRight, MessageCircle } from "lucide-react";
import LegalPage from "@/components/legal/LegalPage";
import { BUSINESS } from "@/config/business";

/* DS V3 — as políticas terminavam em beco sem saída: navegação entre elas no topo
 * e faixa de fechamento com CTA no fim. Os "!" vencem os seletores descendentes
 * do LegalPage ([&_a]:underline, [&_h2]:text-western-green-deep), que sairiam
 * errados na faixa escura. */
const POLITICAS = [
  { to: "/politica-comercial", label: "Comercial" },
  { to: "/politica-de-entrega", label: "Entrega" },
  { to: "/privacidade", label: "Privacidade" },
  { to: "/trocas-e-avarias", label: "Trocas e avarias" },
] as const;

function LegalNav({ atual }: { atual: string }) {
  return (
    <nav aria-label="Políticas da Western" className="mb-10 flex flex-wrap gap-2">
      {POLITICAS.map((p) => {
        const ativa = p.to === atual;
        return (
          <Link
            key={p.to}
            to={p.to}
            aria-current={ativa ? "page" : undefined}
            className={`tap-target inline-flex items-center rounded-full border px-5 font-sans text-[16px] font-semibold !no-underline transition-colors ${
              ativa
                ? "border-western-cta bg-western-cta text-western-cream"
                : "border-western-border-strong text-western-green-deep hover:border-western-green-deep hover:bg-western-paper"
            }`}
          >
            {p.label}
          </Link>
        );
      })}
    </nav>
  );
}

function FechamentoLegal({
  titulo,
  apoio,
  waHref,
  waLabel,
}: {
  titulo: string;
  apoio: string;
  waHref: string;
  waLabel: string;
}) {
  return (
    <section className="surface-forest mt-16 rounded-[16px] px-6 py-12 text-center md:px-12 md:py-14">
      <h2 className="display-md mx-auto max-w-xl !mb-3 !mt-0 !text-[1.625rem] !text-western-cream md:!text-[1.875rem]">
        {titulo}
      </h2>
      <p className="mx-auto mb-8 max-w-lg text-[17px] leading-[1.6] text-western-cream/80">{apoio}</p>
      <div className="mx-auto flex max-w-md flex-col gap-3 sm:max-w-none sm:flex-row sm:justify-center">
        {/* Dourado: único CTA da faixa escura, onde o verde não teria contraste. */}
        <a
          href={waHref}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-gold w-full !no-underline sm:w-auto"
        >
          <MessageCircle className="h-5 w-5" strokeWidth={1.75} /> {waLabel}
        </a>
        <Link to="/parceiro/cadastro" className="btn-outline-cream w-full !no-underline sm:w-auto">
          Solicitar acesso B2B <ArrowRight className="h-5 w-5" strokeWidth={1.75} />
        </Link>
      </div>
      <p className="mt-8 text-[14px] leading-[1.5] text-western-cream/70">
        Ateliê desde {BUSINESS.fundadaEm} · CNPJ {BUSINESS.cnpj} · NF-e em todo pedido · Garantia de{" "}
        {BUSINESS.garantiaLabel}
      </p>
    </section>
  );
}

export default function PoliticaComercial() {
  const waConsultor = `https://wa.me/${BUSINESS.whatsappFabrica}?text=${encodeURIComponent(
    "Olá, vim pelo site da Western e gostaria de falar com um consultor."
  )}`;

  return (
    <LegalPage eyebrow="Política comercial" titulo="Como compramos e vendemos." atualizadoEm="maio de 2026" seoPath="/politica-comercial" seoTitle="Política comercial — Western" seoDescription="Regras B2B da Western: pedido mínimo, condições de pagamento, credenciamento e catálogo profissional.">
      <LegalNav atual="/politica-comercial" />

      <p className="text-[19px] leading-[1.6] text-western-green-deep">
        O catálogo Western Pools com preço de atacado opera no canal B2B, atendendo profissionais
        e empresas do paisagismo e da construção com CNPJ ativo — de arquitetos e paisagistas a
        laguistas, jardineiros, garden centers, lojas e construtoras. O acesso à tabela de preços,
        condições e modelos 3D ocorre após credenciamento. A Western Box de amostras é a única
        exceção: aberta também a clientes finais, sem cadastro B2B.
      </p>

      {/* Fonte única: BUSINESS.pedidoMinimoLabel (src/config/business.ts).
       * Nunca reescreva o valor aqui — abolir ou alterar o mínimo se faz lá. */}
      <h2>Pedido mínimo</h2>
      <p>
        Pedido mínimo por nota: <strong>{BUSINESS.pedidoMinimoLabel}</strong>, exclusivo B2B. O
        valor é o mesmo em todo o catálogo, em todas as condições comerciais e em todo o site —
        você monta a nota como quiser (uma peça ou uma composição inteira), desde que ela alcance
        esse valor. A Western Box de amostras é a única exceção: aberta a todos, sem cadastro B2B e
        sem pedido mínimo.
      </p>

      <h2>Pagamento</h2>
      <p>
        Condições de pagamento são definidas caso a caso e informadas ao parceiro durante a
        negociação comercial.
      </p>

      <h2>Prazo de produção</h2>
      <p>
        {BUSINESS.prazoProducaoLabel}. Conjuntos personalizados (tonalidade ou volume fora do
        padrão) podem ter prazo estendido — informamos por escrito antes da confirmação.
      </p>

      <h2>Conjuntos pré-montados</h2>
      <p>
        Conjuntos pré-montados do catálogo são a soma pura das peças que os compõem — sem
        acréscimo e sem desconto sobre a especificação avulsa equivalente.
      </p>

      <h2>Pintura personalizada</h2>
      <p>
        Tonalidades adaptadas a um ambiente específico são oferecidas como serviço sob demanda,
        com orçamento por projeto. Pedidos personalizados não são passíveis de troca por
        diferença de gosto após aprovação da prova.
      </p>

      <h2>Cancelamento</h2>
      <p>
        Pedidos podem ser cancelados sem ônus em até 24h após a confirmação. Após o início da
        produção, o cancelamento implica retenção proporcional ao estágio executado.
      </p>

      <FechamentoLegal
        titulo="Dúvida sobre a política comercial?"
        apoio="Fale com um consultor pelo WhatsApp — credenciamento, tabela de parceiro e condições de pagamento."
        waHref={waConsultor}
        waLabel="Falar com consultor"
      />
    </LegalPage>
  );
}
