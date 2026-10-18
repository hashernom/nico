-- El Sombrero Seleccionador: la casa de cada persona. Una fila por usuario
-- (created_by es único): cada quien se selecciona una sola vez, y puede
-- reiniciar su propia selección (delete) si quiere repetir el test.
--
-- Mismo patrón de RLS que las demás tablas: lectura para anon + authenticated
-- (el sitio se puede mirar sin sesión), escritura solo authenticated y solo
-- sobre la fila propia (created_by = auth.uid()).

create table public.casas (
    id uuid primary key default gen_random_uuid(),
    created_by uuid not null unique default auth.uid() references auth.users (id) on delete cascade,
    casa text not null check (casa in ('gryffindor', 'slytherin', 'ravenclaw', 'hufflepuff')),
    -- Puntaje final por casa, p. ej. {"gryffindor": 9, "slytherin": 4, ...}.
    puntajes jsonb not null,
    created_at timestamptz not null default now()
);

alter table public.casas enable row level security;

create policy "lectura publica" on public.casas
    for select to anon, authenticated using (true);

create policy "insert propio" on public.casas
    for insert to authenticated with check (created_by = auth.uid());

create policy "delete propio" on public.casas
    for delete to authenticated using (created_by = auth.uid());

grant all on table public.casas to anon, authenticated, service_role;

-- Realtime: para que la otra persona vea aparecer la casa sin recargar.
alter publication supabase_realtime add table public.casas;
