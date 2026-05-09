import { Check } from "lucide-react";
import StepShell from "./StepShell";
import { useGuideStore } from "@/stores/guideStore";
import {
  ComposicaoSoWestern,
  ComposicaoComNaturais,
  JardimSeco,
  JardimComFonte,
} from "./svg/MoodSvg";

interface CompCardProps {
  title: string;
  pecasInfo: string;
  precoInfo: string;
  desc: string;
  selected: boolean;
  recommended?: boolean;
  illustration: React.ReactNode;
  onClick: () => void;
}

function CompCard({ title, pecasInfo, precoInfo, desc, selected, recommended, illustration, onClick }: CompCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`group relative text-left flex flex-col bg-white border-2 transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-western-gold focus-visible:ring-offset-2 overflow-hidden ${
        selected
          ? "border-western-gold shadow-[0_18px_40px_-18px_rgba(180,144,90,0.5)]"
          : "border-western-stone-warm/15 hover:border-western-gold/60 hover:-translate-y-1"
      }`}
    >
      {recommended && !selected && (
        <span className="absolute top-3 left-3 z-10 px-2.5 py-1 bg-western-cream text-western-green-deep font-mono text-[9px] uppercase tracking-[0.2em]">
          Mais econômico
        </span>
      )}
      {selected && (
        <span className="absolute top-3 right-3 z-10 inline-flex items-center justify-center h-6 w-6 rounded-full bg-western-gold text-western-green-deep">
          <Check className="h-3.5 w-3.5" strokeWidth={3} />
        </span>
      )}

      <div className="aspect-[16/9] w-full overflow-hidden bg-western-green-deep">
        <div className="w-full h-full transition-transform duration-700 group-hover:scale-105">
          {illustration}
        </div>
      </div>

      <div className="p-6 flex-1 flex flex-col gap-3">
        <h3 className="font-display text-2xl text-western-green-deep leading-tight">{title}</h3>
        <p className="text-sm text-western-stone-warm leading-relaxed">{desc}</p>
        <div className="mt-auto pt-3 grid grid-cols-2 gap-3 text-xs font-mono uppercase tracking-[0.18em]">
          <div>
            <p className="text-western-stone-warm/60 mb-1">Peças</p>
            <p className="text-western-green-deep">{pecasInfo}</p>
          </div>
          <div>
            <p className="text-western-stone-warm/60 mb-1">Investimento</p>
            <p className="text-western-green-deep">{precoInfo}</p>
          </div>
        </div>
      </div>
    </button>
  );
}

export default function StepComposicao() {
  const tipo = useGuideStore((s) => s.tipo);
  const composicao = useGuideStore((s) => s.composicao);
  const jardim = useGuideStore((s) => s.jardim);
  const setComposicao = useGuideStore((s) => s.setComposicao);
  const setJardim = useGuideStore((s) => s.setJardim);
  const back = useGuideStore((s) => s.back);
  const reset = useGuideStore((s) => s.reset);

  if (tipo === "lago") {
    return (
      <StepShell
        stepKey="composicao"
        pergunta="O projeto vai usar pedras naturais junto?"
        subtitulo="Se você já tem pedras naturais (rolados, basalto, seixos), reduzimos a quantidade Western — composição balanceada, investimento menor."
        onBack={back}
        onReset={reset}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <CompCard
            title="Só Western"
            pecasInfo="7 a 11"
            precoInfo="Composição completa"
            desc="A composição é totalmente Western. Coerência estética máxima, especificação simplificada."
            selected={composicao === "somenteWestern"}
            illustration={<ComposicaoSoWestern />}
            onClick={() => setComposicao("somenteWestern")}
          />
          <CompCard
            title="Western + naturais"
            pecasInfo="4 a 7 Western"
            precoInfo="Você complementa"
            desc="Conjunto Western reduzido, otimizado para combinar com pedras naturais que você já está usando."
            selected={composicao === "comNaturais"}
            recommended
            illustration={<ComposicaoComNaturais />}
            onClick={() => setComposicao("comNaturais")}
          />
        </div>
      </StepShell>
    );
  }

  if (tipo === "jardim") {
    return (
      <StepShell
        stepKey="composicao"
        pergunta="O jardim terá água?"
        subtitulo="Fonte, repuxo ou pedra sonora integrados ao paisagismo. A presença de água acrescenta cerca de 30–40% no investimento."
        onBack={back}
        onReset={reset}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <CompCard
            title="Jardim seco"
            pecasInfo="3 a 9"
            precoInfo="Sem peça de água"
            desc="Composição mineral, sem água corrente. Pedras decorativas, pisadas, vasos."
            selected={jardim === "seco"}
            illustration={<JardimSeco />}
            onClick={() => setJardim("seco")}
          />
          <CompCard
            title="Com fonte"
            pecasInfo="4 a 10"
            precoInfo="+30% no conjunto"
            desc="Inclui peça de água — fonte, pedra sonora ou repuxo. Som ambiente e presença sensorial."
            selected={jardim === "comFonte"}
            illustration={<JardimComFonte />}
            onClick={() => setJardim("comFonte")}
          />
        </div>
      </StepShell>
    );
  }

  return null;
}
