import { useQuery } from "@tanstack/react-query";
import { ArrowUpRight, MessageCircle, RotateCcw } from "lucide-react";
import {
  formatPreco,
  nivelLabels,
  PRODUCT_BASE_URL,
  tamanhoLabels,
  tipoLabels,
  whatsappConjunto,
  type ConjuntoLeaf,
  type GuideAnswers,
  type Tipo,
} from "@/data/guideMap";
import { fetchProduct } from "@/lib/shopify/queries";
import { cdnImg } from "@/lib/shopify/client";
import UpsellGrid from "./UpsellGrid";

interface Props {
  conjunto: ConjuntoLeaf;
  answers: GuideAnswers;
  onReset: () => void;
}

function buildIndicadoPara(answers: GuideAnswers): string[] {
  const out: string[] = [];
  const { tipo, tamanho, nivel, composicao, jardim } = answers;
  if (tipo && tamanho && tamanhoLabels[tamanho]) {
    out.push(`${tipoLabels[tipo].toLowerCase()} de ${tamanhoLabels[tamanho].toLowerCase()}`);
  }
  if (nivel) out.push(`composição ${nivelLabels[nivel].toLowerCase()}`);
  if (composicao === "comNaturais") out.push("projeto que combina Western com pedras naturais");
  if (jardim === "comFonte") out.push("jardim com fonte integrada");

  if (nivel === "essencial") out.push("primeiro pedido ou projeto piloto");
  if (nivel === "equilibrada") out.push("projeto com boa presença visual");
  if (nivel === "completa") out.push("projeto cenográfico de alto impacto");
  out.push("parceiros que desejam oferecer uma solução pronta");
  return out;
}

function PlaceholderImg() {
  return (
    <svg viewBox="0 0 400 400" className="w-full h-full" aria-hidden="true">
      <rect width="400" height="400" fill="hsl(var(--western-green-deep))" />
      <g fill="hsl(var(--western-gold) / 0.35)">
        <ellipse cx="140" cy="290" rx="90" ry="40" />
        <ellipse cx="240" cy="270" rx="120" ry="55" />
        <ellipse cx="200" cy="220" rx="70" ry="30" />
      </g>
      <line x1="40" y1="320" x2="360" y2="320" stroke="hsl(var(--western-gold) / 0.5)" strokeWidth="1" />
    </svg>
  );
}

export default function GuideResultado({ conjunto, answers, onReset }: Props) {
  const { data: product, isLoading } = useQuery({
    queryKey: ["guide-product", conjunto.handle],
    queryFn: () => fetchProduct(conjunto.handle),
    retry: false,
  });

  const imageUrl = product?.images.edges[0]?.node?.url;
  const tipo = answers.tipo as Tipo;
  const bullets = buildIndicadoPara(answers);
  const pdpUrl = `${PRODUCT_BASE_URL}/${conjunto.handle}`;

  return (
    <div className="animate-in fade-in duration-300">
      <div className="grid grid-cols-1 lg:grid-cols-[5fr_6fr] gap-10 lg:gap-16 items-start">
        {/* Imagem */}
        <div className="aspect-square w-full bg-western-green-deep overflow-hidden">
          {isLoading ? (
            <div className="w-full h-full animate-pulse bg-western-green-mid" />
          ) : imageUrl ? (
            <img
              src={cdnImg(imageUrl, 1000)}
              alt={conjunto.nome}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <PlaceholderImg />
          )}
        </div>

        {/* Conteúdo */}
        <div>
          <p className="text-eyebrow mb-5">Seu conjunto recomendado</p>
          <div className="w-12 h-px bg-western-gold mb-6" />
          <h2 className="font-display text-3xl md:text-5xl text-western-green-deep leading-[1.05] mb-3">
            {conjunto.nome}
          </h2>
          <p className="text-spec text-western-stone-warm mb-8">
            {conjunto.subtitulo}
          </p>

          <div className="mb-2">
            <p className="text-spec text-western-stone-warm mb-1">A partir de</p>
            <p className="font-display text-4xl text-western-green-deep">
              {formatPreco(conjunto.preco)}
            </p>
          </div>
          <p className="text-xs text-western-stone-warm/80 mb-10">
            Disponível nos acabamentos Quartzo, Arenito, Moledo e Granito
          </p>

          <div className="border-t border-western-stone-warm/20 pt-6 mb-10">
            <p className="font-mono uppercase tracking-[0.18em] text-xs text-western-green-deep mb-4">
              Indicado para
            </p>
            <ul className="space-y-2">
              {bullets.map((b, i) => (
                <li key={i} className="flex gap-3 text-western-stone-warm">
                  <span className="text-western-gold mt-2 h-1 w-1 rounded-full bg-western-gold shrink-0" />
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-wrap gap-4 items-center mb-10">
            <a
              href={pdpUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-gold"
            >
              Ver conjunto completo <ArrowUpRight className="h-4 w-4" />
            </a>
            <a
              href={whatsappConjunto(conjunto.nome)}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-outline-forest"
            >
              <MessageCircle className="h-4 w-4" /> Falar com consultor
            </a>
            <button
              type="button"
              onClick={onReset}
              className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-western-stone-warm hover:text-western-green-deep transition-colors"
            >
              <RotateCcw className="h-3.5 w-3.5" /> Refazer guia
            </button>
          </div>

          <p className="text-xs text-western-stone-warm/70 leading-relaxed border-t border-western-stone-warm/15 pt-5">
            Pedido mínimo R$ 2.000. Prazo de produção de 15 dias úteis após
            confirmação do pagamento. Pagamento 100% antecipado via PIX, TED ou
            boleto. Frete por transportadora terceirizada ou retirada gratuita
            na fábrica (SP).
          </p>
        </div>
      </div>

      <UpsellGrid tipo={tipo} />
    </div>
  );
}
