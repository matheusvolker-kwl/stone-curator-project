/**
 * Rastreio de "visto" por seção do painel (item 5a da lista de 05/08): o badge
 * da Caixa de entrada conta leads criados DEPOIS da última visita, em vez de
 * uma janela fixa de 7 dias que ignorava o que o dono já tinha olhado.
 *
 * v1 em localStorage, chaveado por usuário+seção — por dispositivo. O Supabase
 * da loja é provisionado pela Lovable e não há acesso de escrita por aqui para
 * criar a tabela `admin_section_reads (user_id, section, last_seen_at)`;
 * quando houver, migre este módulo para a tabela mantendo esta interface.
 */
export const EVENTO_SECAO_VISTA = "western:admin-secao-vista";

const chave = (userId: string | undefined, secao: string) =>
  `western-admin-seen:${userId ?? "anon"}:${secao}`;

/** ISO da última visita à seção, ou null se nunca visitou (neste dispositivo). */
export function ultimaVisita(userId: string | undefined, secao: string): string | null {
  try {
    return localStorage.getItem(chave(userId, secao));
  } catch {
    return null;
  }
}

/** Marca a seção como vista AGORA e avisa o shell para recontar os badges. */
export function marcarVisto(userId: string | undefined, secao: string) {
  try {
    localStorage.setItem(chave(userId, secao), new Date().toISOString());
  } catch {
    /* modo privado/cota — o badge volta ao comportamento de 7 dias */
  }
  window.dispatchEvent(new Event(EVENTO_SECAO_VISTA));
}
