import { supabase } from "@/integrations/supabase/client";

export interface FreteOpcao {
  id: string;
  transportadora: string;
  valor: number;
  prazo_min_dias: number;
  prazo_max_dias: number;
}

export interface CalcFreteResponse {
  opcoes: FreteOpcao[];
  erro: null | "sem_cobertura" | "api_indisponivel" | "cep_invalido" | "sku_nao_encontrado";
}

export async function calcFrete(args: {
  cep_destino: string;
  total: number;
  items: Array<{ sku: string; quantidade: number }>;
}): Promise<CalcFreteResponse> {
  const { data, error } = await supabase.functions.invoke("yampi-calc-frete", { body: args });
  if (error) {
    return { opcoes: [], erro: "api_indisponivel" };
  }
  return data as CalcFreteResponse;
}

export interface CriarCheckoutResponse {
  checkout_url?: string;
  payment_link_id?: number | string;
  erro?: "abaixo_minimo" | "sku_nao_encontrado" | "yampi_indisponivel" | "items_vazio";
  subtotal?: number;
  minimo?: number;
  sku?: string;
}

export async function criarCheckout(args: {
  items: Array<{ sku: string; quantidade: number; preco_unitario: number }>;
  tracking?: Record<string, string>;
}): Promise<CriarCheckoutResponse> {
  const { data, error } = await supabase.functions.invoke("yampi-criar-checkout", { body: args });
  if (error) {
    // supabase.functions.invoke returns error for non-2xx; try to parse body
    const ctx = (error as any)?.context;
    if (ctx && typeof ctx.json === "function") {
      try {
        const j = await ctx.json();
        return j as CriarCheckoutResponse;
      } catch {
        /* ignore */
      }
    }
    return { erro: "yampi_indisponivel" };
  }
  return data as CriarCheckoutResponse;
}
