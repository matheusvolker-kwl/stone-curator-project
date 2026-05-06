interface OptionCardProps {
  title: string;
  desc?: string;
  selected?: boolean;
  onClick: () => void;
}

export default function OptionCard({ title, desc, selected, onClick }: OptionCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={title}
      className={`group text-left border p-6 md:p-7 transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-western-gold focus-visible:ring-offset-2 focus-visible:ring-offset-western-ivory ${
        selected
          ? "border-western-gold bg-western-gold/5"
          : "border-western-stone-warm/25 hover:border-western-gold hover:-translate-y-0.5"
      }`}
    >
      <span className="font-display text-xl md:text-2xl text-western-green-deep block mb-2">
        {title}
      </span>
      {desc && (
        <span className="block text-sm text-western-stone-warm leading-relaxed">
          {desc}
        </span>
      )}
    </button>
  );
}
