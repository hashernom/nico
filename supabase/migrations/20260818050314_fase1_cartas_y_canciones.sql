-- Espejo local de una migración aplicada remotamente el 2026-08-18
-- (creada vía MCP antes de linkear el CLI a este repo). El contenido fue
-- reconstruido del esquema real (supabase db dump, 2026-08-31): la fuente
-- de verdad es la base, no este archivo.

create table public.letters (
    id uuid primary key default gen_random_uuid(),
    body text not null,
    written_on date not null default current_date,
    created_at timestamptz not null default now(),
    created_by uuid default auth.uid() references auth.users (id) on delete set null
);

create index letters_fecha_idx on public.letters (written_on desc);

create table public.songs (
    id uuid primary key default gen_random_uuid(),
    title text not null,
    url text not null,
    note text not null default '',
    created_at timestamptz not null default now(),
    created_by uuid default auth.uid() references auth.users (id) on delete set null
);

alter table public.letters enable row level security;
alter table public.songs enable row level security;

create policy "lectura publica" on public.letters
    for select to anon, authenticated using (true);
create policy "insert autenticado" on public.letters
    for insert to authenticated with check (true);
create policy "update autenticado" on public.letters
    for update to authenticated using (true) with check (true);
create policy "delete autenticado" on public.letters
    for delete to authenticated using (true);

create policy "lectura publica" on public.songs
    for select to anon, authenticated using (true);
create policy "insert autenticado" on public.songs
    for insert to authenticated with check (true);
create policy "update autenticado" on public.songs
    for update to authenticated using (true) with check (true);
create policy "delete autenticado" on public.songs
    for delete to authenticated using (true);
