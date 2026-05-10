interface Props {
  value: string;
  onChange: (v: string) => void;
  id?: string;
}

export default function AreaInput({ value, onChange, id }: Props) {
  return (
    <div className="flex items-end gap-3 max-w-[300px] border-b border-western-gold/40 focus-within:border-western-green-deep transition-colors pb-1">
      <input
        id={id}
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        value={value}
        onChange={(e) => {
          const v = e.target.value.replace(/[^\d]/g, "").slice(0, 3);
          onChange(v);
        }}
        placeholder="12"
        className="font-display text-[44px] md:text-[56px] text-western-green-deep bg-transparent border-0 focus:outline-none w-full leading-none placeholder:text-western-stone-warm/30"
      />
      <span className="font-display text-xl md:text-2xl text-western-stone-warm pb-2">m²</span>
    </div>
  );
}
