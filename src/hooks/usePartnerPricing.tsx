import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import type { Tier } from "@/components/admin/adminUtils";
import { unitarioComDesconto } from "@/lib/precoParceiro";

interface TierDefault {
  tier: Tier;
  discount_pct: number;
  boleto: boolean;
  parcelas_max: number;
  kit_gratis: boolean;
}

interface PartnerPricing {
  tier: Tier;
  discountPct: number;          // % a aplicar (override OU default do tier)
  paymentMethods: { boleto: boolean; parcelas_max: number; kit_gratis: boolean };
  loading: boolean;
}

/**
 * Espelho local de tier_defaults — so serve de fallback se a consulta falhar.
 * A verdade e a tabela public.tier_defaults (padrao 0% / vitrine 5% / partner 10%).
 */
const DEFAULTS: Record<Tier, TierDefault> = {
  padrao:  { tier: "padrao",  discount_pct: 0,  boleto: false, parcelas_max: 1, kit_gratis: false },
  vitrine: { tier: "vitrine", discount_pct: 5,  boleto: true,  parcelas_max: 4, kit_gratis: true },
  partner: { tier: "partner", discount_pct: 10, boleto: true,  parcelas_max: 6, kit_gratis: true },
};

const CONVIDADO: PartnerPricing = {
  tier: "padrao",
  discountPct: 0,
  paymentMethods: { boleto: false, parcelas_max: 1, kit_gratis: false },
  loading: false,
};

/* ══════════════════════════════════════════════════════════════════════════
 * CACHE COMPARTILHADO — POR QUE ELE EXISTE
 *
 * GatedPrice chama este hook, e GatedPrice aparece uma vez por PRODUTO
 * (ProductCard, AutoralCard, ComposicaoCard, PecaRow). Sem cache, uma pagina
 * de catalogo com 40 pecas disparava 80 consultas ao Supabase — duas por card,
 * todas pedindo exatamente a mesma coisa. Cada card ficava mostrando o preco
 * cheio ate a resposta dele chegar, e o preco do parceiro entrava aos poucos,
 * card a card. Era a demora que o dono relatou em 28/08/2026.
 *
 * Agora a busca acontece UMA vez por usuario. Quem monta depois le o valor ja
 * resolvido de forma sincrona, sem piscar o preco cheio.
 *
 * O cache vive enquanto a aba estiver aberta. Mudanca de nivel feita no painel
 * so aparece para o parceiro apos recarregar a pagina — aceitavel, porque o
 * cupom do checkout e resolvido no servidor a cada hand-off.
 * ══════════════════════════════════════════════════════════════════════════ */

let cacheUserId: string | null = null;
let cacheValor: PartnerPricing | null = null;
let cachePromessa: Promise<PartnerPricing> | null = null;

async function buscarPricing(userId: string): Promise<PartnerPricing> {
  try {
    const [{ data: profile }, { data: defs }] = await Promise.all([
      supabase
        .from("partner_profiles")
        .select("tier, discount_override, payment_methods")
        .eq("user_id", userId)
        .maybeSingle(),
      supabase.from("tier_defaults").select("*"),
    ]);
    const tier: Tier = (profile?.tier as Tier) ?? "padrao";
    const def = defs?.find((d) => d.tier === tier) ?? DEFAULTS[tier];
    const override = profile?.discount_override;
    const discount = typeof override === "number" ? override : def.discount_pct;
    const pm = (profile?.payment_methods as { boleto?: boolean; parcelas_max?: number; kit_gratis?: boolean } | null) ?? {};
    return {
      tier,
      discountPct: discount,
      paymentMethods: {
        boleto: pm.boleto ?? def.boleto,
        parcelas_max: pm.parcelas_max ?? def.parcelas_max,
        kit_gratis: pm.kit_gratis ?? def.kit_gratis,
      },
      loading: false,
    };
  } catch {
    /* Oscilação de rede ou 5xx do Supabase deixava `loading` em true para
     * sempre — o parceiro aprovado ficava preso no skeleton de preço, sem
     * erro na tela. Cai nos defaults do tier e libera a UI. */
    return { ...CONVIDADO };
  }
}

/** Uma busca por usuário. Chamadas simultâneas compartilham a mesma promessa. */
function obterPricing(userId: string): Promise<PartnerPricing> {
  if (cacheUserId !== userId) {
    cacheUserId = userId;
    cacheValor = null;
    cachePromessa = null;
  }
  if (cacheValor) return Promise.resolve(cacheValor);
  if (!cachePromessa) {
    cachePromessa = buscarPricing(userId).then((v) => {
      cacheValor = v;
      return v;
    });
  }
  return cachePromessa;
}

/** Descarta o cache — use após mudar o nível de um parceiro no painel. */
export function invalidarPartnerPricing() {
  cacheUserId = null;
  cacheValor = null;
  cachePromessa = null;
}

export function usePartnerPricing(): PartnerPricing {
  const { user, isApproved } = useAuth();
  const habilitado = Boolean(user && isApproved);
  const uid = user?.id ?? null;

  // Se o valor deste usuário já está em cache, entra na tela com ele — sem
  // passar por `loading` e sem piscar o preço cheio antes do preço do parceiro.
  const [state, setState] = useState<PartnerPricing>(() => {
    if (!habilitado) return CONVIDADO;
    if (uid && cacheUserId === uid && cacheValor) return cacheValor;
    return { ...CONVIDADO, loading: true };
  });

  useEffect(() => {
    let cancelado = false;
    if (!habilitado || !uid) {
      setState(CONVIDADO);
      return;
    }
    if (cacheUserId === uid && cacheValor) {
      setState(cacheValor);
      return;
    }
    setState((s) => (s.loading ? s : { ...s, loading: true }));
    obterPricing(uid).then((v) => {
      if (!cancelado) setState(v);
    });
    return () => { cancelado = true; };
  }, [habilitado, uid]);

  return state;
}

/** Hook leve, retorna só o tier do parceiro. Reaproveita o mesmo cache. */
export function usePartnerTier(): { tier: Tier; loading: boolean } {
  const { tier, loading } = usePartnerPricing();
  return { tier, loading };
}

/** Aplica desconto sobre um valor numérico. Retorna { final, original, discountPct }. */
export function applyDiscount(amount: number, discountPct: number) {
  // Mesma aritmetica do WooCommerce (centavos inteiros, arredonda o desconto),
  // para a vitrine nunca mostrar um centavo diferente do que o checkout cobra.
  const final = unitarioComDesconto(amount, discountPct);
  return { final, original: amount, discountPct };
}
