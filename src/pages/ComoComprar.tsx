import { Link } from "react-router-dom";
import {
  ArrowRight,
  FileText,
  ShieldCheck,
  MessageCircle,
  UserPlus,
  Zap,
  Tag,
  PackageCheck,
  BadgeCheck,
  Building2,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import Seo from "@/components/seo/Seo";
import Reveal from "@/components/shared/Reveal";
import { BUSINESS } from "@/config/business";
import { useAuth } from "@/hooks/useAuth";

/* Página "Como comprar" — destino do CTA secundário do hero.
 * Uma decisão por vez: entender os 4 passos → criar o cadastro.
 *
 * DIAGRAMAÇÃO (não centralização — o dono reprovou a versão "tudo mx-auto"):
 * eixo forte à esquerda (o "trilho") com o conteúdo DISTRIBUÍDO em largura —
 * algo sempre à direita (card no herói, aside sticky nos passos, ação na faixa
 * verde). Nem pirâmide, nem vazio à direita. Ver [[westernstore-refino-2026-07-17]].
 *
 * A MESMA ação aparece duas vezes (herói e fecho): quem já chegou convencido
 * age na primeira dobra; quem lê os passos age no fim. Nunca duas ações
 * concorrentes. */

type Passo = {
  n: string;
  icon: LucideIcon;
  titulo: string;
  texto: ReactNode;
};

const PASSOS: Passo[] = [
  {
    n: "1",
    icon: UserPlus,
    titulo: "Cadastre-se grátis",
    texto: (
      <>
        Rápido, com o <strong className="font-semibold text-western-green-deep">CNPJ</strong> da sua
        empresa.
      </>
    ),
  },
  {
    n: "2",
    icon: Zap,
    titulo: "Acesso liberado na hora",
    texto: (
      <>
        Aprovação{" "}
        <strong className="font-semibold text-western-green-deep">automática e imediata</strong> —
        sem espera, sem análise manual.
      </>
    ),
  },
  {
    n: "3",
    icon: Tag,
    titulo: "Veja o preço de parceiro",
    texto: (
      <>
        Valor de <strong className="font-semibold text-western-green-deep">atacado</strong>,
        condições comerciais e{" "}
        <strong className="font-semibold text-western-green-deep">modelos 3D</strong> liberados.
      </>
    ),
  },
  {
    n: "4",
    icon: PackageCheck,
    titulo: "Monte e finalize",
    texto: (
      <>
        Escolha as peças ou use o guia de composição. Pedido mínimo{" "}
        <strong className="font-semibold text-western-green-deep">
          {BUSINESS.pedidoMinimoLabel}
        </strong>{" "}
        · produção em{" "}
        <strong className="font-semibold text-western-green-deep">
          {BUSINESS.prazoProducaoDias} dias úteis
        </strong>
        .
      </>
    ),
  },
];

const DUVIDAS: { q: string; a: string }[] = [
  {
    q: "Por que preciso me cadastrar?",
    a: "É uma loja para profissionais. O cadastro identifica sua empresa e libera o preço de parceiro, as condições comerciais e os modelos 3D.",
  },
  {
    q: "Tem algum custo?",
    a: "Não. O cadastro é 100% gratuito e não gera compromisso de compra.",
  },
  {
    q: "Quanto tempo demora?",
    a: "É na hora. A aprovação é automática — o acesso fica liberado assim que você conclui o cadastro.",
  },
];

const HERO_FATOS: { icon: LucideIcon; label: string }[] = [
  { icon: BadgeCheck, label: "Cadastro grátis" },
  { icon: Zap, label: "Aprovação na hora" },
  { icon: Building2, label: "Só com CNPJ" },
];

const whatsappHref = `https://wa.me/${BUSINESS.whatsappFabrica}`;

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: DUVIDAS.map((d) => ({
    "@type": "Question",
    name: d.q,
    acceptedAnswer: { "@type": "Answer", text: d.a },
  })),
};

/* Bloco de ação — o mesmo do herói. Verde, full-width no mobile (btn-primary).
 * Reusado sem mudança de API (align="left"). */
