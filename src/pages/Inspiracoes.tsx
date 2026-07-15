// Inspirações — lookbook "shop-the-look" (página NOVA da v2; o site antigo não
// tinha). Port do kit de design (ui_kits/loja-a-vitrine/inspiracao.jsx):
// 3 cenas curadas por tipo de projeto, cada uma com "a ideia por trás" e
// chips das peças usadas levando à linha/PDP correspondente.
import { Link, useSearchParams } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import Seo from "@/components/seo/Seo";
import Reveal from "@/components/shared/Reveal";
import { conjuntoRenders } from "@/data/conjuntoRenders";
import heroCascata from "@/assets/hero-cascata.webp";
import heroParceria from "@/assets/hero-parceria.webp";
import imgUnique from "@/assets/casos-western/unique-garden.webp";
import imgResidencial from "@/assets/casos-western/projeto-residencial.webp";

/** chip de peça → destino (linha para categorias; PDP para peça específica) */
const CHIP_DEST: Record<string, string> = {
  Cascata: "/linhas/cascatas",
  Fonte: "/linhas/fontes-para-jardim",
  "Matacão": "/linhas/pedras-grandes",
  "Pedras Grandes": "/linhas/pedras-grandes",
  "Pedras Médias": "/linhas/pedras-medias",
  "Pedras Pequenas": "/linhas/pedras-pequenas",
  "Pedras de Borda": "/linhas/pedras-de-borda",
  Pisadas: "/linhas/pisadas",
  "Pedra LED": "/produtos/pedra-led",
};

interface Look {
  t: string;
  img: string;
  idea: string;
  pecas: string[];
  tag?: string;
}

