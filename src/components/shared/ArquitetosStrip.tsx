import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import faisalFoto from "@/assets/arquitetos/marcelo-faisal.png";
import hayasakiFoto from "@/assets/arquitetos/fabiano-hayasaki.jpeg";
import luidiFoto from "@/assets/arquitetos/ronaldo-luidi.webp";

const ARQUITETOS = [
  { nome: "Marcelo Faisal", cidade: "São Paulo · SP", foto: faisalFoto },
  { nome: "Fabiano Hayasaki", cidade: "S. J. Rio Preto · SP", foto: hayasakiFoto },
  { nome: "Ronaldo Luidi", cidade: "São Paulo · SP", foto: luidiFoto },
];

interface Props {
  eyebrow?: string;
  titulo?: React.ReactNode;
  descricao?: React.ReactNode;
}

export default function ArquitetosStrip({ eyebrow, titulo, descricao }: Props) {
  return (
    <section className="mt-20 md:mt-28 pt-14 border-t border-western-stone-warm/20">
      {eyebrow && <p className="text-eyebrow mb-5">{eyebrow}</p>}
      <div className="w-12 h-px bg-western-gold mb-8" />
      {titulo && (
        <h2 className="font-display text-3xl md:text-5xl text-western-green-deep leading-[1.05] mb-8">
          {titulo}
        </h2>
      )}
      {descricao && (
        <p className="text-western-stone-warm leading-relaxed text-lg max-w-2xl mb-12">
          {descricao}
        </p>
      )}

      <ul className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
        {ARQUITETOS.map((a) => (
          <li key={a.nome}>
            <Link
              to="/parceiros-arquitetos"
              className="group block bg-western-cream border border-western-stone-warm/15 hover:border-western-gold/50 shadow-[0_14px_40px_-28px_rgba(20,40,30,0.35)] hover:shadow-[0_22px_55px_-28px_rgba(20,40,30,0.45)] transition-all"
            >
              <div className="aspect-[4/5] overflow-hidden bg-western-green-deep">
                <img
                  src={a.foto}
                  alt={`Retrato de ${a.nome}`}
                  loading="lazy"
                  className="w-full h-full object-cover grayscale-[15%] group-hover:grayscale-0 group-hover:scale-[1.02] transition-all duration-700"
                />
              </div>
              <div className="p-5">
                <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-western-gold mb-1.5">
                  {a.cidade}
                </p>
                <h3 className="font-display text-xl md:text-2xl text-western-green-deep leading-tight">
                  {a.nome}
                </h3>
              </div>
            </Link>
          </li>
        ))}
      </ul>

      <div className="mt-8">
        <Link
          to="/parceiros-arquitetos"
          className="inline-flex items-center gap-2 link-underline font-mono text-xs uppercase tracking-[0.22em] text-western-green-deep"
        >
          Ver todos os arquitetos parceiros <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </section>
  );
}
