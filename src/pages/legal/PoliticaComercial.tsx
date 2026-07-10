import LegalPage from "@/components/legal/LegalPage";
import { BUSINESS } from "@/config/business";

export default function PoliticaComercial() {
  return (
    <LegalPage eyebrow="Política comercial" titulo="Como compramos e vendemos." atualizadoEm="maio de 2026" seoPath="/politica-comercial" seoTitle="Política comercial — Western" seoDescription="Regras B2B da Western: pedido mínimo, condições de pagamento, credenciamento e catálogo profissional.">
      <p>
        O catálogo Western Pools com preço de atacado opera no canal B2B, atendendo profissionais
        e empresas do paisagismo e da construção com CNPJ ativo — de arquitetos e paisagistas a
        laguistas, jardineiros, garden centers, lojas e construtoras. O acesso à tabela de preços,
        condições e modelos 3D ocorre após credenciamento. A Western Box de amostras é a única
        exceção: aberta também a clientes finais, sem cadastro B2B.
      </p>

      <h2>Pedido mínimo</h2>
      <p>
        Pedido mínimo por nota: <strong>{BUSINESS.pedidoMinimoLabel}</strong>. Aplica-se a todo
        o catálogo, independentemente da linha ou condição comercial.
      </p>
      <p>
        <strong>Exceção:</strong> a Western Box de amostras é aberta a parceiros e clientes
        finais e não está sujeita ao pedido mínimo nem ao cadastro B2B.
      </p>

      <h2>Pagamento</h2>
      <p>
        Condições de pagamento são definidas caso a caso e informadas ao parceiro durante a
        negociação comercial.
      </p>

      <h2>Prazo de produção</h2>
      <p>
        {BUSINESS.prazoProducaoLabel}. Conjuntos personalizados (tonalidade ou volume fora do
        padrão) podem ter prazo estendido — informamos por escrito antes da confirmação.
      </p>

      <h2>Conjuntos pré-montados</h2>
      <p>
        Conjuntos pré-montados do catálogo são a soma pura das peças que os compõem — sem
        acréscimo e sem desconto sobre a especificação avulsa equivalente.
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
