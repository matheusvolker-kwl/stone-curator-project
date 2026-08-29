alter table public.partner_profiles
  add column if not exists senha_provisoria_em timestamptz;

comment on column public.partner_profiles.senha_provisoria_em is
  'Quando != null, a senha atual foi definida pelo admin e o parceiro é obrigado a trocá-la antes de usar a conta.';

create or replace function public.guard_partner_profile_privileges()
returns trigger
language plpgsql
security definer
set search_path = public, app_private, pg_temp
as $$
begin
  if coalesce(auth.role(), '') = 'service_role'
     or app_private.has_role(auth.uid(), 'admin'::app_role) then
    return new;
  end if;

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

  if new.senha_provisoria_em is distinct from old.senha_provisoria_em
     and new.senha_provisoria_em is not null then
    new.senha_provisoria_em := old.senha_provisoria_em;
  end if;

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

create table if not exists public.senha_provisoria_log (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null,
  gerada_por   uuid not null,
  criada_em    timestamptz not null default now(),
  usada_em     timestamptz
);

grant select on public.senha_provisoria_log to authenticated;
grant all on public.senha_provisoria_log to service_role;

create index if not exists senha_provisoria_log_user_idx
  on public.senha_provisoria_log (user_id, criada_em desc);

alter table public.senha_provisoria_log enable row level security;

drop policy if exists "admin le log de senha provisoria" on public.senha_provisoria_log;
create policy "admin le log de senha provisoria"
  on public.senha_provisoria_log
  for select
  to authenticated
  using (app_private.has_role(auth.uid(), 'admin'::app_role));