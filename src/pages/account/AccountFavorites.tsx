import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Heart, Share2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useWishlist } from "@/hooks/useWishlist";
import { cdnImg } from "@/lib/catalog/client";
import { EstadoErro, EstadoVazio, PageHeader } from "@/components/backoffice";

/**
 * Favoritos = as peças que o parceiro salvou (tabela `wishlists`, via
 * WishlistProvider). Grade visual — a peça se reconhece pela foto.
 *
 * ── POR QUE ESTA TELA TEM UMA QUERY PRÓPRIA ──
 * `useWishlist` faz `const { data } = await supabase.from("wishlists")…` e joga
 * `data ?? []` no contexto: o `error` é ENGOLIDO. Ou seja, um 403 de RLS vira
 * lista vazia — e o parceiro lê "Nenhuma peça salva ainda" achando que perdeu a
 * seleção. É exatamente o "0 silencioso" que cegou o dono no admin antigo.
 *
 * O hook é compartilhado (header, PDP, etc.) e não é meu para reescrever, então
 * aqui faço uma SONDA barata — um HEAD `count` na mesma tabela — só para separar
 * "está vazio" de "não consegui carregar". A renderização continua vindo do
 * hook (fonte única da verdade), e a sonda só decide qual dos 4 estados mostrar.
 *
 * CORREÇÃO DE VERDADE (fora do meu escopo, precisa ir para o hook):
 *   const { data, error } = await supabase.from("wishlists")…
 *   → expor `error` no contexto e apagar esta sonda.
 */

function GradeCarregando() {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3" aria-busy="true" aria-live="polite">
      <span className="sr-only">Carregando favoritos…</span>
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="overflow-hidden rounded-2xl border border-western-border-soft bg-white">
          <div className="aspect-square animate-pulse bg-western-border-soft/50" />
          <div className="space-y-2 p-4">
            <div className="h-3 w-4/5 animate-pulse rounded-sm bg-western-border-soft" />
            <div className="h-3 w-1/3 animate-pulse rounded-sm bg-western-border-soft/70" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function AccountFavorites() {
  const { items, loading, remove, refresh } = useWishlist();
  const [erro, setErro] = useState<unknown>(null);
  const [sondando, setSondando] = useState(true);

  const carregar = useCallback(async () => {
    setSondando(true);
    setErro(null);

    // HEAD + count: não traz linhas, só revela se a leitura FALHA (RLS/rede).
    const { error } = await supabase
      .from("wishlists")
      .select("id", { count: "exact", head: true });

    if (error) {
      setErro(error);
      setSondando(false);
      return;
    }

    await refresh();
    setSondando(false);
  }, [refresh]);

  useEffect(() => {
    void carregar();
  }, [carregar]);

  const handleRemove = async (handle: string, title?: string | null) => {
    await remove(handle);
    toast("Removida dos favoritos.", { description: title ?? undefined });
    // O hook remove da lista local mesmo se o DELETE falhar no banco. Recarregar
    // reconcilia com o servidor: se não apagou de verdade, a peça volta.
    await carregar();
  };

  const handleShare = async () => {
    const handles = items.map((i) => i.product_handle).join(",");
    const url = `${window.location.origin}/favoritos-compartilhados?itens=${encodeURIComponent(handles)}`;
    try {
      const nav = typeof navigator !== "undefined" ? navigator : null;
      if (nav && "share" in nav) {
        await nav.share({ title: "Seleção Western", url });
      } else if (nav?.clipboard) {
        await nav.clipboard.writeText(url);
        toast.success("Link copiado");
      }
    } catch {
      /* cancelamento silencioso */
    }
  };

  // A sonda começa `true`; o `loading` do hook começa `false` (por isso a tela
  // antiga piscava o estado vazio antes dos dados chegarem). Somando os dois,
  // o vazio só aparece quando é vazio de verdade.
  const carregando = sondando || loading;

  return (
    <div>
      <PageHeader
        eyebrow="Favoritos"
        titulo="Peças salvas"
        subtitulo="Salve peças para revisitar antes de fechar o pedido — ou envie a seleção para o seu cliente."
        acao={
          items.length > 0 && !carregando && !erro ? (
            <button type="button" onClick={handleShare} className="btn-primary tap-target">
              <Share2 className="h-4 w-4" aria-hidden="true" />
              Compartilhar seleção
            </button>
          ) : undefined
        }
      />

      {erro ? (
        <EstadoErro erro={erro} onRetry={() => void carregar()} />
      ) : carregando ? (
        <GradeCarregando />
      ) : items.length === 0 ? (
        <EstadoVazio
          icone={Heart}
          titulo="Nenhuma peça salva ainda"
          mensagem="Abra o catálogo e salve as peças que interessam — elas ficam aqui, prontas para virar orçamento."
          acao={
            <Link to="/linhas" className="btn-primary tap-target">
              Explorar catálogo
            </Link>
          }
        />
      ) : (
        <ul className="grid grid-cols-2 gap-4 md:grid-cols-3">
          {items.map((it) => (
            <li
              key={it.id}
              className="group flex flex-col overflow-hidden rounded-2xl border border-western-border-soft bg-white transition-colors hover:border-western-gold/60"
            >
              <Link
                to={`/produtos/${it.product_handle}`}
                className="block aspect-square overflow-hidden bg-western-paper"
              >
                {it.product_image ? (
                  <img
                    src={cdnImg(it.product_image, 400)}
                    alt={it.product_title ?? it.product_handle}
                    className="h-full w-full object-contain p-4 transition-transform duration-500 group-hover:scale-[1.04]"
                    loading="lazy"
                  />
                ) : (
                  <div className="grid h-full w-full place-items-center text-western-stone-warm/40">
                    <Heart className="h-8 w-8" aria-hidden="true" />
                  </div>
                )}
              </Link>

              <div className="flex flex-1 flex-col gap-2 p-4">
                <Link
                  to={`/produtos/${it.product_handle}`}
                  className="line-clamp-2 text-[16px] font-semibold text-western-green-deep transition-colors hover:text-western-cta"
                >
                  {it.product_title ?? it.product_handle}
                </Link>

                <button
                  type="button"
                  onClick={() => void handleRemove(it.product_handle, it.product_title)}
                  className="tap-target -ml-2 mt-auto inline-flex items-center gap-2 self-start rounded-lg px-2 text-[14px] font-semibold text-western-stone-warm transition-colors hover:text-status-error"
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                  Remover
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
