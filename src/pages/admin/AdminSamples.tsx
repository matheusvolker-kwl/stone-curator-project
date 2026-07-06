import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Check, Eye, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription,
} from "@/components/ui/sheet";
import { chipCls, KV, type Lead } from "@/components/admin/adminUtils";

const SAMPLE_STATUSES = ["pending", "approved", "shipped", "delivered"] as const;
type SampleStatus = (typeof SAMPLE_STATUSES)[number];
const LBL: Record<SampleStatus, string> = { pending: "Pendente", approved: "Aprovado", shipped: "Enviado", delivered: "Entregue" };

export default function AdminSamples() {
  const [samples, setSamples] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<"all" | SampleStatus>("pending");
  const [drawer, setDrawer] = useState<Lead | null>(null);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("leads").select("*").eq("type", "amostras").order("created_at", { ascending: false });
    setSamples((data as Lead[]) ?? []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const getStatus = (l: Lead): SampleStatus => {
    const s = (l.payload as { aprovacao_status?: string })?.aprovacao_status as SampleStatus | undefined;
    return s && (SAMPLE_STATUSES as readonly string[]).includes(s) ? s : "pending";
  };
  const filtered = useMemo(() => samples.filter((s) => statusFilter === "all" || getStatus(s) === statusFilter), [samples, statusFilter]);

  const setSampleStatus = async (l: Lead, status: SampleStatus) => {
    const newPayload = { ...(l.payload || {}), aprovacao_status: status, ultima_atualizacao: new Date().toISOString() };
    const { error } = await supabase.from("leads").update({ payload: newPayload } as never).eq("id", l.id);
    if (error) { toast.error("Não foi possível atualizar.", { description: error.message }); return; }
    toast.success(`Status atualizado: ${LBL[status]}`);
    load();
  };

  const copy = (text: string) => { navigator.clipboard.writeText(text); toast.success("Copiado."); };

  if (loading) return <div className="py-20 flex justify-center"><Loader2 className="h-6 w-6 animate-spin text-western-gold" /></div>;

  return (
    <div>
      <p className="text-eyebrow mb-3">Amostras</p>
      <div className="w-12 h-px bg-western-gold mb-6" />
      <h1 className="font-display text-3xl mb-2">Kits de amostras</h1>
      <p className="text-western-stone-warm mb-8">Workflow Pendente → Aprovado → Enviado → Entregue.</p>

      <div className="flex flex-wrap gap-2 mb-6">
        <button onClick={() => setStatusFilter("all")} className={chipCls(statusFilter === "all")}>Todos</button>
        {SAMPLE_STATUSES.map((s) => (
          <button key={s} onClick={() => setStatusFilter(s)} className={chipCls(statusFilter === s)}>{LBL[s]}</button>
        ))}
      </div>

      <div className="border border-western-gold/30 bg-western-gold/5 p-4 mb-6">
        <p className="text-xs text-western-green-deep">
          <strong>Política:</strong> kit é aprovado em até 2 dias úteis pelo time comercial.
        </p>
      </div>

      <div className="space-y-3">
        {samples.length === 0 ? (
          <div className="border border-dashed border-western-stone-warm/30 bg-white p-10 text-center">
            <p className="text-western-green-deep font-medium mb-1">As amostras agora são atendidas pela Western Box.</p>
            <p className="text-xs text-western-stone-warm">Esta fila fica aqui para histórico e para receber pedidos legados.</p>
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-western-stone-warm py-10 text-center">Nenhuma amostra nesse status.</p>
        ) : null}
        {filtered.map((l) => {
          const st = getStatus(l);
          const endereco = [l.endereco, l.cidade, l.uf, l.cep].filter(Boolean).join(", ");
          return (
            <div key={l.id} className="border border-western-stone-warm/20 bg-white p-5">
              <div className="flex flex-wrap items-start justify-between gap-4 mb-3">
                <div>
                  <h3 className="font-display text-lg text-western-green-deep">{l.nome || l.empresa || "—"}</h3>
                  <p className="text-spec text-western-stone-warm mt-1">{[l.empresa, l.email, l.telefone].filter(Boolean).join(" · ")}</p>
                </div>
                <span className="inline-flex items-center px-2.5 py-1 border border-western-gold/40 text-western-green-deep bg-western-gold/10 font-mono text-[10px] uppercase tracking-[0.18em]">{LBL[st]}</span>
              </div>
              {endereco && (
                <div className="flex items-center gap-2 mb-3 text-xs text-western-stone-warm bg-western-paper px-3 py-2 border border-western-stone-warm/15">
                  <span className="flex-1">{endereco}</span>
                  <button onClick={() => copy(endereco)} className="hover:text-western-gold inline-flex items-center gap-1"><Copy className="h-3 w-3" /> copiar</button>
                </div>
              )}
              <div className="flex flex-wrap gap-2">
                {st === "pending" && <Button onClick={() => setSampleStatus(l, "approved")} className="h-9 px-4 bg-western-green-deep text-western-cream hover:bg-western-green-mid font-mono text-[11px] uppercase tracking-[0.2em] rounded-none"><Check className="h-3.5 w-3.5 mr-1" /> Aprovar</Button>}
                {st === "approved" && <Button onClick={() => setSampleStatus(l, "shipped")} className="h-9 px-4 bg-western-gold text-western-green-deep hover:bg-western-gold/90 font-mono text-[11px] uppercase tracking-[0.2em] rounded-none">Marcar como enviado</Button>}
                {st === "shipped" && <Button onClick={() => setSampleStatus(l, "delivered")} className="h-9 px-4 bg-western-green-mid text-western-cream font-mono text-[11px] uppercase tracking-[0.2em] rounded-none">Marcar como entregue</Button>}
                <Button onClick={() => setDrawer(l)} variant="ghost" className="h-9 px-4 text-western-stone-warm hover:text-western-green-deep font-mono text-[11px] uppercase tracking-[0.2em] rounded-none ml-auto">
                  <Eye className="h-3.5 w-3.5 mr-1" /> Detalhes
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      <Sheet open={!!drawer} onOpenChange={(o) => !o && setDrawer(null)}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Pedido de amostra</SheetTitle>
            <SheetDescription>Recebido em {drawer && new Date(drawer.created_at).toLocaleString("pt-BR")}</SheetDescription>
          </SheetHeader>
          {drawer && (
            <div className="mt-6 space-y-3 text-sm">
              <KV k="Nome" v={drawer.nome} />
              <KV k="Empresa" v={drawer.empresa} />
              <KV k="CNPJ" v={drawer.cnpj} />
              <KV k="E-mail" v={drawer.email} />
              <KV k="Telefone" v={drawer.telefone} />
              <KV k="Endereço de envio" v={[drawer.endereco, drawer.cidade, drawer.uf, drawer.cep].filter(Boolean).join(", ")} />
              {drawer.mensagem && (
                <div>
                  <p className="text-eyebrow mb-1">Mensagem</p>
                  <p className="text-western-green-deep whitespace-pre-wrap">{drawer.mensagem}</p>
                </div>
              )}
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
