import { Heart } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useWishlist } from "@/hooks/useWishlist";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { cdnImg } from "@/lib/catalog/client";

interface Props {
  handle: string;
  title?: string | null;
  image?: string | null;
  variant?: "icon" | "pill";
  className?: string;
}

export default function WishlistButton({ handle, title, image, variant = "icon", className }: Props) {
  const { has, toggle } = useWishlist();
  const { session } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const active = has(handle);

  const onClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!session) {
      const next = `${location.pathname}${location.search}`;
      toast.info("Faça login para salvar favoritos.", {
        action: {
          label: "Entrar",
          onClick: () => navigate(`/parceiro/login?next=${encodeURIComponent(next)}`),
        },
      });
      return;
    }
    const r = await toggle({ handle, title, image: image ? cdnImg(image, 800) : image });
    if (r === "added") toast.success("Adicionado aos favoritos.");
    if (r === "removed") toast("Removido dos favoritos.");
    // Nunca cantar sucesso pelo que não aconteceu no banco.
    if (r === "erro") {
      toast.error("Não consegui salvar agora.", {
        description: "Verifique a conexão e tente de novo.",
      });
    }
  };

  if (variant === "pill") {
    return (
      <button
        onClick={onClick}
        type="button"
        aria-label={active ? "Remover dos favoritos" : "Adicionar aos favoritos"}
        className={cn(
          "inline-flex items-center gap-2 h-11 px-4 border rounded-lg text-[14px] font-semibold uppercase tracking-[0.06em] transition-colors",
          active
            ? "border-western-gold bg-western-gold/10 text-western-green-deep"
            : "border-western-stone-warm/30 text-western-stone-warm hover:border-western-gold hover:text-western-green-deep",
          className,
        )}
      >
        <Heart className={cn("h-4 w-4", active && "fill-western-gold text-western-gold")} />
        {active ? "Salvo" : "Salvar"}
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      type="button"
      aria-label={active ? "Remover dos favoritos" : "Adicionar aos favoritos"}
      className={cn(
        "inline-flex items-center justify-center w-9 h-9 border bg-white/90 backdrop-blur transition-colors",
        active
          ? "border-western-gold text-western-gold"
          : "border-western-stone-warm/20 text-western-stone-warm hover:border-western-gold hover:text-western-gold",
        className,
      )}
    >
      <Heart className={cn("h-4 w-4", active && "fill-western-gold")} />
    </button>
  );
}
