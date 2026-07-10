import { Link } from "react-router-dom";
import { useState } from "react";
import { Plus, Minus, ArrowRight } from "lucide-react";
import Seo from "@/components/seo/Seo";

const OBJEÇÕES: { q: string; a: string }[] = [
  {
    q: "Pedra artificial não fica tão bonita quanto natural.",
    a: "Western não é 'pedra artificial' de revenda — é uma réplica autoral moldada a partir de pedra real. Cada peça nasce do molde de uma pedra natural, com fissuras, sedimentos e textura idênticos; a diferença está no material: um composto mineral (cimento estrutural + fibra de PET reciclado), até 10× mais leve, moldado sem retirar a pedra do ambiente. A três metros de distância, nem o nosso fundador acerta qual é qual. E em três anos, com pátina de musgo e oxidação ambiental, a peça fica ainda mais indistinguível.",
  },
  {
    q: "Vai amarelar com o tempo, vai descascar.",
    a: "A pintura Western é desenvolvida há 33 anos para resistir a cloro, sol, chuva e variação térmica. Não é tinta de parede aplicada por cima — são 6 camadas distintas de pigmento mineral, com 5 cores sobrepostas em cada camada, simulando a sedimentação geológica natural. Garantia formal de 1 ano contra defeito; histórico real: peças instaladas em 1995 ainda estão em pé.",
  },
  {
    q: "É caro.",
    a: "Comparando só o número da peça com pedra natural, sim. Mas a conta completa muda tudo: pedra natural equivalente pesa até 10× mais — guindaste, fechamento de rua, alvará municipal, equipe de içamento por dias. Western entrega em caminhão comum, descarrega manual e a instalação leva horas com argamassa C3 de loja de bairro. No custo total instalado, fica de 30 a 50% mais barato que pedra natural — e mais previsível.",
  },
  {
    q: "É pesada para a laje? Aguenta?",
    a: "Pelo contrário — esse é um dos maiores diferenciais. As pedras são ocas internamente, com armadura de fibra de PET reciclado e cimento estrutural. Uma cascata grande Western pesa cerca de 215 kg; a mesma cascata em pedra natural passa de 2 toneladas. Western viabiliza laje, terraço, mezanino, jardim suspenso e cobertura — projetos que pedra natural inviabiliza.",
  },
  {
    q: "Mas o cliente vai querer pedra de verdade.",
    a: "Os clientes que mais conhecem o mercado já sabem que pedra natural em escala de cascata é um pesadelo logístico — vários já tiveram experiência ruim. Western entrega a estética da natural sem os custos invisíveis. Prova social: já está nos projetos de Neymar Jr., Caito Maia e Tato (Falamansa); em Unique Garden, Cobasi, Rosewood; nas pranchas de Alex Hanazaki, Jader Almeida, Cristina Volker e Mandaia Arquitetura. Esses clientes não aceitariam algo que parecesse 'artificial barato'.",
  },
  {
    q: "Tem garantia? E se quebrar?",
    a: "1 ano formal contra defeito de fabricação. Mas o ponto é que Western quase não quebra: você pode pular em cima, pode furar com furadeira para passar fiação, pode sentar — o composto de cimento com fibra de PET é mais resistente a impacto que pedra natural, que é frágil a fissuras laterais. Em 33 anos, parceiros como Cristal Pool e Genesis continuam comprando há mais de duas décadas — falariam abertamente se houvesse histórico de problemas.",
  },
  {
    q: "Como vai ficar montado? Não quero surpresa.",
    a: "Esse é exatamente o problema da pedra natural — você só sabe como ficou quando o guindaste posiciona. Western resolve isso em definitivo: toda peça do catálogo tem modelo 3D no SketchUp Warehouse. Você puxa a peça pro projeto, monta a composição inteira no SketchUp do estúdio, testa enquadramentos, valida com cliente, e só compra depois que está aprovado em 3D. Zero surpresa. Única empresa do segmento que entrega isso.",
  },
  {
    q: "Manutenção dá trabalho? Tenho que pintar de novo?",
    a: "Manutenção zero. A pintura é resistente a cloro, sol, chuva e variação térmica. Não escama, não desbota, não exige retoque periódico. E como a peça é oca por dentro, se um dia precisar trocar uma bomba, um LED ou passar nova fiação, é fácil — toda a engenharia fica acessível dentro da peça, sem demolição.",
  },
  {
    q: "Não é sustentável, é cimento e plástico.",
    a: "Comparando com pedra natural: extração de toneladas de rocha de uma jazida, transporte com caminhão pesado emitindo CO₂, e cada peça que sai é peça que não volta. Western não retira nada da natureza — o molde é tirado da pedra real no local sem mover a pedra. A fibra estrutural é PET reciclado: cada peça incorpora plástico que iria para aterro. Em qualquer matriz ESG séria, Western pontua melhor que pedra natural.",
  },
  {
    q: "Prefiro fornecedor mais conhecido / mais barato.",
    a: "Em pedra artificial no Brasil, mais conhecido que Western não existe. Somos a empresa que trouxe essa tecnologia para o país em 1993, vinda do Arizona — dos mesmos artistas que assinaram trabalhos da Disney e de Las Vegas. 33 anos de operação com a mesma família. Se a comparação é com produto importado da China ou cimento texturizado por revendedor local, sim, somos mais caros — mas o material é incomparável. Mande uma amostra dos dois lado a lado.",
  },
  {
    q: "Não tenho como ir até a fábrica para ver.",
    a: "Sem problema. Mandamos amostra de acabamento gratuita por correio — uma peça pequena de cada acabamento (Quartzo, Arenito, Moledo, Granito) para você sentir a textura na mão. Também mandamos catálogo completo digital, vídeos de obras executadas, e fazemos videochamada do showroom em Cajamar/SP se quiser ver os tamanhos grandes ao vivo. Cajamar fica na Grande São Paulo — visita ao ateliê é sempre bem-vinda.",
  },
  {
    q: "E se o cliente final não gostar?",
    a: "Por isso o SketchUp 3D resolve antes de comprar. E mais: se o problema for tonalidade, conseguimos pintar peças sob medida adaptadas ao ambiente específico — respeitando a biologia do local, fazendo a peça conversar com a vegetação, com a tinta da fachada, com o piso. Pintura personalizada é serviço sob demanda em projetos premium nossos.",
  },
];

