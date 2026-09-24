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
  garantiaAnos: 5,
  garantiaLabel: "5 anos",




  // Localização — ateliê em Cajamar/SP (Grande São Paulo)
  cidadeAtelie: "Cajamar",
  ufAtelie: "SP",
  enderecoAtelieRua: "Rua Colina, 38 — Jardim Paraíso",
  enderecoAtelieCep: "07794-075",
  enderecoAtelieCompleto: "Rua Colina, 38 — Jardim Paraíso · Cajamar/SP · 07794-075",
  horarioAtelie: "Seg–Sex · 9h–17h · Retirada até 16h",

  // Empresa
  fundadaEm: 1993,
  // Calculado, NUNCA cravado: com "2026 - 1993" o site inteiro passava a mentir
  // em 1º de janeiro ("33 anos" quando já seriam 34). Quem escrever a idade do
  // ateliê em texto novo usa BUSINESS.anosOperacao — não digite o número.
  anosOperacao: new Date().getFullYear() - 1993,

  // Contato — oficial (decisão do dono, 2026-08-14): (11) 99340-3487 é o
  // telefone/WhatsApp oficial da Western Store E do Una.
  // whatsappFabrica alimenta TODOS os botões de WhatsApp do site.
  whatsappFabrica: "5511993403487",
  whatsappLabel: "(11) 99340-3487",
  emailComercial: "atendimento@westernstore.com.br",
  emailSuporte: "atendimento@westernstore.com.br",
  emailNewsletter: "contato@westernpools.com.br",
  // ── ENTIDADE QUE ASSINA O SITE ──────────────────────────────────────────
  // Trocada em 09/09/2026 por orientação jurídica: quem responde pela loja
  // passa a ser a INDÚSTRIA. Razão social e CNPJ andam juntos — nunca troque
  // um sem o outro, senão o rodapé passa a atribuir o CNPJ de uma empresa ao
  // nome de outra. O endereço abaixo (Rua Colina, 38) já é o desta inscrição.
  // ANTES (não reintroduzir): "Western Pools - Cascatas e Pedras Artesanais
  // LTDA" · CNPJ 10.465.584/0001-24 — aquela empresa continua ativa e assina
  // a proposta de obra B2C no HUB, mas não assina mais nada no site.
  razaoSocial: "Western Pools Indústria e Comércio de Artefatos de Cimentos LTDA",
  cnpj: "71.530.059/0001-30",

  // ── PAGAMENTO — o que o checkout (Asaas) oferece a TODO parceiro ──────────
  // Pix, boleto ou cartão de crédito em até 3× SEM JUROS, igual para qualquer
  // nível (dono, 2026-09-24; no plugin da Asaas: parcelas 3, juros 0 em 1×,
  // 2× e 3×). Nível não muda forma de pagamento nem parcelamento: o checkout
  // não lê o nível. Boleto é à vista para todos; boleto PARCELADO é concessão
  // do dono cliente a cliente, com as condições dele — não se anuncia no site.
  // (dono, 2026-09-15: "À vista" na conta do parceiro não era estratégico nem
  // verdade — qualquer parceiro paga no cartão.)
  // Mudou o parcelamento? Troque SÓ estes campos: o texto sai de
  // `parcelamentoCartao`, abaixo, em todas as telas.
  processadorPagamento: "Asaas",
  formasPagamentoLabel: "Pix, boleto ou cartão",
  parcelasCartaoMax: 3,
  parcelasSemJuros: true,

  // Acabamentos
  acabamentos: ["Quartzo", "Arenito", "Moledo", "Granito"] as const,
  acabamentoDefault: "Moledo",

  // Canais
  sketchupWarehouse: "https://3dwarehouse.sketchup.com/by/WesternPools",
} as const;

/** "em até 3× sem juros" — derivado dos campos de pagamento acima. Nunca escreva o número à mão. */
export const parcelamentoCartao = `em até ${BUSINESS.parcelasCartaoMax}×${
  BUSINESS.parcelasSemJuros ? " sem juros" : ""
}`;