function BlocoCta({
  isPartner,
  align,
}: {
  isPartner: boolean;
  align: "left" | "center";
}) {
  const alinhamento = align === "center" ? "text-center" : "text-left";

  if (isPartner) {
    return (
      <div className={alinhamento}>
        <Link to="/produtos" className="btn-primary w-full sm:w-auto sm:min-w-[280px]">
          Ver o catálogo com preço de parceiro
          <ArrowRight className="h-5 w-5" aria-hidden />
        </Link>
        <p className="text-meta mt-3">Você já é parceiro — o preço aparece direto no catálogo.</p>
      </div>
    );
  }

  return (
    <div className={alinhamento}>
      <Link to="/parceiro/cadastro" className="btn-primary w-full sm:w-auto sm:min-w-[280px]">
        Criar cadastro grátis
        <ArrowRight className="h-5 w-5" aria-hidden />
      </Link>
      <p className="text-meta mt-3">Leva menos de 2 minutos · precisa de CNPJ</p>
      <p className="text-[16px] mt-4 text-western-stone-warm">
        Já é parceiro?{" "}
        <Link
          to="/parceiro/login"
          className="font-semibold text-western-green-deep underline underline-offset-4 hover:text-western-bronze transition-colors"
        >
          Entrar
        </Link>
      </p>
    </div>
  );
}

