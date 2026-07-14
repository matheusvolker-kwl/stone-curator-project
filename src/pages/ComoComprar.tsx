import { Link } from "react-router-dom";
import { ArrowRight, FileText, ShieldCheck, MessageCircle } from "lucide-react";
import type { ReactNode } from "react";
import Seo from "@/components/seo/Seo";
import Reveal from "@/components/shared/Reveal";
import { BUSINESS } from "@/config/business";
import { useAuth } from "@/hooks/useAuth";

/* Página "Como comprar" — destino do CTA secundário do hero.
 * Uma decisão por vez: entender os 4 passos → criar o cadastro.
 * Nada de preço, nada de catálogo aqui: a página existe para destravar o gate.
 *
 * A MESMA ação aparece duas vezes (herói e fim): quem já chegou convencido
 * age na primeira dobra; quem lê os 4 passos age no fim. Uma ação repetida,
 * nunca duas ações concorrentes. */

type Passo = {
  n: string;
  titulo: string;
  texto: ReactNode;
};

const PASSOS: Passo[] = [
  {
    n: "1",
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

/* Bloco de ação — o mesmo no herói e no fim da página.
 * Verde, full-width no mobile, 52px (btn-primary). O "Entrar" é apoio, não ação. */
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

      {/* CABEÇALHO — fundo claro e quente (tela de compra). Uma promessa, uma frase.
          O CTA vive aqui também: a página existe para gerar cadastro, então a ação
          não pode ficar a duas rolagens de distância. */}
      <section className="surface-ivory pt-12 pb-10 md:pt-20 md:pb-12">
        <div className="container-western max-w-3xl">
          <Reveal>
            <p className="text-eyebrow mb-3">Loja para profissionais</p>
            <div className="w-10 h-[2px] bg-western-gold mb-6" aria-hidden />
            <h1 className="display-xl text-western-green-deep mb-4">Como comprar na Western</h1>
            <p className="text-body max-w-[46ch]">
              Loja exclusiva para profissionais com CNPJ —{" "}
              <strong className="font-semibold text-western-green-deep">
                veja o preço de parceiro em 4 passos
              </strong>
              .
            </p>

            <div className="mt-7">
              <BlocoCta isPartner={isPartner} align="left" />
            </div>
          </Reveal>
        </div>
      </section>

      {/* 4 PASSOS — cards brancos, um único marcador: o numeral.
          A lista é uma escada; o ícone decorativo não acrescentava informação e
          roubava ~100px de largura útil do texto em cada card. */}
      <section className="surface-ivory pb-12 md:pb-16">
        <div className="container-western max-w-5xl">
          <ol className="grid gap-4 md:grid-cols-2">
            {PASSOS.map((p, i) => (
              <Reveal
                as="li"
                key={p.n}
                delay={i * 70}
                className="flex items-start gap-4 rounded-2xl border border-western-border-soft bg-white p-5 md:p-6 shadow-[0_2px_10px_rgba(126,98,64,0.06)]"
              >
                <span
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-western-green-deep font-sans text-[16px] font-bold tabular-nums text-western-cream"
                  aria-hidden
                >
                  {p.n}
                </span>
                <div className="min-w-0">
                  <h2 className="text-[20px] font-semibold leading-snug text-western-green-deep mb-1">
                    <span className="sr-only">Passo {p.n}: </span>
                    {p.titulo}
                  </h2>
                  <p className="text-[16px] leading-[1.55] text-western-stone-warm">{p.texto}</p>
                </div>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {/* DÚVIDAS RÁPIDAS — bloco areia. Sem acordeão: são 3 respostas curtas, mostre. */}
      <section className="surface-ivory pb-12 md:pb-16">
        <div className="container-western max-w-3xl">
          <Reveal className="rounded-2xl surface-paper border border-western-border-soft px-6 py-7 md:px-9 md:py-9">
            <h2 className="text-eyebrow mb-5">Dúvidas rápidas</h2>
            <dl>
              {DUVIDAS.map((d, i) => (
                <div
                  key={d.q}
                  className={
                    i === 0 ? "pb-4" : "border-t border-western-border-soft pt-4 pb-4 last:pb-0"
                  }
                >
                  <dt className="text-[18px] font-semibold leading-snug text-western-green-deep mb-1">
                    {d.q}
                  </dt>
                  <dd className="text-[16px] leading-[1.55] text-western-stone-warm">{d.a}</dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>
      </section>

      {/* CTA — a mesma decisão do herói, repetida para quem leu tudo. */}
      <section className="surface-ivory pb-16 md:pb-24">
        <div className="container-western max-w-3xl">
          <Reveal>
            <BlocoCta isPartner={isPartner} align="center" />

            {/* FAIXA DE CONFIANÇA — só provas. No mobile, uma linha por selo
                (o wrap 1+2 parecia defeito); no desktop, lado a lado. */}
            <ul className="mt-9 pt-6 border-t border-western-border-soft flex flex-col items-center gap-3 sm:flex-row sm:flex-wrap sm:justify-center sm:gap-x-8">
              <li className="text-spec inline-flex items-center gap-2">
                <FileText className="h-[18px] w-[18px] shrink-0 text-western-bronze" aria-hidden />
                NF-e em todo pedido
              </li>
              <li className="text-spec inline-flex items-center gap-2">
                <ShieldCheck className="h-[18px] w-[18px] shrink-0 text-western-bronze" aria-hidden />
                Garantia de {BUSINESS.garantiaLabel}
              </li>
            </ul>

            {/* Conversa — apoio, fora da faixa de provas, para não competir com o CTA. */}
            <p className="mt-5 text-center">
              <a
                href={whatsappHref}
                target="_blank"
                rel="noreferrer"
                className="tap-target inline-flex items-center justify-center gap-2 text-[16px] text-western-stone-warm hover:text-western-green-deep transition-colors"
              >
                <MessageCircle className="h-[18px] w-[18px] shrink-0" aria-hidden />
                Prefere conversar antes? Falar no WhatsApp
              </a>
            </p>

            <p className="text-meta mt-3 text-center">
              Ateliê próprio em {BUSINESS.cidadeAtelie}/{BUSINESS.ufAtelie} desde{" "}
              {BUSINESS.fundadaEm} · {BUSINESS.razaoSocial} · CNPJ {BUSINESS.cnpj}
            </p>
          </Reveal>
        </div>
      </section>
    </>
  );
}
