import LegalPage from "@/components/legal/LegalPage";
import { BUSINESS } from "@/config/business";
import { MessageCircle, Mail, Phone, MapPin, Clock } from "lucide-react";

export default function TrocasAvarias() {
  const waUrl = `https://wa.me/${BUSINESS.whatsappFabrica}?text=${encodeURIComponent(
    "Olá! Preciso abrir um chamado de trocas/avarias."
  )}`;
  return (
    <LegalPage eyebrow="Trocas e avarias" titulo="O que cobre, e como acionar." atualizadoEm="maio de 2026">
      {/* Bloco de contato — pós-venda */}
      <div className="not-prose mb-12 border border-western-gold/30 bg-western-cream/40 p-6 md:p-8">
        <p className="text-eyebrow mb-4">Falar com pós-venda</p>
        <div className="grid sm:grid-cols-2 gap-x-8 gap-y-3 mb-6">
          <ContactRow icon={MessageCircle} label="WhatsApp" value={BUSINESS.whatsappLabel} href={waUrl} />
          <ContactRow icon={Phone} label="Telefone do ateliê" value={BUSINESS.whatsappLabel} href={`tel:+${BUSINESS.whatsappFabrica}`} />
          <ContactRow icon={Mail} label="E-mail suporte" value={BUSINESS.emailSuporte} href={`mailto:${BUSINESS.emailSuporte}`} />
          <ContactRow icon={Clock} label="Atendimento" value={BUSINESS.horarioAtelie} />
          <div className="sm:col-span-2">
            <ContactRow icon={MapPin} label="Endereço" value={`${BUSINESS.enderecoAtelieRua} · ${BUSINESS.cidadeAtelie}/${BUSINESS.ufAtelie} · ${BUSINESS.enderecoAtelieCep}`} />
          </div>
        </div>
        <a
          href={waUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 h-11 px-5 bg-western-gold text-western-green-deep hover:bg-western-gold/90 font-mono text-[11px] uppercase tracking-[0.22em] transition-colors"
        >
          <MessageCircle className="h-4 w-4" /> Abrir chamado no WhatsApp
        </a>
      </div>

      <p>
        Cada peça Western é fabricada artesanalmente, com variação cromática esperada entre
        peças do mesmo acabamento — essa variação é parte do produto, não um defeito. Para
        avarias de transporte, defeitos de fabricação ou divergências de pedido, seguimos o
        processo abaixo.
      </p>

      <h2>Garantia de fabricação</h2>
      <p>
        1 ano contra defeitos de fabricação a partir da data de emissão da nota fiscal. Cobre
        falhas estruturais e de pintura não atribuíveis a uso indevido, exposição química
        anormal ou intempérie atípica.
      </p>

      <h2>Avarias de transporte</h2>
      <ul>
        <li>Devem ser registradas no canhoto da nota fiscal no ato do recebimento, com fotos enviadas em até 24h.</li>
        <li>A Western produz peça de reposição equivalente, sem custo adicional para o parceiro, dentro do prazo padrão de produção.</li>
        <li>Avarias não registradas no recebimento não podem ser pleiteadas — a transportadora é responsável pelo trecho de entrega.</li>
      </ul>

      <h2>Defeitos de fabricação</h2>
      <ul>
        <li>Notificação por escrito ao comercial Western, com fotos e número da nota fiscal.</li>
        <li>Análise técnica em até 5 dias úteis. Se confirmado o defeito, a Western produz a peça de reposição ou restitui o valor proporcional.</li>
      </ul>

      <h2>O que não é coberto</h2>
      <ul>
        <li>Variação cromática natural entre peças artesanais.</li>
        <li>Manchas decorrentes de exposição química incompatível (ácidos fora de norma, solventes industriais).</li>
        <li>Danos causados por instalação inadequada, fora das instruções do manual.</li>
        <li>Marcas naturais de envelhecimento — musgo, pátina, oxidação ambiental — que são, na verdade, valorização estética.</li>
      </ul>

      <h2>Trocas por desistência</h2>
      <p>
        Por se tratar de produção sob encomenda, peças entregues conforme especificado na ordem
        de compra não estão sujeitas a troca por arrependimento.
      </p>
    </LegalPage>
  );
}

function ContactRow({
  icon: Icon, label, value, href,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  href?: string;
}) {
  const content = (
    <span className="text-western-green-deep">{value}</span>
  );
  return (
    <div className="flex items-start gap-3">
      <Icon className="h-4 w-4 text-western-gold mt-0.5 flex-shrink-0" />
      <div className="min-w-0">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-western-stone-warm/80 mb-0.5">{label}</p>
        {href ? (
          <a href={href} target={href.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer" className="text-western-green-deep hover:text-western-gold transition-colors break-words">
            {value}
          </a>
        ) : content}
      </div>
    </div>
  );
}
