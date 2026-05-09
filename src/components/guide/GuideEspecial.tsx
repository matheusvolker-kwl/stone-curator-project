import { useState } from "react";
import { MessageCircle, ArrowLeft, RotateCcw, Building2 } from "lucide-react";
import { useGuideStore } from "@/stores/guideStore";
import { WHATSAPP_NUMBER } from "@/data/guideMap";

export default function GuideEspecial() {
  const back = useGuideStore((s) => s.back);
  const reset = useGuideStore((s) => s.reset);
  const [tipo, setTipo] = useState("");
  const [descricao, setDescricao] = useState("");

  const buildWa = () => {
    const text = [
      "Olá, vim pelo Guia de Composição Western.",
      "Tenho um projeto especial e gostaria de atendimento consultivo.",
      tipo && `Tipo: ${tipo}`,
      descricao && `Detalhes: ${descricao}`,
    ]
      .filter(Boolean)
      .join("\n\n");
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
  };

  return (
    <div className="animate-in fade-in duration-300">
      <div className="grid lg:grid-cols-[2fr_3fr] gap-12 lg:gap-16">
        <div>
          <p className="text-eyebrow mb-5">Atendimento dedicado</p>
          <div className="w-12 h-px bg-western-gold mb-6" />
          <h2 className="font-display text-3xl md:text-5xl text-western-green-deep leading-[1.05] mb-6">
            Projetos especiais merecem composição autoral
          </h2>
          <p className="text-western-stone-warm leading-relaxed mb-6">
            Para fachadas, balcões, paredes, halls, instalações cenográficas
            e qualquer aplicação fora do nosso catálogo de conjuntos, montamos
            uma proposta sob medida.
          </p>
          <ul className="space-y-3 text-sm text-western-stone-warm">
            {[
              "Briefing técnico com nossa equipe de especificação",
              "Mock visual em sketch ou 3D",
              "Orçamento detalhado por SKU",
              "Acompanhamento de obra quando necessário",
            ].map((b) => (
              <li key={b} className="flex gap-3">
                <Building2 className="h-4 w-4 text-western-gold mt-0.5 shrink-0" />
                <span>{b}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white border border-western-stone-warm/20 p-6 md:p-8 space-y-5">
          <div>
            <label className="block font-mono text-[10px] uppercase tracking-[0.2em] text-western-green-deep mb-2">
              Tipo de aplicação
            </label>
            <select
              value={tipo}
              onChange={(e) => setTipo(e.target.value)}
              className="w-full px-3 py-3 bg-western-ivory border border-western-stone-warm/30 text-western-green-deep focus:outline-none focus:border-western-gold"
            >
              <option value="">Selecione…</option>
              <option>Fachada / revestimento</option>
              <option>Balcão de restaurante / bar</option>
              <option>Hall ou recepção</option>
              <option>Parede com pedra LED</option>
              <option>Instalação cenográfica / efêmera</option>
              <option>Outro</option>
            </select>
          </div>

          <div>
            <label className="block font-mono text-[10px] uppercase tracking-[0.2em] text-western-green-deep mb-2">
              Conte um pouco sobre o projeto
            </label>
            <textarea
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              rows={5}
              placeholder="Local, dimensões aproximadas, prazo, referências visuais…"
              className="w-full px-3 py-3 bg-western-ivory border border-western-stone-warm/30 text-western-green-deep text-sm focus:outline-none focus:border-western-gold resize-none"
            />
          </div>

          <a
            href={buildWa()}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-gold w-full justify-center"
          >
            <MessageCircle className="h-4 w-4" /> Enviar para o consultor
          </a>
          <p className="text-xs text-western-stone-warm/70 text-center">
            Resposta em até 1 dia útil. Atendimento B2B premium.
          </p>
        </div>
      </div>

      <div className="mt-12 pt-6 border-t border-western-stone-warm/15 flex items-center justify-between">
        <button
          type="button"
          onClick={back}
          className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-western-stone-warm hover:text-western-green-deep transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Voltar
        </button>
        <button
          type="button"
          onClick={reset}
          className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-western-stone-warm hover:text-western-green-deep transition-colors"
        >
          <RotateCcw className="h-3.5 w-3.5" /> Reiniciar guia
        </button>
      </div>
    </div>
  );
}
