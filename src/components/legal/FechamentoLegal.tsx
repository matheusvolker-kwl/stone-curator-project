import { Link } from "react-router-dom";
import { ArrowRight, MessageCircle } from "lucide-react";
import { BUSINESS } from "@/config/business";

/**
 * Faixa de fechamento das páginas legais — era uma função IDÊNTICA copiada
 * byte a byte em PoliticaComercial, PoliticaPrivacidade e TrocasAvarias
 * (auditoria 2026-07-17). Agora vive uma vez.
 *
 * Os "!" continuam necessários enquanto a faixa renderiza DENTRO do escopo de
 * seletores descendentes do LegalPage ([&_a]:underline, [&_h2]:text-western-
 * green-deep) — sem eles, o h2 sairia verde sobre verde e os botões sairiam
 * sublinhados. TODO (sweep): mover a faixa para o próprio shell LegalPage,
 * FORA do escopo de prosa — aí os "!" morrem de causa natural.
 */
export default function FechamentoLegal({
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
    <section className="surface-forest mt-16 rounded-2xl px-6 py-12 text-center md:px-12 md:py-14">
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
        Ateliê desde {BUSINESS.fundadaEm} · CNPJ {BUSINESS.cnpj} · Compra segura · Garantia de{" "}
        {BUSINESS.garantiaLabel}
      </p>
    </section>
  );
}
