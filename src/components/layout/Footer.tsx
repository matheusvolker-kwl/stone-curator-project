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
  Clock,
  MessageCircle,
} from "lucide-react";
import { BUSINESS } from "@/config/business";
import { submitSecureLead } from "@/lib/leads";
import TurnstileWidget from "@/components/security/TurnstileWidget";
import { toast } from "sonner";
import FormasDePagamento from "./FormasDePagamento";

const newsletterSchema = z.object({
  email: z.string().trim().toLowerCase().email("E-mail inválido").max(320),
  hp: z.string().max(0, "spam"),
});

const COLECOES: { label: string; handle: string }[] = [
  { label: "Cascatas", handle: "cascatas" },
  { label: "Fontes para Jardim", handle: "fontes-para-jardim" },
  { label: "Pedras decorativas", handle: "pedras-decorativas" },
  { label: "Pedras de Borda", handle: "pedras-de-borda" },
  { label: "Revestimentos", handle: "revestimentos" },
  { label: "Pisadas", handle: "pisadas" },
  { label: "Acessórios", handle: "acessorios" },
  { label: "Fósseis Decorativos", handle: "fosseis-decorativos" },
];

/* DS V3: rodapé é uma das faixas onde o verde escuro é permitido.
 * Títulos de coluna = label 14px semibold tracking .06em (dourado claro, que
 * é o único acento com contraste sobre o verde). Links 16px — 14px é o piso
 * absoluto e link de rodapé merece mais que o piso.
 *
 * MOBILE: o rodapé é COLUNA ÚNICA (<640px). Em 2 colunas sobravam ~145px úteis
 * e o texto quebrava DENTRO da palavra (e-mail partido no domínio, CEP partido).
 * Coluna cheia + break-normal = nenhuma palavra é cortada no meio. Não usar
 * break-all/anywhere aqui. */
const colTitle = "text-[14px] font-semibold uppercase tracking-[0.06em] text-western-gold-soft mb-4";
const colLink =
  "inline-flex items-center min-h-tap md:min-h-[36px] max-w-full break-normal text-[15px] text-western-cream hover:text-western-gold-soft hover:underline underline-offset-4 transition-colors";

/* Quebra saudável do e-mail: única oportunidade de quebra é DEPOIS do "@"
 * (comercial@ / westernpools.com.br). O domínio nunca é partido no meio. */
