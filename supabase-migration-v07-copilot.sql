-- LUMEN v0.7 — Copiloto v2: prompts versionados, logging, biblioteca personal
-- Ejecutar en Supabase SQL Editor (Dashboard > SQL Editor)
-- Migración idempotente: se puede correr varias veces sin romper.

-- =============================================
-- Tipos enumerados (idempotentes)
-- =============================================
do $$ begin
  create type copilot_function as enum (
    'adapt_resource',
    'create_similar_activity',
    'create_evaluation',
    'create_implementation_guide'
  );
exception when duplicate_object then null;
end $$;

do $$ begin
  create type dua_level as enum (
    'estandar', 'leve', 'profunda', 'enriquecimiento'
  );
exception when duplicate_object then null;
end $$;

-- =============================================
-- Prompts versionados (capas 1, 2 y 4 del sistema)
-- Cyntia edita layer_pedagogy y layer_task desde el panel admin
-- =============================================
create table if not exists prompt_templates (
  id                 uuid          primary key default gen_random_uuid(),
  slug               text          not null unique,       -- clave de lookup (ej: 'adaptar', 'rubrica')
  function           copilot_function not null,
  version            int           not null default 1,
  layer_pedagogy     text          not null default '',   -- capa 2: escribe Cyntia
  layer_task         text          not null,              -- capa 4: tarea específica
  output_schema_slug text          not null default 'texto_libre',
  model              text          not null default 'claude-sonnet-4-6',  -- editable por función
  is_active          boolean       not null default true,
  notes              text,
  created_by         uuid          references auth.users(id),
  validated_by       uuid          references auth.users(id),
  validated_at       timestamptz,
  created_at         timestamptz   not null default now()
);

-- Por si la tabla existía de una corrida previa sin esta columna
alter table prompt_templates add column if not exists model text not null default 'claude-sonnet-4-6';

create index if not exists idx_prompt_templates_active on prompt_templates (slug) where is_active = true;

-- =============================================
-- Log de cada generación
-- =============================================
create table if not exists ai_generations (
  id                   uuid              primary key default gen_random_uuid(),
  user_id              uuid              not null references auth.users(id),
  prompt_template_id   uuid              not null references prompt_templates(id),
  function             copilot_function  not null,
  slug                 text              not null,
  source_resource_id   uuid,
  dua_level            dua_level         not null default 'estandar',
  input_params         jsonb             not null default '{}',
  output_json          jsonb             not null default '{}',
  model                text              not null,
  tokens_input         int,
  tokens_output        int,
  duration_ms          int,
  feedback_score       int               check (feedback_score in (-1, 1)),
  feedback_text        text,
  created_at           timestamptz       not null default now()
);

create index if not exists idx_ai_generations_user     on ai_generations (user_id, created_at desc);
create index if not exists idx_ai_generations_resource on ai_generations (source_resource_id);

-- =============================================
-- Biblioteca personal del docente
-- Lo que guardó de las generaciones del copiloto
-- =============================================
create table if not exists user_generated_resources (
  id                      uuid              primary key default gen_random_uuid(),
  user_id                 uuid              not null references auth.users(id),
  generation_id           uuid              not null references ai_generations(id),
  function                copilot_function  not null,
  titulo                  text              not null,
  output_json             jsonb             not null,
  dua_variants            jsonb,
  derived_from            uuid,
  inspired_by             uuid,
  pdf_url                 text,
  is_published_to_school  boolean           not null default false,
  published_resource_id   uuid,
  created_at              timestamptz       not null default now(),
  updated_at              timestamptz       not null default now()
);

create index if not exists idx_ugr_user on user_generated_resources (user_id, updated_at desc);

-- =============================================
-- RLS
-- =============================================
alter table prompt_templates enable row level security;

drop policy if exists "pt_read_authenticated" on prompt_templates;
create policy "pt_read_authenticated" on prompt_templates
  for select using (auth.uid() is not null);

drop policy if exists "pt_write_admin" on prompt_templates;
create policy "pt_write_admin" on prompt_templates
  for all using (
    exists (select 1 from perfiles where id = auth.uid() and rol in ('admin', 'directivo'))
  ) with check (
    exists (select 1 from perfiles where id = auth.uid() and rol in ('admin', 'directivo'))
  );

alter table ai_generations enable row level security;

