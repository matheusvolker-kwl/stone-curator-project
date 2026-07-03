import { Link, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ArrowRight } from "lucide-react";
import Seo from "@/components/seo/Seo";
import logo from "@/assets/logo-vertical-bege.png";
import proImage from "@/assets/projetos-western/03_piscina-cascata.webp.asset.json";
import residencialImage from "@/assets/projetos-western/08_piscina-paisagismo.webp.asset.json";

type OptionCardProps = {
  eyebrow: string;
  title: string;
  description: string;
  ariaLabel: string;
  imageUrl: string;
  onActivate: () => void;
  href?: string;
};

function OptionCard({ eyebrow, title, description, ariaLabel, imageUrl, onActivate, href }: OptionCardProps) {
  const commonClass =
    "group relative flex h-[360px] md:h-[440px] flex-col justify-end overflow-hidden rounded-[2px] border border-western-gold/25 text-left transition-all duration-300 ease-out hover:-translate-y-1 hover:border-western-gold hover:shadow-[0_24px_50px_-24px_rgba(0,0,0,0.7)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-western-gold focus-visible:ring-offset-2 focus-visible:ring-offset-western-green-deep motion-reduce:transition-none motion-reduce:hover:translate-y-0";

  const content = (
    <>
      {/* Imagem de fundo */}
      <img
        src={imageUrl}
        alt=""
        aria-hidden="true"
        loading="lazy"
        decoding="async"
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.06] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
      />
      {/* Overlay em gradiente verde profundo */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-t from-western-green-deep via-western-green-deep/85 to-western-green-deep/30 transition-opacity duration-500 group-hover:opacity-80"
      />
      {/* Conteúdo */}
      <div className="relative z-10 p-7 md:p-9">
        <p className="font-mono text-[10px] font-medium uppercase tracking-[0.24em] text-western-gold-soft">
          {eyebrow}
        </p>
        <h2 className="mt-3 font-display text-2xl md:text-[28px] leading-[1.15] text-western-cream">
          {title}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-western-cream-muted max-w-[34ch]">
          {description}
        </p>
        <span className="mt-5 inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.24em] text-western-gold transition-all duration-300 group-hover:gap-3">
          Continuar
          <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
        </span>
      </div>
    </>
  );

  if (href) {
    return (
      <a href={href} aria-label={ariaLabel} className={commonClass}>
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
        description="Escolha por onde começar: profissional do ramo (preço de parceiro e atacado) ou projeto próprio (solicitar orçamento)."
        path="/entrada"
      />
      <Helmet>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <section className="relative min-h-[calc(100vh-4rem)] overflow-hidden bg-western-green-deep">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.35] mix-blend-overlay"
          style={{
            backgroundImage:
              "radial-gradient(1200px 600px at 50% -10%, rgba(212,175,110,0.18), transparent 60%), radial-gradient(900px 500px at 50% 110%, rgba(0,0,0,0.55), transparent 60%)",
          }}
        />

        <div className="container-western relative z-10 flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center py-16 md:py-24">
          <img src={logo} alt="Western" className="h-14 md:h-16 w-auto opacity-95" decoding="async" />

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
              description="Arquiteto, paisagista, laguista ou revenda. Preço de parceiro no atacado."
              ariaLabel="Sou profissional do ramo — ir para a loja"
              imageUrl={proImage.url}
              onActivate={() => navigate("/")}
            />
            <OptionCard
              eyebrow="Opção 02"
              title="É para um projeto meu"
              description="Cascata, lago ou área de lazer na sua casa. Nosso time retorna com uma proposta."
              ariaLabel="É para um projeto meu — solicitar orçamento"
              imageUrl={residencialImage.url}
              onActivate={() => navigate("/orcamento")}
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
