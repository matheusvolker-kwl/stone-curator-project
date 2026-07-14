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

export default function PoliticaEntrega() {
  const waConsultor = `https://wa.me/${BUSINESS.whatsappFabrica}?text=${encodeURIComponent(
    "Olá, vim pelo site da Western e gostaria de falar com um consultor."
  )}`;

  return (
    <LegalPage eyebrow="Política de entrega" titulo="Como o pedido sai do ateliê." atualizadoEm="maio de 2026" seoPath="/politica-de-entrega" seoTitle="Política de entrega — Western" seoDescription="Retirada no ateliê ou envio por transportadora, embalagem, conferência e prazo de coleta da Western.">
      <LegalNav atual="/politica-de-entrega" />

      <p className="text-[19px] leading-[1.6] text-western-green-deep">
        A Western trabalha com retirada no ateliê em {BUSINESS.cidadeAtelie}/{BUSINESS.ufAtelie}{" "}
        ou envio por transportadora contratada pelo parceiro. Não temos frota própria.
      </p>

      <h2>Modalidades</h2>
      <ul>
        <li>
          <strong>Retirada no ateliê.</strong> Sem custo. Agendamento prévio obrigatório, em
          horário comercial ({BUSINESS.horarioAtelie}).
        </li>
        <li>
          <strong>Transportadora indicada pelo parceiro.</strong> O frete é contratado e pago
          diretamente à transportadora. A Western prepara a embalagem e libera a coleta.
        </li>
        <li>
          <strong>Cotação assistida.</strong> Mediante solicitação, indicamos transportadoras de
          confiança e ajudamos a cotar — sem repasse de margem.
        </li>
      </ul>

      <h2>Embalagem e proteção</h2>
      <p>
        Cada peça é embalada individualmente em filme stretch, papelão estruturado e cantoneiras
        de proteção. Cascatas e peças grandes recebem pallet dedicado com cintas.
      </p>

      <h2>Conferência no recebimento</h2>
      <p>
        O parceiro deve conferir as peças no ato da entrega, na presença do motorista, e
        registrar qualquer avaria visível no canhoto da nota. Avarias não registradas no momento
        da entrega não podem ser pleiteadas posteriormente.
      </p>

      <h2>Prazo de coleta</h2>
      <p>
        Após a conclusão da produção, o pedido fica disponível para coleta em até 5 dias úteis.
        Após esse período, eventual armazenagem prolongada poderá ser cobrada.
      </p>

      <FechamentoLegal
        titulo="Dúvida sobre retirada ou transporte?"
        apoio={`Um consultor ajuda a cotar frete e a agendar a retirada no ateliê em ${BUSINESS.cidadeAtelie}/${BUSINESS.ufAtelie}.`}
        waHref={waConsultor}
        waLabel="Falar com consultor"
      />
    </LegalPage>
  );
}
