import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Plus, Trash2, FolderOpen, FileText, Download, FileStack } from "lucide-react";
import { formatBRL } from "@/lib/shopify/client";

interface Project {
  id: string; nome: string; cidade: string | null; status: string; notas: string | null; updated_at: string;
}

interface QuotePdf {
  id: string;
  storage_path: string;
  subtotal: number;
  items_count: number;
  created_at: string;
  lead_id: string | null;
}

export default function AccountProjects() {
  const { user } = useAuth();
  const [items, setItems] = useState<Project[]>([]);
  const [pdfs, setPdfs] = useState<QuotePdf[]>([]);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ nome: "", cidade: "", notas: "" });

  const load = async () => {
    if (!user) return;
    const [{ data: projData }, { data: pdfData }] = await Promise.all([
      supabase.from("projects").select("*").eq("user_id", user.id).order("updated_at", { ascending: false }),
      supabase.from("quote_pdfs").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
    ]);
    setItems((projData as Project[]) ?? []);
    setPdfs((pdfData as QuotePdf[]) ?? []);
  };
  useEffect(() => { load(); }, [user]);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !form.nome.trim()) return;
    const { error } = await supabase.from("projects").insert({ ...form, user_id: user.id, nome: form.nome.trim() });
    if (error) return toast.error(error.message);
    setForm({ nome: "", cidade: "", notas: "" });
    setCreating(false);
    toast.success("Projeto criado.");
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("Excluir este projeto?")) return;
    const { error } = await supabase.from("projects").delete().eq("id", id);
    if (error) return toast.error(error.message);
    load();
  };

  const downloadPdf = async (path: string) => {
    const { data, error } = await supabase.storage.from("orcamentos").createSignedUrl(path, 3600);
    if (error || !data) return toast.error("Não foi possível abrir o PDF.");
    window.open(data.signedUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-eyebrow mb-3">Projetos & composições</p>
          <h2 className="font-display text-3xl text-western-green-deep">Seus projetos em curso</h2>
          <p className="text-sm text-western-stone-warm mt-2 max-w-xl">
            Aqui ficam seus <strong className="text-western-green-deep">projetos</strong> e os{" "}
            <strong className="text-western-green-deep">PDFs das composições</strong> que você pediu orçamento.
            Toda vez que solicitar atendimento pelo carrinho, salvamos o PDF nesta área.
          </p>
        </div>
        <Button onClick={() => setCreating(true)} className="rounded-none bg-western-green-deep hover:bg-western-green-mid text-western-cream font-mono text-[11px] uppercase tracking-[0.22em] h-11 px-5 self-start">
          <Plus className="h-4 w-4 mr-2" /> Novo
        </Button>
      </div>

      {/* Composições salvas */}
      <section className="mt-10 mb-10">
        <div className="flex items-center gap-3 mb-4">
          <FileStack className="h-4 w-4 text-western-gold" />
          <p className="text-eyebrow">Composições salvas em PDF</p>
        </div>
        {pdfs.length === 0 ? (
          <div className="border border-dashed border-western-stone-warm/30 p-6 text-center bg-white">
            <p className="text-sm text-western-stone-warm">
              Nenhuma composição salva ainda. Monte seu carrinho e clique em <em>Solicitar orçamento</em> — o PDF aparece aqui automaticamente.
            </p>
          </div>
        ) : (
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {pdfs.map((p) => (
              <li key={p.id} className="border border-western-stone-warm/15 bg-white p-4 flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="h-10 w-10 flex items-center justify-center bg-western-gold/10 border border-western-gold/30 flex-shrink-0">
                    <FileText className="h-4 w-4 text-western-gold" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-display text-western-green-deep">
                      Composição · {p.items_count} {p.items_count === 1 ? "item" : "itens"}
                    </p>
                    <p className="text-xs text-western-stone-warm font-mono mt-1">
                      {new Date(p.created_at).toLocaleDateString("pt-BR")} ·{" "}
                      {p.subtotal > 0 ? formatBRL(p.subtotal, "BRL") : "valores em análise"}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => downloadPdf(p.storage_path)}
                  className="inline-flex items-center gap-2 text-western-green-deep hover:text-western-gold font-mono text-[10px] uppercase tracking-[0.2em] flex-shrink-0"
                  title="Baixar PDF"
                >
                  <Download className="h-4 w-4" /> PDF
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {creating && (
        <form onSubmit={create} className="border border-western-gold/40 bg-western-gold/5 p-5 mb-6 space-y-4">
          <div>
            <Label className="text-eyebrow mb-2 block">Nome do projeto</Label>
            <Input value={form.nome} onChange={(e) => setForm((p) => ({ ...p, nome: e.target.value }))} className="h-11 bg-white border-western-stone-warm/30 rounded-none" required />
          </div>
          <div>
            <Label className="text-eyebrow mb-2 block">Cidade</Label>
            <Input value={form.cidade} onChange={(e) => setForm((p) => ({ ...p, cidade: e.target.value }))} className="h-11 bg-white border-western-stone-warm/30 rounded-none" />
          </div>
          <div>
            <Label className="text-eyebrow mb-2 block">Notas</Label>
            <Textarea value={form.notas} onChange={(e) => setForm((p) => ({ ...p, notas: e.target.value }))} className="bg-white border-western-stone-warm/30 rounded-none" rows={3} />
          </div>
          <div className="flex gap-2">
            <Button type="submit" className="rounded-none h-10 px-5 bg-western-green-deep text-western-cream font-mono text-[11px] uppercase tracking-[0.22em]">Salvar</Button>
            <Button type="button" variant="outline" onClick={() => setCreating(false)} className="rounded-none h-10 px-5 font-mono text-[11px] uppercase tracking-[0.22em]">Cancelar</Button>
          </div>
        </form>
      )}

      <section>
        <p className="text-eyebrow mb-4">Projetos</p>
        {items.length === 0 ? (
          <Empty />
        ) : (
          <ul className="divide-y divide-western-stone-warm/15 border border-western-stone-warm/15 bg-white">
            {items.map((p) => (
              <li key={p.id} className="p-5 flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-western-green-deep font-display text-lg">{p.nome}</p>
                  <p className="text-sm text-western-stone-warm">{p.cidade || "—"} · {p.status}</p>
                  {p.notas && <p className="text-sm text-western-stone-warm mt-2 line-clamp-2">{p.notas}</p>}
                </div>
                <button onClick={() => remove(p.id)} className="text-western-stone-warm hover:text-red-700"><Trash2 className="h-4 w-4" /></button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function Empty() {
  return (
    <div className="border border-dashed border-western-stone-warm/30 p-10 text-center bg-white">
      <FolderOpen className="h-8 w-8 text-western-stone-warm/40 mx-auto mb-4" />
      <p className="text-western-stone-warm">Nenhum projeto ainda. Crie um para organizar suas seleções por obra.</p>
    </div>
  );
}
