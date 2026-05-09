
drop policy "Public can submit leads" on public.leads;

create policy "Public can submit leads"
on public.leads for insert to anon, authenticated
with check (
  (email is not null and length(email) between 5 and 320)
  or (telefone is not null and length(telefone) between 6 and 40)
);
