import { Link } from "react-router-dom";
import logoCobasi from "@/assets/parceiros/cobasi.png";
import logoUnique from "@/assets/parceiros/unique-garden.png";
import logoCristal from "@/assets/parceiros/cristal-pool.png";
import logoBiopet from "@/assets/parceiros/biopet.png";

// TODO Genesis: arquivo recebido veio em branco — exibido como wordmark até receber logo válido.
const PARCEIROS_INSTITUCIONAIS = [
  { nome: "Cobasi", site: "https://www.cobasi.com.br", logo: logoCobasi },
  { nome: "Unique Garden", site: "https://www.uniquegarden.com.br", logo: logoUnique },
  { nome: "Cristal Pool", site: "https://www.cristalpool.com.br", logo: logoCristal },
  { nome: "Genesis Ecossistemas", site: "https://genesisecossistemas.com", logo: null },
  { nome: "Biopet Lagos", site: "https://bplagos.com.br", logo: logoBiopet },
];

export default function About() {
  return (
    <div className="surface-ivory">
      <div className="container-western py-20 md:py-28 max-w-4xl">
        <p className="text-eyebrow mb-5">Sobre · A Western</p>
        <div className="w-12 h-px bg-western-gold mb-8" />
        <h1 className="font-display text-4xl md:text-6xl text-western-green-deep leading-[1.05] mb-12">
          Pedra é tempo —<br />
          nós só revelamos o que ela já é.
        </h1>
        <div className="space-y-8 text-lg text-western-stone-warm leading-relaxed">
          <p>
            A Western é uma fabricante brasileira de pedras decorativas autorais
            para paisagismo profissional. Não extraímos pedra do meio ambiente —
            reproduzimos com fidelidade autoral a estética das pedras naturais
            em composto mineral de alta resistência.
          </p>
          <p>
            Nosso material proprietário combina leveza, durabilidade e textura
            realista. Cada peça é fabricada artesanalmente, com variação natural —
            cada elemento é único.
          </p>
          <p>
            Trabalhamos sob encomenda, com tiragem limitada por estação. O que
            entregamos não é volume: é procedência, consistência cromática e a
            certeza de que a peça que chega ao canteiro é a peça que foi
            especificada. Atendemos arquitetos, paisagistas, construtoras,
            garden centers e revendas qualificadas mediante credenciamento.
          </p>
        </div>

        {/* Camada 3 — parceiros institucionais */}
        <section className="mt-24 md:mt-32 pt-16 border-t border-western-stone-warm/20">
          <p className="text-eyebrow mb-5">Atendemos há mais de uma década</p>
          <div className="w-12 h-px bg-western-gold mb-8" />
          <h2 className="font-display text-3xl md:text-5xl text-western-green-deep leading-[1.05] mb-8">
            Marcas que escolheram<br />repetir a Western.
          </h2>
          <p className="text-western-stone-warm leading-relaxed text-lg max-w-2xl mb-12">
            Cobasi não fica anos com fornecedor que falha. Unique Garden não revende
            ao seu hóspede algo que não passe no padrão de hospitalidade de luxo.
            Estes são parceiros institucionais que voltam a comprar há décadas — e
            essa é a métrica de qualidade que mais respeitamos.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-px bg-western-stone-warm/15 border border-western-stone-warm/15">
            {PARCEIROS_INSTITUCIONAIS.map((p) => (
              <a
                key={p.nome}
                href={p.site}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-western-cream/60 aspect-[3/2] flex items-center justify-center px-4 py-6 group hover:bg-western-cream transition-colors"
                aria-label={p.nome}
              >
                <span className="font-display text-lg md:text-xl text-western-green-deep text-center leading-tight group-hover:text-western-gold transition-colors">
                  {p.nome}
                </span>
              </a>
            ))}
          </div>
        </section>

        <div className="mt-16">
          <Link to="/parceiro/cadastro" className="btn-outline-forest">
            Solicitar credenciamento
          </Link>
        </div>
      </div>
    </div>
  );
}
