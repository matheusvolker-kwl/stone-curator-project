interface Props {
  value: string;
  onChange: (v: string) => void;
  id?: string;
}

export default function AreaInput({ value, onChange, id }: Props) {
  return (
    <div className="flex items-end gap-3 max-w-[260px]">
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
        className="font-display text-[32px] text-western-green-deep bg-transparent border-0 border-b border-western-stone-warm/30 focus:border-western-green-deep focus:border-b-2 focus:outline-none w-full pb-1 placeholder:text-western-stone-warm/40"
      />
      <span className="font-sans text-base text-western-stone-warm pb-2">m²</span>
    </div>
  );
}
