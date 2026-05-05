alter table public.product_categories enable row level security;
alter table public.product_tags enable row level security;
alter table public.products enable row level security;
alter table public.product_tag_links enable row level security;
alter table public.stock_movements enable row level security;

drop policy if exists "account members can read product categories" on public.product_categories;
create policy "account members can read product categories"
on public.product_categories
for select
to authenticated
using (public.is_account_member(account_id));

drop policy if exists "account members can insert product categories" on public.product_categories;
create policy "account members can insert product categories"
on public.product_categories
for insert
to authenticated
with check (public.is_account_member(account_id));

drop policy if exists "account members can update product categories" on public.product_categories;
create policy "account members can update product categories"
on public.product_categories
for update
to authenticated
using (public.is_account_member(account_id))
with check (public.is_account_member(account_id));

drop policy if exists "account members can delete custom product categories" on public.product_categories;
create policy "account members can delete custom product categories"
on public.product_categories
for delete
to authenticated
using (public.is_account_member(account_id) and is_fixed = false);

drop policy if exists "account members can read product tags" on public.product_tags;
create policy "account members can read product tags"
on public.product_tags
for select
to authenticated
using (public.is_account_member(account_id));

drop policy if exists "account members can insert product tags" on public.product_tags;
create policy "account members can insert product tags"
on public.product_tags
for insert
to authenticated
with check (public.is_account_member(account_id));

drop policy if exists "account members can update product tags" on public.product_tags;
create policy "account members can update product tags"
on public.product_tags
for update
to authenticated
using (public.is_account_member(account_id))
with check (public.is_account_member(account_id));

drop policy if exists "account members can delete non default product tags" on public.product_tags;
create policy "account members can delete non default product tags"
on public.product_tags
for delete
to authenticated
using (public.is_account_member(account_id) and is_default = false);

drop policy if exists "account members can read products" on public.products;
create policy "account members can read products"
on public.products
for select
to authenticated
using (public.is_account_member(account_id));

drop policy if exists "account members can insert products" on public.products;
create policy "account members can insert products"
on public.products
for insert
to authenticated
with check (public.is_account_member(account_id));

drop policy if exists "account members can update products" on public.products;
create policy "account members can update products"
on public.products
for update
to authenticated
using (public.is_account_member(account_id))
with check (public.is_account_member(account_id));

drop policy if exists "account members can delete products" on public.products;
create policy "account members can delete products"
on public.products
for delete
to authenticated
using (public.is_account_member(account_id));

drop policy if exists "account members can read product tag links" on public.product_tag_links;
create policy "account members can read product tag links"
on public.product_tag_links
for select
to authenticated
using (
  exists (
    select 1
    from public.products p
    where p.id = product_tag_links.product_id
      and public.is_account_member(p.account_id)
  )
);

drop policy if exists "account members can insert product tag links" on public.product_tag_links;
create policy "account members can insert product tag links"
on public.product_tag_links
for insert
to authenticated
with check (
  exists (
    select 1
    from public.products p
    join public.product_tags t
      on t.id = product_tag_links.tag_id
    where p.id = product_tag_links.product_id
      and p.account_id = t.account_id
      and public.is_account_member(p.account_id)
  )
);

drop policy if exists "account members can delete product tag links" on public.product_tag_links;
create policy "account members can delete product tag links"
on public.product_tag_links
for delete
to authenticated
using (
  exists (
    select 1
    from public.products p
    where p.id = product_tag_links.product_id
      and public.is_account_member(p.account_id)
  )
);

drop policy if exists "account members can read stock movements" on public.stock_movements;
create policy "account members can read stock movements"
on public.stock_movements
for select
to authenticated
using (public.is_account_member(account_id));

drop policy if exists "account members can insert stock movements" on public.stock_movements;
create policy "account members can insert stock movements"
on public.stock_movements
for insert
to authenticated
with check (
  public.is_account_member(account_id)
  and (
    created_by is null
    or created_by = auth.uid()
  )
);


create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.product_categories (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references public.accounts(id) on delete cascade,
  slug text not null,
  name text not null,
  sort_order integer not null default 0,
  is_fixed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint product_categories_account_slug_key unique (account_id, slug),
  constraint product_categories_name_not_blank check (length(trim(name)) > 0),
  constraint product_categories_slug_not_blank check (length(trim(slug)) > 0)
);

