-- Espejo local de una migración aplicada remotamente el 2026-08-18
-- (creada vía MCP antes de linkear el CLI a este repo). El contenido fue
-- reconstruido del esquema real (supabase db dump, 2026-08-31): la fuente
-- de verdad es la base, no este archivo.

create table public.todos (
    id uuid primary key default gen_random_uuid(),
    text text not null,
    done boolean not null default false,
    created_at timestamptz not null default now(),
    created_by uuid default auth.uid() references auth.users (id) on delete set null
);

create index todos_creado_idx on public.todos (created_at);

alter table public.todos enable row level security;

create policy "lectura publica" on public.todos
    for select to anon, authenticated using (true);
create policy "insert autenticado" on public.todos
    for insert to authenticated with check (true);
create policy "update autenticado" on public.todos
    for update to authenticated using (true) with check (true);
create policy "delete autenticado" on public.todos
    for delete to authenticated using (true);
