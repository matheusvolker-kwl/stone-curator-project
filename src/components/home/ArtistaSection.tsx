import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import ricardoDesenhando from "@/assets/ricardo-desenhando.webp";

/**
 * O fecho da home — a assinatura da casa, DEPOIS do credenciamento.
 * (O credenciamento é o pedido; esta seção é o aperto de mão.)
 *
 * Antes ela estava "solta" por quatro desobediências empilhadas:
 *  1. fora da grade — a foto vivia em max-w-[1600px], 240px mais larga que o site;
 *  2. centralizada, num site inteiro alinhado à esquerda;
 *  3. a citação em display-xl (48px) = o MESMO tamanho do h1 da página;
 *  4. posicionada antes de um formulário de vendas (clímax emocional no meio).
 * Quatro exceções não fazem uma seção especial — fazem uma seção órfã.
 *
 * Agora ela RIMA com o hero: régua dourada → texto creme → divisor fino → a
 * autoria. Mesmo desenho, papéis opostos (a promessa lá, a assinatura aqui).
 * Continuidade feita com forma, não com texto.
 */
export default function ArtistaSection() {
  return (
    <section className="surface-forest pb-20 pt-4 md:pb-28 md:pt-8">
      <div className="container-western">
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-14">
          {/* Foto — 7 colunas, DENTRO da grade. 5:4 (quase quadrada): uma pessoa
              desenhando é um assunto vertical; 21:9 num retrato é enquadrar o vazio. */}
          <figure className="m-0 lg:col-span-7">
            <div className="aspect-[5/4] overflow-hidden rounded-xl ring-1 ring-western-gold/20 shadow-[0_28px_60px_-32px_rgba(0,0,0,0.6)]">
              <img
                src={ricardoDesenhando}
                alt="Ricardo Botelho desenhando uma nova matriz no ateliê Western em Cajamar/SP"
                loading="lazy"
                decoding="async"
                className="h-full w-full object-cover object-center"
              />
            </div>
          </figure>

          {/* Texto — 5 colunas, à esquerda. 30px: uma página, um 48px (é o hero).
              Creme sobre verde profundo lê mais forte que 48px sobre bege. */}
          <div className="lg:col-span-5">
            <div className="mb-7 h-px w-12 bg-western-gold" />
            <blockquote className="font-display text-[22px] leading-[1.28] text-western-cream md:text-[30px]">
              “Cada peça da Western nasce duas vezes: uma na natureza, outra no projeto.”
            </blockquote>

            <div className="mt-8 border-t border-western-cream/15 pt-6">
              <p className="font-sans text-[16px] font-semibold text-western-cream">
                Ricardo Botelho
              </p>
              <p className="mt-1 font-sans text-[14px] text-western-cream/60">
                Diretor criativo · 2ª geração · Cajamar/SP
              </p>
            </div>

            {/* Cortesia é link, não botão. Vestir cortesia de botão sólido é o que
                dilui o CTA de verdade — e um fechamento não despacha a pessoa. */}
            <Link
              to="/sobre"
              className="tap-target mt-7 inline-flex items-center gap-2 font-sans text-[15px] font-semibold text-western-gold-soft underline underline-offset-4 decoration-western-gold/50 transition-colors hover:decoration-western-gold-soft"
            >
              Conhecer o ateliê <ArrowRight className="h-4 w-4" strokeWidth={1.75} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
