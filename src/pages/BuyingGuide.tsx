import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchCollections } from "@/lib/shopify/queries";
import { ArrowRight } from "lucide-react";

const finishes = ["Quartzo", "Arenito", "Moledo", "Granito"];
const sizes = [
  { id: "small", label: "Pequeno", desc: "Detalhes e jardins compactos" },
  { id: "medium", label: "Médio", desc: "Lagos e cantos contemplativos" },
  { id: "large", label: "Grande", desc: "Cascatas e piscina praia" },
];
const locations = [
  { id: "garden", label: "Jardim" },
  { id: "pool", label: "Piscina" },
  { id: "indoor", label: "Área interna" },
];

export default function BuyingGuide() {
  const [step, setStep] = useState(0);
  const [location, setLocation] = useState("");
  const [size, setSize] = useState("");
  const [finish, setFinish] = useState("");
  const { data: collections = [] } = useQuery({
    queryKey: ["collections"],
    queryFn: () => fetchCollections(20),
  });

  const next = () => setStep((s) => s + 1);
  const restart = () => {
    setStep(0);
    setLocation("");
    setSize("");
    setFinish("");
  };

  // Suggested collections by location/size
  const suggestionHandles =
    location === "pool"
      ? ["pedras-de-borda", "cascatas", "pedras-grandes"]
      : location === "indoor"
      ? ["fontes-para-jardim", "pedras-pequenas", "revestimentos"]
      : size === "large"
      ? ["cascatas", "pedras-grandes", "fosseis-decorativos"]
      : size === "medium"
      ? ["pedras-medias", "fontes-para-jardim", "pisadas"]
      : ["pedras-pequenas", "pisadas", "acessorios"];

  const suggested = collections.filter((c) => suggestionHandles.includes(c.handle));

  return (
    <div className="container-western py-20 md:py-28 max-w-4xl">
      <p className="text-eyebrow mb-5">Guia de compra</p>
      <h1 className="font-display text-5xl md:text-6xl text-western-cream leading-[1.05] mb-12">
        Componha seu projeto, passo a passo.
      </h1>

      <div className="border border-western-gold/20 p-10 md:p-16 bg-western-green-mid/40">
        {step === 0 && (
          <div>
            <p className="text-spec text-western-gold mb-3">01 / 03</p>
            <h2 className="font-display text-3xl text-western-cream mb-8">
              Onde será a instalação?
            </h2>
            <div className="grid sm:grid-cols-3 gap-4">
              {locations.map((l) => (
                <button
                  key={l.id}
                  onClick={() => {
                    setLocation(l.id);
                    next();
                  }}
                  className="border border-western-gold/25 p-6 text-left hover:border-western-gold transition-all duration-300"
                >
                  <span className="font-display text-2xl text-western-cream block mb-2">
                    {l.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 1 && (
          <div>
            <p className="text-spec text-western-gold mb-3">02 / 03</p>
            <h2 className="font-display text-3xl text-western-cream mb-8">
              Qual a escala do projeto?
            </h2>
            <div className="grid sm:grid-cols-3 gap-4">
              {sizes.map((s) => (
                <button
                  key={s.id}
                  onClick={() => {
                    setSize(s.id);
                    next();
                  }}
                  className="border border-western-gold/25 p-6 text-left hover:border-western-gold transition-all duration-300"
                >
                  <span className="font-display text-2xl text-western-cream block mb-2">
                    {s.label}
                  </span>
                  <span className="text-spec text-western-cream-muted">{s.desc}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <p className="text-spec text-western-gold mb-3">03 / 03</p>
            <h2 className="font-display text-3xl text-western-cream mb-8">
              Qual acabamento?
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {finishes.map((f) => (
                <button
                  key={f}
                  onClick={() => {
                    setFinish(f);
                    next();
                  }}
                  className="border border-western-gold/25 p-6 hover:border-western-gold transition-all duration-300"
                >
                  <span className="font-display text-xl text-western-cream block">{f}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <p className="text-spec text-western-gold mb-3">Sugestão</p>
            <h2 className="font-display text-3xl text-western-cream mb-3">
              Coleções para o seu projeto.
            </h2>
            <p className="text-western-cream-muted mb-10">
              Acabamento {finish}. Comece pelas coleções abaixo — são as que
              melhor se especificam para esse contexto.
            </p>
            <div className="space-y-4 mb-10">
              {suggested.map((c) => (
                <Link
                  key={c.handle}
                  to={`/colecoes/${c.handle}`}
                  className="flex items-center justify-between border border-western-gold/20 p-5 hover:border-western-gold/60 transition-colors group"
                >
                  <span className="font-display text-2xl text-western-cream group-hover:text-western-gold-soft transition-colors">
                    {c.title}
                  </span>
                  <ArrowRight className="h-5 w-5 text-western-gold-soft" />
                </Link>
              ))}
            </div>
            <button
              onClick={restart}
              className="link-underline font-mono text-xs uppercase tracking-[0.2em] text-western-cream"
            >
              Começar de novo
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
