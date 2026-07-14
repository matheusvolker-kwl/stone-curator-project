/**
 * FUNDAÇÃO DO BACKOFFICE — blocos que o /admin e a conta do parceiro reusam.
 *
 *   import {
 *     DataTable, type Coluna,
 *     EstadoCarregando, EstadoVazio, EstadoErro,
 *     StatusBadge, Tabs, PageHeader, CelulaData,
 *   } from "@/components/backoffice";
 *
 * ─────────────────────────────────────────────────────────────────────────
 * A REGRA QUE NÃO SE NEGOCIA: OS 4 ESTADOS
 * ─────────────────────────────────────────────────────────────────────────
 * Toda tela que busca dados trata: carregando · vazio · ERRO · sucesso.
 * VAZIO e ERRO são telas DIFERENTES e PARECEM diferentes.
 *
 * O <DataTable/> já embute os quatro — mas só funciona se você entregar o erro:
 *
 *   const [linhas, setLinhas] = useState<Parceiro[]>([]);
 *   const [carregando, setCarregando] = useState(true);
 *   const [erro, setErro] = useState<unknown>(null);
 *
 *   const carregar = useCallback(async () => {
 *     setCarregando(true);
 *     setErro(null);
 *     const { data, error } = await supabase.from("partner_profiles").select("*");
 *     if (error) setErro(error);          // ← ISTO. Sem isto, o dono fica cego.
 *     else setLinhas(data ?? []);
 *     setCarregando(false);
 *   }, []);
 *
 *   <DataTable linhas={linhas} isLoading={carregando} error={erro} onRetry={carregar} … />
 *
 * NUNCA escreva `const { data } = await supabase…` e jogue `data ?? []` na tela:
 * um 403 vira lista vazia, a tela mente, e o dono acha que não tem nada.
 * Foi exatamente assim que um parceiro pendente sumiu do painel antigo.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * DS V3
 * ─────────────────────────────────────────────────────────────────────────
 * Sans em tudo · 14px é o mínimo · ação primária é VERDE (.btn-primary) e há
 * UMA por tela · dourado é acento · cantos 6/10/16px · toque ≥48px · zero emoji.
 */

export { DataTable, type Coluna, type SelecaoConfig } from "./DataTable";
export { EstadoCarregando, EstadoVazio, EstadoErro, mensagemDeErro } from "./Estados";
export { StatusBadge, STATUS_META, rotuloStatus, type TomStatus } from "./StatusBadge";
export { Tabs, type Aba } from "./Tabs";
export { PageHeader } from "./PageHeader";
export { CelulaData } from "./CelulaData";
export { dataRelativa, dataAbsoluta, dataCurta } from "./dataRelativa";
