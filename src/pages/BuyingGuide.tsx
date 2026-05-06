import { useMemo, useReducer } from "react";
import { ArrowRight, Waves, Droplets, Trees, Ruler, Sparkles, Layers, Mountain } from "lucide-react";
import StepShell from "@/components/guide/StepShell";
import OptionCard from "@/components/guide/OptionCard";
import GuideProgress from "@/components/guide/GuideProgress";
import GuideResultado from "@/components/guide/GuideResultado";
import GuideConsultor from "@/components/guide/GuideConsultor";
import {
  nivelMeta,
  resolveConjunto,
  tamanhoLabels,
  tipoLabels,
  type Composicao,
  type GuideAnswers,
  type Jardim,
  type Nivel,
  type Tipo,
} from "@/data/guideMap";

type State = GuideAnswers & { step: number; started: boolean };

type Action =
  | { type: "START" }
  | { type: "SET_TIPO"; value: Tipo }
  | { type: "SET_TAMANHO"; value: string }
  | { type: "SET_COMPOSICAO"; value: Composicao }
  | { type: "SET_JARDIM"; value: Jardim }
  | { type: "SET_NIVEL"; value: Nivel }
  | { type: "GOTO"; step: number }
  | { type: "BACK" }
  | { type: "RESET" };

const initial: State = { step: 0, started: false };

function reducer(s: State, a: Action): State {
  switch (a.type) {
    case "START":
      return { ...s, started: true, step: 1 };
    case "SET_TIPO":
      return { ...initial, started: true, tipo: a.value, step: 2 };
    case "SET_TAMANHO":
      return { ...s, tamanho: a.value, step: 3 };
    case "SET_COMPOSICAO":
      return { ...s, composicao: a.value, step: 4 };
    case "SET_JARDIM":
      return { ...s, jardim: a.value, step: 4 };
    case "SET_NIVEL":
      return { ...s, nivel: a.value, step: 99 };
    case "GOTO":
      return { ...s, step: a.step };
    case "BACK":
      return { ...s, step: Math.max(1, s.step === 99 ? (s.tipo === "piscina" ? 3 : 4) : s.step - 1) };
    case "RESET":
      return initial;
  }
}

const tamanhoOptions: Record<Tipo, Array<{ id: string; label: string; ref: string }>> = {
  lago: [
    { id: "ate-4", label: "Até 4 m²", ref: "Lago compacto, jardim residencial" },
    { id: "4-a-10", label: "4 a 10 m²", ref: "Mais comum em projetos residenciais" },
    { id: "10-a-20", label: "10 a 20 m²", ref: "Lago de destaque, área nobre" },
    { id: "acima-20", label: "Acima de 20 m²", ref: "Projeto especial, atendimento consultivo" },
  ],
  piscina: [
    { id: "ate-12", label: "Até 12 m²", ref: "Piscina pequena ou spa" },
    { id: "12-a-32", label: "12 a 32 m²", ref: "Padrão residencial" },
    { id: "32-a-60", label: "32 a 60 m²", ref: "Piscina ampla, área social" },
    { id: "acima-60", label: "Acima de 60 m²", ref: "Projeto comercial ou cenográfico" },
  ],
  jardim: [
    { id: "ate-2", label: "Até 2 m²", ref: "Canteiro pontual, vaso de chão" },
    { id: "2-a-10", label: "2 a 10 m²", ref: "Jardim residencial padrão" },
    { id: "10-a-20", label: "10 a 20 m²", ref: "Jardim de entrada ou fundos" },
    { id: "acima-20", label: "Acima de 20 m²", ref: "Paisagismo amplo, atendimento consultivo" },
  ],
};