drop policy if exists "ai_gen_owner_select" on ai_generations;
create policy "ai_gen_owner_select" on ai_generations
  for select using (auth.uid() = user_id);

drop policy if exists "ai_gen_owner_insert" on ai_generations;
create policy "ai_gen_owner_insert" on ai_generations
  for insert with check (auth.uid() = user_id);

drop policy if exists "ai_gen_owner_update" on ai_generations;
create policy "ai_gen_owner_update" on ai_generations
  for update using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

alter table user_generated_resources enable row level security;

drop policy if exists "ugr_owner_all" on user_generated_resources;
create policy "ugr_owner_all" on user_generated_resources
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- =============================================
-- Trigger updated_at
-- =============================================
create or replace function touch_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists ugr_touch_updated on user_generated_resources;
create trigger ugr_touch_updated
  before update on user_generated_resources
  for each row execute function touch_updated_at();

-- =============================================
-- Seed: prompts v1 placeholder
-- Versión 0 del marco pedagógico — pendiente de sesión con Cyntia
-- Mezcla de modelos: Sonnet para tareas con criterio pedagógico,
-- Haiku para tareas más mecánicas o de bajo riesgo.
-- =============================================
insert into prompt_templates (slug, function, layer_task, output_schema_slug, model, notes) values
(
  'adaptar',
  'adapt_resource',
  'Adaptá el recurso pedagógico al grado indicado. Ajustá el vocabulario, la complejidad conceptual, la extensión de las consignas y el nivel de andamiaje según la edad. Mantené el área y el eje temático originales. Devolvé el recurso adaptado completo en Markdown, listo para usar.',
  'texto_libre',
  'claude-sonnet-4-6',
  'v1 placeholder — pendiente validación pedagógica por Cyntia'
),
(
  'evaluacion',
  'create_evaluation',
  'Generá una evaluación basada en el contenido del recurso. Incluí 4 a 6 consignas variadas (opción múltiple, completar espacios, producción breve), criterios de evaluación claros y niveles de desempeño esperados. Formato Markdown, listo para imprimir.',
  'texto_libre',
  'claude-sonnet-4-6',
  'v1 placeholder — pendiente validación pedagógica por Cyntia'
),
(
  'simplificar',
  'adapt_resource',
  'Reescribí las consignas del recurso de forma más simple y clara. Usá oraciones cortas y directas, vocabulario accesible, un solo paso por consigna, y agregá ejemplos concretos donde ayude a la comprensión. Devolvé las consignas simplificadas en Markdown.',
  'texto_libre',
  'claude-haiku-4-5-20251001',
  'v1 placeholder — tarea mecánica, Haiku alcanza'
),
(
  'rubrica',
  'create_evaluation',
  'Generá una rúbrica de evaluación con 3 a 4 criterios relevantes al contenido del recurso. Para cada criterio definí 3 niveles (En inicio / En proceso / Logrado) con descriptores específicos y observables. Formato: tabla Markdown lista para copiar e imprimir.',
  'texto_libre',
  'claude-sonnet-4-6',
  'v1 placeholder — pendiente validación pedagógica por Cyntia'
),
(
  'guia',
  'create_implementation_guide',
  E'Generá una guía docente práctica para trabajar con este recurso en el aula. Incluí:\n- Objetivos de aprendizaje (2 a 3)\n- Preparación previa (qué necesita la docente antes de la clase)\n- Desarrollo de la clase paso a paso con tiempos sugeridos\n- Cierre y evaluación informal\n- Variantes posibles\n\nTono cercano y concreto. Formato Markdown claro.',
  'texto_libre',
  'claude-sonnet-4-6',
  'v1 placeholder — pendiente validación pedagógica por Cyntia'
),
(
  'complementarias',
  'create_similar_activity',
  'Sugerí 3 a 4 actividades complementarias para hacer después de trabajar con este recurso. Para cada actividad incluí: nombre, descripción breve (2 a 3 líneas), materiales necesarios y tiempo estimado. Las actividades deben profundizar o extender el aprendizaje del recurso original. Formato Markdown.',
  'texto_libre',
  'claude-haiku-4-5-20251001',
  'v1 placeholder — tarea creativa de bajo riesgo, Haiku alcanza'
)
on conflict (slug) do update set
  function           = excluded.function,
  layer_task         = excluded.layer_task,
  output_schema_slug = excluded.output_schema_slug,
  model              = excluded.model,
  notes              = excluded.notes,
  is_active          = true;