create table if not exists public.product_tags (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references public.accounts(id) on delete cascade,
  slug text not null,
  name text not null,
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint product_tags_account_slug_key unique (account_id, slug),
  constraint product_tags_name_not_blank check (length(trim(name)) > 0),
  constraint product_tags_slug_not_blank check (length(trim(slug)) > 0)
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references public.accounts(id) on delete cascade,
  category_id uuid not null references public.product_categories(id) on delete restrict,
  name text not null,
  sku text not null,
  description text not null default '',
  price numeric(12, 2) not null,
  stock_quantity integer not null default 0,
  minimum_stock integer not null default 0,
  track_stock boolean not null default true,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint products_account_sku_key unique (account_id, sku),
  constraint products_name_not_blank check (length(trim(name)) > 0),
  constraint products_sku_not_blank check (length(trim(sku)) > 0),
  constraint products_price_non_negative check (price >= 0),
  constraint products_stock_non_negative check (stock_quantity >= 0),
  constraint products_minimum_stock_non_negative check (minimum_stock >= 0)
);

create table if not exists public.product_tag_links (
  product_id uuid not null references public.products(id) on delete cascade,
  tag_id uuid not null references public.product_tags(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (product_id, tag_id)
);

create table if not exists public.stock_movements (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references public.accounts(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  movement_type text not null,
  quantity_delta integer not null,
  previous_quantity integer not null,
  next_quantity integer not null,
  note text not null default '',
  created_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default now(),
  constraint stock_movements_type_check
    check (movement_type in ('manual_adjustment', 'restock', 'sale', 'loss')),
  constraint stock_movements_result_non_negative check (next_quantity >= 0)
);

create index if not exists product_categories_account_sort_idx
  on public.product_categories(account_id, sort_order, name);

create index if not exists product_tags_account_name_idx
  on public.product_tags(account_id, name);

create index if not exists products_account_category_idx
  on public.products(account_id, category_id);

create index if not exists products_account_name_idx
  on public.products(account_id, name);

create index if not exists products_account_active_idx
  on public.products(account_id, is_active);

create index if not exists stock_movements_account_product_created_idx
  on public.stock_movements(account_id, product_id, created_at desc);

drop trigger if exists product_categories_set_updated_at on public.product_categories;
create trigger product_categories_set_updated_at
before update on public.product_categories
for each row
execute function public.set_updated_at();

drop trigger if exists product_tags_set_updated_at on public.product_tags;
create trigger product_tags_set_updated_at
before update on public.product_tags
for each row
execute function public.set_updated_at();

drop trigger if exists products_set_updated_at on public.products;
create trigger products_set_updated_at
before update on public.products
for each row
execute function public.set_updated_at();

create or replace function public.is_account_member(target_account_id uuid)
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.users u
    where u.account_id = target_account_id
      and u.id = auth.uid()
  );
$$;

create or replace function public.seed_product_catalog_for_account(target_account_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.product_categories (account_id, slug, name, sort_order, is_fixed)
  values
    (target_account_id, 'buques', 'Buquês', 1, true),
    (target_account_id, 'arranjos', 'Arranjos', 2, true),
    (target_account_id, 'cestas', 'Cestas', 3, true),
    (target_account_id, 'plantas', 'Plantas', 4, true),
    (target_account_id, 'coroas-funebres', 'Coroas fúnebres', 5, true),
    (target_account_id, 'complementos', 'Complementos', 6, true),
    (target_account_id, 'servicos', 'Serviços', 7, true)
  on conflict (account_id, slug) do update
  set
    name = excluded.name,
    sort_order = excluded.sort_order,
    is_fixed = true,
    updated_at = now();

  insert into public.product_tags (account_id, slug, name, is_default)
  values
    (target_account_id, 'aniversario', 'Aniversário', true),
    (target_account_id, 'romantico', 'Romântico', true),
    (target_account_id, 'datas-especiais', 'Datas especiais', true),
    (target_account_id, 'luto', 'Luto', true)
  on conflict (account_id, slug) do update
  set
    name = excluded.name,
    is_default = true,
    updated_at = now();
end;
$$;

create or replace function public.seed_product_catalog_on_account_insert()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.seed_product_catalog_for_account(new.id);
  return new;
end;
$$;

drop trigger if exists accounts_seed_product_catalog on public.accounts;
create trigger accounts_seed_product_catalog
after insert on public.accounts
for each row
execute function public.seed_product_catalog_on_account_insert();

do $$
declare
  account_row record;
begin
  for account_row in
    select id from public.accounts
  loop
    perform public.seed_product_catalog_for_account(account_row.id);
  end loop;
end;
$$;


create policy "user can read own profile"
on public.users
for select
to authenticated
using ((select auth.uid()) = id);

create policy "user can insert own profile"
on public.users
for insert
to authenticated
with check ((select auth.uid()) = id);

create policy "user can update own profile"
on public.users
for update
to authenticated
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);


create policy "user can read own account"
on public.accounts
for select
to authenticated
using (
  exists (
    select 1
    from public.users u
    where u.account_id = accounts.id
      and u.id = (select auth.uid())
  )
);

create extension if not exists pgcrypto;

create type public.app_role as enum ('owner', 'admin', 'member');

create table public.accounts (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique,
  created_at timestamptz not null default now()
);

create table public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  account_id uuid not null references public.accounts(id) on delete cascade,
  nome text not null,
  username text not null,
  role public.app_role not null default 'member',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (username)
);

