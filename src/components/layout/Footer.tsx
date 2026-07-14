import { Link } from "react-router-dom";
import { useState } from "react";
import { z } from "zod";
import logo from "@/assets/logo-horizontal-bege.png";
import {
  Mail,
  Send,
  Loader2,
  Check,
  ShieldCheck,
  Truck,
  FileText,
  MapPin,
  MessageCircle,
} from "lucide-react";
import { BUSINESS } from "@/config/business";
import { submitSecureLead } from "@/lib/leads";
import TurnstileWidget from "@/components/security/TurnstileWidget";
import { toast } from "sonner";

const newsletterSchema = z.object({
  email: z.string().trim().toLowerCase().email("E-mail inválido").max(320),
  hp: z.string().max(0, "spam"),
});

const COLECOES: { label: string; handle: string }[] = [
  { label: "Cascatas", handle: "cascatas" },
  { label: "Fontes para Jardim", handle: "fontes-para-jardim" },
  { label: "Pedras Grandes", handle: "pedras-grandes" },
  { label: "Pedras Médias", handle: "pedras-medias" },
  { label: "Pedras Pequenas", handle: "pedras-pequenas" },
  { label: "Pedras de Borda", handle: "pedras-de-borda" },
  { label: "Revestimentos", handle: "revestimentos" },
  { label: "Pisadas", handle: "pisadas" },
  { label: "Acessórios", handle: "acessorios" },
  { label: "Fósseis Decorativos", handle: "fosseis-decorativos" },
];

/* DS V3: rodapé é uma das faixas onde o verde escuro é permitido.
 * Títulos de coluna = label 14px semibold tracking .06em (dourado claro, que
 * é o único acento com contraste sobre o verde). Links 16px — 14px é o piso
 * absoluto e link de rodapé merece mais que o piso. */
