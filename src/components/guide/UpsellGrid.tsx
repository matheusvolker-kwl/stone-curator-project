import { ArrowUpRight } from "lucide-react";
import { upsellMap, type Tipo } from "@/data/guideMap";

export default function UpsellGrid({ tipo }: { tipo: Tipo }) {
  const items = upsellMap[tipo];
  return (
    <section className="mt-20 pt-16 border-t border-western-stone-warm/20">
      <div className="max-w-3xl mb-12">
        <p className="text-eyebrow mb-4">Complemento</p>
        <h2 className="font-display text-3xl md:text-4xl text-western-green-deep leading-tight mb-4">
          Complete sua composição
        </h2>
        <p className="text-western-stone-warm leading-relaxed">
          Produtos complementares ajudam a finalizar a composição e otimizam o
          aproveitamento do frete em pedidos B2B.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((it) => (
          <a
            key={it.url}
            href={it.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group border border-western-stone-warm/20 bg-white p-6 flex items-center justify-between gap-4 hover:border-western-gold transition-all hover:-translate-y-0.5"
          >
            <div>
              <p className="text-spec text-western-stone-warm mb-1">Categoria</p>
              <p className="font-display text-xl text-western-green-deep">
                {it.nome}
              </p>
            </div>
            <ArrowUpRight className="h-5 w-5 text-western-stone-warm group-hover:text-western-gold transition-colors shrink-0" />
          </a>
        ))}
      </div>
    </section>
  );
}
