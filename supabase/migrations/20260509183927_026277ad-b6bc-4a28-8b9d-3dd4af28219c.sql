
-- Roles enum
create type public.app_role as enum ('admin', 'partner');

-- User roles table
create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (
    select 1 from public.user_roles where user_id = _user_id and role = _role
  )
$$;

create policy "Users see own roles"
on public.user_roles for select to authenticated
using (auth.uid() = user_id);

create policy "Admins manage roles"
on public.user_roles for all to authenticated
using (public.has_role(auth.uid(), 'admin'))
with check (public.has_role(auth.uid(), 'admin'));

-- Partner profiles
create type public.partner_status as enum ('pending', 'approved', 'rejected');

create table public.partner_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null unique,
  nome text,
  empresa text,
  cnpj text,
  segmento text,
  telefone text,
  cidade text,
  site text,
  status partner_status not null default 'pending',
  created_at timestamptz not null default now(),
  approved_at timestamptz
);
alter table public.partner_profiles enable row level security;

create policy "Partners see own profile"
on public.partner_profiles for select to authenticated
using (auth.uid() = user_id);

create policy "Partners update own profile"
on public.partner_profiles for update to authenticated
using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Admins see all profiles"
on public.partner_profiles for select to authenticated
using (public.has_role(auth.uid(), 'admin'));

create policy "Admins update profiles"
on public.partner_profiles for update to authenticated
using (public.has_role(auth.uid(), 'admin'));

-- Auto-create partner_profile on signup using raw_user_meta_data
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public
as $$
begin
  insert into public.partner_profiles (user_id, nome, empresa, cnpj, segmento, telefone, cidade, site)
  values (
    new.id,
    new.raw_user_meta_data->>'nome',
    new.raw_user_meta_data->>'empresa',
    new.raw_user_meta_data->>'cnpj',
    new.raw_user_meta_data->>'segmento',
    new.raw_user_meta_data->>'telefone',
    new.raw_user_meta_data->>'cidade',
    new.raw_user_meta_data->>'site'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Leads table: unified inbox for all forms
create type public.lead_type as enum ('partner_signup', 'newsletter', 'amostras', 'visita', 'contato');

create table public.leads (
  id uuid primary key default gen_random_uuid(),
  type lead_type not null,
  nome text,
  email text,
  telefone text,
  empresa text,
  cnpj text,
  segmento text,
  cidade text,
  uf text,
  cep text,
  endereco text,
  mensagem text,
  payload jsonb not null default '{}'::jsonb,
  origem text,
  user_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);
alter table public.leads enable row level security;

-- Anyone (anon + authenticated) can submit leads
create policy "Public can submit leads"
on public.leads for insert to anon, authenticated
with check (true);

-- Only admins can read
create policy "Admins read leads"
on public.leads for select to authenticated
using (public.has_role(auth.uid(), 'admin'));

create index leads_type_created_idx on public.leads (type, created_at desc);
