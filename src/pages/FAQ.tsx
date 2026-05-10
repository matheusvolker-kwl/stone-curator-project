import { Link } from "react-router-dom";
import { useState } from "react";
import { Plus, Minus, ArrowRight } from "lucide-react";
import { BUSINESS } from "@/config/business";

type Item = { q: string; a: React.ReactNode };
type Grupo = { eyebrow: string; titulo: string; itens: Item[] };

const GRUPOS: Grupo[] = [
  {
    eyebrow: "Material & fabricação",
    titulo: "Como a pedra é feita",
    itens: [
      {
        q: "Do que é feita uma pedra Western?",
        a: "Composto mineral de cimento estrutural reforçado com fibra de fios de PET reciclado. Os fios formam, internamente, uma teia tridimensional — descrita pelos fundadores como 'teia de aranha de liga' — que dá ao composto resistência mecânica, leveza e durabilidade muito superiores ao cimento puro ou ao gesso. É um material 100% sustentável: aproveita garrafas plásticas que iriam para aterro como armadura primária do produto.",
      },
      {
        q: "Por que as pedras são ocas por dentro?",
        a: "Por três motivos práticos: (1) ficam até 10× mais leves que pedra natural equivalente, podendo ser instaladas manualmente por 1 ou 2 pessoas; (2) o espaço interno permite passar tubulação de fontes, fiação de iluminação e conduítes de bombas, escondendo a engenharia hidráulica e elétrica; (3) manutenção zero — bombas, LEDs e tubos podem ser trocados sem demolir nada.",
      },
      {
        q: "Cada peça vem de uma pedra natural real?",
        a: "Sim. Toda matriz é moldada a partir de uma pedra natural encontrada em ambientes selecionados — Mata Atlântica, Cerrado, Caatinga e formações rochosas brasileiras. O molde é feito no próprio local, sem mover a pedra original, em respeito absoluto ao ambiente. Hoje produzimos uma matriz em cerca de 1 dia (em 1993, levava 40).",
      },
      {
        q: "Como funciona a pintura?",
        a: "São 6 fases de pintura manual, com 5 cores distintas sobrepostas a cada fase, simulando os processos naturais de sedimentação geológica. Toda pintura é feita à mão, peça por peça. Resiste a cloro de piscina, intempéries, raios UV, chuva e variação térmica — não desbota, não escama, não exige manutenção.",
      },
    ],
  },
  {
    eyebrow: "Catálogo & acabamentos",
    titulo: "O que está disponível",
    itens: [
      {
        q: "Quantos produtos existem no catálogo?",
        a: "50 modelos catalogados, divididos em 11 coleções: Cascatas, Pedras Grandes, Médias, Pequenas, de Borda, Revestimentos (painéis), Fontes, Acessórios (Champanheira, Torneira, Sonora), Pisadas, Fósseis Decorativos e Pedra LED. Cada modelo é oferecido em 4 acabamentos — totalizando 200 SKUs.",
      },
      {
        q: "Quais são os 4 acabamentos?",
        a: "Quartzo (claro, cremoso, off-white com leve tom quente), Arenito (médio, areia, terroso — o mais versátil), Moledo (rústico, marrom morno com textura mais marcada) e Granito (escuro, granulado, com pontilhado mineral). Todos têm o mesmo preço — a escolha é estética, não comercial.",
      },
      {
        q: "Vocês fazem pintura personalizada?",
        a: "Sim. Além dos 4 padrões, podemos pintar peças em tonalidades adaptadas a um ambiente específico — respeitando a biologia do local, fazendo a peça conversar com a vegetação, com a tinta da fachada, com o piso. É serviço sob demanda, comum em projetos premium.",
      },
      {
        q: "O que são os 'conjuntos'?",
        a: <>Composições pré-definidas para 5 categorias de aplicação — piscina, lago, lago reduzido, jardim seco e jardim com fonte. Cada conjunto vem com desconto de <strong>{BUSINESS.descontoConjuntosPercent}%</strong> sobre a soma das peças avulsas equivalentes. Mais previsibilidade de composição com economia operacional.</>,
      },
    ],
  },
  {
    eyebrow: "Projeto & instalação",
    titulo: "Como especificar e instalar",
    itens: [
      {
        q: "Como uso o catálogo no meu projeto 3D?",
        a: <>Toda peça do catálogo Western tem modelo 3D no SketchUp Warehouse — canal <a href={BUSINESS.sketchupWarehouse} target="_blank" rel="noopener noreferrer" className="underline decoration-western-gold/40 underline-offset-2 hover:decoration-western-gold">3dwarehouse.sketchup.com/by/WesternPools</a>. Você baixa as peças, monta a composição inteira no SketchUp do estúdio, testa enquadramentos, valida com cliente, e só compra depois que está aprovado em 3D. Zero surpresa.</>,
      },
      {
        q: "Como é a instalação?",
        a: "A peça chega pronta para instalação. Assentamento com argamassa C3 (encontrada em qualquer loja de material de construção). Junto à peça enviamos kit de pintura com as tintas exatas usadas no acabamento, para retoque dos pontos onde a argamassa fica visível — 3 demãos e a peça está integrada ao ambiente como se fosse uma única pedra. Tempo de instalação de uma cascata completa: algumas horas.",
      },
      {
        q: "Quanto pesa uma peça Western?",
        a: "Pedras Pequenas (PP): até 10 kg. Pedras Médias (PM): 30 a 40 kg. Pedras Grandes (PG): 50 a 100+ kg. Cascatas: 60 a 215 kg. Pedra natural equivalente pesa até 10× mais — uma cascata natural de 2 toneladas exige guindaste, alvará e fechamento de via. Western é entregue em caminhão comum, descarregada manualmente, instalada por 2-3 pessoas em horas.",
      },
      {
        q: "A peça aguenta peso, perfuração e impacto?",
        a: "Sim. Suporta peso humano (você pode pisar, sentar, pular sobre ela), suporta perfuração com furadeira (para passagem de fios sem fraturar), suporta impacto e carga estrutural compatível com o uso paisagístico. Não trinca, não estilhaça, não escama.",
      },
    ],
  },
  {
    eyebrow: "Comercial & entrega",
    titulo: "Como comprar e receber",
    itens: [
      {
        q: "Quem pode comprar?",
        a: "Atendemos exclusivamente B2B: arquitetos, paisagistas, construtoras, garden centers, lojistas e revendas qualificadas com CNPJ ativo. Acesso à tabela de preços e modelos 3D após credenciamento.",
      },
      {
        q: "Qual o pedido mínimo?",
        a: <>Pedido mínimo por nota: <strong>{BUSINESS.pedidoMinimoLabel}</strong>. Esse valor é consistente em todo o site, em todo o catálogo e em todas as condições comerciais — fonte única de verdade.</>,
      },
      {
        q: "Como funciona o pagamento?",
        a: <>As condições de pagamento são definidas caso a caso e informadas ao parceiro durante a negociação comercial.</>,
      },
      {
        q: "Qual o prazo de produção?",
        a: <>{BUSINESS.prazoProducaoLabel}. Conjuntos personalizados (tonalidade ou volume fora do padrão) podem ter prazo estendido — informamos por escrito antes da confirmação.</>,
      },
      {
        q: "Como recebo o pedido?",
        a: <>Duas modalidades: retirada gratuita no ateliê em {BUSINESS.cidadeAtelie}/{BUSINESS.ufAtelie} (com agendamento prévio) ou envio por transportadora contratada pelo parceiro — preparamos a embalagem e liberamos a coleta. Não temos frota própria.</>,
      },
    ],
  },
  {
    eyebrow: "Garantia & durabilidade",
    titulo: "O que esperar ao longo do tempo",
    itens: [
      {
        q: "Qual a garantia?",
        a: <>{BUSINESS.garantiaAnos} anos formais contra defeitos de fabricação. Mas o ponto é outro: peças instaladas em 1995 ainda estão em pé. Western não envelhece mal — envelhece melhor. Musgo natural, oxidação ambiental e pátina do tempo fazem com que a peça fique mais convincente como pedra natural.</>,
      },
      {
        q: "Manutenção dá trabalho?",
        a: "Manutenção zero. A pintura é resistente a cloro, sol, chuva e variação térmica. Não escama, não desbota, não exige retoque periódico. E como a peça é oca por dentro, qualquer troca de bomba, LED ou fiação é feita por dentro, sem demolição.",
      },
      {
        q: "E se chegar uma peça avariada no transporte?",
        a: "Avarias de transporte devem ser registradas no canhoto da nota fiscal no ato do recebimento, com fotos enviadas em até 24h. A Western produz peça de reposição equivalente, sem custo adicional para o parceiro, dentro do prazo padrão de produção.",
      },
    ],
  },
];

