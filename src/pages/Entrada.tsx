import { Link, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ArrowRight } from "lucide-react";
import Seo from "@/components/seo/Seo";
import { BUSINESS } from "@/config/business";
import logo from "@/assets/logo-vertical-bege.png";

const WHATSAPP_MSG = encodeURIComponent(
  "Olá Western! Estou buscando pedras/um projeto para um espaço meu e gostaria de falar com o time.",
);
const WHATSAPP_URL = `https://wa.me/${BUSINESS.whatsappFabrica}?text=${WHATSAPP_MSG}`;

type OptionCardProps = {
  eyebrow: string;
  title: string;
  description: string;
  ariaLabel: string;
  onActivate: () => void;
  href?: string;
  external?: boolean;
};

function OptionCard({ eyebrow, title, description, ariaLabel, onActivate, href, external }: OptionCardProps) {
  const commonClass =
    "group relative flex h-full flex-col justify-between gap-8 rounded-[2px] border border-western-gold/25 bg-western-green-deep/40 p-8 md:p-10 text-left transition-all duration-300 ease-out hover:-translate-y-1 hover:border-western-gold hover:bg-western-green-deep/70 hover:shadow-[0_18px_40px_-20px_rgba(0,0,0,0.55)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-western-gold focus-visible:ring-offset-2 focus-visible:ring-offset-western-green-deep motion-reduce:transition-none motion-reduce:hover:translate-y-0";

  const content = (
    <>
      <div>
        <p className="font-mono text-[10px] font-medium uppercase tracking-[0.24em] text-western-gold-soft">
          {eyebrow}
        </p>
        <h2 className="mt-4 font-display text-2xl md:text-3xl leading-[1.15] text-western-cream">
          {title}
        </h2>
        <p className="mt-4 text-sm md:text-base leading-relaxed text-western-cream-muted">
          {description}
        </p>
      </div>
      <span className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.24em] text-western-gold transition-all duration-300 group-hover:gap-3">
        Continuar
        <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
      </span>
    </>
  );

  if (href) {
    return (
      <a
        href={href}
        target={external ? "_blank" : undefined}
        rel={external ? "noopener noreferrer" : undefined}
        aria-label={ariaLabel}
        className={commonClass}
      >
        {content}
      </a>
    );
  }
  return (
    <button type="button" onClick={onActivate} aria-label={ariaLabel} className={commonClass}>
      {content}
    </button>
  );
}

export default function Entrada() {
  const navigate = useNavigate();

  return (
    <>
      <Seo
        title="Western — Bem-vindo"
        description="Escolha por onde começar: profissional do ramo (preço de parceiro e atacado) ou projeto próprio (falar com o time comercial)."
        path="/entrada"
      />
      <Helmet>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <section className="relative min-h-[calc(100vh-4rem)] overflow-hidden bg-western-green-deep">
        {/* textura sutil / vinheta editorial */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.35] mix-blend-overlay"
          style={{
            backgroundImage:
              "radial-gradient(1200px 600px at 50% -10%, rgba(212,175,110,0.18), transparent 60%), radial-gradient(900px 500px at 50% 110%, rgba(0,0,0,0.55), transparent 60%)",
          }}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)' opacity='0.5'/></svg>\")",
          }}
        />

        <div className="container-western relative z-10 flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center py-16 md:py-24">
          <img
            src={logo}
            alt="Western"
            className="h-14 md:h-16 w-auto opacity-95"
            decoding="async"
          />

          <div className="mt-10 max-w-3xl text-center">
            <p className="font-mono text-[11px] font-medium uppercase tracking-[0.28em] text-western-gold-soft">
              Bem-vindo à Western
            </p>
            <div className="mx-auto mt-5 h-px w-10 bg-western-gold" />
            <h1 className="mt-6 font-display text-3xl md:text-5xl lg:text-6xl leading-[1.08] text-western-cream text-balance">
              Você é profissional do ramo ou está buscando para um projeto seu?
            </h1>
            <p className="mt-5 text-base md:text-lg leading-relaxed text-western-cream-muted max-w-xl mx-auto">
              Assim levamos você direto para o lugar certo.
            </p>
          </div>

          <div className="mt-12 md:mt-16 grid w-full max-w-4xl grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
            <OptionCard
              eyebrow="Opção 01"
              title="Sou profissional do ramo"
              description="Arquiteto, paisagista, laguista, garden center, loja ou construtora. Quero preço de parceiro e comprar no atacado."
              ariaLabel="Sou profissional do ramo — ir para a loja"
              onActivate={() => navigate("/")}
            />
            <OptionCard
              eyebrow="Opção 02"
              title="É para um projeto meu"
              description="Quero uma cascata, lago ou área de lazer na minha casa ou empreendimento."
              ariaLabel="É para um projeto meu — falar com o time no WhatsApp"
              onActivate={() => {}}
              href={WHATSAPP_URL}
              external
            />
          </div>

          <Link
            to="/linhas"
            className="mt-12 inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.24em] text-western-cream-muted transition-colors hover:text-western-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-western-gold focus-visible:ring-offset-2 focus-visible:ring-offset-western-green-deep"
          >
            Só quero ver o catálogo
            <ArrowRight className="h-3 w-3" aria-hidden="true" />
          </Link>
        </div>
      </section>
    </>
  );
}
