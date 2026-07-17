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
      <AlertDialogContent className="rounded-2xl border border-western-border-soft">
        <AlertDialogHeader>
          <AlertDialogTitle className="font-display text-[20px] text-western-green-deep">{title}</AlertDialogTitle>
          {description && (
            <AlertDialogDescription className="text-[16px] text-western-stone-warm whitespace-pre-line">
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
              className="h-12 rounded-lg text-[16px]"
              autoFocus
            />
          </div>
        )}
        <AlertDialogFooter>
          <AlertDialogCancel className="tap-target rounded-lg text-[16px] font-semibold">
            {cancelLabel}
          </AlertDialogCancel>
          <AlertDialogAction
            disabled={!canConfirm}
            onClick={(e) => {
              if (!canConfirm) { e.preventDefault(); return; }
              onConfirm();
            }}
            className={`tap-target rounded-lg text-[16px] font-semibold ${
              danger
                ? "bg-status-error text-white hover:bg-[#992e26]"
                : "bg-western-cta text-white hover:bg-western-cta/90"
            }`}
          >
            {confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
