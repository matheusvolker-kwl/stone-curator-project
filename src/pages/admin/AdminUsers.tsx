import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Search, Save, ShieldCheck, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription,
} from "@/components/ui/sheet";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  DataTable, type Coluna,
  PageHeader,
  Tabs,
  CelulaData,
} from "@/components/backoffice";
import { TIERS, TIER_LABEL, type Tier, type Partner } from "@/components/admin/adminUtils";

/**
 * Usuários e níveis do Western Pro.
 *
 * O BUG QUE JÁ CEGOU O DONO — e que estava aqui de novo:
 *
 *   const [{ data: ps }, { data: roles }] = await Promise.all([...]);
 *   setPartners(ps ?? []);
 *
 * O `error` era descartado nas DUAS queries. Um 403 em `user_roles` (exatamente
 * o que aconteceu no painel antigo) virava "nenhum admin" em silêncio, e um erro
 * em `partner_profiles` virava "Nenhum usuário" — tela vazia, dono achando que
 * não tem parceiro nenhum. Agora: erro é estado, e erro NÃO é lista vazia.
 */

const TIER_CHIP: Record<Tier, string> = {
  light: "border-western-border-strong bg-western-paper text-western-stone-warm",
  gold: "border-western-bronze/35 bg-western-bronze/[0.07] text-western-bronze",
  platinum: "border-western-green-mid/30 bg-western-green-mid/[0.07] text-western-green-mid",
  partner: "border-western-gold/45 bg-western-gold/[0.12] text-western-green-deep",
};

function TierChip({ tier }: { tier: Tier }) {
  const t: Tier = TIERS.includes(tier) ? tier : "light";
  return (
    <span
      className={`inline-flex items-center whitespace-nowrap rounded-[6px] border px-2.5 py-1 text-[14px] font-semibold leading-none ${TIER_CHIP[t]}`}
    >
      {TIER_LABEL[t].replace("Western Pro ", "")}
    </span>
  );
}

const campoCls =
  "h-[52px] w-full rounded-[6px] border border-western-border-strong bg-white px-3 text-[16px] text-western-green-deep placeholder:text-western-stone-warm/70 transition-colors focus:border-western-cta focus:outline-none focus:ring-2 focus:ring-western-cta/20";

