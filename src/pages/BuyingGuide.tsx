import { useMemo, useReducer } from "react";
import { ArrowRight } from "lucide-react";
import StepShell from "@/components/guide/StepShell";
import OptionCard from "@/components/guide/OptionCard";
import GuideResultado from "@/components/guide/GuideResultado";
import GuideConsultor from "@/components/guide/GuideConsultor";
import {
  nivelDescricoes,
  resolveConjunto,
  totalEtapasPorTipo,
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
  | { type: "BACK" }
  | { type: "RESET" };

const initial: State = { step: 0, started: false };

function reducer(s: State, a: Action): State {
  switch (a.type) {
    case "START":
      return { ...s, started: true, step: 1 };
    case "SET_TIPO":
      return { ...s, tipo: a.value, step: 2 };
    case "SET_TAMANHO": {
      // Nas faixas "consultor" pulamos para o resultado direto
      const next = { ...s, tamanho: a.value, step: 3 };
      return next;
    }
    case "SET_COMPOSICAO":
      return { ...s, composicao: a.value, step: 4 };
    case "SET_JARDIM":
      return { ...s, jardim: a.value, step: 4 };
    case "SET_NIVEL":
      return { ...s, nivel: a.value, step: 99 }; // 99 = resultado
    case "BACK":
      return { ...s, step: Math.max(1, s.step === 99 ? (s.tipo === "piscina" ? 3 : 4) : s.step - 1) };
    case "RESET":
      return initial;
  }
}

const tamanhoOptions: Record<Tipo, Array<{ id: string; label: string }>> = {
  lago: [
    { id: "ate-4", label: "Até 4 m²" },
    { id: "4-a-10", label: "De 4 m² a 10 m²" },
    { id: "10-a-20", label: "De 10 m² a 20 m²" },
    { id: "acima-20", label: "Acima de 20 m²" },
  ],
  piscina: [
    { id: "ate-12", label: "Até 12 m²" },
    { id: "12-a-32", label: "De 12 m² a 32 m²" },
    { id: "32-a-60", label: "De 32 m² a 60 m²" },
    { id: "acima-60", label: "Acima de 60 m²" },
  ],
  jardim: [
    { id: "ate-2", label: "Até 2 m²" },
    { id: "2-a-10", label: "De 2 m² a 10 m²" },
    { id: "10-a-20", label: "De 10 m² a 20 m²" },
    { id: "acima-20", label: "Acima de 20 m²" },
  ],
};

export default function BuyingGuide() {
  const [s, dispatch] = useReducer(reducer, initial);

  const total = s.tipo ? totalEtapasPorTipo[s.tipo] : 4;
  const onReset = () => dispatch({ type: "RESET" });
  const onBack = () => dispatch({ type: "BACK" });

  const resolved = useMemo(() => resolveConjunto(s), [s]);
  const showResult = s.step === 99 || resolved === "consultor";

  return (
    <div className="surface-ivory min-h-screen">
      <div className="container-western py-16 md:py-24 max-w-5xl">
        {!s.started ? (
          <Intro onStart={() => dispatch({ type: "START" })} />
        ) : (
          <div className="border border-western-stone-warm/20 bg-white p-8 md:p-14">
            {/* Resultado tem prioridade quando atinge consultor ou nivel definido */}
            {showResult && resolved === "consultor" && s.tipo && s.tamanho ? (
              <GuideConsultor tipo={s.tipo} tamanho={s.tamanho} onReset={onReset} />
            ) : showResult && resolved && resolved !== "consultor" ? (
              <GuideResultado conjunto={resolved} answers={s} onReset={onReset} />
            ) : (
              <Steps state={s} dispatch={dispatch} total={total} onBack={onBack} onReset={onReset} />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function Intro({ onStart }: { onStart: () => void }) {
  return (
    <div className="max-w-3xl">
      <p className="text-eyebrow mb-5">Guia de Composição Western</p>
      <div className="w-12 h-px bg-western-gold mb-8" />
      <h1 className="font-display text-4xl md:text-6xl text-western-green-deep leading-[1.05] mb-6">
        Encontre o conjunto<br />ideal para o seu projeto.
      </h1>
      <p className="text-western-stone-warm text-lg leading-relaxed mb-4 max-w-2xl">
        Responda algumas perguntas e encontre o conjunto ideal para seu projeto,
        revenda ou aplicação profissional.
      </p>
      <p className="text-sm text-western-stone-warm/80 leading-relaxed mb-12 max-w-2xl">
        Composições autorais em composto mineral de alta resistência, prontas
        para especificação. Atendimento exclusivo para parceiros B2B.
      </p>
      <button onClick={onStart} className="btn-gold">
        Iniciar guia <ArrowRight className="h-4 w-4" />
      </button>
    </div>
  );
}

function Steps({
  state,
  dispatch,
  total,
  onBack,
  onReset,
}: {
  state: State;
  dispatch: React.Dispatch<Action>;
  total: number;
  onBack: () => void;
  onReset: () => void;
}) {
  const back = state.step > 1 ? onBack : undefined;

  // Etapa 1: Tipo
  if (state.step === 1) {
    return (
      <StepShell current={1} total={total} pergunta="Qual tipo de projeto você quer atender?" onReset={onReset}>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {(["lago", "piscina", "jardim"] as Tipo[]).map((t) => (
            <OptionCard
              key={t}
              title={t === "lago" ? "Lago" : t === "piscina" ? "Piscina" : "Jardim"}
              selected={state.tipo === t}
              onClick={() => dispatch({ type: "SET_TIPO", value: t })}
            />
          ))}
        </div>
      </StepShell>
    );
  }

  if (!state.tipo) return null;

  // Etapa 2: Tamanho
  if (state.step === 2) {
    const opts = tamanhoOptions[state.tipo];
    const pergunta =
      state.tipo === "lago"
        ? "Qual o tamanho aproximado do lago?"
        : state.tipo === "piscina"
          ? "Qual o tamanho aproximado da piscina?"
          : "Qual o tamanho aproximado da área de jardim?";
    return (
      <StepShell current={2} total={total} pergunta={pergunta} onBack={back} onReset={onReset}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {opts.map((o) => (
            <OptionCard
              key={o.id}
              title={o.label}
              selected={state.tamanho === o.id}
              onClick={() => dispatch({ type: "SET_TAMANHO", value: o.id })}
            />
          ))}
        </div>
      </StepShell>
    );
  }

  // Etapa 3 — depende do tipo
  if (state.step === 3) {
    if (state.tipo === "lago") {
      return (
        <StepShell
          current={3}
          total={total}
          pergunta="O projeto usará somente produtos Western ou também pedras naturais e outros elementos?"
          onBack={back}
          onReset={onReset}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <OptionCard
              title="Somente produtos Western"
              desc="Conjunto completo, com todas as peças da composição."
              selected={state.composicao === "somenteWestern"}
              onClick={() => dispatch({ type: "SET_COMPOSICAO", value: "somenteWestern" })}
            />
            <OptionCard
              title="Western + pedras naturais e outros elementos"
              desc="Conjunto reduzido, otimizado para combinar com pedras naturais."
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
          current={3}
          total={total}
          pergunta="Você deseja um jardim seco ou com fonte?"
          onBack={back}
          onReset={onReset}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <OptionCard
              title="Jardim seco"
              selected={state.jardim === "seco"}
              onClick={() => dispatch({ type: "SET_JARDIM", value: "seco" })}
            />
            <OptionCard
              title="Jardim com fonte"
              selected={state.jardim === "comFonte"}
              onClick={() => dispatch({ type: "SET_JARDIM", value: "comFonte" })}
            />
          </div>
        </StepShell>
      );
    }
    // piscina: etapa 3 é o nível
    return <StepNivel state={state} dispatch={dispatch} current={3} total={total} onBack={back} onReset={onReset} />;
  }

  // Etapa 4: nível (lago/jardim)
  if (state.step === 4) {
    return <StepNivel state={state} dispatch={dispatch} current={4} total={total} onBack={back} onReset={onReset} />;
  }

  return null;
}

function StepNivel({
  state,
  dispatch,
  current,
  total,
  onBack,
  onReset,
}: {
  state: State;
  dispatch: React.Dispatch<Action>;
  current: number;
  total: number;
  onBack?: () => void;
  onReset: () => void;
}) {
  const tipo = state.tipo!;
  const descs = nivelDescricoes[tipo];
  return (
    <StepShell
      current={current}
      total={total}
      pergunta="Qual nível de composição deseja?"
      onBack={onBack}
      onReset={onReset}
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {(["essencial", "equilibrada", "completa"] as Nivel[]).map((n) => (
          <OptionCard
            key={n}
            title={n === "essencial" ? "Essencial" : n === "equilibrada" ? "Equilibrada" : "Completa"}
            desc={descs[n]}
            selected={state.nivel === n}
            onClick={() => dispatch({ type: "SET_NIVEL", value: n })}
          />
        ))}
      </div>
    </StepShell>
  );
}