const INSP: Record<string, { titulo: string; intro: string; looks: Look[] }> = {
  piscina: {
    titulo: "Como compor sua piscina",
    intro:
      "Veja projetos reais e as peças que dão vida a cada cena. Cada pedra tem um papel — destaque, volume, preenchimento e borda.",
    looks: [
      {
        t: "Cascata que vira paisagem",
        img: heroCascata,
        idea: "Uma cascata ancora o olhar e cria o som da água. Ao redor, pedras médias dão volume e escondem a estrutura, enquanto as pedras de borda arrematam o encontro com o deck — tudo leve, sem guindaste.",
        pecas: ["Cascata", "Pedras Médias", "Pedras de Borda"],
      },
      {
        t: "Borda natural ao entardecer",
        img: conjuntoRenders["conjunto-piscina-itacare-equilibrado"],
        idea: "A pedra LED é o destaque: acende a água quando o dia cai. As pedras de borda desenham o contorno com naturalidade e as pedras pequenas preenchem os vãos, sem deixar buracos à vista.",
        pecas: ["Pedra LED", "Pedras de Borda", "Pedras Pequenas"],
      },
      {
        t: "Prainha com entrada suave",
        img: heroParceria,
        idea: "O matacão traz volume e a rusticidade de um rio de verdade. Em torno dele, as pedras médias fazem a transição e as pedras pequenas preenchem a prainha, criando aquele fundo de praia que convida a entrar.",
        pecas: ["Matacão", "Pedras Médias", "Pedras Pequenas"],
      },
    ],
  },
  jardim: {
    titulo: "Como compor seu jardim",
    intro:
      "Pedra é o que dá calma e permanência a um jardim. Três formas de compor o seu — da peça de destaque ao caminho que conduz o olhar. Cada peça pesa ~10% da pedra natural: entra sem guindaste, até em coberturas e terraços.",
    looks: [
      {
        t: "O jardim seco que acalma",
        img: conjuntoRenders["conjunto-jardim-seco-ibitipoca-equilibrado"],
        idea: "Comece por uma pedra grande como ponto de descanso do olhar. Ao redor, deixe respiro — o vazio faz parte da composição. Médias e pequenas fazem a transição até o chão, e as pisadas desenham um caminho que convida a atravessar devagar.",
        pecas: ["Pedras Grandes", "Pedras Médias", "Pedras Pequenas", "Pisadas"],
      },
      {
        t: "O canto de água que para o tempo",
        img: conjuntoRenders["conjunto-jardim-fonte-pratinha-equilibrado"],
        idea: "Uma fonte transforma o jardim num lugar de pausa: o som da água ocupa o silêncio e puxa o olhar para um só ponto. Envolva a base com pedras de tamanhos variados para que a fonte pareça ter nascido ali.",
        pecas: ["Fonte", "Pedras Grandes", "Pedras Médias", "Pedras Pequenas"],
      },
      {
        t: "A bordadura que emoldura o verde",
        img: imgUnique,
        idea: "Nas beiras de canteiros e caminhos, as pedras contêm a terra e separam o verde do piso com uma linha natural. Pisadas soltas entre as plantas abrem passagem sem interromper o jardim.",
        pecas: ["Pedras Médias", "Pedras Pequenas", "Pisadas"],
      },
    ],
  },
  lago: {
    titulo: "Como compor seu lago",
    intro:
      "Um lago não se resolve com uma pedra só — ele se compõe. Tamanhos que conversam, uma cascata que dá o som da água, uma borda que esconde o acabamento. E se você já tem pedra natural, dá para completar o que existe — lago híbrido.",
    looks: [
      {
        t: "Lago com cascata, direto na cobertura",
        img: conjuntoRenders["conjunto-lago-juparana-equilibrado"],
        idea: "A cascata é o ponto de partida: dá movimento e som. Em volta, pedras grandes ancoram a base e médias fazem a transição até a lâmina. Como o conjunto pesa ~10% da pedra natural, sobe sem guindaste. À noite, a Pedra LED acende a moldura.",
        pecas: ["Cascata", "Pedras Grandes", "Pedras Médias", "Pedra LED"],
      },
      {
        t: "Borda naturalista, ao nível do jardim",
        img: imgResidencial,
        idea: "O segredo de uma borda que parece natural é misturar três tamanhos: grandes marcam os pontos fortes, médias preenchem, pequenas fecham os vãos e escondem a borda do lago. Nunca duas pedras iguais lado a lado.",
        pecas: ["Pedras Grandes", "Pedras Médias", "Pedras Pequenas"],
      },
      {
        t: "Complete a pedra natural que você já tem",
        tag: "Lago híbrido",
        img: conjuntoRenders["conjunto-lago-hibrido-igarape-equilibrado"],
        idea: "Já tem pedra natural e quer ampliar sem trazer peso? Nossas peças reproduzem a pedra natural e entram junto das reais, completando a composição sem caminhão Munck. Use médias e pequenas para emendar o desenho, uma cascata nova e a Pedra LED à noite.",
        pecas: ["Pedras Médias", "Pedras Pequenas", "Cascata", "Pedra LED"],
      },
    ],
  },
};

const TIPOS: Array<[string, string]> = [
  ["piscina", "Piscina"],
  ["jardim", "Jardim"],
  ["lago", "Lago"],
];

