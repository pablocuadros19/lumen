import { z } from 'zod'

// ============================================
// ENUMS
// ============================================
export const CopilotFunctionSchema = z.enum([
  'adapt_resource',
  'create_similar_activity',
  'create_evaluation',
  'create_implementation_guide',
])
export type CopilotFunction = z.infer<typeof CopilotFunctionSchema>

export const DuaLevelSchema = z.enum(['estandar', 'leve', 'profunda', 'enriquecimiento'])
export type DuaLevel = z.infer<typeof DuaLevelSchema>

// ============================================
// META COMÚN — se adjunta a todo output del copiloto
// ============================================
export const CopilotOutputMetaSchema = z.object({
  generation_id:      z.string().uuid(),
  prompt_template_id: z.string().uuid(),
  prompt_version:     z.number().int(),
  generated_at:       z.string().datetime(),
  source_resource_id: z.string().uuid().optional(),
  dua_level:          DuaLevelSchema,
  model:              z.string(),
})
export type CopilotOutputMeta = z.infer<typeof CopilotOutputMetaSchema>

// ============================================
// BLOQUES DE CONTENIDO (Fase 2)
// Unidad mínima de un output estructurado
// ============================================
export const ResourceBlockSchema = z.discriminatedUnion('kind', [
  z.object({
    kind:  z.literal('titulo'),
    nivel: z.union([z.literal(1), z.literal(2), z.literal(3)]),
    texto: z.string(),
  }),
  z.object({
    kind: z.literal('texto'),
    html: z.string(),
  }),
  z.object({
    kind:                    z.literal('consigna'),
    numero:                  z.number().int(),
    texto:                   z.string(),
    tipo:                    z.enum(['abierta', 'opcion_multiple', 'completar', 'verdadero_falso', 'asociacion']),
    opciones:                z.array(z.string()).optional(),
    espacio_respuesta_lineas: z.number().int().optional(),
  }),
  z.object({
    kind:        z.literal('imagen_sugerida'),
    descripcion: z.string(),
    alt:         z.string(),
    placement:   z.enum(['inline', 'destacada']),
  }),
  z.object({
    kind:      z.literal('recuadro_destacado'),
    titulo:    z.string().optional(),
    contenido: z.string(),
    tono:      z.enum(['info', 'atencion', 'pista']),
  }),
  z.object({
    kind:      z.literal('tabla'),
    columnas:  z.array(z.string()),
    filas:     z.array(z.array(z.string())),
  }),
  z.object({
    kind:     z.literal('lista'),
    ordenada: z.boolean(),
    items:    z.array(z.string()),
  }),
  z.object({
    kind: z.literal('separador'),
  }),

  // ============================================
  // BLOQUES VISUALES PEDAGÓGICOS (Fase 2c)
  // El chico realmente escribe/marca/dibuja sobre estos
  // ============================================
  z.object({
    // Palabra + N casilleros vacíos (uno por letra). Para ortografía,
    // escritura inicial, vocabulario por letra.
    kind:     z.literal('cuadricula_escritura'),
    items:    z.array(z.object({
      palabra:    z.string().describe('La palabra a escribir, en mayúsculas'),
      casilleros: z.number().int().min(1).max(20).describe('Cantidad de letras = casilleros visibles'),
      pista:      z.string().optional().describe('Pista opcional al costado'),
    })),
    mostrar_etiqueta: z.boolean().default(true).describe('Si mostrar la palabra como referencia al lado'),
  }),
  z.object({
    // N líneas en blanco para escribir a mano la respuesta.
    kind:     z.literal('lineas_respuesta'),
    cantidad: z.number().int().min(1).max(20),
    etiqueta: z.string().optional().describe('Etiqueta corta tipo "Tu respuesta:" o "Escribí acá:"'),
  }),
  z.object({
    // Caja vacía grande para que el chico dibuje.
    kind:        z.literal('recuadro_dibujar'),
    etiqueta:    z.string().describe('Qué se espera que dibuje, ej: "Dibujá la escena"'),
    alto_cm:     z.number().int().min(3).max(20).default(8),
  }),
  z.object({
    // Tabla con encabezados pero celdas vacías para completar.
    kind:           z.literal('tabla_llenar'),
    columnas:       z.array(z.string()),
    filas_cantidad: z.number().int().min(1).max(30),
    columna_indice: z.array(z.string()).optional().describe('Si la primera columna tiene labels (ej. nombres, números), van acá'),
  }),
  z.object({
    // Opciones para marcar con círculo o cruz (físicamente).
    kind:      z.literal('opcion_marcar'),
    enunciado: z.string(),
    opciones:  z.array(z.string()),
    marcador:  z.enum(['circulo', 'casilla']).default('casilla'),
  }),
])
export type ResourceBlock = z.infer<typeof ResourceBlockSchema>

