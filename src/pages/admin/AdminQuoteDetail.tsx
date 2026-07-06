import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import {
  Loader2, ArrowLeft, Trash2, Archive, Save, Plus, Minus, X, Send,
  Download, FileText, CheckCircle2, ExternalLink, MessageCircle, Mail,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { formatBRL, parseBRL } from "@/lib/catalog/client";
import { type Lead } from "@/components/admin/adminUtils";
import {
  QUOTE_STATUS_LABEL, QUOTE_STATUS_CLS,
  type QuoteStatus, type QuoteThread, type QuotePayload,
  type QuotePayloadItem, type QuoteProposal,
} from "@/components/admin/quoteTypes";
import { downloadPropostaPdf, propostaPdfBlob } from "@/lib/pdf/propostaPdf";
import { BUSINESS } from "@/config/business";

const STATUS_OPTIONS: QuoteStatus[] = [
  "novo", "em_atendimento", "proposta_enviada", "fechado", "perdido", "arquivado",
];

const FORMAS_PAGAMENTO = [
  "PIX", "Boleto", "Cartão de crédito", "Transferência", "Dinheiro", "Outro",
];

interface EditableItem extends QuotePayloadItem {
  /** key local pra render */
  _key: string;
  /** acabamento/cor editável pelo admin (sobrescreve options no PDF) */
  acabamento?: string;
}

/** Input monetário em formato BR: aceita "1.500,00", "R$ 1.500,00", "1500.5" etc. */
function BRLInput({
  value, onChange, placeholder, className,
}: {
  value: number;
  onChange: (n: number) => void;
  placeholder?: string;
  className?: string;
}) {
  const [text, setText] = useState<string>(() =>
    Number.isFinite(value) && value !== 0 ? formatBRL(value, "BRL") : "",
  );
  const [focused, setFocused] = useState(false);
  // Sincroniza quando o valor externo muda e o campo NÃO está sendo editado
  useEffect(() => {
    if (!focused) {
      setText(Number.isFinite(value) && value !== 0 ? formatBRL(value, "BRL") : "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);
  return (
    <Input
      type="text"
      inputMode="decimal"
      value={text}
      placeholder={placeholder}
      className={className}
      onFocus={() => setFocused(true)}
      onChange={(e) => {
        const raw = e.target.value;
        setText(raw);
        const parsed = parseBRL(raw);
        if (Number.isFinite(parsed)) onChange(parsed);
      }}
      onBlur={() => {
        setFocused(false);
        const parsed = parseBRL(text);
        if (Number.isFinite(parsed)) {
          onChange(parsed);
          setText(formatBRL(parsed, "BRL"));
        } else {
          setText(Number.isFinite(value) && value !== 0 ? formatBRL(value, "BRL") : "");
        }
      }}
    />
  );
}

export default function AdminQuoteDetail() {
  const { leadId } = useParams<{ leadId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [lead, setLead] = useState<Lead | null>(null);
  const [thread, setThread] = useState<QuoteThread | null>(null);
  const [proposals, setProposals] = useState<QuoteProposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingThread, setSavingThread] = useState(false);
  const [sendingProposal, setSendingProposal] = useState(false);
  const [closingSale, setClosingSale] = useState(false);

  // Editor de proposta
  const [items, setItems] = useState<EditableItem[]>([]);
  const [discountPct, setDiscountPct] = useState(0);
  const [formaPagamento, setFormaPagamento] = useState("PIX");
  const [parcelas, setParcelas] = useState(1);
  const [validadeDias, setValidadeDias] = useState(15);
  const [observacoes, setObservacoes] = useState("");
  const [jurosLabel, setJurosLabel] = useState<"nao_informar" | "sem_juros" | "com_juros">("nao_informar");

  // Mini-form "incluir item"
  const [newItemTitle, setNewItemTitle] = useState("");
  const [newItemQty, setNewItemQty] = useState<string>("1");
  const [newItemPrice, setNewItemPrice] = useState<string>("0");

  // Fechar venda
  const [saleForma, setSaleForma] = useState("PIX");
  const [saleParcelas, setSaleParcelas] = useState(1);
  const [saleValor, setSaleValor] = useState<string>("");
  const [saleObs, setSaleObs] = useState("");

  // Notas internas
  const [notas, setNotas] = useState("");
  const [statusLocal, setStatusLocal] = useState<QuoteStatus>("novo");

  const load = async () => {
    if (!leadId) return;
    setLoading(true);
    const [{ data: leadData }, { data: threadData }, { data: propData }] = await Promise.all([
      supabase.from("leads").select("*").eq("id", leadId).maybeSingle(),
      supabase.from("quote_threads").select("*").eq("lead_id", leadId).maybeSingle(),
      supabase.from("quote_proposals").select("*").eq("lead_id", leadId).order("created_at", { ascending: false }),
    ]);

    const l = leadData as Lead | null;
    let t = threadData as QuoteThread | null;
    if (l && !t) {
      // Garantia caso o trigger não tenha rodado (lead antigo)
      const { data: created } = await supabase
        .from("quote_threads")
        .insert({ lead_id: l.id })
        .select()
        .single();
      t = created as QuoteThread;
    }
    setLead(l);
    setThread(t);
    setProposals((propData as unknown as QuoteProposal[]) ?? []);

    if (t) {
      setStatusLocal(t.status);
      setNotas(t.notas ?? "");
      setSaleForma(t.forma_pagamento || "PIX");
      setSaleParcelas(t.parcelas || 1);
      setSaleValor(t.valor_final ? String(t.valor_final) : "");
      setSaleObs(t.observacoes_venda ?? "");
    }

    // Inicializa editor com itens originais (ou última proposta se houver)
    const seed = (propData as unknown as QuoteProposal[] | null)?.[0];
    const rawSourceItems: QuotePayloadItem[] = seed
      ? seed.items
      : ((l?.payload as unknown as QuotePayload)?.items ?? []);

    // Extrai marker de juros (sentinel embutido em items) e filtra
    const jurosSentinel = rawSourceItems.find((i) => i.handle === "__meta_juros__");
    const restoredJuros = (jurosSentinel?.title as "nao_informar" | "sem_juros" | "com_juros" | undefined) ?? "nao_informar";
    const sourceItems = rawSourceItems.filter((i) => !i.handle?.startsWith("__meta_"));

    setItems(
      sourceItems.map((it, idx) => ({ ...it, _key: `${it.handle}-${idx}-${Math.random()}` })),
    );
    setJurosLabel(restoredJuros);
    if (seed) {
      setDiscountPct(Number(seed.discount_pct));
      setFormaPagamento(seed.forma_pagamento || "PIX");
      setParcelas(seed.parcelas || 1);
      setValidadeDias(seed.validade_dias || 15);
      setObservacoes(seed.observacoes ?? "");
    }
    setLoading(false);
  };

  useEffect(() => { load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [leadId]);

  const subtotal = useMemo(
    () => items.reduce((acc, i) => acc + i.unitPrice * i.quantity, 0),
    [items],
  );
  const discountValue = useMemo(
    () => +(subtotal * (discountPct / 100)).toFixed(2),
    [subtotal, discountPct],
  );
  const total = useMemo(() => +(subtotal - discountValue).toFixed(2), [subtotal, discountValue]);
  const payload = (lead?.payload as unknown as QuotePayload) ?? null;
  const numero = payload?.numero ?? lead?.id.slice(0, 5).toUpperCase() ?? "—";

  // ----- Actions -----

  const updateThread = async (patch: Partial<QuoteThread>) => {
    if (!thread) return;
    setSavingThread(true);
    const { error } = await supabase.from("quote_threads").update(patch).eq("id", thread.id);
    setSavingThread(false);
    if (error) return toast.error(error.message);
    setThread({ ...thread, ...patch });
  };

  const handleSaveNotes = async () => {
    if (savingThread) return;
    try {
      await updateThread({ status: statusLocal, notas });
      toast.success("Atualizações salvas.");
    } finally {
      // updateThread já reseta savingThread; garantia extra
      setSavingThread(false);
    }
  };

  const handleArchive = async () => {
    if (!confirm("Arquivar este orçamento? Ele continua acessível pelo filtro Arquivado.")) return;
    await updateThread({ status: "arquivado", archived_at: new Date().toISOString() });
    setStatusLocal("arquivado");
    toast.success("Orçamento arquivado.");
  };

  const handleDelete = async () => {
    if (!lead) return;
    if (!confirm("Apagar este orçamento de vez? Essa ação não pode ser desfeita.")) return;
    const { error } = await supabase.from("leads").delete().eq("id", lead.id);
    if (error) return toast.error(error.message);
    toast.success("Orçamento apagado.");
    navigate("/admin/orcamentos");
  };

  const jaVendida = !!(thread?.pago_em && thread?.valor_final);

  const handleCloseSale = async () => {
    if (!thread || !lead) return;
    if (closingSale) return;

    // Validação de valor / parcelas
    const valorNum = saleValor ? Number(saleValor) : total;
    if (!Number.isFinite(valorNum) || valorNum <= 0) {
      return toast.error("Valor final da venda precisa ser maior que zero.");
    }
    if (!Number.isInteger(saleParcelas) || saleParcelas < 1) {
      return toast.error("Número de parcelas inválido.");
    }

    // Idempotência: se já vendida, exigir confirmação
    if (jaVendida) {
      if (!confirm("Esta venda já foi fechada. Regravar os dados de fechamento?")) return;
    }

    setClosingSale(true);
    try {
      await updateThread({
        status: "fechado",
        pago_em: new Date().toISOString(),
        forma_pagamento: saleForma,
        parcelas: saleParcelas,
        valor_final: valorNum,
        observacoes_venda: saleObs || null,
      });
      // Só promove se ainda não foi promovido antes
      if (!jaVendida) {
        const { error: promoteErr } = await supabase.rpc("promote_quote_lead_to_order", {
          _lead_id: lead.id,
          _order_id: null,
        });
        if (promoteErr) console.warn("promote_quote_lead_to_order falhou", promoteErr);
      }
      setStatusLocal("fechado");
      toast.success("Venda registrada.");
    } finally {
      setClosingSale(false);
    }
  };

  // ----- Proposta -----

  const updateItem = (key: string, patch: Partial<EditableItem>) =>
    setItems((prev) => prev.map((i) => (i._key === key ? { ...i, ...patch } : i)));
  const removeItem = (key: string) =>
    setItems((prev) => prev.filter((i) => i._key !== key));

  const addItem = () => {
    const title = newItemTitle.trim();
    const qty = Number(newItemQty);
    const price = Number(newItemPrice);
    if (!title) return toast.error("Informe o nome do item.");
    if (!Number.isInteger(qty) || qty < 1) return toast.error("Quantidade deve ser inteiro ≥ 1.");
    if (!Number.isFinite(price) || price < 0) return toast.error("Preço deve ser ≥ 0.");
    const key = "manual-" + crypto.randomUUID();
    setItems((prev) => [
      ...prev,
      { handle: key, title, unitPrice: price, quantity: qty, options: [], _key: key },
    ]);
    setNewItemTitle("");
    setNewItemQty("1");
    setNewItemPrice("0");
  };

  const handleGeneratePdf = async (download: boolean) => {
    if (!lead) return;
    if (sendingProposal) return;
    if (items.length === 0) return toast.error("Adicione itens à proposta.");
    if (total <= 0) {
      return toast.error("Total da proposta é R$ 0 — revise itens/desconto antes de gerar.");
    }

    setSendingProposal(true);
    try {
      // Numeração sequencial por lead, contando no banco (count exato)
      const baseNumero = payload?.numero ?? lead.id.slice(0, 5).toUpperCase();
      let seq = proposals.length + 1;
      if (!download) {
        const { count } = await supabase
          .from("quote_proposals")
          .select("id", { count: "exact", head: true })
          .eq("lead_id", lead.id);
        if (typeof count === "number") seq = count + 1;
      }
      const propNumero = `${baseNumero}-P${seq.toString().padStart(2, "0")}`;
      const opts = {
        numero: propNumero,
        cliente: {
          nome: lead.nome ?? undefined,
          email: lead.email ?? undefined,
          telefone: lead.telefone ?? undefined,
          empresa: lead.empresa ?? undefined,
          cidade: lead.cidade ?? undefined,
        },
        items: items.map((i) => ({
          productTitle: i.title,
          acabamento: i.options?.map((o) => o.value).join(" · ") || i.variantTitle,
          quantity: i.quantity,
          unitPrice: i.unitPrice,
          productImage: i.image,
        })),
        subtotal, discountPct, discountValue, total,
        formaPagamento, parcelas, validadeDias, observacoes,
        jurosLabel,
      };

      if (download) {
        await downloadPropostaPdf(opts);
        return;
      }

      // Salva proposta + sobe PDF
      const blob = await propostaPdfBlob(opts);
      const path = `propostas/${lead.id}/${propNumero}.pdf`;
      const { error: upErr } = await supabase.storage
        .from("orcamentos")
        .upload(path, blob, { contentType: "application/pdf", upsert: true });
      if (upErr) throw upErr;

      // Persiste jurosLabel como sentinel dentro de items (sem criar coluna)
      const itemsToSave: QuotePayloadItem[] = [
        ...items.map(({ _key, ...rest }) => rest),
        { handle: "__meta_juros__", title: jurosLabel, quantity: 0, unitPrice: 0 },
      ];

      const { data: created, error: insErr } = await supabase
        .from("quote_proposals")
        .insert({
          lead_id: lead.id,
          numero: propNumero,
          items: itemsToSave as unknown as never,
          subtotal, discount_pct: discountPct, discount_value: discountValue, total,
          forma_pagamento: formaPagamento, parcelas, validade_dias: validadeDias,
          observacoes: observacoes || null,
          pdf_path: path,
          sent_at: new Date().toISOString(),
          created_by: user?.id ?? null,
        })
        .select()
        .single();
      if (insErr) throw insErr;

      await updateThread({ status: "proposta_enviada" });
      setStatusLocal("proposta_enviada");
      setProposals((prev) => [created as unknown as QuoteProposal, ...prev]);
      toast.success(`Proposta ${propNumero} salva.`);
    } catch (e) {
      console.error(e);
      toast.error("Falha ao gerar/salvar a proposta.");
    } finally {
      setSendingProposal(false);
    }
  };

  const openProposalPdf = async (path: string) => {
    const { data, error } = await supabase.storage.from("orcamentos").createSignedUrl(path, 3600);
    if (error || !data) return toast.error("Não foi possível abrir o PDF.");
    window.open(data.signedUrl, "_blank", "noopener,noreferrer");
  };

  const buildShareLink = (channel: "whatsapp" | "email", signedUrl: string, propNumero: string) => {
    const text = `Olá ${lead?.nome?.split(" ")[0] || ""}! Segue a proposta Western Nº ${propNumero}: ${signedUrl}`;
    if (channel === "whatsapp") {
      const phone = (lead?.telefone || "").replace(/\D/g, "");
      return phone
        ? `https://wa.me/${phone.startsWith("55") ? phone : "55" + phone}?text=${encodeURIComponent(text)}`
        : `https://wa.me/?text=${encodeURIComponent(text)}`;
    }
    const subject = `Proposta Western Nº ${propNumero}`;
    return `mailto:${lead?.email || ""}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(text)}`;
  };

  const shareProposal = async (p: QuoteProposal, channel: "whatsapp" | "email") => {
    if (!p.pdf_path) return;
    const { data } = await supabase.storage.from("orcamentos").createSignedUrl(p.pdf_path, 60 * 60 * 24 * 7);
    if (!data) return toast.error("Falha ao gerar link.");
    window.open(buildShareLink(channel, data.signedUrl, p.numero), "_blank");
  };

  // ----- UI -----

  if (loading) {
    return (
      <div className="py-20 flex justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-western-gold" />
      </div>
    );
  }
  if (!lead || !thread) {
    return (
      <div className="py-20 text-center text-western-stone-warm">
        Orçamento não encontrado.
        <div className="mt-4">
          <Link to="/admin/orcamentos" className="text-western-gold underline">
            Voltar
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <Link
          to="/admin/orcamentos"
          className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-[0.2em] text-western-stone-warm hover:text-western-gold mb-4"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Orçamentos
        </Link>

        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-eyebrow mb-2">Orçamento Nº {numero}</p>
            <h1 className="font-display text-3xl text-western-green-deep">
              {lead.nome || lead.empresa || lead.email || "(sem nome)"}
            </h1>
            <p className="text-sm text-western-stone-warm mt-1">
              Recebido em {new Date(lead.created_at).toLocaleString("pt-BR")}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              onClick={handleArchive}
              className="rounded-none border-western-stone-warm/30 font-mono text-[11px] uppercase tracking-[0.18em] h-10"
            >
              <Archive className="h-3.5 w-3.5 mr-2" /> Arquivar
            </Button>
            <Button
              variant="outline"
              onClick={handleDelete}
              className="rounded-none border-red-300 text-red-700 hover:bg-red-50 font-mono text-[11px] uppercase tracking-[0.18em] h-10"
            >
              <Trash2 className="h-3.5 w-3.5 mr-2" /> Apagar
            </Button>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr_320px] gap-8 items-start">
        {/* Coluna esquerda — proposta + venda */}
        <div className="space-y-8 min-w-0">
          {/* Cliente card */}
          <section className="bg-white border border-western-stone-warm/15 p-5">
            <p className="text-eyebrow mb-3">Cliente</p>
            <div className="grid sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
              <Field label="Nome" value={lead.nome} />
              <Field label="Empresa" value={lead.empresa} />
              <Field label="E-mail" value={lead.email} />
              <Field label="Telefone" value={lead.telefone} />
              <Field label="Cidade" value={lead.cidade} />
              <Field label="Origem" value={lead.origem} />
            </div>
            {lead.mensagem && (
              <div className="mt-4 pt-4 border-t border-western-stone-warm/15">
                <p className="text-eyebrow mb-2">Mensagem do cliente</p>
                <p className="text-western-green-deep whitespace-pre-wrap text-sm">
                  {lead.mensagem}
                </p>
              </div>
            )}
          </section>

          {/* Editor da proposta */}
          <section className="bg-white border border-western-stone-warm/15 p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-eyebrow">Proposta editável</p>
                <h2 className="font-display text-xl text-western-green-deep mt-1">
                  Edite, aplique desconto e envie
                </h2>
              </div>
            </div>

            {/* Itens */}
            <div className="space-y-2 mb-4">
              {items.length === 0 && (
                <div className="border border-dashed border-western-stone-warm/30 p-6 text-center text-sm text-western-stone-warm">
                  Sem itens. Use “+ Incluir item” abaixo para adicionar.
                </div>
              )}
              {items.map((it) => (
                <div
                  key={it._key}
                  className="grid grid-cols-[1fr_auto_auto_auto] gap-3 items-center border border-western-stone-warm/15 p-3"
                >
                  <div className="min-w-0">
                    <p className="font-display text-western-green-deep truncate">{it.title}</p>
                    <p className="text-xs text-western-stone-warm font-mono uppercase tracking-wider">
                      {it.options?.map((o) => o.value).join(" · ") || it.variantTitle || "—"}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() =>
                        updateItem(it._key, { quantity: Math.max(1, it.quantity - 1) })
                      }
                      className="h-8 w-8 border border-western-stone-warm/30 hover:border-western-gold flex items-center justify-center"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="w-10 text-center font-mono text-sm">{it.quantity}</span>
                    <button
                      onClick={() => updateItem(it._key, { quantity: it.quantity + 1 })}
                      className="h-8 w-8 border border-western-stone-warm/30 hover:border-western-gold flex items-center justify-center"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>
                  <Input
                    type="number"
                    step="0.01"
                    value={it.unitPrice}
                    onChange={(e) =>
                      updateItem(it._key, { unitPrice: Number(e.target.value) || 0 })
                    }
                    className="h-8 w-28 rounded-none text-right font-mono text-sm"
                  />
                  <button
                    onClick={() => removeItem(it._key)}
                    className="text-western-stone-warm hover:text-red-700"
                    title="Remover"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* Mini-form: incluir item livre */}
            <div className="border border-western-stone-warm/15 bg-western-cream/40 p-3 mb-5">
              <p className="text-eyebrow mb-2">Incluir item</p>
              <div className="grid grid-cols-[1fr_80px_120px_auto] gap-2 items-end">
                <Input
                  value={newItemTitle}
                  onChange={(e) => setNewItemTitle(e.target.value)}
                  placeholder="Nome do item"
                  className="h-9 rounded-none"
                />
                <Input
                  type="number" min={1} value={newItemQty}
                  onChange={(e) => setNewItemQty(e.target.value)}
                  placeholder="Qtd"
                  className="h-9 rounded-none text-right font-mono"
                />
                <Input
                  type="number" step="0.01" min={0} value={newItemPrice}
                  onChange={(e) => setNewItemPrice(e.target.value)}
                  placeholder="Preço unit."
                  className="h-9 rounded-none text-right font-mono"
                />
                <Button
                  variant="outline"
                  onClick={addItem}
                  className="rounded-none border-western-stone-warm/30 font-mono text-[11px] uppercase tracking-[0.18em] h-9"
                >
                  <Plus className="h-3.5 w-3.5 mr-1" /> Incluir item
                </Button>
              </div>
            </div>


            {/* Condições */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
              <div>
                <Label className="text-eyebrow mb-1 block">Desconto (%)</Label>
                <Input
                  type="number" min={0} max={100} value={discountPct}
                  onChange={(e) => setDiscountPct(Math.max(0, Math.min(100, Number(e.target.value) || 0)))}
                  className="h-10 rounded-none"
                />
              </div>
              <div>
                <Label className="text-eyebrow mb-1 block">Forma de pagamento</Label>
                <Select value={formaPagamento} onValueChange={setFormaPagamento}>
                  <SelectTrigger className="h-10 rounded-none"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {FORMAS_PAGAMENTO.map((f) => <SelectItem key={f} value={f}>{f}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-eyebrow mb-1 block">Parcelas</Label>
                <Input
                  type="number" min={1} max={24} value={parcelas}
                  onChange={(e) => setParcelas(Math.max(1, Math.min(24, Number(e.target.value) || 1)))}
                  className="h-10 rounded-none"
                />
              </div>
              <div>
                <Label className="text-eyebrow mb-1 block">Parcelamento</Label>
                <Select
                  value={jurosLabel}
                  onValueChange={(v) => setJurosLabel(v as typeof jurosLabel)}
                >
                  <SelectTrigger className="h-10 rounded-none"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="nao_informar">Não informar</SelectItem>
                    <SelectItem value="sem_juros">Sem juros</SelectItem>
                    <SelectItem value="com_juros">Com juros</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-eyebrow mb-1 block">Validade (dias)</Label>
                <Input
                  type="number" min={1} value={validadeDias}
                  onChange={(e) => setValidadeDias(Math.max(1, Number(e.target.value) || 15))}
                  className="h-10 rounded-none"
                />
              </div>
            </div>

            <div className="mb-3">
              <Label className="text-eyebrow mb-1 block">Observações (vão no PDF)</Label>
              <Textarea
                value={observacoes} onChange={(e) => setObservacoes(e.target.value)}
                rows={2} className="rounded-none"
                placeholder="Ex.: Frete por conta da Western até Cajamar/SP."
              />
            </div>

            <p className="text-[11px] font-mono text-western-stone-warm/80 mb-5">
              ⓘ O PDF já inclui automaticamente: produção em {BUSINESS.prazoProducaoLabel} · garantia de {BUSINESS.garantiaLabel}.
            </p>


            {/* Totais */}
            <div className="border-t border-western-stone-warm/15 pt-4 mb-5">
              <div className="grid grid-cols-2 gap-y-1 max-w-sm ml-auto text-sm">
                <span className="text-western-stone-warm">Subtotal</span>
                <span className="text-right font-mono">{formatBRL(subtotal, "BRL")}</span>
                {discountValue > 0 && (
                  <>
                    <span className="text-western-stone-warm">Desconto ({discountPct}%)</span>
                    <span className="text-right font-mono text-western-gold">
                      − {formatBRL(discountValue, "BRL")}
                    </span>
                  </>
                )}
                <span className="text-eyebrow pt-2 border-t border-western-stone-warm/15 mt-2">Total</span>
                <span className="text-right font-display text-2xl text-western-green-deep pt-2 border-t border-western-stone-warm/15 mt-2">
                  {formatBRL(total, "BRL")}
                </span>
                {parcelas > 1 && (
                  <>
                    <span />
                    <span className="text-right text-xs text-western-stone-warm font-mono">
                      ou {parcelas}× de {formatBRL(total / parcelas, "BRL")}
                    </span>
                  </>
                )}
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                onClick={() => handleGeneratePdf(false)}
                disabled={sendingProposal}
                className="rounded-none bg-western-green-deep hover:bg-western-green-mid text-western-cream font-mono text-[11px] uppercase tracking-[0.22em] h-11"
              >
                {sendingProposal ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Send className="h-4 w-4 mr-2" />}
                Salvar e gerar PDF
              </Button>
              <Button
                variant="outline"
                onClick={() => handleGeneratePdf(true)}
                disabled={sendingProposal}
                className="rounded-none border-western-stone-warm/30 font-mono text-[11px] uppercase tracking-[0.22em] h-11"
              >
                <Download className="h-4 w-4 mr-2" /> Apenas baixar
              </Button>
            </div>
          </section>

          {/* Histórico de propostas */}
          {proposals.length > 0 && (
            <section className="bg-white border border-western-stone-warm/15 p-5">
              <p className="text-eyebrow mb-4">Propostas enviadas</p>
              <ul className="space-y-2">
                {proposals.map((p) => (
                  <li
                    key={p.id}
                    className="border border-western-stone-warm/15 p-3 flex flex-wrap items-center gap-3 justify-between"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <FileText className="h-4 w-4 text-western-gold flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="font-display text-western-green-deep">
                          Nº {p.numero} ·{" "}
                          <span className="font-mono text-sm">{formatBRL(Number(p.total), "BRL")}</span>
                          {Number(p.discount_pct) > 0 && (
                            <span className="text-xs text-western-gold ml-2">
                              −{p.discount_pct}%
                            </span>
                          )}
                        </p>
                        <p className="text-xs text-western-stone-warm font-mono">
                          {new Date(p.created_at).toLocaleString("pt-BR")}
                          {p.parcelas && p.parcelas > 1 && ` · ${p.parcelas}×`}
                          {p.forma_pagamento && ` · ${p.forma_pagamento}`}
                        </p>
                      </div>
                    </div>
                    {p.pdf_path && (
                      <div className="flex gap-1 flex-shrink-0">
                        <button
                          onClick={() => openProposalPdf(p.pdf_path!)}
                          className="h-9 w-9 border border-western-stone-warm/30 hover:border-western-gold flex items-center justify-center"
                          title="Abrir PDF"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => shareProposal(p, "whatsapp")}
                          className="h-9 w-9 border border-western-stone-warm/30 hover:border-western-gold flex items-center justify-center"
                          title="Enviar por WhatsApp"
                        >
                          <MessageCircle className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => shareProposal(p, "email")}
                          className="h-9 w-9 border border-western-stone-warm/30 hover:border-western-gold flex items-center justify-center"
                          title="Enviar por e-mail"
                        >
                          <Mail className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Fechar venda */}
          <section className="bg-emerald-50/40 border border-emerald-600/20 p-5">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle2 className="h-4 w-4 text-emerald-700" />
              <p className="text-eyebrow text-emerald-800">Fechar venda</p>
            </div>
            <p className="text-sm text-western-stone-warm mb-4">
              Marca este orçamento como pago e registra como a venda foi fechada.
            </p>
            <div className="grid sm:grid-cols-3 gap-3 mb-3">
              <div>
                <Label className="text-eyebrow mb-1 block">Forma de pagamento</Label>
                <Select value={saleForma} onValueChange={setSaleForma}>
                  <SelectTrigger className="h-10 rounded-none bg-white"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {FORMAS_PAGAMENTO.map((f) => <SelectItem key={f} value={f}>{f}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-eyebrow mb-1 block">Parcelas</Label>
                <Input
                  type="number" min={1} value={saleParcelas}
                  onChange={(e) => setSaleParcelas(Math.max(1, Number(e.target.value) || 1))}
                  className="h-10 rounded-none bg-white"
                />
              </div>
              <div>
                <Label className="text-eyebrow mb-1 block">Valor final (R$)</Label>
                <Input
                  type="number" step="0.01" value={saleValor}
                  onChange={(e) => setSaleValor(e.target.value)}
                  placeholder={String(total)}
                  className="h-10 rounded-none bg-white"
                />
              </div>
            </div>
            <Textarea
              value={saleObs} onChange={(e) => setSaleObs(e.target.value)}
              rows={2} className="rounded-none bg-white mb-3"
              placeholder="Observações da venda (opcional)"
            />
            <Button
              onClick={handleCloseSale}
              disabled={closingSale}
              className="rounded-none bg-emerald-700 hover:bg-emerald-800 text-white font-mono text-[11px] uppercase tracking-[0.22em] h-11 disabled:opacity-60"
            >
              {closingSale ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <CheckCircle2 className="h-4 w-4 mr-2" />}
              {jaVendida ? "Venda já fechada — regravar" : "Marcar como vendido"}
            </Button>
            {thread.pago_em && (
              <p className="text-xs text-emerald-800 font-mono mt-3">
                ✓ Vendido em {new Date(thread.pago_em).toLocaleString("pt-BR")}
                {thread.valor_final && ` · ${formatBRL(Number(thread.valor_final), "BRL")}`}
                {thread.forma_pagamento && ` · ${thread.forma_pagamento}`}
                {thread.parcelas && thread.parcelas > 1 && ` · ${thread.parcelas}×`}
              </p>
            )}
          </section>
        </div>

        {/* Coluna direita — status + notas */}
        <aside className="space-y-6 lg:sticky lg:top-6">
          <section className="bg-white border border-western-stone-warm/15 p-5">
            <p className="text-eyebrow mb-3">Status</p>
            <span
              className={`inline-flex px-2 py-1 border font-mono text-[10px] uppercase tracking-[0.18em] mb-4 ${QUOTE_STATUS_CLS[thread.status]}`}
            >
              {QUOTE_STATUS_LABEL[thread.status]}
            </span>
            <Select value={statusLocal} onValueChange={(v) => setStatusLocal(v as QuoteStatus)}>
              <SelectTrigger className="h-10 rounded-none"><SelectValue /></SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((s) => (
                  <SelectItem key={s} value={s}>{QUOTE_STATUS_LABEL[s]}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Label className="text-eyebrow mt-5 mb-1 block">Notas internas</Label>
            <Textarea
              value={notas} onChange={(e) => setNotas(e.target.value)}
              rows={5} className="rounded-none"
              placeholder="Ligações, contexto, próximos passos…"
            />
            <Button
              onClick={handleSaveNotes} disabled={savingThread}
              className="w-full mt-3 rounded-none bg-western-green-deep hover:bg-western-green-mid text-western-cream font-mono text-[11px] uppercase tracking-[0.22em] h-10"
            >
              {savingThread ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
              Salvar
            </Button>
          </section>

          {/* Pedido original */}
          <section className="bg-white border border-western-stone-warm/15 p-5">
            <p className="text-eyebrow mb-3">Pedido original</p>
            <p className="text-sm text-western-green-deep mb-2">
              {payload?.items?.length ?? 0} {payload?.items?.length === 1 ? "item" : "itens"}
            </p>
            <p className="font-mono text-sm text-western-green-deep mb-3">
              {payload?.subtotal
                ? formatBRL(payload.subtotal, payload.currency || "BRL")
                : "—"}
            </p>
            <ul className="space-y-1 text-xs text-western-stone-warm">
              {payload?.items?.map((i, idx) => (
                <li key={idx} className="flex justify-between gap-2">
                  <span className="truncate">
                    {i.quantity}× {i.title}
                  </span>
                  <span className="font-mono flex-shrink-0">
                    {formatBRL(i.unitPrice * i.quantity, "BRL")}
                  </span>
                </li>
              ))}
            </ul>
            <p className="text-[10px] font-mono text-western-stone-warm/60 mt-3 pt-3 border-t border-western-stone-warm/15">
              Pedido mínimo {BUSINESS.pedidoMinimoLabel}
            </p>
          </section>
        </aside>
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string | null }) {
  return (
    <div>
      <p className="text-[10px] font-mono uppercase tracking-[0.18em] text-western-stone-warm">
        {label}
      </p>
      <p className="text-western-green-deep">{value || "—"}</p>
    </div>
  );
}