export default function PorQueWestern() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <>
      <Seo
        title="Por que Western — 12 respostas para arquitetos e paisagistas"
        description="As objeções mais comuns sobre pedra artesanal, respondidas com dados e casos reais de 33 anos de obras Western: peso, durabilidade, custo instalado, garantia e mais."
        path="/por-que-western"
      />
      <section className="surface-forest">
        <div className="container-western py-20 md:py-28 max-w-4xl">
          <p className="text-eyebrow text-western-gold-soft mb-5">Por que Western</p>
          <div className="w-12 h-px bg-western-gold mb-8" />
          <h1 className="font-display text-4xl md:text-6xl text-western-cream leading-[1.05] mb-6">
            12 perguntas que todo<br />arquiteto faz antes de especificar.
          </h1>
          <p className="text-lg text-western-cream-muted leading-relaxed max-w-2xl">
            Argumentário direto, baseado em 33 anos de obras executadas. Sem rodeio comercial —
            cada resposta com o número e o caso real por trás.
          </p>
        </div>
      </section>

      <section className="surface-ivory py-16 md:py-20">
        <div className="container-western max-w-3xl">
          <ul className="border-t border-western-stone-warm/15">
            {OBJEÇÕES.map((o, i) => {
              const aberto = open === i;
              return (
                <li key={i} className="border-b border-western-stone-warm/15">
                  <button
                    onClick={() => setOpen(aberto ? null : i)}
                    className="w-full flex items-start justify-between gap-4 text-left py-5 group"
                    aria-expanded={aberto}
                  >
                    <span className="flex items-start gap-4">
                      <span className="font-mono text-[11px] text-western-gold mt-1 tabular-nums">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="font-display text-lg md:text-xl text-western-green-deep group-hover:text-western-gold transition-colors leading-snug">
                        {o.q}
                      </span>
                    </span>
                    <span className="text-western-gold mt-1 flex-shrink-0">
                      {aberto ? <Minus className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
                    </span>
                  </button>
                  {aberto && (
                    <div className="pb-6 pl-10 pr-2 text-western-stone-warm leading-relaxed text-[15px]">
                      {o.a}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>

          <div className="mt-14 text-center">
            <p className="text-western-stone-warm mb-5">Tem outra pergunta?</p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link to="/western-box" className="inline-flex items-center gap-2 h-12 px-7 bg-western-green-deep text-western-cream hover:bg-western-green-deep/90 font-mono text-xs uppercase tracking-[0.22em] transition-colors">
                Receber amostras grátis <ArrowRight className="h-4 w-4" />
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