// ============================================
// 1. ADAPTAR RECURSO
// ============================================
export const AdaptedResourceSchema = z.object({
  meta:             CopilotOutputMetaSchema,
  titulo:           z.string(),
  grado_destino:    z.number().int().min(1).max(7),
  area:             z.string(),
  eje_tematico:     z.string().optional(),
  cambios_realizados: z.array(z.object({
    tipo:        z.enum(['simplificacion', 'profundizacion', 'visual', 'tiempo', 'modalidad']),
    descripcion: z.string(),
  })),
  contenido:        z.array(ResourceBlockSchema),
  notas_pedagogicas: z.string().optional(),
  derived_from:     z.string(),
})
export type AdaptedResource = z.infer<typeof AdaptedResourceSchema>

// ============================================
// 2. CREAR ACTIVIDAD SIMILAR
// ============================================
export const SimilarActivitySchema = z.object({
  meta:             CopilotOutputMetaSchema,
  titulo:           z.string(),
  tipo_actividad:   z.string(),
  area:             z.string(),
  grado:            z.number().int().min(1).max(7),
  contenido:        z.array(ResourceBlockSchema),
  inspired_by:      z.string(),
  diferencias_clave: z.string(),
})
export type SimilarActivity = z.infer<typeof SimilarActivitySchema>

// ============================================
// 3. MATERIAL DE EVALUACIÓN
// ============================================
export const EvaluationTypeSchema = z.enum([
  'diagnostica', 'proceso', 'sumativa',
  'rubrica', 'lista_cotejo', 'autoevaluacion',
])
export type EvaluationType = z.infer<typeof EvaluationTypeSchema>

export const RubricContentSchema = z.object({
  kind:        z.literal('rubrica'),
  descripcion: z.string(),
  dimensiones: z.array(z.object({
    nombre:      z.string(),
    descripcion: z.string(),
    niveles:     z.array(z.object({
      nivel:      z.enum(['logrado', 'en_proceso', 'inicial']),
      descriptor: z.string(),
    })),
  })),
})
export type RubricContent = z.infer<typeof RubricContentSchema>

export const TestContentSchema = z.object({
  kind:                z.literal('prueba'),
  introduccion:        z.string().optional(),
  consignas:           z.array(ResourceBlockSchema),
  criterios_correccion: z.array(z.string()).optional(),
})
export type TestContent = z.infer<typeof TestContentSchema>

export const ChecklistContentSchema = z.object({
  kind:                      z.literal('lista_cotejo'),
  introduccion:              z.string().optional(),
  items:                     z.array(z.object({
    indicador:  z.string(),
    observable: z.string(),
  })),
  con_espacio_observaciones: z.boolean(),
})
export type ChecklistContent = z.infer<typeof ChecklistContentSchema>

export const SelfEvalContentSchema = z.object({
  kind:      z.literal('autoevaluacion'),
  escala:    z.enum(['caritas', 'estrellas', 'numeros']),
  preguntas: z.array(z.object({
    pregunta: z.string(),
    opciones: z.array(z.string()).optional(),
  })),
})
export type SelfEvalContent = z.infer<typeof SelfEvalContentSchema>

export const EvaluationContentSchema = z.discriminatedUnion('kind', [
  RubricContentSchema,
  TestContentSchema,
  ChecklistContentSchema,
  SelfEvalContentSchema,
])

export const EvaluationMaterialSchema = z.object({
  meta:               CopilotOutputMetaSchema,
  tipo:               EvaluationTypeSchema,
  titulo:             z.string(),
  area:               z.string(),
  grado:              z.number().int().min(1).max(7),
  tiempo_estimado_min: z.number().int().optional(),
  contenido:          EvaluationContentSchema,
})
export type EvaluationMaterial = z.infer<typeof EvaluationMaterialSchema>

// ============================================
// 4. GUÍA PARA IMPLEMENTAR
// ============================================
export const ImplementationGuideSchema = z.object({
  meta:            CopilotOutputMetaSchema,
  para_que_sirve:  z.string(),
  materiales:      z.array(z.string()),
  ambientacion:    z.object({
    luces:              z.string().optional(),
    disposicion_aula:   z.string().optional(),
    agrupamientos:      z.string().optional(),
    tiempo_estimado_min: z.number().int(),
  }),
  como_presentarlo:       z.array(z.string()),
  posibles_dificultades:  z.array(z.object({
    que:              z.string(),
    como_destrabarlo: z.string(),
  })),
  para_cerrar:     z.string(),
  si_sobra_tiempo: z.string().optional(),
  si_falta_tiempo: z.string().optional(),
})
export type ImplementationGuide = z.infer<typeof ImplementationGuideSchema>

// ============================================
// TIPOS INTERNOS — no son schemas de output
// ============================================
export interface PromptTemplate {
  id:                 string
  slug:               string
  function:           CopilotFunction
  version:            number
  layer_pedagogy:     string
  layer_task:         string
  output_schema_slug: string
  model:              string
}

export interface AiGenerationInsert {
  user_id:             string
  prompt_template_id:  string
  function:            CopilotFunction
  slug:                string
  source_resource_id?: string
  dua_level:           DuaLevel
  input_params:        Record<string, unknown>
  output_json:         Record<string, unknown>
  model:               string
  tokens_input?:       number
  tokens_output?:      number
  duration_ms?:        number
}
