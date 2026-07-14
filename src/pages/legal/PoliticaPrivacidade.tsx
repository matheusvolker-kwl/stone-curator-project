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

export default function PoliticaPrivacidade() {
  const waConsultor = `https://wa.me/${BUSINESS.whatsappFabrica}?text=${encodeURIComponent(
    "Olá, vim pelo site da Western e gostaria de falar com um consultor."
  )}`;

  return (
    <LegalPage eyebrow="Privacidade" titulo="Como tratamos os seus dados." atualizadoEm="maio de 2026" seoPath="/privacidade" seoTitle="Política de privacidade — Western" seoDescription="LGPD na prática: dados coletados pela Western, finalidades, prazos de retenção e como exercer seus direitos.">
      <LegalNav atual="/privacidade" />

      <p className="text-[19px] leading-[1.6] text-western-green-deep">
        A Western Pools respeita a Lei Geral de Proteção de Dados (LGPD — Lei 13.709/2018) e
        coleta apenas os dados necessários para credenciar parceiros B2B, processar pedidos e
        manter contato comercial.
      </p>

      <h2>Dados que coletamos</h2>
      <ul>
        <li>Identificação profissional: nome, e-mail, telefone, CNPJ e razão social.</li>
        <li>Dados de projeto informados voluntariamente em formulários (orçamento, amostras, visita).</li>
        <li>Dados de navegação básicos (cookies analíticos) para melhorar o site.</li>
      </ul>

      <h2>Como usamos</h2>
      <ul>
        <li>Aprovar credenciamento e habilitar tabela B2B.</li>
        <li>Processar pedidos, emitir nota fiscal e organizar logística.</li>
        <li>Enviar comunicações relacionadas ao seu cadastro e, opcionalmente, novidades de catálogo.</li>
      </ul>

      <h2>Com quem compartilhamos</h2>
      <p>
        Apenas com parceiros operacionais estritamente necessários: contabilidade, transportadora
        contratada pelo parceiro, plataforma de e-mail e infraestrutura de hospedagem. Nunca
        vendemos ou cedemos dados a terceiros para fins de marketing.
      </p>

      <h2>Seus direitos</h2>
      <p>
        Você pode solicitar acesso, correção, exclusão ou portabilidade dos seus dados a qualquer
        momento por e-mail para <a href={`mailto:${BUSINESS.emailComercial}`}>{BUSINESS.emailComercial}</a>.
      </p>

      <h2>Cookies</h2>
      <p>
        Usamos cookies essenciais para autenticação e cookies analíticos para entender o uso do
        site. Você pode desativar cookies não-essenciais nas configurações do seu navegador.
      </p>

      <h2>Encarregado de dados</h2>
      <p>
        Encarregado: equipe Western Pools · Contato: <a href={`mailto:${BUSINESS.emailComercial}`}>{BUSINESS.emailComercial}</a>.
      </p>

      <FechamentoLegal
        titulo="Quer exercer um direito sobre os seus dados?"
        apoio={`Fale com a equipe Western Pools pelo WhatsApp ou por ${BUSINESS.emailComercial}.`}
        waHref={waConsultor}
        waLabel="Falar com consultor"
      />
    </LegalPage>
  );
}