export default function Inspiracoes() {
  const [params, setParams] = useSearchParams();
  const tipoParam = params.get("tipo") ?? "piscina";
  const cur = INSP[tipoParam] ? tipoParam : "piscina";
  const data = INSP[cur];

  const setTipo = (id: string) => {
    const next = new URLSearchParams(params);
    next.set("tipo", id);
    setParams(next, { replace: true });
  };

  return (
    <div className="surface-ivory">
      <Seo
        title="Inspire-se — cenas reais com pedra Western"
        description="Lookbook de composições reais: piscina, jardim e lago com pedras artesanais Western. Veja a ideia por trás de cada cena e as peças usadas."
        path="/inspiracoes"
      />
      <div className="container-western py-12 md:py-20">
        {/* Cabeçalho + seletor de tipo */}
        <Reveal variant="fade-up">
          <div className="max-w-3xl">
            <p className="text-eyebrow mb-4">Inspire-se · Cenas reais</p>
            <div className="w-12 h-px bg-western-gold mb-8" />
            <div
              role="group"
              aria-label="Tipo de projeto"
              className="flex flex-wrap gap-3 mb-8"
            >
              {TIPOS.map(([id, label]) => {
                const on = cur === id;
                return (
                  <button
                    key={id}
                    type="button"
                    aria-pressed={on}
                    onClick={() => setTipo(id)}
                    className={`tap-target inline-flex items-center justify-center px-6 rounded-full border text-[16px] font-semibold transition-colors ${
                      on
                        ? "bg-western-cta text-western-cream border-western-cta"
                        : "bg-white border-western-border-strong text-western-green-deep hover:bg-western-paper hover:border-western-green-deep"
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
            <h1 className="display-xl text-western-green-deep">{data.titulo}</h1>
            <p className="text-body mt-5 max-w-[60ch]">{data.intro}</p>
          </div>
        </Reveal>

        {/* Looks — editorial alternado */}
        <div className="mt-14 md:mt-20 space-y-16 md:space-y-24">
          {data.looks.map((lk, i) => (
            <Reveal key={`${cur}-${i}`} variant="fade-up">
              <article
                className={`grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center ${
                  i % 2 === 1 ? "lg:[&>*:first-child]:order-2" : ""
                }`}
              >
                <div className="relative frame-product rounded-[16px] overflow-hidden aspect-[4/3]">
                  <span className="absolute top-4 left-4 z-10 w-11 h-11 flex items-center justify-center rounded-[10px] bg-western-green-deep text-western-gold font-sans font-bold text-[18px] tabular-nums">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <img
                    src={lk.img}
                    alt={lk.t}
                    loading={i === 0 ? "eager" : "lazy"}
                    decoding="async"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h2 className="display-md text-western-green-deep">{lk.t}</h2>
                  {lk.tag && (
                    <span className="mt-3 inline-flex items-center gap-1.5 rounded-[6px] border border-western-gold/50 bg-western-gold/15 px-3 py-1 text-[14px] font-semibold text-western-bronze">
                      <span aria-hidden>◆</span>
                      {lk.tag}
                    </span>
                  )}
                  <p className="text-eyebrow mt-6 mb-2">A ideia por trás</p>
                  <p className="text-body max-w-[56ch]">{lk.idea}</p>
                  <p className="text-eyebrow mt-8 mb-1">Peças usadas</p>
                  <p className="text-meta mb-3">Toque para ver a linha</p>
                  <div className="flex flex-wrap gap-3">
                    {lk.pecas.map((nome) => (
                      <Link
                        key={nome}
                        to={CHIP_DEST[nome] ?? "/guia-de-composicao"}
                        className="group/chip tap-target inline-flex items-center gap-2 rounded-full border border-western-border-strong bg-white px-5 text-[16px] font-semibold text-western-green-deep transition-colors hover:border-western-green-deep hover:bg-western-paper"
                      >
                        <span className="h-2 w-2 rounded-full bg-western-gold" aria-hidden />
                        {nome}
                        {/* seta = signifier de navegação (o chip é link, precisa parecer link) */}
                        <ArrowRight
                          className="h-4 w-4 text-western-bronze transition-transform motion-safe:group-hover/chip:translate-x-0.5"
                          aria-hidden
                        />
                      </Link>
                    ))}
                  </div>
                </div>
              </article>
            </Reveal>
          ))}
        </div>

        {/* CTA — guia (faixa verde pontual; o dourado é o acento que dá contraste) */}
        <Reveal variant="fade-up">
          <section className="mt-16 md:mt-24 surface-forest rounded-[16px] text-center px-6 py-12 md:py-16">
            <h2 className="display-md text-western-cream max-w-xl mx-auto">
              Monte a sua composição no guia
            </h2>
            <p className="text-[17px] leading-[1.6] text-western-cream-muted max-w-[44ch] mx-auto mt-4 mb-8">
              Combine as peças de cada cena, no seu acabamento, com preço de
              parceiro após o cadastro (CNPJ).
            </p>
            <div className="max-w-sm mx-auto">
              <Link
                to="/guia-de-composicao"
                className="btn-gold w-full"
              >
                Começar no guia
                <ArrowRight className="h-5 w-5" aria-hidden />
              </Link>
            </div>
            <p className="mt-7 text-[14px] text-western-cream-muted">
              Ateliê desde 1993 · Compra segura · Garantia de 1 ano
            </p>
          </section>
        </Reveal>
      </div>
    </div>
  );
}
