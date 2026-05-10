import { Link } from "react-router-dom";
import { useState } from "react";
import { z } from "zod";
import logo from "@/assets/logo-horizontal-bege.png";
import { Mail, Send, Loader2, Check } from "lucide-react";
import { BUSINESS } from "@/config/business";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const newsletterSchema = z.object({
  email: z.string().trim().email("E-mail inválido").max(320),
  hp: z.string().max(0, "spam"),
});

const COLECOES: { label: string; handle: string }[] = [
  { label: "Cascatas", handle: "cascatas" },
  { label: "Fontes", handle: "fontes" },
  { label: "Pedra LED", handle: "pedra-led" },
  { label: "Pedras Grandes", handle: "pedras-grandes" },
  { label: "Pedras Médias", handle: "pedras-medias" },
  { label: "Pedras Pequenas", handle: "pedras-pequenas" },
  { label: "Pedras de Borda", handle: "pedras-de-borda" },
  { label: "Revestimentos", handle: "revestimentos" },
  { label: "Pisadas", handle: "pisadas" },
  { label: "Acessórios", handle: "acessorios" },
  { label: "Fósseis Decorativos", handle: "fosseis-decorativos" },
];

export default function Footer() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleNewsletter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    const { error } = await supabase.from("leads").insert({
      type: "newsletter",
      email,
      origem: "site/footer/newsletter",
    });
    setLoading(false);
    if (error) {
      toast.error("Não foi possível inscrever agora.");
      return;
    }
    setEmail("");
    toast.success("Inscrição confirmada", {
      description: "Você receberá lançamentos e novidades.",
    });
  };

  return (
    <footer className="surface-forest border-t border-western-gold/15 pt-16 pb-10 mt-0">
      <div className="container-western">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-10 md:gap-8 mb-14">
          {/* Coluna 1 — Coleções */}
          <div className="col-span-2 md:col-span-1">
            <h4 className="text-eyebrow mb-5">Coleções</h4>
            <ul className="space-y-2.5 text-sm">
              {COLECOES.map((c) => (
                <li key={c.handle}>
                  <Link to={`/linhas/${c.handle}`} className="text-western-cream hover:text-western-gold-soft transition-colors">
                    {c.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Coluna 2 — Parceiros */}
          <div>
            <h4 className="text-eyebrow mb-5">Para parceiros</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/guia-de-compra" className="text-western-cream hover:text-western-gold-soft transition-colors">Como comprar</Link></li>
              <li><Link to="/politica-comercial" className="text-western-cream hover:text-western-gold-soft transition-colors">Política comercial</Link></li>
              <li><Link to="/politica-de-entrega" className="text-western-cream hover:text-western-gold-soft transition-colors">Política de entrega</Link></li>
              <li><Link to="/trocas-e-avarias" className="text-western-cream hover:text-western-gold-soft transition-colors">Trocas e avarias</Link></li>
              <li><Link to="/parceiro/cadastro" className="text-western-cream hover:text-western-gold-soft transition-colors">Solicitar acesso B2B</Link></li>
            </ul>
          </div>

          {/* Coluna 3 — Western */}
          <div>
            <h4 className="text-eyebrow mb-5">Western</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/sobre" className="text-western-cream hover:text-western-gold-soft transition-colors">Sobre</Link></li>
              <li><Link to="/por-que-western" className="text-western-cream hover:text-western-gold-soft transition-colors">Por que Western</Link></li>
              <li><Link to="/aplicacoes-comerciais" className="text-western-cream hover:text-western-gold-soft transition-colors">Aplicações comerciais</Link></li>
              <li><Link to="/parceiros-arquitetos" className="text-western-cream hover:text-western-gold-soft transition-colors">Arquitetos parceiros</Link></li>
              <li><Link to="/faq" className="text-western-cream hover:text-western-gold-soft transition-colors">Perguntas frequentes</Link></li>
              <li><Link to="/contato" className="text-western-cream hover:text-western-gold-soft transition-colors">Contato</Link></li>
              <li><Link to="/privacidade" className="text-western-cream hover:text-western-gold-soft transition-colors">Privacidade</Link></li>
            </ul>
          </div>

          {/* Coluna 4 — Atendimento */}
          <div>
            <h4 className="text-eyebrow mb-5">Atendimento</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <a href={`https://wa.me/${BUSINESS.whatsappFabrica}`} target="_blank" rel="noopener noreferrer" className="text-western-cream hover:text-western-gold-soft transition-colors">
                  WhatsApp · {BUSINESS.whatsappLabel}
                </a>
              </li>
              <li>
                <a href={`mailto:${BUSINESS.emailComercial}`} className="text-western-cream hover:text-western-gold-soft transition-colors">
                  {BUSINESS.emailComercial}
                </a>
              </li>
              <li className="text-western-cream-muted">{BUSINESS.horarioAtelie}</li>
              <li>
                <a href="https://instagram.com/westernpools" target="_blank" rel="noopener noreferrer" className="text-western-cream hover:text-western-gold-soft transition-colors">
                  Instagram @westernpools
                </a>
              </li>
            </ul>
          </div>

          {/* Coluna 5 — Newsletter */}
          <div className="col-span-2 md:col-span-1">
            <h4 className="text-eyebrow mb-5">Novidades do catálogo</h4>
            <p className="text-sm text-western-cream-muted mb-4 leading-relaxed">
              Receba lançamentos e tabelas técnicas atualizadas.
            </p>
            <form
              onSubmit={handleNewsletter}
              className="flex border border-western-gold/30 focus-within:border-western-gold transition-colors"
            >
              <div className="flex items-center px-3 text-western-gold-soft">
                <Mail className="h-4 w-4" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                className="flex-1 bg-transparent outline-none text-sm py-2.5 text-western-cream placeholder:text-western-cream-muted/60"
              />
              <button
                type="submit"
                disabled={loading}
                aria-label="Enviar"
                className="px-3 hover:bg-western-gold/10 text-western-gold-soft transition-colors disabled:opacity-50"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </button>
            </form>
          </div>
        </div>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5 pt-8 border-t border-western-gold/15">
          <div className="flex items-center gap-5">
            <img src={logo} alt="Western" className="h-8 w-auto opacity-90" />
            <p className="text-spec text-western-cream-muted text-xs leading-snug">
              {BUSINESS.cnpj && <>CNPJ {BUSINESS.cnpj} · </>}Ateliê em {BUSINESS.cidadeAtelie}/{BUSINESS.ufAtelie} · Brasil
            </p>
          </div>
          <p className="text-spec text-western-cream-muted text-xs">
            © {new Date().getFullYear()} Western Pedras Decorativas
          </p>
        </div>
      </div>
    </footer>
  );
}
