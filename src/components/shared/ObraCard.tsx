import Reveal from "@/components/shared/Reveal";

/**
 * ObraCard — card de APRESENTAÇÃO de obra (foto + crédito/título + linha).
 *
 * Consolida os dois gêmeos genuínos (auditoria 2026-07-17): PROJETOS (teaser da
 * home) e OBRAS_SONHO (/para-sua-casa). NÃO consolida o ObraLook do /obras —
 * aquilo é um shop-the-look com chips de SKU e orçamento, não um card.
 *
 * O ganho não é menos código (são 2 usos) — é ENFORCEMENT por construção: alt
 * obrigatório (o tipo exige), lazy + decoding async, proporção, placeholder
 * cream-muted, rounded-xl. O próximo card de obra nasce correto. Foi a
 * duplicação manual de exatamente estas coisas que gerou os bugs de capa/alt/
 * crop que esta sessão caçou.
 *
 * As duas VARIANTES reproduzem o look atual de cada contexto byte a byte —
 * variedade editorial preservada, como o dono pediu; só a implementação é uma.
 *   · teaser    (home): 4:3, hover-scale, título 17px, sem crédito.
 *   · editorial (B2C):  4:5, sem hover, crédito (eyebrow) + h3 19px + linha 15px,
 *                       h-full flex-col para grade de altura igual.
 */
type ObraCardVariant = "teaser" | "editorial";

interface ObraCardProps {
  image: string;
  /** Obrigatório — o que faltava e virava bug quando cada card cuidava do seu. */
  alt: string;
  title: string;
  /** Linha de apoio: "tipo" (teaser) ou "linha" (editorial). */
  desc?: string;
  /** Crédito acima do título (só editorial). */
  eyebrow?: string;
  variant?: ObraCardVariant;
  /** Índice para o stagger do Reveal. */
  index?: number;
}

export default function ObraCard({
  image,
  alt,
  title,
  desc,
  eyebrow,
  variant = "teaser",
  index = 0,
}: ObraCardProps) {
  const editorial = variant === "editorial";
  return (
    <Reveal
      variant="fade-up"
      delay={(index % 3) * 80}
      duration={editorial ? 650 : 620}
      distance={editorial ? undefined : 18}
    >
      <figure className={editorial ? "h-full flex flex-col" : "group"}>
        <div
          className={`relative overflow-hidden rounded-xl bg-western-cream-muted ${
            editorial ? "aspect-[4/5]" : "aspect-[4/3]"
          }`}
        >
          <img
            src={image}
            alt={alt}
            loading="lazy"
            decoding="async"
            className={
              editorial
                ? "w-full h-full object-cover"
                : "absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            }
          />
        </div>
        {editorial ? (
          <figcaption className="mt-4">
            {eyebrow && <p className="text-eyebrow">{eyebrow}</p>}
            <h3 className="font-sans text-[17px] font-semibold text-western-green-deep leading-snug mt-1.5">
              {title}
            </h3>
            {desc && (
              <p className="text-[15px] leading-relaxed text-western-stone-warm mt-2">{desc}</p>
            )}
          </figcaption>
        ) : (
          <figcaption className="mt-3">
            <p className="font-sans text-[16px] font-semibold text-western-green-deep leading-snug">
              {title}
            </p>
            {desc && <p className="text-[14px] leading-snug text-western-stone-warm mt-1">{desc}</p>}
          </figcaption>
        )}
      </figure>
    </Reveal>
  );
}
