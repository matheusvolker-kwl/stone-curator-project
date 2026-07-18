/**
 * LAB DE SEÇÕES — a bancada onde o dono escolhe, não uma página do site.
 * ---------------------------------------------------------------------------
 * Duas decisões estão empilhadas aqui:
 *   1. /a-pedra, bloco "O número + O 3D" — o conteúdo é bom, a apresentação não.
 *   2. /contrate-a-western, seções 3+4 — abrem com as MESMAS três palavras
 *      ("Um único parceiro…"), vestem o mesmo cartão, e o conteúdo se sobrepõe.
 *
 * Esta tela é BALCÃO (existe pra decidir e operar, não pra convencer): controles
 * de 44px, sem parágrafo de apoio, sem escala editorial na moldura. O que tem
 * escala editorial é o CONTEÚDO das variantes — elas são Palco, e é justamente
 * isso que está em julgamento.
 *
 * Padrão de leitura: por default mostra as três empilhadas, porque comparar é a
 * tarefa. O isolamento (A / B / C) existe pra quando ele já afunilou e quer ver
 * uma sozinha, do jeito que vai pro ar.
 *
 * NÃO É ROTA DE PRODUÇÃO: sai do ar quando a escolha for feita, e vai com
 * noindex pra não entrar em busca enquanto existe.
 */
import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Seo from "@/components/seo/Seo";

/* Rodada 2 da seção do número. A rodada 1 (A/B/C) foi resolvida: o dono escolheu
   a B, mandou aprimorar, e reprovou o refino por POLUIÇÃO — "pegue todo o
   conteúdo e gere novas 3 opções". D/E/F carregam o mesmo inventário integral
   (18 unidades) com três estratégias distintas de CARGA, não de enfeite.
   A/B/C seguem no repo como histórico; saíram do lab para não confundir a
   escolha com seis opções na mesa. */
import APedraNumeroD from "./variantes/APedraNumeroD";
import APedraNumeroE from "./variantes/APedraNumeroE";
import APedraNumeroF from "./variantes/APedraNumeroF";
import ContrateServicosA from "./variantes/ContrateServicosA";
import ContrateServicosB from "./variantes/ContrateServicosB";
import ContrateServicosC from "./variantes/ContrateServicosC";

interface Variante {
  /* Aberto de propósito: as famílias estão em rodadas diferentes e não
     compartilham letra (contrate está em A/B/C, a-pedra foi para D/E/F). */
  letra: string;
  titulo: string;
  tese: string;
  sacrifica: string;
  Componente: () => JSX.Element;
}

interface Familia {
  key: string;
  rotulo: string;
  ondeVive: string;
  problema: string;
  variantes: Variante[];
}

const FAMILIAS: Familia[] = [
  {
    key: "a-pedra",
    rotulo: "A pedra · o número",
    ondeVive: "/a-pedra",
    problema:
      "Rodada 2. O conteúdo agora está completo e bom — são 18 unidades (o peso e o que ele resolve, o método do render, custo, oca, ambiente, assinatura). O problema não é mais o que dizer, é a CARGA: tudo empilhado numa seção só virou parede. As três abaixo carregam o mesmo inventário integral, com estratégias diferentes de densidade. Se uma delas tiver a mesma densidade da anterior com outra roupa, ela falhou.",
    variantes: [
      {
        letra: "D",
        titulo: "Uma coisa por vez",
        tese: "A carga não some, ela se espalha: uma sequência vertical de momentos, cada um com uma ideia e ar em volta. Picos (o número, o par render/obra) alternam com vales num trilho fixo.",
        sacrifica: "A seção fica bem mais alta; quem passa o olho rápido pode parar no meio.",
        Componente: APedraNumeroD,
      },
      {
        letra: "E",
        titulo: "Argumento × ficha",
        tese: "Separa dois registros que se leem diferente: o que se LÊ fica curto e alto (o número, o par render/obra); o que se CONSULTA desce para uma ficha técnica que se escaneia, sem cartão e sem ícone.",
        sacrifica: "Os oito argumentos que descem para a ficha perdem força retórica e viram dado.",
        Componente: APedraNumeroE,
      },
      {
        letra: "F",
        titulo: "Duas perguntas",
        tese: "Reorganiza tudo como resposta às duas perguntas que o cliente faz de verdade: “dá para instalar no meu caso?” e “vou receber o que eu vi?”. Resposta se lê mais leve que afirmação solta.",
        sacrifica: "O tom fica mais dialogado, menos editorial-silencioso.",
        Componente: APedraNumeroF,
      },
    ],
  },
  {
    key: "contrate",
    rotulo: "Contrate · argumento × entrega",
    ondeVive: "/contrate-a-western",
    problema:
      'As duas seções abrem com literalmente as mesmas três palavras ("Um único parceiro…"), usam o mesmo componente de cartão, quatro cada, e o conteúdo se sobrepõe ("Render antes da obra" × "Projeto & Render"). Mas os papéis são diferentes: uma responde por que a Western, a outra o que você recebe.',
    variantes: [
      {
        letra: "A",
        titulo: "Fundir — o serviço é a espinha",
        tese: "Uma seção só. A entrega é a espinha visível e o diferencial entra ancorado dentro dela, como prova daquele item.",
        sacrifica: '"Por que a Western" deixa de existir como seção autônoma.',
        Componente: ContrateServicosA,
      },
      {
        letra: "B",
        titulo: "Manter as duas, trocar o dispositivo",
        tese: "Os dois papéis merecem existir separados — o erro é vestirem a mesma roupa. A entrega vira índice de escopo, não vitrine.",
        sacrifica: "A página continua com duas seções: resolve a repetição de forma, não a de tamanho.",
        Componente: ContrateServicosB,
      },
      {
        letra: "C",
        titulo: "Subordinar — o diferencial vira prova do passo",
        tese: "A entrega fica sozinha e forte. Os diferenciais se distribuem colados na entrega correspondente, como linha de prova discreta.",
        sacrifica: "É a mais agressiva em subtração: a página perde uma seção inteira.",
        Componente: ContrateServicosC,
      },
    ],
  },
];

