import { Label } from "@/components/ui/label";

interface Props {
  htmlFor?: string;
  children: React.ReactNode;
  optional?: boolean;
  required?: boolean;
  hint?: string;
}

export default function FieldLabel({ htmlFor, children, optional, required, hint }: Props) {
  return (
    <div className="mb-2.5">
      <Label htmlFor={htmlFor} className="text-eyebrow inline-block">
        {children}
        {required && (
          <span aria-hidden="true" className="ml-1 text-western-gold">*</span>
        )}
        {optional && (
          <span className="ml-2 text-western-stone-warm/60 normal-case tracking-normal">
            (opcional)
          </span>
        )}
      </Label>
      {hint && (
        <p className="mt-1 text-[11px] text-western-stone-warm leading-snug normal-case tracking-normal">{hint}</p>
      )}
    </div>
  );
}
