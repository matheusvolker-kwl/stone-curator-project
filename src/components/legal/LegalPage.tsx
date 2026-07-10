import { ReactNode } from "react";
import Seo from "@/components/seo/Seo";

export default function LegalPage({
  eyebrow,
  titulo,
  atualizadoEm,
  seoPath,
  seoTitle,
  seoDescription,
  children,
}: {
  eyebrow: string;
  titulo: string;
  atualizadoEm: string;
  seoPath?: string;
  seoTitle?: string;
  seoDescription?: string;
  children: ReactNode;
}) {
  return (
    <div className="surface-ivory">
      {seoPath && (
        <Seo
          title={seoTitle ?? `${eyebrow} — Western`}
          description={seoDescription ?? titulo}
          path={seoPath}
        />
      )}
      <div className="container-western py-20 md:py-24 max-w-3xl">
        <p className="text-eyebrow mb-4">{eyebrow}</p>
        <div className="w-12 h-px bg-western-gold mb-6" />
        <h1 className="font-display text-3xl md:text-5xl text-western-green-deep leading-[1.1] mb-3">
          {titulo}
        </h1>
        <p className="text-spec text-western-stone-warm/70 mb-12">
          Atualizado em {atualizadoEm}
        </p>
        <div className="space-y-6 text-western-stone-warm leading-relaxed [&_h2]:font-display [&_h2]:text-2xl [&_h2]:text-western-green-deep [&_h2]:mt-10 [&_h2]:mb-3 [&_h3]:font-mono [&_h3]:text-xs [&_h3]:uppercase [&_h3]:tracking-[0.18em] [&_h3]:text-western-gold [&_h3]:mt-6 [&_h3]:mb-2 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-1.5 [&_a]:underline [&_a]:decoration-western-gold/40 [&_a]:underline-offset-2 hover:[&_a]:decoration-western-gold">
          {children}
        </div>
      </div>
    </div>
  );
}