export default function FAQ() {
  const [open, setOpen] = useState<string | null>("0-0");
  return (
    <>
      <section className="surface-forest">
        <div className="container-western py-20 md:py-28 max-w-4xl">
          <p className="text-eyebrow text-western-gold-soft mb-5">Perguntas frequentes</p>
          <div className="w-12 h-px bg-western-gold mb-8" />
          <h1 className="font-display text-4xl md:text-6xl text-western-cream leading-[1.05] mb-6">
            Dúvidas técnicas,<br />respostas diretas.
          </h1>
          <p className="text-lg text-western-cream-muted leading-relaxed max-w-2xl">
            O que arquitetos, paisagistas e lojistas mais perguntam antes do primeiro pedido —
            sobre material, catálogo, instalação, comercial e garantia.
          </p>
        </div>
      </section>

      <section className="surface-ivory py-16 md:py-20">
        <div className="container-western max-w-3xl space-y-14">
          {GRUPOS.map((g, gi) => (
            <div key={g.titulo}>
              <p className="text-eyebrow mb-2">{g.eyebrow}</p>
              <h2 className="font-display text-2xl md:text-3xl text-western-green-deep leading-tight mb-6">
                {g.titulo}
              </h2>
              <ul className="border-t border-western-stone-warm/15">
                {g.itens.map((it, ii) => {
                  const id = `${gi}-${ii}`;
                  const aberto = open === id;
                  return (
                    <li key={id} className="border-b border-western-stone-warm/15">
                      <button
                        onClick={() => setOpen(aberto ? null : id)}
                        className="w-full flex items-start justify-between gap-4 text-left py-5 group"
                        aria-expanded={aberto}
                      >
                        <span className="font-display text-base md:text-lg text-western-green-deep group-hover:text-western-gold transition-colors leading-snug">
                          {it.q}
                        </span>
                        <span className="text-western-gold mt-1 flex-shrink-0">
                          {aberto ? <Minus className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
                        </span>
                      </button>
                      {aberto && (
                        <div className="pb-6 pr-2 text-western-stone-warm leading-relaxed text-[15px]">
                          {it.a}
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}

          <div className="pt-4 text-center">
            <p className="text-western-stone-warm mb-5">Não encontrou o que procurava?</p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link to="/por-que-western" className="inline-flex items-center gap-2 h-12 px-7 bg-western-green-deep text-western-cream hover:bg-western-green-deep/90 font-mono text-xs uppercase tracking-[0.22em] transition-colors">
                Ver argumentário completo <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/contato" className="inline-flex items-center gap-2 h-12 px-7 border border-western-green-deep/40 text-western-green-deep hover:border-western-gold hover:text-western-gold font-mono text-xs uppercase tracking-[0.22em] transition-colors">
                Falar com a fábrica
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
