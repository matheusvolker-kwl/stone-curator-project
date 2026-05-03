import { Link } from "react-router-dom";
import iconePedra from "@/assets/icone-pedra-bege.png";

export default function About() {
  return (
    <div className="container-western py-20 md:py-28 max-w-4xl">
      <p className="text-eyebrow mb-5">Sobre</p>
      <h1 className="font-display text-5xl md:text-6xl text-western-cream leading-[1.05] mb-12">
        Composto mineral autoral, fabricado peça a peça.
      </h1>
      <div className="space-y-8 text-lg text-western-cream-muted leading-relaxed">
        <p>
          A Western Pools é uma fabricante brasileira de pedras decorativas
          autorais para paisagismo profissional. Não extraímos pedra do meio
          ambiente — reproduzimos com fidelidade autoral a estética das pedras
          naturais em composto mineral de alta resistência.
        </p>
        <p>
          Nosso material proprietário combina leveza, durabilidade e textura
          realista. Cada peça é fabricada artesanalmente, com variação natural
          — cada elemento é único.
        </p>
        <p>
          Atendemos arquitetos, paisagistas, construtoras, garden centers e
          revendas qualificadas mediante cadastro de parceiro.
        </p>
      </div>
      <img src={iconePedra} alt="" className="h-12 mt-16 opacity-60" />
      <div className="mt-12">
        <Link
          to="/parceiro/cadastro"
          className="inline-flex items-center px-8 py-4 bg-western-gold text-western-green-deep hover:bg-western-gold-soft transition-colors font-mono text-xs uppercase tracking-[0.25em]"
        >
          Cadastro de parceiro
        </Link>
      </div>
    </div>
  );
}
