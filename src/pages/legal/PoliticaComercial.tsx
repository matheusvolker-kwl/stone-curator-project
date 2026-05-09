import LegalPage from "@/components/legal/LegalPage";
import { BUSINESS } from "@/config/business";

export default function PoliticaComercial() {
  return (
    <LegalPage eyebrow="Política comercial" titulo="Como compramos e vendemos." atualizadoEm="maio de 2026">
      <p>
        A Western Pools opera exclusivamente no canal B2B, atendendo arquitetos, paisagistas,
        construtoras, garden centers e revendas qualificadas com CNPJ ativo. O acesso a tabela
        de preços, condições e modelos 3D ocorre após credenciamento.
      </p>

      <h2>Pedido mínimo</h2>
      <p>
        Pedido mínimo por nota: <strong>{BUSINESS.pedidoMinimoLabel}</strong>. Esse valor é
        consistente em todo o site, em todo o catálogo e em todas as condições comerciais.
      </p>

      <h2>Pagamento</h2>
      <p>
        {BUSINESS.formasPagamentoLabel}. A produção é programada apenas após confirmação do
        pagamento.
      </p>

      <h2>Prazo de produção</h2>
      <p>
        {BUSINESS.prazoProducaoLabel}. Conjuntos personalizados (tonalidade ou volume fora do
        padrão) podem ter prazo estendido — informamos por escrito antes da confirmação.
      </p>

      <h2>Conjuntos pré-montados</h2>
      <p>
        Compras de conjuntos pré-montados do catálogo recebem desconto de
        <strong> {BUSINESS.descontoConjuntosPercent}%</strong> sobre a soma das peças avulsas
        equivalentes.
      </p>

      <h2>Pintura personalizada</h2>
      <p>
        Tonalidades adaptadas a um ambiente específico são oferecidas como serviço sob demanda,
        com orçamento por projeto. Pedidos personalizados não são passíveis de troca por
        diferença de gosto após aprovação da prova.
      </p>

      <h2>Cancelamento</h2>
      <p>
        Pedidos podem ser cancelados sem ônus em até 24h após a confirmação. Após o início da
        produção, o cancelamento implica retenção proporcional ao estágio executado.
      </p>
    </LegalPage>
  );
}
