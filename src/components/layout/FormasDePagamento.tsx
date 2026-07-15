/**
 * Formas de pagamento — bandeiras + selos de segurança.
 *
 * Portado do rodapé do kit V3 (shell.jsx "va-f-pay"), que o app não tinha
 * repassado. As bandeiras sao SVG inline (zero requisicao, nitidas em qualquer
 * DPI) sobre chips claros, para as marcas coloridas terem contraste mesmo sobre
 * o rodape verde. Pagamento real: Appmax (Pix, boleto, cartao ate 12x).
 */
import { ShieldCheck, Lock, FileText } from "lucide-react";

function Chip({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <span
      aria-label={label}
      className="inline-flex items-center gap-1.5 h-8 rounded-[6px] bg-white px-2.5 shadow-[0_1px_2px_rgba(0,0,0,0.12)]"
    >
      {children}
    </span>
  );
}

export default function FormasDePagamento() {
  return (
    <div className="grid gap-6 lg:grid-cols-[auto_1fr] lg:items-center py-10 border-t border-western-gold/15">
      <div>
        <p className="text-[14px] font-semibold uppercase tracking-[0.06em] text-western-gold-soft mb-3">
          Formas de pagamento
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <Chip label="Visa">
            <span
              className="italic"
              style={{ fontFamily: "Arial, sans-serif", fontWeight: 900, fontSize: 15, letterSpacing: "-0.02em", color: "#1A1F71" }}
            >
              VISA
            </span>
          </Chip>

          <Chip label="Mastercard">
            <svg width="30" height="20" viewBox="0 0 30 20" aria-hidden="true">
              <circle cx="12" cy="10" r="8" fill="#EB001B" />
              <circle cx="18" cy="10" r="8" fill="#F79E1B" />
              <path d="M15 4.2a8 8 0 0 0 0 11.6 8 8 0 0 0 0-11.6Z" fill="#FF5F00" />
            </svg>
          </Chip>

          <Chip label="American Express">
            <svg width="38" height="24" viewBox="0 0 38 24" aria-hidden="true">
              <rect width="38" height="24" rx="3" fill="#006FCF" />
              <text x="19" y="9.6" textAnchor="middle" fill="#fff" fontFamily="Arial, sans-serif" fontWeight="700" fontSize="6" letterSpacing=".3">AMERICAN</text>
              <text x="19" y="17.4" textAnchor="middle" fill="#fff" fontFamily="Arial, sans-serif" fontWeight="700" fontSize="6" letterSpacing=".3">EXPRESS</text>
            </svg>
          </Chip>

          <Chip label="Diners Club">
            <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="12" cy="12" r="10.5" fill="#0079BE" />
              <path d="M12 4.2a7.8 7.8 0 0 0 0 15.6 7.8 7.8 0 0 0 0-15.6Zm-2.2 12.9a5.2 5.2 0 0 1 0-9.9v9.9Zm4.4 0v-9.9a5.2 5.2 0 0 1 0 9.9Z" fill="#fff" />
            </svg>
            <span style={{ color: "#0079BE", fontSize: 12, fontWeight: 800 }}>Diners</span>
          </Chip>

          <Chip label="Elo">
            <svg width="19" height="19" viewBox="0 0 20 20" aria-hidden="true">
              <circle cx="7" cy="7" r="3.5" fill="#FFCB05" />
              <circle cx="13" cy="7" r="3.5" fill="#EF4123" />
              <circle cx="10" cy="13.2" r="3.5" fill="#00A4E0" />
            </svg>
            <span className="italic" style={{ fontWeight: 900, fontSize: 13, color: "#000" }}>elo</span>
          </Chip>

          <Chip label="Pix">
            <svg width="18" height="18" viewBox="0 0 32 32" aria-hidden="true">
              <rect x="8.7" y="8.7" width="14.6" height="14.6" rx="3.2" transform="rotate(45 16 16)" fill="#32BCAD" />
              <path d="M16 9.4 12.6 6a2.4 2.4 0 0 1 6.8 0L16 9.4Zm0 13.2 3.4 3.4a2.4 2.4 0 0 1-6.8 0L16 22.6Z" fill="#32BCAD" />
            </svg>
            <span style={{ color: "#0F9E90", fontWeight: 800, fontSize: 13 }}>Pix</span>
          </Chip>

          <Chip label="Boleto bancário">
            <svg width="24" height="17" viewBox="0 0 24 17" aria-hidden="true">
              <g fill="#111">
                <rect x="1" y="1" width="1.4" height="15" />
                <rect x="3.4" y="1" width="2.4" height="15" />
                <rect x="6.8" y="1" width="1" height="15" />
                <rect x="8.8" y="1" width="1.8" height="15" />
                <rect x="11.6" y="1" width="1" height="15" />
                <rect x="13.6" y="1" width="2.6" height="15" />
                <rect x="17.2" y="1" width="1" height="15" />
                <rect x="19.2" y="1" width="1.6" height="15" />
                <rect x="21.8" y="1" width="1.2" height="15" />
              </g>
            </svg>
            <span style={{ color: "#111", fontWeight: 800, fontSize: 12.5 }}>Boleto</span>
          </Chip>
        </div>
      </div>

      <ul className="flex flex-col sm:flex-row lg:flex-col xl:flex-row flex-wrap gap-x-6 gap-y-2 lg:justify-self-end">
        {[
          { Icon: ShieldCheck, text: "Pagamento processado com segurança pela Appmax" },
          { Icon: Lock, text: "Site seguro (SSL) — seus dados protegidos" },
          { Icon: FileText, text: "Nota fiscal (NF-e) em todo pedido" },
        ].map(({ Icon, text }) => (
          <li key={text} className="flex items-center gap-2 text-[14px] text-western-cream-muted leading-[1.5]">
            <Icon className="h-[18px] w-[18px] text-western-gold-soft shrink-0" strokeWidth={1.75} />
            <span>{text}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
