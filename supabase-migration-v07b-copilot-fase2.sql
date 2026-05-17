-- LUMEN v0.7b — Copiloto v2 Fase 2a: 4 funciones estructuradas
-- Ejecutar DESPUÉS de v07. Agrega los 4 prompts nuevos con outputs JSON.
-- Idempotente: se puede correr varias veces.

-- =============================================
-- Seed: 4 prompts estructurados (slugs cortos sin colisión con Fase 1)
-- =============================================
insert into prompt_templates (slug, function, layer_task, output_schema_slug, model, notes) values
(
  'adapt',
  'adapt_resource',
  E'Recibís un recurso pedagógico y debés adaptarlo según los ejes que solicita la docente.\n\nEjes posibles que vienen en input_params:\n- grado_destino (1 a 7): ajustá vocabulario, complejidad conceptual y extensión. Mantené el área y el eje temático originales.\n- dua_level (estandar | leve | profunda | enriquecimiento): aplicá las pautas DUA según el nivel pedido.\n- modalidad (presencial | domiciliario | virtual_asincronico): adaptá la consigna a esa modalidad.\n- tiempo_min (entero): condensá o expandí según los minutos disponibles.\n\nDocumentá qué cambios hiciste en cambios_realizados[]. derived_from debe apuntar al recurso original.\n\nLas consignas deben estar numeradas, ser claras y poder usarse mañana sin preparación adicional.',
  'adapted_resource_v1',
  'claude-sonnet-4-6',
  'v1 placeholder — pendiente validación pedagógica por Cyntia'
),
(
  'similar',
  'create_similar_activity',
  E'Recibís una actividad existente como inspiración y debés generar una o más actividades nuevas del mismo tipo pedagógico.\n\nNO copies el original. Tomá su estructura, su tipo de actividad y su nivel de exigencia, y generá hermanas.\n\nVariaciones que pueden venir en input_params:\n- cantidad (1, 3, 5): cuántas generar\n- mismo_contenido (bool): si true, mismo tema; si false, sugerí otro relacionado\n- ajuste_grado (mismo | mas_uno | menos_uno)\n- dificultad (mas_facil | igual | mas_desafiante)\n- formato (mismo | cambiar)\n\nCada actividad debe poder usarse en forma independiente. En diferencias_clave explicá en UNA línea qué la distingue del original.',
  'similar_activity_v1',
  'claude-haiku-4-5-20251001',
  'v1 placeholder — tarea creativa de bajo riesgo, Haiku alcanza'
),
(
  'evaluate',
  'create_evaluation',
  E'Generás instrumentos de evaluación según el tipo solicitado en input_params.tipo.\n\nTipos posibles:\n- diagnostica: qué saben los chicos antes de empezar. Foco en conocimientos previos, no en calificar.\n- proceso: formativa durante la secuencia. Baja apuesta, alta retroalimentación.\n- sumativa: cierre de unidad. Integradora, con criterios claros.\n- rubrica: matriz criterios x niveles fijos (logrado / en_proceso / inicial).\n- lista_cotejo: verificación sí/no rápida con observables.\n- autoevaluacion: para que el chico reflexione sobre su proceso. Lenguaje adaptado a su edad.\n\nRespetá el schema JSON exacto para cada tipo (discriminated union en contenido). El kind de contenido DEBE coincidir con el tipo solicitado: tipo=rubrica → contenido.kind=rubrica, tipo=lista_cotejo → contenido.kind=lista_cotejo, tipo=autoevaluacion → contenido.kind=autoevaluacion, los otros (diagnostica/proceso/sumativa) → contenido.kind=prueba.',
  'evaluation_material_v1',
  'claude-sonnet-4-6',
  'v1 placeholder — pendiente validación pedagógica por Cyntia'
),
(
  'guide',
  'create_implementation_guide',
  E'Generás una guía práctica para que la docente implemente un recurso ya existente.\n\nNO es una planificación. Es lo que una maestra experimentada le diría a una novata en el pasillo antes de la clase: cómo arrancar, qué preparar, qué les va a costar a los chicos.\n\nDevolvé exactamente las secciones del schema:\n- para_que_sirve: 2-3 líneas\n- materiales: lista concreta (papeles, fibrones, dispositivos, fotocopias…)\n- ambientacion: luces, disposición del aula, agrupamientos, tiempo_estimado_min\n- como_presentarlo: 1-2 ideas para motivar/introducir\n- posibles_dificultades: qué les cuesta a los chicos y cómo destrabarlo\n- para_cerrar: cómo redondear, qué preguntar al final\n- si_sobra_tiempo: actividad extensión (siempre completar)\n- si_falta_tiempo: qué recortar sin perder lo esencial (siempre completar)\n\nTono: cercano, concreto, sin teoría. Ejemplos antes que conceptos abstractos.',
  'implementation_guide_v1',
  'claude-sonnet-4-6',
  'v1 placeholder — pendiente validación pedagógica por Cyntia'
)
on conflict (slug) do update set
  function           = excluded.function,
  layer_task         = excluded.layer_task,
  output_schema_slug = excluded.output_schema_slug,
  model              = excluded.model,
  notes              = excluded.notes,
  is_active          = true;

-- Desactivar los 6 viejos (quedan en DB para histórico de ai_generations)
update prompt_templates set is_active = false
where slug in ('adaptar', 'evaluacion', 'simplificar', 'rubrica', 'guia', 'complementarias');