export default function LabSecoes() {
  const [params, setParams] = useSearchParams();
  const familiaKey = params.get("f") ?? FAMILIAS[0].key;
  const familia = FAMILIAS.find((f) => f.key === familiaKey) ?? FAMILIAS[0];
  const [foco, setFoco] = useState<string>("todas");

  /* Se o foco não existe na família atual (trocou de família), cai para "todas"
     em vez de mostrar tela vazia. */
  const focoValido = foco === "todas" || familia.variantes.some((v) => v.letra === foco);
  const visiveis =
    !focoValido || foco === "todas"
      ? familia.variantes
      : familia.variantes.filter((v) => v.letra === foco);

  const chip =
    "inline-flex h-11 items-center rounded-full border px-4 font-sans text-[15px] font-semibold transition-colors";
  const chipOn = "border-western-cta bg-western-cta text-western-cream";
  const chipOff =
    "border-western-border-strong bg-white text-western-green-deep hover:border-western-green-deep";

  return (
    <>
      <Seo
        title="Lab de seções — Western (interno)"
        description="Bancada de comparação de variantes. Rota interna, fora do site."
        path="/lab/secoes"
        noindex
      />

      {/* BARRA DE CONTROLE — sticky, porque a tarefa é rolar comparando e voltar
          a trocar. z-40 fica acima do conteúdo das variantes e abaixo de
          qualquer modal do app. */}
      <div className="sticky top-0 z-40 border-b border-western-border-soft bg-western-ivory/95 backdrop-blur">
        <div className="container-western py-4">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
            <Link
              to={familia.ondeVive}
              className="inline-flex h-11 items-center gap-2 font-sans text-[15px] font-semibold text-western-green-deep hover:text-western-cta transition-colors"
            >
              <ArrowLeft className="h-5 w-5" strokeWidth={1.75} aria-hidden />
              Ver como está hoje
            </Link>

            <div className="flex flex-wrap gap-2">
              {FAMILIAS.map((f) => (
                <button
                  key={f.key}
                  type="button"
                  onClick={() => {
                    setParams({ f: f.key });
                    setFoco("todas");
                  }}
                  aria-pressed={f.key === familia.key}
                  className={`${chip} ${f.key === familia.key ? chipOn : chipOff}`}
                >
                  {f.rotulo}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap gap-2 md:ml-auto">
              {/* Derivado da família: as letras mudam entre rodadas. */}
              {["todas", ...familia.variantes.map((v) => v.letra)].map((k) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => setFoco(k)}
                  aria-pressed={(focoValido ? foco : "todas") === k}
                  className={`${chip} ${
                    (focoValido ? foco : "todas") === k ? chipOn : chipOff
                  }`}
                >
                  {k === "todas" ? "Todas" : k}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* O PROBLEMA, uma vez por família. Sem isto o lab vira concurso de
          beleza: ele precisa saber o que cada variante está tentando resolver. */}
      <div className="border-b border-western-border-soft surface-paper">
        <div className="container-western py-8">
          <p className="text-eyebrow">O problema em {familia.ondeVive}</p>
          <p className="mt-3 max-w-prose text-[15px] leading-[1.55] text-western-stone-warm">
            {familia.problema}
          </p>
        </div>
      </div>

      {visiveis.map((v) => (
        <section key={v.letra} aria-label={`Variante ${v.letra} — ${v.titulo}`}>
          {/* FICHA DA VARIANTE — o que ela propõe e o que ela custa, lado a
              lado. O custo aparece SEMPRE: variante sem custo declarado é
              variante que ainda não foi pensada até o fim. */}
          <div className="surface-forest">
            <div className="container-western py-6">
              <div className="grid gap-4 md:grid-cols-12 md:items-start md:gap-8">
                <div className="md:col-span-4">
                  <div className="flex items-baseline gap-3">
                    <span className="font-display text-[40px] leading-none text-western-gold-soft">
                      {v.letra}
                    </span>
                    <span className="font-sans text-[18px] font-semibold text-western-cream">
                      {v.titulo}
                    </span>
                  </div>
                </div>
                <p className="md:col-span-4 text-[15px] leading-[1.55] text-western-cream/85">
                  {v.tese}
                </p>
                <p className="md:col-span-4 text-[15px] leading-[1.55] text-western-cream/60">
                  <span className="text-western-gold-soft">Custa:</span> {v.sacrifica}
                </p>
              </div>
            </div>
          </div>

          <v.Componente />
        </section>
      ))}

      <div className="surface-paper border-t border-western-border-soft">
        <div className="container-western py-10">
          <p className="text-[15px] leading-[1.55] text-western-stone-warm">
            Rota interna, com noindex. Sai do ar quando a escolha for feita.
          </p>
        </div>
      </div>
    </>
  );
}