alter table public.accounts enable row level security;
alter table public.users enable row level security;

create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references public.accounts(id) on delete cascade,
  name text not null,
  phone text not null,
  cpf text,
  email text,
  notes text not null default '',
  created_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint customers_name_not_blank check (length(trim(name)) > 0),
  constraint customers_phone_not_blank check (length(trim(phone)) > 0)
);

create table if not exists public.sales (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references public.accounts(id) on delete cascade,
  customer_id uuid references public.customers(id) on delete set null,
  created_by uuid references public.users(id) on delete set null,
  sale_number bigserial unique,
  status text not null default 'completed',
  payment_method text not null,
  subtotal numeric(12, 2) not null default 0,
  discount_amount numeric(12, 2) not null default 0,
  total_amount numeric(12, 2) not null,
  paid_amount numeric(12, 2) not null default 0,
  change_amount numeric(12, 2) not null default 0,
  notes text not null default '',
  sold_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint sales_status_check check (status in ('pending', 'completed', 'cancelled')),
  constraint sales_payment_method_check check (
    payment_method in ('pix', 'credit_card', 'debit_card', 'cash', 'bank_transfer')
  ),
  constraint sales_subtotal_non_negative check (subtotal >= 0),
  constraint sales_discount_non_negative check (discount_amount >= 0),
  constraint sales_total_non_negative check (total_amount >= 0),
  constraint sales_paid_non_negative check (paid_amount >= 0),
  constraint sales_change_non_negative check (change_amount >= 0)
);

create index if not exists customers_account_name_idx
  on public.customers(account_id, name);

create index if not exists customers_account_phone_idx
  on public.customers(account_id, phone);

create index if not exists sales_account_sold_at_idx
  on public.sales(account_id, sold_at desc);

create index if not exists sales_account_customer_idx
  on public.sales(account_id, customer_id);

drop trigger if exists customers_set_updated_at on public.customers;
create trigger customers_set_updated_at
before update on public.customers
for each row
execute function public.set_updated_at();

drop trigger if exists sales_set_updated_at on public.sales;
create trigger sales_set_updated_at
before update on public.sales
for each row
execute function public.set_updated_at();

alter table public.customers enable row level security;
alter table public.sales enable row level security;

drop policy if exists "account members can read customers" on public.customers;
create policy "account members can read customers"
on public.customers
for select
to authenticated
using (public.is_account_member(account_id));

drop policy if exists "account members can insert customers" on public.customers;
create policy "account members can insert customers"
on public.customers
for insert
to authenticated
with check (
  public.is_account_member(account_id)
  and (
    created_by is null
    or created_by = auth.uid()
  )
);

drop policy if exists "account members can update customers" on public.customers;
create policy "account members can update customers"
on public.customers
for update
to authenticated
using (public.is_account_member(account_id))
with check (public.is_account_member(account_id));

drop policy if exists "account members can delete customers" on public.customers;
create policy "account members can delete customers"
on public.customers
for delete
to authenticated
using (public.is_account_member(account_id));

drop policy if exists "account members can read sales" on public.sales;
create policy "account members can read sales"
on public.sales
for select
to authenticated
using (public.is_account_member(account_id));

drop policy if exists "account members can insert sales" on public.sales;
create policy "account members can insert sales"
on public.sales
for insert
to authenticated
with check (
  public.is_account_member(account_id)
  and (
    created_by is null
    or created_by = auth.uid()
  )
);

drop policy if exists "account members can update sales" on public.sales;
create policy "account members can update sales"
on public.sales
for update
to authenticated
using (public.is_account_member(account_id))
with check (public.is_account_member(account_id));

drop policy if exists "account members can delete sales" on public.sales;
create policy "account members can delete sales"
on public.sales
for delete
to authenticated
using (public.is_account_member(account_id));
