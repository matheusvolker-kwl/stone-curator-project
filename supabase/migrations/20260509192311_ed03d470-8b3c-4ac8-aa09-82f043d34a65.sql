
create or replace function public.claim_first_admin()
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  has_any_admin boolean;
  uid uuid := auth.uid();
begin
  if uid is null then
    return false;
  end if;
  select exists(select 1 from public.user_roles where role = 'admin') into has_any_admin;
  if has_any_admin then
    return false;
  end if;
  insert into public.user_roles (user_id, role) values (uid, 'admin')
    on conflict (user_id, role) do nothing;
  return true;
end;
$$;

revoke execute on function public.claim_first_admin() from public, anon;
grant execute on function public.claim_first_admin() to authenticated;
