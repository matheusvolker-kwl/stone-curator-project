// Internal debug page: side-by-side Shopify vs WooCommerce adapted JSON.
// NOT linked from the menu. Mount at /__woo-debug to validate Etapa 2.

import { useState } from "react";
import * as shopify from "@/lib/catalog/queries";
import * as woo from "@/lib/woocommerce/queries";

type Source = "shopify" | "woo";

const ACTIONS = [
  { id: "collections", label: "fetchCollections(20)" },
  { id: "products", label: "fetchProducts(50)" },
  { id: "collection", label: "fetchCollection(handle)" },
  { id: "product", label: "fetchProduct(handle)" },
] as const;

type ActionId = (typeof ACTIONS)[number]["id"];

async function run(source: Source, action: ActionId, handle: string) {
  const mod = source === "shopify" ? shopify : woo;
  switch (action) {
    case "collections":
      return await mod.fetchCollections(20);
    case "products":
      return await mod.fetchProducts(50);
    case "collection":
      return await mod.fetchCollection(handle, 50);
    case "product":
      return await mod.fetchProduct(handle);
  }
}

function Panel({
  source,
  action,
  handle,
}: {
  source: Source;
  action: ActionId;
  handle: string;
}) {
  const [data, setData] = useState<unknown>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [ms, setMs] = useState<number | null>(null);

  async function go() {
    setLoading(true);
    setErr(null);
    setData(null);
    setMs(null);
    const t0 = performance.now();
    try {
      const res = await run(source, action, handle);
      setData(res);
      setMs(Math.round(performance.now() - t0));
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
      setMs(Math.round(performance.now() - t0));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="border rounded p-3 bg-white/50 min-h-[400px]">
      <div className="flex items-center justify-between mb-2">
        <h2 className="font-semibold uppercase text-xs tracking-wide">
          {source}
        </h2>
        <button
          onClick={go}
          disabled={loading}
          className="text-xs px-2 py-1 border rounded hover:bg-gray-100 disabled:opacity-50"
        >
          {loading ? "..." : "run"}
        </button>
      </div>
      <div className="text-[10px] text-gray-500 mb-2">
        {ms !== null ? `${ms} ms` : ""}
        {err ? <span className="text-red-600 ml-2">{err}</span> : null}
      </div>
      <pre className="text-[10px] leading-tight overflow-auto max-h-[70vh] bg-gray-900 text-green-200 p-2 rounded">
        {data ? JSON.stringify(data, null, 2) : "—"}
      </pre>
    </div>
  );
}

export default function WooDebug() {
  const [action, setAction] = useState<ActionId>("products");
  const [handle, setHandle] = useState("");

  return (
    <div className="min-h-screen p-4 max-w-[1600px] mx-auto">
      <div className="mb-4">
        <h1 className="text-lg font-bold">Woo ↔ Shopify debug</h1>
        <p className="text-xs text-gray-500">
          Não está linkado em lugar nenhum. Só para validar a Etapa 2. A flag
          VITE_DATA_SOURCE segue em "shopify" para o resto do app.
        </p>
      </div>
      <div className="flex gap-2 items-center mb-4 flex-wrap">
        <select
          value={action}
          onChange={(e) => setAction(e.target.value as ActionId)}
          className="border px-2 py-1 rounded text-sm"
        >
          {ACTIONS.map((a) => (
            <option key={a.id} value={a.id}>
              {a.label}
            </option>
          ))}
        </select>
        {(action === "collection" || action === "product") && (
          <input
            value={handle}
            onChange={(e) => setHandle(e.target.value)}
            placeholder="handle (slug)"
            className="border px-2 py-1 rounded text-sm flex-1 min-w-[200px]"
          />
        )}
        <span className="text-[10px] text-gray-500">
          Rode os dois botões e compare o JSON.
        </span>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <Panel source="shopify" action={action} handle={handle} />
        <Panel source="woo" action={action} handle={handle} />
      </div>
    </div>
  );
}
