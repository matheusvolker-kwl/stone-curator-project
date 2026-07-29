import { Label } from "@/components/ui/label";

interface Props {
  htmlFor?: string;
  children: React.ReactNode;
  optional?: boolean;
  required?: boolean;
  hint?: string;
}

/* DS V3: label = .text-eyebrow (sans semibold 14px, tracking 0.06em, bronze).
 * Nada abaixo de 14px — a dica também é 14px (.text-meta). */
export default function FieldLabel({ htmlFor, children, optional, required, hint }: Props) {
  return (
    <div className="mb-2.5">
      <Label htmlFor={htmlFor} className="text-eyebrow inline-block leading-snug">
        {children}
        {required && (
          <span aria-hidden="true" className="ml-1 text-western-bronze">*</span>
        )}
        {optional && (
          <span className="ml-2 font-normal text-western-stone-warm normal-case tracking-normal">
            (opcional)
          </span>
        )}
      </Label>
      {hint && (
        <p className="mt-1.5 text-meta leading-snug">{hint}</p>
      )}
    </div>
  );
}