export default function AdminUsers() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [adminIds, setAdminIds] = useState<Set<string>>(new Set());
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<unknown>(null);
  const [aba, setAba] = useState<"ativos" | "cancelados">("ativos");
  const [q, setQ] = useState("");
  const [editando, setEditando] = useState<Partner | null>(null);

  const load = useCallback(async () => {
    setCarregando(true);
    setErro(null);

    const [perfis, papeis] = await Promise.all([
      supabase.from("partner_profiles").select("*").order("empresa", { ascending: true }),
      supabase.from("user_roles").select("user_id, role").eq("role", "admin"),
    ]);

    // A lista de parceiros é a tela: erro aqui derruba tudo (e mostra o motivo).
    if (perfis.error) {
      setErro(perfis.error);
      setCarregando(false);
      return;
    }
    setPartners((perfis.data as Partner[]) ?? []);

    // Os papéis só enfeitam a coluna "Admin" — não vale esconder os parceiros por
    // causa deles. Mas o erro APARECE: foi um 403 silencioso aqui que cegou o dono.
    if (papeis.error) {
      toast.error("Não consegui carregar os administradores.", {
        description: `${papeis.error.message} — a coluna "Admin" pode estar incompleta.`,
      });
      setAdminIds(new Set());
    } else {
      setAdminIds(new Set((papeis.data ?? []).map((r) => r.user_id as string)));
    }

    setCarregando(false);
  }, []);

  useEffect(() => { void load(); }, [load]);

  const contagens = useMemo(() => ({
    ativos: partners.filter((p) => p.status !== "cancelled").length,
    cancelados: partners.filter((p) => p.status === "cancelled").length,
  }), [partners]);

  const filtrados = useMemo(() => {
    const base = partners.filter((p) =>
      aba === "ativos" ? p.status !== "cancelled" : p.status === "cancelled",
    );
    const termo = q.trim().toLowerCase();
    if (!termo) return base;
    return base.filter((p) =>
      [p.empresa, p.nome, p.cnpj].filter(Boolean).join(" ").toLowerCase().includes(termo),
    );
  }, [partners, aba, q]);

  const colunas: ReadonlyArray<Coluna<Partner>> = useMemo(() => [
    {
      key: "empresa",
      header: "Empresa",
      principalNoMobile: true,
      sortable: true,
      sortValue: (p) => p.empresa ?? p.nome ?? "",
      render: (p) => (
        <div className="min-w-0">
          <p className="truncate font-semibold text-western-green-deep">{p.empresa || "—"}</p>
          <p className="truncate text-[14px] text-western-stone-warm">
            {[p.nome, p.cnpj].filter(Boolean).join(" · ") || "—"}
          </p>
        </div>
      ),
    },
    {
      key: "tier",
      header: "Nível",
      sortable: true,
      render: (p) => <TierChip tier={p.tier as Tier} />,
    },
    {
      key: "discount_override",
      header: "Desconto",
      align: "right",
      sortable: true,
      sortValue: (p) => p.discount_override,
      render: (p) => (
        <span className="text-western-green-deep">
          {p.discount_override != null ? `${p.discount_override}%` : "padrão do nível"}
        </span>
      ),
    },
    {
      key: "boleto",
      header: "Boleto",
      ocultarNoMobile: true,
      sortValue: (p) => (p.payment_methods?.boleto ? 1 : 0),
      sortable: true,
      render: (p) => (
        <span className="text-[16px] text-western-stone-warm">
          {p.payment_methods?.boleto ? "Sim" : "—"}
        </span>
      ),
    },
    {
      key: "kit_gratis",
      header: "Kit grátis",
      ocultarNoMobile: true,
      sortValue: (p) => (p.payment_methods?.kit_gratis ? 1 : 0),
      sortable: true,
      render: (p) => (
        <span className="text-[16px] text-western-stone-warm">
          {p.payment_methods?.kit_gratis ? "Sim" : "—"}
        </span>
      ),
    },
    {
      key: "admin",
      header: "Admin",
      ocultarNoMobile: true,
      render: (p) =>
        adminIds.has(p.user_id) ? (
          <span className="inline-flex items-center gap-1.5 text-[16px] font-semibold text-western-bronze">
            <ShieldCheck className="h-4 w-4" aria-hidden="true" /> Sim
          </span>
        ) : (
          <span className="text-meta">—</span>
        ),
    },
    {
      key: "created_at",
      header: "Entrou",
      align: "right",
      sortable: true,
      sortValue: (p) => p.created_at,
      ocultarNoMobile: true,
      render: (p) => <CelulaData valor={p.created_at} className="text-western-stone-warm" />,
    },
    {
      key: "acao",
      header: "",
      align: "right",
      width: "56px",
      ocultarNoMobile: true,
      render: () => <ChevronRight className="ml-auto h-4 w-4 text-western-stone-warm/45" aria-hidden="true" />,
    },
  ], [adminIds]);

  return (
    <div>
      <PageHeader
        eyebrow="Programa Western Pro"
        titulo="Usuários e níveis"
        subtitulo="Defina o nível de cada parceiro e ajuste desconto, pagamento e permissões individuais. O desconto individual sobrescreve o padrão do nível."
      />

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <Tabs
          abas={[
            { key: "ativos", label: "Ativos", count: carregando || erro ? undefined : contagens.ativos },
            { key: "cancelados", label: "Cancelados", count: carregando || erro ? undefined : contagens.cancelados },
          ]}
          ativa={aba}
          onChange={setAba}
        />

        <div className="relative ml-auto min-w-[240px] flex-1 md:max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-western-stone-warm" aria-hidden="true" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Empresa, nome, CNPJ…"
            aria-label="Buscar parceiro"
            className="h-[48px] rounded-[6px] border-western-border-strong bg-white pl-10 text-[16px] text-western-green-deep placeholder:text-western-stone-warm/70"
          />
        </div>
      </div>

      <DataTable
        linhas={filtrados}
        colunas={colunas}
        getId={(p) => p.id}
        isLoading={carregando}
        error={erro}
        onRetry={load}
        onRowClick={(p) => setEditando(p)}
        vazio={{
          titulo: q
            ? "Nenhum parceiro encontrado"
            : aba === "ativos"
              ? "Nenhum parceiro ativo"
              : "Nenhum cadastro cancelado",
          mensagem: q
            ? "Nada bate com essa busca. Limpe o campo para ver a lista inteira."
            : aba === "ativos"
              ? "Assim que um credenciamento for aprovado, o parceiro aparece aqui."
              : "Cadastros cancelados ficariam registrados aqui.",
        }}
      />

      <EditUserDrawer
        user={editando}
        isAdmin={editando ? adminIds.has(editando.user_id) : false}
        onClose={() => setEditando(null)}
        onSaved={load}
      />
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
 * Detalhe / edição
 * ───────────────────────────────────────────────────────────── */

function EditUserDrawer({
  user,
  isAdmin,
  onClose,
  onSaved,
}: {
  user: Partner | null;
  isAdmin: boolean;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [tier, setTier] = useState<Tier>("light");
  const [desconto, setDesconto] = useState("");
  const [boleto, setBoleto] = useState(false);
  const [parcelas, setParcelas] = useState("1");
  const [kit, setKit] = useState(false);
  const [admin, setAdmin] = useState(false);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    if (!user) return;
    setTier(user.tier as Tier);
    setDesconto(user.discount_override != null ? String(user.discount_override) : "");
    const pm = user.payment_methods ?? {};
    setBoleto(!!pm.boleto);
    setParcelas(String(pm.parcelas_max ?? 1));
    setKit(!!pm.kit_gratis);
    setAdmin(isAdmin);
  }, [user, isAdmin]);

  if (!user) return null;

  const salvar = async () => {
    setSalvando(true);

    const payment_methods = {
      boleto,
      parcelas_max: Math.max(1, Math.min(12, parseInt(parcelas, 10) || 1)),
      kit_gratis: kit,
    };
    const discount_override = desconto.trim() === ""
      ? null
      : Math.max(0, Math.min(100, parseFloat(desconto) || 0));

    const { error } = await supabase
      .from("partner_profiles")
      .update({ tier, discount_override, payment_methods } as never)
      .eq("id", user.id);

    if (error) {
      toast.error("Não consegui salvar o parceiro.", { description: error.message });
      setSalvando(false);
      return;
    }

    // Promover/rebaixar admin é uma escrita SEPARADA — e antes o erro dela era
    // engolido: a tela dizia "atualizado" mesmo quando o papel não mudava.
    if (admin !== isAdmin) {
      const { error: papelErro } = admin
        ? await supabase.from("user_roles").upsert(
            { user_id: user.user_id, role: "admin" },
            { onConflict: "user_id,role" },
          )
        : await supabase.from("user_roles").delete().eq("user_id", user.user_id).eq("role", "admin");

      if (papelErro) {
        toast.error(
          admin ? "Parceiro salvo, mas NÃO virou admin." : "Parceiro salvo, mas o acesso admin NÃO foi removido.",
          { description: papelErro.message },
        );
        setSalvando(false);
        onSaved();
        return;
      }
    }

    toast.success("Parceiro atualizado.");
    setSalvando(false);
    onSaved();
    onClose();
  };

  return (
    <Sheet open={!!user} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
        <SheetHeader className="text-left">
          <SheetTitle className="display-md text-western-green-deep">{user.empresa || user.nome || "Parceiro"}</SheetTitle>
          <SheetDescription className="text-[16px] text-western-stone-warm">
            {[user.nome, user.cnpj].filter(Boolean).join(" · ") || "—"}
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          <div>
            <Label className="text-eyebrow mb-2 block">Nível Western Pro</Label>
            <Select value={tier} onValueChange={(v) => setTier(v as Tier)}>
              <SelectTrigger className="h-[52px] rounded-[6px] border-western-border-strong text-[16px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TIERS.map((t) => <SelectItem key={t} value={t}>{TIER_LABEL[t]}</SelectItem>)}
              </SelectContent>
            </Select>
            <p className="text-meta mt-2">
              O nível define os padrões de desconto, boleto e parcelas. Os campos abaixo sobrescrevem
              isso só para este parceiro.
            </p>
          </div>

          <div>
            <Label className="text-eyebrow mb-2 block">Desconto individual (%)</Label>
            <input
              type="number"
              min={0}
              max={100}
              step="0.5"
              value={desconto}
              onChange={(e) => setDesconto(e.target.value)}
              placeholder="Vazio = usa o padrão do nível"
              className={`${campoCls} tabular-nums`}
            />
          </div>

          <div>
            <Label className="text-eyebrow mb-2 block">Parcelas máximas</Label>
            <input
              type="number"
              min={1}
              max={12}
              value={parcelas}
              onChange={(e) => setParcelas(e.target.value)}
              className={`${campoCls} tabular-nums`}
            />
          </div>

          <div className="flex items-center justify-between gap-4 border-t border-western-border-soft pt-5">
            <div className="min-w-0">
              <Label className="text-[17px] font-semibold text-western-green-deep">Liberar boleto</Label>
              <p className="text-meta">O parceiro pode fechar o pedido com boleto.</p>
            </div>
            <Switch checked={boleto} onCheckedChange={setBoleto} aria-label="Liberar boleto" />
          </div>

          <div className="flex items-center justify-between gap-4 border-t border-western-border-soft pt-5">
            <div className="min-w-0">
              <Label className="text-[17px] font-semibold text-western-green-deep">Kit de amostras grátis</Label>
              <p className="text-meta">Aprovação imediata, sem custo.</p>
            </div>
            <Switch checked={kit} onCheckedChange={setKit} aria-label="Kit de amostras grátis" />
          </div>

          <div className="flex items-center justify-between gap-4 border-t border-western-border-soft pt-5">
            <div className="min-w-0">
              <Label className="inline-flex items-center gap-1.5 text-[17px] font-semibold text-western-green-deep">
                <ShieldCheck className="h-4 w-4 text-western-bronze" aria-hidden="true" />
                Promover a administrador
              </Label>
              <p className="text-meta">Dá acesso total ao painel /admin.</p>
            </div>
            <Switch checked={admin} onCheckedChange={setAdmin} aria-label="Promover a administrador" />
          </div>

          <button type="button" onClick={salvar} disabled={salvando} className="btn-primary w-full">
            {salvando ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Save className="h-4 w-4" aria-hidden="true" />}
            {salvando ? "Salvando…" : "Salvar alterações"}
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
