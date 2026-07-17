import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import {
  Archive, CheckCircle2, Download, ExternalLink, FileText, Info, Loader2, Mail,
  MessageCircle, Minus, MoreVertical, Plus, RotateCcw, Save, Send, Trash2, X,
  type LucideIcon,
} from "lucide-react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  EstadoCarregando, EstadoErro, EstadoVazio,
  StatusBadge, PageHeader, CelulaData, dataAbsoluta, rotuloStatus,
} from "@/components/backoffice";
import { formatBRL, parseBRL } from "@/lib/catalog/client";
import { type Lead } from "@/components/admin/adminUtils";
import {
  QUOTE_STATUS_LABEL,
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

const INPUT_CLS =
  "h-control rounded-sm border-western-border-strong bg-white text-[16px] text-western-green-deep";

interface EditableItem extends QuotePayloadItem {
  /** key local pra render */
  _key: string;
  /** acabamento/cor editável pelo admin (sobrescreve options no PDF) */
  acabamento?: string;
}

/**
 * O "próximo passo" que o card de ação mostra. `cta` é a ÚNICA ação primária
 * (verde) da tela — tudo o mais na página é secundário (outline), de propósito.
 */
interface Passo {
  titulo: string;
  descricao: string;
  cta: {
    label: string;
    onClick: () => void;
    carregando: boolean;
    Icone: LucideIcon;
  } | null;
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

  /* Os 4 estados. `erro` é fatal (a tela não pode mentir "não encontrado" num 403);
   * `erroPropostas` é parcial — só derruba o bloco de histórico. */
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<unknown>(null);
  const [erroPropostas, setErroPropostas] = useState<unknown>(null);

  const [savingThread, setSavingThread] = useState(false);
  const [sendingProposal, setSendingProposal] = useState(false);
  const [closingSale, setClosingSale] = useState(false);
  const [reopening, setReopening] = useState(false);

  // Editor de proposta
  const [items, setItems] = useState<EditableItem[]>([]);
  const [discountPct, setDiscountPct] = useState(0);
  const [formaPagamento, setFormaPagamento] = useState("PIX");
  const [parcelas, setParcelas] = useState(1);
  const [validadeDias, setValidadeDias] = useState(15);
  const [observacoes, setObservacoes] = useState("");
  const [jurosLabel, setJurosLabel] = useState<"nao_informar" | "sem_juros" | "com_juros">("nao_informar");

  // Mini-form "incluir peça"
  const [newItemTitle, setNewItemTitle] = useState("");
  const [newItemAcabamento, setNewItemAcabamento] = useState("");
  const [newItemQty, setNewItemQty] = useState<string>("1");
  const [newItemPrice, setNewItemPrice] = useState<number>(0);

  // Fechar venda
  const [saleForma, setSaleForma] = useState("PIX");
  const [saleParcelas, setSaleParcelas] = useState(1);
  const [saleValor, setSaleValor] = useState<number | null>(null);
  const [saleObs, setSaleObs] = useState("");

  // Notas internas
  const [notas, setNotas] = useState("");
  const [statusLocal, setStatusLocal] = useState<QuoteStatus>("novo");

  // Confirmações
  const [confirmarArquivo, setConfirmarArquivo] = useState(false);
  const [confirmarRegravar, setConfirmarRegravar] = useState(false);
  const [confirmarExclusao, setConfirmarExclusao] = useState(false);

  /* ─────────────────────────── CARGA ─────────────────────────── */

  const load = useCallback(async () => {
    if (!leadId) return;
    setCarregando(true);
    setErro(null);
    setErroPropostas(null);

    const [leadRes, threadRes, propRes] = await Promise.all([
      supabase.from("leads").select("*").eq("id", leadId).maybeSingle(),
      supabase.from("quote_threads").select("*").eq("lead_id", leadId).maybeSingle(),
      supabase.from("quote_proposals").select("*").eq("lead_id", leadId).order("created_at", { ascending: false }),
    ]);

    // ANTES: os erros eram engolidos e um 403 aparecia como "Orçamento não encontrado".
    const falha = leadRes.error ?? threadRes.error;
    if (falha) {
      console.error(falha);
      setErro(falha);
      setCarregando(false);
      return;
    }

    const l = leadRes.data as Lead | null;
    let t = threadRes.data as QuoteThread | null;

    if (l && !t) {
      // Garantia caso o trigger não tenha rodado (lead antigo).
      const { data: criada, error: erroInsert } = await supabase
        .from("quote_threads")
        .insert({ lead_id: l.id })
        .select()
        .single();
      if (erroInsert) {
        console.error(erroInsert);
        setErro(erroInsert);
        setCarregando(false);
        return;
      }
      t = criada as QuoteThread;
    }

    if (propRes.error) {
      console.error(propRes.error);
      setErroPropostas(propRes.error);
      setProposals([]);
    } else {
      setProposals((propRes.data as unknown as QuoteProposal[]) ?? []);
    }

    setLead(l);
    setThread(t);

    if (t) {
      setStatusLocal(t.status);
      setNotas(t.notas ?? "");
      setSaleForma(t.forma_pagamento || "PIX");
      setSaleParcelas(t.parcelas || 1);
      setSaleValor(t.valor_final != null ? Number(t.valor_final) : null);
      setSaleObs(t.observacoes_venda ?? "");
    }

    // Inicializa o editor com os itens originais (ou a última proposta, se houver).
    const seed = propRes.error ? undefined : (propRes.data as unknown as QuoteProposal[] | null)?.[0];
    const rawSourceItems: QuotePayloadItem[] = seed
      ? seed.items
      : ((l?.payload as unknown as QuotePayload)?.items ?? []);

    // Marker de juros (sentinel embutido em items) — extrai e filtra.
    const jurosSentinel = rawSourceItems.find((i) => i.handle === "__meta_juros__");
    const restoredJuros =
      (jurosSentinel?.title as "nao_informar" | "sem_juros" | "com_juros" | undefined) ?? "nao_informar";
    const sourceItems = rawSourceItems.filter((i) => !i.handle?.startsWith("__meta_"));

    setItems(
      sourceItems.map((it, idx) => ({
        ...it,
        _key: `${it.handle}-${idx}-${Math.random()}`,
        acabamento:
          (it as EditableItem).acabamento ||
          it.options?.map((o) => o.value).join(" · ") ||
          it.variantTitle ||
          "",
      })),
    );
    setJurosLabel(restoredJuros);
    if (seed) {
      setDiscountPct(Number(seed.discount_pct));
      setFormaPagamento(seed.forma_pagamento || "PIX");
      setParcelas(seed.parcelas || 1);
      setValidadeDias(seed.validade_dias || 15);
      setObservacoes(seed.observacoes ?? "");
    }
    setCarregando(false);
  }, [leadId]);

  useEffect(() => { load(); }, [load]);

  /* ─────────────────────────── DERIVADOS ─────────────────────────── */

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
  const jaVendida = !!(thread?.pago_em && thread?.valor_final);

  const telefoneDigitos = (lead?.telefone || "").replace(/\D/g, "");
  const linkWhatsApp = telefoneDigitos
    ? `https://wa.me/${telefoneDigitos.startsWith("55") ? telefoneDigitos : `55${telefoneDigitos}`}`
    : null;

  const timeline = useMemo(() => {
    const eventos: { rotulo: string; data: string }[] = [];
    if (lead) eventos.push({ rotulo: "Orçamento recebido", data: lead.created_at });
    proposals.forEach((p) =>
      eventos.push({ rotulo: `Proposta Nº ${p.numero} gerada`, data: p.sent_at ?? p.created_at }),
    );
    if (thread?.pago_em) eventos.push({ rotulo: "Venda fechada", data: thread.pago_em });
    if (thread?.archived_at) eventos.push({ rotulo: "Arquivado", data: thread.archived_at });
    return eventos.sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime());
  }, [lead, proposals, thread]);

  /* ─────────────────────────── AÇÕES ─────────────────────────── */

  /** Devolve `true` só quando gravou de verdade — quem chama NÃO pode cantar vitória sozinho. */
  const updateThread = async (patch: Partial<QuoteThread>): Promise<boolean> => {
    if (!thread) return false;
    setSavingThread(true);
    const { error } = await supabase.from("quote_threads").update(patch).eq("id", thread.id);
    setSavingThread(false);
    if (error) {
      console.error(error);
      toast.error(error.message);
      return false;
    }
    setThread({ ...thread, ...patch });
    return true;
  };

  const handleSaveNotes = async () => {
    if (savingThread) return;
    // Antes: dava "Atualizações salvas." mesmo quando o update falhava.
    const ok = await updateThread({ status: statusLocal, notas });
    if (ok) toast.success("Atualizações salvas.");
  };

  const handleArchive = async () => {
    setConfirmarArquivo(false);
    const ok = await updateThread({ status: "arquivado", archived_at: new Date().toISOString() });
    if (!ok) return;
    setStatusLocal("arquivado");
    toast.success("Orçamento arquivado.");
  };

  const handleReopen = async () => {
    if (reopening) return;
    setReopening(true);
    try {
      const ok = await updateThread({ status: "em_atendimento", archived_at: null });
      if (!ok) return;
      setStatusLocal("em_atendimento");
      toast.success("Atendimento reaberto.");
    } finally {
      setReopening(false);
    }
  };

  const handleDelete = async () => {
    if (!lead) return;
    const { error } = await supabase.from("leads").delete().eq("id", lead.id);
    if (error) {
      console.error(error);
      return toast.error(error.message);
    }
    toast.success("Orçamento apagado.");
    navigate("/admin/orcamentos");
  };

  const gravarVenda = async () => {
    if (!thread || !lead) return;
    if (closingSale) return;

    const valorNum = saleValor != null && Number.isFinite(saleValor) ? saleValor : total;
    if (!Number.isFinite(valorNum) || valorNum <= 0) {
      return toast.error("Valor final da venda precisa ser maior que zero.");
    }
    if (!Number.isInteger(saleParcelas) || saleParcelas < 1) {
      return toast.error("Número de parcelas inválido.");
    }

    const eraVendida = jaVendida;

    setClosingSale(true);
    try {
      const ok = await updateThread({
        status: "fechado",
        pago_em: new Date().toISOString(),
        forma_pagamento: saleForma,
        parcelas: saleParcelas,
        valor_final: valorNum,
        observacoes_venda: saleObs || null,
      });
      // Antes: mesmo com o update falhando, a tela dizia "Venda registrada".
      if (!ok) return;

      // Só promove se ainda não tinha sido promovida.
      if (!eraVendida) {
        const { error: promoteErr } = await supabase.rpc("promote_quote_lead_to_order", {
          _lead_id: lead.id,
          _order_id: null,
        });
        if (promoteErr) {
          console.warn("promote_quote_lead_to_order falhou", promoteErr);
          toast.warning("Venda registrada, mas não consegui abrir o pedido automaticamente.");
          setStatusLocal("fechado");
          return;
        }
      }
      setStatusLocal("fechado");
      toast.success("Venda registrada.");
    } finally {
      setClosingSale(false);
    }
  };

  /** Idempotência: regravar uma venda já fechada exige confirmação explícita. */
  const handleCloseSale = () => {
    if (jaVendida) {
      setConfirmarRegravar(true);
      return;
    }
    void gravarVenda();
  };

  /* ── Proposta ── */

  const updateItem = (key: string, patch: Partial<EditableItem>) =>
    setItems((prev) => prev.map((i) => (i._key === key ? { ...i, ...patch } : i)));
  const removeItem = (key: string) =>
    setItems((prev) => prev.filter((i) => i._key !== key));

  const addItem = () => {
    const title = newItemTitle.trim();
    const qty = Number(newItemQty);
    const price = Number.isFinite(newItemPrice) ? newItemPrice : 0;
    if (!title) return toast.error("Informe o nome da peça.");
    if (!Number.isInteger(qty) || qty < 1) return toast.error("Quantidade deve ser um inteiro ≥ 1.");
    if (!Number.isFinite(price) || price < 0) return toast.error("Preço deve ser ≥ 0.");
    const key = "manual-" + crypto.randomUUID();
    setItems((prev) => [
      ...prev,
      {
        handle: key, title,
        unitPrice: price, quantity: qty,
        options: [],
        acabamento: newItemAcabamento.trim() || undefined,
        _key: key,
      },
    ]);
    setNewItemTitle("");
    setNewItemAcabamento("");
    setNewItemQty("1");
    setNewItemPrice(0);
  };

  const handleGeneratePdf = async (apenasBaixar: boolean) => {
    if (!lead) return;
    if (sendingProposal) return;
    if (items.length === 0) return toast.error("Adicione peças à proposta.");
    if (total <= 0) {
      return toast.error("Total da proposta é R$ 0 — revise as peças e o desconto antes de gerar.");
    }

    setSendingProposal(true);
    try {
      // Numeração sequencial por lead, contando no banco (count exato).
      const baseNumero = payload?.numero ?? lead.id.slice(0, 5).toUpperCase();
      let seq = proposals.length + 1;
      if (!apenasBaixar) {
        const { count, error: erroCount } = await supabase
          .from("quote_proposals")
          .select("id", { count: "exact", head: true })
          .eq("lead_id", lead.id);
        if (erroCount) console.warn("Contagem de propostas falhou; usando sequência local", erroCount);
        else if (typeof count === "number") seq = count + 1;
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
          acabamento:
            i.acabamento && i.acabamento.trim()
              ? i.acabamento.trim()
              : i.options?.map((o) => o.value).join(" · ") || i.variantTitle || undefined,
          quantity: i.quantity,
          unitPrice: i.unitPrice,
          productImage: i.image,
        })),
        subtotal, discountPct, discountValue, total,
        formaPagamento, parcelas, validadeDias, observacoes,
        jurosLabel,
      };

      if (apenasBaixar) {
        await downloadPropostaPdf(opts);
        return;
      }

      // Salva a proposta + sobe o PDF.
      const blob = await propostaPdfBlob(opts);
      const path = `propostas/${lead.id}/${propNumero}.pdf`;
      const { error: upErr } = await supabase.storage
        .from("orcamentos")
        .upload(path, blob, { contentType: "application/pdf", upsert: true });
      if (upErr) throw upErr;

      // Persiste jurosLabel como sentinel dentro de items (sem criar coluna).
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
      setErroPropostas(null);
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
    const { data, error } = await supabase.storage
      .from("orcamentos")
      .createSignedUrl(p.pdf_path, 60 * 60 * 24 * 7);
    if (error || !data) return toast.error("Falha ao gerar o link do PDF.");
    window.open(buildShareLink(channel, data.signedUrl, p.numero), "_blank", "noopener,noreferrer");
  };

  /* ─────────────────────────── OS 4 ESTADOS ─────────────────────────── */

  if (carregando) {
    return (
      <div>
        <PageHeader voltar={{ to: "/admin/orcamentos", label: "Orçamentos" }} titulo="Carregando…" />
        <EstadoCarregando linhas={6} />
      </div>
    );
  }

  // ERRO ≠ "não encontrado". Um 403 nunca mais vai se disfarçar de orçamento inexistente.
  if (erro) {
    return (
      <div>
        <PageHeader voltar={{ to: "/admin/orcamentos", label: "Orçamentos" }} titulo="Orçamento" />
        <EstadoErro erro={erro} onRetry={load} />
      </div>
    );
  }

  if (!lead || !thread) {
    return (
      <div>
        <PageHeader voltar={{ to: "/admin/orcamentos", label: "Orçamentos" }} titulo="Orçamento" />
        <EstadoVazio
          titulo="Orçamento não encontrado"
          mensagem="Ele pode ter sido apagado. Volte para a lista e confira."
          acao={
            <Link to="/admin/orcamentos" className="btn-primary tap-target">
              Voltar para orçamentos
            </Link>
          }
        />
      </div>
    );
  }

  /* ── O PRÓXIMO PASSO: o card de ação decide, o resto da tela obedece. ── */
  const passo: Passo = (() => {
    if (jaVendida || thread.status === "fechado") {
      return {
        titulo: "Venda fechada",
        descricao: thread.pago_em
          ? `Registrada em ${dataAbsoluta(thread.pago_em)}.`
          : "Este orçamento já está marcado como fechado.",
        cta: null,
      };
    }
    if (thread.status === "perdido" || thread.status === "arquivado") {
      return {
        titulo: thread.status === "perdido" ? "Marcado como perdido" : "Arquivado",
        descricao: "Se o cliente voltou a responder, reabra o atendimento e retome a proposta.",
        cta: {
          label: "Reabrir atendimento",
          onClick: handleReopen,
          carregando: reopening || savingThread,
          Icone: RotateCcw,
        },
      };
    }
    if (thread.status === "proposta_enviada") {
      return {
        titulo: "Proposta enviada — falta a resposta",
        descricao: "Cobre um retorno pelo WhatsApp. Quando o cliente pagar, registre a venda.",
        cta: {
          label: "Marcar como vendido",
          onClick: handleCloseSale,
          carregando: closingSale,
          Icone: CheckCircle2,
        },
      };
    }
    return {
      titulo: "Monte a proposta",
      descricao:
        "Revise as peças, o preço e o desconto ao lado. Depois gere o PDF e mande para o cliente.",
      cta: {
        label: "Salvar e gerar proposta",
        onClick: () => handleGeneratePdf(false),
        carregando: sendingProposal,
        Icone: Send,
      },
    };
  })();

  const cta = passo.cta;
  const CtaIcone = cta?.Icone ?? Send;
  const ultimaProposta = proposals[0];

  return (
    <div>
      <PageHeader
        voltar={{ to: "/admin/orcamentos", label: "Orçamentos" }}
        eyebrow={`Orçamento Nº ${numero}`}
        titulo={lead.nome || lead.empresa || lead.email || "(sem nome)"}
        subtitulo={`Recebido em ${dataAbsoluta(lead.created_at)}`}
        acoesSecundarias={
          <>
            <button
              type="button"
              onClick={() => setConfirmarArquivo(true)}
              disabled={savingThread || thread.status === "arquivado"}
              className="btn-outline-forest tap-target px-4"
            >
              <Archive className="h-4 w-4" aria-hidden="true" />
              Arquivar
            </button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  aria-label="Mais ações"
                  className="tap-target inline-flex items-center justify-center rounded-lg border border-western-border-strong text-western-stone-warm transition-colors hover:text-western-green-deep"
                >
                  <MoreVertical className="h-4 w-4" aria-hidden="true" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="rounded-lg">
                <DropdownMenuItem
                  onClick={() => setConfirmarExclusao(true)}
                  className="text-[16px] font-semibold text-status-error focus:bg-status-error/10 focus:text-status-error"
                >
                  <Trash2 className="mr-2 h-4 w-4" aria-hidden="true" />
                  Apagar orçamento
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        }
      />

      <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
        {/* ══════════ COLUNA DIREITA (no mobile vem primeiro): CARD DE AÇÃO ══════════ */}
        <aside className="order-1 space-y-6 lg:order-2 lg:sticky lg:top-6">
          <section className="rounded-2xl border border-western-cta/30 bg-white p-5 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
            <div className="mb-4 flex items-center justify-between gap-3">
              <p className="text-eyebrow">Próximo passo</p>
              <StatusBadge status={thread.status} />
            </div>

            <h2 className="display-md text-western-green-deep">{passo.titulo}</h2>
            <p className="text-body mt-2 text-[16px]">{passo.descricao}</p>

            {/* O número que importa ao lado do botão */}
            <div className="mt-5 rounded-lg bg-western-paper px-4 py-3">
              <div className="flex items-baseline justify-between gap-3">
                <span className="text-sublabel">
                  {jaVendida ? "Valor da venda" : "Total da proposta"}
                </span>
                <span className="text-[22px] font-bold tabular-nums text-western-green-deep">
                  {jaVendida && thread.valor_final != null
                    ? formatBRL(Number(thread.valor_final), "BRL")
                    : formatBRL(total, "BRL")}
                </span>
              </div>
              {!jaVendida && discountPct > 0 && (
                <p className="text-meta mt-1 text-right tabular-nums">
                  já com {discountPct}% de desconto
                </p>
              )}
              {jaVendida && thread.forma_pagamento && (
                <p className="text-meta mt-1 text-right">
                  {thread.forma_pagamento}
                  {thread.parcelas && thread.parcelas > 1 ? ` · ${thread.parcelas}×` : ""}
                </p>
              )}
            </div>

            {/* A ÚNICA ação primária da tela. Verde. */}
            {cta && (
              <button
                type="button"
                onClick={cta.onClick}
                disabled={cta.carregando}
                className="btn-primary mt-5 w-full"
              >
                {cta.carregando ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                ) : (
                  <CtaIcone className="h-4 w-4" aria-hidden="true" />
                )}
                {cta.label}
              </button>
            )}

            {/* Contatos */}
            {(linkWhatsApp || lead.email) && (
              <div className="mt-5 border-t border-western-border-soft pt-5">
                <p className="text-eyebrow mb-3">Falar com o cliente</p>
                <div className="flex flex-col gap-2">
                  {linkWhatsApp && (
                    <a
                      href={linkWhatsApp}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-outline-forest tap-target w-full justify-start px-4"
                    >
                      <MessageCircle className="h-4 w-4" aria-hidden="true" />
                      <span className="tabular-nums">{lead.telefone}</span>
                    </a>
                  )}
                  {lead.email && (
                    <a
                      href={`mailto:${lead.email}`}
                      className="btn-outline-forest tap-target w-full justify-start px-4"
                    >
                      <Mail className="h-4 w-4" aria-hidden="true" />
                      <span className="truncate">{lead.email}</span>
                    </a>
                  )}
                </div>
                {ultimaProposta?.pdf_path && (
                  <div className="mt-2 flex gap-2">
                    <button
                      type="button"
                      onClick={() => shareProposal(ultimaProposta, "whatsapp")}
                      className="btn-outline-forest tap-target flex-1 px-3 text-[14px]"
                    >
                      <Send className="h-4 w-4" aria-hidden="true" />
                      Enviar Nº {ultimaProposta.numero}
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Linha do tempo */}
            <div className="mt-5 border-t border-western-border-soft pt-5">
              <p className="text-eyebrow mb-3">Linha do tempo</p>
              <ol className="space-y-3">
                {timeline.map((e, i) => (
                  <li key={`${e.rotulo}-${i}`} className="flex items-start gap-3">
                    <span
                      className={`mt-1.5 h-2 w-2 flex-shrink-0 rounded-full ${
                        i === timeline.length - 1 ? "bg-western-cta" : "bg-western-border-strong"
                      }`}
                      aria-hidden="true"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-[16px] text-western-green-deep">{e.rotulo}</p>
                      <CelulaData valor={e.data} className="text-meta" />
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </section>

          {/* Notas internas + status */}
          <section className="rounded-2xl border border-western-border-soft bg-white p-5">
            <p className="text-eyebrow mb-3">Acompanhamento</p>

            <Label htmlFor="status-orcamento" className="text-sublabel mb-1.5 block">
              Status
            </Label>
            <Select value={statusLocal} onValueChange={(v) => setStatusLocal(v as QuoteStatus)}>
              <SelectTrigger id="status-orcamento" className={INPUT_CLS}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((s) => (
                  <SelectItem key={s} value={s} className="text-[16px]">
                    {QUOTE_STATUS_LABEL[s]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Label htmlFor="notas-internas" className="text-sublabel mb-1.5 mt-5 block">
              Notas internas
            </Label>
            <Textarea
              id="notas-internas"
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              rows={5}
              className="rounded-sm border-western-border-strong bg-white text-[16px]"
              placeholder="Ligações, contexto, próximos passos…"
            />
            <button
              type="button"
              onClick={handleSaveNotes}
              disabled={savingThread}
              className="btn-outline-forest tap-target mt-3 w-full"
            >
              {savingThread ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              ) : (
                <Save className="h-4 w-4" aria-hidden="true" />
              )}
              Salvar status e notas
            </button>
          </section>
        </aside>

        {/* ══════════ COLUNA ESQUERDA: o trabalho ══════════ */}
        <div className="order-2 min-w-0 space-y-8 lg:order-1">
          {/* Cliente */}
          <section className="rounded-2xl border border-western-border-soft bg-white p-5">
            <p className="text-eyebrow mb-4">Cliente</p>
            <dl className="grid gap-x-8 gap-y-4 sm:grid-cols-2">
              <Campo rotulo="Nome" valor={lead.nome} />
              <Campo rotulo="Empresa" valor={lead.empresa} />
              <Campo rotulo="E-mail" valor={lead.email} />
              <Campo rotulo="Telefone" valor={lead.telefone} numerica />
              <Campo rotulo="Cidade" valor={lead.cidade} />
              <Campo rotulo="Origem" valor={lead.origem} />
            </dl>
            {lead.mensagem && (
              <div className="mt-5 rounded-lg bg-western-paper p-4">
                <p className="text-eyebrow mb-2">Mensagem do cliente</p>
                <p className="whitespace-pre-wrap text-[17px] leading-[1.6] text-western-green-deep">
                  {lead.mensagem}
                </p>
              </div>
            )}
          </section>

          {/* Editor da proposta */}
          <section className="rounded-2xl border border-western-border-soft bg-white p-5">
            <p className="text-eyebrow mb-1">Proposta</p>
            <h2 className="display-md text-western-green-deep mb-5">
              Edite as peças, aplique desconto e gere o PDF
            </h2>

            {/* Peças */}
            <div className="mb-5 space-y-3">
              {items.length === 0 && (
                <div className="rounded-lg border border-dashed border-western-border-strong bg-western-paper p-6 text-center">
                  <p className="text-body text-[16px]">
                    Nenhuma peça na proposta. Inclua abaixo.
                  </p>
                </div>
              )}

              {items.map((it) => (
                <div
                  key={it._key}
                  className="rounded-lg border border-western-border-soft p-3 md:grid md:grid-cols-[1fr_auto_150px_auto] md:items-center md:gap-3"
                >
                  <div className="min-w-0 space-y-2">
                    <p className="text-[17px] font-semibold text-western-green-deep">{it.title}</p>
                    <Input
                      value={it.acabamento ?? ""}
                      onChange={(e) => updateItem(it._key, { acabamento: e.target.value })}
                      placeholder="Acabamento / cor"
                      aria-label={`Acabamento de ${it.title}`}
                      className="h-tap rounded-sm border-western-border-strong text-[16px]"
                    />
                  </div>

                  <div className="mt-3 flex items-center justify-between gap-3 md:mt-0 md:justify-start">
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => updateItem(it._key, { quantity: Math.max(1, it.quantity - 1) })}
                        aria-label={`Diminuir quantidade de ${it.title}`}
                        className="tap-target inline-flex items-center justify-center rounded-sm border border-western-border-strong text-western-green-deep transition-colors hover:border-western-green-deep"
                      >
                        <Minus className="h-4 w-4" aria-hidden="true" />
                      </button>
                      <span className="w-12 text-center text-[17px] font-semibold tabular-nums text-western-green-deep">
                        {it.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateItem(it._key, { quantity: it.quantity + 1 })}
                        aria-label={`Aumentar quantidade de ${it.title}`}
                        className="tap-target inline-flex items-center justify-center rounded-sm border border-western-border-strong text-western-green-deep transition-colors hover:border-western-green-deep"
                      >
                        <Plus className="h-4 w-4" aria-hidden="true" />
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeItem(it._key)}
                      aria-label={`Remover ${it.title}`}
                      title="Remover"
                      className="tap-target inline-flex items-center justify-center rounded-sm text-western-stone-warm transition-colors hover:text-status-error md:order-last"
                    >
                      <X className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </div>

                  <div className="mt-3 md:mt-0">
                    <BRLInput
                      value={it.unitPrice}
                      onChange={(n) => updateItem(it._key, { unitPrice: n })}
                      className="h-tap w-full rounded-sm border-western-border-strong text-right text-[16px] tabular-nums"
                      placeholder="R$ 0,00"
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Incluir peça */}
            <div className="mb-6 rounded-lg border border-western-border-soft bg-western-paper p-4">
              <p className="text-eyebrow mb-3">Incluir peça</p>
              <div className="grid gap-3 md:grid-cols-[1fr_1fr_90px_150px_auto] md:items-end">
                <Input
                  value={newItemTitle}
                  onChange={(e) => setNewItemTitle(e.target.value)}
                  placeholder="Nome da peça"
                  aria-label="Nome da peça"
                  className="h-tap rounded-sm border-western-border-strong bg-white text-[16px]"
                />
                <Input
                  value={newItemAcabamento}
                  onChange={(e) => setNewItemAcabamento(e.target.value)}
                  placeholder="Acabamento (cor)"
                  aria-label="Acabamento da peça"
                  className="h-tap rounded-sm border-western-border-strong bg-white text-[16px]"
                />
                <Input
                  type="number"
                  min={1}
                  value={newItemQty}
                  onChange={(e) => setNewItemQty(e.target.value)}
                  placeholder="Qtd"
                  aria-label="Quantidade"
                  className="h-tap rounded-sm border-western-border-strong bg-white text-right text-[16px] tabular-nums"
                />
                <BRLInput
                  value={newItemPrice}
                  onChange={(n) => setNewItemPrice(n)}
                  placeholder="R$ 0,00"
                  className="h-tap rounded-sm border-western-border-strong bg-white text-right text-[16px] tabular-nums"
                />
                <button type="button" onClick={addItem} className="btn-outline-forest tap-target px-4">
                  <Plus className="h-4 w-4" aria-hidden="true" />
                  Incluir
                </button>
              </div>
            </div>

            {/* Condições */}
            <div className="mb-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <Label htmlFor="desconto" className="text-sublabel mb-1.5 block">Desconto (%)</Label>
                <Input
                  id="desconto"
                  type="number" min={0} max={100} value={discountPct}
                  onChange={(e) => setDiscountPct(Math.max(0, Math.min(100, Number(e.target.value) || 0)))}
                  className={`${INPUT_CLS} tabular-nums`}
                />
              </div>
              <div>
                <Label htmlFor="forma-pgto" className="text-sublabel mb-1.5 block">Forma de pagamento</Label>
                <Select value={formaPagamento} onValueChange={setFormaPagamento}>
                  <SelectTrigger id="forma-pgto" className={INPUT_CLS}><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {FORMAS_PAGAMENTO.map((f) => (
                      <SelectItem key={f} value={f} className="text-[16px]">{f}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="parcelas" className="text-sublabel mb-1.5 block">Parcelas</Label>
                <Input
                  id="parcelas"
                  type="number" min={1} max={24} value={parcelas}
                  onChange={(e) => setParcelas(Math.max(1, Math.min(24, Number(e.target.value) || 1)))}
                  className={`${INPUT_CLS} tabular-nums`}
                />
              </div>
              <div>
                <Label htmlFor="juros" className="text-sublabel mb-1.5 block">Parcelamento</Label>
                <Select value={jurosLabel} onValueChange={(v) => setJurosLabel(v as typeof jurosLabel)}>
                  <SelectTrigger id="juros" className={INPUT_CLS}><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="nao_informar" className="text-[16px]">Não informar</SelectItem>
                    <SelectItem value="sem_juros" className="text-[16px]">Sem juros</SelectItem>
                    <SelectItem value="com_juros" className="text-[16px]">Com juros</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="validade" className="text-sublabel mb-1.5 block">Validade (dias)</Label>
                <Input
                  id="validade"
                  type="number" min={1} value={validadeDias}
                  onChange={(e) => setValidadeDias(Math.max(1, Number(e.target.value) || 15))}
                  className={`${INPUT_CLS} tabular-nums`}
                />
              </div>
            </div>

            <div className="mb-4">
              <Label htmlFor="observacoes" className="text-sublabel mb-1.5 block">
                Observações (vão no PDF)
              </Label>
              <Textarea
                id="observacoes"
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                rows={2}
                className="rounded-sm border-western-border-strong bg-white text-[16px]"
                placeholder="Ex.: Frete por conta da Western até Cajamar/SP."
              />
            </div>

            <p className="text-meta mb-6 flex items-start gap-2">
              <Info className="mt-0.5 h-4 w-4 flex-shrink-0" aria-hidden="true" />
              O PDF já inclui automaticamente: produção em {BUSINESS.prazoProducaoLabel} · garantia de{" "}
              {BUSINESS.garantiaLabel}.
            </p>

            {/* Totais */}
            <div className="mb-5 border-t border-western-border-soft pt-5">
              <dl className="ml-auto grid max-w-sm grid-cols-2 gap-y-2">
                <dt className="text-[16px] text-western-stone-warm">Subtotal</dt>
                <dd className="text-right text-[16px] tabular-nums text-western-green-deep">
                  {formatBRL(subtotal, "BRL")}
                </dd>

                {discountValue > 0 && (
                  <>
                    <dt className="text-[16px] text-western-stone-warm tabular-nums">
                      Desconto ({discountPct}%)
                    </dt>
                    <dd className="text-right text-[16px] font-semibold tabular-nums text-western-bronze">
                      − {formatBRL(discountValue, "BRL")}
                    </dd>
                  </>
                )}

                <dt className="text-sublabel mt-2 border-t border-western-border-soft pt-3">Total</dt>
                <dd className="mt-2 border-t border-western-border-soft pt-3 text-right text-[26px] font-bold leading-none tabular-nums text-western-green-deep">
                  {formatBRL(total, "BRL")}
                </dd>

                {parcelas > 1 && (
                  <>
                    <dt className="sr-only">Parcelamento</dt>
                    <dd className="col-span-2 text-right text-meta tabular-nums">
                      ou {parcelas}× de {formatBRL(total / parcelas, "BRL")}
                    </dd>
                  </>
                )}
              </dl>
            </div>

            {/* Ações do editor — secundárias de propósito: a primária (verde) é a do card. */}
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => handleGeneratePdf(false)}
                disabled={sendingProposal}
                className="btn-outline-forest tap-target"
              >
                {sendingProposal ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                ) : (
                  <Send className="h-4 w-4" aria-hidden="true" />
                )}
                Salvar e gerar proposta
              </button>
              <button
                type="button"
                onClick={() => handleGeneratePdf(true)}
                disabled={sendingProposal}
                className="btn-outline-forest tap-target"
              >
                <Download className="h-4 w-4" aria-hidden="true" />
                Apenas baixar PDF
              </button>
            </div>
          </section>

          {/* Histórico de propostas — erro aqui NÃO vira "nenhuma proposta". */}
          {(erroPropostas || proposals.length > 0) && (
            <section className="rounded-2xl border border-western-border-soft bg-white p-5">
              <p className="text-eyebrow mb-4">Propostas enviadas</p>

              {erroPropostas ? (
                <EstadoErro
                  erro={erroPropostas}
                  onRetry={load}
                  titulo="Não consegui carregar o histórico de propostas"
                  compacto
                />
              ) : (
                <ul className="space-y-3">
                  {proposals.map((p) => (
                    <li
                      key={p.id}
                      className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-western-border-soft p-3"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <FileText className="h-5 w-5 flex-shrink-0 text-western-bronze" aria-hidden="true" />
                        <div className="min-w-0">
                          <p className="text-[17px] font-semibold text-western-green-deep">
                            Nº {p.numero}
                            <span className="ml-2 tabular-nums">{formatBRL(Number(p.total), "BRL")}</span>
                            {Number(p.discount_pct) > 0 && (
                              <span className="ml-2 text-[14px] font-semibold tabular-nums text-western-bronze">
                                −{p.discount_pct}%
                              </span>
                            )}
                          </p>
                          <p className="text-meta tabular-nums">
                            {dataAbsoluta(p.sent_at ?? p.created_at)}
                            {p.parcelas && p.parcelas > 1 ? ` · ${p.parcelas}×` : ""}
                            {p.forma_pagamento ? ` · ${p.forma_pagamento}` : ""}
                          </p>
                        </div>
                      </div>

                      {p.pdf_path && (
                        <div className="flex flex-shrink-0 gap-2">
                          <button
                            type="button"
                            onClick={() => openProposalPdf(p.pdf_path!)}
                            title="Abrir PDF"
                            aria-label={`Abrir PDF da proposta ${p.numero}`}
                            className="tap-target inline-flex items-center justify-center rounded-sm border border-western-border-strong text-western-green-deep transition-colors hover:border-western-green-deep"
                          >
                            <ExternalLink className="h-4 w-4" aria-hidden="true" />
                          </button>
                          <button
                            type="button"
                            onClick={() => shareProposal(p, "whatsapp")}
                            title="Enviar por WhatsApp"
                            aria-label={`Enviar a proposta ${p.numero} por WhatsApp`}
                            className="tap-target inline-flex items-center justify-center rounded-sm border border-western-border-strong text-western-green-deep transition-colors hover:border-western-green-deep"
                          >
                            <MessageCircle className="h-4 w-4" aria-hidden="true" />
                          </button>
                          <button
                            type="button"
                            onClick={() => shareProposal(p, "email")}
                            title="Enviar por e-mail"
                            aria-label={`Enviar a proposta ${p.numero} por e-mail`}
                            className="tap-target inline-flex items-center justify-center rounded-sm border border-western-border-strong text-western-green-deep transition-colors hover:border-western-green-deep"
                          >
                            <Mail className="h-4 w-4" aria-hidden="true" />
                          </button>
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </section>
          )}

          {/* Fechar venda */}
          <section className="rounded-2xl border border-status-success/25 bg-status-success/[0.04] p-5">
            <div className="mb-1 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-status-success" aria-hidden="true" />
              <p className="text-eyebrow text-status-success">Fechar venda</p>
            </div>
            <p className="text-body mb-5 text-[16px]">
              Marca este orçamento como pago e registra como a venda foi fechada.
            </p>

            <div className="mb-4 grid gap-4 sm:grid-cols-3">
              <div>
                <Label htmlFor="venda-forma" className="text-sublabel mb-1.5 block">Forma de pagamento</Label>
                <Select value={saleForma} onValueChange={setSaleForma}>
                  <SelectTrigger id="venda-forma" className={INPUT_CLS}><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {FORMAS_PAGAMENTO.map((f) => (
                      <SelectItem key={f} value={f} className="text-[16px]">{f}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="venda-parcelas" className="text-sublabel mb-1.5 block">Parcelas</Label>
                <Input
                  id="venda-parcelas"
                  type="number" min={1} value={saleParcelas}
                  onChange={(e) => setSaleParcelas(Math.max(1, Number(e.target.value) || 1))}
                  className={`${INPUT_CLS} tabular-nums`}
                />
              </div>
              <div>
                <Label htmlFor="venda-valor" className="text-sublabel mb-1.5 block">Valor final (R$)</Label>
                <BRLInput
                  value={saleValor ?? 0}
                  onChange={(n) => setSaleValor(Number.isFinite(n) ? n : null)}
                  placeholder={formatBRL(total, "BRL")}
                  className={`${INPUT_CLS} w-full text-right tabular-nums`}
                />
              </div>
            </div>

            <Textarea
              value={saleObs}
              onChange={(e) => setSaleObs(e.target.value)}
              rows={2}
              aria-label="Observações da venda"
              className="mb-4 rounded-sm border-western-border-strong bg-white text-[16px]"
              placeholder="Observações da venda (opcional)"
            />

            <button
              type="button"
              onClick={handleCloseSale}
              disabled={closingSale}
              className="btn-outline-forest tap-target"
            >
              {closingSale ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              ) : (
                <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
              )}
              {jaVendida ? "Regravar dados da venda" : "Marcar como vendido"}
            </button>

            {thread.pago_em && (
              <p className="mt-4 flex flex-wrap items-center gap-1.5 text-[16px] font-semibold tabular-nums text-status-success">
                <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                Vendido em {dataAbsoluta(thread.pago_em)}
                {thread.valor_final != null && ` · ${formatBRL(Number(thread.valor_final), "BRL")}`}
                {thread.forma_pagamento && ` · ${thread.forma_pagamento}`}
                {thread.parcelas && thread.parcelas > 1 ? ` · ${thread.parcelas}×` : ""}
              </p>
            )}
          </section>

          {/* Pedido original (o que o cliente pediu, antes de qualquer edição) */}
          <section className="rounded-2xl border border-western-border-soft bg-white p-5">
            <p className="text-eyebrow mb-4">Pedido original do cliente</p>
            <div className="mb-3 flex items-baseline justify-between gap-3">
              <span className="text-[16px] tabular-nums text-western-stone-warm">
                {payload?.items?.length ?? 0}{" "}
                {payload?.items?.length === 1 ? "peça" : "peças"}
              </span>
              <span className="text-[17px] font-semibold tabular-nums text-western-green-deep">
                {payload?.subtotal
                  ? formatBRL(payload.subtotal, payload.currency || "BRL")
                  : "—"}
              </span>
            </div>
            {payload?.items?.length ? (
              <ul className="divide-y divide-western-border-soft">
                {payload.items.map((i, idx) => (
                  <li key={idx} className="flex justify-between gap-4 py-2">
                    <span className="min-w-0 break-words text-[16px] text-western-green-deep">
                      <span className="tabular-nums">{i.quantity}×</span> {i.title}
                    </span>
                    <span className="flex-shrink-0 text-[16px] tabular-nums text-western-stone-warm">
                      {formatBRL(i.unitPrice * i.quantity, "BRL")}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-meta">O cliente não anexou peças a este pedido.</p>
            )}
          </section>
        </div>
      </div>

      {/* ── Confirmações ── */}
      <ConfirmDialog
        open={confirmarArquivo}
        onOpenChange={setConfirmarArquivo}
        title="Arquivar este orçamento?"
        description="Ele sai do fluxo de atendimento e passa a viver na aba Arquivado. Nada é apagado — dá para reabrir quando quiser."
        confirmLabel="Arquivar"
        onConfirm={handleArchive}
      />

      <ConfirmDialog
        open={confirmarRegravar}
        onOpenChange={setConfirmarRegravar}
        title="Esta venda já foi fechada. Regravar os dados?"
        description={`O fechamento atual (${
          thread.valor_final != null ? formatBRL(Number(thread.valor_final), "BRL") : "sem valor"
        }, status ${rotuloStatus(thread.status)}) será substituído pelos valores do formulário. O pedido não é duplicado.`}
        confirmLabel={closingSale ? "Regravando…" : "Regravar"}
        onConfirm={() => {
          setConfirmarRegravar(false);
          void gravarVenda();
        }}
      />

      <ConfirmDialog
        open={confirmarExclusao}
        onOpenChange={setConfirmarExclusao}
        title="Apagar orçamento definitivamente"
        description={`Isto apaga o orçamento ${numero} e todo o histórico da proposta. Não tem volta.\n\nDigite ${numero} abaixo para confirmar.`}
        requireText={numero}
        requireTextPlaceholder={`Digite ${numero} para confirmar`}
        confirmLabel="Apagar definitivamente"
        danger
        onConfirm={() => { void handleDelete(); }}
      />
    </div>
  );
}

function Campo({ rotulo, valor, numerica }: { rotulo: string; valor?: string | null; numerica?: boolean }) {
  return (
    <div className="min-w-0">
      <dt className="text-sublabel">{rotulo}</dt>
      <dd
        className={`mt-0.5 break-words text-[16px] text-western-green-deep ${numerica ? "tabular-nums" : ""}`}
      >
        {valor || "—"}
      </dd>
    </div>
  );
}
