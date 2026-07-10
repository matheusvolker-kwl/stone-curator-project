import LegalPage from "@/components/legal/LegalPage";
import { BUSINESS } from "@/config/business";

export default function PoliticaEntrega() {
  return (
    <LegalPage eyebrow="Política de entrega" titulo="Como o pedido sai do ateliê." atualizadoEm="maio de 2026" seoPath="/politica-de-entrega" seoTitle="Política de entrega — Western" seoDescription="Retirada no ateliê ou envio por transportadora, embalagem, conferência e prazo de coleta da Western.">
      <p>
        A Western trabalha com retirada no ateliê em {BUSINESS.cidadeAtelie}/{BUSINESS.ufAtelie}{" "}
        ou envio por transportadora contratada pelo parceiro. Não temos frota própria.
      </p>

      <h2>Modalidades</h2>
      <ul>
        <li>
          <strong>Retirada no ateliê.</strong> Sem custo. Agendamento prévio obrigatório, em
          horário comercial ({BUSINESS.horarioAtelie}).
        </li>
        <li>
          <strong>Transportadora indicada pelo parceiro.</strong> O frete é contratado e pago
          diretamente à transportadora. A Western prepara a embalagem e libera a coleta.
        </li>
        <li>
          <strong>Cotação assistida.</strong> Mediante solicitação, indicamos transportadoras de
          confiança e ajudamos a cotar — sem repasse de margem.
        </li>
      </ul>

      <h2>Embalagem e proteção</h2>
      <p>
        Cada peça é embalada individualmente em filme stretch, papelão estruturado e cantoneiras
        de proteção. Cascatas e peças grandes recebem pallet dedicado com cintas.
      </p>

      <h2>Conferência no recebimento</h2>
      <p>
        O parceiro deve conferir as peças no ato da entrega, na presença do motorista, e
        registrar qualquer avaria visível no canhoto da nota. Avarias não registradas no momento
        da entrega não podem ser pleiteadas posteriormente.
      </p>

      <h2>Prazo de coleta</h2>
      <p>
        Após a conclusão da produção, o pedido fica disponível para coleta em até 5 dias úteis.
        Após esse período, eventual armazenagem prolongada poderá ser cobrada.
      </p>
    </LegalPage>
  );
}
