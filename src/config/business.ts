// Constantes de regra de negócio. Fonte única de verdade.
// Qualquer mudança aqui se reflete em todo o site.

export const BUSINESS = {
  // Pedido mínimo B2B (em BRL)
  pedidoMinimoBRL: 700,
  pedidoMinimoLabel: "R$ 700",

  // Prazo de produção
  prazoProducaoDias: 15,
  prazoProducaoLabel: "15 dias úteis após confirmação do pedido",

  // Garantia
  garantiaAnos: 1,
  garantiaLabel: "1 ano",




  // Localização — ateliê em Cajamar/SP (Grande São Paulo)
  cidadeAtelie: "Cajamar",
  ufAtelie: "SP",
  enderecoAtelieRua: "Rua Colina, 38 — Jardim Paraíso",
  enderecoAtelieCep: "07794-075",
  enderecoAtelieCompleto: "Rua Colina, 38 — Jardim Paraíso · Cajamar/SP · 07794-075",
  horarioAtelie: "Seg–Sex · 9h às 17h",

  // Empresa
  fundadaEm: 1993,
  anosOperacao: 2026 - 1993,

  // Contato
  whatsappFabrica: "5511958967088",
  whatsappLabel: "+55 11 95896-7088",
  emailComercial: "comercial@westernpools.com.br",
  emailSuporte: "suporte@westernpools.com.br",
  emailNewsletter: "contato@westernpools.com.br",
  // TODO confirmar CNPJ real com Western — vazio = não exibir
  cnpj: "",

  // Pagamento — política em definição. Não exibir condições no site por enquanto.

  // Acabamentos
  acabamentos: ["Quartzo", "Arenito", "Moledo", "Granito"] as const,
  acabamentoDefault: "Moledo",

  // Canais
  sketchupWarehouse: "https://3dwarehouse.sketchup.com/by/WesternPools",
} as const;
