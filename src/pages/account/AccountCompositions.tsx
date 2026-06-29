import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { FileStack, ArrowRight, Clock, CheckCircle2, Send } from "lucide-react";
import {
  QUOTE_STATUS_LABEL,
  QUOTE_STATUS_CLS,
  type QuoteStatus,
} from "@/components/admin/quoteTypes";

interface Lead {
  id: string;
  nome: string | null;
  empresa: string | null;
  origem: string | null;
  created_at: string;
  payload: { items?: unknown[]; subtotal?: number; numero?: string } | null;
}

interface Thread {
  lead_id: string;
  status: QuoteStatus;
  updated_at: string;
}

interface Composition extends Lead {
  thread?: Thread;
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
}

const STATUS_TONE: Record<QuoteStatus, { label: string; icon: typeof Clock }> = {
  novo: { label: "Aguardando equipe", icon: Clock },
  em_atendimento: { label: "Equipe respondendo", icon: Send },
  proposta_enviada: { label: "Proposta enviada", icon: Send },
  fechado: { label: "Fechado", icon: CheckCircle2 },
  perdido: { label: "Encerrado", icon: CheckCircle2 },
  arquivado: { label: "Arquivado", icon: CheckCircle2 },
};

export default function AccountCompositions() {
  const { user } = useAuth();
  const [items, setItems] = useState<Composition[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data: leads } = await supabase
        .from("leads")
        .select("id, nome, empresa, origem, created_at, payload")
        .eq("user_id", user.id)
        .eq("type", "orcamento")
        .order("created_at", { ascending: false });

      const ids = (leads ?? []).map((l) => l.id);
      let threads: Thread[] = [];
      if (ids.length > 0) {
        const { data } = await supabase
          .from("quote_threads")
          .select("lead_id, status, updated_at")
          .in("lead_id", ids);
        threads = (data as Thread[]) ?? [];
      }
      const merged: Composition[] = ((leads as Lead[]) ?? []).map((l) => ({
        ...l,
        thread: threads.find((t) => t.lead_id === l.id),
      }));
      setItems(merged);
      setLoading(false);
    })();
  }, [user]);

  return (
    <div>
      <p className="text-eyebrow mb-3">Composições</p>
      <h2 className="font-display text-3xl text-western-green-deep mb-2">Orçamentos & projetos em conversa</h2>
      <p className="text-western-stone-warm mb-8 max-w-2xl">
        Todo orçamento enviado pelo carrinho ou pelo guia de composição inicia uma conversa com o time Western.
      </p>

      {loading ? (
        <p className="text-sm text-western-stone-warm">Carregando…</p>
      ) : items.length === 0 ? (
        <div className="border border-dashed border-western-stone-warm/30 p-10 text-center">
          <FileStack className="h-8 w-8 text-western-stone-warm/40 mx-auto mb-3" />
          <p className="text-spec text-western-stone-warm mb-4">Nenhuma composição ainda.</p>
          <Link
            to="/guia-de-composicao"
            className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-western-gold hover:underline"
          >
            Abrir guia de composição <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      ) : (
        <ul className="space-y-3">
          {items.map((it) => {
            const status: QuoteStatus = it.thread?.status ?? "novo";
            const tone = STATUS_TONE[status];
            const Icon = tone.icon;
            const itemsCount = Array.isArray(it.payload?.items) ? it.payload!.items!.length : 0;
            const subtotal = it.payload?.subtotal ?? 0;
            return (
              <li key={it.id} className="border border-western-stone-warm/15 bg-white p-5">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="min-w-0">
                    <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-western-stone-warm">
                      {it.payload?.numero ? `Nº ${it.payload.numero} · ` : ""}{fmtDate(it.created_at)} · {it.origem ?? "site"}
                    </p>
                    <h3 className="font-display text-lg text-western-green-deep mt-1">
                      {itemsCount} {itemsCount === 1 ? "peça" : "peças"} ·{" "}
                      {subtotal.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                    </h3>
                    <span className={`inline-flex items-center gap-1.5 px-2 py-1 mt-2 border font-mono text-[10px] uppercase tracking-[0.18em] ${QUOTE_STATUS_CLS[status]}`}>
                      <Icon className="h-3 w-3" /> {tone.label}
                    </span>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
