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

export function usePartnerPricing(): PartnerPricing {
  const { user, isApproved } = useAuth();
  const [state, setState] = useState<PartnerPricing>({
    tier: "padrao",
    discountPct: 0,
    paymentMethods: { boleto: false, parcelas_max: 1, kit_gratis: false },
    loading: true,
  });

  useEffect(() => {
    let cancelled = false;
    if (!user || !isApproved) {
      setState({ tier: "padrao", discountPct: 0, paymentMethods: { boleto: false, parcelas_max: 1, kit_gratis: false }, loading: false });
      return;
    }
    (async () => {
      try {
      const [{ data: profile }, { data: defs }] = await Promise.all([
        supabase
          .from("partner_profiles")
          .select("tier, discount_override, payment_methods")
          .eq("user_id", user.id)
          .maybeSingle(),
        supabase.from("tier_defaults").select("*"),
      ]);
      const tier: Tier = (profile?.tier as Tier) ?? "padrao";
      const def = defs?.find((d) => d.tier === tier) ?? DEFAULTS[tier];
      const override = profile?.discount_override;
      const discount = typeof override === "number" ? override : def.discount_pct;
      const pm = (profile?.payment_methods as { boleto?: boolean; parcelas_max?: number; kit_gratis?: boolean } | null) ?? {};
      if (!cancelled) {
        setState({
          tier,
          discountPct: discount,
          paymentMethods: {
            boleto: pm.boleto ?? def.boleto,
            parcelas_max: pm.parcelas_max ?? def.parcelas_max,
            kit_gratis: pm.kit_gratis ?? def.kit_gratis,
          },
          loading: false,
        });
      }
      } catch {
        /* Oscilação de rede ou 5xx do Supabase deixava `loading` em true para
         * sempre — o parceiro aprovado ficava preso no skeleton de preço, sem
         * erro na tela. Cai nos defaults do tier e libera a UI. */
        if (!cancelled) setState((s) => ({ ...s, loading: false }));
      }
    })();
    return () => { cancelled = true; };
  }, [user, isApproved]);

  return state;
}

/** Hook leve, retorna só o tier do parceiro (sem buscar defaults). */
export function usePartnerTier(): { tier: Tier; loading: boolean } {
  const { user, isApproved } = useAuth();
  const [tier, setTier] = useState<Tier>("padrao");
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (!user || !isApproved) { setTier("padrao"); setLoading(false); return; }
    supabase
      .from("partner_profiles")
      .select("tier")
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data }) => { setTier((data?.tier as Tier) ?? "padrao"); setLoading(false); });
  }, [user, isApproved]);
  return { tier, loading };
}

/** Aplica desconto sobre um valor numérico. Retorna { final, original, discountPct }. */
export function applyDiscount(amount: number, discountPct: number) {
  // Mesma aritmetica do WooCommerce (centavos inteiros, arredonda o desconto),
  // para a vitrine nunca mostrar um centavo diferente do que o checkout cobra.
  const final = unitarioComDesconto(amount, discountPct);
  return { final, original: amount, discountPct };
}
