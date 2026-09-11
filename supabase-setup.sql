-- ============================================================
-- Ejecuta esto en Supabase: Project -> SQL Editor -> New query
-- ============================================================

create table if not exists public.animes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  cover_url text,
  historia int not null default 0 check (historia between 0 and 5),
  personajes int not null default 0 check (personajes between 0 and 5),
  animacion int not null default 0 check (animacion between 0 and 5),
  arte int not null default 0 check (arte between 0 and 5),
  originalidad int not null default 0 check (originalidad between 0 and 5),
  plus int not null default 0 check (plus between 0 and 5),
  created_at timestamptz not null default now()
);

-- Activa la seguridad a nivel de fila: sin esto, cualquiera podría
-- leer o modificar los datos de cualquier usuario.
alter table public.animes enable row level security;

-- Cada usuario solo puede ver sus propios animes
create policy "Los usuarios ven solo sus animes"
  on public.animes for select
  using (auth.uid() = user_id);

-- Cada usuario solo puede insertar animes a su propio nombre
create policy "Los usuarios insertan solo para si mismos"
  on public.animes for insert
  with check (auth.uid() = user_id);

-- Cada usuario solo puede editar sus propios animes
create policy "Los usuarios editan solo sus animes"
  on public.animes for update
  using (auth.uid() = user_id);

-- Cada usuario solo puede borrar sus propios animes
create policy "Los usuarios borran solo sus animes"
  on public.animes for delete
  using (auth.uid() = user_id);
