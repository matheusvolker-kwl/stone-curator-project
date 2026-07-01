import { useState } from "react";
import { ArrowRight, Box, CheckCircle2, Loader2 } from "lucide-react";
import Reveal from "@/components/shared/Reveal";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { BUSINESS } from "@/config/business";

/**
 * Módulo de captura de lead — modelos 3D pra SketchUp/Revit.
 *
 * TODO(3d-download): Plugar a fonte real dos arquivos 3D aqui.
 *  - Hoje: registra lead em `orcamento_leads` via RPC existente (origem=3d_download).
 *  - Depois: redirecionar pro pack (.zip) ou pro Warehouse com token individual.
 */
export default function Modelos3DModule() {
  const [open, setOpen] = useState(false);
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!nome.trim() || !email.trim()) {
      setError("Preencha nome e email.");
      return;
    }
    setLoading(true);
    try {
      // TODO(3d-download): substituir por endpoint dedicado de captura + entrega
      // do pack real. Por ora, aproveita a infra de leads via RPC.
      const { error: rpcErr } = await supabase.rpc(
        "register_orcamento_lead" as never,
        {
          _items_hash: `3d-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          _nome: nome.trim(),
          _email: email.trim(),
          _telefone: "",
          _empresa: null,
          _cidade: null,
          _mensagem: "Solicitou pack de modelos 3D SketchUp/Revit.",
          _origem: "3d_download",
          _payload: {
            items: [],
            subtotal: 0,
            currency: "BRL",
            summary: "3D pack request",
            numero: "3D",
            origem: "3d_download",
            submitted_at: new Date().toISOString(),
          } as never,
        } as never,
      );
      if (rpcErr) throw rpcErr;
      setDone(true);
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Não foi possível registrar agora.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setOpen(false);
    setTimeout(() => {
      setDone(false);
      setNome("");
      setEmail("");
      setError(null);
    }, 250);
  }

  return (
    <section className="surface-forest py-16 md:py-24 border-t border-western-gold/15">
      <div className="container-western">
        <Reveal variant="fade-up" duration={800}>
          <div className="grid md:grid-cols-[1.1fr_1fr] gap-10 md:gap-16 items-center">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-western-gold-soft mb-5">
                Para arquitetos e paisagistas
              </p>
              <h2 className="font-display text-3xl md:text-5xl lg:text-[3.4rem] text-western-cream leading-[1.05] mb-6">
                Baixe os modelos 3D e coloque a{" "}
                <span className="italic font-light text-western-gold-soft">
                  Western no seu projeto.
                </span>
              </h2>
              <p className="text-western-cream-muted text-base md:text-[17px] leading-relaxed max-w-lg mb-8">
                Cada peça do catálogo, modelada em alta fidelidade para
                SketchUp e Revit. Já são{" "}
                <strong className="text-western-cream">
                  +300 mil downloads
                </strong>{" "}
                por profissionais em projetos reais.
              </p>
              <button
                type="button"
                onClick={() => setOpen(true)}
                className="inline-flex items-center gap-2 h-12 px-7 bg-western-gold text-western-green-deep hover:bg-western-gold-soft font-mono text-xs uppercase tracking-[0.22em] transition-colors"
              >
                Baixar modelos 3D <ArrowRight className="h-4 w-4" />
              </button>
              <a
                href={BUSINESS.sketchupWarehouse}
                target="_blank"
                rel="noreferrer"
                className="block mt-5 font-mono text-[11px] uppercase tracking-[0.22em] text-western-gold-soft/80 hover:text-western-gold transition-colors"
              >
                · Ver perfil no 3D Warehouse
              </a>
            </div>

            <div className="hidden md:flex justify-center">
              <div className="relative w-full max-w-sm aspect-square border border-western-gold/25 bg-western-green-deep/50 backdrop-blur-sm flex items-center justify-center">
                <Box
                  className="h-40 w-40 text-western-gold-soft/70"
                  strokeWidth={0.75}
                />
                <span className="absolute top-4 left-4 font-mono text-[10px] uppercase tracking-[0.28em] text-western-gold-soft/80">
                  .skp · .rvt · .3ds
                </span>
                <span className="absolute bottom-4 right-4 font-display text-2xl text-western-cream">
                  +300k
                </span>
              </div>
            </div>
          </div>
        </Reveal>
      </div>

      <Dialog open={open} onOpenChange={(o) => (o ? setOpen(true) : reset())}>
        <DialogContent className="max-w-md bg-western-ivory border border-western-stone-warm/20 p-8">
          <DialogTitle className="font-display text-2xl text-western-green-deep">
            {done ? "Enviado." : "Baixar modelos 3D"}
          </DialogTitle>
          <DialogDescription className="text-sm text-western-stone-warm">
            {done
              ? "Em instantes você recebe o link do pack no seu email."
              : "Deixe seu contato — enviamos o pack completo no seu email."}
          </DialogDescription>

          {done ? (
            <div className="flex flex-col items-center py-6">
              <CheckCircle2 className="h-14 w-14 text-western-gold mb-4" strokeWidth={1.2} />
              <p className="text-western-green-deep text-center max-w-xs">
                Obrigado, <strong>{nome.split(" ")[0]}</strong>. Confira o
                inbox de <strong>{email}</strong>.
              </p>
              <button
                type="button"
                onClick={reset}
                className="mt-6 font-mono text-xs uppercase tracking-[0.22em] text-western-green-deep hover:text-western-gold transition-colors"
              >
                Fechar
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block font-mono text-[10px] uppercase tracking-[0.22em] text-western-green-deep mb-1.5">
                  Nome
                </label>
                <input
                  type="text"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  required
                  className="w-full h-11 px-3 border border-western-stone-warm/30 bg-white text-western-green-deep focus:border-western-gold outline-none"
                />
              </div>
              <div>
                <label className="block font-mono text-[10px] uppercase tracking-[0.22em] text-western-green-deep mb-1.5">
                  Email profissional
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full h-11 px-3 border border-western-stone-warm/30 bg-white text-western-green-deep focus:border-western-gold outline-none"
                />
              </div>
              {error && (
                <p className="text-xs text-red-700 bg-red-50 border border-red-200 px-3 py-2">
                  {error}
                </p>
              )}
              <button
                type="submit"
                disabled={loading}
                className="w-full inline-flex items-center justify-center gap-2 h-12 bg-western-green-deep text-western-cream hover:bg-western-green-deep/90 font-mono text-xs uppercase tracking-[0.22em] transition-colors disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Enviando…
                  </>
                ) : (
                  <>
                    Receber pack 3D <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
              <p className="text-[10px] text-western-stone-warm/70 text-center">
                Usamos seu email só pra enviar o pack e novidades técnicas.
              </p>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}
