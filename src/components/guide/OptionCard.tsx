import { Check } from "lucide-react";

interface OptionCardProps {
  title: string;
  desc?: string;
  badge?: string;
  meta?: string;
  icon?: React.ReactNode;
  illustration?: React.ReactNode; // grande visual no topo
  selected?: boolean;
  onClick: () => void;
  size?: "default" | "compact";
}

export default function OptionCard({
  title,
  desc,
  badge,
  meta,
  icon,
  illustration,
  selected,
  onClick,
  size = "default",
}: OptionCardProps) {
  const compact = size === "compact";
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      aria-label={title}
      className={`group relative text-left flex flex-col bg-white border transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-western-gold focus-visible:ring-offset-2 focus-visible:ring-offset-western-ivory overflow-hidden ${
        selected
          ? "border-western-gold shadow-[0_8px_30px_-12px_rgba(180,144,90,0.35)]"
          : "border-western-stone-warm/20 hover:border-western-gold/70 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_-16px_rgba(15,40,24,0.18)]"
      }`}
    >
      {selected && (
        <span className="absolute top-3 right-3 z-10 inline-flex items-center justify-center h-6 w-6 rounded-full bg-western-gold text-western-green-deep">
          <Check className="h-3.5 w-3.5" strokeWidth={3} />
        </span>
      )}

      {illustration && (
        <div className={`relative w-full ${compact ? "h-28" : "h-40 md:h-48"} bg-western-green-deep overflow-hidden`}>
          {illustration}
          {badge && (
            <span className="absolute bottom-3 left-3 px-2 py-1 bg-western-cream/95 backdrop-blur text-western-green-deep font-mono text-[10px] uppercase tracking-[0.18em]">
              {badge}
            </span>
          )}
        </div>
      )}

      <div className={`flex-1 ${compact ? "p-5" : "p-6 md:p-7"}`}>
        {icon && !illustration && (
          <div className="mb-4 text-western-gold">{icon}</div>
        )}
        {meta && (
          <p className="text-eyebrow mb-2">{meta}</p>
        )}
        <span className={`font-display ${compact ? "text-lg" : "text-xl md:text-2xl"} text-western-green-deep block leading-tight mb-2`}>
          {title}
        </span>
        {desc && (
          <span className="block text-sm text-western-stone-warm leading-relaxed">
            {desc}
          </span>
        )}
        {badge && !illustration && (
          <span className="mt-4 inline-block px-2 py-1 bg-western-gold/10 text-western-green-deep font-mono text-[10px] uppercase tracking-[0.18em] border border-western-gold/30">
            {badge}
          </span>
        )}
      </div>
    </button>
  );
}