const [emailLocal, emailDominio] = BUSINESS.emailComercial.split("@");

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
        {/* Marca + colunas de navegação.
            Mobile: 1 coluna (nada de 145px úteis). sm: 2 colunas. md: 12 colunas. */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-12 gap-x-8 gap-y-10 md:gap-y-12 pb-14">
          <div className="min-w-0 sm:col-span-2 md:col-span-3">
            <img src={logo} alt="Western" className="h-11 md:h-12 w-auto mb-5" />
            <p className="text-[16px] leading-[1.6] text-western-cream-muted max-w-[320px]">
              Ateliê de pedra artesanal desde {BUSINESS.fundadaEm}. Peças com cerca de 10% do peso
              da pedra natural — sobem sem guindaste, até em coberturas e terraços.
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

          <div className="min-w-0 md:col-span-2">
            <h4 className={colTitle}>Categorias</h4>
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

          <div className="min-w-0 md:col-span-2">
            <h4 className={colTitle}>Para parceiros</h4>
            <ul className="flex flex-col">
              <li><Link to="/parceiro/cadastro" className={colLink}>Seja parceiro</Link></li>
              <li><Link to="/como-comprar" className={colLink}>Como comprar</Link></li>
              <li><Link to="/conjuntos" className={colLink}>Conjuntos prontos</Link></li>
              <li><Link to="/guia-de-composicao" className={colLink}>Guia de composição</Link></li>
              <li><Link to="/obras" className={colLink}>Obras</Link></li>
              <li><Link to="/western-box" className={colLink}>Western Box · amostras</Link></li>
              <li><Link to="/politica-comercial" className={colLink}>Política comercial e de entrega</Link></li>
              <li><Link to="/trocas-e-avarias" className={colLink}>Trocas e avarias</Link></li>
            </ul>
          </div>

          <div className="min-w-0 md:col-span-2">
            <h4 className={colTitle}>Western</h4>
            <ul className="flex flex-col">
              <li><Link to="/a-pedra" className={colLink}>A pedra Western</Link></li>
              <li><Link to="/sobre" className={colLink}>Sobre o ateliê</Link></li>
              <li><Link to="/para-sua-casa" className={colLink}>Para sua casa</Link></li>
              <li><Link to="/contrate-a-western" className={colLink}>Contrate a Western</Link></li>
              <li><Link to="/visitar" className={colLink}>Agendar visita</Link></li>
              <li><Link to="/faq" className={colLink}>Perguntas frequentes</Link></li>
              <li><Link to="/contato" className={colLink}>Contato</Link></li>
              <li><Link to="/privacidade" className={colLink}>Privacidade</Link></li>
            </ul>
          </div>

          {/* Largura total no mobile e no sm: é o bloco com e-mail, telefone e
              endereço — os textos que não podem ser partidos no meio. */}
          <div className="min-w-0 sm:col-span-2 md:col-span-3">
            <h4 className={colTitle}>Atendimento</h4>
            <ul className="flex flex-col">
              <li>
                <a
                  href={`https://wa.me/${BUSINESS.whatsappFabrica}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={colLink}
                >
                  {/* um único span: dentro do inline-flex, texto + elemento virariam
                      flex items separados e a quebra/espaço se perderiam */}
                  <span>
                    WhatsApp ·{" "}
                    <span className="whitespace-nowrap">{BUSINESS.whatsappLabel}</span>
                  </span>
                </a>
              </li>
              <li>
                <a href={`mailto:${BUSINESS.emailComercial}`} className={colLink}>
                  <span className="break-normal">{emailLocal}@<wbr />{emailDominio}</span>
                </a>
              </li>
              <li>
                <a
                  href="https://instagram.com/westernpools"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={colLink}
                >
                  <span>Instagram @westernpools</span>
                </a>
              </li>
              {/* Horário/retirada e endereço — com ícone, destacados do resto
                  da lista de links, pra ler num relance. */}
              <li className="mt-4 flex items-start gap-2.5 text-[15px] text-western-cream-muted leading-[1.5]">
                <Clock
                  className="h-[18px] w-[18px] text-western-gold-soft shrink-0 mt-0.5"
                  strokeWidth={1.75}
                  aria-hidden="true"
                />
                <span>{BUSINESS.horarioAtelie}</span>
              </li>
              <li className="mt-2.5 flex items-start gap-2.5 text-[15px] text-western-cream-muted leading-[1.5] break-normal">
                <MapPin
                  className="h-[18px] w-[18px] text-western-gold-soft shrink-0 mt-0.5"
                  strokeWidth={1.75}
                  aria-hidden="true"
                />
                <span>
                  {BUSINESS.enderecoAtelieRua} ·{" "}
                  <span className="whitespace-nowrap">
                    {BUSINESS.cidadeAtelie}/{BUSINESS.ufAtelie}
                  </span>{" "}
                  · <span className="whitespace-nowrap">{BUSINESS.enderecoAtelieCep}</span>
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Novidades do catálogo */}
        <div className="grid md:grid-cols-2 gap-6 md:gap-10 items-start py-9 border-t border-western-gold/15">
          <div>
            <h4 className={colTitle}>Novidades do catálogo</h4>
            <p className="text-[16px] leading-[1.6] text-western-cream-muted max-w-[420px]">
              Receba lançamentos e tabelas técnicas atualizadas. Sem spam — cancele quando quiser.
            </p>
          </div>

          <div>
            {done ? (
              <div className="flex items-center gap-3 rounded-lg border border-western-gold/40 bg-western-gold/10 px-4 min-h-control text-[16px] text-western-cream">
                <Check className="h-5 w-5 text-western-gold-soft shrink-0" strokeWidth={1.75} />
                Inscrição confirmada.
              </div>
            ) : (
              <>
                <form onSubmit={handleNewsletter} className="flex flex-col sm:flex-row gap-3">
                  <div className="flex items-center gap-3 flex-1 px-4 min-h-control rounded-lg border-[1.5px] border-western-cream/40 focus-within:border-western-gold-soft transition-colors">
                    <Mail className="h-5 w-5 text-western-gold-soft shrink-0" strokeWidth={1.75} />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="seu@email.com"
                      autoComplete="email"
                      aria-label="Seu e-mail"
                      className="flex-1 min-w-0 bg-transparent outline-none text-[15px] text-western-cream placeholder:text-western-cream-muted/70"
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
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-3 py-8 border-t border-western-gold/15">
          {[
            { Icon: ShieldCheck, text: `Garantia de ${BUSINESS.garantiaLabel} em todas as peças` },
            { Icon: FileText, text: "Compra 100% segura" },
            { Icon: Truck, text: "Entrega rastreada por transportadora" },
            { Icon: MapPin, text: `Retirada no ateliê em ${BUSINESS.cidadeAtelie}/${BUSINESS.ufAtelie}` },
          ].map(({ Icon, text }) => (
            <li key={text} className="flex items-start gap-3 text-[15px] text-western-cream leading-[1.5]">
              <Icon className="h-5 w-5 text-western-gold-soft shrink-0 mt-0.5" strokeWidth={1.75} />
              <span>{text}</span>
            </li>
          ))}
        </ul>

        {/* Formas de pagamento — faixa do kit V3 que não tinha sido repassada */}
        <FormasDePagamento />

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
