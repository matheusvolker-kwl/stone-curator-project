// Constantes de regra de negócio. Fonte única de verdade.
// Qualquer mudança aqui se reflete em todo o site.

export const BUSINESS = {
  // Pedido mínimo B2B (em BRL)
  pedidoMinimoBRL: 2000,
  pedidoMinimoLabel: "R$ 2.000",

  // Prazo de produção
  prazoProducaoDias: 15,
  prazoProducaoLabel: "15 dias úteis após confirmação de pagamento",

  // Garantia
  garantiaAnos: 5,

  // Desconto em conjuntos pré-montados
  descontoConjuntosPercent: 3,

  // Localização — ateliê em Cajamar/SP
  cidadeAtelie: "Cajamar",
  ufAtelie: "SP",
  // TODO confirmar com Western: endereço completo e horário do ateliê
  enderecoAtelieCompleto: "Cajamar · SP",
  horarioAtelie: "Seg–Sex · 9h às 18h",

  // Contato
  whatsappFabrica: "5511993403485",
  whatsappLabel: "+55 11 99340-3485",
  emailComercial: "comercial@westernpools.com.br",
  emailNewsletter: "contato@westernpools.com.br",
  // TODO confirmar CNPJ real com Western — vazio = não exibir
  cnpj: "",

  // Pagamento aceito
  formasPagamento: ["PIX", "TED", "Boleto"] as const,
  formasPagamentoLabel: "PIX, TED ou Boleto · pagamento 100% antecipado",

  // Acabamentos
  acabamentos: ["Quartzo", "Arenito", "Moledo", "Granito"] as const,
  acabamentoDefault: "Moledo",

  // Canais
  sketchupWarehouse: "https://3dwarehouse.sketchup.com/by/WesternPools",
} as const;
