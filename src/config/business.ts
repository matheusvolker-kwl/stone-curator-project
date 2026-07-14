// Constantes de regra de negócio. Fonte única de verdade.
// Qualquer mudança aqui se reflete em todo o site.

export const BUSINESS = {
  // ── PEDIDO MÍNIMO — FONTE ÚNICA DA VERDADE ──────────────────────────────
  // Regra: pedido mínimo por nota no catálogo B2B (preço de parceiro).
  // Única exceção: a Western Box de amostras, que é aberta a todos — sem
  // cadastro B2B e sem mínimo (ver src/pages/WesternBox.tsx).
  //
  // NUNCA escreva "R$ 700" na mão em página, texto ou componente: leia daqui.
  // Mudar o valor = trocar estes dois campos. ABOLIR o mínimo = trocar aqui
  // (pedidoMinimoBRL: 0) e o site inteiro acompanha. Se você se pegar
  // editando a frase do mínimo em dois arquivos, o bug é este comentário
  // não ter sido lido.
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
  horarioAtelie: "Seg–Sex · 9h–17h · Retirada até 16h",

  // Empresa
  fundadaEm: 1993,
  anosOperacao: 2026 - 1993,

  // Contato
  whatsappFabrica: "5511958967088",
  whatsappLabel: "+55 11 95896-7088",
  emailComercial: "comercial@westernpools.com.br",
  emailSuporte: "suporte@westernpools.com.br",
  emailNewsletter: "contato@westernpools.com.br",
  razaoSocial: "Western Pools - Cascatas e Pedras Artesanais LTDA",
  // CNPJ confirmado (mesmo usado no checkout Woo)
  cnpj: "10.465.584/0001-24",

  // Pagamento — política em definição. Não exibir condições no site por enquanto.

  // Acabamentos
  acabamentos: ["Quartzo", "Arenito", "Moledo", "Granito"] as const,
  acabamentoDefault: "Moledo",

  // Canais
  sketchupWarehouse: "https://3dwarehouse.sketchup.com/by/WesternPools",
} as const;
