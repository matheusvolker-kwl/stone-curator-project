/**
 * Datas relativas em pt-BR para o backoffice.
 *
 *   dataRelativa("2026-07-12T10:00:00Z")  // "há 2 dias"
 *   dataAbsoluta("2026-07-12T10:00:00Z")  // "12/07/2026 às 07:00"
 *
 * Regra de uso: a data relativa é o que se LÊ na tabela; a absoluta vai no
 * `title`/tooltip, porque "há 2 dias" esconde a precisão que o dono às vezes
 * precisa. O componente <DataRelativa/> abaixo já faz os dois de uma vez.
 */

const MIN = 60_000;
const HORA = 60 * MIN;
const DIA = 24 * HORA;
const SEMANA = 7 * DIA;
const MES = 30 * DIA;
const ANO = 365 * DIA;

type Entrada = string | number | Date | null | undefined;

function paraDate(valor: Entrada): Date | null {
  if (valor === null || valor === undefined || valor === "") return null;
  const d = valor instanceof Date ? valor : new Date(valor);
  return Number.isNaN(d.getTime()) ? null : d;
}

function plural(n: number, singular: string, pluralForma: string) {
  return `${n} ${n === 1 ? singular : pluralForma}`;
}

/** Núcleo da formatação, sem o prefixo "há"/"em". */
function distancia(ms: number): string {
  if (ms < MIN) return "agora";
  if (ms < HORA) return plural(Math.floor(ms / MIN), "minuto", "minutos");
  if (ms < DIA) return plural(Math.floor(ms / HORA), "hora", "horas");
  if (ms < SEMANA) return plural(Math.floor(ms / DIA), "dia", "dias");
  if (ms < MES) return plural(Math.floor(ms / SEMANA), "semana", "semanas");
  if (ms < ANO) return plural(Math.floor(ms / MES), "mês", "meses");
  return plural(Math.floor(ms / ANO), "ano", "anos");
}

/**
 * "agora" · "há 5 minutos" · "há 3 horas" · "há 2 dias" · "em 3 dias".
 * Devolve "—" quando não há data (nunca quebra a tabela).
 */
export function dataRelativa(valor: Entrada, agora: Date = new Date()): string {
  const d = paraDate(valor);
  if (!d) return "—";

  const delta = agora.getTime() - d.getTime();
  const abs = Math.abs(delta);

  if (abs < MIN) return "agora";
  const texto = distancia(abs);
  return delta >= 0 ? `há ${texto}` : `em ${texto}`;
}

/** "12/07/2026 às 07:00" — para o tooltip/`title`. */
export function dataAbsoluta(valor: Entrada): string {
  const d = paraDate(valor);
  if (!d) return "—";
  const data = d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
  const hora = d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  return `${data} às ${hora}`;
}

/** "12/07/2026" — quando a hora não importa. */
export function dataCurta(valor: Entrada): string {
  const d = paraDate(valor);
  if (!d) return "—";
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
}
