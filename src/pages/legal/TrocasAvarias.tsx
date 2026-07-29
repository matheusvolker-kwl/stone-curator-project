import { Link } from "react-router-dom";
import { ArrowRight, MessageCircle, Mail, Phone, MapPin, Clock, type LucideIcon } from "lucide-react";
import LegalPage from "@/components/legal/LegalPage";
import FechamentoLegal from "@/components/legal/FechamentoLegal";
import { BUSINESS } from "@/config/business";

/* DS V3 — as políticas terminavam em beco sem saída: navegação entre elas no topo
 * e faixa de fechamento com CTA no fim. Os "!" vencem os seletores descendentes
 * do LegalPage ([&_a]:underline, [&_h2]:text-western-green-deep), que sairiam
 * errados na faixa escura e nos botões. */
const POLITICAS = [
  { to: "/politica-comercial", label: "Comercial e entrega" },
  { to: "/privacidade", label: "Privacidade" },
  { to: "/trocas-e-avarias", label: "Trocas e avarias" },
] as const;

function LegalNav({ atual }: { atual: string }) {
  return (
    <nav aria-label="Políticas da Western" className="mb-10 flex flex-wrap gap-2">
      {POLITICAS.map((p) => {
        const ativa = p.to === atual;
        return (
          <Link
            key={p.to}
            to={p.to}
            aria-current={ativa ? "page" : undefined}
            className={`tap-target inline-flex items-center rounded-full border px-5 font-sans text-[15px] font-semibold !no-underline transition-colors ${
              ativa
                ? "border-western-cta bg-western-cta text-western-cream"
                : "border-western-border-strong text-western-green-deep hover:border-western-green-deep hover:bg-western-paper"
            }`}
          >
            {p.label}
          </Link>
        );
      })}
    </nav>
  );
}


/* Ficha de contato do pós-venda: rótulo em eyebrow sans 14px bronze (era mono 10px)
 * e valor em 17px — alvo de toque inteiro clicável. */
function ContatoTile({
  icon: Icone,
  label,
  valor,
  href,
  className = "",
}: {
  icon: LucideIcon;
  label: string;
  valor: string;
  href?: string;
  className?: string;
}) {
  const conteudo = (
    <>
      <Icone className="mt-1 h-5 w-5 flex-shrink-0 text-western-green-deep" strokeWidth={1.75} />
      <span className="min-w-0">
        <span className="text-eyebrow mb-1 block">{label}</span>
        <span className="block break-words text-[16px] leading-[1.5] text-western-green-deep">{valor}</span>
      </span>
    </>
  );
  const base = `tap-target flex items-start gap-3 rounded-lg border border-western-border-soft bg-white p-4 ${className}`;

  return href ? (
    <a
      href={href}
      target={href.startsWith("http") ? "_blank" : undefined}
      rel="noopener noreferrer"
      className={`${base} !no-underline transition-colors hover:border-western-green-deep`}
    >
      {conteudo}
    </a>
  ) : (
    <div className={base}>{conteudo}</div>
  );
}

export default function TrocasAvarias() {
  const waUrl = `https://wa.me/${BUSINESS.whatsappFabrica}?text=${encodeURIComponent(
    "Olá! Preciso abrir um chamado de trocas/avarias."
  )}`;

  return (
    <LegalPage eyebrow="Trocas e avarias" titulo="O que cobre, e como acionar." atualizadoEm="maio de 2026" seoPath="/trocas-e-avarias" seoTitle="Trocas e avarias — Western" seoDescription="Como abrir um chamado de trocas ou avarias com a Western: cobertura, prazos e passo a passo do pós-venda.">
      <LegalNav atual="/trocas-e-avarias" />

      <p className="text-[17px] leading-[1.6] text-western-green-deep">
        Cada peça Western é fabricada artesanalmente, com variação cromática esperada entre
        peças do mesmo acabamento — essa variação é parte do produto, não um defeito. Para
        avarias de transporte, defeitos de fabricação ou divergências de pedido, seguimos o
        processo abaixo.
      </p>

      {/* Bloco de contato — pós-venda */}
      <div className="mb-12 mt-10 rounded-xl border border-western-border-soft bg-western-paper p-6 md:p-8">
        <p className="text-eyebrow mb-5">Falar com pós-venda</p>
        <div className="grid gap-3 sm:grid-cols-2">
          <ContatoTile icon={MessageCircle} label="WhatsApp pós-venda" valor={BUSINESS.whatsappLabel} href={waUrl} />
          <ContatoTile icon={Phone} label="Telefone do ateliê" valor={BUSINESS.whatsappLabel} href={`tel:+${BUSINESS.whatsappFabrica}`} />
          <ContatoTile icon={Mail} label="E-mail suporte" valor={BUSINESS.emailSuporte} href={`mailto:${BUSINESS.emailSuporte}`} />
          <ContatoTile icon={Clock} label="Atendimento" valor={BUSINESS.horarioAtelie} />
          <ContatoTile
            icon={MapPin}
            label="Endereço"
            valor={`${BUSINESS.enderecoAtelieRua} · ${BUSINESS.cidadeAtelie}/${BUSINESS.ufAtelie} · ${BUSINESS.enderecoAtelieCep}`}
            className="sm:col-span-2"
          />
        </div>
        {/* Fundo claro: a ação primária é verde. */}
        <a
          href={waUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-primary mt-6 w-full !no-underline sm:w-auto"
        >
          <MessageCircle className="h-5 w-5" strokeWidth={1.75} /> Abrir chamado no WhatsApp
        </a>
      </div>

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

      <FechamentoLegal
        titulo="Precisa abrir um chamado?"
        apoio="Registre avarias com fotos em até 24h. O pós-venda Western resolve pelo WhatsApp."
        waHref={waUrl}
        waLabel="Abrir chamado no WhatsApp"
      />
    </LegalPage>
  );
}
