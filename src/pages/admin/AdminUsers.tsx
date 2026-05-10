import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Search, Edit, Save, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription,
} from "@/components/ui/sheet";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { TIERS, TIER_LABEL, TIER_BADGE_CLS, type Tier, type Partner } from "@/components/admin/adminUtils";

export default function AdminUsers() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [adminIds, setAdminIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"active" | "cancelled">("active");
  const [q, setQ] = useState("");
  const [editing, setEditing] = useState<Partner | null>(null);

  const load = async () => {
    setLoading(true);
    const [{ data: ps }, { data: roles }] = await Promise.all([
      supabase.from("partner_profiles").select("*").order("empresa", { ascending: true }),
      supabase.from("user_roles").select("user_id, role").eq("role", "admin"),
    ]);
    setPartners((ps as Partner[]) ?? []);
    setAdminIds(new Set((roles ?? []).map((r) => r.user_id)));
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => partners.filter((p) => {
    if (tab === "active" && p.status === "cancelled") return false;
    if (tab === "cancelled" && p.status !== "cancelled") return false;
    if (q) {
      const hay = [p.empresa, p.nome, p.cnpj, null].filter(Boolean).join(" ").toLowerCase();
      if (!hay.includes(q.toLowerCase())) return false;
    }
    return true;
  }), [partners, tab, q]);

  if (loading) return <div className="py-20 flex justify-center"><Loader2 className="h-6 w-6 animate-spin text-western-gold" /></div>;

  return (
    <div>
      <p className="text-eyebrow mb-3">Usuários & Tiers</p>
      <div className="w-12 h-px bg-western-gold mb-6" />
      <h1 className="font-display text-3xl mb-2">Programa Western Pro</h1>
      <p className="text-western-stone-warm mb-8">Defina o tier de cada parceiro e ajuste descontos, métodos de pagamento e permissões individuais.</p>

      <div className="flex flex-wrap gap-2 mb-6">
        {(["active", "cancelled"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`h-9 px-4 font-mono text-[11px] uppercase tracking-[0.18em] border ${
            tab === t ? "border-western-gold text-western-green-deep bg-western-gold/10" : "border-western-stone-warm/25 text-western-stone-warm hover:border-western-gold/60"
          }`}>{t === "active" ? "Ativos" : "Canceladas"}</button>
        ))}
        <div className="relative flex-1 min-w-[220px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-western-stone-warm" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Empresa, nome, CNPJ…" className="h-9 pl-9 rounded-none border-western-stone-warm/25" />
        </div>
      </div>

      <div className="overflow-x-auto border border-western-stone-warm/20 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-western-paper text-[10px] font-mono uppercase tracking-[0.18em] text-western-stone-warm">
            <tr>
              <th className="text-left px-4 py-3">Empresa</th>
              <th className="text-left px-4 py-3">Tier</th>
              <th className="text-left px-4 py-3">Desconto</th>
              <th className="text-left px-4 py-3">Boleto</th>
              <th className="text-left px-4 py-3">Kit grátis</th>
              <th className="text-left px-4 py-3">Admin</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr><td colSpan={7} className="px-4 py-10 text-center text-western-stone-warm">Nenhum usuário.</td></tr>
            )}
            {filtered.map((p) => {
              const pm = (p.payment_methods ?? {}) as { boleto?: boolean; kit_gratis?: boolean };
              const isAdmin = adminIds.has(p.user_id);
              return (
                <tr key={p.id} className="border-t border-western-stone-warm/10 hover:bg-western-paper/50">
                  <td className="px-4 py-3">
                    <p className="font-medium text-western-green-deep">{p.empresa || "—"}</p>
                    <p className="text-xs text-western-stone-warm">{p.nome} · {p.cnpj}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 border font-mono text-[10px] uppercase tracking-[0.18em] ${TIER_BADGE_CLS[p.tier as Tier]}`}>
                      {TIER_LABEL[p.tier as Tier]}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono">{p.discount_override != null ? `${p.discount_override}% *` : "—"}</td>
                  <td className="px-4 py-3">{pm.boleto ? "Sim" : "—"}</td>
                  <td className="px-4 py-3">{pm.kit_gratis ? "Sim" : "—"}</td>
                  <td className="px-4 py-3">{isAdmin && <ShieldCheck className="h-4 w-4 text-western-gold" />}</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => setEditing(p)} className="inline-flex items-center gap-1 text-xs font-mono uppercase tracking-[0.18em] text-western-stone-warm hover:text-western-gold">
                      <Edit className="h-3.5 w-3.5" /> Editar
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-western-stone-warm mt-3">* Override individual sobrescreve o desconto padrão do tier.</p>

      <EditUserDrawer user={editing} isAdmin={editing ? adminIds.has(editing.user_id) : false} onClose={() => setEditing(null)} onSaved={load} />
    </div>
  );
}

function EditUserDrawer({ user, isAdmin, onClose, onSaved }: { user: Partner | null; isAdmin: boolean; onClose: () => void; onSaved: () => void }) {
  const [tier, setTier] = useState<Tier>("light");
  const [discount, setDiscount] = useState<string>("");
  const [boleto, setBoleto] = useState(false);
  const [parcelas, setParcelas] = useState<string>("1");
  const [kit, setKit] = useState(false);
  const [admin, setAdmin] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    setTier(user.tier as Tier);
    setDiscount(user.discount_override != null ? String(user.discount_override) : "");
    const pm = (user.payment_methods ?? {}) as { boleto?: boolean; parcelas_max?: number; kit_gratis?: boolean };
    setBoleto(!!pm.boleto);
    setParcelas(String(pm.parcelas_max ?? 1));
    setKit(!!pm.kit_gratis);
    setAdmin(isAdmin);
  }, [user, isAdmin]);

  if (!user) return null;

  const save = async () => {
    setSaving(true);
    const payment_methods = {
      boleto,
      parcelas_max: Math.max(1, Math.min(12, parseInt(parcelas, 10) || 1)),
      kit_gratis: kit,
    };
    const discount_override = discount.trim() === "" ? null : Math.max(0, Math.min(100, parseFloat(discount)));
    const { error } = await supabase
      .from("partner_profiles")
      .update({ tier, discount_override, payment_methods } as never)
      .eq("id", user.id);
    if (error) { toast.error("Erro ao salvar.", { description: error.message }); setSaving(false); return; }

    // Admin role toggle
    if (admin && !isAdmin) {
      await supabase.from("user_roles").upsert({ user_id: user.user_id, role: "admin" }, { onConflict: "user_id,role" });
    } else if (!admin && isAdmin) {
      await supabase.from("user_roles").delete().eq("user_id", user.user_id).eq("role", "admin");
    }

    toast.success("Usuário atualizado.");
    setSaving(false);
    onSaved();
    onClose();
  };

  return (
    <Sheet open={!!user} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{user.empresa}</SheetTitle>
          <SheetDescription>{user.nome} · {user.user_id.slice(0, 8)}</SheetDescription>
        </SheetHeader>
        <div className="mt-6 space-y-6">
          <div>
            <Label className="text-eyebrow mb-2 block">Tier Western Pro</Label>
            <Select value={tier} onValueChange={(v) => setTier(v as Tier)}>
              <SelectTrigger className="h-11 rounded-none border-western-stone-warm/25"><SelectValue /></SelectTrigger>
              <SelectContent>
                {TIERS.map((t) => <SelectItem key={t} value={t}>{TIER_LABEL[t]}</SelectItem>)}
              </SelectContent>
            </Select>
            <p className="text-xs text-western-stone-warm mt-2">O tier define os defaults de desconto, boleto e parcelas. Ajuste abaixo para sobrescrever individualmente.</p>
          </div>

          <div>
            <Label className="text-eyebrow mb-2 block">Desconto override (%) — opcional</Label>
            <Input
              type="number"
              min={0}
              max={100}
              step="0.5"
              value={discount}
              onChange={(e) => setDiscount(e.target.value)}
              placeholder="Vazio = usa default do tier"
              className="h-11 rounded-none border-western-stone-warm/25"
            />
          </div>

          <div className="flex items-center justify-between border-t border-western-stone-warm/15 pt-4">
            <div>
              <Label className="text-sm">Liberar boleto</Label>
              <p className="text-xs text-western-stone-warm">Cliente pode finalizar com boleto bancário.</p>
            </div>
            <Switch checked={boleto} onCheckedChange={setBoleto} />
          </div>

          <div>
            <Label className="text-eyebrow mb-2 block">Parcelas máximas no boleto/cartão</Label>
            <Input
              type="number"
              min={1}
              max={12}
              value={parcelas}
              onChange={(e) => setParcelas(e.target.value)}
              className="h-11 rounded-none border-western-stone-warm/25"
            />
          </div>

          <div className="flex items-center justify-between border-t border-western-stone-warm/15 pt-4">
            <div>
              <Label className="text-sm">Kit de amostras grátis</Label>
              <p className="text-xs text-western-stone-warm">Aprovação imediata sem custo.</p>
            </div>
            <Switch checked={kit} onCheckedChange={setKit} />
          </div>

          <div className="flex items-center justify-between border-t border-western-stone-warm/15 pt-4">
            <div>
              <Label className="text-sm inline-flex items-center gap-1"><ShieldCheck className="h-4 w-4 text-western-gold" /> Promover a admin</Label>
              <p className="text-xs text-western-stone-warm">Acesso ao painel /admin.</p>
            </div>
            <Switch checked={admin} onCheckedChange={setAdmin} />
          </div>

          <Button onClick={save} disabled={saving} className="w-full h-12 bg-western-green-deep text-western-cream hover:bg-western-green-mid font-mono text-xs uppercase tracking-[0.25em] rounded-none">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Save className="h-4 w-4 mr-2" /> Salvar alterações</>}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
