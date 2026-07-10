import { useEffect, useState, type ReactNode } from "react";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  title: string;
  description?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  /** Se definido, exige o usuário digitar EXATAMENTE esse texto para habilitar o confirmar. */
  requireText?: string;
  requireTextPlaceholder?: string;
  onConfirm: () => void | Promise<void>;
}

export function ConfirmDialog({
  open, onOpenChange, title, description,
  confirmLabel = "Confirmar", cancelLabel = "Cancelar",
  danger, requireText, requireTextPlaceholder,
  onConfirm,
}: ConfirmDialogProps) {
  const [typed, setTyped] = useState("");
  useEffect(() => { if (!open) setTyped(""); }, [open]);
  const canConfirm = requireText ? typed.trim() === requireText.trim() : true;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="rounded-none border border-western-stone-warm/30">
        <AlertDialogHeader>
          <AlertDialogTitle className="font-display text-western-green-deep">{title}</AlertDialogTitle>
          {description && (
            <AlertDialogDescription className="text-sm text-western-stone-warm whitespace-pre-line">
              {description}
            </AlertDialogDescription>
          )}
        </AlertDialogHeader>
        {requireText && (
          <div className="pt-1">
            <Input
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              placeholder={requireTextPlaceholder ?? `Digite ${requireText}`}
              className="h-10 rounded-none font-mono"
              autoFocus
            />
          </div>
        )}
        <AlertDialogFooter>
          <AlertDialogCancel className="rounded-none font-mono text-[11px] uppercase tracking-[0.18em]">
            {cancelLabel}
          </AlertDialogCancel>
          <AlertDialogAction
            disabled={!canConfirm}
            onClick={(e) => {
              if (!canConfirm) { e.preventDefault(); return; }
              onConfirm();
            }}
            className={`rounded-none font-mono text-[11px] uppercase tracking-[0.18em] ${
              danger
                ? "bg-red-700 text-white hover:bg-red-800"
                : "bg-western-green-deep text-western-cream hover:bg-western-green-mid"
            }`}
          >
            {confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