export default function ComoComprar() {
  const { isPartner } = useAuth();

  return (
    <>
      <Seo
        title="Como comprar na Western — loja para profissionais"
        description="Loja exclusiva para profissionais com CNPJ. Veja o preço de parceiro em 4 passos: cadastro grátis, acesso na hora, preço de atacado e modelos 3D liberados."
        path="/como-comprar"
        jsonLd={faqJsonLd}
      />

      {/* HERÓI — split assimétrico: promessa à esquerda, AÇÃO num card à direita.
          Alinhado ao trilho, nunca centralizado. Os fatos-âncora equalizam a
          altura da coluna esquerda contra o card. */}
      <section className="surface-ivory pt-12 pb-10 md:pt-20 md:pb-16">
        <div className="container-western">
          <div className="grid gap-8 md:grid-cols-12 md:items-center md:gap-12">
            <Reveal className="md:col-span-7">
              <p className="text-eyebrow mb-3">Loja para profissionais</p>
              <div className="w-10 h-[2px] bg-western-gold mb-6" aria-hidden />
              <h1 className="display-xl text-western-green-deep mb-4">Como comprar na Western</h1>
              <p className="text-body max-w-[48ch]">
                Loja exclusiva para profissionais com CNPJ —{" "}
                <strong className="font-semibold text-western-green-deep">
                  veja o preço de parceiro em 4 passos
                </strong>
                .
              </p>
              <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-2">
                {HERO_FATOS.map(({ icon: Icon, label }) => (
                  <li
                    key={label}
                    className="inline-flex items-center gap-2 text-[15px] text-western-stone-warm"
                  >
                    <Icon className="h-[18px] w-[18px] shrink-0 text-western-bronze" aria-hidden />
                    {label}
                  </li>
                ))}
              </ul>
            </Reveal>

            <Reveal delay={90} className="md:col-span-5">
              <div className="rounded-2xl border border-western-border-soft bg-white p-6 md:p-8 shadow-[0_12px_40px_-24px_rgba(126,98,64,0.35)]">
                <BlocoCta isPartner={isPartner} align="left" />
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* PASSOS (trilho) + DÚVIDAS (aside) — conteúdo distribuído na largura.
          A linha do tempo é a "escada": marcador + conector costurando 1→2→3→4.
          O aside sticky preenche a direita que antes ficava vazia. */}
      <section className="surface-ivory pb-14 md:pb-20">
        <div className="container-western">
          <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-7">
              <h2 className="text-section-label mb-8">Como funciona</h2>
              <ol className="relative">
                {PASSOS.map((p, i) => {
                  const Icon = p.icon;
                  const last = i === PASSOS.length - 1;
                  return (
                    <Reveal
                      as="li"
                      key={p.n}
                      delay={i * 70}
                      className="relative flex gap-5 pb-8 last:pb-0"
                    >
                      {!last && (
                        <span
                          className="absolute left-[21px] top-12 bottom-0 w-px bg-western-border-strong"
                          aria-hidden
                        />
                      )}
                      <span
                        className="relative z-10 flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-western-green-deep font-sans text-[17px] font-bold tabular-nums text-western-cream"
                        aria-hidden
                      >
                        {p.n}
                      </span>
                      <div className="min-w-0 pt-1">
                        <div className="mb-1 flex items-center gap-2">
                          <Icon className="h-[18px] w-[18px] shrink-0 text-western-bronze" aria-hidden />
                          <h3 className="text-title-sm">
                            <span className="sr-only">Passo {p.n}: </span>
                            {p.titulo}
                          </h3>
                        </div>
                        <p className="text-spec">{p.texto}</p>
                      </div>
                    </Reveal>
                  );
                })}
              </ol>
            </div>

            <aside className="lg:col-span-5">
              <div className="rounded-2xl surface-paper border border-western-border-soft p-6 md:p-8 lg:sticky lg:top-24">
                <h2 className="text-eyebrow mb-5">Dúvidas rápidas</h2>
                <dl className="space-y-4">
                  {DUVIDAS.map((d, i) => (
                    <div
                      key={d.q}
                      className={i === 0 ? "" : "border-t border-western-border-soft pt-4"}
                    >
                      <dt className="mb-1 text-[17px] font-semibold leading-snug text-western-green-deep">
                        {d.q}
                      </dt>
                      <dd className="text-spec">{d.a}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* FECHO — faixa verde: identidade + legal à esquerda, AÇÃO à direita.
          btn-gold (dourado é acento sobre fundo verde; o verde sumiria). */}
      <section className="surface-forest section-tight">
        <div className="container-western">
          <div className="grid gap-8 md:grid-cols-2 md:items-center md:gap-12">
            <Reveal>
              <p className="text-eyebrow-dark mb-3">Comece agora</p>
              <h2 className="display-md text-western-cream mb-2">
                Pronto para ver o preço de parceiro?
              </h2>
              <p className="max-w-[42ch] text-[16px] text-western-cream/80">
                Cadastro grátis, aprovação na hora. Precisa apenas do CNPJ.
              </p>
              <p className="mt-5 text-[13px] leading-relaxed text-western-cream/70">
                Ateliê próprio em {BUSINESS.cidadeAtelie}/{BUSINESS.ufAtelie} desde{" "}
                {BUSINESS.fundadaEm} · {BUSINESS.razaoSocial} · CNPJ {BUSINESS.cnpj}
              </p>
            </Reveal>

            <Reveal delay={90} className="w-full md:w-auto md:justify-self-end">
              <Link
                to={isPartner ? "/produtos" : "/parceiro/cadastro"}
                className="btn-gold w-full sm:w-auto sm:min-w-[280px]"
              >
                {isPartner ? "Ver o catálogo com preço de parceiro" : "Criar cadastro grátis"}
                <ArrowRight className="h-5 w-5" aria-hidden />
              </Link>

              <ul className="mt-6 flex flex-col items-start gap-3 sm:flex-row sm:flex-wrap sm:gap-x-8">
                <li className="inline-flex items-center gap-2 text-[15px] text-western-cream/80">
                  <FileText className="h-[18px] w-[18px] shrink-0 text-western-gold-soft" aria-hidden />
                  Compra segura
                </li>
                <li className="inline-flex items-center gap-2 text-[15px] text-western-cream/80">
                  <ShieldCheck className="h-[18px] w-[18px] shrink-0 text-western-gold-soft" aria-hidden />
                  Garantia de {BUSINESS.garantiaLabel}
                </li>
              </ul>

              <p className="mt-5">
                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noreferrer"
                  className="tap-target inline-flex items-center gap-2 text-[16px] text-western-cream/80 transition-colors hover:text-western-cream"
                >
                  <MessageCircle className="h-[18px] w-[18px] shrink-0" aria-hidden />
                  Prefere conversar antes? Falar no WhatsApp
                </a>
              </p>
            </Reveal>
          </div>
        </div>
      </section>
    </>
  );
}
