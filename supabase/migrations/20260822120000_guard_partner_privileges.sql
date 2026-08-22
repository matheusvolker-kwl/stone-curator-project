-- Fecha a escalada de privilégio em partner_profiles.
--
-- Problema: a policy "Partners update own profile" (USING/WITH CHECK auth.uid() = user_id)
-- vale para a LINHA INTEIRA, e `authenticated` tem GRANT de UPDATE em todas as colunas.
-- Resultado: qualquer cadastrado gravava status='approved' + tier='partner' no próprio
-- perfil e liberava a tabela de atacado (o gate de preço do woo-proxy e o
-- checkout-ticket-create leem exatamente essas duas colunas).
--
-- Por que trigger e não REVOKE: o parceiro PRECISA gravar status='pending' ao editar o
-- cadastro (regra de reanálise em AccountProfile.tsx). Revogar a coluna quebraria esse
-- fluxo. O guarda abaixo preserva as colunas comerciais e permite só o rebaixamento
-- para 'pending'.

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

  -- status: só o rebaixamento para 'pending' (reanálise) é permitido ao parceiro.
  -- Qualquer outra transição é revertida em silêncio.
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
