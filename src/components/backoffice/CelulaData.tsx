import { dataAbsoluta, dataRelativa } from "./dataRelativa";

/**
 * "há 2 dias" na tela, data exata no tooltip.
 *
 *   <CelulaData valor={parceiro.created_at} />
 *
 * Use nas colunas de data. A relativa é a que se lê; a absoluta fica a um
 * hover/foco de distância, porque às vezes o dono precisa do dia exato.
 *
 * (Vive num arquivo separado de `dataRelativa.ts` de propósito: em filesystem
 * case-insensitive — Windows — um `DataRelativa.tsx` ao lado de
 * `dataRelativa.ts` faz o import `./dataRelativa` resolver para o arquivo
 * errado, e no pior caso para ele mesmo.)
 */
export function CelulaData({
  valor,
  className,
}: {
  valor: string | number | Date | null | undefined;
  className?: string;
}) {
  const relativa = dataRelativa(valor);

  if (relativa === "—") return <span className={className}>—</span>;

  const d = valor instanceof Date ? valor : new Date(valor as string | number);
  const iso = Number.isNaN(d.getTime()) ? undefined : d.toISOString();

  return (
    <time dateTime={iso} title={dataAbsoluta(valor)} className={className}>
      {relativa}
    </time>
  );
}
