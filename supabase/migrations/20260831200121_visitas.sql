-- Visitas al jardín: una fila por carga de página con sesión iniciada.
-- La identidad sale de created_by (default auth.uid()), el mismo patrón
-- que las otras cinco tablas. Sin sesión no se registra nada: ver el
-- jardín sigue sin requerir login (decisión de la Fase 1, no se toca).
--
-- Acceso con el mismo patrón de RLS que photos/events/todos/letters/songs:
-- lectura para anon + authenticated, escritura solo authenticated.
-- No lleva update/delete ni realtime: una visita se registra y listo.

create table public.visitas (
    id uuid primary key default gen_random_uuid(),
    created_by uuid default auth.uid() references auth.users (id) on delete set null,
    created_at timestamptz not null default now()
);

alter table public.visitas enable row level security;

create policy "lectura publica" on public.visitas
    for select to anon, authenticated using (true);

create policy "insert autenticado" on public.visitas
    for insert to authenticated with check (true);

-- Espeja los grants que tienen las otras tablas (los DEFAULT PRIVILEGES
-- ya lo cubren, pero explícito no depende de con qué rol corra el push).
grant all on table public.visitas to anon, authenticated, service_role;
