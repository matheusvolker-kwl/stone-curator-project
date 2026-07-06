import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

type Tier = "verde" | "amarela" | "laranja";
interface Row { codigo: string; tier: Tier; descricao: string | null }

const TIER_CLS: Record<Tier, string> = {
  verde: "border-emerald-600/60 text-emerald-800 bg-emerald-50",
  amarela: "border-amber-500/60 text-amber-800 bg-amber-50",
  laranja: "border-orange-500/60 text-orange-800 bg-orange-50",
};

const formatCnae = (c: string) => c.replace(/^(\d{4})(\d)(\d{2})$/, "$1-$2/$3");

export default function AdminCnaeWhitelist() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Tier | "todos">("todos");
  const [novo, setNovo] = useState({ codigo: "", tier: "verde" as Tier, descricao: "" });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("cnae_whitelist")
      .select("codigo, tier, descricao")
      .order("tier", { ascending: true })
      .order("codigo", { ascending: true });
    if (error) toast.error("Erro ao carregar.", { description: error.message });
    setRows((data as Row[]) ?? []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const add = async () => {
    const codigo = novo.codigo.replace(/\D/g, "").slice(0, 7);
    if (codigo.length !== 7) { toast.error("CNAE deve ter 7 dígitos."); return; }
    setSaving(true);
    const { error } = await supabase.from("cnae_whitelist").upsert({
      codigo, tier: novo.tier, descricao: novo.descricao.trim() || null,
    });
    setSaving(false);
    if (error) { toast.error("Erro ao salvar.", { description: error.message }); return; }
    toast.success("CNAE adicionado.");
    setNovo({ codigo: "", tier: novo.tier, descricao: "" });
    load();
  };

  const remove = async (codigo: string) => {
    if (!confirm(`Remover CNAE ${formatCnae(codigo)}?`)) return;
    const { error } = await supabase.from("cnae_whitelist").delete().eq("codigo", codigo);
    if (error) { toast.error("Erro ao remover.", { description: error.message }); return; }
    setRows((rs) => rs.filter((r) => r.codigo !== codigo));
  };

  const updateTier = async (codigo: string, tier: Tier) => {
    const { error } = await supabase.from("cnae_whitelist").update({ tier }).eq("codigo", codigo);
    if (error) { toast.error("Erro.", { description: error.message }); return; }
    setRows((rs) => rs.map((r) => r.codigo === codigo ? { ...r, tier } : r));
  };

  if (loading) return <div className="py-20 flex justify-center"><Loader2 className="h-6 w-6 animate-spin text-western-gold" /></div>;

  const filtered = filter === "todos" ? rows : rows.filter((r) => r.tier === filter);

  return (
    <div>
      <h2 className="font-display text-2xl mb-2 text-western-green-deep">CNAEs que credenciam</h2>
      <p className="text-western-stone-warm mb-8">
        <strong className="text-emerald-700">Verde</strong>: aprovação automática.{" "}
        <strong className="text-amber-700">Amarela</strong> e <strong className="text-orange-700">Laranja</strong>: enviam para análise manual.
        Edições refletem instantaneamente no cadastro de novos parceiros.
      </p>

      <div className="border border-western-stone-warm/20 bg-western-paper/40 p-5 mb-8">
        <p className="text-eyebrow mb-3">Adicionar CNAE</p>
        <div className="grid sm:grid-cols-[120px_140px_1fr_auto] gap-3">
          <Input
            placeholder="0000000"
            value={novo.codigo}
            onChange={(e) => setNovo({ ...novo, codigo: e.target.value })}
            className="h-11 rounded-none border-western-stone-warm/30 font-mono"
          />
          <Select value={novo.tier} onValueChange={(v) => setNovo({ ...novo, tier: v as Tier })}>
            <SelectTrigger className="h-11 rounded-none border-western-stone-warm/30"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="verde">Verde — auto</SelectItem>
              <SelectItem value="amarela">Amarela — análise</SelectItem>
              <SelectItem value="laranja">Laranja — análise</SelectItem>
            </SelectContent>
          </Select>
          <Input
            placeholder="Descrição (opcional)"
            value={novo.descricao}
            onChange={(e) => setNovo({ ...novo, descricao: e.target.value })}
            className="h-11 rounded-none border-western-stone-warm/30"
          />
          <Button onClick={add} disabled={saving} className="h-11 bg-western-green-deep text-western-cream hover:bg-western-green-mid rounded-none font-mono text-xs uppercase tracking-[0.22em]">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Plus className="h-4 w-4 mr-1" /> Adicionar</>}
          </Button>
        </div>
      </div>

      <div className="flex gap-2 mb-4">
        {(["todos", "verde", "amarela", "laranja"] as const).map((t) => (
          <button key={t} onClick={() => setFilter(t)}
            className={`h-9 px-4 font-mono text-[11px] uppercase tracking-[0.18em] border ${
              filter === t ? "border-western-gold text-western-green-deep bg-western-gold/10" : "border-western-stone-warm/25 text-western-stone-warm hover:border-western-gold/60"
            }`}>{t}</button>
        ))}
      </div>

      <div className="border border-western-stone-warm/20 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-western-paper text-[10px] font-mono uppercase tracking-[0.18em] text-western-stone-warm">
            <tr>
              <th className="text-left px-4 py-3">CNAE</th>
              <th className="text-left px-4 py-3">Tier</th>
              <th className="text-left px-4 py-3">Descrição</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr key={r.codigo} className="border-t border-western-stone-warm/10">
                <td className="px-4 py-2 font-mono">{formatCnae(r.codigo)}</td>
                <td className="px-4 py-2">
                  <Select value={r.tier} onValueChange={(v) => updateTier(r.codigo, v as Tier)}>
                    <SelectTrigger className={`h-8 w-32 rounded-none font-mono text-[10px] uppercase tracking-[0.18em] ${TIER_CLS[r.tier]}`}><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="verde">verde</SelectItem>
                      <SelectItem value="amarela">amarela</SelectItem>
                      <SelectItem value="laranja">laranja</SelectItem>
                    </SelectContent>
                  </Select>
                </td>
                <td className="px-4 py-2 text-xs text-western-stone-warm">{r.descricao ?? "—"}</td>
                <td className="px-4 py-2 text-right">
                  <button onClick={() => remove(r.codigo)} className="text-western-stone-warm hover:text-red-700">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
