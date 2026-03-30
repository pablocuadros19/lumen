-- =============================================
-- LUMEN — Schema de base de datos
-- Ejecutar en Supabase SQL Editor
-- =============================================

-- LIMPIAR TODO PRIMERO
drop trigger if exists on_auth_user_created on auth.users;
drop trigger if exists recursos_updated_at on public.recursos;
drop function if exists public.handle_new_user();
drop function if exists public.update_updated_at();
drop table if exists public.favoritos cascade;
drop table if exists public.recursos cascade;
drop table if exists public.perfiles cascade;

-- Tabla de perfiles (se crea automáticamente al registrarse)
create table public.perfiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  nombre text not null default '',
  rol text not null default 'docente' check (rol in ('admin', 'docente')),
  grados_asignados text[] default '{}',
  avatar_url text,
  created_at timestamptz default now()
);

-- Tabla de recursos
create table public.recursos (
  id uuid default gen_random_uuid() primary key,
  titulo text not null,
  resumen text,
  grados text[] not null default '{}',
  area text not null default 'Prácticas del Lenguaje',
  eje_tematico text not null,
  tipo_recurso text not null,
  formato text not null,
  editable boolean not null default false,
  estado text not null default 'borrador' check (estado in ('borrador', 'publicado', 'destacado', 'archivado')),
  idioma text not null default 'es' check (idioma in ('es', 'en')),
  archivo_drive_id text,
  archivo_url text,
  thumbnail_url text,
  link_editable text,
  texto_extraido text,
  subido_por uuid references public.perfiles(id),
  autor_nombre text,
  descargas integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Tabla de favoritos
create table public.favoritos (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.perfiles(id) on delete cascade,
  recurso_id uuid references public.recursos(id) on delete cascade,
  created_at timestamptz default now(),
  unique(user_id, recurso_id)
);

-- Índices para búsqueda rápida
create index idx_recursos_grados on public.recursos using gin (grados);
create index idx_recursos_eje on public.recursos (eje_tematico);
create index idx_recursos_tipo on public.recursos (tipo_recurso);
create index idx_recursos_estado on public.recursos (estado);
create index idx_recursos_created on public.recursos (created_at desc);
create index idx_favoritos_user on public.favoritos (user_id);

-- Full text search en título y resumen
alter table public.recursos add column fts tsvector
  generated always as (
    setweight(to_tsvector('spanish', coalesce(titulo, '')), 'A') ||
    setweight(to_tsvector('spanish', coalesce(resumen, '')), 'B') ||
    setweight(to_tsvector('spanish', coalesce(texto_extraido, '')), 'C')
  ) stored;
create index idx_recursos_fts on public.recursos using gin (fts);

-- RLS (Row Level Security)
alter table public.perfiles enable row level security;
alter table public.recursos enable row level security;
alter table public.favoritos enable row level security;

-- Políticas: solo autenticados pueden ver recursos publicados
create policy "Recursos publicados visibles para autenticados"
  on public.recursos for select
  using (auth.uid() is not null and estado in ('publicado', 'destacado'));

-- Admins ven todos los recursos
create policy "Admins ven todo"
  on public.recursos for select
  using (
    exists (
      select 1 from public.perfiles
      where perfiles.id = auth.uid() and perfiles.rol = 'admin'
    )
  );

-- Autores ven sus propios borradores
create policy "Autores ven sus borradores"
  on public.recursos for select
  using (subido_por = auth.uid());

-- Usuarios autenticados pueden crear recursos
create policy "Usuarios pueden subir recursos"
  on public.recursos for insert
  with check (auth.uid() is not null);

-- Autores pueden editar sus recursos
create policy "Autores editan sus recursos"
  on public.recursos for update
  using (subido_por = auth.uid());

-- Admins pueden editar cualquier recurso
create policy "Admins editan cualquier recurso"
  on public.recursos for update
  using (
    exists (
      select 1 from public.perfiles
      where perfiles.id = auth.uid() and perfiles.rol = 'admin'
    )
  );

-- Admins pueden borrar recursos
create policy "Admins borran recursos"
  on public.recursos for delete
  using (
    exists (
      select 1 from public.perfiles
      where perfiles.id = auth.uid() and perfiles.rol = 'admin'
    )
  );

-- Perfiles: cada usuario ve y edita el suyo
create policy "Usuarios ven perfiles"
  on public.perfiles for select
  using (true);

create policy "Usuarios editan su perfil"
  on public.perfiles for update
  using (id = auth.uid());

create policy "Insertar perfil propio"
  on public.perfiles for insert
  with check (id = auth.uid());

-- Favoritos: cada usuario gestiona los suyos
create policy "Usuarios ven sus favoritos"
  on public.favoritos for select
  using (user_id = auth.uid());

create policy "Usuarios crean favoritos"
  on public.favoritos for insert
  with check (user_id = auth.uid());

create policy "Usuarios borran sus favoritos"
  on public.favoritos for delete
  using (user_id = auth.uid());

-- Función para crear perfil automáticamente al registrarse
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.perfiles (id, email, nombre, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', ''),
    coalesce(new.raw_user_meta_data->>'avatar_url', new.raw_user_meta_data->>'picture', '')
  );
  return new;
end;
$$ language plpgsql security definer;

-- Trigger
create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Función para actualizar updated_at
create or replace function public.update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger recursos_updated_at
  before update on public.recursos
  for each row execute procedure public.update_updated_at();
