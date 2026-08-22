/**
 * Os 19 alvos do scrap: arquitetos, designers e marcas de mobiliário/iluminação
 * brasileiros. Cada alvo agrupa os canais que a marca mantém — site próprio,
 * Instagram, Pinterest, YouTube — porque o mesmo lançamento costuma aparecer
 * nos quatro com recortes diferentes, e o cruzamento é o que dá a linha do tempo.
 *
 * `site.raiz` é o que o crawler usa como escopo: só segue link que continua
 * dentro dele. `site.extras` são pontos de entrada que nem sempre estão no menu
 * (blog em subdomínio, loja separada) e que o BFS sozinho não alcançaria.
 */
export const ALVOS = [
  {
    slug: "waldir-junior",
    nome: "Waldir Junior",
    categoria: "iluminação",
    site: {
      raiz: "https://www.luminariaswj.com.br/",
      // O portfólio de lighting design vive num domínio à parte da loja.
      extras: ["https://waldirjunior.com/"],
    },
    instagram: "waldirjunior",
    pinterest: "waldirjunior_",
    youtube: { handle: "@WaldirJunior" },
  },
  {
    slug: "joao-armentano",
    nome: "João Armentano",
    categoria: "arquitetura",
    site: { raiz: "https://armentano.arq.br/" },
    instagram: "joaoarmentano",
  },
  {
    slug: "tidelli",
    nome: "Tidelli Outdoor",
    categoria: "mobiliário externo",
    site: { raiz: "https://www.tidelli.com/pt-br" },
    instagram: "tidellioutdoor",
    pinterest: "tidellioutdoor",
  },
  {
    slug: "estudio-bola",
    nome: "Estúdio Bola",
    categoria: "mobiliário",
    site: { raiz: "https://www.estudiobola.com/" },
    instagram: "estudiobola",
    youtube: { handle: "@estudioboladesignemoveis8032" },
  },
  {
    slug: "dpot",
    nome: "DPOT",
    categoria: "mobiliário",
    site: {
      raiz: "https://dpot.com.br/",
      // A dpot objeto é marca irmã em domínio próprio, com catálogo separado.
      extras: ["https://www.dpotobjeto.com.br/"],
    },
    instagram: "dpotbrasil",
    youtube: { canalId: "UCnZ0SYpY7P1ud4k5TL3rOsQ" },
  },
  {
    slug: "jader-almeida",
    nome: "Jader Almeida",
    categoria: "arquitetura e design",
    site: {
      raiz: "https://www.jaderalmeida.com/",
      // A loja e o blog são hosts próprios: o crawler do site principal não
      // chega neles sozinho, mas é onde ficam preço, ficha técnica e datas.
      extras: ["https://www.jaderalmeida.shop/", "https://blog.jaderalmeida.com/"],
    },
    instagram: "jaderalmeida.official",
    pinterest: "jaderalmeidaofficial",
    youtube: { handle: "@sollosjaderalmeida" },
  },
  {
    slug: "felipe-caboclo",
    nome: "Felipe Caboclo",
    categoria: "arquitetura",
    site: { raiz: "https://www.felipecaboclo.com.br/" },
    instagram: "felipecabocloarquitetura",
  },
  {
    slug: "figueiredo-fischer",
    nome: "Figueiredo Fischer",
    categoria: "arquitetura",
    site: { raiz: "https://figueiredofischer.com.br/" },
    instagram: "figueiredo_fischer",
  },
  {
    slug: "laura-rocha",
    nome: "Laura Rocha",
    categoria: "arquitetura",
    site: { raiz: "https://laurarocha.com/" },
    instagram: "laurarocha",
  },
  {
    slug: "mula-preta",
    nome: "Mula Preta",
    categoria: "mobiliário",
    site: { raiz: "https://www.mulapreta.com/mulapreta/" },
    instagram: "mulapreta",
  },
  {
    slug: "olegario-de-sa",
    nome: "Olegário de Sá",
    categoria: "arquitetura",
    site: { raiz: "https://olegariodesa.com.br/" },
    instagram: "olegariodesa_arquiteto",
  },
  {
    slug: "jacobsen",
    nome: "Jacobsen Arquitetura",
    categoria: "arquitetura",
    site: { raiz: "https://jacobsenarquitetura.com/" },
    instagram: "jacobsen.studio",
  },
  {
    slug: "studio-mk27",
    nome: "Studio MK27 (Marcio Kogan)",
    categoria: "arquitetura",
    site: { raiz: "https://mk27.com/" },
    instagram: "studiomk27",
  },
  {
    slug: "guilherme-torres",
    nome: "Guilherme Torres",
    categoria: "arquitetura e design",
    site: { raiz: "https://www.guilhermetorres.com/" },
    instagram: "guilhermetorres",
  },
  {
    slug: "miguel-pinto-guimaraes",
    nome: "Miguel Pinto Guimarães",
    categoria: "arquitetura",
    site: { raiz: "https://mpgarquitetura.com.br/" },
    instagram: "mpgarquitetura",
  },
  {
    slug: "casa-atica",
    nome: "Casa Ática",
    categoria: "mobiliário",
    site: { raiz: "https://www.casaatica.com/" },
    instagram: "casaatica",
  },
  {
    slug: "hanazaki",
    nome: "Alex Hanazaki",
    categoria: "paisagismo",
    site: { raiz: "https://www.hanazaki.com.br/" },
    instagram: "alexhanazaki",
  },
  {
    slug: "oala",
    nome: "Oala Brasil",
    categoria: "mobiliário",
    site: { raiz: "https://oala.com.br/" },
    instagram: "oalabrasil",
  },
  {
    slug: "hio-decor",
    nome: "HIO Decor",
    categoria: "decoração",
    site: { raiz: "https://hiodecor.com.br/" },
    // Único alvo que veio sem rede social na lista original; os dois perfis
    // existem e são oficiais — sem eles a marca ficaria só com o site.
    instagram: "hio_decor",
    pinterest: "hiodecoroficial",
  },
];

/**
 * Post solto que veio na lista sem dono declarado. Fica fora de ALVOS porque
 * não é um perfil pra varrer — é uma URL única pra resolver e atribuir.
 */
export const POSTS_AVULSOS = ["https://www.instagram.com/p/DVTy9fojoLs/"];

export const porSlug = (slug) => ALVOS.find((a) => a.slug === slug);
