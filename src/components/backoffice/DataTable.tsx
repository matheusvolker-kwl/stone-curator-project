import { useMemo, useState } from "react";
import { ArrowDown, ArrowUp, ChevronsUpDown, X } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { EstadoCarregando, EstadoErro, EstadoVazio } from "./Estados";

/**
 * A ÚNICA tabela do backoffice (admin E conta do parceiro).
 *
 *   <DataTable
 *     linhas={parceiros}
 *     getId={(p) => p.id}
 *     colunas={[
 *       { key: "empresa", header: "Empresa", render: (p) => p.empresa ?? "—", sortable: true },
 *       { key: "cnpj",    header: "CNPJ",    render: (p) => p.cnpj ?? "—", numerica: true },
 *       { key: "status",  header: "Status",  render: (p) => <StatusBadge status={p.status} /> },
 *       { key: "criado",  header: "Entrou",  render: (p) => <CelulaData valor={p.created_at} />,
 *         align: "right", sortable: true, sortValue: (p) => p.created_at },
 *     ]}
 *     isLoading={carregando}
 *     error={erro}
 *     onRetry={carregar}
 *     onRowClick={(p) => navigate(`/admin/parceiros/${p.id}`)}
 *     vazio={{ titulo: "Nenhum parceiro pendente", mensagem: "Quando alguém se credenciar, aparece aqui." }}
 *   />
 *
 * Seleção + ações em massa (opcional):
 *   selecao={{
 *     selecionados,                       // Set<string>
 *     onChange: setSelecionados,
 *     barra: (ids) => <button className="btn-primary" onClick={() => aprovar(ids)}>Aprovar {ids.length}</button>,
 *   }}
 *
 * ── OS 4 ESTADOS SÃO OBRIGATÓRIOS E A PRECEDÊNCIA É PROPOSITAL ──
 *   error → EstadoErro   (SEMPRE ganha; um erro NUNCA vira "lista vazia")
 *   isLoading → skeleton
 *   linhas vazias → EstadoVazio
 *   senão → a tabela
 * Passe SEMPRE o `error` da query. Se você engolir o erro lá em cima
 * (`const { data } = await supabase…`), esta tabela não tem como te salvar:
 * ela vai mostrar "vazio" e o dono fica cego. Use `const { data, error }`.
 *
 * No mobile (<768px) a tabela vira lista de CARDS — tabela densa não funciona
 * em 375px. É CSS puro (sem JS), então não pisca no primeiro render.
 */

export interface Coluna<T> {
  key: string;
  header: string;
  render: (row: T) => React.ReactNode;
  align?: "left" | "right";
  /** Ex.: "180px" ou "20%". */
  width?: string;
  sortable?: boolean;
  /** Valor bruto usado para ordenar. Sem isto, cai no `row[key]`. */
  sortValue?: (row: T) => string | number | null | undefined;
  /** R$/CNPJ/%/quantidade → tabular-nums. `align: "right"` já ativa sozinho. */
  numerica?: boolean;
  /** Não aparece no card do mobile (colunas de apoio). */
  ocultarNoMobile?: boolean;
  /** Vira o título do card no mobile. Marque UMA. */
  principalNoMobile?: boolean;
}

export interface SelecaoConfig {
  selecionados: Set<string>;
  onChange: (ids: Set<string>) => void;
  /** Barra contextual que aparece quando há seleção. */
  barra?: (ids: string[]) => React.ReactNode;
}

interface Props<T> {
  linhas: T[];
  colunas: ReadonlyArray<Coluna<T>>;
  getId: (row: T) => string;

  /* Os 4 estados */
  isLoading?: boolean;
  error?: unknown;
  onRetry?: () => void;
  vazio?: { titulo: string; mensagem?: string; acao?: React.ReactNode };

  onRowClick?: (row: T) => void;
  selecao?: SelecaoConfig;
  className?: string;
}

type Direcao = "asc" | "desc";

function comparar(a: unknown, b: unknown): number {
  const aVazio = a === null || a === undefined || a === "";
  const bVazio = b === null || b === undefined || b === "";
  if (aVazio && bVazio) return 0;
  if (aVazio) return 1; // vazios sempre no fim
  if (bVazio) return -1;

  if (typeof a === "number" && typeof b === "number") return a - b;
  if (typeof a === "boolean" && typeof b === "boolean") return Number(a) - Number(b);

  return String(a).localeCompare(String(b), "pt-BR", { numeric: true, sensitivity: "base" });
}