const colTitle = "text-[14px] font-semibold uppercase tracking-[0.06em] text-western-gold-soft mb-4";
const colLink =
  "inline-flex items-center min-h-[36px] text-[16px] text-western-cream hover:text-western-gold-soft hover:underline underline-offset-4 transition-colors";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [hp, setHp] = useState(""); // honeypot
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);

  const handleNewsletter = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = newsletterSchema.safeParse({ email, hp });
    if (!parsed.success) {
      const msg = parsed.error.issues[0]?.message ?? "Verifique o e-mail.";
      if (msg !== "spam") toast.error(msg);
      return;
    }
    if (!captchaToken) {
      toast.error("Confirme que você não é um robô.");
      return;
    }
    setLoading(true);
    const res = await submitSecureLead({
      type: "newsletter",
      email: parsed.data.email,
      origem: "site/footer/newsletter",
      payload: { source: "footer", consent: true, ts: new Date().toISOString() },
    }, captchaToken);
    setLoading(false);
    setCaptchaToken(null);
    if (!res.ok) {
      toast.error("Não foi possível inscrever agora.", { description: res.error ?? "Tente novamente em instantes." });
      return;
    }
    setEmail("");
    setDone(true);
    toast.success("Inscrição confirmada", {
      description: "Você receberá lançamentos e tabelas técnicas.",
    });
  };

  return (
    <footer className="surface-forest border-t border-western-gold/15 pt-16 pb-10">
      <div className="container-western">
        {/* Marca + colunas de navegação */}
        <div className="grid grid-cols-2 md:grid-cols-12 gap-x-8 gap-y-12 pb-14">
          <div className="col-span-2 md:col-span-3">
            <img src={logo} alt="Western" className="h-14 w-auto mb-5" />
            <p className="text-[17px] leading-[1.6] text-western-cream-muted max-w-[320px]">
              Ateliê de pedra artesanal desde {BUSINESS.fundadaEm}. Peças com cerca de 10% do peso
              da pedra natural — sem guindaste, até em laje.
            </p>
            <a
              href={`https://wa.me/${BUSINESS.whatsappFabrica}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-gold mt-6 w-full sm:w-auto"
            >
              <MessageCircle className="h-5 w-5" strokeWidth={1.75} />
              Falar com o ateliê
            </a>
          </div>

          <div className="col-span-1 md:col-span-2">
            <h4 className={colTitle}>Linhas</h4>
            <ul className="flex flex-col">
              {COLECOES.map((c) => (
                <li key={c.handle}>
                  <Link to={`/linhas/${c.handle}`} className={colLink}>
                    {c.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link to="/produtos" className={`${colLink} text-western-gold-soft`}>
                  Ver o catálogo completo
                </Link>
              </li>
            </ul>
          </div>

          <div className="col-span-1 md:col-span-2">
            <h4 className={colTitle}>Para parceiros</h4>
            <ul className="flex flex-col">
              <li><Link to="/parceiro/cadastro" className={colLink}>Seja parceiro</Link></li>
              <li><Link to="/como-comprar" className={colLink}>Como comprar</Link></li>
              <li><Link to="/conjuntos" className={colLink}>Conjuntos prontos</Link></li>
              <li><Link to="/guia-de-composicao" className={colLink}>Guia de composição</Link></li>
              <li><Link to="/inspiracoes" className={colLink}>Inspirações</Link></li>
              <li><Link to="/western-box" className={colLink}>Western Box · amostras</Link></li>
              <li><Link to="/politica-comercial" className={colLink}>Política comercial</Link></li>
              <li><Link to="/politica-de-entrega" className={colLink}>Política de entrega</Link></li>
              <li><Link to="/trocas-e-avarias" className={colLink}>Trocas e avarias</Link></li>
            </ul>
          </div>

          <div className="col-span-1 md:col-span-2">
            <h4 className={colTitle}>Western</h4>
            <ul className="flex flex-col">
              <li><Link to="/sobre" className={colLink}>Sobre o ateliê</Link></li>
              <li><Link to="/por-que-western" className={colLink}>Por que Western</Link></li>
              <li><Link to="/para-sua-casa" className={colLink}>Para sua casa</Link></li>
              <li><Link to="/contrate-a-western" className={colLink}>Contrate a Western</Link></li>
              <li><Link to="/visitar" className={colLink}>Agendar visita</Link></li>
              <li><Link to="/faq" className={colLink}>Perguntas frequentes</Link></li>
              <li><Link to="/contato" className={colLink}>Contato</Link></li>
              <li><Link to="/privacidade" className={colLink}>Privacidade</Link></li>
            </ul>
          </div>

          <div className="col-span-1 md:col-span-3">
            <h4 className={colTitle}>Atendimento</h4>
            <ul className="flex flex-col">
              <li>
                <a
                  href={`https://wa.me/${BUSINESS.whatsappFabrica}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={colLink}
                >
                  WhatsApp · {BUSINESS.whatsappLabel}
                </a>
              </li>
              <li>
                <a href={`mailto:${BUSINESS.emailComercial}`} className={`${colLink} break-all`}>
                  {BUSINESS.emailComercial}
                </a>
              </li>
              <li>
                <a
                  href="https://instagram.com/westernpools"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={colLink}
                >
                  Instagram @westernpools
                </a>
              </li>
              <li className="text-[16px] text-western-cream-muted mt-2 leading-[1.6]">
                {BUSINESS.horarioAtelie}
              </li>
              <li className="text-[16px] text-western-cream-muted leading-[1.6]">
                Ateliê em {BUSINESS.enderecoAtelieCompleto}
              </li>
            </ul>
          </div>
        </div>

        {/* Novidades do catálogo */}
        <div className="grid md:grid-cols-2 gap-8 md:gap-16 items-start py-12 border-t border-western-gold/15">
          <div>
            <h4 className={colTitle}>Novidades do catálogo</h4>
            <p className="text-[17px] leading-[1.6] text-western-cream-muted max-w-[420px]">
              Receba lançamentos e tabelas técnicas atualizadas. Sem spam — cancele quando quiser.
            </p>
          </div>

          <div>
            {done ? (
              <div className="flex items-center gap-3 rounded-[10px] border border-western-gold/40 bg-western-gold/10 px-4 min-h-[52px] text-[17px] text-western-cream">
                <Check className="h-5 w-5 text-western-gold-soft shrink-0" strokeWidth={1.75} />
                Inscrição confirmada.
              </div>
            ) : (
              <>
                <form onSubmit={handleNewsletter} className="flex flex-col sm:flex-row gap-3">
                  <div className="flex items-center gap-3 flex-1 px-4 min-h-[52px] rounded-[10px] border-[1.5px] border-western-cream/40 focus-within:border-western-gold-soft transition-colors">
                    <Mail className="h-5 w-5 text-western-gold-soft shrink-0" strokeWidth={1.75} />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="seu@email.com"
                      autoComplete="email"
                      aria-label="Seu e-mail"
                      className="flex-1 min-w-0 bg-transparent outline-none text-[16px] text-western-cream placeholder:text-western-cream-muted/70"
                    />
                    {/* honeypot — escondido de usuários reais */}
                    <input
                      type="text"
                      tabIndex={-1}
                      autoComplete="off"
                      value={hp}
                      onChange={(e) => setHp(e.target.value)}
                      className="hidden"
                      aria-hidden="true"
                    />
                  </div>
                  {/* Dourado porque o verde não teria contraste sobre o verde do rodapé */}
                  <button type="submit" disabled={loading} className="btn-gold w-full sm:w-auto">
                    {loading ? (
                      <Loader2 className="h-5 w-5 animate-spin" strokeWidth={1.75} />
                    ) : (
                      <Send className="h-5 w-5" strokeWidth={1.75} />
                    )}
                    Inscrever
                  </button>
                </form>
                <TurnstileWidget
                  onToken={setCaptchaToken}
                  onExpire={() => setCaptchaToken(null)}
                  className="mt-4"
                />
              </>
            )}
          </div>
        </div>

        {/* Sinais de confiança — perto da decisão, na voz da marca */}
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-4 py-10 border-t border-western-gold/15">
          {[
            { Icon: ShieldCheck, text: `Garantia de ${BUSINESS.garantiaLabel} em todas as peças` },
            { Icon: FileText, text: "Nota fiscal (NF-e) em todo pedido" },
            { Icon: Truck, text: "Entrega rastreada por transportadora" },
            { Icon: MapPin, text: `Retirada no ateliê em ${BUSINESS.cidadeAtelie}/${BUSINESS.ufAtelie}` },
          ].map(({ Icon, text }) => (
            <li key={text} className="flex items-start gap-3 text-[16px] text-western-cream leading-[1.5]">
              <Icon className="h-5 w-5 text-western-gold-soft shrink-0 mt-0.5" strokeWidth={1.75} />
              <span>{text}</span>
            </li>
          ))}
        </ul>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 pt-8 border-t border-western-gold/15">
          <p className="text-[14px] text-western-cream-muted leading-[1.6]">
            {BUSINESS.razaoSocial && <>{BUSINESS.razaoSocial} · </>}
            {BUSINESS.cnpj && <>CNPJ {BUSINESS.cnpj}</>}
          </p>
          <p className="text-[14px] text-western-cream-muted">
            © {new Date().getFullYear()} Western Pedras Decorativas
          </p>
        </div>
      </div>
    </footer>
  );
}
