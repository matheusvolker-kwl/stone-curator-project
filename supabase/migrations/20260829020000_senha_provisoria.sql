-- Senha provisória: o dono resolve com o cliente na linha, sem depender de e-mail.
--
-- O cliente liga sem conseguir entrar. Hoje o dono não tem ação nenhuma: o único
-- caminho é o "esqueci a senha", que depende de o e-mail chegar — e a entrega de
-- e-mail da loja é problema aberto. Com isto o dono gera uma senha fácil de ditar,
-- passa por telefone, e o sistema exige a troca no primeiro acesso.
--
-- A marca fica no perfil, não em auth.users: partner_profiles já é lida em toda
-- sessão autenticada, e auth.users não aceita coluna nova.

alter table public.partner_profiles
  add column if not exists senha_provisoria_em timestamptz;

comment on column public.partner_profiles.senha_provisoria_em is
  'Quando != null, a senha atual foi definida pelo admin e o parceiro é obrigado a '
  'trocá-la antes de usar a conta. Limpo pela própria troca de senha.';

-- O guarda de privilégios precisa proteger a coluna nova.
-- Sem isto o parceiro limparia a própria marca por escrita direta na tabela
-- (a policy "Partners update own profile" vale para a linha inteira) e pularia
-- a troca obrigatória, mantendo em uso uma senha que passou por telefone.
create or replace function public.guard_partner_profile_privileges()
returns trigger
language plpgsql
security definer
set search_path = public, app_private, pg_temp
as $$
begin
  -- service_role (edge functions) e admin escrevem sem restrição
  if coalesce(auth.role(), '') = 'service_role'
     or app_private.has_role(auth.uid(), 'admin'::app_role) then
    return new;
  end if;

  -- colunas de poder comercial: nunca mudam por escrita do próprio usuário
  new.tier                := old.tier;
  new.discount_override   := old.discount_override;
  new.payment_methods     := old.payment_methods;
  new.approved_at         := old.approved_at;
  new.cancelled_at        := old.cancelled_at;
  new.cancellation_reason := old.cancellation_reason;
  new.credenciamento_id   := old.credenciamento_id;
  new.credenciado_em      := old.credenciado_em;
  new.credenciado_fonte   := old.credenciado_fonte;
  new.user_id             := old.user_id;
  new.created_at          := old.created_at;

  -- A marca de senha provisória só pode ser LIMPA, nunca criada nem mantida à
  -- força pelo parceiro. Quem limpa de verdade é a troca de senha, que passa
  -- pela edge function; aqui só garantimos que ele não a defina para outro valor.
  if new.senha_provisoria_em is distinct from old.senha_provisoria_em
     and new.senha_provisoria_em is not null then
    new.senha_provisoria_em := old.senha_provisoria_em;
  end if;

  -- status: só o rebaixamento para 'pending' (reanálise) é permitido ao parceiro.
  if new.status is distinct from old.status
     and new.status <> 'pending'::partner_status then
    new.status := old.status;
  end if;

  return new;
end;
$$;

drop trigger if exists partner_profiles_guard_privileges on public.partner_profiles;

create trigger partner_profiles_guard_privileges
  before update on public.partner_profiles
  for each row
  execute function public.guard_partner_profile_privileges();

-- Trilha de auditoria: senha definida por outra pessoa é evento sensível.
-- Sem registro não há como responder "quem gerou senha para quem, e quando".
create table if not exists public.senha_provisoria_log (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null,
  gerada_por   uuid not null,
  criada_em    timestamptz not null default now(),
  usada_em     timestamptz
);

comment on table public.senha_provisoria_log is
  'Registro de senhas provisórias emitidas pelo admin. Nunca guarda a senha.';

create index if not exists senha_provisoria_log_user_idx
  on public.senha_provisoria_log (user_id, criada_em desc);

alter table public.senha_provisoria_log enable row level security;

-- Só admin lê. Ninguém escreve pelo cliente: a edge function usa service_role,
-- que ignora RLS.
drop policy if exists "admin le log de senha provisoria" on public.senha_provisoria_log;
create policy "admin le log de senha provisoria"
  on public.senha_provisoria_log
  for select
  to authenticated
  using (app_private.has_role(auth.uid(), 'admin'::app_role));