export function DataTable<T>({
  linhas,
  colunas,
  getId,
  isLoading,
  error,
  onRetry,
  vazio,
  onRowClick,
  selecao,
  className,
}: Props<T>) {
  const [ordem, setOrdem] = useState<{ key: string; dir: Direcao } | null>(null);

  const linhasOrdenadas = useMemo(() => {
    if (!ordem) return linhas;
    const col = colunas.find((c) => c.key === ordem.key);
    if (!col) return linhas;

    // Sem `sortValue`, tenta o campo homônimo da linha.
    const valor =
      col.sortValue ?? ((row: T) => (row as Record<string, unknown>)[col.key] as string | number | null | undefined);

    return [...linhas].sort((a, b) => {
      const r = comparar(valor(a), valor(b));
      return ordem.dir === "asc" ? r : -r;
    });
  }, [linhas, colunas, ordem]);

  const alternarOrdem = (key: string) => {
    setOrdem((atual) =>
      atual?.key === key ? { key, dir: atual.dir === "asc" ? "desc" : "asc" } : { key, dir: "asc" },
    );
  };

  /* ── Estados. A ordem aqui é a invariante do backoffice. ── */
  if (error) return <EstadoErro erro={error} onRetry={onRetry} />;
  if (isLoading) return <EstadoCarregando />;
  if (!linhasOrdenadas.length) {
    return (
      <EstadoVazio
        titulo={vazio?.titulo ?? "Nada por aqui"}
        mensagem={vazio?.mensagem}
        acao={vazio?.acao}
      />
    );
  }

  /* ── Seleção ── */
  const ids = linhasOrdenadas.map(getId);
  const selecionados = selecao?.selecionados ?? new Set<string>();
  const idsSelecionados = ids.filter((id) => selecionados.has(id));
  const todosSelecionados = ids.length > 0 && idsSelecionados.length === ids.length;
  const algunsSelecionados = idsSelecionados.length > 0 && !todosSelecionados;

  const alternarTodos = () => {
    if (!selecao) return;
    selecao.onChange(todosSelecionados ? new Set() : new Set(ids));
  };

  const alternarUm = (id: string) => {
    if (!selecao) return;
    const proximo = new Set(selecao.selecionados);
    if (proximo.has(id)) proximo.delete(id);
    else proximo.add(id);
    selecao.onChange(proximo);
  };

  const clicavel = Boolean(onRowClick);
  const colunasMobile = colunas.filter((c) => !c.ocultarNoMobile);
  const colPrincipal = colunasMobile.find((c) => c.principalNoMobile) ?? colunasMobile[0];
  const colsSecundarias = colunasMobile.filter((c) => c.key !== colPrincipal?.key);

  return (
    <div className={cn("relative", className)}>
      {/* Barra contextual de ações em massa */}
      {selecao?.barra && idsSelecionados.length > 0 && (
        <div className="sticky top-0 z-20 mb-3 flex flex-wrap items-center gap-3 rounded-lg border border-western-cta/25 bg-western-cta/[0.06] px-4 py-3">
          <span className="text-[15px] font-semibold tabular-nums text-western-green-deep">
            {idsSelecionados.length} selecionado{idsSelecionados.length > 1 ? "s" : ""}
          </span>
          <div className="ml-auto flex flex-wrap items-center gap-2">
            {selecao.barra(idsSelecionados)}
            <button
              type="button"
              onClick={() => selecao.onChange(new Set())}
              className="tap-target inline-flex items-center gap-1 rounded-lg px-3 text-[15px] font-semibold text-western-stone-warm hover:text-western-green-deep transition-colors"
            >
              <X className="h-4 w-4" aria-hidden="true" />
              Limpar
            </button>
          </div>
        </div>
      )}

      {/* ───────── DESKTOP: tabela densa ───────── */}
      <div className="hidden md:block overflow-x-auto rounded-xl border border-western-border-soft bg-white">
        <table className="w-full border-collapse text-[15px]">
          <thead>
            <tr className="border-b border-western-border-strong bg-western-paper">
              {selecao && (
                <th scope="col" className="w-[48px] px-4 py-3 text-left">
                  <Checkbox
                    checked={todosSelecionados ? true : algunsSelecionados ? "indeterminate" : false}
                    onCheckedChange={alternarTodos}
                    aria-label="Selecionar todas as linhas"
                  />
                </th>
              )}

              {colunas.map((col) => {
                const ativa = ordem?.key === col.key;
                const alinhaDireita = col.align === "right";
                return (
                  <th
                    key={col.key}
                    scope="col"
                    style={col.width ? { width: col.width } : undefined}
                    aria-sort={ativa ? (ordem?.dir === "asc" ? "ascending" : "descending") : "none"}
                    className={cn(
                      "px-4 py-3 text-[14px] font-semibold uppercase tracking-[0.06em] text-western-bronze",
                      alinhaDireita ? "text-right" : "text-left",
                    )}
                  >
                    {col.sortable ? (
                      <button
                        type="button"
                        onClick={() => alternarOrdem(col.key)}
                        className={cn(
                          "inline-flex items-center gap-1.5 transition-colors hover:text-western-green-deep",
                          alinhaDireita && "flex-row-reverse",
                        )}
                      >
                        {col.header}
                        {ativa ? (
                          ordem?.dir === "asc" ? (
                            <ArrowUp className="h-3.5 w-3.5" aria-hidden="true" />
                          ) : (
                            <ArrowDown className="h-3.5 w-3.5" aria-hidden="true" />
                          )
                        ) : (
                          <ChevronsUpDown className="h-3.5 w-3.5 opacity-40" aria-hidden="true" />
                        )}
                      </button>
                    ) : (
                      col.header
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>

          <tbody className="divide-y divide-western-border-soft">
            {linhasOrdenadas.map((row) => {
              const id = getId(row);
              const marcada = selecionados.has(id);
              return (
                <tr
                  key={id}
                  onClick={clicavel ? () => onRowClick?.(row) : undefined}
                  onKeyDown={
                    clicavel
                      ? (e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            onRowClick?.(row);
                          }
                        }
                      : undefined
                  }
                  tabIndex={clicavel ? 0 : undefined}
                  role={clicavel ? "button" : undefined}
                  className={cn(
                    "h-control transition-colors",
                    marcada && "bg-western-cta/[0.04]",
                    clicavel &&
                      "cursor-pointer hover:bg-western-paper focus:outline-none focus-visible:ring-2 focus-visible:ring-western-gold focus-visible:ring-inset",
                  )}
                >
                  {selecao && (
                    /* stopPropagation: marcar o checkbox não pode abrir o detalhe. */
                    <td className="px-4" onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={marcada}
                        onCheckedChange={() => alternarUm(id)}
                        aria-label="Selecionar linha"
                      />
                    </td>
                  )}

                  {colunas.map((col) => (
                    <td
                      key={col.key}
                      className={cn(
                        "px-4 py-2 align-middle text-western-green-deep",
                        col.align === "right" ? "text-right" : "text-left",
                        (col.numerica || col.align === "right") && "tabular-nums",
                      )}
                    >
                      {col.render(row)}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ───────── MOBILE: lista de cards ───────── */}
      <div className="md:hidden space-y-3">
        {selecao && (
          <label className="flex items-center gap-3 px-1 py-2 text-[15px] font-semibold text-western-stone-warm">
            <Checkbox
              checked={todosSelecionados ? true : algunsSelecionados ? "indeterminate" : false}
              onCheckedChange={alternarTodos}
              aria-label="Selecionar todas as linhas"
            />
            Selecionar todos
          </label>
        )}

        {linhasOrdenadas.map((row) => {
          const id = getId(row);
          const marcada = selecionados.has(id);
          return (
            <div
              key={id}
              onClick={clicavel ? () => onRowClick?.(row) : undefined}
              onKeyDown={
                clicavel
                  ? (e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        onRowClick?.(row);
                      }
                    }
                  : undefined
              }
              tabIndex={clicavel ? 0 : undefined}
              role={clicavel ? "button" : undefined}
              className={cn(
                "rounded-xl border bg-white p-4 transition-colors",
                marcada ? "border-western-cta/40 bg-western-cta/[0.04]" : "border-western-border-soft",
                clicavel && "cursor-pointer active:bg-western-paper focus:outline-none focus-visible:ring-2 focus-visible:ring-western-gold",
              )}
            >
              <div className="flex items-start gap-3">
                {selecao && (
                  <div className="pt-0.5" onClick={(e) => e.stopPropagation()}>
                    <Checkbox checked={marcada} onCheckedChange={() => alternarUm(id)} aria-label="Selecionar" />
                  </div>
                )}

                <div className="min-w-0 flex-1">
                  {colPrincipal && (
                    <div className="text-[16px] font-semibold text-western-green-deep break-words">
                      {colPrincipal.render(row)}
                    </div>
                  )}

                  <dl className="mt-3 space-y-2">
                    {colsSecundarias.map((col) => (
                      <div key={col.key} className="flex items-baseline justify-between gap-4">
                        <dt className="text-[14px] font-semibold uppercase tracking-[0.06em] text-western-bronze flex-shrink-0">
                          {col.header}
                        </dt>
                        <dd
                          className={cn(
                            "text-[15px] text-western-green-deep text-right min-w-0 break-words",
                            (col.numerica || col.align === "right") && "tabular-nums",
                          )}
                        >
                          {col.render(row)}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
