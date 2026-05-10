create table public.wishlists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  product_handle text not null,
  product_title text,
  product_image text,
  created_at timestamptz not null default now(),
  unique (user_id, product_handle)
);

create index idx_wishlists_user on public.wishlists(user_id);

alter table public.wishlists enable row level security;

create policy "Users see own wishlist"
on public.wishlists for select
to authenticated
using (auth.uid() = user_id);

create policy "Users add to own wishlist"
on public.wishlists for insert
to authenticated
with check (auth.uid() = user_id);

create policy "Users remove from own wishlist"
on public.wishlists for delete
to authenticated
using (auth.uid() = user_id);

create policy "Admins read all wishlists"
on public.wishlists for select
to authenticated
using (public.has_role(auth.uid(), 'admin'));