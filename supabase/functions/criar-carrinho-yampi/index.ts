// Edge function: cria carrinho Yampi e devolve URL de checkout transparente
import { corsHeaders } from "https://esm.sh/@supabase/supabase-js@2.95.0/cors";

interface ItemIn {
  sku: string;
  quantidade: number;
  valor_unitario?: number;
}
interface Body {
  items: ItemIn[];
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
}

const PEDIDO_MINIMO = 2000;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const body = (await req.json()) as Body;
    if (!Array.isArray(body.items) || body.items.length === 0) {
      return json({ erro: "carrinho_vazio" }, 400);
    }
    const itensInvalidos = body.items.filter((i) => !i.sku || !i.quantidade);
    if (itensInvalidos.length > 0) {
      return json({ erro: "sku_ausente", detalhe: itensInvalidos }, 400);
    }

    // Validação pedido mínimo (defesa em profundidade)
    const subtotal = body.items.reduce(
      (s, i) => s + (Number(i.valor_unitario) || 0) * (Number(i.quantidade) || 0),
      0
    );
    if (subtotal > 0 && subtotal < PEDIDO_MINIMO) {
      return json({ erro: "abaixo_minimo", subtotal, minimo: PEDIDO_MINIMO }, 400);
    }

    const alias = Deno.env.get("YAMPI_ALIAS");
    const userToken = Deno.env.get("YAMPI_USER_TOKEN");
    const secretKey = Deno.env.get("YAMPI_SECRET_KEY");
    if (!alias || !userToken || !secretKey) {
      return json({ erro: "config_indisponivel" }, 500);
    }

    const payload = {
      items: body.items.map((i) => ({ sku: i.sku, quantity: Number(i.quantidade) })),
      tracking_data: {
        utm_source: body.utm_source ?? "site_lovable",
        utm_medium: body.utm_medium ?? "carrinho",
        utm_campaign: body.utm_campaign ?? "headless",
      },
    };

    const url = `https://api.dooki.com.br/v2/${alias}/checkout/carts`;
    const resp = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Token": userToken,
        "User-Secret-Key": secretKey,
      },
      body: JSON.stringify(payload),
    });

    const data = await resp.json().catch(() => null);
    if (!resp.ok) {
      console.error("yampi_error", resp.status, data);
      // Yampi costuma devolver erros de SKU em data.errors
      const skuErr = JSON.stringify(data ?? {}).match(/sku/i);
      return json(
        {
          erro: skuErr ? "sku_invalido" : "yampi_error",
          status: resp.status,
          detalhe: data,
        },
        400
      );
    }

    const cart = data?.data ?? data;
    const checkoutUrl: string | undefined =
      cart?.simulate_url ?? cart?.unauth_simulate_url ?? cart?.checkout_url;
    if (!checkoutUrl) {
      console.error("yampi_no_checkout_url", data);
      return json({ erro: "checkout_url_ausente", detalhe: data }, 502);
    }

    return json({ checkout_url: checkoutUrl, cart_id: cart?.id ?? null }, 200);
  } catch (e) {
    console.error("criar-carrinho-yampi unhandled", e);
    return json({ erro: "internal_error" }, 500);
  }
});

function json(body: unknown, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
