import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { TIERS, TIER_LABEL, type Tier } from "@/components/admin/adminUtils";

interface TierDefault {
  tier: Tier;
  discount_pct: number;
  boleto: boolean;
  parcelas_max: number;
  kit_gratis: boolean;
}

export default function AdminSettings() {
  const [defs, setDefs] = useState<TierDefault[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<Tier | null>(null);

  const load = async () => {
    const { data } = await supabase.from("tier_defaults").select("*").order("tier");
    setDefs((data as TierDefault[]) ?? []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const saveTier = async (t: TierDefault) => {
    setSaving(t.tier);
    const { error } = await supabase.from("tier_defaults").upsert({
      tier: t.tier,
      discount_pct: t.discount_pct,
      boleto: t.boleto,
      parcelas_max: t.parcelas_max,
      kit_gratis: t.kit_gratis,
    } as never, { onConflict: "tier" });
    setSaving(null);
    if (error) { toast.error("Erro ao salvar.", { description: error.message }); return; }
    toast.success(`${TIER_LABEL[t.tier]} atualizado.`);
  };

  const update = (tier: Tier, patch: Partial<TierDefault>) => {
    setDefs((d) => d.map((x) => x.tier === tier ? { ...x, ...patch } : x));
  };

  if (loading) return <div className="py-20 flex justify-center"><Loader2 className="h-6 w-6 animate-spin text-western-gold" /></div>;

  // Garante 4 linhas (cria as faltantes localmente para edição)
  const ensured: TierDefault[] = TIERS.map((t) =>
    defs.find((d) => d.tier === t) ?? { tier: t, discount_pct: 0, boleto: false, parcelas_max: 1, kit_gratis: false }
  );

  return (
    <div>
      <p className="text-eyebrow mb-3">Configurações</p>
      <div className="w-12 h-px bg-western-gold mb-6" />
      <h1 className="font-display text-3xl mb-2">Defaults dos tiers</h1>
      <p className="text-western-stone-warm mb-8">Esses valores se aplicam automaticamente a todos os parceiros do tier (a menos que haja override individual em /admin/usuarios).</p>

      <div className="grid sm:grid-cols-2 gap-4">
        {ensured.map((t) => (
          <div key={t.tier} className="border border-western-stone-warm/20 bg-white p-5">
            <h3 className="font-display text-xl text-western-green-deep mb-4">{TIER_LABEL[t.tier]}</h3>
            <div className="space-y-4">
              <div>
                <Label className="text-eyebrow mb-1.5 block">Desconto padrão (%)</Label>
                <Input
                  type="number" min={0} max={100} step="0.5"
                  value={t.discount_pct}
                  onChange={(e) => update(t.tier, { discount_pct: parseFloat(e.target.value) || 0 })}
                  className="h-11 rounded-none border-western-stone-warm/25"
                />
              </div>
              <div>
                <Label className="text-eyebrow mb-1.5 block">Parcelas máximas</Label>
                <Input
                  type="number" min={1} max={12}
                  value={t.parcelas_max}
                  onChange={(e) => update(t.tier, { parcelas_max: parseInt(e.target.value, 10) || 1 })}
                  className="h-11 rounded-none border-western-stone-warm/25"
                />
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-sm">Permite boleto</Label>
                <Switch checked={t.boleto} onCheckedChange={(v) => update(t.tier, { boleto: v })} />
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-sm">Kit de amostras grátis</Label>
                <Switch checked={t.kit_gratis} onCheckedChange={(v) => update(t.tier, { kit_gratis: v })} />
              </div>
              <Button
                onClick={() => saveTier(t)}
                disabled={saving === t.tier}
                className="w-full h-10 bg-western-green-deep text-western-cream hover:bg-western-green-mid font-mono text-[11px] uppercase tracking-[0.22em] rounded-none mt-2"
              >
                {saving === t.tier ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Save className="h-3.5 w-3.5 mr-2" /> Salvar</>}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
