-- Espejo local de una migración aplicada remotamente el 2026-08-18
-- (creada vía MCP antes de linkear el CLI a este repo). El contenido fue
-- reconstruido del esquema real (supabase db dump, 2026-08-31): la fuente
-- de verdad es la base, no este archivo.

create table public.photos (
    id uuid primary key default gen_random_uuid(),
    storage_path text not null,
    caption text not null default '',
    taken_on date,
    sort_index integer not null default 0,
    created_at timestamptz not null default now(),
    created_by uuid default auth.uid() references auth.users (id) on delete set null
);

create index photos_orden_idx on public.photos (sort_index, created_at);

create table public.events (
    id uuid primary key default gen_random_uuid(),
    title text not null,
    happened_on date,
    created_at timestamptz not null default now(),
    created_by uuid default auth.uid() references auth.users (id) on delete set null
);

create index events_fecha_idx on public.events (happened_on);

alter table public.photos enable row level security;
alter table public.events enable row level security;

create policy "lectura publica" on public.photos
    for select to anon, authenticated using (true);
create policy "insert autenticado" on public.photos
    for insert to authenticated with check (true);
create policy "update autenticado" on public.photos
    for update to authenticated using (true) with check (true);
create policy "delete autenticado" on public.photos
    for delete to authenticated using (true);

create policy "lectura publica" on public.events
    for select to anon, authenticated using (true);
create policy "insert autenticado" on public.events
    for insert to authenticated with check (true);
create policy "update autenticado" on public.events
    for update to authenticated using (true) with check (true);
create policy "delete autenticado" on public.events
    for delete to authenticated using (true);
