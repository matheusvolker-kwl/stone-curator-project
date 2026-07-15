import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import {
  usageForCollection,
  usageReframe,
  PROJETO_SCENES,
  PROJETO_ORDER,
} from "@/lib/usage/scenes";

interface Props {
  collectionHandle?: string | null;
  productTitle: string;
}

/**
 * "Onde usar" — quebra a suposição de que cada peça só serve pra uma coisa.
 * A mesma pedra vai na piscina, no lago, na parede, dentro d'água. Os chips de
 * cena com projeto real levam ao Inspire-se filtrado; as demais cenas ficam
 * como texto educativo (sem link morto). Reforça a leveza e o uso em água só
 * onde é verdade — ver [[western-piscinas-naturais-pitch]] / regras de honestidade.
 */
export default function UsageScenes({ collectionHandle, productTitle }: Props) {
  const profile = usageForCollection(collectionHandle);
  if (!profile) return null;

  const projetos = PROJETO_ORDER.filter((t) => profile.projetos.includes(t));

  return (
    <section
      className="surface-ivory py-14 md:py-20 scroll-mt-24"
      id="onde-usar"
      aria-label={`Onde usar — ${productTitle}`}
    >
      <div className="max-w-5xl mx-auto px-6 md:px-8">
        <header className="mb-8 md:mb-10 max-w-2xl">
          <p className="text-section-label mb-3">Onde usar</p>
          <h2 className="display-lg text-western-green-deep">Onde esta peça vai bem</h2>
          <p className="text-body mt-3 max-w-[60ch]">{usageReframe(profile.agua)}</p>
        </header>

        {projetos.length > 0 && (
          <div className="mb-8">
            <p className="text-eyebrow mb-3">Ver projetos reais</p>
            <div className="flex flex-wrap gap-3">
              {projetos.map((t) => {
                const s = PROJETO_SCENES[t];
                const Icon = s.icon;
                return (
                  <Link
                    key={t}
                    to={`/inspiracoes?tipo=${t}`}
                    aria-label={`Ver projetos de ${s.label.toLowerCase()} no Inspire-se`}
                    className="group tap-target inline-flex items-center gap-2.5 rounded-full border border-western-border-strong bg-white px-5 text-[16px] font-semibold text-western-green-deep transition-colors hover:border-western-green-deep hover:bg-western-paper"
                  >
                    <Icon className="h-5 w-5 text-western-cta" aria-hidden="true" />
                    {s.label}
                    <ArrowRight
                      className="h-4 w-4 text-western-bronze transition-transform motion-safe:group-hover:translate-x-0.5"
                      aria-hidden="true"
                    />
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {profile.tambem.length > 0 && (
          <p className="text-body max-w-[60ch]">
            <span className="font-semibold text-western-green-deep">
              Também fica lindo em:{" "}
            </span>
            {profile.tambem.join(" · ")}.
          </p>
        )}

        {/* Peças sem projeto próprio no Inspire-se ainda ganham um caminho pra lá. */}
        {projetos.length === 0 && (
          <Link
            to="/inspiracoes"
            className="group mt-6 inline-flex items-center gap-2 font-sans text-[16px] font-semibold text-western-cta transition-colors hover:text-western-green-deep"
          >
            Dúvidas de como usar? Inspire-se com projetos reais
            <ArrowRight
              className="h-5 w-5 transition-transform motion-safe:group-hover:translate-x-0.5"
              aria-hidden="true"
            />
          </Link>
        )}
      </div>
    </section>
  );
}