export default function BuyingGuide() {
  const [s, dispatch] = useReducer(reducer, initial);
  const onReset = () => dispatch({ type: "RESET" });
  const onBack = () => dispatch({ type: "BACK" });

  const resolved = useMemo(() => resolveConjunto(s), [s]);
  const showResult = s.step === 99 || resolved === "consultor";

  // Etapas para o GuideProgress (dinâmico por tipo)
  const progressSteps = useMemo(() => {
    if (!s.tipo) return [];
    const isPiscina = s.tipo === "piscina";
    const items: Array<{ key: string; label: string; value?: string; stepNum: number }> = [
      { key: "ambiente", label: "Ambiente", value: tipoLabels[s.tipo], stepNum: 1 },
      {
        key: "tamanho",
        label: "Área",
        value: s.tamanho ? tamanhoLabels[s.tamanho] : undefined,
        stepNum: 2,
      },
    ];
    if (!isPiscina) {
      items.push({
        key: "composicao",
        label: s.tipo === "lago" ? "Composição" : "Tipo",
        value:
          s.tipo === "lago"
            ? s.composicao === "somenteWestern"
              ? "Só Western"
              : s.composicao === "comNaturais"
                ? "Western + naturais"
                : undefined
            : s.jardim === "seco"
              ? "Seco"
              : s.jardim === "comFonte"
                ? "Com fonte"
                : undefined,
        stepNum: 3,
      });
    }
    items.push({
      key: "estilo",
      label: "Estilo",
      value: s.nivel ? nivelMeta[s.tipo][s.nivel].label : undefined,
      stepNum: isPiscina ? 3 : 4,
    });
    const isResult = s.step === 99;
    return items.map((it) => ({
      key: it.key,
      label: it.label,
      value: it.value,
      done: isResult || s.step > it.stepNum,
      current: !isResult && s.step === it.stepNum,
      onClick:
        it.value && (isResult || s.step > it.stepNum)
          ? () => dispatch({ type: "GOTO", step: it.stepNum })
          : undefined,
    }));
  }, [s]);

  return (
    <div className="surface-ivory min-h-screen">
      <div className="container-western py-12 md:py-20 max-w-5xl">
        {!s.started ? (
          <Intro onStart={() => dispatch({ type: "START" })} />
        ) : (
          <div className="space-y-8">
            {progressSteps.length > 0 && <GuideProgress steps={progressSteps} />}
            <div className="border border-western-stone-warm/20 bg-white p-6 md:p-12">
              {showResult && resolved === "consultor" && s.tipo && s.tamanho ? (
                <GuideConsultor tipo={s.tipo} tamanho={s.tamanho} onReset={onReset} />
              ) : showResult && resolved && resolved !== "consultor" ? (
                <GuideResultado conjunto={resolved} answers={s} onReset={onReset} />
              ) : (
                <Steps state={s} dispatch={dispatch} onBack={onBack} onReset={onReset} />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Intro({ onStart }: { onStart: () => void }) {
  return (
    <div className="grid md:grid-cols-[3fr_2fr] gap-12 lg:gap-20 items-center">
      <div>
        <p className="text-eyebrow mb-5">Guia de Composição Western</p>
        <div className="w-12 h-px bg-western-gold mb-8" />
        <h1 className="font-display text-4xl md:text-6xl text-western-green-deep leading-[1.05] mb-6">
          O conjunto certo,<br />em quatro perguntas.
        </h1>
        <p className="text-western-stone-warm text-lg leading-relaxed mb-4 max-w-2xl">
          Responda a um breve roteiro e receba uma composição autoral pronta para
          especificação — com peças, acabamento e investimento estimado.
        </p>
        <p className="text-sm text-western-stone-warm/80 leading-relaxed mb-10 max-w-2xl">
          Atendimento dedicado a parceiros B2B: arquitetos, paisagistas, construtoras
          e revendas.
        </p>
        <div className="flex flex-wrap gap-6 items-center mb-10 text-sm text-western-stone-warm">
          <span className="flex items-center gap-2"><Sparkles className="h-4 w-4 text-western-gold" /> 4 perguntas · ~1 min</span>
          <span className="flex items-center gap-2"><Layers className="h-4 w-4 text-western-gold" /> 45 conjuntos curados</span>
        </div>
        <button onClick={onStart} className="btn-gold">
          Compor meu projeto <ArrowRight className="h-4 w-4" />
        </button>
      </div>
      <div className="hidden md:block aspect-[4/5] bg-western-green-deep relative overflow-hidden">
        <svg viewBox="0 0 400 500" className="w-full h-full" aria-hidden="true">
          <rect width="400" height="500" fill="hsl(var(--western-green-deep))" />
          <g fill="hsl(var(--western-gold) / 0.18)">
            <ellipse cx="120" cy="380" rx="110" ry="48" />
            <ellipse cx="260" cy="350" rx="140" ry="62" />
            <ellipse cx="200" cy="280" rx="80" ry="34" />
            <ellipse cx="310" cy="240" rx="50" ry="22" />
          </g>
          <line x1="20" y1="430" x2="380" y2="430" stroke="hsl(var(--western-gold) / 0.4)" strokeWidth="1" />
          <text x="30" y="60" fontFamily="monospace" fontSize="10" letterSpacing="3" fill="hsl(var(--western-gold) / 0.6)">
            COMPOSIÇÃO 03
          </text>
        </svg>
      </div>
    </div>
  );
}

function Steps({
  state,
  dispatch,
  onBack,
  onReset,
}: {
  state: State;
  dispatch: React.Dispatch<Action>;
  onBack: () => void;
  onReset: () => void;
}) {
  const back = state.step > 1 ? onBack : undefined;

  if (state.step === 1) {
    return (
      <StepShell
        stepKey="tipo"
        pergunta="Para qual ambiente você está compondo?"
        subtitulo="Cada ambiente tem uma curadoria de peças, escala e acabamento próprios."
        onReset={onReset}
      >
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <OptionCard
            title="Lago ornamental"
            desc="Espelhos d'água, lagos com peixes, jardins aquáticos."
            icon={<Waves className="h-7 w-7" />}
            selected={state.tipo === "lago"}
            onClick={() => dispatch({ type: "SET_TIPO", value: "lago" })}
          />
          <OptionCard
            title="Piscina"
            desc="Borda, cascata e ambientação ao redor da piscina."
            icon={<Droplets className="h-7 w-7" />}
            selected={state.tipo === "piscina"}
            onClick={() => dispatch({ type: "SET_TIPO", value: "piscina" })}
          />
          <OptionCard
            title="Jardim seco"
            desc="Canteiros, áreas de paisagismo, vasos e fontes."
            icon={<Trees className="h-7 w-7" />}
            selected={state.tipo === "jardim"}
            onClick={() => dispatch({ type: "SET_TIPO", value: "jardim" })}
          />
        </div>
      </StepShell>
    );
  }

  if (!state.tipo) return null;

  if (state.step === 2) {
    const opts = tamanhoOptions[state.tipo];
    const pergunta =
      state.tipo === "lago"
        ? "Qual a área aproximada do lago?"
        : state.tipo === "piscina"
          ? "Qual a área aproximada da piscina?"
          : "Qual a área aproximada do jardim?";
    return (
      <StepShell
        stepKey="tamanho"
        pergunta={pergunta}
        subtitulo="A escala determina a quantidade de peças e a proporção da composição."
        onBack={back}
        onReset={onReset}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {opts.map((o) => (
            <OptionCard
              key={o.id}
              title={o.label}
              desc={o.ref}
              icon={<Ruler className="h-6 w-6" />}
              selected={state.tamanho === o.id}
              onClick={() => dispatch({ type: "SET_TAMANHO", value: o.id })}
              size="compact"
            />
          ))}
        </div>
      </StepShell>
    );
  }

  if (state.step === 3) {
    if (state.tipo === "lago") {
      return (
        <StepShell
          stepKey="composicao"
          pergunta="O projeto vai usar pedras naturais junto?"
          subtitulo="Se você já está usando pedras naturais (rolados, basalto, etc), reduzimos a quantidade de peças Western para uma composição balanceada."
          onBack={back}
          onReset={onReset}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <OptionCard
              title="Só Western"
              desc="Composição completa, todas as peças vêm da Western."
              icon={<Layers className="h-7 w-7" />}
              badge="Pedido único"
              selected={state.composicao === "somenteWestern"}
              onClick={() => dispatch({ type: "SET_COMPOSICAO", value: "somenteWestern" })}
            />
            <OptionCard
              title="Western + pedras naturais"
              desc="Conjunto reduzido, otimizado para combinar com pedras naturais."
              icon={<Mountain className="h-7 w-7" />}
              badge="Mais econômico"
              selected={state.composicao === "comNaturais"}
              onClick={() => dispatch({ type: "SET_COMPOSICAO", value: "comNaturais" })}
            />
          </div>
        </StepShell>
      );
    }
    if (state.tipo === "jardim") {
      return (
        <StepShell
          stepKey="jardim"
          pergunta="O jardim terá água?"
          subtitulo="Fonte, repuxo ou espelho d'água integrado ao paisagismo."
          onBack={back}
          onReset={onReset}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <OptionCard
              title="Jardim seco"
              desc="Composição mineral, sem água corrente."
              icon={<Trees className="h-7 w-7" />}
              selected={state.jardim === "seco"}
              onClick={() => dispatch({ type: "SET_JARDIM", value: "seco" })}
            />
            <OptionCard
              title="Com fonte"
              desc="Inclui peça de água — fonte, pedra sonora ou repuxo."
              icon={<Droplets className="h-7 w-7" />}
              selected={state.jardim === "comFonte"}
              onClick={() => dispatch({ type: "SET_JARDIM", value: "comFonte" })}
            />
          </div>
        </StepShell>
      );
    }
    return <StepEstilo state={state} dispatch={dispatch} onBack={back} onReset={onReset} />;
  }

  if (state.step === 4) {
    return <StepEstilo state={state} dispatch={dispatch} onBack={back} onReset={onReset} />;
  }

  return null;
}

function StepEstilo({
  state,
  dispatch,
  onBack,
  onReset,
}: {
  state: State;
  dispatch: React.Dispatch<Action>;
  onBack?: () => void;
  onReset: () => void;
}) {
  const tipo = state.tipo!;
  const meta = nivelMeta[tipo];
  return (
    <StepShell
      stepKey="estilo"
      pergunta="Qual a presença visual desejada?"
      subtitulo="Define o volume, a quantidade de peças e o investimento aproximado."
      onBack={onBack}
      onReset={onReset}
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {(["essencial", "equilibrada", "completa"] as Nivel[]).map((n) => {
          const m = meta[n];
          return (
            <OptionCard
              key={n}
              title={m.label}
              meta={m.tagline}
              desc={m.detalhe}
              badge={`${m.faixaPreco} · ${m.pecas}`}
              selected={state.nivel === n}
              onClick={() => dispatch({ type: "SET_NIVEL", value: n })}
            />
          );
        })}
      </div>
    </StepShell>
  );
}
