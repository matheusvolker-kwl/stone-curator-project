// Edge function: cota frete via GoFretes e soma 15 dias úteis de produção
import { corsHeaders } from "https://esm.sh/@supabase/supabase-js@2.95.0/cors";

interface ItemIn {
  sku?: string;
  peso_kg?: number;
  comprimento_cm?: number;
  largura_cm?: number;
  altura_cm?: number;
  quantidade: number;
  valor_unitario: number;
}

interface Body {
  cep_destino: string;
  items: ItemIn[];
}

const DIAS_PRODUCAO = 15;
// Fallbacks conservadores caso metafields ainda não estejam preenchidos
const DEFAULT_PESO_KG = 30;
const DEFAULT_DIM_CM = 60;

function onlyDigits(s: string) {
  return (s ?? "").replace(/\D/g, "");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const body = (await req.json()) as Body;
    const cep = onlyDigits(body?.cep_destino ?? "");
    if (cep.length !== 8) {
      return json({ erro: "cep_invalido" }, 400);
    }
    if (!Array.isArray(body.items) || body.items.length === 0) {
      return json({ erro: "carrinho_vazio" }, 400);
    }

    const cepOrigem = onlyDigits(Deno.env.get("CEP_ORIGEM") ?? "");
    const token = Deno.env.get("GOFRETES_TOKEN");
    const apiBase = (Deno.env.get("GOFRETES_API_BASE") ?? "https://api.gofretes.com.br").replace(/\/$/, "");
    if (!cepOrigem || !token) {
      return json({ opcoes: [], erro: "config_indisponivel" }, 200);
    }

    // Agregação para cotação única
    let pesoTotal = 0;
    let valorTotal = 0;
    let maxC = 0, maxL = 0, maxA = 0;
    for (const it of body.items) {
      const q = Math.max(1, Number(it.quantidade ?? 1));
      pesoTotal += (Number(it.peso_kg) || DEFAULT_PESO_KG) * q;
      valorTotal += (Number(it.valor_unitario) || 0) * q;
      maxC = Math.max(maxC, Number(it.comprimento_cm) || DEFAULT_DIM_CM);
      maxL = Math.max(maxL, Number(it.largura_cm) || DEFAULT_DIM_CM);
      maxA = Math.max(maxA, Number(it.altura_cm) || DEFAULT_DIM_CM);
    }

    const payload = {
      cep_origem: cepOrigem,
      cep_destino: cep,
      valor_declarado: Number(valorTotal.toFixed(2)),
      volumes: [
        {
          peso: Number(pesoTotal.toFixed(3)),
          comprimento: maxC,
          largura: maxL,
          altura: maxA,
          quantidade: 1,
        },
      ],
    };

    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 12_000);
    let resp: Response;
    try {
      resp = await fetch(`${apiBase}/cotacoes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
        signal: ctrl.signal,
      });
    } catch (e) {
      console.error("gofretes_fetch_error", e);
      return json({ opcoes: [], erro: "api_indisponivel" }, 200);
    } finally {
      clearTimeout(timer);
    }

    if (!resp.ok) {
      const txt = await resp.text().catch(() => "");
      console.error("gofretes_http_error", resp.status, txt);
      if (resp.status === 422 || /cobertura/i.test(txt)) {
        return json({ opcoes: [], erro: "sem_cobertura" }, 200);
      }
      return json({ opcoes: [], erro: "api_indisponivel" }, 200);
    }

    const data = await resp.json().catch(() => null);
    // Tenta normalizar diferentes formatos comuns: { cotacoes: [...] } | { data: [...] } | array direto
    const lista: Array<Record<string, unknown>> = Array.isArray(data)
      ? data
      : (data?.cotacoes ?? data?.data ?? data?.opcoes ?? []) as Array<Record<string, unknown>>;

    if (!Array.isArray(lista) || lista.length === 0) {
      return json({ opcoes: [], erro: "sem_cobertura" }, 200);
    }

    const opcoes = lista
      .map((r) => {
        const transportadora =
          (r.transportadora as string) ||
          (r.nome as string) ||
          ((r.servico as Record<string, unknown> | undefined)?.nome as string) ||
          "Transportadora";
        const valor = Number(r.valor ?? r.preco ?? r.price ?? 0);
        const prazoMin = Number(r.prazo_min ?? r.prazo_minimo ?? r.prazo ?? 0);
        const prazoMax = Number(r.prazo_max ?? r.prazo_maximo ?? r.prazo ?? prazoMin);
        return {
          transportadora,
          valor,
          prazo_min_dias: prazoMin + DIAS_PRODUCAO,
          prazo_max_dias: prazoMax + DIAS_PRODUCAO,
        };
      })
      .filter((o) => o.valor > 0)
      .sort((a, b) => a.valor - b.valor);

    if (opcoes.length === 0) {
      return json({ opcoes: [], erro: "sem_cobertura" }, 200);
    }

    return json({ opcoes, erro: null }, 200);
  } catch (e) {
    console.error("calc-frete unhandled", e);
    return json({ opcoes: [], erro: "api_indisponivel" }, 200);
  }
});

function json(body: unknown, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
