import { Link } from "react-router-dom";
import { useState } from "react";
import { ChevronDown, ArrowRight, MessageCircle, FileText, ShieldCheck, Check } from "lucide-react";
import Seo from "@/components/seo/Seo";
import { BUSINESS } from "@/config/business";
import heroParceria from "@/assets/hero-parceria.webp";
import heroParceriaSm from "@/assets/hero-parceria-sm.webp";

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
    a: "Os clientes que mais conhecem o mercado já sabem que pedra natural em escala de cascata é um pesadelo logístico — vários já tiveram experiência ruim. Western entrega a estética da natural sem os custos invisíveis. Prova social: já está nos projetos de Neymar Jr., Caito Maia e Tato (Falamansa); em Unique Garden, Cobasi, Rosewood; nas pranchas de Alex Hanazaki, Jader Almeida e Marcelo Faisal. Esses clientes não aceitariam algo que parecesse 'artificial barato'.",
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

const whatsappHref = `https://wa.me/${BUSINESS.whatsappFabrica}`;

export default function PorQueWestern() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <>
      <Seo
        title="Por que Western — 12 respostas para arquitetos e paisagistas"
        description="As objeções mais comuns sobre pedra artesanal, respondidas com dados e casos reais de 33 anos de obras Western: peso, durabilidade, custo instalado, garantia e mais."
        path="/por-que-western"
      />

      {/* HERO — foto com scrim verde. O scrim é o que garante contraste AA do
          eyebrow e do corpo sobre a foto clara (o texto nunca encosta na foto crua). */}
      <section className="relative overflow-hidden bg-western-green-deep">
        <img
          src={heroParceria}
          srcSet={`${heroParceriaSm} 900w, ${heroParceria} 1800w`}
          sizes="100vw"
          alt="Ateliê Western — pedra artesanal em obra executada."
          loading="eager"
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover object-center"
        />
        {/* Scrim: denso onde o texto vive, aliviando para a foto respirar. */}
        <div
          aria-hidden
          className="absolute inset-0 bg-western-green-deep/85 md:bg-gradient-to-r md:from-western-green-deep/95 md:via-western-green-deep/88 md:to-western-green-deep/60"
        />
        <div className="container-western relative py-16 md:py-24 max-w-4xl">
          <p className="text-eyebrow text-western-gold-soft mb-4">Por que Western</p>
          <div className="w-10 h-[2px] bg-western-gold mb-6" />
          <h1 className="display-xl text-western-cream mb-5">
            12 perguntas que todo arquiteto faz antes de especificar.
          </h1>
          <p className="text-[17px] leading-[1.6] text-western-cream-muted max-w-[48ch]">
            Argumentário direto, baseado em 33 anos de obras executadas. Sem rodeio comercial —
            cada resposta com o número e o caso real por trás.
          </p>
        </div>
      </section>

      {/* ACORDEÃO — quebra de objeções */}
      <section className="surface-ivory py-14 md:py-20">
        <div className="container-western max-w-3xl">
          <p className="text-eyebrow mb-4">As objeções mais comuns · respostas de quem produz</p>

          <ul className="border-t border-western-border-soft">
            {OBJEÇÕES.map((o, i) => {
              const aberto = open === i;
              const painelId = `porque-a-${i}`;
              const botaoId = `porque-q-${i}`;
              return (
                <li key={i} className="border-b border-western-border-soft">
                  <button
                    id={botaoId}
                    onClick={() => setOpen(aberto ? null : i)}
                    className="tap-target w-full flex items-start justify-between gap-4 text-left py-4 group"
                    aria-expanded={aberto}
                    aria-controls={painelId}
                  >
                    <span className="flex items-start gap-4 min-w-0">
                      <span className="text-[14px] font-semibold tabular-nums text-western-bronze mt-[5px] shrink-0">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="text-[18px] md:text-[20px] font-semibold leading-snug text-western-green-deep group-hover:text-western-bronze transition-colors">
                        {o.q}
                      </span>
                    </span>
                    <ChevronDown
                      className={`h-[22px] w-[22px] shrink-0 mt-1 text-western-gold transition-transform duration-200 ${
                        aberto ? "rotate-180" : ""
                      }`}
                      aria-hidden
                    />
                  </button>
                  {aberto && (
                    <div
                      id={painelId}
                      role="region"
                      aria-labelledby={botaoId}
                      className="text-body pb-6 pl-9 pr-1"
                    >
                      {o.a}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>

          {/* CTA — amostra na mão. Primário verde, full-width no mobile. */}
          <section className="mt-12 md:mt-16 rounded-2xl border border-western-border-soft surface-paper px-6 py-9 md:px-10 md:py-12 text-center">
            <p className="text-eyebrow mb-2">Ainda com dúvida?</p>
            <h2 className="display-md text-western-green-deep mb-3">
              Veja e sinta a pedra na sua mão
            </h2>
            <p className="text-body mx-auto max-w-[44ch] mb-7">
              Amostra dos 4 acabamentos — Moledo, Arenito, Granito e Quartzo — grátis pelo correio.
              Ou fale direto com quem produz, sem intermediário.
            </p>

            <div className="flex flex-col sm:flex-row sm:justify-center gap-3 mx-auto max-w-[380px] sm:max-w-none">
              <Link to="/western-box" className="btn-primary w-full sm:w-auto">
                Receber amostras grátis
                <ArrowRight className="h-5 w-5" aria-hidden />
              </Link>
              <Link to="/contato" className="btn-outline-forest w-full sm:w-auto">
                Falar com a fábrica
              </Link>
            </div>

            <a
              href={whatsappHref}
              target="_blank"
              rel="noreferrer"
              className="tap-target mt-4 inline-flex items-center justify-center gap-2 text-[16px] font-semibold text-western-green-deep hover:underline underline-offset-4"
            >
              <MessageCircle className="h-5 w-5" aria-hidden />
              Falar no WhatsApp · {BUSINESS.whatsappLabel}
            </a>

            <div className="mt-6 pt-5 border-t border-western-border-soft flex flex-wrap justify-center gap-x-6 gap-y-3">
              <span className="text-spec inline-flex items-center gap-2">
                <FileText className="h-[18px] w-[18px] text-western-bronze shrink-0" aria-hidden />
                NF-e em todo pedido
              </span>
              <span className="text-spec inline-flex items-center gap-2">
                <ShieldCheck className="h-[18px] w-[18px] text-western-bronze shrink-0" aria-hidden />
                Garantia de {BUSINESS.garantiaLabel}
              </span>
              <span className="text-spec inline-flex items-center gap-2">
                <Check className="h-[18px] w-[18px] text-western-bronze shrink-0" aria-hidden />
                Ateliê desde {BUSINESS.fundadaEm} · {BUSINESS.cidadeAtelie}/{BUSINESS.ufAtelie}
              </span>
            </div>

            <p className="text-meta mt-4">
              {BUSINESS.razaoSocial} · CNPJ {BUSINESS.cnpj} · empresa brasileira
            </p>
          </section>
        </div>
      </section>
    </>
  );
}
