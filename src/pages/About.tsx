import { Link } from "react-router-dom";
import MarcasInstitucionais from "@/components/shared/MarcasInstitucionais";

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

        <MarcasInstitucionais
          eyebrow="Atendemos há mais de uma década"
          titulo={<>Marcas que escolheram<br />repetir a Western.</>}
          descricao={
            <>
              Cobasi não fica anos com fornecedor que falha. Unique Garden não revende
              ao seu hóspede algo que não passe no padrão de hospitalidade de luxo.
              Estes são parceiros institucionais que voltam a comprar há décadas — e
              essa é a métrica de qualidade que mais respeitamos.
            </>
          }
        />

        <div className="mt-16">
          <Link to="/parceiro/cadastro" className="btn-outline-forest">
            Solicitar credenciamento
          </Link>
        </div>
      </div>
    </div>
  );
}
