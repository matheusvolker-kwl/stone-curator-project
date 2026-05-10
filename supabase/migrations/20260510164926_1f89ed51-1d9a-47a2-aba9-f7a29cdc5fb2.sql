create or replace function public.log_production_status_change()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  if (tg_op = 'INSERT') then
    insert into public.production_order_events (order_id, status, note, created_by)
    values (new.id, new.status, 'Pedido criado', auth.uid());
  elsif (tg_op = 'UPDATE' and new.status is distinct from old.status) then
    insert into public.production_order_events (order_id, status, note, created_by)
    values (new.id, new.status, null, auth.uid());
  end if;
  return new;
end $$;

revoke all on function public.log_production_status_change() from public, anon, authenticated;