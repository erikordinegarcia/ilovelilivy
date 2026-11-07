-- =====================================================================
-- I Love Lilivy — Estrutura do Supabase
-- Rode este arquivo inteiro em: Supabase > SQL Editor > New query > Run
-- =====================================================================

-- 1) TABELA DE PRODUTOS ------------------------------------------------
create table if not exists public.products (
  id          uuid primary key default gen_random_uuid(),
  category    text not null check (category in ('brincos', 'pulseiras', 'bolsas', 'colares')),
  name        text not null,
  description text,
  price       numeric(10, 2) check (price is null or price >= 0),  -- null = "Sob consulta"
  image_url   text,
  sort_order  integer not null default 0,                            -- menor aparece primeiro
  active      boolean not null default true,                         -- false = escondido do site
  featured    boolean not null default false,                        -- true = aparece nos Destaques da página inicial
  created_at  timestamptz not null default now()
);

-- Para bancos criados antes da coluna "featured" existir
alter table public.products add column if not exists featured boolean not null default false;

create index if not exists products_category_order_idx
  on public.products (category, sort_order, created_at);

create index if not exists products_featured_idx
  on public.products (featured, sort_order) where active;

-- 2) SEGURANÇA (RLS) ---------------------------------------------------
alter table public.products enable row level security;

-- Visitantes do site: só leem produtos ativos
drop policy if exists "Publico le produtos ativos" on public.products;
create policy "Publico le produtos ativos"
  on public.products for select
  to anon
  using (active = true);

-- Donas logadas no painel: acesso total
drop policy if exists "Admin le todos" on public.products;
create policy "Admin le todos"
  on public.products for select
  to authenticated
  using (true);

drop policy if exists "Admin cria" on public.products;
create policy "Admin cria"
  on public.products for insert
  to authenticated
  with check (true);

drop policy if exists "Admin edita" on public.products;
create policy "Admin edita"
  on public.products for update
  to authenticated
  using (true) with check (true);

drop policy if exists "Admin exclui" on public.products;
create policy "Admin exclui"
  on public.products for delete
  to authenticated
  using (true);

-- 3) STORAGE DAS FOTOS -------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('product-images', 'product-images', true, 5242880,
        array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

drop policy if exists "Fotos publicas" on storage.objects;
create policy "Fotos publicas"
  on storage.objects for select
  using (bucket_id = 'product-images');

drop policy if exists "Admin envia fotos" on storage.objects;
create policy "Admin envia fotos"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'product-images');

drop policy if exists "Admin atualiza fotos" on storage.objects;
create policy "Admin atualiza fotos"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'product-images');

drop policy if exists "Admin exclui fotos" on storage.objects;
create policy "Admin exclui fotos"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'product-images');

-- 4) USUÁRIAS DO PAINEL ------------------------------------------------
-- Crie o login das donas em: Authentication > Users > Add user > Create new user
-- (marque "Auto Confirm User"). Depois desative cadastros públicos em:
-- Authentication > Sign In / Providers > desmarque "Allow new users to sign up".
