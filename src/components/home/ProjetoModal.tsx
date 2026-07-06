import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import type { Projeto } from "@/data/projetos";

interface Props {
  projeto: Projeto | null;
  onClose: () => void;
}

export default function ProjetoModal({ projeto, onClose }: Props) {
  return (
    <Dialog open={!!projeto} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90dvh] overflow-y-auto bg-western-green-deep border border-western-gold/20 text-western-cream p-0">
        {projeto && (
          <>
            <DialogTitle className="sr-only">{projeto.titulo}</DialogTitle>
            <DialogDescription className="sr-only">{projeto.snippet}</DialogDescription>

            <div className="aspect-video w-full bg-black relative">
              {projeto.video ? (
                <video
                  key={projeto.slug}
                  src={projeto.video}
                  poster={projeto.cover}
                  controls
                  preload="metadata"
                  playsInline
                  className="w-full h-full object-contain"
                />
              ) : (
                <img
                  src={projeto.cover}
                  alt={projeto.titulo}
                  className="w-full h-full object-cover"
                />
              )}
              {projeto.confidencial && (
                <span className="absolute top-3 right-3 font-mono text-[10px] uppercase tracking-[0.22em] bg-western-green-deep/85 border border-western-gold/30 text-western-gold-soft px-2.5 py-1.5">
                  Sob confidencialidade
                </span>
              )}
            </div>

            <div className="p-6 md:p-10">
              <p className="text-eyebrow mb-4">{projeto.eyebrow}</p>
              <div className="w-10 h-px bg-western-gold mb-6" />
              <h3 className="font-display text-3xl md:text-5xl leading-[1.1] mb-8 text-western-cream">
                {projeto.titulo}
              </h3>
              <div className="space-y-5 text-western-cream-muted leading-relaxed text-base max-w-2xl">
                {projeto.texto.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
              <div className="mt-10 pt-6 border-t border-western-gold/20">
                <p className="text-spec text-western-cream-muted/80">
                  {projeto.ficha.join("  ·  ")}
                </p>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
