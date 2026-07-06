import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Search, ShieldCheck, ShieldX, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { TIERS, TIER_LABEL, type Tier } from "@/components/admin/adminUtils";

interface Cred {
  id: string;
  created_at: string;
  user_id: string | null;
  cnpj: string;
  nome: string | null;
  email: string | null;
  empresa: string | null;
  decisao: "aprovado" | "analise" | "reprovado" | "solicitar_cartao";
  motivo: string | null;
  fonte: string | null;
  cnae_principal: string | null;
  cnaes_secundarios: string[] | null;
  cnae_match: string | null;
  cnae_match_tier: string | null;
  situacao: string | null;
  tier: string | null;
  protocolo: string | null;
  card_path: string | null;
  status_manual: "pendente" | "aprovado" | "recusado" | "na";
  reviewed_by: string | null;
  reviewed_at: string | null;
  review_note: string | null;
}

const formatCnpj = (c: string) => c.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, "$1.$2.$3/$4-$5");
const formatCnae = (c: string | null) => c ? c.replace(/^(\d{4})(\d)(\d{2})$/, "$1-$2/$3") : "—";

export function CredenciamentoTab() {
  const [rows, setRows] = useState<Cred[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"pendentes" | "decididos">("pendentes");
  const [q, setQ] = useState("");
  const [editing, setEditing] = useState<Cred | null>(null);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("credenciamentos")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(500);
    if (error) toast.error("Erro ao carregar.", { description: error.message });
    setRows((data as Cred[]) ?? []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => rows.filter((r) => {
    if (tab === "pendentes" && r.status_manual !== "pendente") return false;
    if (tab === "decididos" && r.status_manual === "pendente") return false;
    if (q) {
      const hay = [r.empresa, r.nome, r.cnpj, r.email, r.protocolo].filter(Boolean).join(" ").toLowerCase();
      if (!hay.includes(q.toLowerCase())) return false;
    }
    return true;
  }), [rows, tab, q]);

  if (loading) return <div className="py-20 flex justify-center"><Loader2 className="h-6 w-6 animate-spin text-western-gold" /></div>;

  return (
    <div>
      <p className="text-western-stone-warm mb-6 text-sm">Cadastros que precisam de revisão humana — CNAE em faixa amarela/laranja, fora da whitelist, ou Cartão CNPJ enviado.</p>


      <div className="flex flex-wrap gap-2 mb-6">
        {(["pendentes", "decididos"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`h-9 px-4 font-mono text-[11px] uppercase tracking-[0.18em] border ${
            tab === t ? "border-western-gold text-western-green-deep bg-western-gold/10" : "border-western-stone-warm/25 text-western-stone-warm hover:border-western-gold/60"
          }`}>{t === "pendentes" ? "Pendentes" : "Decididos"}</button>
        ))}
        <div className="relative flex-1 min-w-[220px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-western-stone-warm" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Empresa, CNPJ, e-mail, protocolo…" className="h-9 pl-9 rounded-none border-western-stone-warm/25" />
        </div>
      </div>

      <div className="overflow-x-auto border border-western-stone-warm/20 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-western-paper text-[10px] font-mono uppercase tracking-[0.18em] text-western-stone-warm">
            <tr>
              <th className="text-left px-4 py-3">Empresa / CNPJ</th>
              <th className="text-left px-4 py-3">Decisão auto</th>
              <th className="text-left px-4 py-3">CNAE</th>
              <th className="text-left px-4 py-3">Fonte</th>
              <th className="text-left px-4 py-3">Cartão</th>
              <th className="text-left px-4 py-3">Criado</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr><td colSpan={7} className="px-4 py-10 text-center text-western-stone-warm">Nenhum cadastro.</td></tr>
            )}
            {filtered.map((r) => (
              <tr key={r.id} className="border-t border-western-stone-warm/10 hover:bg-western-paper/50">
                <td className="px-4 py-3">
                  <p className="font-medium text-western-green-deep">{r.empresa ?? r.nome ?? "—"}</p>
                  <p className="text-xs text-western-stone-warm">{formatCnpj(r.cnpj)} · {r.email}</p>
                  {r.protocolo && <p className="text-[10px] font-mono text-western-stone-warm/80 mt-0.5">{r.protocolo}</p>}
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center px-2 py-0.5 border font-mono text-[10px] uppercase tracking-[0.18em] ${decisaoCls(r.decisao)}`}>{r.decisao}</span>
                  {r.status_manual !== "na" && r.status_manual !== "pendente" && (
                    <p className="text-[10px] font-mono uppercase mt-1 text-western-stone-warm">manual: {r.status_manual}</p>
                  )}
                </td>
                <td className="px-4 py-3 font-mono text-xs">
                  <p>{formatCnae(r.cnae_principal)}</p>
                  {r.cnae_match && r.cnae_match !== r.cnae_principal && (
                    <p className="text-western-stone-warm">match: {formatCnae(r.cnae_match)} ({r.cnae_match_tier})</p>
                  )}
                </td>
                <td className="px-4 py-3 text-xs">{r.fonte ?? "—"}</td>
                <td className="px-4 py-3">{r.card_path ? <span className="text-xs text-western-gold">enviado</span> : <span className="text-xs text-western-stone-warm/60">—</span>}</td>
                <td className="px-4 py-3 text-xs text-western-stone-warm">{new Date(r.created_at).toLocaleString("pt-BR")}</td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => setEditing(r)} className="text-xs font-mono uppercase tracking-[0.18em] text-western-stone-warm hover:text-western-gold">
                    Revisar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ReviewDrawer cred={editing} onClose={() => setEditing(null)} onSaved={load} />
    </div>
  );
}

function decisaoCls(d: string) {
  if (d === "aprovado") return "border-emerald-600/60 text-emerald-800 bg-emerald-50";
  if (d === "analise") return "border-amber-500/60 text-amber-800 bg-amber-50";
  if (d === "reprovado") return "border-red-600/60 text-red-800 bg-red-50";
  return "border-sky-500/50 text-sky-700 bg-sky-50";
}

function ReviewDrawer({ cred, onClose, onSaved }: { cred: Cred | null; onClose: () => void; onSaved: () => void }) {
  const [tier, setTier] = useState<Tier>("light");
  const [note, setNote] = useState("");
  const [cardUrl, setCardUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!cred) return;
    setTier((cred.tier as Tier) ?? "light");
    setNote("");
    setCardUrl(null);
    if (cred.card_path) {
      supabase.storage.from("cartoes-cnpj").createSignedUrl(cred.card_path, 300).then(({ data }) => {
        setCardUrl(data?.signedUrl ?? null);
      });
    }
  }, [cred]);

  if (!cred) return null;

  const apply = async (decision: "aprovado" | "recusado") => {
    setSaving(true);
    const patch = {
      status_manual: decision,
      reviewed_at: new Date().toISOString(),
      review_note: note || null,
      ...(decision === "aprovado" ? { tier } : {}),
    };
    const { error } = await supabase.from("credenciamentos").update(patch).eq("id", cred.id);
    if (error) { toast.error("Falha ao salvar.", { description: error.message }); setSaving(false); return; }

    if (decision === "aprovado" && cred.user_id) {
      await supabase.from("partner_profiles").update({
        status: "approved", tier,
        credenciamento_id: cred.id,
        credenciado_em: new Date().toISOString(),
        credenciado_fonte: cred.fonte ?? "manual",
        approved_at: new Date().toISOString(),
      }).eq("user_id", cred.user_id);
    } else if (decision === "recusado" && cred.user_id) {
      await supabase.from("partner_profiles").update({ status: "rejected" }).eq("user_id", cred.user_id);
    }

    toast.success(decision === "aprovado" ? "Cadastro aprovado." : "Cadastro recusado.");
    setSaving(false);
    onSaved();
    onClose();
  };

  return (
    <Sheet open={!!cred} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{cred.empresa ?? cred.nome ?? "Sem nome"}</SheetTitle>
          <SheetDescription>{formatCnpj(cred.cnpj)} · {cred.protocolo}</SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-5 text-sm">
          <div className="border border-western-stone-warm/20 p-4 bg-western-paper/40">
            <p className="text-[10px] font-mono uppercase tracking-[0.18em] text-western-stone-warm mb-2">Decisão automática</p>
            <div className="flex items-center gap-3 mb-2">
              <span className={`inline-flex items-center px-2 py-0.5 border font-mono text-[10px] uppercase tracking-[0.18em] ${decisaoCls(cred.decisao)}`}>{cred.decisao}</span>
              <span className="text-xs text-western-stone-warm">fonte: {cred.fonte ?? "nenhuma"}</span>
            </div>
            <p className="text-xs text-western-stone-warm">{cred.motivo}</p>
          </div>

          <dl className="space-y-2">
            <Row k="Situação" v={cred.situacao} />
            <Row k="E-mail" v={cred.email} />
            <Row k="CNAE principal" v={formatCnae(cred.cnae_principal)} />
            <Row k="CNAE match" v={cred.cnae_match ? `${formatCnae(cred.cnae_match)} (${cred.cnae_match_tier})` : "—"} />
            <Row k="Secundários" v={cred.cnaes_secundarios?.length ? cred.cnaes_secundarios.map(formatCnae).join(", ") : "—"} />
          </dl>

          {cred.card_path && (
            <div className="border border-western-stone-warm/20 p-4">
              <p className="text-[10px] font-mono uppercase tracking-[0.18em] text-western-stone-warm mb-2">Cartão CNPJ</p>
              {cardUrl ? (
                <a href={cardUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-western-gold link-underline font-mono text-xs uppercase tracking-[0.18em]">
                  Abrir documento <ExternalLink className="h-3.5 w-3.5" />
                </a>
              ) : <Loader2 className="h-4 w-4 animate-spin" />}
            </div>
          )}

          <div className="border-t border-western-stone-warm/15 pt-5 space-y-4">
            <div>
              <Label className="text-eyebrow mb-2 block">Tier ao aprovar</Label>
              <Select value={tier} onValueChange={(v) => setTier(v as Tier)}>
                <SelectTrigger className="h-11 rounded-none border-western-stone-warm/25"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {TIERS.map((t) => <SelectItem key={t} value={t}>{TIER_LABEL[t]}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-eyebrow mb-2 block">Nota interna (opcional)</Label>
              <Input value={note} onChange={(e) => setNote(e.target.value)} className="h-11 rounded-none border-western-stone-warm/25" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Button onClick={() => apply("recusado")} disabled={saving} variant="outline"
                className="h-12 border-red-700/30 text-red-800 hover:bg-red-50 rounded-none font-mono text-xs uppercase tracking-[0.22em]">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <><ShieldX className="h-4 w-4 mr-2" /> Recusar</>}
              </Button>
              <Button onClick={() => apply("aprovado")} disabled={saving}
                className="h-12 bg-western-green-deep text-western-cream hover:bg-western-green-mid rounded-none font-mono text-xs uppercase tracking-[0.22em]">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <><ShieldCheck className="h-4 w-4 mr-2" /> Aprovar</>}
              </Button>
            </div>
            <Button
              onClick={async () => {
                setSaving(true);
                const { data, error } = await supabase.functions.invoke("credenciar", {
                  body: { cnpj: cred.cnpj, nome: cred.nome ?? undefined, email: cred.email ?? undefined, mode: "reavaliar", credenciamento_id: cred.id },
                });
                setSaving(false);
                if (error) { toast.error("Falha ao reavaliar.", { description: error.message }); return; }
                const decisao = (data as { decisao?: string } | null)?.decisao ?? "?";
                toast.success(`Reavaliado: ${decisao}.`);
                onSaved();
                onClose();
              }}
              disabled={saving}
              variant="outline"
              className="w-full h-11 rounded-none border-western-stone-warm/30 text-western-stone-warm hover:text-western-green-deep hover:border-western-gold font-mono text-[11px] uppercase tracking-[0.22em]"
            >
              Reavaliar nas fontes (Receita/BrasilAPI/CNPJá)
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function Row({ k, v }: { k: string; v: string | null | undefined }) {
  return (
    <div className="flex gap-3">
      <dt className="text-[10px] font-mono uppercase tracking-[0.18em] text-western-stone-warm w-32 flex-shrink-0 pt-0.5">{k}</dt>
      <dd className="text-western-green-deep flex-1 break-words text-xs">{v || "—"}</dd>
    </div>
  );
}
